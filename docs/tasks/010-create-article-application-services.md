# TASK-010 — Implement Article Application Services

## Objective

Implement the first content use cases.

## Read first

- `AGENTS.md`
- `docs/architecture/02-domain-model.md`
- `docs/implementation/05-database-schema.md`
- `docs/implementation/06-application-contracts.md`

## Commands

Implement:

```text
CreateArticle
UpdateArticle
GetArticle
```

## CreateArticle

Requirements:

- authorize organization
- validate title/content
- generate or validate slug
- create article + initial version transactionally

## UpdateArticle

Requirements:

- authorize organization
- preserve history
- create a new version when canonical content changes
- do not mutate historical versions

## Tests

Cover:

- [x] valid creation
- [x] duplicate slug
- [x] wrong organization
- [x] version increment
- [x] immutable history
- [x] invalid state

## Acceptance criteria

- [x] CreateArticle creates article + version 1 transactionally with tenant authorization.
- [x] UpdateArticle increments version when content changes and leaves history immutable.
- [x] GetArticle returns requested or latest immutable version snapshot.
- [x] All commands strictly enforce organization boundaries.
