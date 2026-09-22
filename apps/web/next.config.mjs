const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // User content: OAuth avatars (Google/GitHub), platform CDN avatars
      // (Medium/Hashnode), R2-hosted assets, Unsplash covers.
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      // Sentry browser SDK + Unsplash search API.
      "connect-src 'self' https://api.unsplash.com https://*.ingest.sentry.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@artxflow/ui',
    '@artxflow/design-system',
    '@artxflow/auth',
    '@artxflow/content-core',
    '@artxflow/platform-adapters',
    '@artxflow/publishing',
    '@artxflow/analytics',
    '@artxflow/transformations',
    '@artxflow/worker',
    'react-markdown',
    'remark-gfm',
  ],
  serverExternalPackages: ['postgres', 'better-auth'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
