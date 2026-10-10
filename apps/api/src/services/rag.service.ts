import { DocumentRepository, DocumentChunkRepository } from '../repositories/index.js';
import { EmbeddingProvider } from '@ai-gurukul/embeddings';
import { VectorStoreProvider } from '@ai-gurukul/vector-store';
import { DocumentChunkModel } from '@ai-gurukul/database';
import {
  CitationReferenceDTO,
  RAGQueryRequestDTO,
  RAGQueryResponseDTO,
  RAGStatsDTO,
} from '@ai-gurukul/types';

export class RAGService {
  private docRepo: DocumentRepository;
  private chunkRepo: DocumentChunkRepository;
  private embeddingProvider: EmbeddingProvider;
  private vectorStore: VectorStoreProvider;

  constructor(
    docRepo: DocumentRepository,
    chunkRepo: DocumentChunkRepository,
    embeddingProvider: EmbeddingProvider,
    vectorStore: VectorStoreProvider
  ) {
    this.docRepo = docRepo;
    this.chunkRepo = chunkRepo;
    this.embeddingProvider = embeddingProvider;
    this.vectorStore = vectorStore;
  }

  public async query(options: RAGQueryRequestDTO): Promise<RAGQueryResponseDTO> {
    const topK = options.topK ?? 5;
    const minScore = options.minScore ?? 0.01;
    const cleanQuery = options.query.trim();

    // 1. Generate query embedding
    const queryEmb = await this.embeddingProvider.generateEmbedding(cleanQuery);

    // 2. Query Vector Store with cosine similarity
    const filter: Record<string, unknown> = {};
    if (options.domainFilter) {
      filter.domain = options.domainFilter.toLowerCase();
    }

    const vectorResults = await this.vectorStore.query(queryEmb.embedding, {
      topK,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      minScore,
    });

    const citations: CitationReferenceDTO[] = [];

    for (const vRes of vectorResults) {
      const meta = vRes.metadata;
      citations.push({
        documentId: (meta.documentId as string) || vRes.id.split('_chunk_')[0],
        documentTitle: (meta.title as string) || 'Canonical Vedic Text',
        author: meta.author as string | undefined,
        canonicalReference: meta.canonicalReference as string | undefined,
        chunkIndex: typeof meta.chunkIndex === 'number' ? meta.chunkIndex : 0,
        snippet: (meta.chunkText as string) || '',
        similarityScore: vRes.score,
      });
    }

    // 3. Hybrid fallback: If vector store yielded fewer results than topK, search DocumentChunkModel in MongoDB
    if (citations.length < topK) {
      const queryWords = cleanQuery
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2);

      const filterCond: Record<string, unknown> = {};
      if (options.domainFilter) {
        filterCond['metadata.domain'] = options.domainFilter.toLowerCase();
      }

      if (queryWords.length > 0) {
        const regexPattern = queryWords.join('|');
        filterCond.$or = [
          { text: { $regex: regexPattern, $options: 'i' } },
          { canonicalReference: { $regex: regexPattern, $options: 'i' } },
        ];
      }

      const existingDocIds = new Set(citations.map((c) => c.documentId));
      const chunkDocs = await DocumentChunkModel.find(filterCond)
        .limit(topK - citations.length)
        .exec();

      for (const cDoc of chunkDocs) {
        if (!existingDocIds.has(cDoc.documentId.toString())) {
          const meta = cDoc.metadata || {};
          citations.push({
            documentId: cDoc.documentId.toString(),
            documentTitle: (meta.title as string) || 'Canonical Vedic Text',
            author: meta.author as string | undefined,
            canonicalReference: cDoc.canonicalReference,
            chunkIndex: cDoc.chunkIndex,
            snippet: cDoc.text,
            similarityScore: 0.85,
          });
        }
      }
    }

    // 4. Synthesize structured provenance context
    let synthesizedContext = '';
    if (citations.length > 0) {
      const contextBlocks = citations.map((c, i) => {
        const refStr = c.canonicalReference ? ` | Ref: ${c.canonicalReference}` : '';
        const authorStr = c.author ? ` | Author: ${c.author}` : '';
        const scorePct = Math.round(c.similarityScore * 100);
        return `[Source ${i + 1}: "${c.documentTitle}"${authorStr}${refStr} | Match: ${scorePct}%]\n${c.snippet}`;
      });

      synthesizedContext = [
        '### Grounded Vedic Source Context:',
        ...contextBlocks,
        '---',
        'Use the above canonical citations to directly anchor answers and verify textual claims.',
      ].join('\n\n');
    } else {
      synthesizedContext = 'No direct textual citations found matching this inquiry.';
    }

    return {
      query: cleanQuery,
      resultsCount: citations.length,
      citations,
      synthesizedContext,
    };
  }

  public async getStats(): Promise<RAGStatsDTO> {
    const docStats = await this.docRepo.getStats();
    const totalChunks = await this.chunkRepo.countTotalChunks();

    return {
      totalDocuments: docStats.totalDocuments,
      indexedDocuments: docStats.indexedDocuments,
      totalChunks,
      totalTokens: docStats.totalTokens,
      domainCounts: docStats.domainCounts,
    };
  }
}
