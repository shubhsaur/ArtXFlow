import { R2StorageClient, type R2StorageConfig } from './r2';
import { LocalStorageClient, type LocalStorageConfig } from './local';

export * from './r2';
export * from './local';

export interface StorageUploadOptions {
  contentType?: string;
  isPublic?: boolean;
}

export interface StorageClient {
  upload(key: string, data: Uint8Array | Buffer, options?: StorageUploadOptions): Promise<string>;
  getDownloadUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
  get(key: string): Promise<{ data: Uint8Array; contentType?: string } | null>;
}

export interface CreateStorageClientOptions {
  r2?: Partial<R2StorageConfig>;
  local?: Partial<LocalStorageConfig>;
}

export function createStorageClient(options?: CreateStorageClientOptions): StorageClient {
  const accountId = options?.r2?.accountId || process.env.R2_ACCOUNT_ID;
  const accessKeyId = options?.r2?.accessKeyId || process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = options?.r2?.secretAccessKey || process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = options?.r2?.bucketName || process.env.R2_BUCKET_NAME;
  const publicUrl = options?.r2?.publicUrl || process.env.R2_PUBLIC_URL;

  if (accountId && accessKeyId && secretAccessKey && bucketName) {
    return new R2StorageClient({
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicUrl,
    });
  }

  return new LocalStorageClient(options?.local);
}

let defaultStorageClient: StorageClient | null = null;

export function getStorageClient(): StorageClient {
  if (!defaultStorageClient) {
    defaultStorageClient = createStorageClient();
  }
  return defaultStorageClient;
}
