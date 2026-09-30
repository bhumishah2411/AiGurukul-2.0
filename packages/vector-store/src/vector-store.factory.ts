import { VectorStoreProvider } from './vector-store.interface.js';
import { LocalVectorStoreProvider } from './local-vector-store.provider.js';

export class VectorStoreFactory {
  public static create(providerType: string = 'local'): VectorStoreProvider {
    switch (providerType) {
      case 'local':
        return new LocalVectorStoreProvider();
      case 'pinecone':
        // Placeholder for Pinecone driver; fall back to local provider in Phase 1
        return new LocalVectorStoreProvider();
      default:
        throw new Error(`Unsupported VectorStoreProvider type: ${providerType}`);
    }
  }
}
