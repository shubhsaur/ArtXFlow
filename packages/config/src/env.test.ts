import { describe, it, expect } from 'vitest';
import { validateServerEnv } from './server';
import { validateClientEnv } from './client';

describe('@artxflow/config', () => {
  const validServerEnv = {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/artxflow',
    BETTER_AUTH_SECRET: 'a-very-long-secret-key-that-is-at-least-32-characters-long',
    ENCRYPTION_KEY: 'a-very-long-encryption-key-at-least-32-chars-long',
    INNGEST_EVENT_KEY: 'test-event-key',
    INNGEST_SIGNING_KEY: 'test-signing-key',
  };

  const validClientEnv = {
    NEXT_PUBLIC_APP_URL: 'https://app.artxflow.com',
  };

  describe('validateServerEnv', () => {
    it('successfully parses valid server environment variables', () => {
      const parsed = validateServerEnv(validServerEnv);
      expect(parsed.DATABASE_URL).toBe(validServerEnv.DATABASE_URL);
      expect(parsed.BETTER_AUTH_SECRET).toBe(validServerEnv.BETTER_AUTH_SECRET);
      expect(parsed.ENCRYPTION_KEY).toBe(validServerEnv.ENCRYPTION_KEY);
      expect(parsed.NODE_ENV).toBe('test');
    });

    it('defaults NODE_ENV to development if omitted', () => {
      const { NODE_ENV: _, ...withoutNodeEnv } = validServerEnv;
      const parsed = validateServerEnv(withoutNodeEnv);
      expect(parsed.NODE_ENV).toBe('development');
    });

    it('throws when required variables are missing', () => {
      expect(() => validateServerEnv({})).toThrowError(/Invalid server environment configuration/);
    });

    it('throws when DATABASE_URL is not a valid URL', () => {
      expect(() =>
        validateServerEnv({
          ...validServerEnv,
          DATABASE_URL: 'invalid-url',
        }),
      ).toThrowError(/DATABASE_URL must be a valid connection URL/);
    });

    it('throws when BETTER_AUTH_SECRET is too short (< 32 chars)', () => {
      expect(() =>
        validateServerEnv({
          ...validServerEnv,
          BETTER_AUTH_SECRET: 'short-secret',
        }),
      ).toThrowError(/BETTER_AUTH_SECRET must be at least 32 characters long/);
    });

    it('throws when ENCRYPTION_KEY is too short (< 32 chars)', () => {
      expect(() =>
        validateServerEnv({
          ...validServerEnv,
          ENCRYPTION_KEY: 'short-key',
        }),
      ).toThrowError(/ENCRYPTION_KEY must be at least 32 characters long/);
    });

    it('prevents execution in browser environment if window is defined', () => {
      const globalObj = globalThis as { window?: unknown };
      const originalWindow = globalObj.window;
      globalObj.window = {};
      try {
        expect(() => validateServerEnv(validServerEnv)).toThrowError(
          /Server environment variables cannot be accessed in the browser/,
        );
      } finally {
        globalObj.window = originalWindow;
      }
    });
  });

  describe('validateClientEnv', () => {
    it('successfully parses valid client environment variables', () => {
      const parsed = validateClientEnv(validClientEnv);
      expect(parsed.NEXT_PUBLIC_APP_URL).toBe('https://app.artxflow.com');
    });

    it('defaults NEXT_PUBLIC_APP_URL to http://localhost:3000 when omitted', () => {
      const parsed = validateClientEnv({});
      expect(parsed.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
    });

    it('throws when NEXT_PUBLIC_APP_URL is not a valid URL', () => {
      expect(() =>
        validateClientEnv({
          NEXT_PUBLIC_APP_URL: 'not-a-url',
        }),
      ).toThrowError(/NEXT_PUBLIC_APP_URL must be a valid URL/);
    });
  });
});
