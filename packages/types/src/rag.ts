export interface DocumentMetadata {
  domain: string;
  language: string;
  author?: string;
  era?: string;
  title: string;
  chapter?: number;
  verse?: number;
  [key: string]: unknown;
}

export interface ChunkRecord {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  canonicalReference?: string;
  metadata: DocumentMetadata;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  chunk: ChunkRecord;
}

export type IngestionJobStatus =
  'queued' | 'extracting' | 'chunking' | 'embedding' | 'indexing' | 'completed' | 'failed';

export interface IngestionJobPayload {
  documentId: string;
  storageKey: string;
  mimeType: string;
  correlationId: string;
}
