import { describe, it, expect, beforeEach } from 'vitest';
import {
  PlatformError,
  isRetryableErrorCode,
  PlatformAdapterRegistry,
  getPlatformAdapter,
  platformAdapterRegistry,
  type PlatformAdapter,
  type PlatformCapabilities,
  type CanonicalArticle,
  type PlatformArticle,
  type PublishInput,
  type PublishResult,
  type UpdateInput,
  type DeleteInput,
  type MetricsInput,
  type PlatformMetrics,
  type ValidationResult,
} from './index';

describe('Platform Adapter Contracts & Registry', () => {
  const mockCapabilities: PlatformCapabilities = {
    create: true,
    update: true,
    delete: false,
    analytics: true,
    canonicalUrl: true,
    images: true,
    scheduling: false,
  };

  class TestMockAdapter implements PlatformAdapter {
    readonly provider = 'TEST_PLATFORM';

    getCapabilities(): PlatformCapabilities {
      return mockCapabilities;
    }

    async validate(input: PlatformArticle): Promise<ValidationResult> {
      if (!input.title) {
        return {
          isValid: false,
          errors: [{ field: 'title', message: 'Title is required' }],
        };
      }
      return { isValid: true, errors: [] };
    }

    async transform(article: CanonicalArticle): Promise<PlatformArticle> {
      return {
        title: article.title,
        content: article.markdown,
        tags: article.tags,
        description: article.excerpt || undefined,
        canonicalUrl: article.canonicalUrl || undefined,
      };
    }

    async publish(input: PublishInput): Promise<PublishResult> {
      return {
        externalResourceId: 'ext-12345',
        externalUrl: `https://testplatform.com/posts/ext-12345`,
        publishedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
        metadata: { inputPubId: input.publicationId },
      };
    }

    async update(input: UpdateInput): Promise<PublishResult> {
      return {
        externalResourceId: input.externalResourceId,
        externalUrl: `https://testplatform.com/posts/${input.externalResourceId}`,
        publishedAt: new Date('2026-01-01T01:00:00Z').toISOString(),
      };
    }

    async delete(_input: DeleteInput): Promise<void> {
      // Mock deletion
    }

    async fetchMetrics(_input: MetricsInput): Promise<PlatformMetrics> {
      return {
        views: 120,
        reactions: 15,
        comments: 3,
        capturedAt: new Date('2026-01-02T00:00:00Z').toISOString(),
      };
    }
  }

  describe('Error Classification & Retryability', () => {
    it('identifies transient errors as retryable', () => {
      expect(isRetryableErrorCode('RATE_LIMITED')).toBe(true);
      expect(isRetryableErrorCode('NETWORK_ERROR')).toBe(true);
      expect(isRetryableErrorCode('PROVIDER_5XX')).toBe(true);
      expect(isRetryableErrorCode('TIMEOUT')).toBe(true);
    });

    it('identifies non-transient errors as not retryable', () => {
      expect(isRetryableErrorCode('AUTHENTICATION_ERROR')).toBe(false);
      expect(isRetryableErrorCode('AUTHORIZATION_ERROR')).toBe(false);
      expect(isRetryableErrorCode('VALIDATION_ERROR')).toBe(false);
      expect(isRetryableErrorCode('NOT_FOUND')).toBe(false);
      expect(isRetryableErrorCode('CONFLICT')).toBe(false);
      expect(isRetryableErrorCode('UNSUPPORTED_OPERATION')).toBe(false);
      expect(isRetryableErrorCode('UNKNOWN_OUTCOME')).toBe(false);
    });

    it('instantiates PlatformError with formatted message and attributes', () => {
      const error = new PlatformError({
        provider: 'DEVTO',
        code: 'RATE_LIMITED',
        message: 'Too many requests, try again in 30s',
        statusCode: 429,
        rawError: { retryAfter: 30 },
      });

      expect(error.name).toBe('PlatformError');
      expect(error.message).toBe('[DEVTO] RATE_LIMITED: Too many requests, try again in 30s');
      expect(error.provider).toBe('DEVTO');
      expect(error.code).toBe('RATE_LIMITED');
      expect(error.retryable).toBe(true);
      expect(error.statusCode).toBe(429);
      expect(error.rawError).toEqual({ retryAfter: 30 });
      expect(PlatformError.isPlatformError(error)).toBe(true);
      expect(PlatformError.isRetryable(error)).toBe(true);
    });

    it('allows overriding retryable flag on PlatformError', () => {
      const error = new PlatformError({
        provider: 'MEDIUM',
        code: 'NETWORK_ERROR',
        message: 'SSL handshake permanent mismatch',
        retryable: false,
      });

      expect(error.retryable).toBe(false);
      expect(PlatformError.isRetryable(error)).toBe(false);
    });
  });

  describe('PlatformAdapter Implementation Contract', () => {
    const adapter = new TestMockAdapter();

    it('returns explicit capabilities', () => {
      const caps = adapter.getCapabilities();
      expect(caps.create).toBe(true);
      expect(caps.update).toBe(true);
      expect(caps.delete).toBe(false);
      expect(caps.canonicalUrl).toBe(true);
    });

    it('transforms canonical article into platform article', async () => {
      const canonical: CanonicalArticle = {
        id: 'art-1',
        versionId: 'ver-1',
        title: 'Canonical Post',
        excerpt: 'Summary of post',
        markdown: '# Hello World\nThis is ArtXFlow.',
        tags: ['typescript', 'publishing'],
        canonicalUrl: 'https://blog.myorg.com/canonical-post',
      };

      const transformed = await adapter.transform(canonical);
      expect(transformed.title).toBe('Canonical Post');
      expect(transformed.content).toBe('# Hello World\nThis is ArtXFlow.');
      expect(transformed.description).toBe('Summary of post');
      expect(transformed.tags).toEqual(['typescript', 'publishing']);
      expect(transformed.canonicalUrl).toBe('https://blog.myorg.com/canonical-post');
    });

    it('validates platform article constraints', async () => {
      const valid = await adapter.validate({ title: 'Valid', content: 'Content' });
      expect(valid.isValid).toBe(true);
      expect(valid.errors).toHaveLength(0);

      const invalid = await adapter.validate({ title: '', content: 'Content' });
      expect(invalid.isValid).toBe(false);
      expect(invalid.errors[0]?.field).toBe('title');
    });

    it('publishes and returns external resource identifiers as strings', async () => {
      const result = await adapter.publish({
        publicationId: 'pub-1',
        article: { title: 'Test', content: 'Content' },
      });

      expect(result.externalResourceId).toBe('ext-12345');
      expect(typeof result.externalResourceId).toBe('string');
      expect(result.externalUrl).toBe('https://testplatform.com/posts/ext-12345');
      expect(typeof result.publishedAt).toBe('string');
    });

    it('fetches normalized engagement metrics', async () => {
      const metrics = await adapter.fetchMetrics({
        publicationId: 'pub-1',
        externalResourceId: 'ext-12345',
      });

      expect(metrics.views).toBe(120);
      expect(metrics.reactions).toBe(15);
      expect(metrics.comments).toBe(3);
      expect(typeof metrics.capturedAt).toBe('string');
    });
  });

  describe('PlatformAdapterRegistry', () => {
    let registry: PlatformAdapterRegistry;
    const adapter = new TestMockAdapter();

    beforeEach(() => {
      registry = new PlatformAdapterRegistry();
    });

    it('registers and retrieves adapters case-insensitively', () => {
      registry.register(adapter);

      expect(registry.has('TEST_PLATFORM')).toBe(true);
      expect(registry.has('test_platform')).toBe(true);
      expect(registry.get('TEST_PLATFORM')).toBe(adapter);
      expect(registry.get('test_platform')).toBe(adapter);
      expect(registry.listProviders()).toEqual(['TEST_PLATFORM']);
    });

    it('returns null for unregistered providers via get()', () => {
      expect(registry.get('UNKNOWN_PLATFORM')).toBeNull();
    });

    it('throws PlatformError with UNSUPPORTED_OPERATION via require()', () => {
      expect(() => registry.require('UNKNOWN_PLATFORM')).toThrow(PlatformError);
      try {
        registry.require('UNKNOWN_PLATFORM');
      } catch (err) {
        expect(PlatformError.isPlatformError(err)).toBe(true);
        if (PlatformError.isPlatformError(err)) {
          expect(err.code).toBe('UNSUPPORTED_OPERATION');
          expect(err.retryable).toBe(false);
        }
      }
    });

    it('integrates with top-level getPlatformAdapter helper', () => {
      platformAdapterRegistry.clear();
      platformAdapterRegistry.register(adapter);

      expect(getPlatformAdapter('test_platform')).toBe(adapter);
      platformAdapterRegistry.clear();
    });
  });
});
