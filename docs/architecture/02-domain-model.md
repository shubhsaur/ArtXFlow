# ArtXFlow — Domain Model

## Domain philosophy

ArtXFlow models content as a **canonical source plus destination-specific projections**.

```text
Organization
    │
    ├── Memberships
    ├── Articles
    ├── Sites
    ├── Connections
    └── Destinations
            │
            └── Publications
                    │
                    └── Publication Events
```

## Core entities

### User

Authenticated person.

A user accesses tenant data through organization membership.

### Organization

Tenant boundary for all product data.

Contains:

- members
- articles
- sites
- connections
- destinations
- analytics
- settings

A single-user account can be represented as a one-member organization.

### Membership

Connects a user to an organization.

Initial roles:

```text
OWNER
MEMBER
```

Future roles:

```text
ADMIN
EDITOR
AUTHOR
VIEWER
```

### Article

Canonical content entity.

Typical fields:

```text
id
organizationId
authorId
title
slug
excerpt
content
status
coverAssetId
createdAt
updatedAt
```

### ArticleVersion

Immutable snapshot of article content.

Used for:

- reproducible publishing
- rollback
- history
- analytics association
- safe retries

A publication references the exact version being represented externally.

### Asset

Uploaded media owned by an organization.

### Site

An ArtXFlow-hosted publication.

Supports the path toward:

```text
organization.artxflow.com
```

and later custom domains.

### PlatformConnection

Authenticated connection to an external provider.

Examples:

```text
DEVTO
MEDIUM
HASHNODE
WORDPRESS
GHOST
LINKEDIN
```

Credentials belong here, not to articles.

### PlatformAccount

Remote account associated with a connection.

### Destination

A concrete place where content can be published.

Examples:

```text
ArtXFlow Site: Engineering Blog
DEV.to: account
Medium: account/publication
Hashnode: blog
```

### Publication

Relationship between:

```text
Article Version + Destination
```

Tracks current external publication state.

### PublicationEvent

Append-only history of publishing events.

Examples:

```text
QUEUED
STARTED
SUCCEEDED
FAILED
RETRY_SCHEDULED
UPDATED
DELETED
```

### Schedule

Future publishing intent containing:

```text
articleVersion
destinationIds
scheduledAt
timezone
status
```

### AnalyticsSnapshot

Normalized metrics captured at a point in time.

### Transformation

A deterministic or AI-generated representation for a destination.

AI transformations remain optional and reviewable.

### AuditLog

Durable business/security history.

## Entity relationships

```text
User
  │
  └──< Membership >── Organization
                          │
                          ├──< Article
                          │      └──< ArticleVersion
                          │             └──< Publication
                          │
                          ├──< Site
                          ├──< PlatformConnection
                          │          └──< PlatformAccount
                          │
                          ├──< Destination
                          ├──< Asset
                          ├──< Schedule
                          ├──< AnalyticsSnapshot
                          └──< AuditLog
```

## Article lifecycle

```text
DRAFT
  ↓
READY
  ↓
SCHEDULED
  ↓
QUEUED
  ↓
PUBLISHING
  ↓
PUBLISHED
```

Failure path:

```text
PUBLISHING
   ↓
FAILED
   ↓
RETRYING
   ↓
PUBLISHED
```

## Important invariants

### Tenant isolation

Every tenant-owned entity is organization-scoped.

### Publication version integrity

A publication points to an exact article version.

### Connection separation

Platform credentials belong only to connection entities.

### Idempotent publication

The same version must not create duplicate external publications for the same destination.

### Immutable versions

Published versions do not mutate.

### Destination uniqueness

Duplicate logical destinations should be prevented within an organization.

## Future extensions

The model should support:

- teams
- multiple sites
- multiple accounts per provider
- social posts
- newsletters
- approval workflows
- content collections
