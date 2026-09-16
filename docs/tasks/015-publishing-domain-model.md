# TASK-015 — Implement Publishing Domain Model

## Objective

Create the core publication/destination domain required before external platform integrations.

## Read first

- `AGENTS.md`
- `docs/architecture/02-domain-model.md`
- `docs/architecture/03-publishing-architecture.md`
- `docs/implementation/05-database-schema.md`

## Scope

Create:

```text
destinations
publications
publication_events
workflow_jobs
```

and corresponding repositories/services.

## Requirements

A publication represents:

```text
articleVersion + destination
```

Enforce:

```text
UNIQUE (articleVersionId, destinationId)
```

Publication states:

```text
PENDING
QUEUED
PUBLISHING
PUBLISHED
RETRYING
FAILED
```

## Acceptance criteria

- [x] Migrations created.
- [x] Publication uniqueness enforced.
- [x] Append-only publication event model exists.
- [x] Tenant isolation tested.
- [x] Repository methods avoid raw database rows leaking upward.

## Dependency

Requires TASK-009 and TASK-013.
