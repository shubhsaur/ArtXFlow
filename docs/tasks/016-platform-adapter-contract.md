# TASK-016 — Implement Platform Adapter Contract

## Objective

Create the provider-agnostic publishing adapter interfaces.

## Read first

- `AGENTS.md`
- `docs/architecture/03-publishing-architecture.md`
- `docs/implementation/08-platform-adapter.md`

## Scope

Implement contracts for:

```text
PlatformProvider
PlatformCapabilities
CanonicalArticle
PlatformArticle
PublishInput
UpdateInput
MetricsInput
PublishResult
PlatformError
PlatformAdapter
```

## Requirements

- Contracts contain no provider-specific logic.
- Provider errors map to common categories.
- Capabilities are explicit.
- External IDs are strings.
- Credential access is abstracted.

## Acceptance criteria

- [x] Package compiles independently.
- [x] Contracts are documented.
- [x] No provider SDK is required by core interfaces.
- [x] Unit tests cover basic contract assumptions.

## Dependency

Requires TASK-015.
