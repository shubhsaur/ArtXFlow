# TASK-023 — Implement Destination-Specific Overrides

## Objective

Allow users to customize platform-specific fields without duplicating canonical article content.

## Read first

- `AGENTS.md`
- `docs/architecture/03-publishing-architecture.md`
- `docs/implementation/06-application-contracts.md`
- `docs/implementation/08-platform-adapter.md`

## Scope

Support override fields such as:

```text
title
description
tags
canonicalUrl
providerMetadata
```

## Requirements

- Overrides belong to destination/publication configuration.
- Canonical article remains unchanged.
- Transformations combine canonical data + overrides.
- Overrides are version-aware when publishing a specific article version.

## Acceptance criteria

- [x] DEV.to title can differ from canonical title.
- [x] Tags can be overridden.
- [x] Canonical content is not duplicated.
- [x] Tests cover default and override behavior.
