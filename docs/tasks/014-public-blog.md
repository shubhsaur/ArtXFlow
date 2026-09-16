# TASK-014 — Build ArtXFlow Public Blog

## Objective

Render published ArtXFlow articles on organization-owned public sites.

## Read first

- `AGENTS.md`
- `docs/architecture/02-domain-model.md`
- `docs/architecture/05-security.md`
- `docs/implementation/09-frontend-architecture.md`
- `docs/implementation/10-design-system-implementation.md`

## Scope

Implement:

```text
site resolution
article slug resolution
public article page
404 handling
basic SEO metadata
```

Initial public URL model:

```text
<site>.artxflow.com/<slug>
```

## Requirements

- Only published content is public.
- Drafts must never be exposed.
- Public rendering uses the canonical content representation.
- SEO title/description use article/site metadata.
- Add sitemap/RSS hooks where practical, but keep scope focused.

## Acceptance criteria

- [x] Published article is publicly accessible.
- [x] Draft is inaccessible.
- [x] Unknown slug returns 404.
- [x] Metadata is correct.
- [x] Responsive rendering works.

## Dependency

Requires TASK-013 and TASK-012.
