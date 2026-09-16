# ArtXFlow — Monorepo Specification

## Repository

```text
artxflow/
├── apps/
│   ├── web/
│   └── worker/
├── packages/
│   ├── auth/
│   ├── analytics/
│   ├── config/
│   ├── content-core/
│   ├── database/
│   ├── design-system/
│   ├── platform-adapters/
│   ├── publishing/
│   ├── storage/
│   ├── transformations/
│   ├── types/
│   └── ui/
├── docs/
│   ├── architecture/
│   ├── design/
│   ├── implementation/
│   └── tasks/
├── AGENTS.md
├── README.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Ownership

### `apps/web`

Owns Next.js routes, layouts, server actions/route handlers, authenticated UI, and public blog rendering.

### `apps/worker`

Owns Inngest function registration and background execution wiring. Business logic remains in packages.

### `packages/auth`

Authentication configuration, session helpers, auth-related server utilities.

### `packages/content-core`

Article and ArticleVersion domain rules and state transitions.

### `packages/database`

Drizzle schema, migrations, client, repositories, transactions, seed data.

### `packages/design-system`

Design tokens, themes, typography, spacing, motion, semantic tokens.

### `packages/ui`

Accessible reusable React components.

### `packages/publishing`

Publication use cases, distribution orchestration, state machine, workflow abstractions.

### `packages/platform-adapters`

Shared adapter contract plus provider implementations.

```text
platform-adapters/
├── core/
├── artxflow/
├── devto/
├── medium/
└── hashnode/
```

### `packages/transformations`

Canonical-to-platform transformations and future AI transformation orchestration.

### `packages/analytics`

Normalized metrics and analytics ingestion.

### `packages/storage`

Object storage abstraction.

### `packages/config`

Environment parsing and typed configuration.

### `packages/types`

Only genuinely cross-domain types. Avoid turning it into a dumping ground.

## Dependency direction

```text
apps
 ↓
application/domain packages
 ↓
infrastructure abstractions
 ↓
provider implementations
```

No circular dependencies.

Each package exposes a deliberate public entry point such as `src/index.ts`. Do not import another package's internal files.

## Package naming

```text
@artxflow/auth
@artxflow/database
@artxflow/content-core
@artxflow/publishing
@artxflow/platform-adapters
@artxflow/ui
```
