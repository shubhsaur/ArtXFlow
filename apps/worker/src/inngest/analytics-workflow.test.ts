import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsSyncRequested } from './functions/analytics';
import { analyticsSyncService } from '@artxflow/publishing';
import { PlatformError } from '@artxflow/platform-adapters';
import { NonRetriableError } from 'inngest';

describe('Worker Analytics Sync Workflow (TASK-028)', () => {
  const orgId = '11111111-1111-1111-1111-111111111111';
  const pubId = 'pub-uuid-1';
  const correlationId = 'corr-analytics-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockContext = () => ({
    event: {
      data: {
        publicationId: pubId,
        organizationId: orgId,
        correlationId,
      },
    },
    step: {
      run: vi.fn().mockImplementation((_id: string, fn: () => Promise<unknown>) => fn()),
    },
  });

  type InngestHandler = {
    fn: (ctx: ReturnType<typeof createMockContext>) => Promise<unknown>;
  };
  const executeHandler = (analyticsSyncRequested as unknown as InngestHandler).fn;

  it('runs syncPublicationMetrics inside step.run and returns success result', async () => {
    const syncSpy = vi
      .spyOn(analyticsSyncService, 'syncPublicationMetrics')
      .mockResolvedValueOnce({
        success: true,
        publicationId: pubId,
        metrics: { views: 500, likes: 20, comments: 4, shares: 1, bookmarks: 2 },
      });

    const ctx = createMockContext();
    const result = (await executeHandler(ctx)) as {
      success: boolean;
      publicationId: string;
      metrics: { views: number };
    };

    expect(ctx.step.run).toHaveBeenCalledWith('sync-metrics', expect.any(Function));
    expect(syncSpy).toHaveBeenCalledWith({
      organizationId: orgId,
      publicationId: pubId,
      correlationId,
    });
    expect(result.success).toBe(true);
    expect(result.metrics.views).toBe(500);
  });

  it('wraps non-retryable platform errors in NonRetriableError to halt Inngest retries', async () => {
    vi.spyOn(analyticsSyncService, 'syncPublicationMetrics').mockRejectedValueOnce(
      new PlatformError({
        provider: 'DEVTO',
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid API key',
        retryable: false,
      }),
    );

    const ctx = createMockContext();
    await expect(executeHandler(ctx)).rejects.toThrow(NonRetriableError);
  });

  it('allows retryable errors to pass through so Inngest retries with backoff', async () => {
    vi.spyOn(analyticsSyncService, 'syncPublicationMetrics').mockRejectedValueOnce(
      new PlatformError({
        provider: 'DEVTO',
        code: 'RATE_LIMITED',
        message: 'Rate limited',
        retryable: true,
      }),
    );

    const ctx = createMockContext();
    await expect(executeHandler(ctx)).rejects.toThrow(PlatformError);
  });
});
