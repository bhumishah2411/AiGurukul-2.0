import { EmbeddingProvider } from './embedding-provider.interface.js';
import { LocalEmbeddingProvider } from './local-embedding.provider.js';

export class EmbeddingProviderFactory {
  public static create(providerType: string = 'local'): EmbeddingProvider {
    switch (providerType) {
      case 'local':
        return new LocalEmbeddingProvider();
      case 'openai':
      case 'cohere':
        // Placeholder for future phase API drivers; fall back to local provider in Phase 1
        return new LocalEmbeddingProvider();
      default:
        throw new Error(`Unsupported EmbeddingProvider type: ${providerType}`);
    }
  }
}
