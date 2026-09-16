# ArtXFlow — Agent Operating Guidelines

This repository follows the architectural and implementation specifications in `docs/`.

## Critical Guidelines for Agents

1. **Monorepo Architecture**:
   - Applications live in `apps/` (`apps/web`, `apps/worker`).
   - Shared domain logic, schemas, and adapters live in `packages/`.
   - Package naming format: `@artxflow/<package-name>`.
   - Packages must expose clean public entry points (`src/index.ts`). Do not import private/internal files of other packages.

2. **System of Record**:
   - ArtXFlow is the canonical source of truth for articles and article versions.
   - External platforms (DEV.to, Medium, Hashnode, etc.) are projections.
   - All article publishing and updates are tied to immutable `ArticleVersion` records.

3. **Background Workflows**:
   - Publishing and heavy operations are asynchronous via Inngest.
   - Multi-destination publishing must be independent and idempotent.

4. **Code Quality & Tooling**:
   - TypeScript strict mode is enabled.
   - Always run `pnpm lint`, `pnpm typecheck`, and `pnpm test` before concluding tasks.
   - Do not introduce arbitrary new architectural frameworks or microservices prematurely.

5. **Reference Documentation**:
   - System Overview: `docs/architecture/01-system-overview.md`
   - Architecture Decisions: `docs/architecture/07-architecture-decisions.md`
   - Monorepo Specification: `docs/implementation/02-monorepo.md`
   - Task Roadmap: `docs/tasks/`
