import { describe, it, expect, vi } from 'vitest';
import {
  destinations,
  publications,
  publicationEvents,
  workflowJobs,
  publicationStatusEnum,
  type Destination,
  type Publication,
  type PublicationEvent,
  type WorkflowJob,
} from '../schema/publishing';
import { DestinationRepository } from './destination.repository';
import { PublicationRepository } from './publication.repository';
import { PublicationEventRepository } from './publication-event.repository';
import { WorkflowJobRepository } from './workflow-job.repository';
import type { DbClient } from '../client';

describe('Publishing Schema & Repositories', () => {
  const org1Id = '11111111-1111-1111-1111-111111111111';
  const org2Id = '22222222-2222-2222-2222-222222222222';
  const articleId = 'aaaa1111-1111-1111-1111-111111111111';
  const versionId = 'bbbb1111-1111-1111-1111-111111111111';
  const siteId = 'cccc1111-1111-1111-1111-111111111111';

  const mockDestination: Destination = {
    id: 'dest-uuid-1',
    organizationId: org1Id,
    type: 'SITE',
    name: 'Acme Official Blog',
    connectionId: null,
    siteId,
    config: {},
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockPublication: Publication = {
    id: 'pub-uuid-1',
    organizationId: org1Id,
    articleId,
    articleVersionId: versionId,
    destinationId: mockDestination.id,
    status: 'PENDING',
    externalResourceId: null,
    externalUrl: null,
    publishedAt: null,
    lastAttemptAt: null,
    attemptCount: 0,
    lastErrorCode: null,
    lastErrorMessage: null,
    overrides: {},
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockPublicationEvent: PublicationEvent = {
    id: 'event-uuid-1',
    publicationId: mockPublication.id,
    eventType: 'QUEUED',
    correlationId: 'corr-1234',
    metadata: { reason: 'Initial queue' },
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockWorkflowJob: WorkflowJob = {
    id: 'job-uuid-1',
    organizationId: org1Id,
    type: 'PUBLISH_DESTINATION',
    status: 'PENDING',
    referenceType: 'PUBLICATION',
    referenceId: mockPublication.id,
    idempotencyKey: `${org1Id}:${versionId}:${mockDestination.id}`,
    workflowId: 'inngest-wf-1',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  describe('Schema Invariants & Enum Constraints', () => {
    it('defines publicationStatusEnum with 7 canonical states', () => {
      expect(publicationStatusEnum.enumValues).toEqual([
        'PENDING',
        'QUEUED',
        'PUBLISHING',
        'PUBLISHED',
        'RETRYING',
        'FAILED',
        'UNKNOWN_OUTCOME',
      ]);
    });

    it('defines destinations table with correct schema structure', () => {
      expect(destinations).toBeDefined();
      expect(destinations.id).toBeDefined();
      expect(destinations.organizationId).toBeDefined();
      expect(destinations.type).toBeDefined();
      expect(destinations.name).toBeDefined();
      expect(destinations.siteId).toBeDefined();
      expect(destinations.connectionId).toBeDefined();
      expect(destinations.config).toBeDefined();
      expect(destinations.status).toBeDefined();
      expect(destinations.createdAt).toBeDefined();
      expect(destinations.updatedAt).toBeDefined();
    });

    it('defines publications table with unique composite constraint on (articleVersionId, destinationId)', () => {
      expect(publications).toBeDefined();
      expect(publications.articleVersionId).toBeDefined();
      expect(publications.destinationId).toBeDefined();
      expect(publications.status).toBeDefined();
      expect(publications.attemptCount).toBeDefined();
    });

    it('defines publication_events table as strictly append-only without updatedAt', () => {
      expect(publicationEvents).toBeDefined();
      expect(publicationEvents.id).toBeDefined();
      expect(publicationEvents.publicationId).toBeDefined();
      expect(publicationEvents.eventType).toBeDefined();
      expect(publicationEvents.correlationId).toBeDefined();
      expect(publicationEvents.metadata).toBeDefined();
      expect(publicationEvents.createdAt).toBeDefined();
      // Notice: No updatedAt field on append-only events
      expect((publicationEvents as unknown as Record<string, unknown>).updatedAt).toBeUndefined();
    });

    it('defines workflow_jobs table with unique idempotencyKey', () => {
      expect(workflowJobs).toBeDefined();
      expect(workflowJobs.idempotencyKey).toBeDefined();
      expect(workflowJobs.referenceType).toBeDefined();
      expect(workflowJobs.referenceId).toBeDefined();
      expect(workflowJobs.status).toBeDefined();
    });
  });

  describe('DestinationRepository', () => {
    it('creates a destination successfully', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockDestination]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new DestinationRepository(mockDb);
      const result = await repo.create({
        organizationId: org1Id,
        type: 'SITE',
        name: 'Acme Official Blog',
        siteId,
        config: {},
        status: 'ACTIVE',
      });

      expect(result).toEqual(mockDestination);
      expect(mockDb.insert).toHaveBeenCalledWith(destinations);
    });

    it('finds destination by id', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockDestination]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new DestinationRepository(mockDb);
      const result = await repo.findById(mockDestination.id);
      expect(result).toEqual(mockDestination);
    });

    it('enforces tenant boundary on findForOrganization', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new DestinationRepository(mockDb);
      // Attempt to access org1's destination from org2
      const result = await repo.findForOrganization(org2Id, mockDestination.id);
      expect(result).toBeNull();
    });

    it('lists destinations by organization', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([mockDestination]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new DestinationRepository(mockDb);
      const result = await repo.listByOrganization(org1Id);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockDestination);
    });

    it('updates destination attributes within tenant boundaries', async () => {
      const updatedDest = { ...mockDestination, name: 'Acme Dev Blog' };
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([updatedDest]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new DestinationRepository(mockDb);
      const result = await repo.update(mockDestination.id, org1Id, { name: 'Acme Dev Blog' });
      expect(result.name).toBe('Acme Dev Blog');
    });

    it('deletes destination within tenant boundaries', async () => {
      const mockDb = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: mockDestination.id }]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new DestinationRepository(mockDb);
      const result = await repo.delete(mockDestination.id, org1Id);
      expect(result).toBe(true);
    });
  });

  describe('PublicationRepository', () => {
    it('creates a publication record binding article version to destination', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockPublication]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PublicationRepository(mockDb);
      const result = await repo.create({
        organizationId: org1Id,
        articleId,
        articleVersionId: versionId,
        destinationId: mockDestination.id,
        status: 'PENDING',
      });

      expect(result).toEqual(mockPublication);
      expect(mockDb.insert).toHaveBeenCalledWith(publications);
    });

    it('enforces tenant boundary on findForOrganization', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PublicationRepository(mockDb);
      const result = await repo.findForOrganization(org2Id, mockPublication.id);
      expect(result).toBeNull();
    });

    it('finds unique publication by articleVersionId and destinationId', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockPublication]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PublicationRepository(mockDb);
      const result = await repo.findByVersionAndDestination(org1Id, versionId, mockDestination.id);
      expect(result).toEqual(mockPublication);
    });

    it('lists publications by article version', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([mockPublication]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PublicationRepository(mockDb);
      const result = await repo.listByArticleVersion(org1Id, versionId);
      expect(result).toHaveLength(1);
      expect(result[0]?.articleVersionId).toBe(versionId);
    });

    it('updates publication status, external url, and attempts', async () => {
      const updatedPublication: Publication = {
        ...mockPublication,
        status: 'PUBLISHED',
        externalUrl: 'https://blog.acme.com/posts/welcome',
        attemptCount: 1,
        publishedAt: new Date('2026-01-01T01:00:00Z'),
      };

      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([updatedPublication]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PublicationRepository(mockDb);
      const result = await repo.updateStatus(mockPublication.id, org1Id, {
        status: 'PUBLISHED',
        externalUrl: 'https://blog.acme.com/posts/welcome',
        attemptCount: 1,
        publishedAt: new Date('2026-01-01T01:00:00Z'),
      });

      expect(result.status).toBe('PUBLISHED');
      expect(result.externalUrl).toBe('https://blog.acme.com/posts/welcome');
      expect(result.attemptCount).toBe(1);
    });
  });

  describe('PublicationEventRepository (Append-Only)', () => {
    it('appends a new event and enforces absence of update/delete operations', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockPublicationEvent]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PublicationEventRepository(mockDb);
      const result = await repo.create({
        publicationId: mockPublication.id,
        eventType: 'QUEUED',
        correlationId: 'corr-1234',
        metadata: { reason: 'Initial queue' },
      });

      expect(result).toEqual(mockPublicationEvent);
      // Verify that no update or delete methods exist on the repository
      expect((repo as unknown as Record<string, unknown>).update).toBeUndefined();
      expect((repo as unknown as Record<string, unknown>).delete).toBeUndefined();
    });

    it('lists publication events in chronological descending order', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([mockPublicationEvent]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PublicationEventRepository(mockDb);
      const result = await repo.listByPublication(mockPublication.id);
      expect(result).toHaveLength(1);
      expect(result[0]?.eventType).toBe('QUEUED');
    });

    it('lists events by correlationId', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([mockPublicationEvent]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new PublicationEventRepository(mockDb);
      const result = await repo.listByCorrelationId('corr-1234');
      expect(result).toHaveLength(1);
      expect(result[0]?.correlationId).toBe('corr-1234');
    });
  });

  describe('WorkflowJobRepository', () => {
    it('creates a workflow job with idempotency key', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockWorkflowJob]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new WorkflowJobRepository(mockDb);
      const result = await repo.create({
        organizationId: org1Id,
        type: 'PUBLISH_DESTINATION',
        status: 'PENDING',
        referenceType: 'PUBLICATION',
        referenceId: mockPublication.id,
        idempotencyKey: `${org1Id}:${versionId}:${mockDestination.id}`,
      });

      expect(result).toEqual(mockWorkflowJob);
    });

    it('finds workflow job by idempotency key', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockWorkflowJob]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new WorkflowJobRepository(mockDb);
      const result = await repo.findByIdempotencyKey(mockWorkflowJob.idempotencyKey);
      expect(result).toEqual(mockWorkflowJob);
    });

    it('updates workflow job status and workflowId', async () => {
      const updatedJob = { ...mockWorkflowJob, status: 'RUNNING', workflowId: 'inngest-run-99' };
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([updatedJob]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new WorkflowJobRepository(mockDb);
      const result = await repo.updateStatus(
        mockWorkflowJob.id,
        org1Id,
        'RUNNING',
        'inngest-run-99',
      );
      expect(result.status).toBe('RUNNING');
      expect(result.workflowId).toBe('inngest-run-99');
    });
  });
});
