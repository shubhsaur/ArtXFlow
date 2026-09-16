import { eq, and } from 'drizzle-orm';
import type { DbClient } from '../client';
import { getDb } from '../client';
import type { Transaction } from '../transactions';
import {
  organizations,
  memberships,
  type Organization,
  type NewOrganization,
  type MembershipRole,
} from '../schema/organizations';
import type { BaseRepository } from './index';

export type DbExecutor = DbClient | Transaction;

export interface UserOrganizationAccess {
  organization: Organization;
  role: MembershipRole;
}

export class OrganizationRepository implements BaseRepository<Organization, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  async create(data: NewOrganization): Promise<Organization> {
    const [result] = await this.db.insert(organizations).values(data).returning();
    if (!result) {
      throw new Error('Failed to create organization');
    }
    return result;
  }

  async findById(id: string): Promise<Organization | null> {
    const [result] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);
    return result || null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const [result] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    return result || null;
  }

  async update(
    id: string,
    data: Partial<Omit<NewOrganization, 'id' | 'createdAt'>>,
  ): Promise<Organization | null> {
    const [result] = await this.db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(organizations).where(eq(organizations.id, id)).returning();
    return result.length > 0;
  }

  /**
   * Tenant-scoped lookup: Retrieves the organization ONLY if the user is a valid member.
   * Rejects cross-organization access by returning null.
   */
  async getOrganizationForUser(
    organizationId: string,
    userId: string,
  ): Promise<UserOrganizationAccess | null> {
    const [result] = await this.db
      .select({
        organization: organizations,
        role: memberships.role,
      })
      .from(organizations)
      .innerJoin(
        memberships,
        and(eq(memberships.organizationId, organizations.id), eq(memberships.userId, userId)),
      )
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!result) {
      return null;
    }

    return {
      organization: result.organization,
      role: result.role,
    };
  }
}

export const organizationRepository = new OrganizationRepository();
