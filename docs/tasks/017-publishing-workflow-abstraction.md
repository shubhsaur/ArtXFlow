# TASK-017 — Implement Workflow Abstraction

## Objective

Create an ArtXFlow-owned abstraction over asynchronous workflow execution.

## Read first

- `AGENTS.md`
- `docs/architecture/03-publishing-architecture.md`
- `docs/implementation/07-inngest-workflows.md`

## Scope

Create:

```ts
interface JobQueue {
  enqueue(input: EnqueueJobInput): Promise<EnqueueJobResult>;
  schedule(input: ScheduleJobInput): Promise<ScheduleJobResult>;
  cancel(input: CancelJobInput): Promise<void>;
}
```

The interface must remain provider-neutral.

## Requirements

- No Inngest types leak into domain packages.
- Job records are linked to ArtXFlow workflow records where appropriate.
- Idempotency key is required for externally side-effecting jobs.

## Acceptance criteria

- [x] Interface exists.
- [x] Tests cover idempotency contract.
- [x] No domain package imports Inngest.

## Dependency

Requires TASK-015.
