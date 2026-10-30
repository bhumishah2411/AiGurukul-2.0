import { ObjectStorageProvider, UploadOptions } from './object-storage.interface.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export class LocalStorageProvider implements ObjectStorageProvider {
  public readonly providerName = 'local';
  private baseDir: string;

  constructor(baseDir = '.storage') {
    let target = path.resolve(process.cwd(), baseDir);
    try {
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
      }
    } catch {
      // In containerized/restricted environments (e.g. non-root Docker user on Render where /app is read-only),
      // gracefully fall back to the operating system's standard writable temporary directory
      target = path.resolve(os.tmpdir(), 'aigurukul-storage');
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
      }
    }
    this.baseDir = target;
  }

  public async upload(
    key: string,
    data: Buffer | Readable,
    _options?: UploadOptions
  ): Promise<string> {
    const filePath = this.resolveSafePath(key);
    const parentDir = path.dirname(filePath);

    if (!fs.existsSync(parentDir)) {
      try {
        fs.mkdirSync(parentDir, { recursive: true });
      } catch {
        // Parent directory may already exist or handle gracefully
      }
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
