# TASK-026 — Add Medium and Hashnode Adapters

## Objective

Extend the publishing system without modifying core publishing domain logic.

## Read first

- `AGENTS.md`
- `docs/implementation/08-platform-adapter.md`
- `docs/implementation/07-inngest-workflows.md`

## Scope

Implement separate adapters/connections for:

```text
Medium
Hashnode
```

## Requirements

- Reuse shared adapter contract.
- Provider SDK/API code remains isolated.
- Provider-specific errors map to common categories.
- Capabilities are explicit.
- Tests use mocked provider calls.

## Acceptance criteria

- [x] Both adapters compile and register.
- [x] Canonical articles transform correctly.
- [x] Provider-specific failures do not escape as raw errors.
- [x] Existing DEV.to and ArtXFlow blog behavior remains unchanged.
