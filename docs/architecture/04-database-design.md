# ArtXFlow — Database Design

## Database

Primary database:

**PostgreSQL**, initially through **Neon**.

System of record for:

- organizations
- content
- versions
- assets
- connections
- destinations
- publications
- schedules
- analytics
- audit history
- application workflow records

## Tenant model

```text
users
   │
   └── memberships
           │
           ▼
      organizations
           │
      ┌────┼─────┐
      ↓    ↓     ↓
  articles sites connections
                    ↓
               destinations
```

Tenant-owned tables should carry `organization_id` directly when practical.

## Initial tables

```text
users
auth_accounts
memberships
organizations

articles
article_versions
assets

sites

platform_connections
platform_accounts
destinations

publications
publication_events

schedules
workflow_jobs

analytics_snapshots
analytics_raw_events

transformations
audit_logs
```

## Core schema sketches

### organizations

```text
id              uuid PK
name            text
slug            text UNIQUE
created_at      timestamptz
updated_at      timestamptz
```

### users

```text
id              uuid PK
email           citext
display_name    text
avatar_url      text nullable
created_at      timestamptz
updated_at      timestamptz
```

### memberships

```text
id              uuid PK
organization_id uuid FK
user_id         uuid FK
role            enum
created_at      timestamptz

UNIQUE (organization_id, user_id)
```

### articles

```text
id              uuid PK
organization_id uuid FK
author_id       uuid FK
title           text
slug            text
excerpt         text nullable
status          enum
cover_asset_id  uuid nullable
created_at      timestamptz
updated_at      timestamptz

UNIQUE (organization_id, slug)
```

### article_versions

```text
id              uuid PK
article_id      uuid FK
version_number  integer
content         text
content_format  enum
metadata        jsonb
created_by      uuid FK
created_at      timestamptz

UNIQUE (article_id, version_number)
```

### assets

```text
id              uuid PK
organization_id uuid FK
type            enum
storage_key     text
mime_type       text
size_bytes      bigint
width           integer nullable
height          integer nullable
created_at      timestamptz
```

### sites

```text
id              uuid PK
organization_id uuid FK
name            text
subdomain       text UNIQUE
custom_domain   text UNIQUE nullable
status          enum
theme_config    jsonb
created_at      timestamptz
updated_at      timestamptz
```

### platform_connections

```text
id               uuid PK
organization_id  uuid FK
provider         enum
status           enum
encrypted_secret text
token_metadata   jsonb
created_at       timestamptz
updated_at       timestamptz
```

### platform_accounts

```text
id              uuid PK
connection_id   uuid FK
external_id     text
username        text nullable
display_name    text nullable
avatar_url      text nullable
metadata        jsonb

UNIQUE (connection_id, external_id)
```

### destinations

```text
id               uuid PK
organization_id  uuid FK
type             enum
name             text
connection_id    uuid nullable
site_id          uuid nullable
config           jsonb
status           enum
created_at       timestamptz
updated_at       timestamptz
```

### publications

```text
id                    uuid PK
organization_id       uuid FK
article_id            uuid FK
article_version_id    uuid FK
destination_id        uuid FK
status                enum
external_resource_id  text nullable
external_url          text nullable
published_at          timestamptz nullable
last_attempt_at       timestamptz nullable
attempt_count         integer
last_error_code       text nullable
last_error_message    text nullable
created_at            timestamptz
updated_at            timestamptz

UNIQUE (article_version_id, destination_id)
```

### publication_events

```text
id              uuid PK
publication_id  uuid FK
event_type      enum
correlation_id  text
metadata        jsonb
created_at      timestamptz
```

### schedules

```text
id                  uuid PK
organization_id     uuid FK
article_version_id  uuid FK
scheduled_at        timestamptz
timezone            text
status              enum
created_at          timestamptz
updated_at          timestamptz
```

### workflow_jobs

This is an ArtXFlow application record, not a replacement for Inngest.

```text
id              uuid PK
organization_id uuid FK
type            enum
status          enum
reference_type  text
reference_id    uuid
idempotency_key text UNIQUE
created_at      timestamptz
updated_at      timestamptz
```

### analytics_snapshots

```text
id              uuid PK
organization_id uuid FK
publication_id  uuid FK
captured_at     timestamptz
views           bigint
likes           bigint
comments        bigint
shares          bigint
bookmarks       bigint
metrics         jsonb
```

### transformations

```text
id                  uuid PK
organization_id     uuid FK
article_version_id  uuid FK
destination_id      uuid nullable
kind                enum
provider            text nullable
input_hash          text
output_content      text
status              enum
approved_at         timestamptz nullable
created_at          timestamptz
```

### audit_logs

```text
id              uuid PK
organization_id uuid FK
actor_user_id   uuid nullable
action          text
entity_type     text
entity_id       uuid nullable
metadata        jsonb
created_at      timestamptz
```

## Important indexes

```text
memberships(user_id)
memberships(organization_id)

articles(organization_id, created_at DESC)
articles(organization_id, status)
articles(organization_id, slug)

article_versions(article_id, version_number DESC)

destinations(organization_id, status)
platform_connections(organization_id, provider)

publications(organization_id, status)
publications(article_id)
publications(destination_id)
publications(article_version_id)

publication_events(publication_id, created_at DESC)

schedules(organization_id, status, scheduled_at)

analytics_snapshots(publication_id, captured_at DESC)

audit_logs(organization_id, created_at DESC)
```

## Data rules

Use relational constraints for:

- foreign keys
- uniqueness
- required fields
- organization-scoped invariants

Use JSONB for provider-specific or flexible metadata, not core relational concepts.

## Migration strategy

- Forward-only migrations.
- Never rewrite applied production migrations.
- Keep migrations small and reviewable.
- Add indexes based on actual query needs.

## Future scaling

Potential future candidates for partitioning/archiving:

- publication_events
- analytics_snapshots
- analytics_raw_events
- audit_logs
