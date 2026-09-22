import { apiKeyRepository } from '@artxflow/database';
import { checkRateLimit } from './rate-limit';

export interface ApiKeyContext {
  userId: string;
  organizationId: string;
  scopes: string[];
}

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export async function authenticateApiKey(request: Request): Promise<ApiKeyContext | Response> {
  const authHeader = request.headers.get('authorization');
  const key = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!key) {
    return new Response(JSON.stringify({ error: 'Missing API key. Use Authorization: Bearer <key>' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const record = await apiKeyRepository.findValidKey(key);

  if (!record) {
    return new Response(JSON.stringify({ error: 'Invalid or revoked API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rateLimit = await checkRateLimit(`apikey:${record.id}`, MAX_REQUESTS, WINDOW_MS);
  if (!rateLimit.success) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. 100 requests per minute.' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000))),
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  await apiKeyRepository.touchLastUsed(record.id);

  return {
    userId: record.userId,
    organizationId: record.organizationId,
    scopes: record.scopes,
  };
}

export function requireScope(scopes: string[], requiredScope: string): boolean {
  return scopes.includes(requiredScope);
}

export function forbiddenResponse(): Response {
  return new Response(JSON.stringify({ error: 'Forbidden: insufficient scope' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}
