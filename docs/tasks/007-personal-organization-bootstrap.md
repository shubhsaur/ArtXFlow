# TASK-007 — Bootstrap Personal Organization

## Objective

Create a personal organization and OWNER membership for a newly authenticated user.

## Read first

- `AGENTS.md`
- `docs/architecture/02-domain-model.md`
- `docs/implementation/04-auth.md`
- `docs/implementation/06-application-contracts.md`

## Flow

```text
Authenticated User
      ↓
Find personal organization
      ↓
Create if absent
      ↓
Create OWNER membership
```

## Requirements

- Operation is transactional.
- Operation is idempotent.
- Repeated execution creates no duplicate personal organization.
- Slug generation is deterministic and conflict-safe.
- User receives OWNER membership.

## Acceptance criteria

- [x] First login creates personal organization.
- [x] Repeat login does not create another organization.
- [x] OWNER membership exists.
- [x] Failure rolls back related writes.
- [x] Tests cover concurrency/repeated execution where practical.

## Dependency

Requires TASK-005 and TASK-006.
