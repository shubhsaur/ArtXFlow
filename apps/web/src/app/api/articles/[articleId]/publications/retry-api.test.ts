import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './[publicationId]/retry/route';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  publicationService,
  PublicationNotFoundError,
  InvalidPublicationStateError,
} from '@artxflow/publishing';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@artxflow/auth', () => ({
  getSession: vi.fn(),
  bootstrapPersonalOrganization: vi.fn(),
}));

describe('POST /api/articles/[articleId]/publications/[publicationId]/retry', () => {
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
      `http://localhost/api/articles/${articleId}/publications/${publicationId}/retry`,
      { method: 'POST' },
    );
    const res = await POST(req, {
      params: Promise.resolve({ articleId, publicationId }),
    });

    expect(res.status).toBe(401);
  });

  it('successfully retries failed publication and returns updated record (200 OK)', async () => {
    const mockRetried = {
      id: publicationId,
      organizationId: mockOrg.id,
      articleId,
      articleVersionId: 'version-1',
      destinationId: 'dest-1',
      status: 'QUEUED' as const,
      externalResourceId: null,
      externalUrl: null,
      publishedAt: null,
      lastAttemptAt: '2026-09-14T00:00:00.000Z',
      attemptCount: 2,
      lastErrorCode: null,
      lastErrorMessage: null,
      overrides: {},
      createdAt: '2026-09-14T00:00:00.000Z',
      updatedAt: '2026-09-14T00:00:00.000Z',
    };

    vi.spyOn(publicationService, 'retryPublication').mockResolvedValue(mockRetried);

    const req = new Request(
      `http://localhost/api/articles/${articleId}/publications/${publicationId}/retry`,
      { method: 'POST' },
    );
    const res = await POST(req, {
      params: Promise.resolve({ articleId, publicationId }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('QUEUED');
    expect(publicationService.retryPublication).toHaveBeenCalledWith(
      {
        userId: mockUser.id,
        organizationId: mockOrg.id,
      },
      publicationId,
    );
  });

  it('returns 404 if publication does not exist', async () => {
    vi.spyOn(publicationService, 'retryPublication').mockRejectedValue(
      new PublicationNotFoundError(publicationId, mockOrg.id),
    );

    const req = new Request(
      `http://localhost/api/articles/${articleId}/publications/${publicationId}/retry`,
      { method: 'POST' },
    );
    const res = await POST(req, {
      params: Promise.resolve({ articleId, publicationId }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 422 if publication is in an invalid state for retry (e.g. already PUBLISHED)', async () => {
    vi.spyOn(publicationService, 'retryPublication').mockRejectedValue(
      new InvalidPublicationStateError('Publication is already published and cannot be retried.'),
    );

    const req = new Request(
      `http://localhost/api/articles/${articleId}/publications/${publicationId}/retry`,
      { method: 'POST' },
    );
    const res = await POST(req, {
      params: Promise.resolve({ articleId, publicationId }),
    });

    expect(res.status).toBe(422);
  });
});
