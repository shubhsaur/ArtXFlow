# TASK-027 — Implement Analytics Foundation

## Objective

Create the analytics domain without requiring full provider metrics yet.

## Read first

- `AGENTS.md`
- `docs/architecture/02-domain-model.md`
- `docs/implementation/05-database-schema.md`

## Scope

Create:

```text
analytics_snapshots
analytics_raw_events
```

and normalized metric types.

## Requirements

Support at minimum:

```text
views
likes
comments
shares
bookmarks
```

Metrics are associated with a publication and destination.

## Acceptance criteria

- [x] Schema exists.
- [x] Repository exists.
- [x] Metrics are tenant-scoped.
- [x] Snapshot timestamps are explicit.
- [x] Provider-specific data can be retained without changing normalized columns.
