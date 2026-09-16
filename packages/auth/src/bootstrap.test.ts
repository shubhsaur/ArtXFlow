import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateOrgSlug, resolveUniqueSlug, bootstrapPersonalOrganization } from './bootstrap';
import type * as DatabaseModule from '@artxflow/database';
import {
  OrganizationRepository,
  MembershipRepository,
  type Organization,
  type Membership,
} from '@artxflow/database';

vi.mock('@artxflow/database', async (importOriginal) => {
  const actual = await importOriginal<typeof DatabaseModule>();
  return {
    ...actual,
    withTransaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb({})),
  };
});

describe('Personal Organization Bootstrap', () => {
  const mockOrg: Organization = {
    id: 'org-uuid-1',
    name: "Jane's Workspace",
    slug: 'jane',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockMembership: Membership = {
    id: 'mem-uuid-1',
    organizationId: mockOrg.id,
    userId: 'user-123',
    role: 'OWNER',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateOrgSlug', () => {
    it('converts a regular name to a lowercase slug', () => {
      expect(generateOrgSlug('Jane Doe')).toBe('jane-doe');
    });

    it('handles special characters and extra whitespace', () => {
      expect(generateOrgSlug("  Jane & Bob's Tech-Blog!  ")).toBe('jane-bob-s-tech-blog');
    });

    it('falls back to "personal" when string is empty or symbols only', () => {
      expect(generateOrgSlug('')).toBe('personal');
      expect(generateOrgSlug('   ')).toBe('personal');
      expect(generateOrgSlug('!@#$%^&*()')).toBe('personal');
    });
  });

  describe('resolveUniqueSlug', () => {
    it('returns base slug if no collision exists', async () => {
      const mockOrgRepo = {
        findBySlug: vi.fn().mockResolvedValue(null),
      } as unknown as OrganizationRepository;

      const slug = await resolveUniqueSlug('jane-doe', mockOrgRepo);
      expect(slug).toBe('jane-doe');
      expect(mockOrgRepo.findBySlug).toHaveBeenCalledWith('jane-doe');
    });

    it('appends incrementing counter on collision until unique', async () => {
      const mockOrgRepo = {
        findBySlug: vi
          .fn()
          .mockResolvedValueOnce(mockOrg) // jane-doe exists
          .mockResolvedValueOnce(mockOrg) // jane-doe-2 exists
          .mockResolvedValue(null), // jane-doe-3 available
      } as unknown as OrganizationRepository;

      const slug = await resolveUniqueSlug('jane-doe', mockOrgRepo);
      expect(slug).toBe('jane-doe-3');
      expect(mockOrgRepo.findBySlug).toHaveBeenCalledTimes(3);
      expect(mockOrgRepo.findBySlug).toHaveBeenNthCalledWith(1, 'jane-doe');
      expect(mockOrgRepo.findBySlug).toHaveBeenNthCalledWith(2, 'jane-doe-2');
      expect(mockOrgRepo.findBySlug).toHaveBeenNthCalledWith(3, 'jane-doe-3');
    });
  });

  describe('bootstrapPersonalOrganization', () => {
    it('creates personal organization and OWNER membership on first login', async () => {
      const listUserOrgsSpy = vi
        .spyOn(MembershipRepository.prototype, 'listUserOrganizations')
        .mockResolvedValue([]);
      const findBySlugSpy = vi
        .spyOn(OrganizationRepository.prototype, 'findBySlug')
        .mockResolvedValue(null);
      const createOrgSpy = vi
        .spyOn(OrganizationRepository.prototype, 'create')
        .mockResolvedValue(mockOrg);
      const createMemSpy = vi
        .spyOn(MembershipRepository.prototype, 'create')
        .mockResolvedValue(mockMembership);

      const result = await bootstrapPersonalOrganization({
        userId: 'user-123',
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      expect(result.created).toBe(true);
      expect(result.organization).toEqual(mockOrg);
      expect(result.membership).toEqual(mockMembership);
      expect(result.membership.role).toBe('OWNER');

      expect(listUserOrgsSpy).toHaveBeenCalled();
      expect(findBySlugSpy).toHaveBeenCalledWith('jane-doe');
      expect(createOrgSpy).toHaveBeenCalledWith({
        name: "Jane Doe's Workspace",
        slug: 'jane-doe',
      });
      expect(createMemSpy).toHaveBeenCalledWith({
        organizationId: mockOrg.id,
        userId: 'user-123',
        role: 'OWNER',
      });
    });

    it('falls back to email prefix if name is absent', async () => {
      vi.spyOn(MembershipRepository.prototype, 'listUserOrganizations').mockResolvedValue([]);
      vi.spyOn(OrganizationRepository.prototype, 'findBySlug').mockResolvedValue(null);
      const createOrgSpy = vi
        .spyOn(OrganizationRepository.prototype, 'create')
        .mockResolvedValue(mockOrg);
      vi.spyOn(MembershipRepository.prototype, 'create').mockResolvedValue(mockMembership);

      await bootstrapPersonalOrganization({
        userId: 'user-123',
        name: null,
        email: 'alex@example.com',
      });

      expect(createOrgSpy).toHaveBeenCalledWith({
        name: "alex's Workspace",
        slug: 'alex',
      });
    });

    it('is idempotent: returns existing organization and does not create a duplicate on repeat login', async () => {
      const listUserOrgsSpy = vi
        .spyOn(MembershipRepository.prototype, 'listUserOrganizations')
        .mockResolvedValue([{ membership: mockMembership, organization: mockOrg }]);
      const createOrgSpy = vi.spyOn(OrganizationRepository.prototype, 'create');
      const createMemSpy = vi.spyOn(MembershipRepository.prototype, 'create');

      const result = await bootstrapPersonalOrganization({
        userId: 'user-123',
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      expect(result.created).toBe(false);
      expect(result.organization).toEqual(mockOrg);
      expect(result.membership).toEqual(mockMembership);
      expect(listUserOrgsSpy).toHaveBeenCalledWith('user-123');
      expect(createOrgSpy).not.toHaveBeenCalled();
      expect(createMemSpy).not.toHaveBeenCalled();
    });

    it('propagates transaction error if membership creation fails (rollback simulation)', async () => {
      vi.spyOn(MembershipRepository.prototype, 'listUserOrganizations').mockResolvedValue([]);
      vi.spyOn(OrganizationRepository.prototype, 'findBySlug').mockResolvedValue(null);
      vi.spyOn(OrganizationRepository.prototype, 'create').mockResolvedValue(mockOrg);
      vi.spyOn(MembershipRepository.prototype, 'create').mockRejectedValue(
        new Error('Database write error'),
      );

      await expect(
        bootstrapPersonalOrganization({
          userId: 'user-123',
          name: 'Jane Doe',
          email: 'jane@example.com',
        }),
      ).rejects.toThrow('Database write error');
    });

    it('handles concurrent race condition where organization is created between checks', async () => {
      // First check outside transaction says no org
      // Second check inside transaction detects org already created by concurrent request
      vi.spyOn(MembershipRepository.prototype, 'listUserOrganizations')
        .mockResolvedValueOnce([]) // Outside tx
        .mockResolvedValueOnce([{ membership: mockMembership, organization: mockOrg }]); // Inside tx

      const createOrgSpy = vi.spyOn(OrganizationRepository.prototype, 'create');
      const createMemSpy = vi.spyOn(MembershipRepository.prototype, 'create');

      const result = await bootstrapPersonalOrganization({
        userId: 'user-123',
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      expect(result.created).toBe(false);
      expect(result.organization).toEqual(mockOrg);
      expect(createOrgSpy).not.toHaveBeenCalled();
      expect(createMemSpy).not.toHaveBeenCalled();
    });
  });
});
