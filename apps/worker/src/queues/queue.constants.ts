export const QUEUE_NAMES = {
  DOCUMENT_INGESTION: 'document-ingestion',
  EMBEDDING_GENERATION: 'embedding-generation',
  AI_ASYNC: 'ai-async',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
