# TASK-031 — Medium Companion Extension (Free Publish Path)

## Objective

Give Medium the same free, browser-session publish path ArtXFlow already has for Hashnode: a **default publish method** chosen in Settings, silent background publishing via the Chrome companion extension, plus 1-click and live-URL fallbacks in the editor.

This is a plan document. Implement against it in a later pass.

## Why

Medium stopped issuing new Integration Tokens in January 2025. Existing tokens still work against REST API v1 (`POST /v1/users/{authorId}/posts`), but new workspaces cannot connect via API.

That is the same class of problem Hashnode created by paywalling `publishPost` behind Hashnode Pro. The Hashnode solution:

1. Settings: user picks a default method, each option has details + disclaimers.
2. Chrome companion extension: hidden tab on `hn.new`, fill, publish, return live URL.
3. Editor fallbacks: copy markdown & open the web editor; paste live URL → `POST .../record-external`.
4. Worker skip: client-managed destinations stay `PENDING` and never hit the platform API.

Mirror that for Medium. Do not invent a new publishing architecture.

## Read first

- `apps/extension/README.md`
- `apps/extension/service-worker.js`
- `apps/extension/hashnode-automator.js`
- `apps/extension/artxflow-bridge.js`
- `apps/web/src/components/hashnode-publish-mode-picker.tsx`
- `apps/web/src/components/connected-platforms.tsx`
- `apps/web/src/components/article-editor.tsx`
- `packages/types/src/hashnode-publish-mode.ts`
- `docs/tasks/026-medium-hashnode-integrations.md`

## Current Hashnode pattern (source of truth)

| Layer | Behavior |
| --- | --- |
| Preference | `hashnodePublishMode`: `extension` \| `hn_new` \| `manual` \| `api` |
| Default for new connections | `extension` |
| Legacy (no stored mode) | `api` (preserve old worker path) |
| Storage | `platform_connections.token_metadata` **and** `destinations.config` |
| Client-managed | anything except `api` |
| Worker | `isClientManagedDestination` → publication stays `PENDING`, not enqueued |
| Editor | default action on Publish; other free options remain as fallbacks |
| Record URL | `POST /api/articles/:id/publications/:pubId/record-external` |

## Medium publish methods

Same four-slot shape. Names differ only where the product differs.

| Mode | Label | Cost | Default action on Publish |
| --- | --- | --- | --- |
| `extension` | Chrome Extension | Free | Hidden tab on `https://medium.com/new-story`, fill, click Publish, return live URL |
| `medium_new` | Copy Markdown & Open medium.com/new-story | Free | Copy `# title + body` to clipboard, open Medium editor, wait for user to paste live URL |
| `manual` | Record Live URL | Free | Do not post. Show paste-URL + Record Live URL |
| `api` | Medium Integration API | Legacy token | Existing worker + `mediumAdapter.publish` |

**Recommended default for new Medium connections:** `extension`.

**Legacy connections with no `mediumPublishMode`:** keep `api` so existing token users are not silently moved onto the extension.

### Disclaimers (must appear in Settings)

**Chrome Extension**

- Requires ArtXFlow Companion loaded in Chrome/Chromium and a logged-in `medium.com` session in that browser.
- Does not run on a schedule. User must click Publish in ArtXFlow while the extension is active.

**Copy Markdown & Open medium.com/new-story**

- ArtXFlow does not click Publish on Medium.
- Status stays `PENDING` until the live URL is recorded.
- Canonical URL / tags must be set in Medium if the author cares about them.

**Record Live URL**

- ArtXFlow will not post, update, or retry on Medium.
- Recording a URL only syncs ArtXFlow status; it does not change the Medium story.

**Medium Integration API**

- New Integration Tokens are no longer issued (Jan 2025). Only an existing token works.
- This is the only mode that supports scheduled / server-side publishing.
- If the token is missing or rejected, free fallbacks remain available in the editor.

## Connecting Medium without a token

Hashnode still has a PAT for identity even when publish is client-managed. Medium often has **no token at all**.

Rules:

- Client-managed modes (`extension`, `medium_new`, `manual`): Integration Token is **optional**.
- `api` mode: token is **required** and verified via `mediumAdapter.verifyCredentials`.
- Tokenless connect stores a sentinel secret `__artxflow_client_managed__` (column is `NOT NULL`) plus `tokenMetadata.clientManaged = true`.
- Do **not** write `authorId: 'client-managed'` into destination config (that would break a later API switch).
- Placeholder account for the Settings card: `displayName: 'Medium (browser session)'`.

Switching a tokenless connection to `api` later is out of scope for v1 (disclaimer only). Follow-up: prompt for a token on mode change.

## Architecture

```text
Settings (ConnectedPlatforms)
  └─ MediumPublishModePicker
       └─ POST/PATCH /api/connections  { mediumPublishMode }
            ├─ platform_connections.token_metadata.mediumPublishMode
            └─ destinations.config.mediumPublishMode

Editor Publish
  ├─ POST /api/articles/:id/publish     (creates publication rows)
  │     └─ PublishArticleService skips worker for client-managed dests
  ├─ extension mode → window.postMessage PUBLISH_MEDIUM
  │     └─ bridge → service worker → hidden medium.com/new-story tab
  │           └─ medium-automator.js → live URL → record-external
  ├─ medium_new mode → clipboard + open medium.com/new-story
  └─ manual mode → show Record Live URL
```

Reuse `isClientManagedDestination()` so Hashnode and Medium share the worker-skip path.

## Implementation slices

### 1. Types and worker skip

- Add `packages/types/src/medium-publish-mode.ts` (modes, resolve, destination helpers).
- Add `packages/types/src/client-managed-publish.ts` wrapping Hashnode **or** Medium.
- Re-export from `@artxflow/publishing`.
- `PublishArticleService`: client-managed dests → `PENDING`, omit from Inngest payload.
- Worker `publication.ts`: skip API publish if dest is client-managed (safety net for schedules).

### 2. Connections API

- `POST /api/connections`
  - Accept `mediumPublishMode`.
  - Default new Medium connections to `extension`.
  - Allow missing secret when mode is client-managed.
  - Persist mode on connection metadata and destination config.
- `PATCH /api/connections`
  - Update `mediumPublishMode` and sync destination config (same as Hashnode).

### 3. Settings UI

Revamp the Medium card the same way as Hashnode:

- Radio cards for the four methods with details + disclaimers.
- Token field:
  - Optional for free modes, with copy that new tokens are not issued.
  - Required when `api` is selected.
- Connected state: account row + picker (save on change) + Disconnect.

### 4. Chrome companion

Extend the existing unpacked extension. Do not fork a second extension.

| File | Change |
| --- | --- |
| `manifest.json` | Host permissions for `https://medium.com/*`, `https://*.medium.com/*`. Bump version to `0.2.0`. |
| `artxflow-bridge.js` | Handle `PUBLISH_MEDIUM` (and optional `CHECK_MEDIUM_LOGIN`) the same as Hashnode. |
| `service-worker.js` | Open `https://medium.com/new-story` with `{ active: false }`, unfreeze `requestAnimationFrame` / visibility, inject automator, return live URL. Keep the tab open on failure. |
| `medium-automator.js` | **New.** Fill title + body, publish, detect live URL. |
| `popup/` | Show Medium automation alongside Hashnode. |
| `README.md` | Install + “logged into medium.com” prerequisite. |

**Editor URL:** `https://medium.com/new-story` (also referenced as `story.new` in Medium’s handbook).

**Login detection:** `/signin`, `/m/signin`, `/m/connect`, `accounts.google.com`.

**Published URL heuristic:** host is `medium.com` or `*.medium.com`; path is not `/new-story`, `/me`, `/settings`, `/m/`; looks like `/@user/slug` or `/p/{id}`.

**Content injection:** Medium’s editor is contenteditable, not Hashnode’s ProseMirror. Prefer:

1. Set title on the title field (contenteditable / placeholder `"Title"`).
2. Convert markdown → simple HTML (headings, lists, code, links, emphasis).
3. Paste into the body as `text/html` + `text/plain`.
4. Fall back to `execCommand('insertText')` / `innerText`.

**Publish click path (defensive, Hashnode-style):**

1. Header **Publish**.
2. Confirm **Publish now** in the publish panel.
3. Optionally try a canonical-link input if one is visible; do not fail the run if it is missing.

Medium’s DOM will change. Selectors must be a wide net (text, aria-label, test ids, graf classes), with the same “leave tab open on failure” debug behavior as Hashnode.

### 5. Article editor

Generalize the Hashnode editor wiring; do not special-case only one platform.

- `publishViaExtension(platform, payload)` — `PUBLISH_HASHNODE` vs `PUBLISH_MEDIUM`.
- On Publish, run **each** client-managed destination independently (Hashnode and Medium can both be selected). A Hashnode failure must not skip Medium.
- Destination row badge/subtitle from `mediumPublishMode`.
- Publish modal banner for the selected Medium default, plus 1-click fallback.
- Issues / “Complete publication” card:
  - Copy Markdown & Open medium.com/new-story
  - Paste live Medium URL + Record Live URL
  - Retry via Extension when that is the default
- Schedule modal: warn that extension / new-story / manual cannot complete in the background. Scheduled Medium only works with `api`.

`record-external` is already generic. Reuse it.

## Tests

- Mode helpers (valid modes, legacy default `api`, client-managed detection).
- `PublishArticleService`: Medium `extension` → `PENDING`, no worker job; mixed dests enqueue only API dests.
- `POST /api/connections`:
  - tokenless `extension` succeeds, does not call `verifyCredentials`, stores sentinel secret.
  - `api` without token → 400.
  - invalid `mediumPublishMode` → 400.
- `PATCH /api/connections` updates connection + destination config.
- Worker skip still holds for Medium client-managed dests.
- Existing Hashnode and DEV.to tests stay green.

No live Medium UI automation in CI. The automator is best-effort against a third-party editor.

## Out of scope

- Updating an already-published Medium story (API v1 cannot update; extension v1 is create-only).
- Scheduling via extension.
- Medium Partner Program / paywall checkboxes.
- Submitting into a Medium publication (publish to the author’s profile only).
- Prompting for a token when switching a tokenless connection to `api`.
- Browser-in-CI verification of Settings (covered by unit tests).

## Acceptance criteria

- [ ] Settings Medium card lets the user pick `extension` / `medium_new` / `manual` / `api`, each with details and disclaimers.
- [ ] Token is optional for free modes and required for `api`.
- [ ] Preference persists on the connection and the Medium destination.
- [ ] Publish with `extension` uses the companion (if loaded) and records the live URL.
- [ ] Publish with `medium_new` copies markdown and opens `medium.com/new-story`.
- [ ] Publish with `manual` only shows Record Live URL.
- [ ] Publish with `api` still uses the existing worker + adapter when a real token is present.
- [ ] Client-managed Medium dests are not sent to the GraphQL/REST worker.
- [ ] Hashnode companion behavior is unchanged.
- [ ] Unit tests above pass.

## Suggested implementation order

1. Types + `isClientManagedDestination` + worker skip + tests.
2. Connections POST/PATCH + Settings picker (can connect tokenless).
3. Extension (manifest, bridge, worker, `medium-automator.js`, popup, README).
4. Editor (publish, retry, banners, fallbacks, schedule warning).
5. Full `pnpm test`.

## Notes on in-progress tree

A first pass already added some types, publishing helpers, connections-route branches, worker skip generalization, and `medium-publish-mode-picker.tsx`. The extension automator, Settings wiring for Medium, and editor Medium path are **not** done. Treat this file as the spec; finish or adjust that WIP against it rather than starting from a second design.
