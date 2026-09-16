import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DevtoAdapter } from './devto.adapter';
import { platformAdapterRegistry } from '../registry';
import { PlatformError } from '../errors';
import type { CanonicalArticle, PlatformArticle } from '../contract';

describe('DevtoAdapter', () => {
  const mockFetch = vi.fn();
  let adapter: DevtoAdapter;

  const validCanonicalArticle: CanonicalArticle = {
    id: 'art-uuid-1',
    versionId: 'ver-uuid-1',
    title: 'Building Modern Developer Workflows',
    excerpt: 'An in-depth guide to headless content architecture.',
    markdown: '# Hello World\n\nThis is a test article.',
    coverImage: {
      id: 'asset-1',
      url: 'https://example.com/cover.png',
    },
    tags: ['TypeScript', 'Node.js', 'NextJS', 'DevOps', 'BonusTagToBeDropped'],
    canonicalUrl: 'https://myblog.artxflow.com/posts/modern-workflows',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new DevtoAdapter({
      baseUrl: 'https://dev.to/api',
      fetchFn: mockFetch as unknown as typeof fetch,
    });
  });

  describe('Capabilities & Registry', () => {
    it('declares standard DEV.to capabilities', () => {
      const caps = adapter.getCapabilities();
      expect(caps).toEqual({
        create: true,
        update: true,
        delete: true,
        analytics: true,
        canonicalUrl: true,
        images: true,
        scheduling: false,
      });
    });

    it('is registered in platformAdapterRegistry for DEVTO and devto', () => {
      expect(platformAdapterRegistry.has('DEVTO')).toBe(true);
      expect(platformAdapterRegistry.get('DEVTO')).toBeDefined();
      expect(platformAdapterRegistry.get('devto')).toBeDefined();
    });
  });

  describe('Transformation', () => {
    it('transforms canonical article and normalizes tags for DEV.to', async () => {
      const transformed = await adapter.transform(validCanonicalArticle);

      expect(transformed.title).toBe(validCanonicalArticle.title);
      expect(transformed.content).toBe(validCanonicalArticle.markdown);
      expect(transformed.description).toBe(validCanonicalArticle.excerpt);
      expect(transformed.canonicalUrl).toBe(validCanonicalArticle.canonicalUrl);
      expect(transformed.coverImageUrl).toBe('https://example.com/cover.png');

      // DEV.to accepts max 4 lowercase alphanumeric tags
      expect(transformed.tags).toEqual(['typescript', 'nodejs', 'nextjs', 'devops']);
      expect(transformed.tags).toHaveLength(4);
      expect(transformed.metadata?.canonicalArticleId).toBe(validCanonicalArticle.id);
      expect(transformed.metadata?.versionId).toBe(validCanonicalArticle.versionId);
    });

    it('handles article without tags, excerpt, or cover image', async () => {
      const minimalArticle: CanonicalArticle = {
        id: 'art-min',
        versionId: 'ver-min',
        title: 'Minimal Article',
        markdown: 'Just some text',
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
    it('validates a correct article successfully', async () => {
      const validArticle: PlatformArticle = {
        title: 'Valid Title',
        content: 'Valid Content',
        tags: ['webdev', 'typescript'],
      };

      const result = await adapter.validate(validArticle);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails validation on empty title', async () => {
      const invalidArticle: PlatformArticle = {
        title: '   ',
        content: 'Content',
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('fails validation on empty content', async () => {
      const invalidArticle: PlatformArticle = {
        title: 'Title',
        content: '',
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'content')).toBe(true);
    });

    it('fails validation if tags exceed 4', async () => {
      const invalidArticle: PlatformArticle = {
        title: 'Title',
        content: 'Content',
        tags: ['one', 'two', 'three', 'four', 'five'],
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'tags')).toBe(true);
    });

    it('fails validation if any tag exceeds 30 characters', async () => {
      const invalidArticle: PlatformArticle = {
        title: 'Title',
        content: 'Content',
        tags: ['a'.repeat(31)],
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'tags')).toBe(true);
    });
  });

  describe('Publishing', () => {
    it('throws AUTHENTICATION_ERROR if credentials are missing', async () => {
      await expect(
        adapter.publish({
          publicationId: 'pub-1',
          article: { title: 'Test', content: 'Body' },
        }),
      ).rejects.toThrow(PlatformError);

      await expect(
        adapter.publish({
          publicationId: 'pub-1',
          article: { title: 'Test', content: 'Body' },
          credentials: { apiKey: '' },
        }),
      ).rejects.toThrow(/DEV.to API key is required/);
    });

    it('publishes article to DEV.to and maps remote identity correctly', async () => {
      const devtoApiResponse = {
        id: 987654,
        title: 'Building Modern Developer Workflows',
        url: 'https://dev.to/alice/building-modern-developer-workflows-1234',
        published: true,
        published_at: '2026-09-13T16:00:00Z',
        slug: 'building-modern-developer-workflows-1234',
        path: '/alice/building-modern-developer-workflows-1234',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => devtoApiResponse,
      });

      const result = await adapter.publish({
        publicationId: 'pub-1',
        article: {
          title: 'Building Modern Developer Workflows',
          content: '# Markdown content',
          canonicalUrl: 'https://artxflow.com/posts/my-post',
          tags: ['typescript', 'devops'],
        },
        credentials: { apiKey: 'devto_valid_key_123' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dev.to/api/articles',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'api-key': 'devto_valid_key_123',
            'Content-Type': 'application/json',
          }),
        }),
      );

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.article.title).toBe('Building Modern Developer Workflows');
      expect(requestBody.article.canonical_url).toBe('https://artxflow.com/posts/my-post');
      expect(requestBody.article.tags).toEqual(['typescript', 'devops']);
      expect(requestBody.article.published).toBe(true);

      expect(result.externalResourceId).toBe('987654');
      expect(result.externalUrl).toBe(devtoApiResponse.url);
      expect(result.publishedAt).toBe(devtoApiResponse.published_at);
      expect(result.metadata?.devtoId).toBe(987654);
    });
  });

  describe('Error Mapping & Classifications', () => {
    it('maps 401/403 to non-retryable AUTHENTICATION_ERROR', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized: Invalid API Key',
      });

      try {
        await adapter.publish({
          publicationId: 'pub-1',
          article: { title: 'Test', content: 'Body' },
          credentials: { apiKey: 'bad_token' },
        });
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(PlatformError);
        const pErr = err as PlatformError;
        expect(pErr.code).toBe('AUTHENTICATION_ERROR');
        expect(pErr.retryable).toBe(false);
        expect(pErr.statusCode).toBe(401);
      }
    });

    it('maps 429 to retryable RATE_LIMITED failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded. Try again in 60s.',
      });

      try {
        await adapter.publish({
          publicationId: 'pub-1',
          article: { title: 'Test', content: 'Body' },
          credentials: { apiKey: 'key_123' },
        });
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(PlatformError);
        const pErr = err as PlatformError;
        expect(pErr.code).toBe('RATE_LIMITED');
        expect(pErr.retryable).toBe(true);
        expect(pErr.statusCode).toBe(429);
      }
    });

    it('maps 422 to non-retryable VALIDATION_ERROR', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'Tags must not contain special characters',
      });

      try {
        await adapter.publish({
          publicationId: 'pub-1',
          article: { title: 'Test', content: 'Body' },
          credentials: { apiKey: 'key_123' },
        });
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(PlatformError);
        const pErr = err as PlatformError;
        expect(pErr.code).toBe('VALIDATION_ERROR');
        expect(pErr.retryable).toBe(false);
        expect(pErr.statusCode).toBe(422);
      }
    });

    it('maps 404 to non-retryable NOT_FOUND error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Article not found',
      });

      try {
        await adapter.update({
          publicationId: 'pub-1',
          externalResourceId: '999999',
          article: { title: 'Test', content: 'Body' },
          credentials: { apiKey: 'key_123' },
        });
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(PlatformError);
        const pErr = err as PlatformError;
        expect(pErr.code).toBe('NOT_FOUND');
        expect(pErr.retryable).toBe(false);
      }
    });

    it('maps 500/503 to retryable PROVIDER_5XX error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => 'Service Unavailable',
      });

      try {
        await adapter.publish({
          publicationId: 'pub-1',
          article: { title: 'Test', content: 'Body' },
          credentials: { apiKey: 'key_123' },
        });
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(PlatformError);
        const pErr = err as PlatformError;
        expect(pErr.code).toBe('PROVIDER_5XX');
        expect(pErr.retryable).toBe(true);
        expect(pErr.statusCode).toBe(503);
      }
    });

    it('maps fetch network failure to retryable NETWORK_ERROR', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed: ECONNREFUSED'));

      try {
        await adapter.publish({
          publicationId: 'pub-1',
          article: { title: 'Test', content: 'Body' },
          credentials: { apiKey: 'key_123' },
        });
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(PlatformError);
        const pErr = err as PlatformError;
        expect(pErr.code).toBe('NETWORK_ERROR');
        expect(pErr.retryable).toBe(true);
      }
    });

    it('maps publish creation timeout to non-retryable UNKNOWN_OUTCOME', async () => {
      const timeoutErr = new Error('The operation was aborted due to timeout');
      timeoutErr.name = 'TimeoutError';
      mockFetch.mockRejectedValueOnce(timeoutErr);

      try {
        await adapter.publish({
          publicationId: 'pub-1',
          article: { title: 'Test', content: 'Body' },
          credentials: { apiKey: 'key_123' },
        });
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(PlatformError);
        const pErr = err as PlatformError;
        expect(pErr.code).toBe('UNKNOWN_OUTCOME');
        expect(pErr.retryable).toBe(false);
      }
    });

    it('maps 504 Gateway Timeout during publish to non-retryable UNKNOWN_OUTCOME', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 504,
        text: async () => 'Gateway Timeout',
      });

      try {
        await adapter.publish({
          publicationId: 'pub-1',
          article: { title: 'Test', content: 'Body' },
          credentials: { apiKey: 'key_123' },
        });
        expect.fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(PlatformError);
        const pErr = err as PlatformError;
        expect(pErr.code).toBe('UNKNOWN_OUTCOME');
        expect(pErr.retryable).toBe(false);
        expect(pErr.statusCode).toBe(504);
      }
    });
  });

  describe('Update, Delete & Metrics', () => {
    it('updates existing article on DEV.to', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 12345,
          url: 'https://dev.to/alice/updated-article-12345',
          published_at: '2026-09-13T17:00:00Z',
        }),
      });

      const result = await adapter.update({
        publicationId: 'pub-1',
        externalResourceId: '12345',
        article: { title: 'Updated Title', content: 'Updated Body' },
        credentials: { apiKey: 'key_123' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dev.to/api/articles/12345',
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(result.externalResourceId).toBe('12345');
      expect(result.externalUrl).toBe('https://dev.to/alice/updated-article-12345');
    });

    it('deletes (unpublishes) an article on DEV.to', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 12345, published: false }),
      });

      await adapter.delete({
        publicationId: 'pub-1',
        externalResourceId: '12345',
        credentials: { apiKey: 'key_123' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dev.to/api/articles/12345',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ article: { published: false } }),
        }),
      );
    });

    it('fetches remote engagement metrics from DEV.to', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 12345,
          page_views_count: 1420,
          public_reactions_count: 85,
          comments_count: 14,
          reading_time_minutes: 5,
        }),
      });

      const metrics = await adapter.fetchMetrics({
        publicationId: 'pub-1',
        externalResourceId: '12345',
        credentials: { apiKey: 'key_123' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dev.to/api/articles/12345',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(metrics.views).toBe(1420);
      expect(metrics.reactions).toBe(85);
      expect(metrics.comments).toBe(14);
      expect(metrics.reads).toBe(5);
      expect(metrics.capturedAt).toBeDefined();
    });
  });

  describe('verifyCredentials', () => {
    it('successfully retrieves user profile on valid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 4242,
          username: 'alice_dev',
          name: 'Alice Developer',
          summary: 'Software Engineer',
          profile_image: 'https://example.com/avatar.jpg',
        }),
      });

      const profile = await adapter.verifyCredentials('valid_api_key');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dev.to/api/users/me',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({ 'api-key': 'valid_api_key' }),
        }),
      );

      expect(profile).toEqual({
        externalId: '4242',
        username: 'alice_dev',
        displayName: 'Alice Developer',
        avatarUrl: 'https://example.com/avatar.jpg',
        metadata: {
          summary: 'Software Engineer',
        },
      });
    });

    it('rejects empty API key with AUTHENTICATION_ERROR', async () => {
      await expect(adapter.verifyCredentials('')).rejects.toThrow(PlatformError);
      await expect(adapter.verifyCredentials('   ')).rejects.toThrow(/API key cannot be empty/);
    });

    it('maps 401 to AUTHENTICATION_ERROR on credential verification failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(adapter.verifyCredentials('bad_key')).rejects.toThrow(
        /DEV.to authentication failed/,
      );
    });
  });
});
