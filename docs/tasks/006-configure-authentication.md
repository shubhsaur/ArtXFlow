# TASK-006 — Configure Better Auth

## Objective

Set up authentication using Better Auth with Google, GitHub, and email/password support.

## Read first

- `AGENTS.md`
- `docs/architecture/05-security.md`
- `docs/implementation/04-auth.md`
- `docs/implementation/03-environment.md`

## Scope

Implement auth configuration in:

```text
packages/auth
```

Connect authentication identity/session storage to the database.

## Requirements

Support:

- Google
- GitHub
- email/password

Provide server helpers:

```text
getCurrentUser()
requireUser()
```

Keep secrets server-only.

## Acceptance criteria

- [x] Authentication configuration loads.
- [x] Session can be retrieved server-side.
- [x] Unauthenticated access is rejected by `requireUser()`.
- [x] OAuth configuration is represented through environment variables.
- [x] No secret is bundled into client code.

## Note

If provider credentials are not configured locally, development may use a documented mock/dev path, but production behavior must remain real authentication.

## Dependency

Requires TASK-003 and TASK-004.
