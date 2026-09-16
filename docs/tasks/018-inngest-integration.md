# TASK-018 — Integrate Inngest

## Objective

Implement the selected Inngest workflow infrastructure.

## Read first

- `AGENTS.md`
- `docs/implementation/07-inngest-workflows.md`
- `docs/implementation/03-environment.md`

## Scope

Configure:

```text
apps/worker/inngest/
├── client
├── events
└── functions
```

Implement the `JobQueue` adapter.

## Events

Start with:

```text
artxflow/distribution.requested
artxflow/publication.requested
artxflow/publication.retry_requested
artxflow/schedule.created
```

## Requirements

- Payloads contain IDs, not whole entities.
- Workflow functions reload current state.
- Correlation ID is propagated.
- Inngest secrets are server-only.

## Acceptance criteria

- [x] Inngest development workflow works.
- [x] Test event can trigger a workflow.
- [x] Workflow can update workflow/publication state.
- [x] No Inngest dependency leaks into core domain packages.

## Dependency

Requires TASK-017.
