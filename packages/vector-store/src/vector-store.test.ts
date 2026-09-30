import { describe, it, expect } from 'vitest';
import { LocalVectorStoreProvider, VectorStoreFactory } from './index.js';

describe('Vector Store Package Unit Tests', () => {
  it('creates LocalVectorStoreProvider via factory', () => {
    const store = VectorStoreFactory.create('local');
    expect(store).toBeInstanceOf(LocalVectorStoreProvider);
  });

  it('upserts and queries records with cosine similarity', async () => {
    const store = new LocalVectorStoreProvider();

    await store.upsert([
      {
        id: 'chunk_1',
        values: [1, 0, 0],
        metadata: {
          documentId: 'gita_doc',
          domain: 'gita',
          canonicalReference: 'BG 2.47',
          chunkText: 'Karmanye Vadhikaraste',
        },
      },
      {
        id: 'chunk_2',
        values: [0, 1, 0],
        metadata: {
          documentId: 'chanakya_doc',
          domain: 'chanakya',
          canonicalReference: 'Arthashastra 1.1',
          chunkText: 'Vinaya is the root of statecraft',
        },
      },
    ]);

    // Query close to chunk_1
    const results = await store.query([0.9, 0.1, 0], { topK: 1 });
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('chunk_1');
    expect(results[0].metadata.canonicalReference).toBe('BG 2.47');
    expect(results[0].score).toBeGreaterThan(0.8);
  });

  it('filters results by domain', async () => {
    const store = new LocalVectorStoreProvider();
    await store.upsert([
      {
        id: 'c1',
        values: [1, 1, 0],
        metadata: { documentId: 'd1', domain: 'gita', chunkText: 'text 1' },
      },
      {
        id: 'c2',
        values: [1, 1, 0],
        metadata: { documentId: 'd2', domain: 'ayurveda', chunkText: 'text 2' },
      },
    ]);

    const results = await store.query([1, 1, 0], { topK: 10, filter: { domain: 'ayurveda' } });
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('c2');
  });
});
