export interface ChunkOptions {
  maxChunkSize?: number; // Maximum character length per chunk (default: 600)
  chunkOverlap?: number; // Overlap in characters between adjacent chunks (default: 100)
  minChunkSize?: number; // Minimum character length to form a standalone chunk (default: 50)
  preserveParagraphs?: boolean; // Avoid splitting mid-paragraph where possible (default: true)
}

export interface ChunkResult {
  chunkIndex: number;
  text: string;
  tokenCount: number;
  canonicalReference?: string;
}

export class SemanticChunker {
  private readonly defaultMaxChunkSize = 600;
  private readonly defaultOverlap = 100;
  private readonly defaultMinChunkSize = 50;

  // Regex to detect canonical reference annotations like [BG 2.47] or (Charaka Samhita 1.42)
  private readonly referencePattern =
    /(?:\[|\()([A-Za-z\s]+(?:\s+\d+(?:[\.\-:]\d+)*|\s+(?:Chapter|Sutra|Verses?|Section)\s*[\d\.\-]+))(?:\]|\))/i;

  public chunk(text: string, options?: ChunkOptions): ChunkResult[] {
    const cleanText = text.trim();
    if (!cleanText) {
      return [];
    }

    const maxSize = options?.maxChunkSize ?? this.defaultMaxChunkSize;
    const overlap = options?.chunkOverlap ?? this.defaultOverlap;
    const minSize = options?.minChunkSize ?? this.defaultMinChunkSize;

    // If whole text fits within max chunk size, return single chunk
    if (cleanText.length <= maxSize) {
      return [
        {
          chunkIndex: 0,
          text: cleanText,
          tokenCount: this.estimateTokens(cleanText),
          canonicalReference: this.extractCanonicalReference(cleanText),
        },
      ];
    }

    // Split text into coherent segments by paragraphs, double-dandas (॥), or newlines
    const rawParagraphs = cleanText.split(/\n\s*\n|(?<=॥\s*)/);
    const paragraphs = rawParagraphs.map((p) => p.trim()).filter((p) => p.length > 0);

    const chunks: ChunkResult[] = [];
    let currentBuffer = '';
    let inheritedRef: string | undefined;

    for (const para of paragraphs) {
      const paraRef = this.extractCanonicalReference(para);
      if (paraRef) {
        inheritedRef = paraRef;
      }

      // If a single paragraph is larger than maxSize, break it by sentences or clauses
      if (para.length > maxSize) {
        // Flush existing buffer first if present
        if (currentBuffer.length >= minSize) {
          chunks.push({
            chunkIndex: chunks.length,
            text: currentBuffer,
            tokenCount: this.estimateTokens(currentBuffer),
            canonicalReference: inheritedRef,
          });
          currentBuffer = '';
        }

        const sentenceChunks = this.splitLargeParagraph(para, maxSize, overlap);
        for (const sChunk of sentenceChunks) {
          const sRef = this.extractCanonicalReference(sChunk) ?? inheritedRef;
          chunks.push({
            chunkIndex: chunks.length,
            text: sChunk,
            tokenCount: this.estimateTokens(sChunk),
            canonicalReference: sRef,
          });
        }
        continue;
      }

      // Check if adding this paragraph exceeds maxSize
      if (currentBuffer.length + para.length + 1 > maxSize) {
        if (currentBuffer.length >= minSize) {
          chunks.push({
            chunkIndex: chunks.length,
            text: currentBuffer,
            tokenCount: this.estimateTokens(currentBuffer),
            canonicalReference: inheritedRef,
          });

          // Compute overlap tail from previous buffer
          const overlapTail = this.extractOverlapTail(currentBuffer, overlap);
          currentBuffer = overlapTail ? `${overlapTail} ${para}` : para;
        } else {
          currentBuffer = currentBuffer ? `${currentBuffer} ${para}` : para;
        }
      } else {
        currentBuffer = currentBuffer ? `${currentBuffer}\n\n${para}` : para;
      }
    }

    // Final buffer flush
    if (currentBuffer.trim().length > 0) {
      chunks.push({
        chunkIndex: chunks.length,
        text: currentBuffer.trim(),
        tokenCount: this.estimateTokens(currentBuffer.trim()),
        canonicalReference: inheritedRef,
      });
    }

    return chunks;
  }

  private splitLargeParagraph(paragraph: string, maxSize: number, overlap: number): string[] {
    // Split on sentences (. ! ? or Sanskrit danda ।)
    const sentences = paragraph
      .split(/(?<=[.!?।]\s+)/)
      .map((s) => s.trim())
      .filter(Boolean);
    const results: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if (current.length + sentence.length + 1 > maxSize) {
        if (current.length > 0) {
          results.push(current);
          const tail = this.extractOverlapTail(current, overlap);
          current = tail ? `${tail} ${sentence}` : sentence;
        } else {
          // Hard slice if a single sentence exceeds maxSize
          results.push(sentence.substring(0, maxSize));
          current = sentence.substring(maxSize - overlap);
        }
      } else {
        current = current ? `${current} ${sentence}` : sentence;
      }
    }

    if (current.trim().length > 0) {
      results.push(current.trim());
    }

    return results;
  }

  private extractOverlapTail(buffer: string, overlapSize: number): string {
    if (buffer.length <= overlapSize) {
      return '';
    }
    const tailSlice = buffer.slice(-overlapSize);
    // Find closest word break to avoid cutting words in half
    const firstSpace = tailSlice.indexOf(' ');
    if (firstSpace !== -1 && firstSpace < tailSlice.length - 10) {
      return tailSlice.substring(firstSpace + 1).trim();
    }
    return tailSlice.trim();
  }

  public extractCanonicalReference(text: string): string | undefined {
    const match = this.referencePattern.exec(text);
    return match ? match[1].trim() : undefined;
  }

  public estimateTokens(text: string): number {
    // Standard linguistic heuristic for English and Romanized Sanskrit: ~4 characters per token
    return Math.max(1, Math.ceil(text.length / 4));
  }
}
