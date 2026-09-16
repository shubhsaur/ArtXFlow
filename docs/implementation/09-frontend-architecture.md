# ArtXFlow — Frontend Architecture

## Application

`apps/web` uses Next.js App Router.

## Routes

### Public

```text
/
```

### Auth

```text
/login
/signup
/forgot-password
```

### Application

```text
/dashboard
/articles
/articles/new
/articles/[articleId]
/articles/[articleId]/settings
/publishing
/publishing/[publicationId]
/calendar
/analytics
/settings
/settings/profile
/settings/organization
/settings/connections
/settings/destinations
/settings/site
```

### Public sites

Initial shape:

```text
<site>.artxflow.com/<slug>
```

Custom domains follow later.

## Server/client

Default to Server Components.

Use Client Components only for interactive/browser-specific functionality such as:

- editor
- drag/drop
- client interaction state
- browser APIs
- some animation

Do not client-render an entire route because one child is interactive.

## Data fetching

Prefer:

```text
Server Component
 ↓
Application query
 ↓
Repository
```

Use client data fetching only where interaction requires it.

## Mutations

A mutation must:

1. authenticate
2. authorize organization
3. validate input
4. call application service
5. return safe DTO/result

## Editor

The editor is responsible for editing canonical content.

```text
Editor UI
 ↓
Canonical content
 ↓
Markdown serialization
 ↓
Article application service
```

Editor internal state must not become the database model.

## UI states

Data-heavy routes should define:

- loading/skeleton
- empty state
- error state
- success feedback

## Error boundaries

Isolate independent dashboard/widgets where practical.

## Feature structure

```text
features/
├── articles/
├── publishing/
├── scheduling/
├── analytics/
├── connections/
└── sites/
```

Routes compose feature components.

## API boundary

UI calls application use cases such as:

```text
publishArticle()
```

not provider APIs.

## Performance

Prioritize:

- server rendering
- code splitting
- optimized images
- minimal client JS
- lazy loading heavy editor functionality
- efficient queries

## Accessibility

Critical flows must be keyboard accessible with visible focus, semantic labels, and clear validation/error states.
