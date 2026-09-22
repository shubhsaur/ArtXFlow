import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import {
  ValidationError,
  DuplicateSlugError,
  UnauthorizedOrganizationAccessError,
  ArticleNotFoundError,
} from '@artxflow/content-core';
import { PlatformError } from '@artxflow/platform-adapters';
import {
  DestinationNotFoundError,
  PublicationNotFoundError,
  DuplicatePublicationError,
  UnauthorizedTenantAccessError,
  InvalidDestinationConfigurationError,
  InvalidPublicationStateError,
  MissingIdempotencyKeyError,
  InvalidTimezoneError,
  PastScheduledTimeError,
  ScheduleNotFoundError,
  InvalidScheduleStateError,
  ArticleNotPublishableError,
  PlatformConnectionNotFoundError,
  PlatformAccountNotFoundError,
  ArticleNotFoundError as PublishingArticleNotFoundError,
} from '@artxflow/publishing';
import { UnauthorizedError } from '@artxflow/auth';
import { logger } from './logger';

type DomainErrorMap = Array<[new (...args: never[]) => Error, number]>;

const domainErrors: DomainErrorMap = [
  [UnauthorizedError, 401],
  [UnauthorizedOrganizationAccessError, 403],
  [UnauthorizedTenantAccessError, 403],
  [ValidationError, 400],
  [DuplicateSlugError, 409],
  [DuplicatePublicationError, 409],
  [ArticleNotFoundError, 404],
  [PublishingArticleNotFoundError, 404],
  [DestinationNotFoundError, 404],
  [PublicationNotFoundError, 404],
  [ScheduleNotFoundError, 404],
  [PlatformConnectionNotFoundError, 404],
  [PlatformAccountNotFoundError, 404],
  [InvalidDestinationConfigurationError, 400],
  [InvalidPublicationStateError, 422],
  [InvalidScheduleStateError, 422],
  [MissingIdempotencyKeyError, 400],
  [InvalidTimezoneError, 422],
  [PastScheduledTimeError, 422],
  [ArticleNotPublishableError, 422],
];

export interface HandleApiErrorOptions {
  logPrefix?: string;
}

/**
 * Reports an unexpected error to the error-monitoring backend (Sentry),
 * if configured. Never throws — monitoring must not break responses.
 */
function reportToMonitoring(error: unknown, context: Record<string, unknown>): void {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  import('@sentry/nextjs')
    .then((Sentry) => {
      Sentry.captureException(error, { extra: context });
    })
    .catch(() => {
      // Sentry not installed or failed to load — already logged via structured logger.
    });
}

export function handleApiError(error: unknown, options?: HandleApiErrorOptions): NextResponse {
  const log = options?.logPrefix
    ? logger.child({ route: options.logPrefix })
    : logger;

  // Check domain errors first — these are safe to expose
  for (const [ErrorClass, status] of domainErrors) {
    if (error instanceof ErrorClass) {
      log.warn({ err: error, status }, error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
  }

  // Platform errors — expose message and code, use statusCode if valid
  if (error instanceof PlatformError) {
    const status =
      error.statusCode && error.statusCode >= 400 && error.statusCode < 600
        ? error.statusCode
        : 400;
    log.warn({ err: error, status, code: error.code }, error.message);
    return NextResponse.json({ error: error.message, code: error.code }, { status });
  }

  // PostgreSQL unique constraint violations
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === '23505'
  ) {
    log.warn({ err: error, status: 409 }, 'Unique constraint violation');
    return NextResponse.json(
      { error: 'A record with this value already exists.' },
      { status: 409 },
    );
  }

  // Everything else — log internally with a correlation ID, return generic message
  const requestId = randomUUID();
  log.error({ err: error, requestId, status: 500 }, 'Unhandled API error');
  reportToMonitoring(error, { requestId, route: options?.logPrefix });

  return NextResponse.json(
    { error: 'Internal Server Error', requestId },
    { status: 500 },
  );
}
