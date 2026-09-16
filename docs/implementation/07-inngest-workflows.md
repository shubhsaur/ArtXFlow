# ArtXFlow — Inngest Workflow Specification

## Role

Inngest handles asynchronous execution for:

- publishing
- scheduling
- retries
- multi-destination fan-out
- analytics synchronization
- future AI/background transformations

## Boundary

Only workflow infrastructure should depend directly on the Inngest SDK.

Core code uses an ArtXFlow workflow abstraction.

## Event names

```text
artxflow/distribution.requested
artxflow/publication.requested
artxflow/publication.retry_requested
artxflow/schedule.created
artxflow/analytics.sync_requested
artxflow/transformation.requested
```

## Payload rule

Keep events small and pass IDs:

```ts
{
  distributionId: string;
  organizationId: string;
  correlationId: string;
}
```

Do not embed large article payloads.

## Distribution workflow

```text
distribution.requested
 ↓
load current distribution
 ↓
validate state
 ↓
fan out destination publication workflows
 ↓
track aggregate completion
```

## Destination workflow

```text
publication.requested
 ↓
load publication
 ↓
check idempotency/state
 ↓
load article version
 ↓
load destination
 ↓
load connection
 ↓
transform
 ↓
validate
 ↓
adapter.publish()
 ↓
persist result
 ↓
publication event
```

## Scheduled workflow

At execution time revalidate:

```text
article/version
destination
connection
schedule state
```

Canceled schedules must not publish.

## Retry

Retry transient:

```text
network failure
timeout
429
provider 5xx
temporary infrastructure failure
```

Do not retry indefinitely:

```text
invalid credentials
invalid payload
permission denied
unsupported operation
```

Use bounded retries and provider-aware backoff.

## Concurrency

Control concurrency by provider/account when rate limits require it.

Do not blindly fan out unlimited jobs.

## Unknown outcome

A timeout can mean the provider created the resource but the response was lost.

Represent:

```text
UNKNOWN_OUTCOME
```

and resolve through provider lookup where supported before creating another resource.

## Cancellation

Support cancellation of queued/scheduled internal work.

Once an external provider call begins, cancellation may not undo that remote operation.

## Implementation location

```text
apps/worker/
└── inngest/
    ├── client.ts
    ├── events.ts
    └── functions/
        ├── distribution.ts
        ├── publication.ts
        ├── scheduling.ts
        └── analytics.ts
```

## Tests

Cover:

- happy path
- transient retry
- permanent failure
- partial success
- duplicate execution
- canceled schedule
- invalid connection
- unknown provider outcome
