import { eq, and, desc, inArray } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import {
  platformConnections,
  platformAccounts,
  type PlatformConnection,
  type NewPlatformConnection,
  type PlatformAccount,
  type NewPlatformAccount,
  type ConnectionStatus,
} from '../schema/connections';
import type { BaseRepository } from './index';

export interface PlatformConnectionWithAccounts extends PlatformConnection {
  accounts: PlatformAccount[];
}

export class PlatformConnectionRepository implements BaseRepository<PlatformConnection, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  /**
   * Creates a new platform connection.
   */
  async create(data: NewPlatformConnection): Promise<PlatformConnection> {
    const [result] = await this.db.insert(platformConnections).values(data).returning();
    if (!result) {
      throw new Error('Failed to create platform connection');
    }
    return result;
  }

  /**
   * Looks up a platform connection by unique ID across all tenants (internal use).
   */
  async findById(id: string): Promise<PlatformConnection | null> {
    const [result] = await this.db
      .select()
      .from(platformConnections)
      .where(eq(platformConnections.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Resolves a platform connection within strict tenant organization boundaries.
   */
  async findForOrganization(
    organizationId: string,
    connectionId: string,
  ): Promise<PlatformConnection | null> {
    const [result] = await this.db
      .select()
      .from(platformConnections)
      .where(
        and(
          eq(platformConnections.organizationId, organizationId),
          eq(platformConnections.id, connectionId),
        ),
      )
      .limit(1);
    return result || null;
  }

  /**
   * Lists all platform connections for an organization, optionally filtered by provider and status.
   */
  async listByOrganization(
    organizationId: string,
    filter?: { provider?: string; status?: ConnectionStatus },
  ): Promise<PlatformConnection[]> {
    const conditions = [eq(platformConnections.organizationId, organizationId)];

    if (filter?.provider) {
      conditions.push(eq(platformConnections.provider, filter.provider));
    }
    if (filter?.status) {
      conditions.push(eq(platformConnections.status, filter.status));
    }

    return this.db
      .select()
      .from(platformConnections)
      .where(and(...conditions))
      .orderBy(desc(platformConnections.createdAt));
  }

  /**
   * Lists all platform connections for an organization with their accounts.
   * Uses 2 queries (connections + accounts) instead of N+1.
   */
  async listWithAccountsByOrganization(
    organizationId: string,
  ): Promise<PlatformConnectionWithAccounts[]> {
    const connections = await this.db
      .select()
      .from(platformConnections)
      .where(eq(platformConnections.organizationId, organizationId))
      .orderBy(desc(platformConnections.createdAt));

    if (connections.length === 0) return [];

    const connectionIds = connections.map((c) => c.id);

    const allAccounts = await this.db
      .select()
      .from(platformAccounts)
      .where(inArray(platformAccounts.connectionId, connectionIds));

    const accountsByConnection = new Map<string, PlatformAccount[]>();
    for (const account of allAccounts) {
      const existing = accountsByConnection.get(account.connectionId) || [];
      existing.push(account);
      accountsByConnection.set(account.connectionId, existing);
    }

    return connections.map((conn) => ({
      ...conn,
      accounts: accountsByConnection.get(conn.id) || [],
    }));
  }

  /**
   * Updates platform connection status and/or metadata within strict tenant boundaries.
   */
  async update(
    id: string,
    organizationId: string,
    data: Partial<Omit<NewPlatformConnection, 'id' | 'organizationId' | 'createdAt'>>,
  ): Promise<PlatformConnection> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const [updated] = await this.db
      .update(platformConnections)
      .set(updateData)
      .where(
        and(eq(platformConnections.id, id), eq(platformConnections.organizationId, organizationId)),
      )
      .returning();

    if (!updated) {
      throw new Error(
        `Platform connection with ID '${id}' not found in organization '${organizationId}'`,
      );
    }

    return updated;
  }

  /**
   * Updates status of a platform connection.
   */
  async updateStatus(
    id: string,
    organizationId: string,
    status: ConnectionStatus,
  ): Promise<PlatformConnection> {
    return this.update(id, organizationId, { status });
  }

  /**
   * Deletes a platform connection within strict tenant boundaries.
   */
  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await this.db
      .delete(platformConnections)
      .where(
        and(eq(platformConnections.id, id), eq(platformConnections.organizationId, organizationId)),
      )
      .returning({ id: platformConnections.id });

    return result.length > 0;
  }
}

export class PlatformAccountRepository implements BaseRepository<PlatformAccount, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  /**
   * Creates a new platform account record linked to a connection.
   */
  async create(data: NewPlatformAccount): Promise<PlatformAccount> {
    const [result] = await this.db.insert(platformAccounts).values(data).returning();
    if (!result) {
      throw new Error('Failed to create platform account');
    }
    return result;
  }

  /**
   * Finds an account by ID.
   */
  async findById(id: string): Promise<PlatformAccount | null> {
    const [result] = await this.db
      .select()
      .from(platformAccounts)
      .where(eq(platformAccounts.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Finds an account by connection ID and external ID.
   */
  async findByConnectionAndExternalId(
    connectionId: string,
    externalId: string,
  ): Promise<PlatformAccount | null> {
    const [result] = await this.db
      .select()
      .from(platformAccounts)
      .where(
        and(
          eq(platformAccounts.connectionId, connectionId),
          eq(platformAccounts.externalId, externalId),
        ),
      )
      .limit(1);
    return result || null;
  }

  /**
   * Lists all accounts linked to a connection.
   */
  async listByConnection(connectionId: string): Promise<PlatformAccount[]> {
    return this.db
      .select()
      .from(platformAccounts)
      .where(eq(platformAccounts.connectionId, connectionId))
      .orderBy(desc(platformAccounts.createdAt));
  }

  /**
   * Updates an account.
   */
  async update(
    id: string,
    connectionId: string,
    data: Partial<Omit<NewPlatformAccount, 'id' | 'connectionId' | 'createdAt'>>,
  ): Promise<PlatformAccount> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const [updated] = await this.db
      .update(platformAccounts)
      .set(updateData)
      .where(and(eq(platformAccounts.id, id), eq(platformAccounts.connectionId, connectionId)))
      .returning();

    if (!updated) {
      throw new Error(
        `Platform account with ID '${id}' not found for connection '${connectionId}'`,
      );
    }

    return updated;
  }

  /**
   * Upserts a platform account by connectionId + externalId.
   */
  async upsert(data: NewPlatformAccount): Promise<PlatformAccount> {
    const existing = await this.findByConnectionAndExternalId(data.connectionId, data.externalId);
    if (existing) {
      return this.update(existing.id, data.connectionId, {
        username: data.username,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        metadata: data.metadata,
      });
    }
    return this.create(data);
  }

  /**
   * Deletes an account.
   */
  async delete(id: string, connectionId: string): Promise<boolean> {
    const result = await this.db
      .delete(platformAccounts)
      .where(and(eq(platformAccounts.id, id), eq(platformAccounts.connectionId, connectionId)))
      .returning({ id: platformAccounts.id });

    return result.length > 0;
  }
}

export const platformConnectionRepository = new PlatformConnectionRepository();
export const platformAccountRepository = new PlatformAccountRepository();
