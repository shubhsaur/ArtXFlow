import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import { assets, type Asset, type NewAsset } from '../schema/assets';
import type { BaseRepository } from './index';

export class AssetRepository implements BaseRepository<Asset, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  async create(data: NewAsset): Promise<Asset> {
    const [result] = await this.db.insert(assets).values(data).returning();
    if (!result) {
      throw new Error('Failed to create asset');
    }
    return result;
  }

  async findById(id: string): Promise<Asset | null> {
    const [result] = await this.db.select().from(assets).where(eq(assets.id, id)).limit(1);
    return result || null;
  }

  async findForOrganization(organizationId: string, id: string): Promise<Asset | null> {
    const [result] = await this.db
      .select()
      .from(assets)
      .where(and(eq(assets.organizationId, organizationId), eq(assets.id, id)))
      .limit(1);
    return result || null;
  }

  async listByOrganization(organizationId: string): Promise<Asset[]> {
    return this.db
      .select()
      .from(assets)
      .where(eq(assets.organizationId, organizationId))
      .orderBy(desc(assets.createdAt));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(assets).where(eq(assets.id, id)).returning();
    return result.length > 0;
  }

  async deleteForOrganization(organizationId: string, id: string): Promise<boolean> {
    const result = await this.db
      .delete(assets)
      .where(and(eq(assets.organizationId, organizationId), eq(assets.id, id)))
      .returning();
    return result.length > 0;
  }
}

export const assetRepository = new AssetRepository();
