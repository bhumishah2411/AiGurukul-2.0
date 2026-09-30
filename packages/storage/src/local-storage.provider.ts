import { ObjectStorageProvider, UploadOptions } from './object-storage.interface.js';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export class LocalStorageProvider implements ObjectStorageProvider {
  public readonly providerName = 'local';
  private baseDir: string;

  constructor(baseDir = '.storage') {
    this.baseDir = path.resolve(process.cwd(), baseDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  public async upload(
    key: string,
    data: Buffer | Readable,
    _options?: UploadOptions
  ): Promise<string> {
    const filePath = this.resolveSafePath(key);
    const parentDir = path.dirname(filePath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (Buffer.isBuffer(data)) {
      await fs.promises.writeFile(filePath, data);
    } else {
      const writeStream = fs.createWriteStream(filePath);
      await pipeline(data, writeStream);
    }

    return `file://${filePath.replace(/\\/g, '/')}`;
  }

  public async downloadStream(key: string): Promise<Readable> {
    const filePath = this.resolveSafePath(key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found in storage: ${key}`);
    }
    return fs.createReadStream(filePath);
  }

  public async downloadBuffer(key: string): Promise<Buffer> {
    const filePath = this.resolveSafePath(key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found in storage: ${key}`);
    }
    return fs.promises.readFile(filePath);
  }

  public async getSignedUrl(key: string, _expiresInSeconds = 3600): Promise<string> {
    const filePath = this.resolveSafePath(key);
    return `file://${filePath.replace(/\\/g, '/')}`;
  }

  public async delete(key: string): Promise<void> {
    const filePath = this.resolveSafePath(key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  public async exists(key: string): Promise<boolean> {
    const filePath = this.resolveSafePath(key);
    return fs.existsSync(filePath);
  }

  private resolveSafePath(key: string): string {
    const resolvedPath = path.resolve(this.baseDir, key);

    if (!resolvedPath.startsWith(this.baseDir) || key.includes('..')) {
      throw new Error('Access denied: Path traversal attempted in storage key.');
    }
    return resolvedPath;
  }
}
