import { auth } from './auth';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized: Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

/**
 * Retrieves the current session and user from request headers.
 */
export async function getSession(headers?: Headers): Promise<AuthSession | null> {
  const sessionData = await auth.api.getSession({
    headers: headers || new Headers(),
  });

  if (!sessionData) {
    return null;
  }

  return sessionData as unknown as AuthSession;
}

/**
 * Returns the currently authenticated user, or null if unauthenticated.
 */
export async function getCurrentUser(headers?: Headers): Promise<AuthSession['user'] | null> {
  const session = await getSession(headers);
  return session?.user ?? null;
}

/**
 * Ensures the request is authenticated, throwing UnauthorizedError if not.
 */
export async function requireUser(headers?: Headers): Promise<AuthSession['user']> {
  const user = await getCurrentUser(headers);
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

