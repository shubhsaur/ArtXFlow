import { betterAuth } from 'better-auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, user, session, account, verification } from '@artxflow/database';
import { env } from '@artxflow/config/server';

import { sendEmail } from './email/brevo';
import { renderPasswordResetEmail, renderVerificationEmail } from './email/templates';

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL || 'http://localhost:3000',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    sendResetPassword: async ({ user: resetUser, token }) => {
      const appBaseUrl = env.BETTER_AUTH_URL || 'http://localhost:3000';
      const resetUrl = `${appBaseUrl}/reset-password?token=${token}`;
      const emailContent = renderPasswordResetEmail({
        name: resetUser.name,
        resetUrl,
        expiresInMinutes: 60,
      });

      await sendEmail({
        to: { email: resetUser.email, name: resetUser.name },
        subject: emailContent.subject,
        htmlContent: emailContent.htmlContent,
        textContent: emailContent.textContent,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 86400, // 24 hours
    sendVerificationEmail: async ({ user: verifyUser, token }) => {
      const appBaseUrl = env.BETTER_AUTH_URL || 'http://localhost:3000';
      const callbackURL = encodeURIComponent(`${appBaseUrl}/verify-email?status=success`);
      const verifyUrl = `${appBaseUrl}/api/auth/verify-email?token=${token}&callbackURL=${callbackURL}`;
      const emailContent = renderVerificationEmail({
        name: verifyUser.name,
        verifyUrl,
        expiresInHours: 24,
      });

      await sendEmail({
        to: { email: verifyUser.email, name: verifyUser.name },
        subject: emailContent.subject,
        htmlContent: emailContent.htmlContent,
        textContent: emailContent.textContent,
      });
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 15,
  },
  trustedOrigins: [
    ...(env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : []),
    'http://localhost:3000',
    '*.artxflow.com',
  ],
  socialProviders: {
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
});

export type Auth = typeof auth;

export const nextAuthHandler = toNextJsHandler(auth.handler);
