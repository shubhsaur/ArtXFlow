import { describe, it, expect, vi, beforeEach } from 'vitest';
import type * as DatabaseModule from '@artxflow/database';
import sharp from 'sharp';
import { POST, DELETE } from './route';
import { getSession } from '@artxflow/auth';
import { profileRepository } from '@artxflow/database';
import { getStorageClient } from '@artxflow/storage';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@artxflow/auth', () => ({
  getSession: vi.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {},
}));

vi.mock('@artxflow/database', async (importOriginal) => {
  const actual = await importOriginal<typeof DatabaseModule>();
  return {
    ...actual,
    profileRepository: {
      updateUserBasic: vi.fn(),
    },
  };
});

describe('Avatar API Route', () => {
  const mockUser = {
    id: 'user-uuid-1',
    name: 'Alice Dev',
    email: 'alice@example.com',
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPublicUrl = 'https://media.artxflow.com/users/user-uuid-1/avatar/profile';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      user: mockUser,
      session: {
        id: 'sess-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: mockUser.id,
        expiresAt: new Date(),
        token: 'token-1',
      },
    });

    const storageClient = getStorageClient();
    vi.spyOn(storageClient, 'upload').mockResolvedValue(mockPublicUrl);
    vi.spyOn(storageClient, 'delete').mockResolvedValue(undefined);
  });

  describe('POST /api/user/avatar', () => {
    it('returns 401 if unauthenticated', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const formData = new FormData();
      formData.append('file', new File(['dummy'], 'test.png', { type: 'image/png' }));

      const res = await POST(
        new Request('http://localhost/api/user/avatar', {
          method: 'POST',
          body: formData,
        }),
      );
      expect(res.status).toBe(401);
    });

    it('returns 400 if no file is provided', async () => {
      const formData = new FormData();
      const req = new Request('http://localhost/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('No image provided');
    });

    it('returns 400 if file type is unsupported', async () => {
      const formData = new FormData();
      formData.append('file', new File(['%PDF-1.4'], 'document.pdf', { type: 'application/pdf' }));

      const req = new Request('http://localhost/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Unsupported file type/);
    });

    it('uploads processed avatar to storage and updates user image', async () => {
      const rawBuffer = await sharp({
        create: {
          width: 800,
          height: 800,
          channels: 4,
          background: { r: 0, g: 100, b: 200, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      const formData = new FormData();
      formData.append('file', new File([rawBuffer], 'avatar.png', { type: 'image/png' }));

      const req = new Request('http://localhost/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.imageUrl).toBe(mockPublicUrl);

      const storageClient = getStorageClient();
      expect(storageClient.upload).toHaveBeenCalledWith(
        `users/${mockUser.id}/avatar/profile`,
        expect.any(Buffer),
        { contentType: 'image/webp', isPublic: true },
      );

      expect(profileRepository.updateUserBasic).toHaveBeenCalledWith(mockUser.id, {
        image: mockPublicUrl,
      });
    });

    it('supports setting avatar from external image URL', async () => {
      const req = new Request('http://localhost/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: 'https://example.com/avatar.png' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.imageUrl).toBe('https://example.com/avatar.png');
    });
  });

  describe('DELETE /api/user/avatar', () => {
    it('returns 401 if unauthenticated', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const res = await DELETE();
      expect(res.status).toBe(401);
    });

    it('deletes avatar from storage and clears user image', async () => {
      const res = await DELETE();
      expect(res.status).toBe(200);

      const storageClient = getStorageClient();
      expect(storageClient.delete).toHaveBeenCalledWith(
        `users/${mockUser.id}/avatar/profile`,
      );
      expect(profileRepository.updateUserBasic).toHaveBeenCalledWith(mockUser.id, {
        image: null,
      });
    });
  });
});
