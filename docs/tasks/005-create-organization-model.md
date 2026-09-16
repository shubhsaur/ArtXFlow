# TASK-005 — Create Organization and Membership Schema

## Objective

Implement the organization-first tenancy foundation.

## Read first

- `AGENTS.md`
- `docs/architecture/02-domain-model.md`
- `docs/implementation/05-database-schema.md`
- `docs/implementation/06-application-contracts.md`

## Scope

Create:

```text
organizations
memberships
```

and corresponding repository methods.

## Requirements

Organization:

```text
id
name
slug
createdAt
updatedAt
```

Membership:

```text
id
organizationId
userId
role
createdAt
```

Initial role:

```text
OWNER
MEMBER
```

Enforce:

```text
UNIQUE (organizationId, userId)
UNIQUE organization slug
```

## Acceptance criteria

- [x] Migration created.
- [x] Foreign keys exist.
- [x] Unique constraints exist.
- [x] Repository tests exist.
- [x] Tenant-scoped organization lookup works.
- [x] Invalid cross-organization relationships are rejected.

## Dependency

Requires TASK-004.
