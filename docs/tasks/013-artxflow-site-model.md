# TASK-013 — Implement ArtXFlow Site Model

## Objective

Create the first-party hosted blog/site domain.

## Read first

- `AGENTS.md`
- `docs/architecture/02-domain-model.md`
- `docs/implementation/05-database-schema.md`
- `docs/implementation/09-frontend-architecture.md`

## Scope

Create `sites` table/repository.

Fields:

```text
id
organizationId
name
subdomain
customDomain
status
themeConfig
createdAt
updatedAt
```

## Requirements

- Subdomain is unique.
- Site belongs to one organization.
- Theme configuration is JSONB.
- Site status is explicit.

## Acceptance criteria

- [x] Migration exists.
- [x] Repository exists.
- [x] Tenant isolation is tested.
- [x] Subdomain uniqueness is enforced.
