import { describe, it, expect } from 'vitest';
import { LocalEmbeddingProvider, EmbeddingProviderFactory, SemanticChunker } from './index.js';

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

  describe('SemanticChunker', () => {
    const chunker = new SemanticChunker();

    it('returns empty array for blank input', () => {
      expect(chunker.chunk('')).toEqual([]);
      expect(chunker.chunk('   ')).toEqual([]);
    });

    it('returns single chunk for text under maxChunkSize', () => {
      const text = 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन [BG 2.47]';
      const chunks = chunker.chunk(text, { maxChunkSize: 500 });
      expect(chunks.length).toBe(1);
      expect(chunks[0].chunkIndex).toBe(0);
      expect(chunks[0].canonicalReference).toBe('BG 2.47');
      expect(chunks[0].tokenCount).toBeGreaterThan(0);
    });

    it('extracts canonical references accurately', () => {
      expect(chunker.extractCanonicalReference('Text without ref')).toBeUndefined();
      expect(chunker.extractCanonicalReference('As stated in [BG 2.47] we act')).toBe('BG 2.47');
      expect(chunker.extractCanonicalReference('(Charaka Samhita 1.42) describes')).toBe(
        'Charaka Samhita 1.42'
      );
    });

    it('splits large multiline documents into multiple overlapping chunks', () => {
      const p1 =
        'Paragraph 1: Foundational cosmology of Samkhya posits Purusha and Prakriti. '.repeat(5);
      const p2 =
        'Paragraph 2: Ayurveda uses this cosmology for Tri-Dosha assessment. [CS 1.1] '.repeat(5);
      const doc = `${p1}\n\n${p2}`;

      const chunks = chunker.chunk(doc, { maxChunkSize: 200, chunkOverlap: 40 });
      expect(chunks.length).toBeGreaterThan(1);
      for (let i = 0; i < chunks.length; i++) {
        expect(chunks[i].chunkIndex).toBe(i);
        expect(chunks[i].text.length).toBeGreaterThan(0);
      }
    });

    it('estimates token counts sensibly', () => {
      expect(chunker.estimateTokens('1234')).toBe(1);
      expect(chunker.estimateTokens('12345678')).toBe(2);
    });
  });
});
