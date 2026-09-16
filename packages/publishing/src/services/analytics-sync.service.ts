import {
  publicationRepository,
  destinationRepository,
  analyticsRepository,
  type PublicationRepository,
  type DestinationRepository,
  type AnalyticsRepository,
  type AnalyticsSnapshot,
} from '@artxflow/database';
import {
  platformAdapterRegistry,
  PlatformError,
  type PlatformAdapterRegistry,
  type PlatformMetrics,
} from '@artxflow/platform-adapters';
import { platformConnectionService, type PlatformConnectionService } from './platform-connection.service';
import { normalizeMetrics, type NormalizedMetrics } from '@artxflow/analytics';

export interface SyncAnalyticsInput {
  organizationId: string;
  publicationId: string;
  correlationId?: string;
}

export interface SyncAnalyticsResult {
  success: boolean;
  skipped?: boolean;
  reason?: string;
  publicationId: string;
  snapshot?: AnalyticsSnapshot;
  metrics?: NormalizedMetrics;
}

export interface AnalyticsSyncServiceOptions {
  publicationRepo?: PublicationRepository;
  destinationRepo?: DestinationRepository;
  analyticsRepo?: AnalyticsRepository;
  connectionService?: PlatformConnectionService;
  adapterRegistry?: PlatformAdapterRegistry;
}

/**
 * Service orchestrating asynchronous analytics ingestion from external platforms (TASK-028).
 * Invariant: Analytics sync CANNOT alter publication state.
 */
export class AnalyticsSyncService {
  private readonly publicationRepo: PublicationRepository;
  private readonly destinationRepo: DestinationRepository;
  private readonly analyticsRepo: AnalyticsRepository;
  private readonly connectionService: PlatformConnectionService;
  private readonly adapterRegistry: PlatformAdapterRegistry;

  constructor(options: AnalyticsSyncServiceOptions = {}) {
    this.publicationRepo = options.publicationRepo || publicationRepository;
    this.destinationRepo = options.destinationRepo || destinationRepository;
    this.analyticsRepo = options.analyticsRepo || analyticsRepository;
    this.connectionService = options.connectionService || platformConnectionService;
    this.adapterRegistry = options.adapterRegistry || platformAdapterRegistry;
  }

  async syncPublicationMetrics(input: SyncAnalyticsInput): Promise<SyncAnalyticsResult> {
    const { organizationId, publicationId, correlationId = crypto.randomUUID() } = input;

    // 1. Load publication within tenant boundary
    const publication = await this.publicationRepo.findForOrganization(organizationId, publicationId);
    if (!publication) {
      throw new Error(`Publication '${publicationId}' not found in organization '${organizationId}'`);
    }

    // Must be published and have external resource ID
    if (publication.status !== 'PUBLISHED' || !publication.externalResourceId) {
      return {
        success: false,
        skipped: true,
        reason: `Publication '${publicationId}' is not published or lacks an externalResourceId.`,
        publicationId,
      };
    }

    // 2. Load destination
    const destination = await this.destinationRepo.findForOrganization(
      organizationId,
      publication.destinationId,
    );
    if (!destination) {
      throw new Error(`Destination '${publication.destinationId}' not found`);
    }

    // 3. Resolve adapter
    const adapter = this.adapterRegistry.get(destination.type);
    if (!adapter) {
      return {
        success: false,
        skipped: true,
        reason: `No platform adapter found for destination type '${destination.type}'.`,
        publicationId,
      };
    }

    // 4. Check capabilities
    const capabilities = adapter.getCapabilities();
    if (!capabilities.analytics) {
      return {
        success: true,
        skipped: true,
        reason: `Provider '${destination.type}' does not support analytics querying.`,
        publicationId,
      };
    }

    // 5. Resolve credentials
    let credentials = undefined;
    if (destination.connectionId) {
      const secret = await this.connectionService.getDecryptedSecret(
        { userId: 'system', organizationId },
        destination.connectionId,
      );
      credentials = {
        apiKey: secret,
        token: secret,
      };
    }

    // 6. Fetch metrics from provider with error classification
    let rawMetrics: PlatformMetrics;
    try {
      rawMetrics = await adapter.fetchMetrics({
        publicationId,
        externalResourceId: publication.externalResourceId,
        credentials,
        destinationConfig: (destination.config as Record<string, unknown>) || {},
      });
    } catch (err: unknown) {
      // Record observable failure in raw events log
      const isPlatformErr = err instanceof PlatformError;
      const errorCode = isPlatformErr ? err.code : 'UNKNOWN_ERROR';
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isRetryable = isPlatformErr ? err.retryable : false;

      await this.analyticsRepo.recordRawEvent({
        organizationId,
        publicationId,
        destinationId: destination.id,
        eventType: 'ANALYTICS_SYNC_FAILED',
        payload: {
          correlationId,
          errorCode,
          errorMessage,
          retryable: isRetryable,
        },
      });

      // Crucial: Analytics failure NEVER alters publication state.
      // Re-throw if retryable so Inngest retry mechanism triggers backoff.
      throw err;
    }

    // 7. Normalize metrics
    const normalized = normalizeMetrics({
      views: rawMetrics.views,
      likes: rawMetrics.reactions,
      comments: rawMetrics.comments,
      shares: rawMetrics.shares,
      bookmarks: rawMetrics.bookmarks,
    });

    const capturedAt = rawMetrics.capturedAt ? new Date(rawMetrics.capturedAt) : new Date();

    // 8. Persist snapshot with explicit capturedAt timestamp and retained raw metadata
    const snapshot = await this.analyticsRepo.createSnapshot({
      organizationId,
      publicationId,
      destinationId: destination.id,
      capturedAt,
      views: normalized.views,
      likes: normalized.likes,
      comments: normalized.comments,
      shares: normalized.shares,
      bookmarks: normalized.bookmarks,
      metrics: rawMetrics.raw || {},
    });

    // 9. Record append-only telemetry event
    await this.analyticsRepo.recordRawEvent({
      organizationId,
      publicationId,
      destinationId: destination.id,
      eventType: 'ANALYTICS_SYNC_COMPLETED',
      payload: {
        correlationId,
        snapshotId: snapshot.id,
        views: normalized.views,
        likes: normalized.likes,
      },
    });

    return {
      success: true,
      publicationId,
      snapshot,
      metrics: normalized,
    };
  }
}

export const analyticsSyncService = new AnalyticsSyncService();
