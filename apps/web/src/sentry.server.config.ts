import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NODE_ENV,
  // Keep tracing cheap in production; raise temporarily when debugging.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});
