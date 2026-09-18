import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PATCH } from './route';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { platformConnectionService, PublicationService } from '@artxflow/publishing';
import {
  devtoAdapter,
  hashnodeAdapter,
  mediumAdapter,
  PlatformError,
} from '@artxflow/platform-adapters';

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
      vi.spyOn(platformConnectionService, 'listAccounts').mockResolvedValue([]);

      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.connections).toEqual([
        {
          ...mockList[0],
          accounts: [],
        },
      ]);
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

    it('stores the selected Hashnode publish mode on the connection and destination', async () => {
      vi.spyOn(hashnodeAdapter, 'verifyCredentials').mockResolvedValue({
        externalId: 'hn-1',
        username: 'alice',
        displayName: 'Alice',
        avatarUrl: null,
        publications: [{ id: 'hn-pub-1', title: 'Alice Blog', url: 'https://alice.hashnode.dev' }],
      });

      const mockCreated = {
        connection: {
          id: 'conn-hn-1',
          organizationId: mockOrg.id,
          provider: 'hashnode',
          status: 'CONNECTED',
          tokenMetadata: { hashnodePublishMode: 'hn_new' },
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        accounts: [],
      };

      vi.spyOn(platformConnectionService, 'createConnection').mockResolvedValue(mockCreated);
      const createDestination = vi
        .spyOn(PublicationService.prototype, 'createDestination')
        .mockResolvedValue({
          id: 'dest-hn-1',
          organizationId: mockOrg.id,
          type: 'hashnode',
          name: 'Hashnode (@alice)',
          connectionId: 'conn-hn-1',
          config: { hashnodePublishMode: 'hn_new', publicationId: 'hn-pub-1' },
          status: 'ACTIVE',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        });
      vi.spyOn(PublicationService.prototype, 'listDestinations').mockResolvedValue([]);

      const req = new Request('http://localhost/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'hashnode',
          secret: 'hn-pat',
          hashnodePublishMode: 'hn_new',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      expect(platformConnectionService.createConnection).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          provider: 'hashnode',
          tokenMetadata: { hashnodePublishMode: 'hn_new' },
        }),
      );
      expect(createDestination).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'hashnode',
          config: expect.objectContaining({
            hashnodePublishMode: 'hn_new',
            publicationId: 'hn-pub-1',
          }),
        }),
      );
    });

    it('rejects an invalid Hashnode publish mode', async () => {
      const req = new Request('http://localhost/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'hashnode',
          secret: 'hn-pat',
          hashnodePublishMode: 'telepathy',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('connects Medium without a token when using a client-managed publish mode', async () => {
      const mockCreated = {
        connection: {
          id: 'conn-med-1',
          organizationId: mockOrg.id,
          provider: 'medium',
          status: 'CONNECTED',
          tokenMetadata: { mediumPublishMode: 'extension', clientManaged: true },
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        accounts: [],
      };

      vi.spyOn(platformConnectionService, 'createConnection').mockResolvedValue(mockCreated);
      vi.spyOn(PublicationService.prototype, 'listDestinations').mockResolvedValue([]);
      vi.spyOn(PublicationService.prototype, 'createDestination').mockResolvedValue({
        id: 'dest-med-1',
        organizationId: mockOrg.id,
        type: 'medium',
        name: 'Medium (browser session)',
        connectionId: 'conn-med-1',
        config: { mediumPublishMode: 'extension', clientManaged: true },
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      });
      const verifySpy = vi.spyOn(mediumAdapter, 'verifyCredentials');

      const req = new Request('http://localhost/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'medium',
          mediumPublishMode: 'extension',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      expect(verifySpy).not.toHaveBeenCalled();
      expect(platformConnectionService.createConnection).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          provider: 'medium',
          secret: '__artxflow_client_managed__',
          tokenMetadata: expect.objectContaining({
            mediumPublishMode: 'extension',
            clientManaged: true,
          }),
        }),
      );
    });

    it('rejects Medium API mode without a token', async () => {
      const req = new Request('http://localhost/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'medium',
          mediumPublishMode: 'api',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/connections', () => {
    it('returns 401 if unauthenticated', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const req = new Request('http://localhost/api/connections', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'conn-1', hashnodePublishMode: 'manual' }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(401);
    });

    it('updates Hashnode publish mode on the connection and matching destination', async () => {
      vi.spyOn(platformConnectionService, 'getConnection').mockResolvedValue({
        id: 'conn-hn-1',
        organizationId: mockOrg.id,
        provider: 'hashnode',
        status: 'CONNECTED',
        tokenMetadata: { hashnodePublishMode: 'extension' },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      });
      vi.spyOn(platformConnectionService, 'updateTokenMetadata').mockResolvedValue({
        id: 'conn-hn-1',
        organizationId: mockOrg.id,
        provider: 'hashnode',
        status: 'CONNECTED',
        tokenMetadata: { hashnodePublishMode: 'manual' },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      });
      vi.spyOn(PublicationService.prototype, 'listDestinations').mockResolvedValue([
        {
          id: 'dest-hn-1',
          organizationId: mockOrg.id,
          type: 'hashnode',
          name: 'Hashnode',
          connectionId: 'conn-hn-1',
          config: { hashnodePublishMode: 'extension' },
          status: 'ACTIVE',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);
      const updateDestination = vi
        .spyOn(PublicationService.prototype, 'updateDestination')
        .mockResolvedValue({
          id: 'dest-hn-1',
          organizationId: mockOrg.id,
          type: 'hashnode',
          name: 'Hashnode',
          connectionId: 'conn-hn-1',
          config: { hashnodePublishMode: 'manual' },
          status: 'ACTIVE',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
        });

      const req = new Request('http://localhost/api/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'conn-hn-1', hashnodePublishMode: 'manual' }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.connection.tokenMetadata.hashnodePublishMode).toBe('manual');
      expect(platformConnectionService.updateTokenMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'conn-hn-1',
        { tokenMetadata: { hashnodePublishMode: 'manual' } },
      );
      expect(updateDestination).toHaveBeenCalledWith(expect.anything(), 'dest-hn-1', {
        config: { hashnodePublishMode: 'manual' },
      });
    });

    it('updates Medium publish mode on the connection and matching destination', async () => {
      vi.spyOn(platformConnectionService, 'getConnection').mockResolvedValue({
        id: 'conn-med-1',
        organizationId: mockOrg.id,
        provider: 'medium',
        status: 'CONNECTED',
        tokenMetadata: { mediumPublishMode: 'extension', clientManaged: true },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      });
      vi.spyOn(platformConnectionService, 'updateTokenMetadata').mockResolvedValue({
        id: 'conn-med-1',
        organizationId: mockOrg.id,
        provider: 'medium',
        status: 'CONNECTED',
        tokenMetadata: { mediumPublishMode: 'medium_new', clientManaged: true },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      });
      vi.spyOn(PublicationService.prototype, 'listDestinations').mockResolvedValue([
        {
          id: 'dest-med-1',
          organizationId: mockOrg.id,
          type: 'medium',
          name: 'Medium',
          connectionId: 'conn-med-1',
          config: { mediumPublishMode: 'extension', clientManaged: true },
          status: 'ACTIVE',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);
      const updateDestination = vi
        .spyOn(PublicationService.prototype, 'updateDestination')
        .mockResolvedValue({
          id: 'dest-med-1',
          organizationId: mockOrg.id,
          type: 'medium',
          name: 'Medium',
          connectionId: 'conn-med-1',
          config: { mediumPublishMode: 'medium_new', clientManaged: true },
          status: 'ACTIVE',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
        });

      const req = new Request('http://localhost/api/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'conn-med-1', mediumPublishMode: 'medium_new' }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.connection.tokenMetadata.mediumPublishMode).toBe('medium_new');
      expect(platformConnectionService.updateTokenMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'conn-med-1',
        { tokenMetadata: { mediumPublishMode: 'medium_new' } },
      );
      expect(updateDestination).toHaveBeenCalledWith(expect.anything(), 'dest-med-1', {
        config: { mediumPublishMode: 'medium_new' },
      });
    });
  });
});
