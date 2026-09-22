import type { CanonicalArticle } from '../contract';

/**
 * Standard Multi-Publisher Markdown Fixture.
 * Contains all 18 observed features to verify platform compatibility:
 * 1. YAML frontmatter
 * 2. Headings (H1 - H3)
 * 3. Bold, Italic, Strikethrough
 * 4. Blockquotes (single & multiline)
 * 5. Unordered & Ordered lists
 * 6. Inline code
 * 7. Fenced code blocks with language identifiers and aliases (ts, py, bash)
 * 8. Fenced code blocks without language identifiers
 * 9. Markdown Tables (multi-column with alignments)
 * 10. External image URLs (Unsplash) with alt text and title
 * 11. Horizontal rule (---)
 * 12. Links (inline and reference)
 * 13. Task lists
 * 14. Emojis and Unicode
 */
export const STANDARD_MARKDOWN_FIXTURE = `---
title: Cross-Platform Publishing with ArtXFlow
author: ArtXFlow Engineering
tags: architecture, devops, multiplatform
---

# Cross-Platform Publishing with ArtXFlow

This article benchmarks Markdown compatibility across **Medium**, **DEV.to**, and **Hashnode**.

## Typography & Formatting
We support *italic text*, **bold text**, and \`inline code snippets\`.

> Multi-destination publishing requires strict idempotency and canonical projection.
> External platforms are projections, not primary systems of record.

### Lists & Tasks
- [x] Test DEV.to fenced code blocks
- [x] Test Medium table transformation
- [ ] Schedule automated syndication

1. First create the article in ArtXFlow
2. Verify formatting projections per destination
3. Publish across all targets independently

Text directly preceding code fence without blank line:
\`\`\`ts
export function calculateLatency(startMs: number, endMs: number): number {
  return Math.max(0, endMs - startMs);
}
\`\`\`
Text directly following closing fence.

\`\`\`py
def generate_slug(title: str) -> str:
    return title.lower().replace(" ", "-")
\`\`\`

\`\`\`
raw unformatted text block
\`\`\`

## Feature Compatibility Matrix

| Feature | Medium | DEV.to | Hashnode | Current Status |
| :--- | :---: | :---: | :---: | ---: |
| Code Blocks | Monospace | Formatted | Native | Resolved |
| Tables | Transformed | Native | Native | Clean |
| External Images | Transformed | Native | Native | Preserved |
| Section Dividers | Three Dots | HR | HR | Intentional |

---

## Architectural Media

Here is an architectural diagram hosted on Unsplash:
![ArtXFlow Monorepo Architecture](https://images.unsplash.com/photo-1518770660439-4636190af475 "Architecture Topology")

For more documentation, visit [ArtXFlow Docs](https://docs.artxflow.com). 🚀 Complete! ✅
`;

export const STANDARD_CANONICAL_ARTICLE: CanonicalArticle = {
  id: 'art-compat-001',
  versionId: 'ver-compat-001',
  title: 'Cross-Platform Publishing with ArtXFlow',
  excerpt: 'A comprehensive benchmark of markdown compatibility across blogging platforms.',
  markdown: STANDARD_MARKDOWN_FIXTURE,
  canonicalUrl: 'https://artxflow.com/posts/cross-platform-publishing',
  coverImage: {
    id: 'asset-compat-001',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
  },
  tags: ['TypeScript', 'NodeJS', 'DevOps', 'Architecture', 'Publishing'],
};
