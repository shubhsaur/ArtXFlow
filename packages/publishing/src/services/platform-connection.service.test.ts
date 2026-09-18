import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PlatformConnectionService,
  type CreatePlatformConnectionInput,
} from './platform-connection.service';
import type {
  PlatformConnectionRepository,
  PlatformAccountRepository,
  PlatformConnection,
  PlatformAccount,
} from '@artxflow/database';
import { encryptCredential } from '@artxflow/database';
import { PlatformConnectionNotFoundError, PublishingError } from '../errors';

describe('PlatformConnectionService', () => {
  const encryptionKey = 'a-super-secret-key-that-is-at-least-32-chars-long';
  const orgId = '11111111-1111-1111-1111-111111111111';
  const otherOrgId = '22222222-2222-2222-2222-222222222222';
  const userId = 'user-uuid-1';
  const connectionId = 'conn-uuid-1234';

  const ctx = {
    userId,
    organizationId: orgId,
  };

  const sampleSecret = 'ghp_secret_token_value_abc_123';
  let sampleEncryptedSecret: string;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = encryptionKey;
    sampleEncryptedSecret = encryptCredential(sampleSecret);
  });

  const mockConnectionEntity: PlatformConnection = {
    id: connectionId,
    organizationId: orgId,
    provider: 'devto',
    status: 'CONNECTED',
    encryptedSecret: '', // set in tests
    tokenMetadata: { tokenType: 'api_key' },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockAccountEntity: PlatformAccount = {
    id: 'acc-uuid-5678',
    connectionId,
    externalId: 'ext-42',
    username: 'alice',
    displayName: 'Alice Dev',
    avatarUrl: 'https://example.com/avatar.png',
    metadata: {},
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  it('creates a connection, encrypting the secret and omitting secrets from DTO', async () => {
    const mockConnectionRepo = {
      create: vi.fn().mockImplementation(async (data) => ({
        id: connectionId,
        ...data,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      })),
    } as unknown as PlatformConnectionRepository;

    const mockAccountRepo = {
      create: vi.fn().mockResolvedValue(mockAccountEntity),
    } as unknown as PlatformAccountRepository;

    const service = new PlatformConnectionService(mockConnectionRepo, mockAccountRepo);

    const input: CreatePlatformConnectionInput = {
      provider: 'devto',
      secret: 'my-super-secret-api-key',
      tokenMetadata: { scope: 'read,write' },
      accounts: [
        {
          externalId: 'ext-42',
          username: 'alice',
          displayName: 'Alice Dev',
          avatarUrl: 'https://example.com/avatar.png',
        },
      ],
    };

    const result = await service.createConnection(ctx, input);

    // Verify secret was encrypted before DB insert
    expect(mockConnectionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: orgId,
        provider: 'devto',
        status: 'CONNECTED',
        encryptedSecret: expect.any(String),
      }),
    );

    const callArgs = (mockConnectionRepo.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.encryptedSecret).not.toBe('my-super-secret-api-key');
    expect(callArgs.encryptedSecret.split(':')).toHaveLength(3);

    // Verify DTO does NOT contain any secret
    expect(result.connection).toEqual({
      id: connectionId,
      organizationId: orgId,
      provider: 'devto',
      status: 'CONNECTED',
      tokenMetadata: { scope: 'read,write' },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(
      (result.connection as unknown as Record<string, unknown>).encryptedSecret,
    ).toBeUndefined();
    expect((result.connection as unknown as Record<string, unknown>).secret).toBeUndefined();

    // Verify account was created
    expect(result.accounts).toHaveLength(1);
    expect(result.accounts[0].username).toBe('alice');
  });

  it('rejects connection creation when secret or provider is empty', async () => {
    const service = new PlatformConnectionService(
      {} as PlatformConnectionRepository,
      {} as PlatformAccountRepository,
    );

    await expect(service.createConnection(ctx, { provider: 'devto', secret: '' })).rejects.toThrow(
      PublishingError,
    );

    await expect(service.createConnection(ctx, { provider: '', secret: 'token' })).rejects.toThrow(
      PublishingError,
    );
  });

  it('retrieves connection within organization boundary', async () => {
    const connectionEntity = { ...mockConnectionEntity, encryptedSecret: sampleEncryptedSecret };
    const mockConnectionRepo = {
      findForOrganization: vi.fn().mockResolvedValue(connectionEntity),
    } as unknown as PlatformConnectionRepository;

    const service = new PlatformConnectionService(
      mockConnectionRepo,
      {} as PlatformAccountRepository,
    );

    const dto = await service.getConnection(ctx, connectionId);

    expect(mockConnectionRepo.findForOrganization).toHaveBeenCalledWith(orgId, connectionId);
    expect(dto.id).toBe(connectionId);
    expect((dto as unknown as Record<string, unknown>).encryptedSecret).toBeUndefined();
  });

  it('throws PlatformConnectionNotFoundError when connection not found in organization', async () => {
    const mockConnectionRepo = {
      findForOrganization: vi.fn().mockResolvedValue(null),
    } as unknown as PlatformConnectionRepository;

    const service = new PlatformConnectionService(
      mockConnectionRepo,
      {} as PlatformAccountRepository,
    );

    await expect(service.getConnection(ctx, 'missing-id')).rejects.toThrow(
      PlatformConnectionNotFoundError,
    );
  });

  it('lists connections for an organization', async () => {
    const connectionEntity = { ...mockConnectionEntity, encryptedSecret: sampleEncryptedSecret };
    const mockConnectionRepo = {
      listByOrganization: vi.fn().mockResolvedValue([connectionEntity]),
    } as unknown as PlatformConnectionRepository;

    const service = new PlatformConnectionService(
      mockConnectionRepo,
      {} as PlatformAccountRepository,
    );

    const list = await service.listConnections(ctx, { provider: 'devto' });

    expect(list).toHaveLength(1);
    expect(list[0].provider).toBe('devto');
    expect((list[0] as unknown as Record<string, unknown>).encryptedSecret).toBeUndefined();
  });

  it('updates credentials and re-encrypts secret', async () => {
    const originalConnection = { ...mockConnectionEntity, encryptedSecret: sampleEncryptedSecret };
    const updatedSecret = 'new_updated_token_999';

    const mockConnectionRepo = {
      findForOrganization: vi.fn().mockResolvedValue(originalConnection),
      update: vi.fn().mockImplementation(async (_id, _orgId, data) => ({
        ...originalConnection,
        ...data,
        updatedAt: new Date('2026-01-02T00:00:00Z'),
      })),
    } as unknown as PlatformConnectionRepository;

    const service = new PlatformConnectionService(
      mockConnectionRepo,
      {} as PlatformAccountRepository,
    );

    const updated = await service.updateSecret(ctx, connectionId, {
      secret: updatedSecret,
    });

    expect(mockConnectionRepo.update).toHaveBeenCalledWith(
      connectionId,
      orgId,
      expect.objectContaining({
        status: 'CONNECTED',
        encryptedSecret: expect.any(String),
      }),
    );
    expect(updated.status).toBe('CONNECTED');
    expect((updated as unknown as Record<string, unknown>).encryptedSecret).toBeUndefined();
  });

  it('merges token metadata without requiring a new secret', async () => {
    const originalConnection = {
      ...mockConnectionEntity,
      encryptedSecret: sampleEncryptedSecret,
      tokenMetadata: { tokenType: 'api_key', keepMe: true },
    };

    const mockConnectionRepo = {
      findForOrganization: vi.fn().mockResolvedValue(originalConnection),
      update: vi.fn().mockImplementation(async (_id, _orgId, data) => ({
        ...originalConnection,
        ...data,
        updatedAt: new Date('2026-01-02T00:00:00Z'),
      })),
    } as unknown as PlatformConnectionRepository;

    const service = new PlatformConnectionService(
      mockConnectionRepo,
      {} as PlatformAccountRepository,
    );

    const updated = await service.updateTokenMetadata(ctx, connectionId, {
      tokenMetadata: { hashnodePublishMode: 'hn_new' },
    });

    expect(mockConnectionRepo.update).toHaveBeenCalledWith(
      connectionId,
      orgId,
      expect.objectContaining({
        tokenMetadata: { tokenType: 'api_key', keepMe: true, hashnodePublishMode: 'hn_new' },
      }),
    );
    expect(updated.tokenMetadata.hashnodePublishMode).toBe('hn_new');
    expect((updated as unknown as Record<string, unknown>).encryptedSecret).toBeUndefined();
  });

  it('revokes a connection', async () => {
    const originalConnection = { ...mockConnectionEntity, encryptedSecret: sampleEncryptedSecret };
    const mockConnectionRepo = {
      findForOrganization: vi.fn().mockResolvedValue(originalConnection),
      updateStatus: vi.fn().mockResolvedValue({ ...originalConnection, status: 'REVOKED' }),
    } as unknown as PlatformConnectionRepository;

    const service = new PlatformConnectionService(
      mockConnectionRepo,
      {} as PlatformAccountRepository,
    );

    const result = await service.revokeConnection(ctx, connectionId);

    expect(mockConnectionRepo.updateStatus).toHaveBeenCalledWith(connectionId, orgId, 'REVOKED');
    expect(result.status).toBe('REVOKED');
  });

  it('deletes a connection within tenant boundary', async () => {
    const originalConnection = { ...mockConnectionEntity, encryptedSecret: sampleEncryptedSecret };
    const mockConnectionRepo = {
      findForOrganization: vi.fn().mockResolvedValue(originalConnection),
      delete: vi.fn().mockResolvedValue(true),
    } as unknown as PlatformConnectionRepository;

    const service = new PlatformConnectionService(
      mockConnectionRepo,
      {} as PlatformAccountRepository,
    );

    await service.deleteConnection(ctx, connectionId);

    expect(mockConnectionRepo.delete).toHaveBeenCalledWith(connectionId, orgId);
  });

  it('upserts and lists platform accounts', async () => {
    const originalConnection = { ...mockConnectionEntity, encryptedSecret: sampleEncryptedSecret };
    const mockConnectionRepo = {
      findForOrganization: vi.fn().mockResolvedValue(originalConnection),
    } as unknown as PlatformConnectionRepository;

    const mockAccountRepo = {
      upsert: vi.fn().mockResolvedValue(mockAccountEntity),
      listByConnection: vi.fn().mockResolvedValue([mockAccountEntity]),
    } as unknown as PlatformAccountRepository;

    const service = new PlatformConnectionService(mockConnectionRepo, mockAccountRepo);

    const accountDto = await service.addOrUpdateAccount(ctx, connectionId, {
      externalId: 'ext-42',
      username: 'alice',
      displayName: 'Alice Dev',
    });

    expect(accountDto.username).toBe('alice');

    const list = await service.listAccounts(ctx, connectionId);
    expect(list).toHaveLength(1);
    expect(list[0].externalId).toBe('ext-42');
  });

  it('decrypts stored secret for internal adapter use', async () => {
    const rawSecret = 'internal_devto_secret_key_123';
    const encryptedSecret = encryptCredential(rawSecret);

    const connectionEntity = {
      ...mockConnectionEntity,
      encryptedSecret,
    };

    const mockConnectionRepo = {
      findForOrganization: vi.fn().mockResolvedValue(connectionEntity),
    } as unknown as PlatformConnectionRepository;

    const service = new PlatformConnectionService(
      mockConnectionRepo,
      {} as PlatformAccountRepository,
    );

    const decrypted = await service.getDecryptedSecret(ctx, connectionId);

    expect(decrypted).toBe(rawSecret);
  });

  it('fails getDecryptedSecret when unauthorized tenant attempts access', async () => {
    const mockConnectionRepo = {
      findForOrganization: vi.fn().mockResolvedValue(null),
    } as unknown as PlatformConnectionRepository;

    const service = new PlatformConnectionService(
      mockConnectionRepo,
      {} as PlatformAccountRepository,
    );

    const otherCtx = { ...ctx, organizationId: otherOrgId };
    await expect(service.getDecryptedSecret(otherCtx, connectionId)).rejects.toThrow(
      PlatformConnectionNotFoundError,
    );
  });
});
