# ArtXFlow — System Overview

## Purpose

ArtXFlow is an open-source content distribution platform for developers first, with a later path to general creators.

Core lifecycle:

```text
Create once
    ↓
Canonical content
    ↓
Transform for destinations
    ↓
Publish / Schedule
    ↓
Track publication state
    ↓
Collect analytics
```

> **ArtXFlow is the source of truth; external platforms are projections of that content.**

## Architecture style

ArtXFlow starts as a **modular monolith with event-driven background workflows**.

This gives us clear domain boundaries without the operational cost of microservices.

```text
                 ArtXFlow
                    │
          ┌─────────┴─────────┐
          │ Next.js Web/App   │
          └─────────┬─────────┘
                    │
      ┌─────────────┼──────────────┐
      ↓             ↓              ↓
   Content      Publishing      Analytics
      │             │              │
      └─────────────┼──────────────┘
                    ↓
                 PostgreSQL
                    │
                    └── Inngest
                         ↓
                    Background
                     workflows
                         ↓
                Platform adapters
```

## Primary stack

- Next.js
- React
- TypeScript
- pnpm
- Turborepo
- PostgreSQL
- Neon
- Vercel
- Inngest
- Object storage

## Main domain modules

```text
identity
organization
content
media
sites
connections
destinations
publishing
scheduling
transformations
analytics
notifications
audit
```

## Publishing flow

```text
User
 ↓
PublishArticle
 ↓
Validate
 ↓
Create publication records
 ↓
Emit DistributionRequested
 ↓
Inngest workflow
 ↓
Destination-specific jobs
 ↓
Platform adapter
 ↓
External API
 ↓
Persist result
```

Publishing is asynchronous so one slow or failing provider does not block the user request.

## Multi-destination behavior

Each destination is independent:

```text
ArtXFlow Blog    ✅
DEV.to           ✅
Medium           ⏳ retrying
Hashnode         ❌ requires attention
```

Overall distribution may become:

- PENDING
- IN_PROGRESS
- PUBLISHED
- PARTIALLY_PUBLISHED
- FAILED

## Canonical content

The article inside ArtXFlow is the authoritative source.

External publications reference:

- organization
- article
- article version
- destination
- external resource ID
- publication state

## Infrastructure philosophy

Use provider abstractions around:

- database
- workflow/queue
- storage
- email
- AI

This keeps vendor choices replaceable while still allowing a free-tier-first deployment.

## Evolution path

### Stage 1

```text
Modular monolith
+
Inngest
+
PostgreSQL
```

### Stage 2

Extract only workloads that demonstrate a real need:

- high-volume publishing
- analytics ingestion
- media processing
- AI workloads

### Stage 3

Move specialized workloads to independent services if scale or operational ownership justifies it.
