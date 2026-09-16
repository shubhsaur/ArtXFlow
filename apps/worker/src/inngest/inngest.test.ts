import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inngest } from './client';
import { INNGEST_EVENTS } from './events';
import { inngestFunctions } from './functions';
import { InngestJobDispatcher, createInngestJobQueue } from './queue-adapter';
import type { WorkflowJob, WorkflowJobRepository } from '@artxflow/database';
import fs from 'fs';
import path from 'path';

describe('Inngest Workflow Integration (TASK-018)', () => {
  const org1Id = '11111111-1111-1111-1111-111111111111';
  const pubId = 'pub-uuid-1';
  const idempotencyKey = `${org1Id}:PUBLISH_DESTINATION:${pubId}`;

  const mockWorkflowJob: WorkflowJob = {
    id: 'job-uuid-1',
    organizationId: org1Id,
    type: 'PUBLISH_DESTINATION',
    status: 'QUEUED',
    referenceType: 'PUBLICATION',
    referenceId: pubId,
    idempotencyKey,
    workflowId: 'inngest-evt-1',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  describe('Inngest Client & Event Schemas', () => {
    it('initializes Inngest client with artxflow id', () => {
      expect(inngest.id).toBe('artxflow');
    });

    it('defines standard ArtXFlow event names', () => {
      expect(INNGEST_EVENTS.DISTRIBUTION_REQUESTED).toBe('artxflow/distribution.requested');
      expect(INNGEST_EVENTS.PUBLICATION_REQUESTED).toBe('artxflow/publication.requested');
      expect(INNGEST_EVENTS.PUBLICATION_RETRY_REQUESTED).toBe(
        'artxflow/publication.retry_requested',
      );
      expect(INNGEST_EVENTS.SCHEDULE_CREATED).toBe('artxflow/schedule.created');
      expect(INNGEST_EVENTS.ANALYTICS_SYNC_REQUESTED).toBe('artxflow/analytics.sync_requested');
    });

    it('registers all 5 workflow functions', () => {
      expect(inngestFunctions).toHaveLength(5);
      const functionIds = inngestFunctions.map((fn) =>
        typeof fn.id === 'function' ? fn.id() : fn.id,
      );
      expect(functionIds.some((id) => id.includes('publication-requested'))).toBe(true);
      expect(functionIds.some((id) => id.includes('publication-retry-requested'))).toBe(true);
      expect(functionIds.some((id) => id.includes('distribution-requested'))).toBe(true);
      expect(functionIds.some((id) => id.includes('schedule-created'))).toBe(true);
      expect(functionIds.some((id) => id.includes('analytics-sync-requested'))).toBe(true);
    });
  });

  describe('InngestJobDispatcher', () => {
    let mockClient: { send: ReturnType<typeof vi.fn> };
    let dispatcher: InngestJobDispatcher;

    beforeEach(() => {
      mockClient = {
        send: vi.fn().mockResolvedValue({ ids: ['inngest-evt-1'] }),
      };
      dispatcher = new InngestJobDispatcher(mockClient as unknown as typeof inngest);
    });

    it('dispatches PUBLISH_DESTINATION as artxflow/publication.requested', async () => {
      const runId = await dispatcher.dispatch({
        id: 'job-1',
        type: 'PUBLISH_DESTINATION',
        idempotencyKey,
        organizationId: org1Id,
        payload: { publicationId: pubId },
        correlationId: 'corr-1',
      });

      expect(runId).toBe('inngest-evt-1');
      expect(mockClient.send).toHaveBeenCalledWith({
        name: INNGEST_EVENTS.PUBLICATION_REQUESTED,
        data: {
          publicationId: pubId,
          organizationId: org1Id,
          correlationId: 'corr-1',
          idempotencyKey,
        },
      });
    });

    it('dispatches DISTRIBUTE_ARTICLE as artxflow/distribution.requested', async () => {
      const runId = await dispatcher.dispatch({
        id: 'job-2',
        type: 'DISTRIBUTE_ARTICLE',
        idempotencyKey: 'dist-key',
        organizationId: org1Id,
        payload: { distributionId: 'dist-1' },
      });

      expect(runId).toBe('inngest-evt-1');
      expect(mockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          name: INNGEST_EVENTS.DISTRIBUTION_REQUESTED,
          data: expect.objectContaining({
            distributionId: 'dist-1',
            organizationId: org1Id,
          }),
        }),
      );
    });

    it('dispatches RETRY_PUBLICATION as artxflow/publication.retry_requested', async () => {
      const runId = await dispatcher.dispatch({
        id: 'job-3',
        type: 'RETRY_PUBLICATION',
        idempotencyKey: 'retry-key',
        organizationId: org1Id,
        payload: { publicationId: pubId },
      });

      expect(runId).toBe('inngest-evt-1');
      expect(mockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          name: INNGEST_EVENTS.PUBLICATION_RETRY_REQUESTED,
          data: expect.objectContaining({
            publicationId: pubId,
            organizationId: org1Id,
          }),
        }),
      );
    });

    it('schedules future jobs as artxflow/schedule.created', async () => {
      const scheduledAt = new Date('2026-07-01T10:00:00Z');
      const runId = await dispatcher.schedule({
        id: 'job-4',
        type: 'PUBLISH_DESTINATION',
        idempotencyKey,
        organizationId: org1Id,
        payload: { scheduleId: 'sched-1', articleVersionId: 'ver-1' },
        scheduledAt,
      });

      expect(runId).toBe('inngest-evt-1');
      expect(mockClient.send).toHaveBeenCalledWith({
        name: INNGEST_EVENTS.SCHEDULE_CREATED,
        data: expect.objectContaining({
          scheduleId: 'sched-1',
          organizationId: org1Id,
          articleVersionId: 'ver-1',
          scheduledAt: scheduledAt.toISOString(),
        }),
      });
    });
  });

  describe('createInngestJobQueue Factory & Idempotency', () => {
    it('creates a WorkflowJobQueue backed by Inngest that suppresses duplicate events', async () => {
      const mockRepo = {
        findByIdempotencyKey: vi.fn().mockResolvedValue(mockWorkflowJob),
        create: vi.fn(),
      } as unknown as WorkflowJobRepository;

      const mockClient = {
        send: vi.fn(),
      };
      const dispatcher = new InngestJobDispatcher(mockClient as unknown as typeof inngest);

      const queue = createInngestJobQueue(mockRepo, dispatcher);

      const result = await queue.enqueue({
        type: 'PUBLISH_DESTINATION',
        organizationId: org1Id,
        referenceType: 'PUBLICATION',
        referenceId: pubId,
        idempotencyKey,
      });

      expect(result.status).toBe('ALREADY_EXISTS');
      expect(mockClient.send).not.toHaveBeenCalled();
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('Architectural Invariant: Zero Inngest Leakage into Domain Packages', () => {
    it('ensures core domain packages contain zero imports of inngest', () => {
      const rootDir = path.resolve(__dirname, '../../../../');
      const domainDirs = [
        path.join(rootDir, 'packages/publishing/src'),
        path.join(rootDir, 'packages/content-core/src'),
        path.join(rootDir, 'packages/database/src'),
        path.join(rootDir, 'packages/platform-adapters/src'),
      ];

      const scanDirectory = (dir: string): string[] => {
        let results: string[] = [];
        if (!fs.existsSync(dir)) return results;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results = results.concat(scanDirectory(full));
          } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
            results.push(full);
          }
        }
        return results;
      };

      for (const domainDir of domainDirs) {
        const files = scanDirectory(domainDir);
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          expect(content).not.toMatch(/from\s+['"]inngest/i);
          expect(content).not.toMatch(/import\s+.*inngest/i);
        }
      }
    });
  });
});
