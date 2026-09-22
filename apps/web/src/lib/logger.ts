import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

const REDACT_PATHS = [
  'password',
  'secret',
  'token',
  'apiKey',
  'authorization',
  'headers.authorization',
  'headers.cookie',
  '*.password',
  '*.secret',
  '*.token',
  '*.apiKey',
];

export interface Logger {
  debug(obj: object, msg?: string): void;
  info(obj: object, msg?: string): void;
  warn(obj: object, msg?: string): void;
  error(obj: object, msg?: string): void;
  child(bindings: Record<string, unknown>): Logger;
}

/**
 * JSON-lines logger used in edge/middleware runtimes where pino's
 * Node.js stream transport is unavailable.
 */
function createConsoleLogger(bindings: Record<string, unknown> = {}): Logger {
  const emit = (level: string, obj: object, msg?: string) => {
    const line = JSON.stringify({
      level,
      time: new Date().toISOString(),
      service: 'artxflow-web',
      env: process.env.NODE_ENV,
      ...bindings,
      ...obj,
      msg,
    });
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  };
  return {
    debug: (obj, msg) => emit('debug', obj, msg),
    info: (obj, msg) => emit('info', obj, msg),
    warn: (obj, msg) => emit('warn', obj, msg),
    error: (obj, msg) => emit('error', obj, msg),
    child: (childBindings) => createConsoleLogger({ ...bindings, ...childBindings }),
  };
}

function createLogger(): Logger {
  // Edge runtime (middleware) has no process.stdout — pino cannot write there.
  const isEdge =
    typeof (globalThis as { EdgeRuntime?: string }).EdgeRuntime === 'string' ||
    typeof process?.stdout?.write !== 'function';

  if (isEdge) {
    return createConsoleLogger();
  }

  const pinoLogger = pino({
    name: 'artxflow-web',
    level: logLevel,
    base: {
      service: 'artxflow-web',
      env: process.env.NODE_ENV,
    },
    redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  return pinoLogger as unknown as Logger;
}

/**
 * Structured JSON logger for the web app.
 *
 * - JSON output with log levels — ready for log aggregation.
 * - Level is controlled by LOG_LEVEL (defaults: 'info' in production, 'debug' otherwise).
 * - Redacts common credential fields so secrets never reach log streams.
 */
export const logger: Logger = createLogger();

/**
 * Creates a request-scoped child logger carrying a correlation ID.
 * Use the returned requestId in error responses so users can reference
 * a specific request when reporting issues.
 */
export function createRequestLogger(route: string, requestId: string = crypto.randomUUID()): {
  log: Logger;
  requestId: string;
} {
  return {
    log: logger.child({ requestId, route }),
    requestId,
  };
}

