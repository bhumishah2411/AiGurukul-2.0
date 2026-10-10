export type DocumentStatus =
  'pending' | 'extracting' | 'chunking' | 'embedding' | 'indexed' | 'failed';

export type IngestionJobStatus =
  'queued' | 'extracting' | 'chunking' | 'embedding' | 'indexing' | 'completed' | 'failed';

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

export interface DocumentDTO {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  domain: string;
  language: string;
  author?: string;
  era?: string;
  status: DocumentStatus;
  chunkCount: number;
  tokenCount: number;
  errorMessage?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunkDTO {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  canonicalReference?: string;
  metadata: DocumentMetadata;
  createdAt: string;
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

export interface IngestionJobPayload {
  documentId: string;
  storageKey: string;
  mimeType: string;
  correlationId: string;
}

export interface DocumentUploadRequestDTO {
  title: string;
  domain: string;
  content: string;
  fileName?: string;
  mimeType?: string;
  author?: string;
  era?: string;
  language?: string;
}

export interface DocumentListQueryDTO {
  page?: number;
  limit?: number;
  domain?: string;
  status?: DocumentStatus;
  search?: string;
}

export interface DocumentListResponseDTO {
  documents: DocumentDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CitationReferenceDTO {
  documentId: string;
  documentTitle: string;
  author?: string;
  canonicalReference?: string;
  chunkIndex: number;
  snippet: string;
  similarityScore: number;
}

export interface RAGQueryRequestDTO {
  query: string;
  topK?: number;
  minScore?: number;
  domainFilter?: string;
}

export interface RAGQueryResponseDTO {
  query: string;
  resultsCount: number;
  citations: CitationReferenceDTO[];
  synthesizedContext: string;
}

export interface RAGStatsDTO {
  totalDocuments: number;
  indexedDocuments: number;
  totalChunks: number;
  totalTokens: number;
  domainCounts: Record<string, number>;
}
