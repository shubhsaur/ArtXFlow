import { eq, and } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import {
  memberships,
  organizations,
  type Membership,
  type NewMembership,
  type MembershipRole,
  type Organization,
} from '../schema/organizations';

export interface UserOrganizationMembership {
  membership: Membership;
  organization: Organization;
}

export class MembershipRepository {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  async create(data: NewMembership): Promise<Membership> {
    const [result] = await this.db.insert(memberships).values(data).returning();
    if (!result) {
      throw new Error('Failed to create membership');
    }
    return result;
  }

  async findMembership(organizationId: string, userId: string): Promise<Membership | null> {
    const [result] = await this.db
      .select()
      .from(memberships)
      .where(and(eq(memberships.organizationId, organizationId), eq(memberships.userId, userId)))
      .limit(1);
    return result || null;
  }

  async listUserOrganizations(userId: string): Promise<UserOrganizationMembership[]> {
    const results = await this.db
      .select({
        membership: memberships,
        organization: organizations,
      })
      .from(memberships)
      .innerJoin(organizations, eq(organizations.id, memberships.organizationId))
      .where(eq(memberships.userId, userId));

    return results;
  }

  async listOrganizationMembers(organizationId: string): Promise<Membership[]> {
    const results = await this.db
      .select()
      .from(memberships)
      .where(eq(memberships.organizationId, organizationId));

    return results;
  }

  async updateRole(
    organizationId: string,
    userId: string,
    role: MembershipRole,
  ): Promise<Membership | null> {
    const [result] = await this.db
      .update(memberships)
      .set({ role })
      .where(and(eq(memberships.organizationId, organizationId), eq(memberships.userId, userId)))
      .returning();
    return result || null;
  }

  async delete(organizationId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(memberships)
      .where(and(eq(memberships.organizationId, organizationId), eq(memberships.userId, userId)))
      .returning();
    return result.length > 0;
  }
}

export const membershipRepository = new MembershipRepository();
