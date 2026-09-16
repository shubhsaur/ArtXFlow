# ArtXFlow — Authentication & Authorization

## Authentication

Initial providers:

- Google
- GitHub
- Email/password

Use Better Auth through `@artxflow/auth`.

## Identity model

```text
User
  ↓
Membership
  ↓
Organization
```

Every new user receives a personal organization.

## Bootstrap flow

```text
Authenticate
 ↓
Find/create User
 ↓
Find/create personal Organization
 ↓
Create OWNER Membership
 ↓
Create session
 ↓
Dashboard
```

The bootstrap operation must be idempotent and transactional.

## Session helpers

Expose server-side helpers such as:

```text
getCurrentUser()
requireUser()
requireOrganization()
requireMembership()
```

Do not spread auth-library session internals through feature modules.

## Authorization

Every protected operation verifies:

```text
authenticated user
 ↓
organization membership
 ↓
role/permission
 ↓
resource ownership
 ↓
operation
```

Initial roles:

```text
OWNER
MEMBER
```

Potential permissions:

```text
articles.read
articles.write
articles.publish
destinations.manage
connections.manage
organization.manage
analytics.read
```

## Client/server boundary

Safe client data:

```text
display name
avatar
organization name
safe connection metadata
```

Never send:

```text
access token
refresh token
client secret
encryption key
authorization code
```

## Email/password

Passwords must be managed and hashed by Better Auth. Never store plaintext passwords.

Use generic authentication failure messages to reduce account enumeration.

## Testing

Cover:

- new user bootstrap
- repeat login
- personal organization uniqueness
- owner membership
- wrong-organization access
- insufficient-role access
- logout/session invalidation
