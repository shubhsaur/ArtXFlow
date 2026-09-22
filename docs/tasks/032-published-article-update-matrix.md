# TASK-032 — Updating Already-Published Articles (Platform Capability Matrix)

## Objective

Define and verify how each publisher supports **updating an article that is already live**, so
republishing an edited article updates the existing remote post instead of silently duplicating it
(or silently doing nothing).

## Verified platform capabilities

Facts below were verified against primary sources (Forem API v1 reference, Hashnode GraphQL
reference, Medium's official API docs repo).

| Platform | Create | Update | How | Blocker |
| --- | --- | --- | --- | --- |
| **DEV.to** | ✅ | ✅ | `PUT /api/articles/{id}` — same `api-key` flow as create; id is the numeric article id returned at create time | Update only works for articles owned by the same connection/PAT |
| **Hashnode** (API/PAT) | ✅ | ✅ | `updatePost(input: UpdatePostInput!)` keyed by `id`, all content fields optional | ⚠️ **Every write mutation is Pro-gated.** Without an active publication plan the API returns `FORBIDDEN: "Publication does not have an active Pro plan."` |
| **Hashnode** (extension / hn_new / manual) | ✅ | ⚠️ | Browser automation must open the post's editor URL and replace the body | Requires storing an edit URL/ID; DOM automation is fragile |
| **Medium** (API, legacy token) | ✅ | ❌ | — | Medium's public API has **no update endpoint and no delete endpoint**. Docs repo archived (Mar 2023): "The Medium API is no longer supported." New Integration Tokens stopped being issued (Jan 2025) |
| **Medium** (extension) | ✅ | ⚠️ | Extension edits `medium.com/p/{id}/edit` under the user's browser session | Needs stored story id/edit URL; DOM automation is fragile |
| **Medium** (manual / medium_new) | ✅ | ⚠️ | Copy markdown, user edits the story, re-record URL | Manual effort per update |
| **ArtXFlow Blog** | ✅ | ✅ | Internal projection update | — |

## What is implemented now (TASK-032 slice 1 — API modes)

- `publicationRepository.findLatestPublishedForArticleAndDestination(...)` locates the most recent
  `PUBLISHED` publication (with an `externalResourceId`) for an article + destination pair.
- The worker publication workflow (`apps/worker/src/inngest/functions/publication.ts`) resolves the
  adapter and then decides:
  - **prior published copy exists AND `capabilities.update`** → `adapter.update()` reusing the remote id
    (no duplicate post), audit metadata `mode: 'UPDATE'`.
  - **otherwise** → `adapter.publish()` as before; when a prior copy existed but the platform cannot
    update, the `SUCCEEDED` audit event records `mode: 'CREATE'`, `duplicateOf`, and the reason.
- Hashnode Pro-gating is classified as a non-retryable `AUTHORIZATION_ERROR` (403) with an actionable
  message pointing users at the plan upgrade or the browser-based publish mode.

Note: publications are keyed by `(articleVersionId, destinationId)`, so editing an article creates a
new publication row per destination; the update routing above is what now links that new row back to
the previously published remote post.

## Remaining work

1. **Publication lineage** — persist an explicit link between a superseding publication and the
   remote post it updated (today this is only recoverable from audit-event metadata).
2. **Client-managed update flow** — store an edit URL alongside `externalUrl` for extension-published
   posts so the companion extension can reopen and update them.
3. **Staleness UI** — show "Out of date" per destination when a newer version exists than the one
   published, plus an explicit "Update published copies" action.
4. **Medium API-mode product decision** — block, deliberately duplicate (current behaviour, now flagged
   in the audit trail), or force the manual/extension path.
5. **Non-updatable destinations** — consider surfacing a warning at publish time before the duplicate
   is created, rather than only in the audit trail.
