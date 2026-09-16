/**
 * @artxflow/storage
 * Object storage provider abstraction.
 */

export interface StorageUploadOptions {
  contentType?: string;
  isPublic?: boolean;
}

export interface StorageClient {
  upload(key: string, data: Uint8Array, options?: StorageUploadOptions): Promise<string>;
  getDownloadUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}
