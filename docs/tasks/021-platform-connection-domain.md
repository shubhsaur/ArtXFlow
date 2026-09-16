# TASK-021 — Implement Platform Connection Model

## Objective

Create secure connection/destination infrastructure for external providers.

## Read first

- `AGENTS.md`
- `docs/architecture/05-security.md`
- `docs/implementation/04-auth.md`
- `docs/implementation/05-database-schema.md`

## Scope

Create:

```text
platform_connections
platform_accounts
```

Add destination support for external connections.

## Requirements

- Credentials are encrypted before persistence.
- Raw credentials never leave server-side code.
- Connection status is explicit.
- Account metadata is safe and non-secret.
- Connection belongs to an organization.

## Acceptance criteria

- [x] Migration exists.
- [x] Encryption abstraction exists.
- [x] Tenant isolation tests exist.
- [x] Secret values are never returned in DTOs.
