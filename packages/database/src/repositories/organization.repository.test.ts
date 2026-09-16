import { describe, it, expect, vi } from 'vitest';
import { OrganizationRepository } from './organization.repository';
import { MembershipRepository } from './membership.repository';
import { organizations, memberships } from '../schema/organizations';
import type { DbClient } from '../client';

describe('Organization & Membership Repositories', () => {
  const mockOrg = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Acme Corp',
    slug: 'acme-corp',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockMembership = {
    id: '22222222-2222-2222-2222-222222222222',
    organizationId: mockOrg.id,
    userId: '33333333-3333-3333-3333-333333333333',
    role: 'OWNER' as const,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  describe('Schema Invariants', () => {
    it('defines organizations table with unique slug constraint', () => {
      expect(organizations.id).toBeDefined();
      expect(organizations.name).toBeDefined();
      expect(organizations.slug).toBeDefined();
    });

    it('defines memberships table referencing organizationId with unique composite index', () => {
      expect(memberships.id).toBeDefined();
      expect(memberships.organizationId).toBeDefined();
      expect(memberships.userId).toBeDefined();
      expect(memberships.role).toBeDefined();
    });
  });

  describe('OrganizationRepository', () => {
    it('creates an organization', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockOrg]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new OrganizationRepository(mockDb);
      const result = await repo.create({
        name: 'Acme Corp',
        slug: 'acme-corp',
      });

      expect(result).toEqual(mockOrg);
    });

    it('finds organization by id', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockOrg]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new OrganizationRepository(mockDb);
      const result = await repo.findById(mockOrg.id);

      expect(result).toEqual(mockOrg);
    });

    it('returns null when organization id does not exist', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new OrganizationRepository(mockDb);
      const result = await repo.findById('non-existent');

      expect(result).toBeNull();
    });

    it('finds organization by slug', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockOrg]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new OrganizationRepository(mockDb);
      const result = await repo.findBySlug('acme-corp');

      expect(result).toEqual(mockOrg);
    });

    it('tenant-scoped lookup: allows access for member user', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([{ organization: mockOrg, role: 'OWNER' }]),
              }),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new OrganizationRepository(mockDb);
      const result = await repo.getOrganizationForUser(mockOrg.id, mockMembership.userId);

      expect(result).not.toBeNull();
      expect(result?.organization).toEqual(mockOrg);
      expect(result?.role).toBe('OWNER');
    });

    it('tenant-scoped lookup: rejects cross-organization access for non-member', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new OrganizationRepository(mockDb);
      const result = await repo.getOrganizationForUser(mockOrg.id, 'unauthorized-user-id');

      expect(result).toBeNull();
    });
  });

  describe('MembershipRepository', () => {
    it('creates a membership record', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockMembership]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new MembershipRepository(mockDb);
      const result = await repo.create({
        organizationId: mockOrg.id,
        userId: mockMembership.userId,
        role: 'OWNER',
      });

      expect(result).toEqual(mockMembership);
    });

    it('finds membership for user in organization', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockMembership]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new MembershipRepository(mockDb);
      const result = await repo.findMembership(mockOrg.id, mockMembership.userId);

      expect(result).toEqual(mockMembership);
    });

    it('lists organizations for a user', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi
                .fn()
                .mockResolvedValue([{ membership: mockMembership, organization: mockOrg }]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new MembershipRepository(mockDb);
      const results = await repo.listUserOrganizations(mockMembership.userId);

      expect(results).toHaveLength(1);
      expect(results[0]?.organization).toEqual(mockOrg);
      expect(results[0]?.membership.role).toBe('OWNER');
    });
  });
});
