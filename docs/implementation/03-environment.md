# ArtXFlow — Environment & Configuration

## Configuration boundary

All environment variables are parsed and validated centrally through `@artxflow/config`.

Application code should not scatter direct `process.env.*` access.

Prefer:

```ts
import { env } from '@artxflow/config/server';
```

## Files

```text
.env.example
.env.local
.env.test
```

Real environment files must never be committed.

## Server-only variables

Examples:

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
ENCRYPTION_KEY=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
DEVTO_CLIENT_SECRET=
MEDIUM_CLIENT_SECRET=
HASHNODE_CLIENT_SECRET=
AI_PROVIDER_KEY=
STORAGE_SECRET=
```

## Client-safe variables

Only variables explicitly intended for browser exposure may use a public prefix:

```env
NEXT_PUBLIC_APP_URL=
```

Never expose secrets using a public prefix.

## Provider connection secrets

Tenant-level provider credentials are runtime application data and must be encrypted before database persistence.

They do not belong in environment variables.

Environment secrets provide application-level encryption/configuration keys.

## Validation

Validate:

- presence
- URL format
- enum/provider values
- environment-specific requirements
- cryptographic key shape

Fail fast when required server configuration is missing.

## Development

Target:

```text
Next.js locally
Neon development database
Inngest development environment
local secrets
```

## Testing

Tests use isolated configuration and must never target production data.

## Secret rotation

```text
Identify compromise
 ↓
Revoke/rotate provider secret
 ↓
Update deployment secret
 ↓
Invalidate affected sessions/workflows where appropriate
 ↓
Audit
```
