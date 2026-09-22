import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { StorageClient, StorageUploadOptions } from './index';

export interface LocalStorageConfig {
  baseDir?: string;
  baseUrl?: string;
}

export class LocalStorageClient implements StorageClient {
  private baseDir: string;
  private baseUrl: string;

  constructor(config: LocalStorageConfig = {}) {
    this.baseDir = config.baseDir || path.join(process.cwd(), '.storage');
    this.baseUrl = (config.baseUrl || '/api/assets').replace(/\/$/, '');
  }

  async upload(
    key: string,
    data: Uint8Array | Buffer,
    _options?: StorageUploadOptions,
  ): Promise<string> {
    const cleanKey = key.replace(/^\/+/, '');
    const filePath = path.join(this.baseDir, cleanKey);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    return this.getDownloadUrl(cleanKey);
  }

  async getDownloadUrl(key: string): Promise<string> {
    const cleanKey = key.replace(/^\/+/, '');
    return `${this.baseUrl}/${cleanKey}`;
  }

  async delete(key: string): Promise<void> {
    const cleanKey = key.replace(/^\/+/, '');
    const filePath = path.join(this.baseDir, cleanKey);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  async get(key: string): Promise<{ data: Uint8Array; contentType?: string } | null> {
    try {
      const cleanKey = key.replace(/^\/+/, '');
      const filePath = path.join(this.baseDir, cleanKey);
      const data = await fs.readFile(filePath);
      return { data };
    } catch {
      return null;
    }
  }
}
