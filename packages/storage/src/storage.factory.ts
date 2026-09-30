import { ObjectStorageProvider } from './object-storage.interface.js';
import { LocalStorageProvider } from './local-storage.provider.js';

export class StorageProviderFactory {
  public static create(
    providerType: string = 'local',
    baseDir = '.storage'
  ): ObjectStorageProvider {
    switch (providerType) {
      case 'local':
        return new LocalStorageProvider(baseDir);
      case 's3':
        // Placeholder for AWS S3 / MinIO driver; fall back to local provider in Phase 1
        return new LocalStorageProvider(baseDir);
      default:
        throw new Error(`Unsupported ObjectStorageProvider type: ${providerType}`);
    }
  }
}
