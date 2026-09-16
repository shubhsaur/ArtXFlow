import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  WorkflowJobQueue,
  MemoryJobQueue,
  type JobDispatcher,
  type EnqueueJobInput,
  type ScheduleJobInput,
  MissingIdempotencyKeyError,
  JobCancellationError,
} from '../index';
import type { WorkflowJob, WorkflowJobRepository } from '@artxflow/database';
import fs from 'fs';
import path from 'path';

describe('JobQueue Abstraction & Idempotency Contract', () => {
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
    workflowId: 'ext-transport-run-1',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  describe('WorkflowJobQueue (Database-Backed)', () => {
    let mockRepo: WorkflowJobRepository;
    let mockDispatcher: JobDispatcher;
    let queue: WorkflowJobQueue;

    beforeEach(() => {
      mockRepo = {
        create: vi.fn().mockResolvedValue(mockWorkflowJob),
        findByIdempotencyKey: vi.fn().mockResolvedValue(null),
        findForOrganization: vi.fn().mockResolvedValue(mockWorkflowJob),
        updateStatus: vi.fn().mockResolvedValue(mockWorkflowJob),
        findById: vi.fn().mockResolvedValue(mockWorkflowJob),
        listByReference: vi.fn().mockResolvedValue([mockWorkflowJob]),
      } as unknown as WorkflowJobRepository;

      mockDispatcher = {
        dispatch: vi.fn().mockResolvedValue('ext-transport-run-1'),
        schedule: vi.fn().mockResolvedValue('ext-transport-sched-1'),
        cancel: vi.fn().mockResolvedValue(undefined),
      };

      queue = new WorkflowJobQueue(mockRepo, mockDispatcher);
    });

    it('strictly requires idempotencyKey for side-effecting jobs', async () => {
      const input: EnqueueJobInput = {
        type: 'PUBLISH_DESTINATION',
        organizationId: org1Id,
        referenceType: 'PUBLICATION',
        referenceId: pubId,
        // Missing idempotencyKey!
      };

      await expect(queue.enqueue(input)).rejects.toThrow(MissingIdempotencyKeyError);
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it('enqueues side-effecting job and delegates to dispatcher when key is provided', async () => {
      const input: EnqueueJobInput = {
        type: 'PUBLISH_DESTINATION',
        organizationId: org1Id,
        referenceType: 'PUBLICATION',
        referenceId: pubId,
        idempotencyKey,
      };

      const result = await queue.enqueue(input);

      expect(result.status).toBe('QUEUED');
      expect(result.idempotencyKey).toBe(idempotencyKey);
      expect(result.workflowJobId).toBe('ext-transport-run-1');
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: org1Id,
          type: 'PUBLISH_DESTINATION',
          idempotencyKey,
          status: 'QUEUED',
        }),
      );
      expect(mockDispatcher.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockWorkflowJob.id,
          idempotencyKey,
        }),
      );
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(
        mockWorkflowJob.id,
        org1Id,
        'QUEUED',
        'ext-transport-run-1',
      );
    });

    it('enforces idempotency: returns ALREADY_EXISTS without duplicate execution when key exists', async () => {
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValueOnce(mockWorkflowJob);

      const input: EnqueueJobInput = {
        type: 'PUBLISH_DESTINATION',
        organizationId: org1Id,
        referenceType: 'PUBLICATION',
        referenceId: pubId,
        idempotencyKey,
      };

      const result = await queue.enqueue(input);

      expect(result.status).toBe('ALREADY_EXISTS');
      expect(result.jobId).toBe(mockWorkflowJob.id);
      expect(result.idempotencyKey).toBe(idempotencyKey);
      // No duplicate DB row creation or external transport dispatch!
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it('schedules future jobs with scheduledAt timestamp and updates transport', async () => {
      const scheduledAt = new Date('2026-06-01T12:00:00Z');
      const input: ScheduleJobInput = {
        type: 'PUBLISH_DESTINATION',
        organizationId: org1Id,
        referenceType: 'PUBLICATION',
        referenceId: pubId,
        idempotencyKey,
        scheduledAt,
      };

      const result = await queue.schedule(input);

      expect(result.status).toBe('SCHEDULED');
      expect(result.scheduledAt).toBe(scheduledAt.toISOString());
      expect(mockDispatcher.schedule).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockWorkflowJob.id,
          idempotencyKey,
          scheduledAt,
        }),
      );
    });

    it('cancels queued jobs and delegates to transport cancellation', async () => {
      await queue.cancel({
        organizationId: org1Id,
        jobId: mockWorkflowJob.id,
      });

      expect(mockRepo.updateStatus).toHaveBeenCalledWith(mockWorkflowJob.id, org1Id, 'CANCELED');
      expect(mockDispatcher.cancel).toHaveBeenCalledWith(mockWorkflowJob.id, 'ext-transport-run-1');
    });

    it('rejects cancellation of running or completed jobs', async () => {
      vi.mocked(mockRepo.findForOrganization).mockResolvedValueOnce({
        ...mockWorkflowJob,
        status: 'RUNNING',
      });

      await expect(
        queue.cancel({ organizationId: org1Id, jobId: mockWorkflowJob.id }),
      ).rejects.toThrow(JobCancellationError);
      expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('MemoryJobQueue (In-Memory Implementation)', () => {
    let memoryQueue: MemoryJobQueue;

    beforeEach(() => {
      memoryQueue = new MemoryJobQueue();
    });

    it('enforces idempotency in-memory', async () => {
      const input: EnqueueJobInput = {
        type: 'PUBLISH_DESTINATION',
        organizationId: org1Id,
        referenceType: 'PUBLICATION',
        referenceId: pubId,
        idempotencyKey,
      };

      const first = await memoryQueue.enqueue(input);
      expect(first.status).toBe('QUEUED');

      const second = await memoryQueue.enqueue(input);
      expect(second.status).toBe('ALREADY_EXISTS');
      expect(second.jobId).toBe(first.jobId);
    });

    it('rejects missing idempotency key for side-effecting jobs', async () => {
      const input: EnqueueJobInput = {
        type: 'PUBLISH_DESTINATION',
        organizationId: org1Id,
        referenceType: 'PUBLICATION',
        referenceId: pubId,
      };

      await expect(memoryQueue.enqueue(input)).rejects.toThrow(MissingIdempotencyKeyError);
    });

    it('cancels scheduled or queued memory jobs', async () => {
      const input: EnqueueJobInput = {
        type: 'PUBLISH_DESTINATION',
        organizationId: org1Id,
        referenceType: 'PUBLICATION',
        referenceId: pubId,
        idempotencyKey,
      };

      const enqueued = await memoryQueue.enqueue(input);
      await memoryQueue.cancel({ organizationId: org1Id, jobId: enqueued.jobId });

      const job = memoryQueue.getJob(enqueued.jobId);
      expect(job?.status).toBe('CANCELED');
    });
  });

  describe('Architectural Boundaries & Zero Inngest Leakage', () => {
    it('ensures @artxflow/publishing contains zero imports of Inngest', () => {
      const publishingSrcDir = path.resolve(__dirname, '..');
      const scanFiles = (dir: string): string[] => {
        let results: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results = results.concat(scanFiles(fullPath));
          } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
            results.push(fullPath);
          }
        }
        return results;
      };

      const srcFiles = scanFiles(publishingSrcDir);
      for (const file of srcFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content).not.toMatch(/from\s+['"]inngest/i);
        expect(content).not.toMatch(/import\s+.*inngest/i);
      }
    });
  });
});
