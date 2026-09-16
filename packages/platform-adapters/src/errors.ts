import type { PlatformProvider } from './contract';

/**
 * Standardized category codes for external platform errors.
 */
export type PlatformErrorCode =
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'PROVIDER_5XX'
  | 'TIMEOUT'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNSUPPORTED_OPERATION'
  | 'UNKNOWN_OUTCOME';

/**
 * Determines whether an error code represents a transient, retryable failure.
 */
export function isRetryableErrorCode(code: PlatformErrorCode): boolean {
  switch (code) {
    case 'RATE_LIMITED':
    case 'NETWORK_ERROR':
    case 'PROVIDER_5XX':
    case 'TIMEOUT':
      return true;
    case 'AUTHENTICATION_ERROR':
    case 'AUTHORIZATION_ERROR':
    case 'VALIDATION_ERROR':
    case 'NOT_FOUND':
    case 'CONFLICT':
    case 'UNSUPPORTED_OPERATION':
    case 'UNKNOWN_OUTCOME':
    default:
      return false;
  }
}

export interface PlatformErrorOptions {
  message: string;
  code: PlatformErrorCode;
  provider: PlatformProvider;
  retryable?: boolean;
  statusCode?: number;
  rawError?: unknown;
}

/**
 * Domain error representing failures when communicating with external platform APIs.
 */
export class PlatformError extends Error {
  readonly code: PlatformErrorCode;
  readonly provider: PlatformProvider;
  readonly retryable: boolean;
  readonly statusCode?: number;
  readonly rawError?: unknown;

  constructor(options: PlatformErrorOptions) {
    super(`[${options.provider}] ${options.code}: ${options.message}`);
    this.name = 'PlatformError';
    this.code = options.code;
    this.provider = options.provider;
    this.retryable =
      options.retryable !== undefined ? options.retryable : isRetryableErrorCode(options.code);
    this.statusCode = options.statusCode;
    this.rawError = options.rawError;
  }

  static isPlatformError(error: unknown): error is PlatformError {
    return error instanceof PlatformError;
  }

  static isRetryable(error: unknown): boolean {
    if (error instanceof PlatformError) {
      return error.retryable;
    }
    return false;
  }
}
