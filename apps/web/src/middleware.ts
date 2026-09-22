import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

const RESERVED_SUBDOMAINS = new Set(['app', 'api', 'admin', 'www', 'auth', 'dashboard']);

// General API rate limit: per-IP, applied to session-authenticated routes.
const API_RATE_LIMIT = 300;
const API_RATE_WINDOW_MS = 60 * 1000;

// Routes with their own authn/rate-limit semantics — skip general limiting.
const RATE_LIMIT_EXEMPT_PREFIXES = ['/api/auth', '/api/health', '/api/inngest', '/api/v1'];

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

async function applyApiRateLimit(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  if (RATE_LIMIT_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const ip = getClientIp(request);
  const result = await checkRateLimit(`api:${ip}`, API_RATE_LIMIT, API_RATE_WINDOW_MS);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  return response;
}

/**
 * Next.js Middleware for:
 * 1. General rate limiting on /api/* routes.
 * 2. Multi-tenant subdomain and custom domain routing.
 *    Rewrites <subdomain>.artxflow.com/<path> to /sites/<subdomain>/<path>.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Apply rate limiting to API routes
  if (url.pathname.startsWith('/api')) {
    return applyApiRateLimit(request);
  }

  const hostname = request.headers.get('host') || '';

  // Clean host (remove port if local development)
  const host = hostname.split(':')[0]?.toLowerCase() || '';

  // Ignore static files and Next.js internals
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/sites')
  ) {
    return NextResponse.next();
  }

  // Determine if this is a subdomain on artxflow.com or localhost
  let subdomain: string | null = null;

  if (host.includes('.artxflow.com')) {
    const candidate = host.replace('.artxflow.com', '');
    if (candidate && !RESERVED_SUBDOMAINS.has(candidate)) {
      subdomain = candidate;
    }
  } else if (host.includes('.localhost')) {
    const candidate = host.replace('.localhost', '');
    if (candidate && !RESERVED_SUBDOMAINS.has(candidate)) {
      subdomain = candidate;
    }
  }

  // If a valid subdomain was detected, rewrite to /sites/<subdomain>/...
  if (subdomain) {
    const rewritePath = `/sites/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
    const rewriteUrl = new URL(rewritePath, request.url);
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

