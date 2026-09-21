/**
 * Base repository contracts and concrete repository implementations.
 */

export interface BaseRepository<T, TId = string> {
  findById(id: TId): Promise<T | null>;
}

export * from './organization.repository';
export * from './membership.repository';
export * from './article.repository';
export * from './article-version.repository';
export * from './site.repository';
export * from './destination.repository';
export * from './publication.repository';
export * from './publication-event.repository';
export * from './workflow-job.repository';
export * from './platform-connection.repository';
export * from './schedule.repository';
export * from './analytics.repository';
export * from './transformation.repository';
export * from './asset.repository';
export * from './profile.repository';
export * from './api-key.repository';
export * from './user.repository';
