import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { platformConnectionService } from '@artxflow/publishing';
import { devtoAdapter, PlatformError } from '@artxflow/platform-adapters';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@artxflow/auth', () => ({
  getSession: vi.fn(),
  bootstrapPersonalOrganization: vi.fn(),
}));

describe('/api/connections Route Handler', () => {
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

  describe('GET /api/connections', () => {
    it('returns 401 if unauthenticated', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const res = await GET();
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns connections list for organization', async () => {
      const mockList = [
        {
          id: 'conn-1',
          organizationId: mockOrg.id,
          provider: 'devto',
          status: 'CONNECTED',
          tokenMetadata: {},
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      vi.spyOn(platformConnectionService, 'listConnections').mockResolvedValue(mockList);

      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.connections).toEqual(mockList);
    });
  });

  describe('POST /api/connections', () => {
    it('returns 401 if unauthenticated', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const req = new Request('http://localhost/api/connections', {
        method: 'POST',
        body: JSON.stringify({ provider: 'devto', secret: 'abc' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 if provider or secret is missing', async () => {
      const req1 = new Request('http://localhost/api/connections', {
        method: 'POST',
        body: JSON.stringify({ secret: 'abc' }),
      });
      const res1 = await POST(req1);
      expect(res1.status).toBe(400);

      const req2 = new Request('http://localhost/api/connections', {
        method: 'POST',
        body: JSON.stringify({ provider: 'devto' }),
      });
      const res2 = await POST(req2);
      expect(res2.status).toBe(400);
    });

    it('verifies DEV.to credentials, creates connection and account, and returns safe DTO without secret', async () => {
      const mockProfile = {
        externalId: '12345',
        username: 'alice_dev',
        displayName: 'Alice Developer',
        avatarUrl: 'https://example.com/alice.png',
        metadata: { summary: 'Developer' },
      };

      vi.spyOn(devtoAdapter, 'verifyCredentials').mockResolvedValue(mockProfile);

      const mockCreated = {
        connection: {
          id: 'conn-uuid-1',
          organizationId: mockOrg.id,
          provider: 'devto',
          status: 'CONNECTED',
          tokenMetadata: {},
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        accounts: [
          {
            id: 'acc-uuid-1',
            connectionId: 'conn-uuid-1',
            externalId: '12345',
            username: 'alice_dev',
            displayName: 'Alice Developer',
            avatarUrl: 'https://example.com/alice.png',
            metadata: { summary: 'Developer' },
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
        ],
      };

      vi.spyOn(platformConnectionService, 'createConnection').mockResolvedValue(mockCreated);

      const req = new Request('http://localhost/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'devto', secret: 'valid_api_key' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const json = await res.json();

      expect(devtoAdapter.verifyCredentials).toHaveBeenCalledWith('valid_api_key');
      expect(platformConnectionService.createConnection).toHaveBeenCalledWith(
        { userId: mockUser.id, organizationId: mockOrg.id },
        expect.objectContaining({
          provider: 'devto',
          secret: 'valid_api_key',
          accounts: [mockProfile],
        }),
      );

      expect(json.connection.id).toBe('conn-uuid-1');
      expect(json.accounts[0].username).toBe('alice_dev');
      expect(json.connection.encryptedSecret).toBeUndefined();
      expect(json.connection.secret).toBeUndefined();
    });

    it('returns error when DEV.to credentials verification fails', async () => {
      vi.spyOn(devtoAdapter, 'verifyCredentials').mockRejectedValue(
        new PlatformError({
          provider: 'DEVTO',
          code: 'AUTHENTICATION_ERROR',
          statusCode: 401,
          message: 'DEV.to authentication failed (401)',
          retryable: false,
        }),
      );

      const req = new Request('http://localhost/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'devto', secret: 'invalid_key' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.code).toBe('AUTHENTICATION_ERROR');
    });
  });
});
