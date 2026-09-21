import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendEmail } from './brevo';
import { renderPasswordResetEmail, renderVerificationEmail } from './templates';
import * as configServer from '@artxflow/config/server';

describe('Brevo Email Client & Templates', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const createMockEnv = (overrides: Partial<configServer.ServerEnv>): configServer.ServerEnv =>
    overrides as unknown as configServer.ServerEnv;

  describe('Template Rendering', () => {
    it('renders password reset email with correct links and parameters', () => {
      const email = renderPasswordResetEmail({
        name: 'Alice',
        resetUrl: 'https://artxflow.com/reset-password?token=xyz123',
        expiresInMinutes: 45,
      });

      expect(email.subject).toBe('Reset your ArtXFlow password');
      expect(email.htmlContent).toContain('Hello Alice,');
      expect(email.htmlContent).toContain('https://artxflow.com/reset-password?token=xyz123');
      expect(email.htmlContent).toContain('45 minutes');
      expect(email.textContent).toContain('https://artxflow.com/reset-password?token=xyz123');
    });

    it('renders verification email with correct links and parameters', () => {
      const email = renderVerificationEmail({
        name: 'Bob',
        verifyUrl: 'https://artxflow.com/api/auth/verify-email?token=ver789',
        expiresInHours: 12,
      });

      expect(email.subject).toBe('Verify your ArtXFlow email address');
      expect(email.htmlContent).toContain('Hello Bob,');
      expect(email.htmlContent).toContain('https://artxflow.com/api/auth/verify-email?token=ver789');
      expect(email.htmlContent).toContain('12 hours');
      expect(email.textContent).toContain('https://artxflow.com/api/auth/verify-email?token=ver789');
    });
  });

  describe('sendEmail', () => {
    it('simulates email sending in development/test when BREVO_API_KEY is not set', async () => {
      vi.spyOn(configServer, 'env', 'get').mockReturnValue(
        createMockEnv({
          NODE_ENV: 'test',
          BREVO_API_KEY: undefined,
          BREVO_FROM_EMAIL: 'noreply@artxflow.com',
          BREVO_FROM_NAME: 'ArtXFlow',
        }),
      );

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        htmlContent: '<p>Test</p>',
        textContent: 'Test content',
      });

      expect(result.success).toBe(true);
      expect(result.simulated).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('throws error in production when BREVO_API_KEY is not configured', async () => {
      vi.spyOn(configServer, 'env', 'get').mockReturnValue(
        createMockEnv({
          NODE_ENV: 'production',
          BREVO_API_KEY: undefined,
          BREVO_FROM_EMAIL: 'noreply@artxflow.com',
          BREVO_FROM_NAME: 'ArtXFlow',
        }),
      );

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Test Subject',
          htmlContent: '<p>Test</p>',
        }),
      ).rejects.toThrowError(/BREVO_API_KEY is not configured/);
    });

    it('successfully calls Brevo API when BREVO_API_KEY is present', async () => {
      vi.spyOn(configServer, 'env', 'get').mockReturnValue(
        createMockEnv({
          NODE_ENV: 'production',
          BREVO_API_KEY: 'xkeysib-live-key',
          BREVO_FROM_EMAIL: 'sender@artxflow.com',
          BREVO_FROM_NAME: 'ArtXFlow Admin',
        }),
      );

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ messageId: '<brevo-message-id-123>' }),
      });
      globalThis.fetch = mockFetch;

      const result = await sendEmail({
        to: { email: 'author@domain.com', name: 'Author Name' },
        subject: 'Publication Complete',
        htmlContent: '<p>Published successfully</p>',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('<brevo-message-id-123>');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.brevo.com/v3/smtp/email',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'api-key': 'xkeysib-live-key',
            'content-type': 'application/json',
          }),
        }),
      );

      const calledPayload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(calledPayload.sender).toEqual({
        name: 'ArtXFlow Admin',
        email: 'sender@artxflow.com',
      });
      expect(calledPayload.to).toEqual([
        { email: 'author@domain.com', name: 'Author Name' },
      ]);
      expect(calledPayload.subject).toBe('Publication Complete');
    });

    it('throws descriptive error when Brevo API responds with an error', async () => {
      vi.spyOn(configServer, 'env', 'get').mockReturnValue(
        createMockEnv({
          NODE_ENV: 'production',
          BREVO_API_KEY: 'xkeysib-invalid-key',
        }),
      );

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Key not found', code: 'unauthorized' }),
      });

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Test',
          htmlContent: '<p>Test</p>',
        }),
      ).rejects.toThrowError(/Brevo API delivery failed: Key not found \(unauthorized\)/);
    });
  });

  describe('Auth Configuration Callbacks', () => {
    it('executes auth emailAndPassword.sendResetPassword hook', async () => {
      const { auth } = await import('../auth');
      const sendResetPassword = auth.options.emailAndPassword?.sendResetPassword;
      expect(sendResetPassword).toBeDefined();

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      if (sendResetPassword) {
        await sendResetPassword(
          {
            user: {
              id: 'user-1',
              email: 'reset@example.com',
              name: 'Reset User',
              emailVerified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            token: 'test-reset-token-123',
            url: 'http://localhost:3000/reset-password/test-reset-token-123',
          },
        );
      }
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('executes auth emailVerification.sendVerificationEmail hook', async () => {
      const { auth } = await import('../auth');
      const sendVerificationEmail = auth.options.emailVerification?.sendVerificationEmail;
      expect(sendVerificationEmail).toBeDefined();

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      if (sendVerificationEmail) {
        await sendVerificationEmail(
          {
            user: {
              id: 'user-2',
              email: 'verify@example.com',
              name: 'Verify User',
              emailVerified: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            token: 'test-verify-token-456',
            url: 'http://localhost:3000/api/auth/verify-email?token=test-verify-token-456',
          },
        );
      }
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});

