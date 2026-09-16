# ArtXFlow — Publishing Architecture

## Purpose

The publishing system moves canonical ArtXFlow content to one or more destinations safely.

## Core model

```text
Canonical Article Version
           ↓
     Distribution Plan
           ↓
    Destination Jobs
       ┌───┼───┐
       ↓   ↓   ↓
     Blog DEV Medium
       ↓   ↓   ↓
     External APIs
```

## Principles

1. ArtXFlow owns canonical content.
2. Destinations are independent.
3. Platform behavior lives in adapters.
4. Publishing is asynchronous.
5. Publishing is idempotent.
6. Partial failure is first-class.
7. Every attempt is observable.
8. Retries must not blindly duplicate content.

## Platform adapter

Conceptual contract:

```ts
interface PlatformAdapter {
  validate(input: PlatformArticle): Promise<ValidationResult>;

  transform(article: CanonicalArticle): Promise<PlatformArticle>;

  publish(input: PublishInput): Promise<PublishResult>;

  update(input: UpdateInput): Promise<PublishResult>;

  delete(input: DeleteInput): Promise<void>;

  fetchMetrics(input: MetricsInput): Promise<PlatformMetrics>;
}
```

Adapters hide provider-specific APIs, authentication, limits, and content requirements.

## Immediate publishing

```text
User
 ↓
PublishArticle
 ↓
Validate
 ↓
Create Publications
 ↓
DistributionRequested
 ↓
Inngest
 ↓
Per-destination workflow
 ↓
Adapter
 ↓
Provider API
 ↓
Persist result
```

## Scheduled publishing

```text
User
 ↓
Create Schedule
 ↓
Persist schedule
 ↓
Inngest scheduled workflow
 ↓
Scheduled time
 ↓
Validate again
 ↓
Create/activate publication jobs
 ↓
Publish
```

## Inngest boundary

Core application code should talk to a workflow abstraction instead of importing Inngest everywhere.

```ts
await jobQueue.enqueue({
  type: 'PUBLISH_DESTINATION',
  publicationId,
});
```

The infrastructure implementation maps this to Inngest.

## Suggested workflows

### Distribution workflow

```text
DistributionRequested
    ↓
Load distribution
    ↓
Create destination tasks
    ↓
Fan out workflows
```

### Destination workflow

```text
DestinationPublishRequested
    ↓
Load publication
    ↓
Acquire execution guard
    ↓
Transform
    ↓
Validate
    ↓
Call adapter
    ↓
Persist outcome
    ↓
Emit event
```

## Idempotency

Recommended logical key:

```text
organizationId
+
articleVersionId
+
destinationId
```

Before creating a remote resource:

1. Load publication.
2. Check existing external resource ID.
3. Check previous completion.
4. Use provider idempotency support where available.
5. Persist remote identity safely.

## Retry strategy

Retry likely-transient failures:

- network failures
- timeouts
- 429
- provider 5xx

Do not blindly retry:

- invalid credentials
- invalid payload
- permission failures
- unsupported content

## Partial failure

```text
Blog       ✅
DEV.to     ✅
Medium     ❌ rate limited
Hashnode   ✅
```

Overall state:

```text
PARTIALLY_PUBLISHED
```

The user should be able to retry only the failed destination.

## Update flow

When canonical content changes:

```text
Edit Article
    ↓
New ArticleVersion
    ↓
Find relevant Publications
    ↓
Determine update capability
    ↓
Enqueue updates
    ↓
Platform adapters
```

## Platform capabilities

Adapters may declare:

```ts
interface PlatformCapabilities {
  create: boolean;
  update: boolean;
  delete: boolean;
  analytics: boolean;
  canonicalUrl: boolean;
  images: boolean;
}
```

## Transformation pipeline

```text
Canonical Article
       ↓
Normalize
       ↓
Platform transformer
       ↓
Optional AI transformer
       ↓
Validate
       ↓
Publish payload
```

AI is optional.

## Connection lifecycle

```text
DISCONNECTED
     ↓
AUTHORIZING
     ↓
CONNECTED
     ↓
EXPIRED
     ↓
REAUTH_REQUIRED
```

## Failure states

Distinguish:

- validation failure
- auth failure
- rate limit
- network failure
- provider rejection
- unknown remote outcome

An HTTP timeout does not prove that the remote publication failed.

## Security

Workers retrieve credentials through the connection service.

Credentials never appear in article payloads or client state.

## Provider implementation order

Recommended first integrations:

1. ArtXFlow Blog
2. DEV.to
3. Hashnode
4. Medium
