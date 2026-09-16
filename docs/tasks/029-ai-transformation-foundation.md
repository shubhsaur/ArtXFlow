# TASK-029 — Implement AI-Aware Transformation Boundary

## Objective

Introduce an AI-capable transformation boundary without making AI mandatory.

## Read first

- `AGENTS.md`
- `docs/architecture/07-architecture-decisions.md`
- `docs/implementation/08-platform-adapter.md`

## Scope

Create transformation interfaces for:

```text
deterministic transformation
optional AI transformation
```

## Requirements

- Core publishing works without AI.
- Generated output is persisted as a transformation artifact.
- User approval is explicit before AI-generated content is published.
- AI provider credentials remain server-side.
- Provider implementation is replaceable.

## Acceptance criteria

- [x] Transformation abstraction exists.
- [x] Deterministic transformation works without AI.
- [x] AI provider can be plugged in without changing publishing core.
- [x] AI output is reviewable.
