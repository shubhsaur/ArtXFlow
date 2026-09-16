# TASK-008 — Build Authenticated Application Shell

## Objective

Create the initial authenticated web application shell.

## Read first

- `AGENTS.md`
- `docs/implementation/09-frontend-architecture.md`
- `docs/implementation/10-design-system-implementation.md`

## Scope

Create:

```text
/dashboard
/settings
```

with authenticated layout/navigation.

Show:

- user
- current organization
- navigation
- sign out

## Requirements

- Unauthenticated users are redirected to auth.
- Server-side authentication determines access.
- Use shared UI components.
- No feature-specific dashboard widgets yet.

## Acceptance criteria

- [x] Authenticated user reaches dashboard.
- [x] Unauthenticated user cannot access protected shell.
- [x] Sign out works.
- [x] Layout is responsive.
- [x] Basic accessibility checks pass.

## Dependency

Requires TASK-007.
