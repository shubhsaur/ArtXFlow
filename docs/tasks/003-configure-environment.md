# TASK-003 — Configure Environment Management

## Objective

Implement the centralized, type-safe server/client environment configuration described by the architecture.

## Read first

- `AGENTS.md`
- `docs/architecture/05-security.md`
- `docs/implementation/03-environment.md`

## Scope

Create environment configuration in:

```text
packages/config
```

Provide:

```text
server environment
client-safe environment
```

Use Zod for runtime validation.

Create:

```text
.env.example
```

## Requirements

At minimum document placeholders for:

```text
DATABASE_URL
BETTER_AUTH_SECRET
ENCRYPTION_KEY
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
NEXT_PUBLIC_APP_URL
```

Do not require third-party provider secrets until their integrations are implemented.

## Acceptance criteria

- [x] Server-only values cannot be imported by client code.
- [x] Environment schema validates required values.
- [x] `.env.example` contains no real secrets.
- [x] Missing required configuration produces a useful startup error.
- [x] Tests cover valid and invalid configuration.

## Do not

- Commit `.env.local`.
- Expose server secrets through public environment variables.
