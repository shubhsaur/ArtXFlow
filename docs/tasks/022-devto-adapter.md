# TASK-022 — Implement DEV.to Connection and Adapter

## Objective

Add the first external publishing integration.

## Read first

- `AGENTS.md`
- `docs/implementation/08-platform-adapter.md`
- `docs/implementation/07-inngest-workflows.md`
- `docs/architecture/05-security.md`

## Scope

Implement:

```text
DEV.to connection
DEV.to account metadata
DEV.to destination
DEV.to adapter
```

## Requirements

- Follow provider authentication requirements.
- Store credentials securely.
- Map provider errors to ArtXFlow error categories.
- Transform canonical Markdown to DEV.to representation.
- Preserve canonical URL where supported.
- Persist external article ID and URL.

## Acceptance criteria

- [x] User can establish a DEV.to connection.
- [x] User can create DEV.to destination.
- [x] Article can publish through Inngest.
- [x] Successful publication stores remote identity.
- [x] Rate limiting maps to retryable failure.
- [x] Invalid credentials stop automatic retries.
- [x] Adapter tests use mocked HTTP.

## Dependency

Requires TASK-021 and TASK-020.
