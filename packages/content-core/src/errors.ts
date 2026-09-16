/**
 * Domain and Application error definitions for content services.
 */

export class ContentCoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentCoreError';
  }
}

export class UnauthorizedOrganizationAccessError extends ContentCoreError {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string,
  ) {
    super(`User '${userId}' is not authorized to access organization '${organizationId}'`);
    this.name = 'UnauthorizedOrganizationAccessError';
  }
}

export class ArticleNotFoundError extends ContentCoreError {
  constructor(
    public readonly articleIdentifier: string,
    public readonly organizationId: string,
  ) {
    super(`Article '${articleIdentifier}' not found in organization '${organizationId}'`);
    this.name = 'ArticleNotFoundError';
  }
}

export class DuplicateSlugError extends ContentCoreError {
  constructor(
    public readonly slug: string,
    public readonly organizationId: string,
  ) {
    super(`Article with slug '${slug}' already exists in organization '${organizationId}'`);
    this.name = 'DuplicateSlugError';
  }
}

export class ValidationError extends ContentCoreError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
