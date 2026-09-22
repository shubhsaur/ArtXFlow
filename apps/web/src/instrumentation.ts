import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Captures errors from React Server Components, route handlers, and
// server actions that would otherwise only hit stderr.
export const onRequestError = Sentry.captureRequestError;
