import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { PublicationService } from '@artxflow/publishing';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@artxflow/auth', () => ({
  getSession: vi.fn(),
  bootstrapPersonalOrganization: vi.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {},
}));

describe('/api/destinations Route Handler', () => {
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

  describe('GET /api/destinations', () => {
    it('returns 401 if unauthenticated', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const res = await GET();
      expect(res.status).toBe(401);
    });

    it('returns destinations list for organization', async () => {
      const mockList = [
        {
          id: 'dest-1',
          organizationId: mockOrg.id,
          type: 'DEVTO' as const,
          name: 'My DEV.to Channel',
          connectionId: 'conn-1',
          config: {},
          status: 'ACTIVE' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      vi.spyOn(PublicationService.prototype, 'listDestinations').mockResolvedValue(mockList);

      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.destinations).toEqual(mockList);
    });
  });

  describe('POST /api/destinations', () => {
    it('creates a DEV.to destination linked to connection', async () => {
      const mockCreated = {
        id: 'dest-devto-1',
        organizationId: mockOrg.id,
        type: 'DEVTO' as const,
        name: 'My DEV.to Feed',
        connectionId: 'conn-uuid-1',
        config: {},
        status: 'ACTIVE' as const,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      vi.spyOn(PublicationService.prototype, 'createDestination').mockResolvedValue(mockCreated);

      const req = new Request('http://localhost/api/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DEVTO',
          name: 'My DEV.to Feed',
          connectionId: 'conn-uuid-1',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.destination.type).toBe('DEVTO');
      expect(json.destination.connectionId).toBe('conn-uuid-1');
    });
  });
});
