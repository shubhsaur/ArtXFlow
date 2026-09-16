import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSession,
  getCurrentUser,
  requireUser,
  UnauthorizedError,
  type AuthSession,
} from './session';
import { auth } from './auth';

vi.mock('./auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe('@artxflow/auth session helpers', () => {
  const mockUser: AuthSession['user'] = {
    id: 'user-123',
    email: 'dev@artxflow.com',
    name: 'Dev User',
    emailVerified: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockSession: AuthSession['session'] = {
    id: 'session-456',
    userId: 'user-123',
    expiresAt: new Date('2026-01-02T00:00:00Z'),
    token: 'token-abc',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('auth configuration', () => {
    it('is exported and defined', () => {
      expect(auth).toBeDefined();
    });
  });

  describe('getSession', () => {
    it('returns null when no active session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null as never);

      const result = await getSession();
      expect(result).toBeNull();
    });

    it('returns session data when session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      } as never);

      const result = await getSession();
      expect(result).not.toBeNull();
      expect(result?.user.id).toBe('user-123');
      expect(result?.session.id).toBe('session-456');
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when unauthenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null as never);

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it('returns user when authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      } as never);

      const result = await getCurrentUser();
      expect(result).toEqual(mockUser);
    });
  });

  describe('requireUser', () => {
    it('returns user when authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      } as never);

      const result = await requireUser();
      expect(result).toEqual(mockUser);
    });

    it('throws UnauthorizedError when unauthenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null as never);

      await expect(requireUser()).rejects.toThrow(UnauthorizedError);
      await expect(requireUser()).rejects.toThrow('Unauthorized: Authentication required');
    });
  });
});
