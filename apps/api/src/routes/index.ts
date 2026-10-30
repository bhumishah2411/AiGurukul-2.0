import { Router, RequestHandler } from 'express';
import { HealthController } from '../controllers/health.controller.js';
import { AuthController } from '../controllers/auth.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { WisdomController } from '../controllers/wisdom.controller.js';
import { AyurvedaController } from '../controllers/ayurveda.controller.js';
import { KnowledgeGraphController } from '../controllers/knowledge-graph.controller.js';
import { DocumentController } from '../controllers/document.controller.js';
import { RAGController } from '../controllers/rag.controller.js';
import { QuizController } from '../controllers/quiz.controller.js';
import { GamificationController } from '../controllers/gamification.controller.js';
import { LanguageController } from '../controllers/language.controller.js';
import { createHealthRouter } from './health.routes.js';
import { createAuthRouter } from './auth.routes.js';
import { createAdminRouter } from './admin.routes.js';
import { createWisdomRouter } from './wisdom.routes.js';
import { createAyurvedaRouter } from './ayurveda.routes.js';
import { createKnowledgeGraphRouter } from './knowledge-graph.routes.js';
import { createDocumentRouter } from './document.routes.js';
import { createRAGRouter } from './rag.routes.js';
import { createQuizRouter } from './quiz.routes.js';
import { createGamificationRouter } from './gamification.routes.js';
import { createLanguageRouter } from './language.routes.js';

export interface AppRoutersOptions {
  healthController: HealthController;
  authController?: AuthController;
  adminController?: AdminController;
  wisdomController?: WisdomController;
  ayurvedaController?: AyurvedaController;
  knowledgeGraphController?: KnowledgeGraphController;
  documentController?: DocumentController;
  ragController?: RAGController;
  quizController?: QuizController;
  gamificationController?: GamificationController;
  languageController?: LanguageController;
  jwtSecret?: string;
  authLimiter?: RequestHandler;
}

export function createApiRouter(options: AppRoutersOptions): Router {
  const router = Router();
  const {
    healthController,
    authController,
    adminController,
    wisdomController,
    ayurvedaController,
    knowledgeGraphController,
    documentController,
    ragController,
    quizController,
    gamificationController,
    languageController,
    jwtSecret = 'default_secret',
  } = options;

  // Root health endpoints
  router.get('/health', healthController.getLive);
  router.get('/ready', healthController.getReady);
  router.use('/health', createHealthRouter(healthController));

  // Version 1 API routes
  const v1 = Router();
  v1.get('/health', healthController.getLive);
  v1.get('/ready', healthController.getReady);
  v1.use('/health', createHealthRouter(healthController));

  // Mount Auth routes if controller provided
  if (authController) {
    v1.use(
      '/auth',
      createAuthRouter({ authController, jwtSecret, authLimiter: options.authLimiter })
    );
  }

  // Mount Wisdom routes if controller provided
  if (wisdomController) {
    v1.use('/wisdom', createWisdomRouter({ wisdomController, jwtSecret }));
  }

  // Mount Ayurveda routes if controller provided
  if (ayurvedaController) {
    v1.use('/ayurveda', createAyurvedaRouter({ ayurvedaController, jwtSecret }));
  }

  // Mount Knowledge Graph routes if controller provided
  if (knowledgeGraphController) {
    v1.use('/graph', createKnowledgeGraphRouter({ knowledgeGraphController }));
  }

  // Mount Document Ingestion routes if controller provided
  if (documentController) {
    v1.use('/documents', createDocumentRouter({ documentController }));
  }

  // Mount RAG Citation Retrieval routes if controller provided
  if (ragController) {
    v1.use('/rag', createRAGRouter({ ragController }));
  }

  // Mount Quiz routes if controller provided
  if (quizController) {
    v1.use('/quizzes', createQuizRouter({ quizController, jwtSecret }));
  }

  // Mount Gamification routes if controller provided
  if (gamificationController) {
    v1.use(
      '/gamification',
      createGamificationRouter({ controller: gamificationController, jwtSecret })
    );
  }

  // Mount Language and Translation routes if controller provided
  if (languageController) {
    v1.use('/languages', createLanguageRouter({ controller: languageController }));
  }

  // Mount Admin routes if controller provided
  if (adminController) {
    v1.use('/admin', createAdminRouter({ adminController, jwtSecret }));
  }

  router.use('/api/v1', v1);
  router.use('/', v1);

  return router;
}
