# ArtXFlow — Security Architecture

## Goals

ArtXFlow is a multi-tenant application that handles third-party publishing credentials.

Primary concerns:

- tenant isolation
- authentication
- authorization
- secret protection
- safe external integrations
- background workflow security
- auditability

## Threat model

```text
Cross-tenant data access
Credential theft
OAuth abuse
Forged webhooks
Duplicate publishing
SSRF
XSS
Sensitive logs
Dependency vulnerabilities
Compromised scheduled jobs
```

## Authentication

Initial methods:

- Google
- GitHub
- Email/password

Authentication belongs to a dedicated auth layer.

## Authorization

Every protected operation should follow:

```text
Authenticated user
       ↓
Organization membership
       ↓
Role/permission check
       ↓
Organization/resource check
       ↓
Operation
```

Resource IDs alone are never sufficient authorization.

## Tenant isolation

Prefer APIs that require tenant context:

```ts
getArticle({
  organizationId,
  articleId,
});
```

Avoid ambiguous repository APIs where possible.

## Platform credentials

Credentials belong exclusively to:

```text
PlatformConnection
```

Never to articles or client-side state.

Secrets should be encrypted before persistence.

Raw credentials are never returned after creation.

## OAuth

Where supported:

```text
Browser
  ↓
Provider authorization
  ↓
Callback
  ↓
Server exchanges code
  ↓
Encrypt tokens
  ↓
Store connection
```

Use state and PKCE where appropriate.

## Token lifecycle

```text
CONNECTED
   ↓
EXPIRED
   ↓
REAUTH_REQUIRED
```

Auth failures should stop repeated retries and prompt reconnection.

## Scheduled jobs

Always revalidate state at execution time.

```text
Schedule created
      ↓
Time passes
      ↓
Workflow starts
      ↓
Re-check article + destination + connection
      ↓
Publish
```

## External requests

Outbound requests require:

- timeouts
- bounded retries
- safe serialization
- provider-aware rate limiting

Do not allow arbitrary user-controlled URLs to become server-side fetch targets.

## Webhooks

Where providers support webhooks:

- verify signatures
- validate timestamps/nonces
- make handlers idempotent
- allowlist accepted event types

## Article content

Public content may contain Markdown/HTML/links/images.

Sanitize untrusted HTML.

If MDX is supported, never evaluate arbitrary untrusted code.

## Rate limiting

Apply rate limits to:

- auth endpoints
- connection setup
- publishing commands
- AI generation
- public APIs
- webhook endpoints

## Secrets

Use environment/secret configuration for:

```text
DATABASE_URL
AUTH_SECRET
ENCRYPTION_KEY
INNGEST_SIGNING_KEY
PLATFORM_CLIENT_SECRETS
AI_PROVIDER_KEYS
```

Commit only placeholders in `.env.example`.

## Logging

Never log:

- passwords
- access tokens
- refresh tokens
- auth codes
- encryption keys
- sensitive cookies

Prefer structured identifiers:

```text
correlationId
organizationId
userId
articleId
publicationId
destinationId
workflowId
```

## Audit

Record sensitive business/security actions:

```text
CONNECTION_CREATED
CONNECTION_REVOKED
ROLE_CHANGED
ARTICLE_PUBLISHED
DESTINATION_CREATED
DESTINATION_DELETED
```

## Open-source security

Because ArtXFlow is public:

- never commit production credentials
- never commit production tenant data
- use clearly fake fixtures
- document secure local setup
- review changes for accidental secret leakage
