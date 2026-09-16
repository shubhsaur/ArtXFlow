# ArtXFlow — CI/CD Specification

## Goal

Every pull request must prove that the repository remains installable, type-safe, testable, and buildable.

## GitHub workflows

```text
.github/workflows/
├── ci.yml
└── e2e.yml
```

## Pull request pipeline

```text
Checkout
 ↓
Setup Node + pnpm
 ↓
Install dependencies
 ↓
Lint
 ↓
Typecheck
 ↓
Unit tests
 ↓
Integration tests
 ↓
Build
```

Use Turborepo caching/task graph to avoid redundant work.

## Database

CI integration tests use an isolated PostgreSQL database.

Apply migrations before tests.

Never run CI against production data.

## Preview

Use Vercel preview deployments where practical.

Preview environments must not have production provider credentials.

## Main branch

```text
main
 ↓
Vercel deployment
```

Application/workflow releases must ensure Inngest functions are deployed/configured consistently.

## Migrations

Do not mutate production schema from application startup.

Use explicit migration deployment.

For breaking changes:

```text
expand
 ↓
migrate/backfill
 ↓
switch application
 ↓
contract
```

## Security checks

Run:

- dependency audit
- secret scanning where available
- lint
- typecheck
- tests

Do not disable security checks merely to unblock a merge.

## Branch protection

Require CI checks before merging to `main`.

## Free-tier requirement

CI/CD must remain compatible with the project's free-tier-first approach. Do not introduce paid services without an explicit architecture decision.
