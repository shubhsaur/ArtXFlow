import { describe, it, expect, vi } from 'vitest';
import {
  connectionStatusEnum,
  platformConnections,
  platformAccounts,
  type PlatformConnection,
  type PlatformAccount,
} from '../schema/connections';
import {
  PlatformConnectionRepository,
  PlatformAccountRepository,
} from './platform-connection.repository';
import type { DbClient } from '../client';

describe('Platform Connection Schema & Repositories', () => {
  const orgId = '11111111-1111-1111-1111-111111111111';
  const otherOrgId = '22222222-2222-2222-2222-222222222222';
  const connectionId = 'conn-uuid-1111';
  const accountId = 'acc-uuid-1111';

  const mockConnection: PlatformConnection = {
    id: connectionId,
    organizationId: orgId,
    provider: 'devto',
    status: 'CONNECTED',
    encryptedSecret: 'iv:tag:cipher',
    tokenMetadata: { tokenType: 'api_key' },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockAccount: PlatformAccount = {
    id: accountId,
    connectionId,
    externalId: 'ext-author-42',
    username: 'alice_dev',
    displayName: 'Alice Developer',
    avatarUrl: 'https://example.com/alice.png',
    metadata: { profile: 'https://dev.to/alice_dev' },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  describe('Schema Invariants', () => {
    it('defines connectionStatusEnum with canonical states', () => {
      expect(connectionStatusEnum.enumValues).toEqual([
        'CONNECTED',
        'EXPIRED',
        'REAUTH_REQUIRED',
        'REVOKED',
      ]);
    });

    it('defines platform_connections table structure with required columns', () => {
      expect(platformConnections.id).toBeDefined();
      expect(platformConnections.organizationId).toBeDefined();
      expect(platformConnections.provider).toBeDefined();
      expect(platformConnections.status).toBeDefined();
      expect(platformConnections.encryptedSecret).toBeDefined();
      expect(platformConnections.tokenMetadata).toBeDefined();
      expect(platformConnections.createdAt).toBeDefined();
      expect(platformConnections.updatedAt).toBeDefined();
    });

    it('defines platform_accounts table structure with required columns', () => {
      expect(platformAccounts.id).toBeDefined();
      expect(platformAccounts.connectionId).toBeDefined();
      expect(platformAccounts.externalId).toBeDefined();
      expect(platformAccounts.username).toBeDefined();
      expect(platformAccounts.displayName).toBeDefined();
      expect(platformAccounts.avatarUrl).toBeDefined();
      expect(platformAccounts.metadata).toBeDefined();
      expect(platformAccounts.createdAt).toBeDefined();
      expect(platformAccounts.updatedAt).toBeDefined();
    });
  });

  describe('PlatformConnectionRepository', () => {
    it('creates a new platform connection', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockConnection]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformConnectionRepository(mockDb);
      const result = await repo.create({
        organizationId: orgId,
        provider: 'devto',
        encryptedSecret: 'iv:tag:cipher',
        tokenMetadata: { tokenType: 'api_key' },
      });

      expect(result).toEqual(mockConnection);
      expect(mockDb.insert).toHaveBeenCalledWith(platformConnections);
    });

    it('finds connection by ID', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockConnection]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformConnectionRepository(mockDb);
      const result = await repo.findById(connectionId);

      expect(result).toEqual(mockConnection);
    });

    it('finds connection within organization boundaries', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockConnection]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformConnectionRepository(mockDb);
      const result = await repo.findForOrganization(orgId, connectionId);

      expect(result).toEqual(mockConnection);
    });

    it('returns null when connection belongs to another organization', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformConnectionRepository(mockDb);
      const result = await repo.findForOrganization(otherOrgId, connectionId);

      expect(result).toBeNull();
    });

    it('lists connections by organization with optional filters', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([mockConnection]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformConnectionRepository(mockDb);
      const result = await repo.listByOrganization(orgId, {
        provider: 'devto',
        status: 'CONNECTED',
      });

      expect(result).toEqual([mockConnection]);
    });

    it('updates platform connection', async () => {
      const updatedConnection = { ...mockConnection, status: 'REVOKED' as const };
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([updatedConnection]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformConnectionRepository(mockDb);
      const result = await repo.update(connectionId, orgId, { status: 'REVOKED' });

      expect(result.status).toBe('REVOKED');
    });

    it('updates connection status via updateStatus shortcut', async () => {
      const updatedConnection = { ...mockConnection, status: 'EXPIRED' as const };
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([updatedConnection]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformConnectionRepository(mockDb);
      const result = await repo.updateStatus(connectionId, orgId, 'EXPIRED');

      expect(result.status).toBe('EXPIRED');
    });

    it('throws when updating non-existent connection in organization', async () => {
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformConnectionRepository(mockDb);
      await expect(repo.update('missing-id', orgId, { status: 'REVOKED' })).rejects.toThrow(
        /not found in organization/,
      );
    });

    it('deletes connection within organization boundary', async () => {
      const mockDb = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: connectionId }]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformConnectionRepository(mockDb);
      const deleted = await repo.delete(connectionId, orgId);

      expect(deleted).toBe(true);
    });
  });

  describe('PlatformAccountRepository', () => {
    it('creates a new platform account', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockAccount]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformAccountRepository(mockDb);
      const result = await repo.create({
        connectionId,
        externalId: 'ext-author-42',
        username: 'alice_dev',
        displayName: 'Alice Developer',
        avatarUrl: 'https://example.com/alice.png',
      });

      expect(result).toEqual(mockAccount);
    });

    it('finds account by ID', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockAccount]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformAccountRepository(mockDb);
      const result = await repo.findById(accountId);

      expect(result).toEqual(mockAccount);
    });

    it('finds account by connectionId and externalId', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockAccount]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformAccountRepository(mockDb);
      const result = await repo.findByConnectionAndExternalId(connectionId, 'ext-author-42');

      expect(result).toEqual(mockAccount);
    });

    it('lists accounts by connection', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([mockAccount]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformAccountRepository(mockDb);
      const result = await repo.listByConnection(connectionId);

      expect(result).toEqual([mockAccount]);
    });

    it('updates platform account', async () => {
      const updatedAccount = { ...mockAccount, displayName: 'Alice Updated' };
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([updatedAccount]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformAccountRepository(mockDb);
      const result = await repo.update(accountId, connectionId, {
        displayName: 'Alice Updated',
      });

      expect(result.displayName).toBe('Alice Updated');
    });

    it('upserts platform account when existing', async () => {
      const repo = new PlatformAccountRepository({} as DbClient);
      const findSpy = vi
        .spyOn(repo, 'findByConnectionAndExternalId')
        .mockResolvedValue(mockAccount);
      const updateSpy = vi
        .spyOn(repo, 'update')
        .mockResolvedValue({ ...mockAccount, displayName: 'Updated' });

      const result = await repo.upsert({
        connectionId,
        externalId: 'ext-author-42',
        username: 'alice_dev',
        displayName: 'Updated',
      });

      expect(findSpy).toHaveBeenCalledWith(connectionId, 'ext-author-42');
      expect(updateSpy).toHaveBeenCalled();
      expect(result.displayName).toBe('Updated');
    });

    it('upserts platform account when not existing', async () => {
      const repo = new PlatformAccountRepository({} as DbClient);
      const findSpy = vi.spyOn(repo, 'findByConnectionAndExternalId').mockResolvedValue(null);
      const createSpy = vi.spyOn(repo, 'create').mockResolvedValue(mockAccount);

      const result = await repo.upsert({
        connectionId,
        externalId: 'ext-author-42',
        username: 'alice_dev',
        displayName: 'Alice Developer',
      });

      expect(findSpy).toHaveBeenCalledWith(connectionId, 'ext-author-42');
      expect(createSpy).toHaveBeenCalled();
      expect(result).toEqual(mockAccount);
    });

    it('deletes account for connection', async () => {
      const mockDb = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: accountId }]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PlatformAccountRepository(mockDb);
      const deleted = await repo.delete(accountId, connectionId);

      expect(deleted).toBe(true);
    });
  });
});
