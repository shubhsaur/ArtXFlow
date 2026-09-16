# TASK-020 — Implement Publish Article End-to-End

## Objective

Complete the first vertical slice:

```text
Create Article
 ↓
Create Article Version
 ↓
Publish
 ↓
Inngest
 ↓
ArtXFlow Blog
 ↓
Public Article
```

## Read first

- `AGENTS.md`
- `docs/architecture/01-system-overview.md`
- `docs/architecture/03-publishing-architecture.md`
- `docs/implementation/06-application-contracts.md`
- `docs/implementation/07-inngest-workflows.md`

## Requirements

Implement the `PublishArticle` application service.

It must:

1. authorize organization
2. validate article state
3. resolve version
4. validate destination
5. create publication
6. create workflow job record
7. enqueue distribution workflow

## UI

Add a publish action to the article page.

Show:

```text
Publishing
Published
Failed
```

## Acceptance criteria

- [x] End-to-end publish works.
- [x] User does not wait for external work synchronously.
- [x] Publication state updates.
- [x] Public article becomes available.
- [x] E2E test covers the flow.

## Dependency

Requires TASK-018 and TASK-019.
