import { describe, it, expect } from 'vitest';
import {
  applyInlineFormatting,
  applyHeading,
  applyBlockquote,
  applyList,
  applyCodeBlock,
  applyLink,
  applyDivider,
  applyTable,
  calculateReadingStats,
  checkPublisherReadiness,
} from './formatting-helpers';

describe('Editor Formatting Helpers', () => {
  describe('applyInlineFormatting', () => {
    it('wraps selected text with bold formatting', () => {
      const content = 'Hello world today';
      const res = applyInlineFormatting(content, 6, 11, '**');
      expect(res.newContent).toBe('Hello **world** today');
      expect(res.newSelectionStart).toBe(8);
      expect(res.newSelectionEnd).toBe(13);
    });

    it('unwraps / toggles off when already formatted', () => {
      const content = 'Hello **world** today';
      const res = applyInlineFormatting(content, 8, 13, '**');
      expect(res.newContent).toBe('Hello world today');
      expect(res.newSelectionStart).toBe(6);
      expect(res.newSelectionEnd).toBe(11);
    });

    it('inserts placeholder when nothing is selected', () => {
      const content = 'Hello ';
      const res = applyInlineFormatting(content, 6, 6, '**', '**', 'bold text');
      expect(res.newContent).toBe('Hello **bold text**');
      expect(res.newSelectionStart).toBe(8);
      expect(res.newSelectionEnd).toBe(17);
    });
  });

  describe('applyHeading', () => {
    it('applies H1 to current line', () => {
      const content = 'Introduction\nBody paragraph';
      const res = applyHeading(content, 5, 1);
      expect(res.newContent).toBe('# Introduction\nBody paragraph');
    });

    it('changes existing H1 to H2', () => {
      const content = '# Introduction\nBody paragraph';
      const res = applyHeading(content, 5, 2);
      expect(res.newContent).toBe('## Introduction\nBody paragraph');
    });

    it('removes heading (level 0)', () => {
      const content = '### Subtitle\nBody paragraph';
      const res = applyHeading(content, 5, 0);
      expect(res.newContent).toBe('Subtitle\nBody paragraph');
    });
  });

  describe('applyBlockquote', () => {
    it('quotes selected lines', () => {
      const content = 'Quote line 1\nQuote line 2';
      const res = applyBlockquote(content, 0, content.length);
      expect(res.newContent).toBe('> Quote line 1\n> Quote line 2');
    });

    it('unquotes when already quoted', () => {
      const content = '> Quoted line';
      const res = applyBlockquote(content, 0, content.length);
      expect(res.newContent).toBe('Quoted line');
    });
  });

  describe('applyList', () => {
    it('creates bullet list from selected lines', () => {
      const content = 'First\nSecond';
      const res = applyList(content, 0, content.length, 'bullet');
      expect(res.newContent).toBe('- First\n- Second');
    });

    it('creates numbered list from selected lines', () => {
      const content = 'First\nSecond';
      const res = applyList(content, 0, content.length, 'number');
      expect(res.newContent).toBe('1. First\n2. Second');
    });
  });

  describe('applyCodeBlock', () => {
    it('wraps code with language tag', () => {
      const content = 'const x = 42;';
      const res = applyCodeBlock(content, 0, content.length, 'typescript');
      expect(res.newContent).toContain('```typescript\nconst x = 42;\n```');
    });
  });

  describe('applyLink', () => {
    it('inserts markdown hyperlink with title', () => {
      const content = 'Check out ArtXFlow here';
      const res = applyLink(content, 10, 18, 'https://artxflow.com');
      expect(res.newContent).toBe('Check out [ArtXFlow](https://artxflow.com) here');
    });
  });

  describe('applyDivider & applyTable', () => {
    it('inserts line divider', () => {
      const res = applyDivider('Hello world', 5);
      expect(res.newContent).toContain('---');
    });

    it('inserts table skeleton', () => {
      const res = applyTable('Start\n', 6);
      expect(res.newContent).toContain('| Header 1 | Header 2 | Header 3 |');
    });
  });

  describe('calculateReadingStats', () => {
    it('calculates words and estimated reading minutes correctly', () => {
      const text = 'This is an article with six words.';
      const stats = calculateReadingStats(text);
      expect(stats.words).toBe(7);
      expect(stats.readingTimeMinutes).toBe(1);
    });
  });

  describe('checkPublisherReadiness', () => {
    it('validates compliant article across all publishers', () => {
      const readiness = checkPublisherReadiness(
        'Building Distributed Next.js Applications',
        ['nextjs', 'react', 'webdev'],
        '# Introduction\nHere is the body of the article...',
        'https://cdn.example.com/cover.png',
      );
      expect(readiness.devto.ready).toBe(true);
      expect(readiness.medium.ready).toBe(true);
      expect(readiness.hashnode.ready).toBe(true);
    });

    it('flags DEV.to when tag limit exceeds 4', () => {
      const readiness = checkPublisherReadiness(
        'Title',
        ['one', 'two', 'three', 'four', 'five'],
        'Content',
      );
      expect(readiness.devto.ready).toBe(false);
      expect(readiness.devto.issues).toContain('Exceeds 4 tags limit (max 4)');
    });
  });
});
