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
  ],
  serverExternalPackages: ['postgres', 'better-auth'],
};

export default nextConfig;
