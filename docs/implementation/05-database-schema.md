# ArtXFlow — Database Schema Specification

## ORM

Use Drizzle ORM with PostgreSQL.

Schema:

```text
packages/database/src/schema/
```

Migrations:

```text
packages/database/drizzle/
```

## Conventions

- Database naming: `snake_case`
- TypeScript naming: `camelCase`
- Internal primary keys: UUID
- Time: `timestamptz`
- Required timestamps: `created_at`, `updated_at`
- Provider IDs: strings

## Initial enums

```text
membership_role:
  OWNER
  MEMBER

article_status:
  DRAFT
  READY
  ARCHIVED

publication_status:
  PENDING
  QUEUED
  PUBLISHING
  PUBLISHED
  RETRYING
  FAILED

connection_status:
  CONNECTED
  EXPIRED
  REAUTH_REQUIRED
  REVOKED
```

## Core tables

### organizations

```text
id UUID PK
name TEXT NOT NULL
slug TEXT NOT NULL UNIQUE
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

### users

```text
id UUID PK
email CITEXT NOT NULL
display_name TEXT
avatar_url TEXT
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

### memberships

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
user_id UUID NOT NULL FK users
role membership_role NOT NULL
created_at TIMESTAMPTZ NOT NULL

UNIQUE (organization_id, user_id)
```

### articles

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
author_id UUID NOT NULL FK users
title TEXT NOT NULL
slug TEXT NOT NULL
excerpt TEXT
status article_status NOT NULL
cover_asset_id UUID
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL

UNIQUE (organization_id, slug)
```

### article_versions

```text
id UUID PK
article_id UUID NOT NULL FK articles
version_number INTEGER NOT NULL
content TEXT NOT NULL
content_format TEXT NOT NULL
metadata JSONB NOT NULL DEFAULT '{}'
created_by UUID NOT NULL FK users
created_at TIMESTAMPTZ NOT NULL

UNIQUE (article_id, version_number)
```

Versions are immutable.

### assets

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
type TEXT NOT NULL
storage_key TEXT NOT NULL
mime_type TEXT NOT NULL
size_bytes BIGINT NOT NULL
width INTEGER
height INTEGER
created_at TIMESTAMPTZ NOT NULL
```

### sites

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
name TEXT NOT NULL
subdomain TEXT UNIQUE NOT NULL
custom_domain TEXT UNIQUE
status TEXT NOT NULL
theme_config JSONB NOT NULL DEFAULT '{}'
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

### platform_connections

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
provider TEXT NOT NULL
status connection_status NOT NULL
encrypted_secret TEXT NOT NULL
token_metadata JSONB NOT NULL DEFAULT '{}'
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

### platform_accounts

```text
id UUID PK
connection_id UUID NOT NULL FK platform_connections
external_id TEXT NOT NULL
username TEXT
display_name TEXT
avatar_url TEXT
metadata JSONB NOT NULL DEFAULT '{}'

UNIQUE (connection_id, external_id)
```

### destinations

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
type TEXT NOT NULL
name TEXT NOT NULL
connection_id UUID
site_id UUID
config JSONB NOT NULL DEFAULT '{}'
status TEXT NOT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Application validation must ensure valid type/reference combinations.

### publications

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
article_id UUID NOT NULL FK articles
article_version_id UUID NOT NULL FK article_versions
destination_id UUID NOT NULL FK destinations
status publication_status NOT NULL
external_resource_id TEXT
external_url TEXT
published_at TIMESTAMPTZ
last_attempt_at TIMESTAMPTZ
attempt_count INTEGER NOT NULL DEFAULT 0
last_error_code TEXT
last_error_message TEXT
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL

UNIQUE (article_version_id, destination_id)
```

### publication_events

```text
id UUID PK
publication_id UUID NOT NULL FK publications
event_type TEXT NOT NULL
correlation_id TEXT NOT NULL
metadata JSONB NOT NULL DEFAULT '{}'
created_at TIMESTAMPTZ NOT NULL
```

Append-only.

### schedules

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
article_version_id UUID NOT NULL FK article_versions
scheduled_at TIMESTAMPTZ NOT NULL
timezone TEXT NOT NULL
status TEXT NOT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

### workflow_jobs

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
type TEXT NOT NULL
status TEXT NOT NULL
reference_type TEXT NOT NULL
reference_id UUID NOT NULL
idempotency_key TEXT NOT NULL UNIQUE
workflow_id TEXT
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

This is an ArtXFlow application record, not a replacement for Inngest.

### analytics_snapshots

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
publication_id UUID NOT NULL FK publications
captured_at TIMESTAMPTZ NOT NULL
views BIGINT
likes BIGINT
comments BIGINT
shares BIGINT
bookmarks BIGINT
metrics JSONB NOT NULL DEFAULT '{}'
```

### transformations

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
article_version_id UUID NOT NULL FK article_versions
destination_id UUID
kind TEXT NOT NULL
provider TEXT
input_hash TEXT NOT NULL
output_content TEXT NOT NULL
status TEXT NOT NULL
approved_at TIMESTAMPTZ
created_at TIMESTAMPTZ NOT NULL
```

### audit_logs

```text
id UUID PK
organization_id UUID NOT NULL FK organizations
actor_user_id UUID
action TEXT NOT NULL
entity_type TEXT NOT NULL
entity_id UUID
metadata JSONB NOT NULL DEFAULT '{}'
created_at TIMESTAMPTZ NOT NULL
```

## Constraints/indexes

At minimum index organization + common query fields and publication/schedule state fields.

Use explicit foreign keys, uniqueness constraints, and transaction boundaries for multi-row operations.
