import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './[publicationId]/record-external/route';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { publicationService } from '@artxflow/publishing';
import { articleRepository } from '@artxflow/database';

import type * as DatabaseModule from '@artxflow/database';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@artxflow/auth', () => ({
  getSession: vi.fn(),
  bootstrapPersonalOrganization: vi.fn(),
}));

vi.mock('@artxflow/database', async (importOriginal) => {
  const actual = await importOriginal<typeof DatabaseModule>();
  return {
    ...actual,
    articleRepository: {
      ...actual.articleRepository,
      findArticleForOrganization: vi.fn(),
      update: vi.fn(),
    },
  };
});

describe('POST /api/articles/[articleId]/publications/[publicationId]/record-external', () => {
  const mockUser = {
    id: 'user-uuid-1',
    name: 'Alice Dev',
    email: 'alice@example.com',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrg = {
    id: 'org-uuid-1',
    name: "Alice's Org",
    slug: 'alice-org',
  };

  const articleId = 'article-uuid-1';
  const publicationId = 'pub-uuid-1';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      user: mockUser,
      session: {
        id: 'sess-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: mockUser.id,
        expiresAt: new Date(),
        token: 'token-1',
      },
    });
    vi.mocked(bootstrapPersonalOrganization).mockResolvedValue({
      organization: {
        ...mockOrg,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      membership: {
        id: 'mem-1',
        organizationId: mockOrg.id,
        userId: mockUser.id,
        role: 'OWNER',
        createdAt: new Date(),
      },
      created: false,
    });
  });

  it('returns 401 when unauthorized', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const req = new Request(
      `http://localhost/api/articles/${articleId}/publications/${publicationId}/record-external`,
      { method: 'POST', body: JSON.stringify({ externalUrl: 'https://test.com' }) },
    );
    const res = await POST(req, {
      params: Promise.resolve({ articleId, publicationId }),
    });

    expect(res.status).toBe(401);
  });

  it('returns 400 when externalUrl is missing', async () => {
    const req = new Request(
      `http://localhost/api/articles/${articleId}/publications/${publicationId}/record-external`,
      { method: 'POST', body: JSON.stringify({}) },
    );
    const res = await POST(req, {
      params: Promise.resolve({ articleId, publicationId }),
    });

    expect(res.status).toBe(400);
  });

  it('records publication successfully and updates article status (200 OK)', async () => {
    const mockUpdatedPub = {
      id: publicationId,
      organizationId: mockOrg.id,
      articleId,
      articleVersionId: 'ver-1',
      destinationId: 'dest-1',
      status: 'PUBLISHED' as const,
      externalResourceId: 'https://shubhsaur.hashnode.dev/post-1',
      externalUrl: 'https://shubhsaur.hashnode.dev/post-1',
      publishedAt: '2026-09-17T00:00:00.000Z',
      lastAttemptAt: null,
      attemptCount: 1,
      lastErrorCode: null,
      lastErrorMessage: null,
      overrides: {},
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    vi.spyOn(publicationService, 'updatePublicationStatus').mockResolvedValue(mockUpdatedPub);
    vi.mocked(articleRepository.findArticleForOrganization).mockResolvedValue({
      id: articleId,
      organizationId: mockOrg.id,
      authorId: mockUser.id,
      title: 'Post',
      slug: 'post',
      excerpt: null,
      status: 'DRAFT',
      coverAssetId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new Request(
      `http://localhost/api/articles/${articleId}/publications/${publicationId}/record-external`,
      {
        method: 'POST',
        body: JSON.stringify({ externalUrl: 'https://shubhsaur.hashnode.dev/post-1' }),
      },
    );
    const res = await POST(req, {
      params: Promise.resolve({ articleId, publicationId }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.publication.status).toBe('PUBLISHED');
    expect(data.publication.externalUrl).toBe('https://shubhsaur.hashnode.dev/post-1');
    expect(articleRepository.update).toHaveBeenCalledWith(articleId, { status: 'READY' });
  });
});
