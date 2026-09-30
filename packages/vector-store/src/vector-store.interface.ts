export interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    documentId: string;
    canonicalReference?: string;
    domain: string;
    chunkText: string;
    chapter?: number;
    verse?: number;
    [key: string]: unknown;
  };
}

export interface VectorQueryOptions {
  topK: number;
  filter?: Record<string, unknown>;
  minScore?: number;
}

export interface VectorQueryResult {
  id: string;
  score: number;
  metadata: VectorRecord['metadata'];
}

export interface VectorStoreProvider {
  readonly providerName: string;

  upsert(records: VectorRecord[]): Promise<void>;
  query(vector: number[], options: VectorQueryOptions): Promise<VectorQueryResult[]>;
  delete(ids: string[]): Promise<void>;
  deleteByFilter(filter: Record<string, unknown>): Promise<void>;
}
