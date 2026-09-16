# ArtXFlow — Testing Strategy

## Layers

```text
Unit
 ↓
Integration
 ↓
Workflow
 ↓
E2E
```

## Unit

Use Vitest for:

- domain rules
- state transitions
- validation
- transformation logic
- error classification
- permission logic
- idempotency key generation

## Integration

Use isolated PostgreSQL tests for:

- repositories
- transactions
- constraints
- application services
- tenant isolation
- publication persistence

## Workflow

Cover:

```text
success
transient retry
permanent failure
partial failure
duplicate execution
schedule cancellation
unknown outcome
expired connection
```

## Adapter tests

Every provider adapter gets contract-style tests for:

- capabilities
- validation
- transformation
- success mapping
- error mapping
- rate limit mapping

Mock external HTTP calls in normal automated tests.

## E2E

Use Playwright.

Initial critical path:

```text
Sign in
 ↓
Personal organization
 ↓
Create article
 ↓
Save draft
 ↓
Publish to ArtXFlow blog
 ↓
Open public article
```

Then external integration:

```text
Connect DEV.to
 ↓
Select destination
 ↓
Publish
 ↓
Verify state
```

## Tenant isolation

Prove that one user/org cannot access another org's:

- articles
- destinations
- publications
- connections
- analytics

## Authorization

Test:

```text
authorized
unauthenticated
wrong organization
insufficient role
```

## Mocking policy

Mock at external boundaries, not internal application modules without a clear reason.

## Quality gates

Every PR should run:

```text
lint
typecheck
unit tests
integration tests
build
```

Critical E2E flows must run before release.

## Regression rule

Production bugs should result in a regression test whenever practical.
