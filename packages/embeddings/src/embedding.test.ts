import { describe, it, expect } from 'vitest';
import { LocalEmbeddingProvider, EmbeddingProviderFactory } from './index.js';

describe('Embedding Provider Package Unit Tests', () => {
  it('creates LocalEmbeddingProvider via factory', () => {
    const provider = EmbeddingProviderFactory.create('local');
    expect(provider).toBeInstanceOf(LocalEmbeddingProvider);
    expect(provider.dimensions).toBe(384);
  });

  it('generates a normalized embedding of exact dimension', async () => {
    const provider = new LocalEmbeddingProvider();
    const result = await provider.generateEmbedding('Karmanye Vadhikaraste Ma Phaleshu Kadachana');
    expect(result.dimensions).toBe(384);
    expect(result.embedding.length).toBe(384);

    // Verify L2 norm is ~1
    const norm = Math.sqrt(result.embedding.reduce((acc, val) => acc + val * val, 0));
    expect(norm).toBeCloseTo(1, 2);
  });

  it('generates batch embeddings matching text count', async () => {
    const provider = new LocalEmbeddingProvider();
    const results = await provider.generateEmbeddings(['Verse 1', 'Verse 2', 'Verse 3']);
    expect(results.length).toBe(3);
    expect(results[0].dimensions).toBe(384);
  });
});
