import { Readable } from 'node:stream';

export interface UploadOptions {
  contentType: string;
  metadata?: Record<string, string>;
}

export interface ObjectStorageProvider {
  readonly providerName: string;

  upload(key: string, data: Buffer | Readable, options?: UploadOptions): Promise<string>;
  downloadStream(key: string): Promise<Readable>;
  downloadBuffer(key: string): Promise<Buffer>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
