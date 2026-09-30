import { EmbeddingProvider, EmbeddingResult } from './embedding-provider.interface.js';

export class LocalEmbeddingProvider implements EmbeddingProvider {
  public readonly providerName = 'local';
  public readonly dimensions = 384;

  public async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const vector = new Array(this.dimensions).fill(0);
    const cleanText = text.trim().toLowerCase();

    for (let i = 0; i < cleanText.length; i++) {
      const code = cleanText.charCodeAt(i);
      const index = (code * (i + 1) * 31) % this.dimensions;
      vector[index] += (code % 10) + 1;
    }

    // Normalize to unit length (L2 norm)
    let sumSquares = 0;
    for (let i = 0; i < this.dimensions; i++) {
      sumSquares += vector[i] * vector[i];
    }
    const norm = Math.sqrt(sumSquares) || 1;
    for (let i = 0; i < this.dimensions; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(6));
    }

    return {
      embedding: vector,
      dimensions: this.dimensions,
    };
  }

  public async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }
}
