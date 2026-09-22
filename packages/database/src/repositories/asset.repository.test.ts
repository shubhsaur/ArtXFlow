import { describe, it, expect, vi } from 'vitest';
import { AssetRepository } from './asset.repository';
import type { Asset } from '../schema/assets';
import type { DbExecutor } from './organization.repository';

describe('AssetRepository', () => {
  const org1Id = '11111111-1111-1111-1111-111111111111';
  const assetId = 'aaaa1111-2222-3333-4444-555555555555';

  const mockAsset: Asset = {
    id: assetId,
    organizationId: org1Id,
    type: 'IMAGE',
    storageKey: 'orgs/11111111-1111-1111-1111-111111111111/images/hero.png',
    fileName: 'hero.png',
    mimeType: 'image/png',
    sizeBytes: 102400,
    width: 1200,
    height: 630,
    url: 'https://media.artxflow.com/orgs/11111111-1111-1111-1111-111111111111/images/hero.png',
    createdAt: new Date('2026-09-18T12:00:00Z'),
  };

  it('creates an asset record', async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAsset]),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new AssetRepository(mockDb);
    const created = await repo.create({
      organizationId: org1Id,
      type: 'IMAGE',
      storageKey: 'orgs/11111111-1111-1111-1111-111111111111/images/hero.png',
      fileName: 'hero.png',
      mimeType: 'image/png',
      sizeBytes: 102400,
      width: 1200,
      height: 630,
      url: 'https://media.artxflow.com/orgs/11111111-1111-1111-1111-111111111111/images/hero.png',
    });

    expect(created.id).toBe(assetId);
    expect(created.fileName).toBe('hero.png');
    expect(created.mimeType).toBe('image/png');
  });

  it('finds asset by id', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockAsset]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new AssetRepository(mockDb);
    const result = await repo.findById(assetId);
    expect(result).toEqual(mockAsset);
  });

  it('finds asset for an organization', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockAsset]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new AssetRepository(mockDb);
    const result = await repo.findForOrganization(org1Id, assetId);
    expect(result).toEqual(mockAsset);
  });

  it('lists assets by organization', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([mockAsset]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new AssetRepository(mockDb);
    const list = await repo.listByOrganization(org1Id);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(assetId);
  });

  it('deletes asset for organization', async () => {
    const mockDb = {
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAsset]),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new AssetRepository(mockDb);
    const success = await repo.deleteForOrganization(org1Id, assetId);
    expect(success).toBe(true);
  });
});
