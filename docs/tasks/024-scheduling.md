# TASK-024 — Implement Scheduled Publishing

## Objective

Allow users to schedule an article for a future publication time.

## Read first

- `AGENTS.md`
- `docs/implementation/06-application-contracts.md`
- `docs/implementation/07-inngest-workflows.md`
- `docs/architecture/03-publishing-architecture.md`

## Scope

Create:

```text
schedules
```

Support:

```text
article
destinationIds
scheduledAt
timezone
status
```

## Requirements

- Capture article version at scheduling time.
- Normalize execution time to UTC.
- Revalidate article, destinations, and connections when workflow executes.
- Canceled schedules must not publish.
- Scheduling must be idempotent.

## Acceptance criteria

- [x] User can schedule publication.
- [x] Schedule is visible in UI.
- [x] Scheduled workflow executes at intended time.
- [x] Timezone conversion is tested.
- [x] Canceling prevents publication.
- [x] Invalid destination at execution is surfaced clearly.
