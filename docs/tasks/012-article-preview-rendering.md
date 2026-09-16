# TASK-012 — Implement Canonical Article Rendering

## Objective

Create a secure canonical Markdown renderer shared by editor preview and future public blog pages.

## Read first

- `AGENTS.md`
- `docs/architecture/05-security.md`
- `docs/implementation/09-frontend-architecture.md`

## Requirements

- Render Markdown safely.
- Sanitize unsafe HTML.
- Do not evaluate arbitrary MDX/code.
- Support headings, paragraphs, lists, links, code blocks, images.
- Use ArtXFlow typography/design tokens.

## Acceptance criteria

- [x] Preview renders canonical Markdown.
- [x] Unsafe HTML/script content is not executed.
- [x] Code blocks are readable.
- [x] Renderer has unit/security tests.
