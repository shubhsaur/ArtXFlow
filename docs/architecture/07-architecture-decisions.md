# ArtXFlow — Architecture Decision Records

## ADR-001 — Modular monolith initially

### Status

Accepted

### Decision

Start as a modular monolith with strong domain boundaries.

### Why

The project is early-stage, open source, and free-tier-first.

Microservices would add operational cost before scale justifies them.

### Consequence

Modules share deployment but can later be extracted.

---

## ADR-002 — PostgreSQL as system of record

### Status

Accepted

### Decision

Use PostgreSQL, initially through Neon.

### Why

ArtXFlow requires relational consistency for organizations, articles, versions, destinations, publications, schedules, and analytics.

---

## ADR-003 — Inngest for background workflows

### Status

Accepted

### Decision

Use Inngest for asynchronous workflows, scheduling, retries, and background execution.

### Why

ArtXFlow needs durable scheduled publishing and independent multi-destination workflows, and Inngest fits the Vercel/serverless deployment model.

### Consequence

Core business logic depends on an ArtXFlow workflow/queue abstraction rather than direct Inngest calls everywhere.

---

## ADR-004 — ArtXFlow is canonical source

### Status

Accepted

### Decision

ArtXFlow owns the canonical article.

### Why

External platforms as sources of truth make synchronization ambiguous.

### Consequence

External publications are projections of article versions.

---

## ADR-005 — Immutable article versions

### Status

Accepted

### Decision

Persist immutable article versions.

### Why

A publication attempt must always be tied to exact content.

---

## ADR-006 — Platform adapters

### Status

Accepted

### Decision

Each external provider implements a common adapter contract.

### Why

Providers differ in APIs, authentication, content models, capabilities, limits, and errors.

---

## ADR-007 — Credentials belong to connections

### Status

Accepted

### Decision

Store third-party credentials on PlatformConnection.

### Why

Authentication is separate from article/content entities.

---

## ADR-008 — Destination-specific overrides

### Status

Accepted

### Decision

Support overrides without duplicating full articles.

### Why

Providers differ in titles, tags, descriptions, canonical URL handling, and formatting.

---

## ADR-009 — Optional AI transformation layer

### Status

Accepted

### Decision

AI is an optional transformation capability, not a mandatory publishing dependency.

### Why

The platform must remain useful without AI, while keeping the architecture ready for adaptation workflows.

---

## ADR-010 — ArtXFlow-hosted blogs

### Status

Accepted

### Decision

ArtXFlow hosts first-party blog/publication sites.

### Why

This provides a canonical destination and removes dependence on external CMSs for the initial experience.

---

## ADR-011 — Organization-first data model

### Status

Accepted

### Decision

Model tenant data around organizations from day one.

### Why

Single-user accounts can map to one-member organizations, avoiding future migrations.

---

## ADR-012 — Normalized plus raw analytics

### Status

Accepted

### Decision

Store common analytics fields in normalized columns and retain provider-specific data where useful.

### Why

Cross-platform comparisons need normalization without discarding provider capabilities.

---

## ADR-013 — Asynchronous multi-destination publishing

### Status

Accepted

### Decision

External publishing occurs asynchronously.

### Why

Provider APIs are independently slow, rate-limited, and failure-prone.

---

## ADR-014 — Idempotency is mandatory

### Status

Accepted

### Decision

All external publication operations must use an idempotency strategy.

### Why

Retries and uncertain network outcomes can otherwise create duplicates.

---

## ADR-015 — Avoid premature microservices

### Status

Accepted

### Decision

Extract services only when supported by real scaling, deployment, or ownership requirements.

### Why

Architecture should be driven by actual constraints, not fashion.

---

## ADR-016 — Free-tier-first infrastructure

### Status

Accepted

### Decision

Initial infrastructure must be usable without paid services.

### Current direction

```text
Vercel
Neon
Inngest
Free-tier-compatible object storage
```

Provider limits should be monitored and documented as the project grows.

---

## ADR-017 — Design system as a first-class package

### Status

Accepted

### Decision

Tokens and UI primitives live in shared packages rather than inside individual feature modules.

### Why

ArtXFlow needs consistent visual language across dashboard, editor, publishing flows, public sites, and future applications.

---

## ADR-018 — Canonical authoring format

### Status

Accepted for MVP

### Decision

Use Markdown as the canonical content format, with room for MDX/structured content capabilities later.

### Why

The initial audience is developers, Markdown is portable, and platform-specific renderers can adapt it.
