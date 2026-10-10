import { Router } from 'express';
import { RAGController } from '../controllers/rag.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { RAGQuerySchema } from '@ai-gurukul/validation';

export interface RAGRoutesOptions {
  ragController: RAGController;
}

export function createRAGRouter(options: RAGRoutesOptions): Router {
  const router = Router();
  const { ragController } = options;

  // 1. Semantic Citation Retrieval & Context Synthesis
  router.post('/query', validateBody(RAGQuerySchema), ragController.query);

  // 2. RAG Corpus Metrics & Knowledge Statistics
  router.get('/stats', ragController.stats);

  return router;
}
