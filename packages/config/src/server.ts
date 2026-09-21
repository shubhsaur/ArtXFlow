import { z } from 'zod';

if (typeof window !== 'undefined') {
  throw new Error('Server environment variables cannot be accessed in the browser.');
}

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid connection URL' }),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, { message: 'BETTER_AUTH_SECRET must be at least 32 characters long' }),
  ENCRYPTION_KEY: z
    .string()
    .min(32, { message: 'ENCRYPTION_KEY must be at least 32 characters long' }),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  BREVO_API_KEY: z.string().optional(),
  BREVO_FROM_EMAIL: z.string().email().optional(),
  BREVO_FROM_NAME: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional(),
  UNSPLASH_ACCESS_KEY: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production' && !data.BETTER_AUTH_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'BETTER_AUTH_URL is required in production',
      path: ['BETTER_AUTH_URL'],
    });
  }
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function validateServerEnv(
  rawEnv: Record<string, string | undefined> = process.env,
): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('Server environment variables cannot be accessed in the browser.');
  }

  const result = serverEnvSchema.safeParse(rawEnv);
  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(
      `Invalid server environment configuration:\n${formattedErrors}\n\nPlease check your environment variables or .env file.`,
    );
  }
  return result.data;
}

let cachedServerEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!cachedServerEnv) {
    cachedServerEnv = validateServerEnv();
  }
  return cachedServerEnv;
}

export const env = new Proxy({} as ServerEnv, {
  get(_target, prop: string) {
    return getServerEnv()[prop as keyof ServerEnv];
  },
});
