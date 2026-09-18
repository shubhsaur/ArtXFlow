import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HashnodeAdapter } from './hashnode.adapter';
import { platformAdapterRegistry } from '../registry';
import type { CanonicalArticle, PlatformArticle } from '../contract';

describe('HashnodeAdapter', () => {
  const mockFetch = vi.fn();
  let adapter: HashnodeAdapter;

  const validCanonicalArticle: CanonicalArticle = {
    id: 'art-hash-1',
    versionId: 'ver-hash-1',
    title: 'Modern Distributed Systems with Event Sourcing',
    excerpt: 'Deep dive into event-driven headless publishing architectures.',
    markdown: '# Event Sourcing\n\nContent details here.',
    coverImage: {
      id: 'asset-hash-1',
      url: 'https://example.com/hashnode-cover.png',
    },
    tags: ['Architecture', 'Distributed-Systems', 'WebDev', 'TypeScript', 'Nodejs', 'DroppedTag'],
    canonicalUrl: 'https://myblog.artxflow.com/posts/distributed-systems',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new HashnodeAdapter({
      apiUrl: 'https://gql.hashnode.com',
      fetchFn: mockFetch as unknown as typeof fetch,
    });
  });

  describe('Capabilities & Registry', () => {
    it('declares standard Hashnode capabilities', () => {
      const caps = adapter.getCapabilities();
      expect(caps).toEqual({
        create: true,
        update: true,
        delete: false,
        analytics: true,
        canonicalUrl: true,
        images: true,
        scheduling: false,
      });
    });

    it('is registered in platformAdapterRegistry for HASHNODE', () => {
      expect(platformAdapterRegistry.has('HASHNODE')).toBe(true);
      expect(platformAdapterRegistry.get('HASHNODE')).toBeDefined();
    });
  });

  describe('Transformation', () => {
    it('transforms canonical article and sanitizes tags for Hashnode', async () => {
      const transformed = await adapter.transform(validCanonicalArticle);

      expect(transformed.title).toBe(validCanonicalArticle.title);
      expect(transformed.content).toBe(validCanonicalArticle.markdown);
      expect(transformed.description).toBe(validCanonicalArticle.excerpt);
      expect(transformed.canonicalUrl).toBe(validCanonicalArticle.canonicalUrl);
      expect(transformed.coverImageUrl).toBe('https://example.com/hashnode-cover.png');
      expect(transformed.tags).toHaveLength(5);
      expect(transformed.tags).toEqual([
        'architecture',
        'distributed-systems',
        'webdev',
        'typescript',
        'nodejs',
      ]);
      expect(transformed.metadata?.canonicalArticleId).toBe(validCanonicalArticle.id);
      expect(transformed.metadata?.versionId).toBe(validCanonicalArticle.versionId);
    });
  });

  describe('Validation', () => {
    it('validates a valid article payload', async () => {
      const validArticle: PlatformArticle = {
        title: 'Microservices in 2026',
        content: 'Article content goes here.',
        tags: ['cloud', 'microservices'],
      };

      const result = await adapter.validate(validArticle);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when title is empty', async () => {
      const invalidArticle: PlatformArticle = {
        title: '',
        content: 'Content here',
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('fails when title exceeds 250 characters', async () => {
      const invalidArticle: PlatformArticle = {
        title: 'T'.repeat(251),
        content: 'Content here',
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('fails when content is empty', async () => {
      const invalidArticle: PlatformArticle = {
        title: 'Title',
        content: '   ',
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'content')).toBe(true);
    });

    it('fails when more than 5 tags are provided', async () => {
      const invalidArticle: PlatformArticle = {
        title: 'Title',
        content: 'Content',
        tags: ['t1', 't2', 't3', 't4', 't5', 't6'],
      };

      const result = await adapter.validate(invalidArticle);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'tags')).toBe(true);
    });
  });

  describe('Publishing & Updating', () => {
    it('publishes successfully via Hashnode publishPost GraphQL mutation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: {
              publishPost: {
                post: {
                  id: 'hash-post-777',
                  slug: 'modern-distributed-systems',
                  url: 'https://blog.example.com/modern-distributed-systems',
                  publishedAt: '2026-09-17T00:00:00.000Z',
                },
              },
            },
          }),
      });

      const result = await adapter.publish({
        publicationId: 'pub-hash-1',
        article: {
          title: 'Modern Distributed Systems with Event Sourcing',
          content: '# Event Sourcing',
          tags: ['architecture'],
          canonicalUrl: 'https://canonical.com/posts/ds',
          coverImageUrl: 'https://example.com/cover.png',
        },
        credentials: { token: 'hashnode-token-123' },
        destinationConfig: { publicationId: 'pub-id-999' },
      });

      expect(result.externalResourceId).toBe('hash-post-777');
      expect(result.externalUrl).toBe('https://blog.example.com/modern-distributed-systems');
      expect(result.metadata?.slug).toBe('modern-distributed-systems');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.Authorization).toBe('Bearer hashnode-token-123');
      const body = JSON.parse(options.body);
      expect(body.variables.input.publicationId).toBe('pub-id-999');
      expect(body.variables.input.title).toBe('Modern Distributed Systems with Event Sourcing');
    });

    it('requires publicationId for publishing', async () => {
      await expect(
        adapter.publish({
          publicationId: 'pub-hash-2',
          article: { title: 'Title', content: 'Content' },
          credentials: { token: 'hashnode-token-123' },
          destinationConfig: {},
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        provider: 'HASHNODE',
      });
    });

    it('updates an existing post via updatePost mutation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: {
              updatePost: {
                post: {
                  id: 'hash-post-777',
                  slug: 'modern-distributed-systems-v2',
                  url: 'https://blog.example.com/modern-distributed-systems-v2',
                  publishedAt: '2026-09-17T00:00:00.000Z',
                },
              },
            },
          }),
      });

      const result = await adapter.update({
        publicationId: 'pub-hash-1',
        externalResourceId: 'hash-post-777',
        article: {
          title: 'Modern Distributed Systems with Event Sourcing v2',
          content: '# Event Sourcing v2',
        },
        credentials: { token: 'hashnode-token-123' },
      });

      expect(result.externalResourceId).toBe('hash-post-777');
      expect(result.externalUrl).toContain('v2');
      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.input.id).toBe('hash-post-777');
    });
  });

  describe('Metrics', () => {
    it('fetches engagement metrics via PostMetrics query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: {
              post: {
                id: 'hash-post-777',
                views: 1250,
                reactionCount: 88,
                responseCount: 14,
              },
            },
          }),
      });

      const metrics = await adapter.fetchMetrics({
        publicationId: 'pub-1',
        externalResourceId: 'hash-post-777',
        credentials: { token: 'hashnode-token' },
      });

      expect(metrics.views).toBe(1250);
      expect(metrics.reactions).toBe(88);
      expect(metrics.comments).toBe(14);
      expect(metrics.capturedAt).toBeDefined();
    });
  });

  describe('GraphQL Error Classification', () => {
    it('classifies UNAUTHENTICATED GraphQL error as AUTHENTICATION_ERROR', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            errors: [
              {
                message: 'You are not authorized to perform this action',
                extensions: { code: 'UNAUTHENTICATED' },
              },
            ],
          }),
      });

      await expect(
        adapter.publish({
          publicationId: 'pub-err-1',
          article: { title: 'T', content: 'C' },
          credentials: { token: 'invalid-token' },
          destinationConfig: { publicationId: 'pub-123' },
        }),
      ).rejects.toMatchObject({
        code: 'AUTHENTICATION_ERROR',
        retryable: false,
      });
    });

    it('classifies BAD_USER_INPUT as VALIDATION_ERROR', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            errors: [
              {
                message: 'Title is invalid',
                extensions: { code: 'BAD_USER_INPUT' },
              },
            ],
          }),
      });

      await expect(
        adapter.publish({
          publicationId: 'pub-err-2',
          article: { title: 'T', content: 'C' },
          credentials: { token: 'valid-token' },
          destinationConfig: { publicationId: 'pub-123' },
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        retryable: false,
      });
    });

    it('classifies HTTP 429 as RATE_LIMITED', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      await expect(
        adapter.publish({
          publicationId: 'pub-err-3',
          article: { title: 'T', content: 'C' },
          credentials: { token: 'valid-token' },
          destinationConfig: { publicationId: 'pub-123' },
        }),
      ).rejects.toMatchObject({
        code: 'RATE_LIMITED',
        retryable: true,
        statusCode: 429,
      });
    });
  });

  describe('verifyCredentials', () => {
    it('queries authenticated user profile and publications', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: {
              me: {
                id: 'hash-user-55',
                username: 'shubham',
                name: 'Shubham',
                profilePicture: 'https://cdn.hashnode.com/user.jpg',
                publications: {
                  edges: [
                    {
                      node: {
                        id: 'pub-hash-99',
                        title: 'My Engineering Blog',
                        url: 'https://shubham.hashnode.dev',
                      },
                    },
                  ],
                },
              },
            },
          }),
      });

      const profile = await adapter.verifyCredentials('hashnode-token-abc');
      expect(profile.externalId).toBe('hash-user-55');
      expect(profile.username).toBe('shubham');
      expect(profile.publications).toHaveLength(1);
      expect(profile.publications[0].id).toBe('pub-hash-99');
    });
  });
});
