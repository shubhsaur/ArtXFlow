# TASK-025 — Implement Publication Reliability

## Objective

Harden publishing with retries, idempotency, partial failure, and error classification.

## Read first

- `AGENTS.md`
- `docs/architecture/03-publishing-architecture.md`
- `docs/implementation/07-inngest-workflows.md`
- `docs/implementation/11-testing-strategy.md`

## Scope

Implement:

```text
retry classification
bounded retries
backoff
unknown outcome state
partial distribution status
manual retry
```

## Requirements

Retry:

```text
network
timeout
429
provider 5xx
```

Do not automatically retry:

```text
invalid credentials
validation failure
permission denied
unsupported operation
```

## Acceptance criteria

- [x] Transient errors retry.
- [x] Permanent errors stop retrying.
- [x] Duplicate workflow execution does not duplicate publication.
- [x] One failed destination does not erase successful destinations.
- [x] User can retry failed publication.
- [x] Unknown outcomes are handled explicitly.
