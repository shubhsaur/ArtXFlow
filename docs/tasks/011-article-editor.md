# TASK-011 — Build Article Editor

## Objective

Create the first usable Markdown article editor.

## Read first

- `AGENTS.md`
- `docs/implementation/06-application-contracts.md`
- `docs/implementation/09-frontend-architecture.md`
- `docs/implementation/10-design-system-implementation.md`

## Route

```text
/articles/new
/articles/[articleId]
```

## Scope

Implement:

- title input
- slug handling
- Markdown editor
- excerpt
- save action
- basic validation
- save/pending/error states
- preview toggle

## Requirements

- Server validates all persisted data.
- Editor state does not define database schema.
- Avoid unnecessary global state.
- Use accessible controls.

## Acceptance criteria

- [x] User can create article.
- [x] User can edit article.
- [x] Draft persists.
- [x] Validation errors are visible.
- [x] Existing versions are preserved.
- [x] Mobile layout is usable.

## Dependency

Requires TASK-008 and TASK-010.
