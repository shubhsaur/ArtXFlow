# TASK-002 — Configure Repository Tooling

## Objective

Establish consistent formatting, linting, typechecking, and local development conventions.

## Read first

- `AGENTS.md`
- `docs/implementation/01-tech-stack.md`
- `docs/implementation/02-monorepo.md`
- `docs/implementation/12-ci-cd.md`

## Scope

Configure:

- ESLint
- Prettier
- TypeScript strict mode
- editor configuration
- `.gitignore`
- `.editorconfig`
- package scripts
- optional lightweight Git hooks

## Requirements

Root commands must work:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format
```

Turbo should orchestrate relevant package tasks.

## Acceptance criteria

- [x] Commands work from repository root.
- [x] TypeScript strict mode is enabled.
- [x] Formatting is deterministic.
- [x] Generated/build artifacts are ignored.
- [x] CI can call the same root commands.

## Do not

- Add application features.
- Add runtime infrastructure.
