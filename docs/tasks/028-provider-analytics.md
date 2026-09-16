# TASK-028 — Implement Provider Analytics Sync

## Objective

Fetch provider metrics asynchronously and store normalized analytics.

## Read first

- `AGENTS.md`
- `docs/architecture/03-publishing-architecture.md`
- `docs/implementation/07-inngest-workflows.md`
- `docs/implementation/08-platform-adapter.md`

## Scope

Extend adapters with metrics support and create analytics sync workflows.

## Requirements

- Only providers supporting analytics implement meaningful fetching.
- Normalize common metrics.
- Retain provider-specific values where useful.
- Use scheduled background workflows.
- Rate limits use retry policy.
- Analytics sync cannot alter publication state.

## Acceptance criteria

- [x] Provider metrics can be fetched.
- [x] Snapshot is persisted.
- [x] Historical snapshots are retained.
- [x] Failed syncs are observable.
