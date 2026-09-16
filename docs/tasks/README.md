# ArtXFlow Task Index

This directory contains the ordered, agent-executable implementation tasks for ArtXFlow.

## How to use these tasks

An AI coding agent should normally receive:

```text
AGENTS.md
        +
relevant docs/architecture/*
        +
relevant docs/implementation/*
        +
ONE task file from this directory
```

Do not ask an agent to implement all tasks at once.

Each task is intentionally scoped to a small, reviewable unit of work.

## Task sequence

| ID  | Task                                     | Depends on    |
| --- | ---------------------------------------- | ------------- |
| 001 | Bootstrap repository                     | —             |
| 002 | Configure repository tooling             | 001           |
| 003 | Configure environment                    | 002           |
| 004 | Setup PostgreSQL + Drizzle               | 003           |
| 005 | Create organization + membership model   | 004           |
| 006 | Configure Better Auth                    | 003, 004      |
| 007 | Bootstrap personal organization          | 005, 006      |
| 008 | Build authenticated app shell            | 007           |
| 009 | Create article + ArticleVersion schema   | 005           |
| 010 | Implement article application services   | 009           |
| 011 | Build article editor                     | 008, 010      |
| 012 | Implement canonical article rendering    | 011           |
| 013 | Implement ArtXFlow site model            | 005, 004      |
| 014 | Build public blog                        | 012, 013      |
| 015 | Implement publishing domain model        | 009, 013      |
| 016 | Implement platform adapter contract      | 015           |
| 017 | Implement workflow abstraction           | 015           |
| 018 | Integrate Inngest                        | 017           |
| 019 | Implement ArtXFlow Blog adapter          | 014, 016      |
| 020 | Publish article end-to-end               | 018, 019      |
| 021 | Implement platform connection model      | 005, 004      |
| 022 | Implement DEV.to adapter                 | 020, 021      |
| 023 | Implement destination-specific overrides | 016, 020      |
| 024 | Implement scheduled publishing           | 018, 020      |
| 025 | Harden publication reliability           | 018, 020, 022 |
| 026 | Add Medium + Hashnode adapters           | 022, 025      |
| 027 | Implement analytics foundation           | 015, 004      |
| 028 | Implement provider analytics sync        | 026, 027      |
| 029 | Implement AI transformation boundary     | 016, 018      |
| 030 | Establish CI/CD + quality gates          | 002, 011      |

## Dependency graph

The main implementation path is:

```text
001
 ↓
002
 ↓
003
 ↓
004
 ↓
005
 ├──────────────→ 006
 │                  ↓
 └──────────────→ 007
                    ↓
                   008
                    ↓
              ┌─────┴─────┐
              ↓           ↓
             011         009
              ↓           ↓
             012         010
              ↓           ↓
             014         011
              │
              └──────┐
                     ↓
                    015
                  ┌──┴──┐
                  ↓     ↓
                 016   017
                  │     ↓
                  │    018
                  │     │
                  ↓     ↓
                 019   020
                         │
                    ┌────┴──────────┐
                    ↓               ↓
                   021             023
                    ↓               │
                   022              │
                    │               │
                    └──────┬────────┘
                           ↓
                          024
                           ↓
                          025
                           ↓
                          026
                           ↓
                          027
                           ↓
                          028
                           ↓
                          029

030 can progress independently after repository tooling is available.
```

The exact dependency graph may be adjusted when implementation reveals a better sequencing boundary. Such changes should be reflected here and, when architectural, in the relevant ADR.

## Milestones

### Milestone 1 — Repository foundation

```text
001 → 002 → 003 → 004
```

Result:

- working monorepo
- quality tooling
- environment management
- PostgreSQL/Drizzle foundation

### Milestone 2 — Identity

```text
005 → 006 → 007 → 008
```

Result:

- authenticated user
- organization tenancy
- personal organization
- protected application shell

### Milestone 3 — Canonical content

```text
009 → 010 → 011 → 012
```

Result:

- article persistence
- immutable versions
- editor
- secure Markdown rendering

### Milestone 4 — First-party publishing

```text
013 → 014 → 015 → 016 → 017 → 018 → 019 → 020
```

Result:

```text
Write article
   ↓
Publish
   ↓
Inngest
   ↓
ArtXFlow Blog
   ↓
Public article
```

This is the **first major vertical slice**.

### Milestone 5 — External publishing

```text
021 → 022 → 023 → 024 → 025 → 026
```

Result:

- platform connections
- DEV.to
- destination overrides
- scheduling
- retry/idempotency hardening
- Medium + Hashnode

### Milestone 6 — Analytics + AI

```text
027 → 028
```

and independently:

```text
029
```

Result:

- analytics foundation
- provider analytics
- optional AI transformation boundary

### Milestone 7 — Delivery infrastructure

```text
030
```

Result:

- CI quality gates
- reproducible builds
- deployment checks

## Agent operating pattern

For a normal feature, an agent should work like:

```text
1. Read AGENTS.md
2. Read task file
3. Read all "Read first" documents in the task
4. Inspect existing implementation
5. Implement only task scope
6. Add/update tests
7. Run relevant validation
8. Report changed files and validation results
```

## Task completion rule

A task is complete only when its acceptance criteria are satisfied and the relevant quality checks pass.

At minimum, use:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use narrower checks during development, but run the appropriate full checks before considering a task complete.

## Rules for sequencing

- Never skip a dependency just because a task can technically be started.
- If a task exposes a missing architectural decision, stop and document the decision rather than inventing one silently.
- Do not combine unrelated tasks into one agent run.
- Prefer completing a vertical slice over implementing disconnected infrastructure.
- After each major milestone, review the architecture and task sequence before proceeding.

## First task

Start with:

```text
TASK-001 — Bootstrap ArtXFlow Repository
```

The first target is not a feature. It is a healthy repository foundation on which all later tasks can safely build.
