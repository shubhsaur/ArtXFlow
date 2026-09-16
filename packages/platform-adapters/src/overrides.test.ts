import { describe, it, expect } from 'vitest';
import {
  applyDestinationOverrides,
  type CanonicalArticle,
  type DestinationOverrides,
} from './contract';

describe('applyDestinationOverrides', () => {
  const canonicalArticle: CanonicalArticle = {
    id: 'art-123',
    versionId: 'ver-456',
    title: 'Canonical Title',
    excerpt: 'Canonical excerpt describing the article',
    markdown: '# Canonical Header\n\nCanonical markdown content that must not be changed.',
    tags: ['webdev', 'typescript'],
    canonicalUrl: 'https://myblog.com/canonical-title',
    metadata: {
      series: 'Dev Series',
      originalAuthor: 'Alice',
    },
  };

  it('returns original canonical article when overrides are undefined or null', () => {
    const result1 = applyDestinationOverrides(canonicalArticle);
    expect(result1).toEqual(canonicalArticle);

    const result2 = applyDestinationOverrides(canonicalArticle, null);
    expect(result2).toEqual(canonicalArticle);
  });

  it('overrides title when non-empty string is provided', () => {
    const overrides: DestinationOverrides = {
      title: 'Dev.to Custom Title',
    };
    const result = applyDestinationOverrides(canonicalArticle, overrides);

    expect(result.title).toBe('Dev.to Custom Title');
    // Invariant: markdown content remains untouched
    expect(result.markdown).toBe(canonicalArticle.markdown);
  });

  it('trims whitespace and falls back to canonical title when override is blank', () => {
    const trimmedResult = applyDestinationOverrides(canonicalArticle, {
      title: '   Trimmed Title   ',
    });
    expect(trimmedResult.title).toBe('Trimmed Title');

    const blankResult = applyDestinationOverrides(canonicalArticle, {
      title: '     ',
    });
    expect(blankResult.title).toBe(canonicalArticle.title);
  });

  it('overrides excerpt/description when provided', () => {
    const overrides: DestinationOverrides = {
      description: 'Shortened description for social platforms',
    };
    const result = applyDestinationOverrides(canonicalArticle, overrides);

    expect(result.excerpt).toBe('Shortened description for social platforms');
    expect(result.markdown).toBe(canonicalArticle.markdown);
  });

  it('overrides tags when an array is provided and ignores non-array', () => {
    const overrides: DestinationOverrides = {
      tags: ['beginners', 'codenewbie', 'react'],
    };
    const result = applyDestinationOverrides(canonicalArticle, overrides);

    expect(result.tags).toEqual(['beginners', 'codenewbie', 'react']);

    const invalidOverride = {
      tags: 'not-an-array' as unknown as string[],
    };
    const fallbackResult = applyDestinationOverrides(canonicalArticle, invalidOverride);
    expect(fallbackResult.tags).toEqual(canonicalArticle.tags);
  });

  it('overrides canonicalUrl when provided', () => {
    const overrides: DestinationOverrides = {
      canonicalUrl: 'https://canonical.custom-domain.org/posts/my-post',
    };
    const result = applyDestinationOverrides(canonicalArticle, overrides);

    expect(result.canonicalUrl).toBe('https://canonical.custom-domain.org/posts/my-post');
  });

  it('merges providerMetadata into existing canonical metadata', () => {
    const overrides: DestinationOverrides = {
      providerMetadata: {
        devtoOrganizationId: 999,
        originalAuthor: 'Overridden Author',
      },
    };
    const result = applyDestinationOverrides(canonicalArticle, overrides);

    expect(result.metadata).toEqual({
      series: 'Dev Series',
      originalAuthor: 'Overridden Author',
      devtoOrganizationId: 999,
    });
  });

  it('preserves canonical content immutability under full override application', () => {
    const overrides: DestinationOverrides = {
      title: 'Full Overrides Title',
      description: 'Custom description',
      tags: ['overridden'],
      canonicalUrl: 'https://custom.org/post',
      providerMetadata: { customKey: 'val' },
    };
    const result = applyDestinationOverrides(canonicalArticle, overrides);

    expect(result.id).toBe(canonicalArticle.id);
    expect(result.versionId).toBe(canonicalArticle.versionId);
    expect(result.markdown).toBe(canonicalArticle.markdown);
  });
});
