/**
 * @artxflow/config
 * Centralized, type-safe environment configuration.
 *
 * For server-only secrets, import from '@artxflow/config/server'.
 * For client-safe variables, import from '@artxflow/config/client'.
 */

export type { ClientEnv } from './client';
export { clientEnvSchema, validateClientEnv, getClientEnv } from './client';
export type { ServerEnv } from './server';
export { serverEnvSchema } from './server';
