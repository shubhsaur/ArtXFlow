import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@artxflow/types': path.resolve(__dirname, 'packages/types/src/index.ts'),
      '@artxflow/database': path.resolve(__dirname, 'packages/database/src/index.ts'),
      '@artxflow/config/server': path.resolve(__dirname, 'packages/config/src/server.ts'),
      '@artxflow/config/client': path.resolve(__dirname, 'packages/config/src/client.ts'),
      '@artxflow/config': path.resolve(__dirname, 'packages/config/src/index.ts'),
      '@artxflow/auth': path.resolve(__dirname, 'packages/auth/src/index.ts'),
      '@artxflow/content-core': path.resolve(__dirname, 'packages/content-core/src/index.ts'),
      '@artxflow/platform-adapters': path.resolve(
        __dirname,
        'packages/platform-adapters/src/index.ts',
      ),
      '@artxflow/publishing': path.resolve(__dirname, 'packages/publishing/src/index.ts'),
      '@artxflow/analytics': path.resolve(__dirname, 'packages/analytics/src/index.ts'),
      '@artxflow/transformations': path.resolve(
        __dirname,
        'packages/transformations/src/index.ts',
      ),
      '@artxflow/ui': path.resolve(__dirname, 'packages/ui/src/index.ts'),
      '@artxflow/design-system': path.resolve(__dirname, 'packages/design-system/src/index.ts'),
      '@artxflow/storage': path.resolve(__dirname, 'packages/storage/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.kilo/**'],
    server: {
      deps: {
        inline: [/remark-gfm/, /react-markdown/, /inngest/, /micromark/],
      },
    },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/artxflow_test',
      BETTER_AUTH_SECRET: 'test-better-auth-secret-minimum-32-characters-long',
      ENCRYPTION_KEY: 'test-encryption-key-minimum-32-characters-long',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    },
  },
});
