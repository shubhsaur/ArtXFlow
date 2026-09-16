export class PublishingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PublishingError';
  }
}

export class DestinationNotFoundError extends PublishingError {
  constructor(destinationId: string, organizationId: string) {
    super(`Destination '${destinationId}' not found in organization '${organizationId}'`);
    this.name = 'DestinationNotFoundError';
  }
}

export class PublicationNotFoundError extends PublishingError {
  constructor(publicationId: string, organizationId: string) {
    super(`Publication '${publicationId}' not found in organization '${organizationId}'`);
    this.name = 'PublicationNotFoundError';
  }
}

export class DuplicatePublicationError extends PublishingError {
  constructor(articleVersionId: string, destinationId: string) {
    super(
      `Publication already exists for article version '${articleVersionId}' and destination '${destinationId}'`,
    );
    this.name = 'DuplicatePublicationError';
  }
}

export class UnauthorizedTenantAccessError extends PublishingError {
  constructor(entity: string, entityId: string, organizationId: string) {
    super(`Unauthorized access to ${entity} '${entityId}' in organization '${organizationId}'`);
    this.name = 'UnauthorizedTenantAccessError';
  }
}

export class InvalidDestinationConfigurationError extends PublishingError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDestinationConfigurationError';
  }
}

export class InvalidPublicationStateError extends PublishingError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPublicationStateError';
  }
}

export class MissingIdempotencyKeyError extends PublishingError {
  constructor(jobType: string) {
    super(`Idempotency key is required for side-effecting workflow job type '${jobType}'`);
    this.name = 'MissingIdempotencyKeyError';
  }
}

export class JobCancellationError extends PublishingError {
  constructor(message: string) {
    super(message);
    this.name = 'JobCancellationError';
  }
}

export class ArticleNotFoundError extends PublishingError {
  constructor(articleId: string, organizationId: string) {
    super(`Article '${articleId}' not found in organization '${organizationId}'`);
    this.name = 'ArticleNotFoundError';
  }
}

export class ArticleNotPublishableError extends PublishingError {
  constructor(message: string) {
    super(message);
    this.name = 'ArticleNotPublishableError';
  }
}

export class PlatformConnectionNotFoundError extends PublishingError {
  constructor(connectionId: string, organizationId: string) {
    super(`Platform connection '${connectionId}' not found in organization '${organizationId}'`);
    this.name = 'PlatformConnectionNotFoundError';
  }
}

export class PlatformAccountNotFoundError extends PublishingError {
  constructor(accountId: string, connectionId: string) {
    super(`Platform account '${accountId}' not found for connection '${connectionId}'`);
    this.name = 'PlatformAccountNotFoundError';
  }
}

export class ScheduleNotFoundError extends PublishingError {
  constructor(scheduleId: string, organizationId: string) {
    super(`Schedule '${scheduleId}' not found in organization '${organizationId}'`);
    this.name = 'ScheduleNotFoundError';
  }
}

export class InvalidScheduleStateError extends PublishingError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidScheduleStateError';
  }
}
