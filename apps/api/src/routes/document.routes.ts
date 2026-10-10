import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.middleware.js';
import {
  DocumentUploadSchema,
  DocumentListQuerySchema,
  DocumentIdParamSchema,
} from '@ai-gurukul/validation';

export interface DocumentRoutesOptions {
  documentController: DocumentController;
}

export function createDocumentRouter(options: DocumentRoutesOptions): Router {
  const router = Router();
  const { documentController } = options;

  // 1. Upload & Stage Document for Ingestion
  router.post('/', validateBody(DocumentUploadSchema), documentController.upload);

  // 2. List Ingested Documents with Filtering
  router.get('/', validateQuery(DocumentListQuerySchema), documentController.list);

  // 3. Get Document Details & Chunk Provenance
  router.get('/:id', validateParams(DocumentIdParamSchema), documentController.getById);

  // 4. Delete Document, Chunks, and Vector Embeddings
  router.delete('/:id', validateParams(DocumentIdParamSchema), documentController.delete);

  return router;
}
