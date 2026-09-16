import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediumAdapter } from './medium.adapter';
import { platformAdapterRegistry } from '../registry';
import { PlatformError } from '../errors';
import type { CanonicalArticle, PlatformArticle } from '../contract';

describe('MediumAdapter', () => {
  const mockFetch = vi.fn();
  let adapter: MediumAdapter;

  const validCanonicalArticle: CanonicalArticle = {
    id: 'art-uuid-1',
    versionId: 'ver-uuid-1',
    title: 'Building Scalable Publishing Pipelines',
    excerpt: 'An architectural breakdown of asynchronous multi-channel publishing.',
    markdown: '# Hello Medium\n\nContent body goes here.',
    coverImage: {
      id: 'asset-1',
      url: 'https://example.com/cover.png',
    },
    tags: ['Architecture', 'TypeScript', 'Nodejs', 'Inngest', 'DevOps', 'BonusTag'],
    canonicalUrl: 'https://myblog.artxflow.com/posts/publishing-pipelines',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new MediumAdapter({
      baseUrl: 'https://api.medium.com/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    });
  });

  describe('Capabilities & Registry', () => {
    it('declares standard Medium capabilities', () => {
      const caps = adapter.getCapabilities();
      expect(caps).toEqual({
        create: true,
        update: false,
        delete: false,
        analytics: false,
        canonicalUrl: true,
        images: false,
        scheduling: false,
      });
    });

    it('is registered in platformAdapterRegistry for MEDIUM', () => {
      expect(platformAdapterRegistry.has('MEDIUM')).toBe(true);
      expect(platformAdapterRegistry.get('MEDIUM')).toBeDefined();
    });
  });

  describe('Transformation', () => {
    it('transforms canonical article and caps tags to 5 for Medium', async () => {
      const transformed = await adapter.transform(validCanonicalArticle);

      expect(transformed.title).toBe(validCanonicalArticle.title);
      expect(transformed.content).toBe(validCanonicalArticle.markdown);
      expect(transformed.description).toBe(validCanonicalArticle.excerpt);
      expect(transformed.canonicalUrl).toBe(validCanonicalArticle.canonicalUrl);
      expect(transformed.coverImageUrl).toBe('https://example.com/cover.png');
      expect(transformed.tags).toHaveLength(5);
      expect(transformed.tags).toEqual(['Architecture', 'TypeScript', 'Nodejs', 'Inngest', 'DevOps']);
      expect(transformed.metadata?.canonicalArticleId).toBe(validCanonicalArticle.id);
      expect(transformed.metadata?.versionId).toBe(validCanonicalArticle.versionId);
    });

    it('handles minimal article without tags, excerpt, or cover image', async () => {
      const minimalArticle: CanonicalArticle = {
        id: 'art-min',
        versionId: 'ver-min',
        title: 'Minimal Article',
        markdown: 'Short text',
        tags: [],
      };

      const transformed = await adapter.transform(minimalArticle);
      expect(transformed.tags).toEqual([]);
      expect(transformed.description).toBeUndefined();
      expect(transformed.coverImageUrl).toBeUndefined();
      expect(transformed.canonicalUrl).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('validates a valid article payload', async () => {
      const validArticle: PlatformArticle = {
        title: 'Solid Architecture',
        content: 'Article content here',
        tags: ['tech', 'architecture'],
      };

      const result = await adapter.validate(validArticle);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when title is empty', async () => {
      const invalidArticle: PlatformArticle = {
        title: '   ',
        content: 'Some text',
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('fails when title exceeds 100 characters', async () => {
      const invalidArticle: PlatformArticle = {
        title: 'A'.repeat(101),
        content: 'Some text',
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('fails when content is missing', async () => {
      const invalidArticle: PlatformArticle = {
        title: 'Valid Title',
        content: '',
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'content')).toBe(true);
    });

    it('fails when more than 5 tags are specified', async () => {
      const invalidArticle: PlatformArticle = {
        title: 'Valid Title',
        content: 'Valid content',
        tags: ['one', 'two', 'three', 'four', 'five', 'six'],
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'tags')).toBe(true);
    });
  });

  describe('Publishing', () => {
    it('publishes successfully when authorId is provided in destinationConfig', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'med-post-123',
            title: 'Building Scalable Publishing Pipelines',
            authorId: 'author-456',
            url: 'https://medium.com/@author/building-scalable-pipelines-med-post-123',
            publishStatus: 'public',
            publishedAt: 1690000000000,
          },
        }),
      });

      const result = await adapter.publish({
        publicationId: 'pub-1',
        article: {
          title: 'Building Scalable Publishing Pipelines',
          content: '# Pipelines',
          tags: ['tech'],
          canonicalUrl: 'https://canonical.com/pipelines',
        },
        credentials: { token: 'valid-medium-token' },
        destinationConfig: { authorId: 'author-456' },
      });

      expect(result.externalResourceId).toBe('med-post-123');
      expect(result.externalUrl).toContain('med-post-123');
      expect(result.metadata?.authorId).toBe('author-456');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.medium.com/v1/users/author-456/posts');
      expect(options.headers.Authorization).toBe('Bearer valid-medium-token');
    });

    it('resolves authorId via /me if not present in config', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              id: 'resolved-author-789',
              username: 'techwriter',
              name: 'Tech Writer',
              url: 'https://medium.com/@techwriter',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              id: 'med-post-999',
              title: 'Resolved Post',
              authorId: 'resolved-author-789',
              url: 'https://medium.com/@techwriter/resolved-post-999',
              publishStatus: 'public',
            },
          }),
        });

      const result = await adapter.publish({
        publicationId: 'pub-2',
        article: {
          title: 'Resolved Post',
          content: 'Hello World',
        },
        credentials: { token: 'valid-medium-token' },
      });

      expect(result.externalResourceId).toBe('med-post-999');
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch.mock.calls[0][0]).toBe('https://api.medium.com/v1/me');
      expect(mockFetch.mock.calls[1][0]).toBe(
        'https://api.medium.com/v1/users/resolved-author-789/posts',
      );
    });

    it('throws AUTHENTICATION_ERROR when token is missing', async () => {
      await expect(
        adapter.publish({
          publicationId: 'pub-3',
          article: { title: 'Title', content: 'Content' },
          credentials: {},
        }),
      ).rejects.toThrow(PlatformError);
    });

    it('throws UNSUPPORTED_OPERATION when update or delete is called', async () => {
      await expect(
        adapter.update({
          publicationId: 'pub-4',
          externalResourceId: 'post-1',
          article: { title: 'Updated', content: 'Updated' },
          credentials: { token: 'tok' },
        }),
      ).rejects.toMatchObject({
        code: 'UNSUPPORTED_OPERATION',
      });

      await expect(
        adapter.delete({
          publicationId: 'pub-4',
          externalResourceId: 'post-1',
          credentials: { token: 'tok' },
        }),
      ).rejects.toMatchObject({
        code: 'UNSUPPORTED_OPERATION',
      });
    });
  });

  describe('Error Classification', () => {
    it('classifies 401 as non-retryable AUTHENTICATION_ERROR', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Invalid token',
      });

      await expect(
        adapter.publish({
          publicationId: 'pub-err-1',
          article: { title: 'Title', content: 'Content' },
          credentials: { token: 'bad-token' },
          destinationConfig: { authorId: 'auth-1' },
        }),
      ).rejects.toMatchObject({
        code: 'AUTHENTICATION_ERROR',
        retryable: false,
        statusCode: 401,
      });
    });

    it('classifies 429 as retryable RATE_LIMITED', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      await expect(
        adapter.publish({
          publicationId: 'pub-err-2',
          article: { title: 'Title', content: 'Content' },
          credentials: { token: 'valid-token' },
          destinationConfig: { authorId: 'auth-1' },
        }),
      ).rejects.toMatchObject({
        code: 'RATE_LIMITED',
        retryable: true,
        statusCode: 429,
      });
    });

    it('classifies 500 as retryable PROVIDER_5XX', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(
        adapter.publish({
          publicationId: 'pub-err-3',
          article: { title: 'Title', content: 'Content' },
          credentials: { token: 'valid-token' },
          destinationConfig: { authorId: 'auth-1' },
        }),
      ).rejects.toMatchObject({
        code: 'PROVIDER_5XX',
        retryable: true,
        statusCode: 500,
      });
    });

    it('classifies timeout on publish as UNKNOWN_OUTCOME', async () => {
      const timeoutError = new Error('The operation was aborted due to timeout');
      timeoutError.name = 'TimeoutError';
      mockFetch.mockRejectedValueOnce(timeoutError);

      await expect(
        adapter.publish({
          publicationId: 'pub-err-4',
          article: { title: 'Title', content: 'Content' },
          credentials: { token: 'valid-token' },
          destinationConfig: { authorId: 'auth-1' },
        }),
      ).rejects.toMatchObject({
        code: 'UNKNOWN_OUTCOME',
        retryable: false,
      });
    });
  });

  describe('verifyCredentials', () => {
    it('successfully retrieves user profile via /me', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'usr-medium-99',
            username: 'alice',
            name: 'Alice Developer',
            imageUrl: 'https://cdn-images-1.medium.com/avatar.jpg',
            url: 'https://medium.com/@alice',
          },
        }),
      });

      const profile = await adapter.verifyCredentials('valid-token');
      expect(profile).toEqual({
        externalId: 'usr-medium-99',
        username: 'alice',
        displayName: 'Alice Developer',
        avatarUrl: 'https://cdn-images-1.medium.com/avatar.jpg',
        url: 'https://medium.com/@alice',
      });
    });
  });
});
