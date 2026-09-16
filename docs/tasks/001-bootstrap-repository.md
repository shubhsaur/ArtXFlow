# TASK-001 — Bootstrap ArtXFlow Repository

## Objective

Create the initial ArtXFlow pnpm + Turborepo monorepo with the agreed application/package structure.

## Read first

- `AGENTS.md`
- `docs/architecture/01-system-overview.md`
- `docs/architecture/07-architecture-decisions.md`
- `docs/implementation/01-tech-stack.md`
- `docs/implementation/02-monorepo.md`

## Scope

Create:

```text
apps/web
apps/worker

packages/auth
packages/analytics
packages/config
packages/content-core
packages/database
packages/design-system
packages/platform-adapters
packages/publishing
packages/storage
packages/transformations
packages/types
packages/ui
```

Configure:

- pnpm workspace
- Turborepo
- root TypeScript configuration
- root ESLint configuration
- root Prettier configuration
- package naming with `@artxflow/*`

## Requirements

- Use TypeScript.
- Enable strict mode.
- Each package has a valid `package.json`.
- Packages expose a stable `src/index.ts` entry point where applicable.
- `apps/web` is a minimal Next.js App Router app.
- `apps/worker` is a minimal worker package ready for Inngest integration.
- No business logic yet.

## Acceptance criteria

- [x] `pnpm install` succeeds.
- [x] `pnpm lint` succeeds.
- [x] `pnpm typecheck` succeeds.
- [x] `pnpm build` succeeds.
- [x] Turbo correctly discovers apps/packages.
- [x] No package has circular dependencies.

## Do not

- Add feature implementation.
- Add authentication.
- Add database schema.
- Add external platform integrations.
- Introduce additional architectural frameworks.
