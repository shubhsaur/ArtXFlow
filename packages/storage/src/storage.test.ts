import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  LocalStorageClient,
  R2StorageClient,
  createStorageClient,
  getStorageClient,
} from './index';

describe('@artxflow/storage', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'artxflow-storage-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  describe('LocalStorageClient', () => {
    it('uploads, retrieves, and deletes files locally', async () => {
      const client = new LocalStorageClient({
        baseDir: tempDir,
        baseUrl: '/api/assets',
      });

      const testData = new TextEncoder().encode('Hello, ArtXFlow Storage!');
      const key = 'uploads/test-image.png';

      // 1. Upload
      const url = await client.upload(key, testData, { contentType: 'image/png' });
      expect(url).toBe('/api/assets/uploads/test-image.png');

      // 2. Verify file on disk
      const retrieved = await client.get(key);
      expect(retrieved).not.toBeNull();
      expect(new TextDecoder().decode(retrieved?.data)).toBe('Hello, ArtXFlow Storage!');

      // 3. Delete
      await client.delete(key);
      const afterDelete = await client.get(key);
      expect(afterDelete).toBeNull();
    });

    it('generates correct download URLs', async () => {
      const client = new LocalStorageClient({
        baseDir: tempDir,
        baseUrl: 'https://cdn.example.com/assets',
      });

      const url = await client.getDownloadUrl('image.jpg');
      expect(url).toBe('https://cdn.example.com/assets/image.jpg');
    });
  });

  describe('R2StorageClient', () => {
    it('initializes and formats public URLs correctly', async () => {
      const client = new R2StorageClient({
        accountId: 'test-account-id',
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
        bucketName: 'artxflow-media',
        publicUrl: 'https://media.artxflow.com',
      });

      const url = await client.getDownloadUrl('articles/banner.png');
      expect(url).toBe('https://media.artxflow.com/articles/banner.png');
    });

    it('falls back to r2.cloudflarestorage.com when publicUrl is not provided', async () => {
      const client = new R2StorageClient({
        accountId: 'test-account-id',
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
        bucketName: 'artxflow-media',
      });

      const url = await client.getDownloadUrl('articles/banner.png');
      expect(url).toBe('https://artxflow-media.r2.cloudflarestorage.com/articles/banner.png');
    });
  });

  describe('createStorageClient factory', () => {
    const origEnv = process.env;

    beforeEach(() => {
      process.env = { ...origEnv };
      delete process.env.R2_ACCOUNT_ID;
      delete process.env.R2_ACCESS_KEY_ID;
      delete process.env.R2_SECRET_ACCESS_KEY;
      delete process.env.R2_BUCKET_NAME;
    });

    afterEach(() => {
      process.env = origEnv;
    });

    it('returns LocalStorageClient when R2 credentials are not set', () => {
      const client = createStorageClient();
      expect(client).toBeInstanceOf(LocalStorageClient);
    });

    it('returns R2StorageClient when R2 credentials are set', () => {
      process.env.R2_ACCOUNT_ID = 'test-id';
      process.env.R2_ACCESS_KEY_ID = 'test-key';
      process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
      process.env.R2_BUCKET_NAME = 'test-bucket';

      const client = createStorageClient();
      expect(client).toBeInstanceOf(R2StorageClient);
    });

    it('returns default singleton instance via getStorageClient', () => {
      const client = getStorageClient();
      expect(client).toBeDefined();
    });
  });
});
