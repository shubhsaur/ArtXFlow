import { describe, it, expect } from 'vitest';
import { devtoAdapter } from '../adapters/devto.adapter';
import { mediumAdapter } from '../adapters/medium.adapter';
import { hashnodeAdapter } from '../adapters/hashnode.adapter';
import {
  STANDARD_CANONICAL_ARTICLE,
  STANDARD_MARKDOWN_FIXTURE,
} from './standard-article.fixture';
import { stripFrontmatter, extractFrontmatter } from '../transformers/frontmatter';
import { formatDevtoMarkdown, normalizeDevtoLanguage } from '../transformers/devto-formatter';
import { formatMediumMarkdown } from '../transformers/medium-formatter';

describe('Provider Compatibility Test Suite', () => {
  describe('Frontmatter Handling Across Adapters', () => {
    it('strips YAML frontmatter cleanly from markdown content', () => {
      const stripped = stripFrontmatter(STANDARD_MARKDOWN_FIXTURE);
      expect(stripped.startsWith('---')).toBe(false);
      expect(stripped).toContain('# Cross-Platform Publishing with ArtXFlow');
      expect(stripped).not.toContain('author: ArtXFlow Engineering');
    });

    it('extracts metadata and content accurately', () => {
      const { frontmatter, content } = extractFrontmatter(STANDARD_MARKDOWN_FIXTURE);
      expect(frontmatter.title).toBe('Cross-Platform Publishing with ArtXFlow');
      expect(frontmatter.author).toBe('ArtXFlow Engineering');
      expect(content).toContain('# Cross-Platform Publishing with ArtXFlow');
    });

    it('returns content as-is when no frontmatter exists', () => {
      const raw = '# Hello World\n\nNo frontmatter here.';
      expect(stripFrontmatter(raw)).toBe(raw);
    });
  });

  describe('Hashnode Provider: Preserve Markdown Strategy', () => {
    it('preserves full GFM Markdown structure while stripping frontmatter', async () => {
      const transformed = await hashnodeAdapter.transform(STANDARD_CANONICAL_ARTICLE);

      // 1. Frontmatter is stripped
      expect(transformed.content.startsWith('---')).toBe(false);

      // 2. Headings, formatting, and lists preserved
      expect(transformed.content).toContain('# Cross-Platform Publishing with ArtXFlow');
      expect(transformed.content).toContain('**Medium**');
      expect(transformed.content).toContain('*italic text*');
      expect(transformed.content).toContain('`inline code snippets`');
      expect(transformed.content).toContain('> Multi-destination publishing');
      expect(transformed.content).toContain('- [x] Test DEV.to fenced code blocks');

      // 3. Tables are preserved as native GFM tables (not transformed)
      expect(transformed.content).toContain('| Feature | Medium | DEV.to | Hashnode | Current Status |');
      expect(transformed.content).toContain('| :--- | :---: | :---: | :---: | ---: |');
      expect(transformed.content).toContain('| Code Blocks | Monospace | Formatted | Native | Resolved |');

      // 4. External Unsplash images are preserved as native Markdown images
      expect(transformed.content).toContain(
        '![ArtXFlow Monorepo Architecture](https://images.unsplash.com/photo-1518770660439-4636190af475 "Architecture Topology")',
      );

      // 5. Code blocks are preserved
      expect(transformed.content).toContain('```ts');
      expect(transformed.content).toContain('export function calculateLatency');

      // 6. Section divider preserved
      expect(transformed.content).toContain('---');

      // 7. Tags sanitized up to 5
      expect(transformed.tags).toEqual(['typescript', 'nodejs', 'devops', 'architecture', 'publishing']);
    });
  });

  describe('DEV.to Provider: Fix Code Blocks & Preserve Tables/Images', () => {
    it('normalizes fenced code blocks with mandatory blank lines and Rouge language identifiers', async () => {
      const transformed = await devtoAdapter.transform(STANDARD_CANONICAL_ARTICLE);

      // 1. Frontmatter is stripped
      expect(transformed.content.startsWith('---')).toBe(false);

      // 2. Fenced code blocks preceded by text have mandatory empty line before and after
      expect(transformed.content).toContain(
        'Text directly preceding code fence without blank line:\n\n```typescript\nexport function calculateLatency',
      );
      expect(transformed.content).toContain(
        '}\n```\n\nText directly following closing fence.',
      );

      // 3. Language aliases normalized (ts -> typescript, py -> python)
      expect(transformed.content).toContain('```typescript');
      expect(transformed.content).toContain('```python');

      // 4. Unspecified language code block preserved with proper fencing
      expect(transformed.content).toContain('```\nraw unformatted text block\n```');

      // 5. Crucial: Tables are PRESERVED as native Markdown tables (no unnecessary transformation)
      expect(transformed.content).toContain('| Feature | Medium | DEV.to | Hashnode | Current Status |');
      expect(transformed.content).toContain('| :--- | :---: | :---: | :---: | ---: |');
      expect(transformed.content).toContain('| Code Blocks | Monospace | Formatted | Native | Resolved |');

      // 6. Crucial: External Unsplash images are PRESERVED as native Markdown images
      expect(transformed.content).toContain(
        '![ArtXFlow Monorepo Architecture](https://images.unsplash.com/photo-1518770660439-4636190af475 "Architecture Topology")',
      );

      // 7. Headings, lists, inline code, and dividers preserved
      expect(transformed.content).toContain('# Cross-Platform Publishing with ArtXFlow');
      expect(transformed.content).toContain('`inline code snippets`');
      expect(transformed.content).toContain('---');

      // 8. DEV.to tags normalized to max 4 lowercase alphanumeric
      expect(transformed.tags).toEqual(['typescript', 'nodejs', 'devops', 'architecture']);
    });

    it('normalizes language identifiers correctly for Rouge highlighter', () => {
      expect(normalizeDevtoLanguage('ts')).toBe('typescript');
      expect(normalizeDevtoLanguage('js')).toBe('javascript');
      expect(normalizeDevtoLanguage('py')).toBe('python');
      expect(normalizeDevtoLanguage('sh')).toBe('bash');
      expect(normalizeDevtoLanguage('zsh')).toBe('bash');
      expect(normalizeDevtoLanguage('yml')).toBe('yaml');
      expect(normalizeDevtoLanguage('cs')).toBe('csharp');
      expect(normalizeDevtoLanguage('rust')).toBe('rust');
      expect(normalizeDevtoLanguage('   TS   ')).toBe('typescript');
    });

    it('handles Windows CRLF line endings without mangling fences', () => {
      const crlfInput = 'Some text\r\n```ts\r\nconst x = 1;\r\n```\r\nNext line';
      const output = formatDevtoMarkdown(crlfInput);
      expect(output).toContain('Some text\n\n```typescript\nconst x = 1;\n```\n\nNext line');
    });
  });

  describe('Medium Provider: Table Transformation & Image/Divider Handling', () => {
    it('transforms Markdown tables into aligned monospaced code blocks', async () => {
      const transformed = await mediumAdapter.transform(STANDARD_CANONICAL_ARTICLE);

      // 1. Frontmatter is stripped
      expect(transformed.content.startsWith('---')).toBe(false);

      // 2. Table is transformed into an aligned monospaced code block
      expect(transformed.content).toContain('```text\n| Feature');
      expect(transformed.content).toContain('| Code Blocks');
      expect(transformed.content).toContain('| Tables');

      // 3. Table columns are properly aligned within the code block
      expect(transformed.content).toMatch(/\| Feature\s+\|\s+Medium/);

      // 4. External Unsplash image has alt caption for attribution
      expect(transformed.content).toContain(
        '![ArtXFlow Monorepo Architecture](https://images.unsplash.com/photo-1518770660439-4636190af475)',
      );
      expect(transformed.content).toContain('*ArtXFlow Monorepo Architecture*');

      // 5. Divider (---) is preserved with clean spacing for Medium signature 3-dot rendering
      expect(transformed.content).toContain('\n\n---\n\n');

      // 6. Code blocks are preserved with clean boundaries
      expect(transformed.content).toContain('```ts');
      expect(transformed.content).toContain('export function calculateLatency');

      // 7. Medium tags sanitized up to 5, max 25 chars
      expect(transformed.tags).toEqual(['TypeScript', 'NodeJS', 'DevOps', 'Architecture', 'Publishing']);
    });

    it('formats multi-column tables with padding and alignments cleanly', () => {
      const markdownTable = `
| Command | Output | Status |
| :--- | :---: | ---: |
| pnpm test | 48 passed | Success |
| pnpm lint | 0 errors | OK |
`;
      const result = formatMediumMarkdown(markdownTable);
      expect(result).toContain('```text');
      expect(result).toContain('| Command   |  Output   |  Status |');
      expect(result).toContain('| --------- | :-------: | ------: |');
      expect(result).toContain('| pnpm test | 48 passed | Success |');
      expect(result).toContain('```');
    });
  });
});
