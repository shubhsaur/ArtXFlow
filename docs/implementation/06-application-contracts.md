# ArtXFlow — Application Contracts

## Responsibility

Application services orchestrate business operations.

```text
UI/API
 ↓
Application Service
 ↓
Domain
 ↓
Repository / infrastructure
```

## Command context

```ts
type CommandContext = {
  userId: string;
  organizationId: string;
  correlationId: string;
};
```

Organization access must be verified server-side.

## CreateArticle

Input:

```ts
{
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  contentFormat: "MARKDOWN";
  coverAssetId?: string;
}
```

Requirements:

- authorize organization
- validate title/content
- generate or validate unique slug
- create article + initial version transactionally

Returns:

```ts
{
  articleId: string;
  versionId: string;
}
```

## UpdateArticle

Creates a new immutable version when publish-relevant canonical content changes.

## PublishArticle

Input:

```ts
{
  articleId: string;
  destinationIds: string[];
}
```

Flow:

```text
authorize
 ↓
load article
 ↓
validate publishable state
 ↓
resolve version
 ↓
validate destinations
 ↓
create publication records
 ↓
create workflow record
 ↓
enqueue distribution
```

Returns distribution/publication identifiers.

## ScheduleArticle

Input:

```ts
{
  articleId: string;
  destinationIds: string[];
  scheduledAt: string;
  timezone: string;
}
```

The article version is captured at scheduling time and execution time state is revalidated.

## RetryPublication

Only failed/retryable publications may be manually retried.

## CreateDestination

Must verify referenced site/connection belongs to the same organization.

## CreatePlatformConnection

Provider authorization must complete server-side.

On success:

- verify provider response
- store safe account metadata
- encrypt credentials
- never return raw credentials

## Query DTOs

Never return raw database rows as API contracts.

Use explicit DTOs.

## Error codes

```text
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
CONFLICT
INVALID_STATE
RATE_LIMITED
PROVIDER_ERROR
TRANSIENT_PROVIDER_ERROR
UNKNOWN_OUTCOME
INTERNAL_ERROR
```

## Events

Documented application events include:

```text
ArticleCreated
ArticleVersionCreated
DistributionRequested
PublicationRetryRequested
ScheduleCreated
ConnectionInvalidated
```

Event payloads should prefer IDs over full entities.

## Idempotency

Commands with external side effects must have stable idempotency behavior.
