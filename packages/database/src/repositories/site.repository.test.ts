import { describe, it, expect, vi } from 'vitest';
import { SiteRepository } from './site.repository';
import { sites, siteStatusEnum, type Site, type NewSite } from '../schema/sites';
import type { DbClient } from '../client';

describe('Site Schema & SiteRepository', () => {
  const org1Id = '11111111-1111-1111-1111-111111111111';
  const org2Id = '22222222-2222-2222-2222-222222222222';

  const mockSite1: Site = {
    id: 'site-uuid-1',
    organizationId: org1Id,
    name: 'Acme Engineering Blog',
    subdomain: 'acme-eng',
    customDomain: 'blog.acme.com',
    status: 'ACTIVE',
    themeConfig: {
      primaryColor: '#0B87FE',
      accentColor: '#19D7FE',
      logoUrl: 'https://cdn.acme.com/logo.png',
      headerNavigation: [{ label: 'Home', url: '/' }],
    },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockSite2: Site = {
    id: 'site-uuid-2',
    organizationId: org2Id,
    name: 'Globex Developer Hub',
    subdomain: 'globex-dev',
    customDomain: null,
    status: 'ACTIVE',
    themeConfig: {},
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  };

  describe('Schema Invariants & Constraints', () => {
    it('defines the sites table with correct table name and columns', () => {
      expect(sites).toBeDefined();
      expect(sites.id).toBeDefined();
      expect(sites.organizationId).toBeDefined();
      expect(sites.name).toBeDefined();
      expect(sites.subdomain).toBeDefined();
      expect(sites.customDomain).toBeDefined();
      expect(sites.status).toBeDefined();
      expect(sites.themeConfig).toBeDefined();
      expect(sites.createdAt).toBeDefined();
      expect(sites.updatedAt).toBeDefined();
    });

    it('defines site_status enum with ACTIVE, MAINTENANCE, and ARCHIVED states', () => {
      expect(siteStatusEnum.enumValues).toEqual(['ACTIVE', 'MAINTENANCE', 'ARCHIVED']);
    });
  });

  describe('SiteRepository Operations', () => {
    it('creates a new hosted site with default and custom theme configuration', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockSite1]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      const newSiteInput: NewSite = {
        organizationId: org1Id,
        name: 'Acme Engineering Blog',
        subdomain: 'acme-eng',
        customDomain: 'blog.acme.com',
        status: 'ACTIVE',
        themeConfig: mockSite1.themeConfig,
      };

      const result = await repo.create(newSiteInput);
      expect(result).toEqual(mockSite1);
      expect(mockDb.insert).toHaveBeenCalledWith(sites);
    });

    it('throws when site creation fails to return a record', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      await expect(
        repo.create({
          organizationId: org1Id,
          name: 'Fail Site',
          subdomain: 'fail-site',
        }),
      ).rejects.toThrow('Failed to create site');
    });

    it('finds a site by unique ID', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockSite1]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      const result = await repo.findById('site-uuid-1');
      expect(result).toEqual(mockSite1);
    });

    it('finds a site by subdomain with case and whitespace trimming', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockSite1]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      const result = await repo.findBySubdomain('  ACME-ENG  ');
      expect(result).toEqual(mockSite1);
    });

    it('returns null when subdomain is not found', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      const result = await repo.findBySubdomain('non-existent');
      expect(result).toBeNull();
    });

    it('finds a site by custom domain', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockSite1]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      const result = await repo.findByCustomDomain('BLOG.ACME.COM');
      expect(result).toEqual(mockSite1);
    });

    it('checks subdomain availability accurately', async () => {
      // Subdomain is taken
      const mockDbTaken = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'site-uuid-1' }]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repoTaken = new SiteRepository(mockDbTaken);
      const availableTaken = await repoTaken.isSubdomainAvailable('acme-eng');
      expect(availableTaken).toBe(false);

      // Subdomain is free
      const mockDbFree = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repoFree = new SiteRepository(mockDbFree);
      const availableFree = await repoFree.isSubdomainAvailable('brand-new-subdomain');
      expect(availableFree).toBe(true);

      // Self-exclusion when updating own site
      const availableSelf = await repoFree.isSubdomainAvailable('acme-eng', 'site-uuid-1');
      expect(availableSelf).toBe(true);
    });
  });

  describe('Tenant Boundary & Multi-Tenant Isolation', () => {
    it('finds site when organization ID matches tenant', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockSite1]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      const result = await repo.findSiteForOrganization(org1Id, 'site-uuid-1');
      expect(result).toEqual(mockSite1);
    });

    it('returns null when attempting cross-tenant access with foreign organization ID', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      // Attempt to access org1's site with org2's credentials
      const result = await repo.findSiteForOrganization(org2Id, 'site-uuid-1');
      expect(result).toBeNull();
    });

    it('lists only sites belonging strictly to the requested organization', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([mockSite1]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      const sitesList = await repo.listByOrganization(org1Id);
      expect(sitesList).toHaveLength(1);
      expect(sitesList[0]?.organizationId).toBe(org1Id);
      expect(sitesList).not.toContainEqual(mockSite2);
    });

    it('updates site within tenant boundary', async () => {
      const updatedSite: Site = {
        ...mockSite1,
        name: 'Updated Acme Engineering Blog',
        status: 'MAINTENANCE',
        updatedAt: new Date('2026-01-05T00:00:00Z'),
      };

      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([updatedSite]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      const result = await repo.update('site-uuid-1', org1Id, {
        name: 'Updated Acme Engineering Blog',
        status: 'MAINTENANCE',
      });

      expect(result.name).toBe('Updated Acme Engineering Blog');
      expect(result.status).toBe('MAINTENANCE');
    });

    it('throws when attempting to update a site belonging to another organization', async () => {
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      await expect(
        repo.update('site-uuid-1', org2Id, {
          name: 'Hacked Title',
        }),
      ).rejects.toThrow("Site with ID 'site-uuid-1' not found in organization");
    });

    it('deletes site within tenant boundary and returns true', async () => {
      const mockDb = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: 'site-uuid-1' }]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      const deleted = await repo.delete('site-uuid-1', org1Id);
      expect(deleted).toBe(true);
    });

    it('returns false and does not delete when site is not owned by organization', async () => {
      const mockDb = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new SiteRepository(mockDb);
      const deleted = await repo.delete('site-uuid-1', org2Id);
      expect(deleted).toBe(false);
    });
  });
});
