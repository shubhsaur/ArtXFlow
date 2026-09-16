# TASK-004 — Setup PostgreSQL and Drizzle

## Objective

Create the database package and establish the PostgreSQL/Drizzle foundation.

## Read first

- `AGENTS.md`
- `docs/architecture/04-database-design.md`
- `docs/implementation/01-tech-stack.md`
- `docs/implementation/05-database-schema.md`

## Scope

Implement:

```text
packages/database
├── src/client
├── src/schema
├── src/repositories
├── src/transactions
└── migrations
```

Configure:

- Drizzle ORM
- PostgreSQL connection
- migration commands
- development seed entry point

## Requirements

- Database access exists only inside `@artxflow/database`.
- Connection configuration uses `@artxflow/config`.
- Provide typed database client.
- Add a health-check query.
- Create initial migration infrastructure even if the first migration is minimal.

## Acceptance criteria

- [x] Application can connect to development PostgreSQL.
- [x] Migration command works.
- [x] Database package can be imported by server-side packages.
- [x] No database dependency leaks into client components.

## Do not

- Build article/user schema yet beyond what tooling absolutely requires.
