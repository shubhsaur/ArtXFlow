# TASK-009 — Create Article and ArticleVersion Schema

## Objective

Implement canonical article storage and immutable versioning.

## Read first

- `AGENTS.md`
- `docs/architecture/02-domain-model.md`
- `docs/implementation/05-database-schema.md`
- `docs/implementation/06-application-contracts.md`

## Tables

```text
articles
article_versions
```

## Requirements

Article must contain:

```text
organizationId
authorId
title
slug
excerpt
status
coverAssetId
createdAt
updatedAt
```

Version must contain:

```text
articleId
versionNumber
content
contentFormat
metadata
createdBy
createdAt
```

Enforce:

```text
UNIQUE (organizationId, slug)
UNIQUE (articleId, versionNumber)
```

Versions are immutable after creation.

## Acceptance criteria

- [x] Migration exists.
- [x] Repositories exist.
- [x] Initial version can be created transactionally with article.
- [x] Version cannot be mutated through normal repository API.
- [x] Tests cover uniqueness and version ordering.

## Dependency

Requires TASK-005.
