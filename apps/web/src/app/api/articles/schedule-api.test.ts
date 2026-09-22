import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET, DELETE as DELETE_QUERY } from './[articleId]/schedule/route';
import { DELETE as DELETE_PARAM } from './[articleId]/schedules/[scheduleId]/route';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  ScheduleArticleService,
  ArticleNotFoundError,
  PastScheduledTimeError,
  ScheduleNotFoundError,
  InvalidScheduleStateError,
} from '@artxflow/publishing';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@artxflow/auth', () => ({
  getSession: vi.fn(),
  bootstrapPersonalOrganization: vi.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {},
}));

vi.mock('@artxflow/worker', () => ({
  createInngestJobQueue: vi.fn().mockReturnValue({
    dispatch: vi.fn(),
    schedule: vi.fn(),
  }),
}));

describe('Schedule API Routes', () => {
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
  const scheduleId = 'schedule-uuid-1';

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

  describe('POST /api/articles/[articleId]/schedule', () => {
    it('returns 401 when unauthorized', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);
      const req = new Request(`http://localhost/api/articles/${articleId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: '2026-10-01T10:00:00Z' }),
      });

      const res = await POST(req, { params: Promise.resolve({ articleId }) });
      expect(res.status).toBe(401);
    });

    it('returns 400 if scheduledAt is missing', async () => {
      const req = new Request(`http://localhost/api/articles/${articleId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone: 'UTC' }),
      });

      const res = await POST(req, { params: Promise.resolve({ articleId }) });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('scheduledAt is required');
    });

    it('returns 201 with scheduled item on success', async () => {
      const mockSchedule = {
        id: scheduleId,
        organizationId: mockOrg.id,
        articleId,
        articleVersionId: 'version-1',
        destinationIds: ['dest-1'],
        destinationOverrides: {},
        scheduledAt: '2026-10-01T10:00:00.000Z',
        timezone: 'UTC',
        status: 'SCHEDULED' as const,
        workflowId: 'wf-1',
        errorMessage: null,
        errorCode: null,
        executedAt: null,
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-01T00:00:00.000Z',
      };

      vi.spyOn(ScheduleArticleService.prototype, 'scheduleArticle').mockResolvedValue(mockSchedule);

      const req = new Request(`http://localhost/api/articles/${articleId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledAt: '2026-10-01T10:00:00Z',
          timezone: 'UTC',
          destinationIds: ['dest-1'],
        }),
      });

      const res = await POST(req, { params: Promise.resolve({ articleId }) });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe(scheduleId);
      expect(json.status).toBe('SCHEDULED');
    });

    it('returns 404 if article not found', async () => {
      vi.spyOn(ScheduleArticleService.prototype, 'scheduleArticle').mockRejectedValue(
        new ArticleNotFoundError(articleId, mockOrg.id),
      );

      const req = new Request(`http://localhost/api/articles/${articleId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: '2026-10-01T10:00:00Z' }),
      });

      const res = await POST(req, { params: Promise.resolve({ articleId }) });
      expect(res.status).toBe(404);
    });

    it('returns 422 if scheduledAt is in the past', async () => {
      vi.spyOn(ScheduleArticleService.prototype, 'scheduleArticle').mockRejectedValue(
        new PastScheduledTimeError(new Date('2020-01-01T00:00:00Z')),
      );

      const req = new Request(`http://localhost/api/articles/${articleId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: '2020-01-01T00:00:00Z' }),
      });

      const res = await POST(req, { params: Promise.resolve({ articleId }) });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/articles/[articleId]/schedule', () => {
    it('returns 401 when unauthorized', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);
      const req = new Request(`http://localhost/api/articles/${articleId}/schedule`);
      const res = await GET(req, { params: Promise.resolve({ articleId }) });
      expect(res.status).toBe(401);
    });

    it('returns 200 with list of schedules', async () => {
      const mockList = [
        {
          id: scheduleId,
          organizationId: mockOrg.id,
          articleId,
          articleVersionId: 'version-1',
          destinationIds: ['dest-1'],
          destinationOverrides: {},
          scheduledAt: '2026-10-01T10:00:00.000Z',
          timezone: 'UTC',
          status: 'SCHEDULED' as const,
          workflowId: 'wf-1',
          errorMessage: null,
          errorCode: null,
          executedAt: null,
          createdAt: '2026-06-01T00:00:00.000Z',
          updatedAt: '2026-06-01T00:00:00.000Z',
        },
      ];

      vi.spyOn(ScheduleArticleService.prototype, 'listSchedulesForArticle').mockResolvedValue(
        mockList,
      );

      const req = new Request(`http://localhost/api/articles/${articleId}/schedule`);
      const res = await GET(req, { params: Promise.resolve({ articleId }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.schedules).toEqual(mockList);
    });
  });

  describe('DELETE /api/articles/[articleId]/schedule', () => {
    it('returns 400 if scheduleId is not provided in query or body', async () => {
      const req = new Request(`http://localhost/api/articles/${articleId}/schedule`, {
        method: 'DELETE',
      });
      const res = await DELETE_QUERY(req, { params: Promise.resolve({ articleId }) });
      expect(res.status).toBe(400);
    });

    it('cancels schedule via query parameter', async () => {
      const mockCanceled = {
        id: scheduleId,
        organizationId: mockOrg.id,
        articleId,
        articleVersionId: 'version-1',
        destinationIds: ['dest-1'],
        destinationOverrides: {},
        scheduledAt: '2026-10-01T10:00:00.000Z',
        timezone: 'UTC',
        status: 'CANCELED' as const,
        workflowId: 'wf-1',
        errorMessage: null,
        errorCode: null,
        executedAt: null,
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-01T00:00:00.000Z',
      };

      vi.spyOn(ScheduleArticleService.prototype, 'cancelSchedule').mockResolvedValue(mockCanceled);

      const req = new Request(
        `http://localhost/api/articles/${articleId}/schedule?scheduleId=${scheduleId}`,
        {
          method: 'DELETE',
        },
      );
      const res = await DELETE_QUERY(req, { params: Promise.resolve({ articleId }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('CANCELED');
    });

    it('returns 422 if schedule cannot be canceled (not SCHEDULED)', async () => {
      vi.spyOn(ScheduleArticleService.prototype, 'cancelSchedule').mockRejectedValue(
        new InvalidScheduleStateError(`Schedule ${scheduleId} is in COMPLETED state`),
      );

      const req = new Request(
        `http://localhost/api/articles/${articleId}/schedule?scheduleId=${scheduleId}`,
        {
          method: 'DELETE',
        },
      );
      const res = await DELETE_QUERY(req, { params: Promise.resolve({ articleId }) });
      expect(res.status).toBe(422);
    });
  });

  describe('DELETE /api/articles/[articleId]/schedules/[scheduleId]', () => {
    it('cancels schedule by route parameter', async () => {
      const mockCanceled = {
        id: scheduleId,
        organizationId: mockOrg.id,
        articleId,
        articleVersionId: 'version-1',
        destinationIds: ['dest-1'],
        destinationOverrides: {},
        scheduledAt: '2026-10-01T10:00:00.000Z',
        timezone: 'UTC',
        status: 'CANCELED' as const,
        workflowId: 'wf-1',
        errorMessage: null,
        errorCode: null,
        executedAt: null,
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-01T00:00:00.000Z',
      };

      vi.spyOn(ScheduleArticleService.prototype, 'cancelSchedule').mockResolvedValue(mockCanceled);

      const req = new Request(
        `http://localhost/api/articles/${articleId}/schedules/${scheduleId}`,
        {
          method: 'DELETE',
        },
      );
      const res = await DELETE_PARAM(req, {
        params: Promise.resolve({ articleId, scheduleId }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('CANCELED');
    });

    it('returns 404 if schedule does not exist', async () => {
      vi.spyOn(ScheduleArticleService.prototype, 'cancelSchedule').mockRejectedValue(
        new ScheduleNotFoundError(scheduleId, mockOrg.id),
      );

      const req = new Request(
        `http://localhost/api/articles/${articleId}/schedules/${scheduleId}`,
        {
          method: 'DELETE',
        },
      );
      const res = await DELETE_PARAM(req, {
        params: Promise.resolve({ articleId, scheduleId }),
      });
      expect(res.status).toBe(404);
    });
  });
});
