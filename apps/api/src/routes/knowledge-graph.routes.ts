import { Router } from 'express';
import { KnowledgeGraphController } from '../controllers/knowledge-graph.controller.js';
import { validateQuery, validateParams } from '../middlewares/validate.middleware.js';
import {
  GraphOverviewQuerySchema,
  GraphSearchQuerySchema,
  GraphPathQuerySchema,
  NodeSlugParamSchema,
} from '@ai-gurukul/validation';

export interface KnowledgeGraphRoutesOptions {
  knowledgeGraphController: KnowledgeGraphController;
}

export function createKnowledgeGraphRouter(options: KnowledgeGraphRoutesOptions): Router {
  const router = Router();
  const { knowledgeGraphController } = options;

  // 1. Graph Overview & Network Statistics
  router.get(
    '/overview',
    validateQuery(GraphOverviewQuerySchema),
    knowledgeGraphController.getOverview
  );

  // 2. Semantic Search across Concepts, Texts, Authors
  router.get('/search', validateQuery(GraphSearchQuerySchema), knowledgeGraphController.search);

  // 3. Shortest Path Traversal between two Nodes (BFS)
  router.get('/path', validateQuery(GraphPathQuerySchema), knowledgeGraphController.findPath);

  // 4. Node Detail & 1-Hop Neighborhood
  router.get(
    '/nodes/:slug',
    validateParams(NodeSlugParamSchema),
    knowledgeGraphController.getNodeDetails
  );

  return router;
}
