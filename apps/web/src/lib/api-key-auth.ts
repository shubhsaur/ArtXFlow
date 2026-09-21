import { apiKeyRepository } from '@artxflow/database';

export interface ApiKeyContext {
  userId: string;
  organizationId: string;
  scopes: string[];
}

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function isRateLimited(keyId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(keyId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(keyId, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  return false;
}

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

  if (isRateLimited(record.id)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. 100 requests per minute.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
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
