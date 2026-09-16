import { z } from 'zod';

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_APP_URL must be a valid URL' })
    .default('http://localhost:3000'),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function validateClientEnv(
  rawEnv: Record<string, string | undefined> = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
): ClientEnv {
  const result = clientEnvSchema.safeParse(rawEnv);
  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(
      `Invalid client environment configuration:\n${formattedErrors}\n\nPlease check your environment variables or .env file.`,
    );
  }
  return result.data;
}

let cachedClientEnv: ClientEnv | null = null;

export function getClientEnv(): ClientEnv {
  if (!cachedClientEnv) {
    cachedClientEnv = validateClientEnv();
  }
  return cachedClientEnv;
}

export const env = new Proxy({} as ClientEnv, {
  get(_target, prop: string) {
    return getClientEnv()[prop as keyof ClientEnv];
  },
});
