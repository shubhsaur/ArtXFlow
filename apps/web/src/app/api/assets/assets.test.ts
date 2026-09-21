import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as uploadHandler } from './upload/route';
import { GET as serveHandler } from './[...key]/route';
import { GET as unsplashHandler } from '../unsplash/search/route';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { assetRepository } from '@artxflow/database';
import { getStorageClient } from '@artxflow/storage';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@artxflow/auth', () => ({
  getSession: vi.fn(),
  bootstrapPersonalOrganization: vi.fn(),
}));

describe('Assets & Media API Routes', () => {
  const mockUser = {
    id: 'user-uuid-1',
    name: 'Alice Dev',
    email: 'alice@example.com',
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrg = {
    id: 'org-uuid-1',
    name: "Alice's Org",
    slug: 'alice-org',
  };

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

    vi.mocked(bootstrapPersonalOrganization).mockResolvedValue({
      organization: {
        ...mockOrg,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      membership: {
        id: 'mem-1',
        organizationId: mockOrg.id,
        userId: mockUser.id,
        role: 'OWNER',
        createdAt: new Date(),
      },
      created: false,
    });
  });

  describe('POST /api/assets/upload', () => {
    it('returns 401 if unauthenticated', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const formData = new FormData();
      formData.append('file', new File(['dummy'], 'test.png', { type: 'image/png' }));

      const req = new Request('http://localhost/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadHandler(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 if no file is provided', async () => {
      const formData = new FormData();
      const req = new Request('http://localhost/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('No file uploaded');
    });

    it('returns 400 if file type is unsupported', async () => {
      const formData = new FormData();
      formData.append('file', new File(['%PDF-1.4'], 'document.pdf', { type: 'application/pdf' }));

      const req = new Request('http://localhost/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Unsupported file type/);
    });

    it('returns 201 and creates asset record on valid image upload', async () => {
      const mockCreatedAsset = {
        id: 'asset-uuid-1',
        organizationId: mockOrg.id,
        type: 'IMAGE' as const,
        storageKey: 'orgs/org-uuid-1/images/123-diagram.png',
        fileName: 'diagram.png',
        mimeType: 'image/png',
        sizeBytes: 1024,
        width: null,
        height: null,
        url: 'https://media.artxflow.com/orgs/org-uuid-1/images/123-diagram.png',
        createdAt: new Date(),
      };

      vi.spyOn(assetRepository, 'create').mockResolvedValueOnce(mockCreatedAsset);

      const storageClient = getStorageClient();
      vi.spyOn(storageClient, 'upload').mockResolvedValueOnce(
        'https://media.artxflow.com/orgs/org-uuid-1/images/123-diagram.png',
      );

      const fileData = new Uint8Array([137, 80, 78, 71]); // PNG magic bytes
      const file = new File([fileData], 'diagram.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('file', file);

      const req = new Request('http://localhost/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadHandler(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.asset.id).toBe('asset-uuid-1');
      expect(json.asset.url).toBe(mockCreatedAsset.url);
      expect(assetRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: mockOrg.id,
          fileName: 'diagram.png',
          mimeType: 'image/png',
          type: 'IMAGE',
        }),
      );
    });
  });

  describe('GET /api/assets/[...key]', () => {
    it('returns 404 if asset not found in storage', async () => {
      const storageClient = getStorageClient();
      vi.spyOn(storageClient, 'get').mockResolvedValueOnce(null);

      const req = new Request('http://localhost/api/assets/missing/image.png');
      const res = await serveHandler(req, {
        params: Promise.resolve({ key: ['missing', 'image.png'] }),
      });

      expect(res.status).toBe(404);
    });

    it('returns 200 with image binary and cache headers when found', async () => {
      const storageClient = getStorageClient();
      const testData = new Uint8Array([1, 2, 3, 4]);
      vi.spyOn(storageClient, 'get').mockResolvedValueOnce({
        data: testData,
        contentType: 'image/png',
      });

      const req = new Request('http://localhost/api/assets/orgs/test/image.png');
      const res = await serveHandler(req, {
        params: Promise.resolve({ key: ['orgs', 'test', 'image.png'] }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('image/png');
      expect(res.headers.get('Cache-Control')).toContain('public');
    });
  });

  describe('GET /api/unsplash/search', () => {
    it('returns curated photos when no Unsplash access key is configured', async () => {
      const origKey = process.env.UNSPLASH_ACCESS_KEY;
      delete process.env.UNSPLASH_ACCESS_KEY;
      try {
        const req = new Request('http://localhost/api/unsplash/search');
        const res = await unsplashHandler(req);

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.results.length).toBeGreaterThan(0);
        expect(json.isFallback).toBe(true);
        expect(json.results[0]).toHaveProperty('urls');
        expect(json.results[0]).toHaveProperty('user');
        expect(json.results[0].user).toHaveProperty('link');
      } finally {
        if (origKey) process.env.UNSPLASH_ACCESS_KEY = origKey;
      }
    });

    it('filters curated photos based on search query', async () => {
      const origKey = process.env.UNSPLASH_ACCESS_KEY;
      delete process.env.UNSPLASH_ACCESS_KEY;
      try {
        const req = new Request('http://localhost/api/unsplash/search?query=macbook');
        const res = await unsplashHandler(req);

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.results.length).toBeGreaterThan(0);
        expect(
          json.results.some((p: { description: string }) => p.description.toLowerCase().includes('macbook')),
        ).toBe(true);
      } finally {
        if (origKey) process.env.UNSPLASH_ACCESS_KEY = origKey;
      }
    });
  });
});
