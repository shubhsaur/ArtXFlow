import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import type { StorageClient, StorageUploadOptions } from './index';

export interface R2StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

export class R2StorageClient implements StorageClient {
  private s3: S3Client;
  private bucket: string;
  private publicUrl?: string;

  constructor(config: R2StorageConfig) {
    this.bucket = config.bucketName;
    this.publicUrl = config.publicUrl?.replace(/\/$/, '');
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(
    key: string,
    data: Uint8Array | Buffer,
    options?: StorageUploadOptions,
  ): Promise<string> {
    const cleanKey = key.replace(/^\/+/, '');
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: cleanKey,
        Body: data,
        ContentType: options?.contentType || 'application/octet-stream',
      }),
    );
    return this.getDownloadUrl(cleanKey);
  }

  async getDownloadUrl(key: string): Promise<string> {
    const cleanKey = key.replace(/^\/+/, '');
    if (this.publicUrl) {
      return `${this.publicUrl}/${cleanKey}`;
    }
    return `https://${this.bucket}.r2.cloudflarestorage.com/${cleanKey}`;
  }

  async delete(key: string): Promise<void> {
    const cleanKey = key.replace(/^\/+/, '');
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: cleanKey,
      }),
    );
  }

  async get(key: string): Promise<{ data: Uint8Array; contentType?: string } | null> {
    try {
      const cleanKey = key.replace(/^\/+/, '');
      const res = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: cleanKey,
        }),
      );
      if (!res.Body) return null;
      const byteArray = await res.Body.transformToByteArray();
      return {
        data: byteArray,
        contentType: res.ContentType,
      };
    } catch {
      return null;
    }
  }
}
