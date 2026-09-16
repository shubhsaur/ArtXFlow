/**
 * @artxflow/analytics
 * Normalized metrics and analytics domain models (TASK-027, ADR-012).
 */

import type { EntityId, Timestamp } from '@artxflow/types';

/**
 * Normalized core metrics tracked across all distribution platforms.
 */
export interface NormalizedMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
}

/**
 * Point-in-time metrics snapshot associated with an ArtXFlow publication and destination.
 */
export interface AnalyticsSnapshot {
  id: EntityId;
  organizationId: EntityId;
  publicationId: EntityId;
  destinationId?: EntityId | null;
  capturedAt: Timestamp;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  /** Retained provider-specific telemetry without altering normalized columns */
  metrics: Record<string, unknown>;
  createdAt: Timestamp;
}

/**
 * Input for creating a new analytics snapshot.
 */
export interface CreateSnapshotInput {
  organizationId: EntityId;
  publicationId: EntityId;
  destinationId?: EntityId | null;
  capturedAt: Timestamp | Date;
  metrics: Partial<NormalizedMetrics>;
  rawMetrics?: Record<string, unknown>;
}

/**
 * Raw telemetry event captured from a webhook or background sync.
 */
export interface AnalyticsRawEvent {
  id: EntityId;
  organizationId: EntityId;
  publicationId?: EntityId | null;
  destinationId?: EntityId | null;
  eventType: string;
  payload: Record<string, unknown>;
  occurredAt: Timestamp;
  createdAt: Timestamp;
}

/**
 * Aggregated summary metrics across multiple snapshots or destinations.
 */
export interface AggregatedMetricsSummary extends NormalizedMetrics {
  publicationCount: number;
  snapshotCount: number;
  firstCapturedAt: Timestamp | null;
  lastCapturedAt: Timestamp | null;
}

/**
 * Normalizes metrics input with fallback defaults for missing fields.
 */
export function normalizeMetrics(input?: Partial<NormalizedMetrics> | null): NormalizedMetrics {
  return {
    views: Math.max(0, Math.floor(input?.views ?? 0)),
    likes: Math.max(0, Math.floor(input?.likes ?? 0)),
    comments: Math.max(0, Math.floor(input?.comments ?? 0)),
    shares: Math.max(0, Math.floor(input?.shares ?? 0)),
    bookmarks: Math.max(0, Math.floor(input?.bookmarks ?? 0)),
  };
}

/**
 * Aggregates multiple snapshots into a single summary.
 */
export function aggregateSnapshots(snapshots: AnalyticsSnapshot[]): AggregatedMetricsSummary {
  if (snapshots.length === 0) {
    return {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarks: 0,
      publicationCount: 0,
      snapshotCount: 0,
      firstCapturedAt: null,
      lastCapturedAt: null,
    };
  }

  const publications = new Set<string>();
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let totalBookmarks = 0;

  let earliest: Date | null = null;
  let latest: Date | null = null;

  for (const s of snapshots) {
    publications.add(s.publicationId);
    totalViews += s.views || 0;
    totalLikes += s.likes || 0;
    totalComments += s.comments || 0;
    totalShares += s.shares || 0;
    totalBookmarks += s.bookmarks || 0;

    const date = new Date(s.capturedAt);
    if (!earliest || date < earliest) earliest = date;
    if (!latest || date > latest) latest = date;
  }

  return {
    views: totalViews,
    likes: totalLikes,
    comments: totalComments,
    shares: totalShares,
    bookmarks: totalBookmarks,
    publicationCount: publications.size,
    snapshotCount: snapshots.length,
    firstCapturedAt: earliest ? earliest.toISOString() : null,
    lastCapturedAt: latest ? latest.toISOString() : null,
  };
}
