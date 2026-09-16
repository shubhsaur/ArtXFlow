import { eq, and, desc, ne } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import { sites, type Site, type NewSite } from '../schema/sites';
import type { BaseRepository } from './index';

export class SiteRepository implements BaseRepository<Site, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  /**
   * Creates a new hosted publication site.
   */
  async create(data: NewSite): Promise<Site> {
    const [result] = await this.db.insert(sites).values(data).returning();
    if (!result) {
      throw new Error('Failed to create site');
    }
    return result;
  }

  /**
   * Looks up a site by unique ID across all tenants (internal use).
   */
  async findById(id: string): Promise<Site | null> {
    const [result] = await this.db.select().from(sites).where(eq(sites.id, id)).limit(1);
    return result || null;
  }

  /**
   * Looks up a site by unique subdomain (used for <subdomain>.artxflow.com routing).
   */
  async findBySubdomain(subdomain: string): Promise<Site | null> {
    const [result] = await this.db
      .select()
      .from(sites)
      .where(eq(sites.subdomain, subdomain.toLowerCase().trim()))
      .limit(1);
    return result || null;
  }

  /**
   * Looks up a site by custom domain.
   */
  async findByCustomDomain(customDomain: string): Promise<Site | null> {
    const [result] = await this.db
      .select()
      .from(sites)
      .where(eq(sites.customDomain, customDomain.toLowerCase().trim()))
      .limit(1);
    return result || null;
  }

  /**
   * Resolves a site within strict tenant organization boundaries.
   * Returns null if the site belongs to another organization or does not exist.
   */
  async findSiteForOrganization(organizationId: string, siteId: string): Promise<Site | null> {
    const [result] = await this.db
      .select()
      .from(sites)
      .where(and(eq(sites.organizationId, organizationId), eq(sites.id, siteId)))
      .limit(1);
    return result || null;
  }

  /**
   * Lists all hosted sites belonging to an organization.
   */
  async listByOrganization(organizationId: string): Promise<Site[]> {
    return this.db
      .select()
      .from(sites)
      .where(eq(sites.organizationId, organizationId))
      .orderBy(desc(sites.createdAt));
  }

  /**
   * Updates site attributes within strict tenant boundaries.
   */
  async update(
    id: string,
    organizationId: string,
    data: Partial<Omit<NewSite, 'id' | 'organizationId' | 'createdAt'>>,
  ): Promise<Site> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const [updated] = await this.db
      .update(sites)
      .set(updateData)
      .where(and(eq(sites.id, id), eq(sites.organizationId, organizationId)))
      .returning();

    if (!updated) {
      throw new Error(`Site with ID '${id}' not found in organization '${organizationId}'`);
    }

    return updated;
  }

  /**
   * Deletes a site within strict tenant boundaries.
   */
  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await this.db
      .delete(sites)
      .where(and(eq(sites.id, id), eq(sites.organizationId, organizationId)))
      .returning({ id: sites.id });

    return result.length > 0;
  }

  /**
   * Checks if a subdomain is available for registration.
   */
  async isSubdomainAvailable(subdomain: string, excludeSiteId?: string): Promise<boolean> {
    const cleanSubdomain = subdomain.toLowerCase().trim();
    const condition = excludeSiteId
      ? and(eq(sites.subdomain, cleanSubdomain), ne(sites.id, excludeSiteId))
      : eq(sites.subdomain, cleanSubdomain);

    const [existing] = await this.db.select({ id: sites.id }).from(sites).where(condition).limit(1);

    return !existing;
  }
}

export const siteRepository = new SiteRepository();
