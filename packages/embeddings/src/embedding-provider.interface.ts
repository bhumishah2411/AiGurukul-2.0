export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
}

export interface EmbeddingProvider {
  readonly providerName: string;
  readonly dimensions: number;

  generateEmbedding(text: string): Promise<EmbeddingResult>;
  generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]>;
}
