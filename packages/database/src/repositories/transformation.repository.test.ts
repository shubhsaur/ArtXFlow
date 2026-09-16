import { describe, it, expect, vi } from 'vitest';
import { TransformationRepository } from './transformation.repository';
import type { Transformation } from '../schema/transformations';
import type { DbExecutor } from './organization.repository';

describe('TransformationRepository', () => {
  const org1Id = '11111111-1111-1111-1111-111111111111';
  const versionId = 'aaaa1111-1111-1111-1111-111111111111';

  const mockTransformation: Transformation = {
    id: 'trans-1',
    organizationId: org1Id,
    articleVersionId: versionId,
    destinationId: null,
    kind: 'AI_ADAPTATION',
    provider: 'gemini',
    inputHash: 'hash123',
    outputContent: '# Generated Markdown',
    outputMetadata: { tokensUsed: 200 },
    status: 'PENDING_APPROVAL',
    approvedAt: null,
    approvedByUserId: null,
    createdAt: new Date('2026-09-17T12:00:00Z'),
    updatedAt: new Date('2026-09-17T12:00:00Z'),
  };

  it('creates transformation artifact record', async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockTransformation]),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new TransformationRepository(mockDb);
    const created = await repo.create({
      organizationId: org1Id,
      articleVersionId: versionId,
      kind: 'AI_ADAPTATION',
      provider: 'gemini',
      inputHash: 'hash123',
      outputContent: '# Generated Markdown',
    });

    expect(created.id).toBe('trans-1');
    expect(created.status).toBe('PENDING_APPROVAL');
  });

  it('finds transformation for organization', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockTransformation]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new TransformationRepository(mockDb);
    const result = await repo.findForOrganization(org1Id, 'trans-1');
    expect(result).toEqual(mockTransformation);
  });

  it('lists transformations for an article version', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([mockTransformation]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new TransformationRepository(mockDb);
    const results = await repo.listForArticleVersion(org1Id, versionId);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('trans-1');
  });

  it('updates status and approved metadata upon user approval', async () => {
    const approvedTransformation: Transformation = {
      ...mockTransformation,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-17T12:05:00Z'),
      approvedByUserId: 'usr-admin-1',
    };

    const mockDb = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([approvedTransformation]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new TransformationRepository(mockDb);
    const updated = await repo.updateStatus(org1Id, 'trans-1', 'APPROVED', 'usr-admin-1');
    expect(updated.status).toBe('APPROVED');
    expect(updated.approvedByUserId).toBe('usr-admin-1');
    expect(updated.approvedAt).toBeDefined();
  });
});
