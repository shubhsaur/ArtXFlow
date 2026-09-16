# TASK-019 — Implement ArtXFlow Blog Platform Adapter

## Objective

Use the platform adapter architecture for the first-party ArtXFlow Blog.

## Read first

- `AGENTS.md`
- `docs/implementation/08-platform-adapter.md`
- `docs/architecture/03-publishing-architecture.md`

## Scope

Implement:

```text
ArtXFlowBlogAdapter
```

Capabilities should reflect first-party support.

## Publishing behavior

When publishing:

```text
ArticleVersion
 ↓
Public site publication
 ↓
external resource ID = internal published article ID
 ↓
external URL persisted
```

## Requirements

- Reuse application/domain services.
- Do not create a fake HTTP provider just for abstraction.
- Respect publication idempotency.
- Update should map to canonical article/version behavior.

## Acceptance criteria

- [x] Adapter satisfies interface.
- [x] Publish creates a visible public article.
- [x] Duplicate workflow does not create duplicate publication.
- [x] Publication record persists URL/resource ID.

## Dependency

Requires TASK-014 and TASK-016.
