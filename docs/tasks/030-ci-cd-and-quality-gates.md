# TASK-030 — Establish CI/CD and Quality Gates

## Objective

Make the repository continuously verifiable and deployable.

## Read first

- `AGENTS.md`
- `docs/implementation/11-testing-strategy.md`
- `docs/implementation/12-ci-cd.md`

## Scope

Create GitHub workflows for:

```text
lint
typecheck
unit tests
integration tests
build
E2E
```

Configure preview/deployment expectations.

## Requirements

PR checks should fail on:

- lint errors
- type errors
- test failures
- build failures

Database tests must use isolated data.

Preview environments must never contain production provider credentials.

## Acceptance criteria

- [x] PR CI runs.
- [x] Main branch protection can require checks.
- [x] Tests and builds are reproducible.
- [x] No production secret is available to preview environments.
