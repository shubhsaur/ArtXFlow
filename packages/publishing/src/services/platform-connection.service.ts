import {
  platformConnectionRepository,
  platformAccountRepository,
  encryptCredential,
  decryptCredential,
  type PlatformConnectionRepository,
  type PlatformAccountRepository,
  type ConnectionStatus,
} from '@artxflow/database';
import type { CommandContext } from './publication.service';
import {
  toPlatformConnectionDto,
  toPlatformAccountDto,
  type PlatformConnectionDto,
  type PlatformAccountDto,
} from '../models';
import { PlatformConnectionNotFoundError, PublishingError } from '../errors';

export interface CreatePlatformConnectionInput {
  provider: string;
  secret: string;
  tokenMetadata?: Record<string, unknown>;
  accounts?: Array<{
    externalId: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    metadata?: Record<string, unknown>;
  }>;
}

export interface UpdatePlatformConnectionSecretInput {
  secret: string;
  tokenMetadata?: Record<string, unknown>;
}

export interface UpsertPlatformAccountInput {
  externalId: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  metadata?: Record<string, unknown>;
}

export class PlatformConnectionService {
  constructor(
    private readonly connectionRepo: PlatformConnectionRepository = platformConnectionRepository,
    private readonly accountRepo: PlatformAccountRepository = platformAccountRepository,
  ) {}

  /**
   * Registers a new platform connection for an organization.
   * Encrypts secrets using AES-256-GCM before database persistence.
   * Never leaks secrets in the returned DTO.
   */
  async createConnection(
    ctx: CommandContext,
    input: CreatePlatformConnectionInput,
  ): Promise<{ connection: PlatformConnectionDto; accounts: PlatformAccountDto[] }> {
    if (!input.secret || input.secret.trim() === '') {
      throw new PublishingError('Connection secret cannot be empty');
    }
    if (!input.provider || input.provider.trim() === '') {
      throw new PublishingError('Connection provider cannot be empty');
    }

    const encryptedSecret = encryptCredential(input.secret);

    const connectionEntity = await this.connectionRepo.create({
      organizationId: ctx.organizationId,
      provider: input.provider.toLowerCase().trim(),
      status: 'CONNECTED',
      encryptedSecret,
      tokenMetadata: input.tokenMetadata || {},
    });

    const accounts: PlatformAccountDto[] = [];
    if (input.accounts && input.accounts.length > 0) {
      for (const acc of input.accounts) {
        const createdAcc = await this.accountRepo.create({
          connectionId: connectionEntity.id,
          externalId: acc.externalId,
          username: acc.username,
          displayName: acc.displayName,
          avatarUrl: acc.avatarUrl,
          metadata: acc.metadata || {},
        });
        accounts.push(toPlatformAccountDto(createdAcc));
      }
    }

    return {
      connection: toPlatformConnectionDto(connectionEntity),
      accounts,
    };
  }

  /**
   * Retrieves a platform connection within tenant boundaries.
   */
  async getConnection(ctx: CommandContext, connectionId: string): Promise<PlatformConnectionDto> {
    const connection = await this.connectionRepo.findForOrganization(
      ctx.organizationId,
      connectionId,
    );
    if (!connection) {
      throw new PlatformConnectionNotFoundError(connectionId, ctx.organizationId);
    }
    return toPlatformConnectionDto(connection);
  }

  /**
   * Lists all platform connections for an organization.
   */
  async listConnections(
    ctx: CommandContext,
    filter?: { provider?: string; status?: ConnectionStatus },
  ): Promise<PlatformConnectionDto[]> {
    const connections = await this.connectionRepo.listByOrganization(ctx.organizationId, filter);
    return connections.map(toPlatformConnectionDto);
  }

  /**
   * Updates credentials/secret for an existing connection.
   * Re-encrypts secret with AES-256-GCM and resets status to CONNECTED.
   */
  async updateSecret(
    ctx: CommandContext,
    connectionId: string,
    input: UpdatePlatformConnectionSecretInput,
  ): Promise<PlatformConnectionDto> {
    if (!input.secret || input.secret.trim() === '') {
      throw new PublishingError('Connection secret cannot be empty');
    }

    // Verify tenant boundary
    await this.getConnection(ctx, connectionId);

    const encryptedSecret = encryptCredential(input.secret);
    const updated = await this.connectionRepo.update(connectionId, ctx.organizationId, {
      encryptedSecret,
      status: 'CONNECTED',
      tokenMetadata: input.tokenMetadata,
    });

    return toPlatformConnectionDto(updated);
  }

  /**
   * Updates status of a platform connection (e.g. EXPIRED, REAUTH_REQUIRED, REVOKED).
   */
  async updateStatus(
    ctx: CommandContext,
    connectionId: string,
    status: ConnectionStatus,
  ): Promise<PlatformConnectionDto> {
    await this.getConnection(ctx, connectionId);
    const updated = await this.connectionRepo.updateStatus(
      connectionId,
      ctx.organizationId,
      status,
    );
    return toPlatformConnectionDto(updated);
  }

  /**
   * Revokes a connection, preventing further publication operations.
   */
  async revokeConnection(
    ctx: CommandContext,
    connectionId: string,
  ): Promise<PlatformConnectionDto> {
    return this.updateStatus(ctx, connectionId, 'REVOKED');
  }

  /**
   * Deletes a platform connection and all cascaded child records within tenant boundaries.
   */
  async deleteConnection(ctx: CommandContext, connectionId: string): Promise<void> {
    await this.getConnection(ctx, connectionId);
    await this.connectionRepo.delete(connectionId, ctx.organizationId);
  }

  /**
   * Adds or updates a platform account associated with a connection.
   */
  async addOrUpdateAccount(
    ctx: CommandContext,
    connectionId: string,
    input: UpsertPlatformAccountInput,
  ): Promise<PlatformAccountDto> {
    await this.getConnection(ctx, connectionId);

    const account = await this.accountRepo.upsert({
      connectionId,
      externalId: input.externalId,
      username: input.username,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl,
      metadata: input.metadata || {},
    });

    return toPlatformAccountDto(account);
  }

  /**
   * Lists accounts linked to a connection within tenant boundaries.
   */
  async listAccounts(ctx: CommandContext, connectionId: string): Promise<PlatformAccountDto[]> {
    await this.getConnection(ctx, connectionId);
    const accounts = await this.accountRepo.listByConnection(connectionId);
    return accounts.map(toPlatformAccountDto);
  }

  /**
   * Decrypts and retrieves the connection's secret token for internal platform adapter execution.
   * This is strictly for server-side workflow execution and must never be exposed via client APIs.
   */
  async getDecryptedSecret(ctx: CommandContext, connectionId: string): Promise<string> {
    const connection = await this.connectionRepo.findForOrganization(
      ctx.organizationId,
      connectionId,
    );
    if (!connection) {
      throw new PlatformConnectionNotFoundError(connectionId, ctx.organizationId);
    }

    return decryptCredential(connection.encryptedSecret);
  }
}

export const platformConnectionService = new PlatformConnectionService();
