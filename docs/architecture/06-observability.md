# ArtXFlow — Observability

## Goal

Because publishing is asynchronous, we must be able to answer:

- What happened?
- Which organization?
- Which article/version?
- Which destination?
- Which workflow?
- Was the failure internal or provider-side?
- Is retrying safe?

## Three pillars

```text
Logs
Metrics
Traces
```

## Structured logging

Recommended fields:

```text
timestamp
level
environment
correlationId
organizationId
userId
articleId
articleVersionId
destinationId
publicationId
connectionId
workflowId
jobId
provider
event
durationMs
errorCode
```

Never log credentials or sensitive content.

## Correlation IDs

```text
Publish command
      ↓
correlationId
      ↓
Distribution workflow
      ↓
Destination jobs
      ↓
Provider calls
      ↓
Publication events
```

Correlation must survive asynchronous boundaries.

## Application metrics

```text
http_requests_total
http_request_duration_ms
http_errors_total
```

## Publishing metrics

```text
publication_attempts_total
publication_success_total
publication_failure_total
publication_retry_total
publication_duration_ms
publication_partial_success_total
```

Keep metric labels bounded:

```text
provider
operation
status
```

Do not label metrics with arbitrary article titles or URLs.

## Workflow metrics

```text
workflow_started
workflow_succeeded
workflow_failed
workflow_duration
workflow_retry_count
workflow_backlog
```

## Provider metrics

```text
api_requests
api_failures
rate_limits
auth_failures
timeouts
```

## Health checks

Separate:

### Liveness

Is the application running?

### Readiness

Can the application perform required work?

Optional external-provider outages should not automatically make the application unready.

## Error taxonomy

```text
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
VALIDATION_ERROR
RATE_LIMITED
NETWORK_ERROR
PROVIDER_5XX
TIMEOUT
NOT_FOUND
CONFLICT
UNSUPPORTED_OPERATION
INTERNAL_ERROR
```

This classification drives retry policy.

## Product-facing status

Users should see actionable state:

```text
4 successful
1 retrying
1 requires attention
```

Operational logs remain separate from business-facing status.

## Audit vs logs

### Audit log

What did the user/system do?

### Operational log

What happened while executing it?

They solve different problems.

## Tracing

Trace:

```text
Web request
 ↓
Application service
 ↓
Inngest workflow
 ↓
Adapter
 ↓
Provider HTTP request
```

Do not put secrets in trace attributes.

## Alerts

Initial alerts:

- publishing failure-rate spike
- repeated provider authentication failures
- workflow backlog
- database connectivity problems
- major API error-rate spike

## Error reporting

Use a free-tier-compatible error reporting provider where practical.

Capture:

- stack
- release
- environment
- correlation ID
- safe entity IDs

## Retention

```text
Audit logs         long-lived
Publication events long-lived
Operational logs   limited retention
Raw analytics      policy-driven
Metrics            provider-dependent
```

## Local development

Developers should be able to trace:

```text
correlationId
workflowId
publicationId
```

without requiring paid observability infrastructure.
