import { describe, it, expect } from 'vitest';
import {
  parseJsonBody,
  createArticleSchema,
  updateArticleSchema,
  createApiKeySchema,
  updateEmailSchema,
  updateProfileSchema,
  recordExternalPublicationSchema,
  LIMITS,
} from './validation';
import { checkRateLimit } from './rate-limit';

describe('parseJsonBody', () => {
  it('returns 400 for malformed JSON', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      body: 'not-json{{{',
    });
    const result = await parseJsonBody(req, createArticleSchema);
    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(400);
    const json = await result.error?.json();
    expect(json.error).toBe('Request body must be valid JSON');
  });

  it('returns 400 with issue details for schema violations', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ title: '' }),
    });
    const result = await parseJsonBody(req, createArticleSchema);
    expect(result.error?.status).toBe(400);
    const json = await result.error?.json();
    expect(json.error).toBe('Validation failed');
    expect(json.details.length).toBeGreaterThan(0);
  });

  it('returns parsed data for valid input', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ title: 'Hello', content: '# World' }),
    });
    const result = await parseJsonBody(req, createArticleSchema);
    expect(result.error).toBeUndefined();
    expect(result.data?.title).toBe('Hello');
    expect(result.data?.content).toBe('# World');
  });
});

describe('article schemas', () => {
  it('rejects titles exceeding the length limit', () => {
    const result = createArticleSchema.safeParse({ title: 'x'.repeat(LIMITS.title + 1) });
    expect(result.success).toBe(false);
  });

  it('rejects content exceeding the size limit', () => {
    const result = createArticleSchema.safeParse({
      title: 'T',
      content: 'x'.repeat(LIMITS.content + 1),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slugs', () => {
    expect(createArticleSchema.safeParse({ title: 'T', slug: 'Invalid Slug!' }).success).toBe(
      false,
    );
    expect(createArticleSchema.safeParse({ title: 'T', slug: 'valid-slug-1' }).success).toBe(true);
  });

  it('rejects metadata objects with too many keys', () => {
    const metadata: Record<string, string> = {};
    for (let i = 0; i <= LIMITS.recordKeys; i++) metadata[`k${i}`] = 'v';
    expect(createArticleSchema.safeParse({ title: 'T', metadata }).success).toBe(false);
  });

  it('rejects invalid status values on update', () => {
    expect(updateArticleSchema.safeParse({ status: 'PUBLISHED' }).success).toBe(false);
    expect(updateArticleSchema.safeParse({ status: 'DRAFT' }).success).toBe(true);
  });
});

describe('createApiKeySchema', () => {
  it('rejects scopes outside the apiKeyScopes enum', () => {
    const result = createApiKeySchema.safeParse({
      name: 'CI key',
      scopes: ['articles:read', 'admin:everything'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty scopes array', () => {
    expect(createApiKeySchema.safeParse({ name: 'CI key', scopes: [] }).success).toBe(false);
  });

  it('accepts valid scopes', () => {
    const result = createApiKeySchema.safeParse({
      name: 'CI key',
      scopes: ['articles:read', 'profile:read'],
    });
    expect(result.success).toBe(true);
  });
});

describe('profile & email schemas', () => {
  it('rejects bios over 240 characters with the legacy message', () => {
    const result = updateProfileSchema.safeParse({ bio: 'x'.repeat(241) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Author bio must not exceed 240 characters.');
    }
  });

  it('rejects invalid canonical URLs', () => {
    expect(updateProfileSchema.safeParse({ canonicalUrl: 'not-a-url' }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ canonicalUrl: 'https://blog.dev' }).success).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(updateEmailSchema.safeParse({ email: 'nope' }).success).toBe(false);
    expect(updateEmailSchema.safeParse({ email: 'a@b.co' }).success).toBe(true);
  });
});

describe('recordExternalPublicationSchema', () => {
  it('requires externalUrl', () => {
    const result = recordExternalPublicationSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('externalUrl is required');
    }
  });
});

describe('checkRateLimit (in-memory fallback)', () => {
  it('allows requests under the limit and blocks after', async () => {
    const key = `test:${Date.now()}:${Math.random()}`;
    const limit = 3;

    for (let i = 0; i < limit; i++) {
      const result = await checkRateLimit(key, limit, 60_000);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(limit - 1 - i);
    }

    const blocked = await checkRateLimit(key, limit, 60_000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('tracks identifiers independently', async () => {
    const keyA = `a:${Date.now()}:${Math.random()}`;
    const keyB = `b:${Date.now()}:${Math.random()}`;

    await checkRateLimit(keyA, 1, 60_000);
    expect((await checkRateLimit(keyA, 1, 60_000)).success).toBe(false);
    expect((await checkRateLimit(keyB, 1, 60_000)).success).toBe(true);
  });

  it('resets after the window expires', async () => {
    const key = `reset:${Date.now()}:${Math.random()}`;
    await checkRateLimit(key, 1, 1); // 1ms window
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect((await checkRateLimit(key, 1, 60_000)).success).toBe(true);
  });
});
