import { NextResponse, type NextRequest } from 'next/server';

const RESERVED_SUBDOMAINS = new Set(['app', 'api', 'admin', 'www', 'auth', 'dashboard']);

/**
 * Next.js Middleware for multi-tenant subdomain and custom domain routing.
 * Rewrites <subdomain>.artxflow.com/<path> to /sites/<subdomain>/<path>.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Clean host (remove port if local development)
  const host = hostname.split(':')[0]?.toLowerCase() || '';

  // Ignore static files, api routes, and Next.js internals
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
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
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico).*)'],
};
