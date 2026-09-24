# TASK-033 — Browser Extension Update Flow (Hashnode + Medium)

## Objective

When an edited article is re-published to a **client-managed** destination (`extension` /
`hn_new` / `manual` for Hashnode, `extension` / `medium_new` / `manual` for Medium), update the
already-published post in place instead of creating a duplicate story.

## Why this is needed

- **Medium**: the API has no update endpoint (see TASK-032) — the extension is the *only* way to
  update an existing Medium story programmatically.
- **Hashnode**: browser modes never reach the worker (`isClientManagedDestination` → publication stays
  `PENDING`), so TASK-032's API update routing does not apply. The default mode for new connections
  is `extension`, i.e. most Hashnode users are in this bucket.

TASK-031 explicitly scoped this out of extension v1 ("create-only"). This task adds update support
on top of the existing v0.2.0 create flow.

## Current state (verified in code)

```text
Publish (create-only today)
  article-editor.tsx handlePublish()
    ├─ POST /api/articles/:id/publish      → publication rows PENDING (client-managed skipped by worker)
    ├─ publishViaExtension(platform, {title, markdown, canonicalUrl})
    │     └─ window.postMessage → artxflow-bridge.js → service-worker.js
    │           └─ opens hn.new / medium.com/new-story → {hashnode,medium}-automator.js
    │                 └─ PUBLISH_RESPONSE { publishedUrl }
    └─ POST .../record-external { externalUrl }  → PUBLISHED
         (externalResourceId falls back to externalUrl — no post id is stored in browser mode)
```

Relevant facts:

- `apps/extension/` is plain JS, `@artxflow/extension@0.2.0`, not part of vitest/lint pipelines.
- The bridge already routes `PUBLISH_HASHNODE` / `PUBLISH_MEDIUM` generically; response envelope is
  `PUBLISH_RESPONSE` keyed by `requestId`.
- `record-external` is already generic and accepts an optional `externalResourceId`.
- Automators expose globals: `__runHashnodeAutomator(article)`, `__runMediumEditor(article)`,
  `__runMediumFinalPublish()`, `__runMediumAutomator(article)`.
- Manifest already has `https://*/*` host permissions, so no new permissions are required.

## Open questions for the spike (do first, record findings here)

| # | Question | Candidates / fallback |
| --- | --- | --- |
| S1 | Hashnode: how to reach the editor for an **existing published post** given only its live URL? | (a) open live URL while logged in → click author-only **Edit** button; (b) resolve post id (public GraphQL `post` read — reads are not Pro-gated) → try `https://hashnode.com/edit/<id>` |
| S2 | Hashnode: header button label + confirm flow when editing a published post (`Publish` vs `Update`)? Does the Draft-settings panel appear again? | Reuse `triggerPublish` wide-net matching; extend to `update` / `save` |
| S3 | Medium: does `<live>/edit` open the editor for `/p/<uuid>`, `/@user/slug`, and `*.pub` / publication-hosted stories? | Fallback: open live URL → author toolbar → **Edit** |
| S4 | Medium: save flow for an already-published story — header button label (`Update`/`Publish`), toast text, navigate vs stay? Is the settings stage shown? | Reuse `clickFinalPublishButton` if a settings stage appears; else detect `Story updated` toast / stable URL |
| S5 | Content clearing: reliable editor-scoped select-all + delete for ProseMirror (Hashnode) and Medium's graf paragraphs without selecting the whole page? | Range spanning editor children → `deleteContents` (not page-level Cmd+A) |

Manual test accounts: one free Hashnode publication, one Medium account (author profile stories).

## Design

### 1. Create-vs-update decision (client-managed mirror of the worker rule)

New pure helper in `apps/web/src/lib/publication-status.ts`:

```ts
resolveExtensionTargets(
  publications: PublicationDto[],
  destinationIds: string[],
): Array<{
  destinationId: string;
  mode: 'create' | 'update';
  target?: { publicationId: string; externalUrl: string; externalResourceId: string };
}>
```

Rule (identical semantics to `findLatestPublishedForArticleAndDestination` from TASK-032):
latest publication per destination **that is `PUBLISHED` and has an `externalUrl`** → `update`
(with that URL/id as target); otherwise → `create`.

No API changes required — the editor already fetches `/api/articles/:id/publications` on load.

### 2. Extension protocol

- New message types `UPDATE_HASHNODE` and `UPDATE_MEDIUM` with payload
  `{ title, markdown, canonicalUrl?, targetUrl, targetResourceId? }`.
- Bridge (`artxflow-bridge.js`): accept `PUBLISH_* || UPDATE_*` through the same generic branch;
  keep the `PUBLISH_RESPONSE` envelope (single listener in the editor), add `action: 'publish' | 'update'`
  to the result.
- Service worker: refactor the duplicated create plumbing into one helper
  `runPlatformAutomation({ platform, mode, startUrl, entryScript })` covering tab open → wait-ready →
  unfreeze rAF/visibility (Hashnode) → inject automator → poll result → close-on-success /
  keep-open-on-failure.
  - `PUBLISH_*` keeps `startUrl` = `hn.new` / `medium.com/new-story`.
  - `UPDATE_*` uses the resolved edit entry (S1/S3) and passes `mode: 'update'` to the automator.
- Manifest bump to `0.3.0` (manifest, bridge `version` fields, package.json).


### 3. Automator changes

**Hashnode (`hashnode-automator.js`, `__runHashnodeAutomator(article, options)`)**

1. `options.mode === 'update'` → if `targetUrl` is a live post URL, enter edit mode (S1 result);
   otherwise assume the tab is already on an editor URL.
2. `clearEditorContent(editorEl)` — editor-scoped select-all over ProseMirror top-level children →
   delete; then assert body length is near-empty, else fail with `CONTENT_NOT_CLEARED` (tab kept open).
3. Reuse existing `setTitleValue` (replaces text) + `insertMarkdownIntoEditor`.
4. Reuse `triggerPublish(canonicalUrl)` with extended button matching (`update`, `save`).
5. Success detection: URL change to a valid published post URL **or** visible success toast; on
   ambiguity return `UPDATE_CONFIRMATION_TIMEOUT` with tab open (existing failure contract).
6. Response: `{ success, action: 'update', updatedUrl: <live url> }`.

**Medium (`medium-automator.js`, `__runMediumEditor(article, options)` + new `__runMediumUpdate`)**

1. Start on the edit URL (S3); reuse signin guards and `findTitleElement` / `findBodyElement`.
2. `clearMediumBody(bodyEl)` — range spanning first→last graf child nodes → delete; assert empty.
3. Reuse `insertMarkdownContent` + title replacement.
4. Save via header button (S4). If a settings/confirm stage appears, reuse `__runMediumFinalPublish`.
5. Success detection: update toast, stable edit URL, or navigation to the live story URL; always
   resolve and return the **original live URL** as `updatedUrl`.
6. Response: `{ success, action: 'update', updatedUrl }`.

**Manual fallback (both platforms, on any automation failure):**
open the edit URL in a **foreground** tab, copy the new markdown to the clipboard, and leave the
publication `PENDING`; the editor shows "You edit, then Mark updated" (calls `record-external` with
the same `externalUrl`). Mirrors the existing `hn_new` / `medium_new` patterns.

### 4. Web editor flow (`article-editor.tsx`)

1. Compute `resolveExtensionTargets(...)` **before** `POST /publish` from the loaded publications.
2. `POST /publish` unchanged (new `PENDING` rows for client-managed destinations).
3. Per client-managed destination:
   - `create` → existing `publishViaExtension` path.
   - `update` → `publishViaExtension(platform, payload, { targetUrl, targetResourceId })`;
     on success call `record-external` on the **new** publication row with
     `{ externalUrl: updatedUrl, externalResourceId: targetResourceId || updatedUrl }`.
4. UI additions:
   - Publication row badge: `Up to date` vs `Out of date` (an older `PUBLISHED` row exists while the
     latest row for that destination is `PENDING`/`QUEUED`/`FAILED`).
   - Per-destination action **"Update via extension"** and a bulk **"Update published copies"**
     button that runs the update flow for all stale client-managed destinations.
   - On failure: fallback card (open edit link, copy markdown, Mark updated).
5. Disclaimers (Settings + update flow): extension updates require an active browser session and a
   user click — scheduled updates still require `api` mode (unchanged rule from TASK-031).

### 5. Data model notes (no migration)

- Two `PUBLISHED` rows for the same destination across versions are **expected**: the new row records
  the update, the old row remains as history. Update-target resolution always takes the most recent
  row (`createdAt`/`publishedAt`), matching the worker finder.
- `externalResourceId` is upgraded from "same as URL" to the real platform post id when the extension
  can resolve one (Hashnode post id, Medium `/p/<uuid>`) — improves future API-mode/analytics work.
- A `SUPERSEDED` publication status is explicitly out of scope (enum change; add later if needed).

## Implementation slices (order)

1. **Spike** — run S1–S5 manually, append findings to this doc.
2. **Web helper** — `resolveExtensionTargets` + unit tests (no browser needed).
3. **Protocol** — bridge + service worker refactor + `UPDATE_*` handlers + version bump 0.3.0.
4. **Hashnode update automator** (clear → fill → update click → confirm).
5. **Medium update automator**.
6. **Editor integration** — update decision, record-external on update, badges/buttons, fallbacks.
7. **Docs + QA** — README update, TASK-032 remaining-work update, manual QA checklist.

## Tests

- Unit: `resolveExtensionTargets` (no publications → create; PUBLISHED w/ URL → update; only FAILED →
  create; multiple rows → most recent wins; `PENDING` latest + older `PUBLISHED` → stale badge).
- `record-external` passes `externalResourceId` through (extend existing test).
- Existing suites stay green (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`).
- Extension automators are not covered in CI (consistent with TASK-031). Manual QA checklist:
  - Hashnode: create via extension → edit article → update via extension → post content replaced,
    same URL, ArtXFlow row PUBLISHED.
  - Medium: same flow on a `/p/<uuid>` story and on an `@user/slug` story.
  - Failure paths: logged out → clear error; tab kept open on selector failure; fallback card works.

## Risks & mitigations


## Spike runbook (S1–S5)

### Research already settled (from public docs, 2026)

- Hashnode GraphQL `post(id: ID!)` is a **Public** query (no token, **no Pro plan needed**) returning
  `id, slug, url, content{markdown}, author, tags, publishedAt`. So *once we know a post id* we can
  enrich `externalResourceId` and even diff content — for free.
- There is **no** `post(slug, domain)` root query — URL → id cannot be resolved via GraphQL alone.
  Therefore **S1 (author Edit button) is the primary path**; GraphQL-by-id is a follow-up enrichment.
- Medium has no public API for this at all — everything rides on the `/edit` URL + editor DOM.

### Prep (once)

1. Chrome → `chrome://extensions` → Developer mode → **Load unpacked** → `apps/extension` (re-load
   after any extension file change).
2. Logged in on `hashnode.com` and `medium.com` in the same Chrome profile.
3. Have one published Hashnode post and one published Medium story that **you authored** (the
   extension-created ones from ArtXFlow are ideal).
4. Open two console windows for observation:
   - ArtXFlow tab DevTools console (bridge/web logs).
   - `chrome://extensions` → ArtXFlow Companion → **service worker** link (its console shows
     `[ArtXFlow ServiceWorker]` logs).
5. Keep a scratch file to record answers using the template below.

### S1 — Hashnode: reaching the editor of an existing published post

1. Open your published Hashnode post's **live URL** while logged in.
2. Record: is there an author-only **Edit** button/link? Exact visible text, where it sits
   (header / floating bar / below post), and its `href` (right-click → copy link).
   - Console probe: `Array.from(document.querySelectorAll('a,button')).filter(e=>/edit/i.test(e.textContent)).map(e=>({t:e.textContent.trim(),h:e.href}))`
3. Click it → record the resulting **editor URL** (this reveals the canonical edit-URL format and

### S2 — Hashnode: update/save flow in the editor

1. On the edit page from S1, record the **header button label**: `Publish` / `Update` / `Save`?
2. Trivial change (edit one sentence). Click the header button. Record:
   - Does a settings/confirm panel appear again? Its title text (`Draft settings` vs something else).
   - Confirm button label inside the panel.
   - After confirming: toast/notification text, and the URL (stays in editor? navigates to live post?).
3. On an existing post's settings panel: is the canonical-URL field reachable (the
   "Discovery" tab / "This post was originally published at" input)? Record its location.
4. Title behavior: focus the title, select-all *inside it* — does it behave as a normal input
   (safe to overwrite with `textContent`)?

### S3 — Medium: edit URL formats

1. Take both URL forms of a story you authored (from Medium → `Stats`/`Stories` or your profile):
   `https://medium.com/p/<uuid>` and `https://medium.com/@<you>/<slug>`.
2. Append `/edit` to each and visit:
   - `https://medium.com/p/<uuid>/edit` → opens editor? yes/no
   - `https://medium.com/@<you>/<slug>/edit` → opens editor? yes/no
3. If you have a story in a **publication** or on a `*.pub`/custom domain: test `<live>/edit` there
   too. If it fails, open the live story logged-in and record where the author **Edit** link sits
   (it's usually in the byline/footer area for your own stories) + its href.
4. Record the `<uuid>` (if present) — that's what we'll store as Medium `externalResourceId`.

### S4 — Medium: save flow for an already-published story

1. In the edit view of the published story, record the **header button label**
   (`Publish` / `Update` / `Publish →`?) — and what it says *before* vs *after* a change.
2. Make a trivial change and click it. Record:
   - Does a settings/preview stage appear (the create flow's "Draft settings" page), or is it direct?
   - Toast text (e.g. `Story updated`), final URL (stays on `/edit`? navigates to live?).
   - Does the canonical-link option appear in that stage (create flow found it optional)?

### S5 — Content clearing technique (both editors)

For each editor, with existing content loaded, determine the technique that clears **only the
editor** (never the whole page):

1. Click into the body → try `Cmd+A` → record whether the selection leaks outside the editor.
2. Try range-based clear: place caret in first block, then `Shift+click` (or `Shift+End` /
   `Shift+Ctrl+End`) at the end of the last block → `Delete`. Record if body becomes visually empty.
3. Record the DOM structure after clear (empty `<p>` leftovers?) — the automator will assert
   `bodyEl.innerText.trim().length < 20` before inserting.
   - Medium probe: `Array.from(document.querySelectorAll('[contenteditable="true"]')).map(e=>({cls:e.className, len:(e.innerText||'').length}))`
   - Hashnode probe: `document.querySelector('.ProseMirror')?.children.length`

### Results template (paste filled-in copy at the bottom of this doc)

```markdown
### Spike findings — <date>
| # | Question | Answer |
| --- | --- | --- |
| S1a | Hashnode author Edit button on live post? text/location/href | |
| S1b | Hashnode editor URL format for existing post | |
| S1c | Cold-visiting https://hashnode.com/edit/<id> works? | |
| S1d | Published post visible in drafts/posts manager? | |
| S1e | Public GraphQL post(id) without Pro works? | |
| S2a | Hashnode header button label on existing post | |
| S2b | Confirm panel title + confirm button label + post-click URL/toast | |
| S2c | Canonical field reachable on existing post? | |
| S3a | medium.com/p/<uuid>/edit works? | |
| S3b | medium.com/@user/slug/edit works? | |
| S3c | Publication/*.pub story edit URL (or author Edit link location) | |
| S4a | Medium header button label(s) on published-story edit | |
| S4b | Settings stage appears? toast text? final URL? | |
| S5a | Hashnode clearing technique that works | |
| S5b | Medium clearing technique that works | |

### Spike findings — run 1 (Hashnode) + API probes (remote)

| # | Question | Answer |
| --- | --- | --- |
| S1a | Hashnode author Edit button on live post? | **NO** — probe returned `[]`; no edit affordance on the public post page |
| S1b | Hashnode editor URL format for existing post | **`https://hashnode.com/edit/<id>`** — confirmed, id sample is **25 chars**, cuid-style (`cmu60wpq0000004jpfba3h2vl`), i.e. *not* the 24-hex ObjectId used by the public API |
| S1c | Cold-visiting `https://hashnode.com/edit/<id>` works? | **YES** (editor opened with content loaded) |
| S1d | Published post visible in drafts/posts manager? | Not confirmed — retest: check `hashnode.com/drafts` **and** the blog dashboard's published-posts list |
| S1e | Public GraphQL `post(id)` without Pro works? | **YES for ObjectId ids** (verified here via curl: returns id/slug/url/author). **Your edit id (cuid-style, 25 chars) returned `INTERNAL_SERVER_ERROR`** → the edit-route id space differs from `post(id)`'s id space. Open question: which id does `/edit/<24-hex-post-id>` accept? |
| S2a | Hashnode header button label on existing post | **`UPDATE`** (top-right header) |
| S2b | Confirm panel + toast + final URL | Confirm panel re-opens with an **`UPDATE`** button at the bottom; toast = **"Article updated"**; final URL not yet recorded (capture in QA) |
| S2c | Canonical/Discovery field on existing post | Not confirmed — best-effort/non-fatal either way |

**Remote probes I ran from here (no login needed):**

1. `post(id: "6ab2c0515689e32b1f12fbc2")` → `200 {data:{post:{id,slug,url,author}` — public `post(id)` works without token/Pro for ObjectId-format ids.
2. `user(username: "...").posts(first: N) { edges { node { id slug url } } }` → `200` with full post list — **URL→ID resolvable purely via public GraphQL** when the author username is known (parseable from `*.hashnode.dev` hosts).
3. Fetched a public Hashnode post's live HTML → the **24-hex post id appears3× in the page HTML** — **URL→ID also resolvable by scraping the public page** (works for custom domains too, no login).
4. Your edit id is **25 characters** (`cmu60…`) vs public post ids **24 hex** (`6ab2…`) → two id spaces.

**Implication for the design (revised Hashnode strategy):**

- Primary: **capture the edit id at publish time** — the create automator's own tab URL during
  creation *is* `hashnode.com/edit/<id>` (verify: log `location.href` inside the create run). Store it
  as `externalResourceId` at record time → update needs zero scraping.
- Fallback (posts created outside the extension): extract the 24-hex id from the live page HTML (or
  `user.posts` GraphQL) → construct `/edit/<id>` — **pending the one cold-visit test below**.
- Decisive remaining test: grab the 24-hex id from *your* post's HTML and cold-visit
  `https://hashnode.com/edit/<that-id>` → editor opens your post?
  Probe: `curl -s '<your-live-post-url>' | grep -oE '[a-f0-9]{24}' | sort -u`

```

After the run: paste the filled template here, and slices 3–5 (protocol + automators) get built
against confirmed facts instead of guesses.


### Spike findings — run 2 (Medium S3–S5)

| # | Question | Answer |
| --- | --- | --- |
| S3a | `medium.com/p/<uuid>/edit` opens editor? | **YES** (sample id format: `e7e1290a1040` — 12 hex chars; this is Medium's `externalResourceId`) |
| S3b | `medium.com/@user/slug/edit` opens editor? | **YES** |
| S3c | Publication / `*.pub` story edit path | Direct `/edit` fallback documented: **three-dot (More) menu → "Edit story"** overlay item (an `<a>`; record its href during implementation QA to allow direct navigation) |
| S4a | Header button label on published-story edit | **`Save and publish`** — starts **disabled**, enables after a change |
| S4b | Settings stage / toast / final URL | **No settings stage** — clicking `Save and publish` updates and **navigates to the live URL** with `?postPublishedType=repub` (e.g. `https://<blog>/<slug>-<id>?postPublishedType=repub`) |
| S5a | Medium `Cmd+A` scope | **Selects only the editor** ✓ → update flow can use `Cmd+A → Delete` on the body contenteditable (class `postArticle-content js-postField`) |
| S5b | Hashnode clearing | Range technique not tested; `.ProseMirror` has **132 top-level children** on an existing post → clearing + post-clear assertion required. Hashnode `Cmd+A` scope still open → implement **editor-scoped range clear** (works regardless) |

**Design adjustments from run 2:**

1. Medium update success detection = **reuse the existing `waitForMediumLiveStoryUrl` /
   `isPublishedStoryUrl` helpers** (they already handle `/edit` exclusion) — no settings stage in the
   update path.
2. **Normalize the returned Medium URL**: strip `postPublishedType` (and similar) query params before
   `record-external` so `externalUrl` stays canonical.
3. Medium edit entry: `<live>/edit` primary (profile stories) → ⋯ menu → "Edit story" fallback for
   publication stories.
4. Button matching: Medium header matcher gains `save and publish`; Hashnode gains `update` /
   `save`; success toast = `Article updated` (Hashnode); disabled-wait loops already exist in both
   automators.

### Still open (fallbacks covered regardless — non-blocking for implementation)

1. Hashnode: cold-visit `https://hashnode.com/edit/<24-hex-id-from-live-HTML>` → accepts post id?
   *(if no → rely on create-time capture of `location.href`, which the create automator can log)*
2. Hashnode: where the `cmu…` edit URL came from (drafts manager vs create-flow editor URL).
3. Hashnode: `Cmd+A` scope inside `.ProseMirror` (we implement range-clear anyway).
4. Hashnode: final URL after clicking UPDATE (QA-time; toast `Article updated` already suffices).
5. Medium: href of the ⋯ → "Edit story" link (QA-time).

   the post id, e.g. `.../edit/<id>`).
4. Verify construction: visit `https://hashnode.com/edit/<id-from-step-3>` cold — does it open the
   same editor? Record yes/no.
5. Also check `https://hashnode.com/drafts` (or the posts manager): does your **published** post
   appear there with an Edit affordance? Record the section name.
6. Bonus: with the id from step 3, hit the public API — record whether it works without Pro:
   `curl -s https://gql-beta.hashnode.com/ -H 'Content-Type: application/json' -d '{"query":"query($id:ID!){post(id:$id){id slug url author{username}}}","variables":{"id":"<ID>"}}'`

| Risk | Mitigation |
| --- | --- |
| Third-party DOM drift | Wide-net selectors (text/aria/testid), structured error codes, keep tab open on failure, manual fallback always reachable |
| `*.pub` / custom-domain Medium stories | Edit-URL fallback via live-page author **Edit** button |
| Incomplete content clearing | Post-clear assertion (body near-empty) before inserting; fail closed |
| Double-submit / user edits concurrently | Update only on explicit user click; no silent retries of extension actions |
| Canonical URL on update | Best-effort, non-fatal (same as create flow) |

## Out of scope

- API-mode updates (done in TASK-032), scheduling via extension, Medium publication submission /
  paywall options, tightening the manifest's `https://*/*` host permission (separate security task),
  `SUPERSEDED` status migration.
