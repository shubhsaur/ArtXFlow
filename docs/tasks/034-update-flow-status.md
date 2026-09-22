# Update Flow — Implementation Status Report

Single source of truth for the "update an already-published article" work: what was verified,
what was built, what remains, and how to re-verify each piece.

Related plans: `TASK-032` (API-mode updates), `TASK-033` (browser-extension updates).

## 1. Timeline

| Commit | Work |
| --- | --- |
| `75d9e37` — production-readiness hardening | Security headers, `API_KEY_SECRET` enforcement, cookie hardening, `/api/health`, auth on Unsplash + assets routes, centralized `handleApiError`, Zod body validation, pino logging, Sentry, Upstash rate limiting + middleware, error boundaries, v1 email-leak fix |
| `3514484` — CI fix | Turbo 2.x strict env mode was stripping env vars; added `globalEnv`/`globalPassThroughEnv` to `turbo.json`; added test `API_KEY_SECRET` to CI; rewrote the secret-scan step |
| `6840da4` — **TASK-032 (API-mode updates)** | Repository finder + worker update routing + Hashnode Pro-gate error + capability matrix doc |
| `db53168` — **TASK-033 slice 2** | `resolveExtensionTargets` helper + 12 tests + spike findings recorded |

## 2. Verification phase (primary sources checked)

- **DEV.to (Forem API v1 reference)**: `PUT /api/articles/{id}` "Update an article by id" exists;
  `api-key` header auth; id is the numeric article id returned at create; only own articles; payload
  accepts `title`, `body_markdown`, `published`, `canonical_url`, `description`, `tags` (replaced
  wholesale), `main_image`.
- **Hashnode (official gql-skill reference)**: `updatePost(input: UpdatePostInput!)` exists, keyed by
  `id: ID!`, all content fields optional (`title`, `contentMarkdown`, `subtitle`, `tags` ≤ 15,
  `coverImageOptions`, `originalArticleURL`, `slug`). **Every write mutation is Pro-gated** — non-Pro
  target publication → `FORBIDDEN: "Publication does not have an active Pro plan."`
- **Medium (official API docs repo, archived Mar 2023)**: "The Medium API is no longer supported."
  The API only ever had Users / Publications / Posts (**create + list only**) / Images — **no update
  or delete endpoint, ever**. New Integration Tokens stopped being issued (Jan 2025).

Key code-level finding that started this: every adapter already implemented `update()` (DEV.to,
Hashnode, internal blog) **but nothing ever called it** — the only remote mutation invoked anywhere
was `adapter.publish()`. Live consequences:
1. Editing an article (new version) + republishing **created a duplicate post** on DEV.to/Hashnode
   (publications keyed by `(articleVersionId, destinationId)`, so v2 made a fresh row and the worker
   published it again).
2. Re-publishing the **same** version silently did nothing (service returns success without action
   when the publication is already `PUBLISHED`).

## 3. TASK-032 — API-mode updates (DONE, live)

**`packages/database/src/repositories/publication.repository.ts`**
- New `findLatestPublishedForArticleAndDestination(org, articleId, destinationId, excludeId?)`:
  most recent `PUBLISHED` row with non-null `externalResourceId`, ordered
  `publishedAt desc, createdAt desc`.

**`apps/worker/src/inngest/functions/publication.ts`** (`execute-platform-publish` step)
- After transform + validate, looks up the prior published copy (excluding the current row).
- `adapter.getCapabilities().update === true && prior.externalResourceId` → `adapter.update()`
  reusing the remote id. Audit metadata: `mode: 'UPDATE'`, `updatedExternalResourceId`.
- Otherwise → `adapter.publish()` as before; when a prior copy existed but the platform cannot
  update, the `SUCCEEDED` event records `mode: 'CREATE'`, `duplicateOf`, and the reason
  ("Platform does not support updating published posts via API").
- Applies to **DEV.to (always), Hashnode `api`/Pro mode, ArtXFlow Blog**. Client-managed
  destinations never reach this code (skip in step 1); Medium API lands on `CREATE` +
  `duplicateOf` by design.

**`packages/platform-adapters/src/adapters/hashnode.adapter.ts`**
- `FORBIDDEN` with a Pro-plan message → non-retryable `AUTHORIZATION_ERROR` (403) with an actionable
  message (upgrade the publication plan or switch to the browser-based publish mode); generic
  authorization failures keep the old message.

**`docs/tasks/032-published-article-update-matrix.md`** holds the full matrix and constraints.


## 4. Extension state (verified from code) + slice 2 (DONE, not wired)

- `apps/extension@0.2.0`, plain JS, outside the vitest/lint pipelines.
- Create-only pipeline: editor `publishViaExtension` → `window.postMessage`
  (`PUBLISH_HASHNODE` / `PUBLISH_MEDIUM`) → `artxflow-bridge.js` → service worker opens
  `hn.new`/`medium.com/new-story` → `{hashnode,medium}-automator.js` (`__runHashnodeAutomator`,
  `__runMediumEditor`, `__runMediumFinalPublish`) → `PUBLISH_RESPONSE { publishedUrl }` →
  `record-external` → `PUBLISHED` (no post id stored; `externalResourceId` = URL).
- Client-managed publications stay `PENDING` (worker skips them); schedules require `api` mode.
- Defaults: Hashnode = `extension`, Medium = `extension`; legacy connections resolve to `api`.

**TASK-033 slice 2 — `apps/web/src/lib/publication-status.ts` (built, tested, unused so far)**
- `resolveExtensionTargets()` → per destination `create` / `update` (+ remote target with URL/id).
- `isDestinationStale()` → backs the future "Out of date" badge.
- `getLatestPublicationForDestination()` → most recent row regardless of status.
- 12 unit tests. **Not imported anywhere yet — wiring is pending (TASK-033 slice 6).**

## 5. Spike findings (Hashnode run 1 + Medium run 2; full detail in TASK-033)

| # | Result |
| --- | --- |
| S1a | **No Edit button** on Hashnode live post pages (probe returned `[]`) |
| S1b | Hashnode edit URL = **`https://hashnode.com/edit/<id>`**; sample id **25 chars**, cuid-style (`cmu60wpq0000004jpfba3h2vl`) — *not* the 24-hex ObjectId the public API uses |
| S1c | Cold-visiting that edit URL **opens the editor with content loaded** |
| S1d | Published post in drafts/posts manager — **not confirmed** (recheck `hashnode.com/drafts` + dashboard) |
| S1e | Public GraphQL (no token): `post(id: <ObjectId>)` → 200 ✅; `user(username).posts { id slug url }` → 200 ✅; **your cuid edit id → `INTERNAL_SERVER_ERROR`** → edit-route id space ≠ `post(id)` id space |
| Extra (remote) | Live Hashnode page **HTML embeds the 24-hex post id 3×** → URL→ID possible via scrape (login-free, works for custom domains) |
| S2a | Hashnode header button on existing post = **`UPDATE`** (top-right) |
| S2b | Confirm panel re-opens with **`UPDATE`** button (bottom); toast = **"Article updated"**; post-click URL not yet recorded |
| S2c | Canonical/Discovery field on existing post — not confirmed (best-effort either way) |
| S3a | `medium.com/p/<uuid>/edit` → **opens editor** ✅ (uuid example `e7e1290a1040`, 12 hex chars → store as Medium `externalResourceId`) |
| S3b | `medium.com/@you/slug/edit` → **opens editor** ✅ |

## 6. How to re-verify each piece

| Claim | Verification |
| --- | --- |
| DEV.to `PUT /api/articles/{id}` | Forem API v1 reference, "Update an article by id" section |
| Hashnode `updatePost` + Pro gating | `skills/gql-api/references/mutations.md` in the official `Hashnode/gql-skill` repo |
| Medium has no update endpoint / API unsupported | `Medium/medium-api-docs` README banner ("This repository was archived… The Medium API is no longer supported") |
| `adapter.update` was never called | `grep -rn 'adapter.update' packages/*/src apps/*/src` (non-test hits should only be the worker) |
| Worker routes update vs create | `apps/worker/src/inngest/publication-workflow.test.ts`: "updates the previously published DEV.to article…", "creates a new post and flags the duplicate…" |
| Hashnode Pro-gate classification | `hashnode.adapter.test.ts`: "surfaces Hashnode Pro-plan gating…" |
| Repository finder | `publishing.repository.test.ts`: "finds the latest published publication…" |
| Public GraphQL reads (no Pro) | `curl -s https://gql-beta.hashnode.com/ -H 'Content-Type: application/json' -d '{"query":"query{user(username:\"<you>\"){posts(first:3){edges{node{id slug url}}}}}"}'` |
| Extension create-vs-update decision | `apps/web/src/lib/publication-status.test.ts` (12 tests) |

## 7. Pending work (nothing from these lists is started)

**Extension update flow (TASK-033 slices 3–7)**
1. Protocol: bridge accepts `UPDATE_HASHNODE`/`UPDATE_MEDIUM`, service-worker refactor into
   `runPlatformAutomation({platform, mode, startUrl})`, manifest + package bump to `0.3.0`.
2. Hashnode update automator: resolve edit URL (create-time capture primary; HTML/GraphQL id
   fallbacks), clear editor content (range technique + assertion), fill, click `UPDATE`, detect
   `Article updated` toast / URL settle.
3. Medium update automator: enter `<live>/edit`, clear body (`Cmd+A → Delete`), fill title/body,
   wait for `Save and publish` enable, click, wait for live-URL navigation, normalize URL
   (strip `postPublishedType`), return.
4. Editor integration: call `resolveExtensionTargets()` in `handlePublish`; pass update payloads to
   `publishViaExtension`; `record-external` on the new row with resolved id; "Out of date" badges;
   "Update via extension" / "Update published copies" actions; fallback card (open edit link + copy
   markdown + "Mark updated").
5. Docs + QA: README + TASK-032 update, manual QA checklist (create→edit→update→verify per platform,
   logged-out errors, `*.pub` story edit path, confirm-panel edge cases).

**Open spike loose ends (all fallback-covered; needed only for QA polish)**
- Hashnode: `/edit/<24-hex-id>` acceptability; `cmu…` URL origin; `Cmd+A` scope in ProseMirror;
  post-UPDATE final URL.
- Medium: href of the ⋯ → "Edit story" link for publication stories.

**Product/design decisions still open (from TASK-032)**
- Publication lineage: persisted `supersededBy`/source link vs audit-metadata only.
- Medium API-mode duplicates: block, deliberately duplicate (now flagged), or force manual path.
- Pre-publish duplicate warning for non-updatable destinations.
- Wide-net selector maintenance strategy for third-party DOM drift (automators are best-effort by
  design, consistent with TASK-031).

| S3c | Publication/`*.pub` stories: three-dot (**More**) menu → **"Edit story"** overlay item (href not yet recorded) |
| S4a | Medium header button = **`Save and publish`** — **disabled** on load, enables after a change |
| S4b | **No settings stage** for updates — click publishes and **navigates to the live URL** (`...?postPublishedType=repub`); existing live-URL waiters work as success detection |
| S5a | Medium `Cmd+A` **scopes to the editor only** ✅ → clear = Cmd+A → Delete on `.postArticle-content js-postField` |
| S5b | Hashnode: `.ProseMirror` has **132 children** on an existing post → clearing + post-clear assertion required; Hashnode `Cmd+A` scope untested → use editor-scoped range clear |
