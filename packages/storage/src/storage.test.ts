import { describe, it, expect, afterAll } from 'vitest';
import { LocalStorageProvider, StorageProviderFactory } from './index.js';
import fs from 'node:fs';
import path from 'node:path';

describe('Storage Package Unit Tests', () => {
  const testDir = '.test-storage';
  const storage = new LocalStorageProvider(testDir);

  afterAll(async () => {
    const fullPath = path.resolve(process.cwd(), testDir);
    if (fs.existsSync(fullPath)) {
      await fs.promises.rm(fullPath, { recursive: true, force: true });
    }
  });

  it('creates LocalStorageProvider via factory', () => {
    const provider = StorageProviderFactory.create('local');
    expect(provider).toBeInstanceOf(LocalStorageProvider);
  });

  it('uploads buffer data and checks file existence', async () => {
    const testData = Buffer.from('Ancient Sanskrit Manuscript Text');
    const key = 'manuscripts/gita_01.txt';

    const url = await storage.upload(key, testData, { contentType: 'text/plain' });
    expect(url).toContain('manuscripts/gita_01.txt');

    const exists = await storage.exists(key);
    expect(exists).toBe(true);

    const downloaded = await storage.downloadBuffer(key);
    expect(downloaded.toString()).toBe('Ancient Sanskrit Manuscript Text');
  });

  it('deletes file correctly', async () => {
    const key = 'temp/delete_me.txt';
    await storage.upload(key, Buffer.from('temporary'));
    expect(await storage.exists(key)).toBe(true);

    await storage.delete(key);
    expect(await storage.exists(key)).toBe(false);
  });

  it('blocks path traversal attempts', async () => {
    await expect(storage.upload('../../../etc/passwd', Buffer.from('hacked'))).rejects.toThrow();
  });
});
