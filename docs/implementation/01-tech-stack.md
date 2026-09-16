# ArtXFlow — Technical Stack

## Purpose

Lock the initial implementation stack so AI agents and contributors do not repeatedly make foundational technology choices.

## Stack

| Concern          | Choice                       | Notes                          |
| ---------------- | ---------------------------- | ------------------------------ |
| Language         | TypeScript                   | `strict` mode                  |
| Frontend         | Next.js + React              | App Router                     |
| Package manager  | pnpm                         | Workspace manager              |
| Monorepo         | Turborepo                    | Build/task orchestration       |
| Styling          | Tailwind CSS + CSS variables | Tokens from design system      |
| Icons            | Lucide                       | Consistent outline icons       |
| Validation       | Zod                          | Runtime validation             |
| Database         | PostgreSQL                   | System of record               |
| DB provider      | Neon                         | Initial hosted DB              |
| ORM              | Drizzle ORM                  | PostgreSQL + migrations        |
| Auth             | Better Auth                  | Google, GitHub, email/password |
| Workflows        | Inngest                      | Jobs, schedules, retries       |
| Unit/integration | Vitest                       | Fast TS testing                |
| UI testing       | Testing Library              | Component behavior             |
| E2E              | Playwright                   | Critical user journeys         |
| Deployment       | Vercel                       | Web app                        |
| Formatting       | Prettier                     | Repository standard            |
| Linting          | ESLint                       | Repository standard            |

## Architecture rules

- `packages/database` owns direct Drizzle access.
- `packages/auth` owns Better Auth integration.
- `packages/platform-adapters` owns provider SDK/API behavior.
- Inngest access belongs behind workflow infrastructure boundaries.
- Domain code must not depend directly on framework/provider SDKs.
- Use Zod at untrusted runtime boundaries.
- Use UUIDs for internal primary IDs.
- Store timestamps as PostgreSQL `timestamptz` and use UTC internally.

## Why Drizzle

Chosen for type-safe PostgreSQL schema definitions, explicit SQL-friendly behavior, lightweight runtime cost, and good TypeScript ergonomics.

## Why Inngest

Chosen for durable background workflows, scheduling, retries, and multi-destination publishing while fitting the Vercel/serverless deployment model.

## Provider strategy

Infrastructure should remain replaceable where practical:

```text
Database provider
Workflow provider
Storage provider
AI provider
Email provider
Observability provider
```

Do not spread vendor-specific APIs throughout the domain.
