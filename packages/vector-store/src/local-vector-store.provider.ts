import {
  VectorStoreProvider,
  VectorRecord,
  VectorQueryOptions,
  VectorQueryResult,
} from './vector-store.interface.js';

export class LocalVectorStoreProvider implements VectorStoreProvider {
  public readonly providerName = 'local';
  private records: Map<string, VectorRecord> = new Map();

  public async upsert(records: VectorRecord[]): Promise<void> {
    for (const record of records) {
      this.records.set(record.id, record);
    }
  }

  public async query(
    queryVector: number[],
    options: VectorQueryOptions
  ): Promise<VectorQueryResult[]> {
    const results: VectorQueryResult[] = [];
    const minScore = options.minScore ?? -1;

    for (const record of this.records.values()) {
      // 1. Check metadata filter if provided
      if (options.filter) {
        let matches = true;
        for (const [key, value] of Object.entries(options.filter)) {
          if (record.metadata[key] !== value) {
            matches = false;
            break;
          }
        }
        if (!matches) continue;
      }

      // 2. Compute Cosine Similarity
      const score = this.cosineSimilarity(queryVector, record.values);
      if (score >= minScore) {
        results.push({
          id: record.id,
          score: Number(score.toFixed(4)),
          metadata: record.metadata,
        });
      }
    }

    // Sort descending by score and take topK
    return results.sort((a, b) => b.score - a.score).slice(0, options.topK);
  }

  public async delete(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.records.delete(id);
    }
  }

  public async deleteByFilter(filter: Record<string, unknown>): Promise<void> {
    for (const [id, record] of this.records.entries()) {
      let matches = true;
      for (const [key, value] of Object.entries(filter)) {
        if (record.metadata[key] !== value) {
          matches = false;
          break;
        }
      }
      if (matches) {
        this.records.delete(id);
      }
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}
