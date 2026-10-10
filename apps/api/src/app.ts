import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Logger, createHttpLogger } from '@ai-gurukul/logging';
import { ApiConfig } from '@ai-gurukul/config';
import { NotFoundError } from '@ai-gurukul/types';
import { requestIdMiddleware } from './middlewares/request-id.middleware.js';
import { createErrorMiddleware } from './middlewares/error.middleware.js';
import { createApiRouter } from './routes/index.js';
import { HealthController } from './controllers/health.controller.js';
import { HealthService } from './services/health.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { AdminController } from './controllers/admin.controller.js';
import { WisdomController } from './controllers/wisdom.controller.js';
import { WisdomService } from './services/wisdom.service.js';
import { AyurvedaController } from './controllers/ayurveda.controller.js';
import { AyurvedaService } from './services/ayurveda.service.js';
import { KnowledgeGraphController } from './controllers/knowledge-graph.controller.js';
import { KnowledgeGraphService } from './services/knowledge-graph.service.js';
import { DocumentController } from './controllers/document.controller.js';
import { DocumentService } from './services/document.service.js';
import { RAGController } from './controllers/rag.controller.js';
import { RAGService } from './services/rag.service.js';
import { QuizController } from './controllers/quiz.controller.js';
import { QuizService } from './services/quiz.service.js';
import {
  UserRepository,
  SessionRepository,
  ConversationRepository,
  MessageRepository,
  WisdomVerseRepository,
  AyurvedaProfileRepository,
  KnowledgeGraphRepository,
  DocumentRepository,
  DocumentChunkRepository,
  QuizRepository,
  QuizAttemptRepository,
} from './repositories/index.js';
import { GoogleAuthService } from './services/google-auth.service.js';
import { DatabaseService } from '@ai-gurukul/database';
import { AIProvider, AIProviderFactory } from '@ai-gurukul/ai';
import { StorageProviderFactory } from '@ai-gurukul/storage';
import { EmbeddingProviderFactory } from '@ai-gurukul/embeddings';
import { VectorStoreFactory } from '@ai-gurukul/vector-store';
import Redis from 'ioredis';

export interface CreateAppOptions {
  config: ApiConfig;
  logger: Logger;
  dbService?: DatabaseService;
  redisClient?: Redis;
  userRepo?: UserRepository;
  sessionRepo?: SessionRepository;
  conversationRepo?: ConversationRepository;
  messageRepo?: MessageRepository;
  verseRepo?: WisdomVerseRepository;
  ayurvedaRepo?: AyurvedaProfileRepository;
  graphRepo?: KnowledgeGraphRepository;
  docRepo?: DocumentRepository;
  chunkRepo?: DocumentChunkRepository;
  quizRepo?: QuizRepository;
  quizAttemptRepo?: QuizAttemptRepository;
  authService?: AuthService;
  wisdomService?: WisdomService;
  ayurvedaService?: AyurvedaService;
  graphService?: KnowledgeGraphService;
  documentService?: DocumentService;
  ragService?: RAGService;
  quizService?: QuizService;
  aiProvider?: AIProvider;
}

export function createApp(options: CreateAppOptions): Express {
  const { config, logger, dbService, redisClient } = options;
  const app = express();

  // 1. Basic security headers
  app.use(helmet());

  // 2. Strict CORS
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    })
  );

  // 3. Request body & cookie parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(config.COOKIE_SECRET));

  // 4. Observability: Request ID & Structured HTTP logging
  app.use(requestIdMiddleware);
  app.use(createHttpLogger(logger));

  // 5. Wire repositories and domain services
  const userRepo = options.userRepo || new UserRepository();
  const sessionRepo = options.sessionRepo || new SessionRepository();
  const conversationRepo = options.conversationRepo || new ConversationRepository();
  const messageRepo = options.messageRepo || new MessageRepository();
  const verseRepo = options.verseRepo || new WisdomVerseRepository();
  const ayurvedaRepo = options.ayurvedaRepo || new AyurvedaProfileRepository();
  const graphRepo = options.graphRepo || new KnowledgeGraphRepository();
  const docRepo = options.docRepo || new DocumentRepository();
  const chunkRepo = options.chunkRepo || new DocumentChunkRepository();
  const quizRepo = options.quizRepo || new QuizRepository();
  const quizAttemptRepo = options.quizAttemptRepo || new QuizAttemptRepository();

  const googleAuthService = new GoogleAuthService(config, logger);
  const authService =
    options.authService ||
    new AuthService(userRepo, sessionRepo, googleAuthService, config, logger);

  const aiProvider = options.aiProvider || AIProviderFactory.create(config.AI_PROVIDER);
  const wisdomService =
    options.wisdomService ||
    new WisdomService(conversationRepo, messageRepo, verseRepo, userRepo, aiProvider, logger);

  const ayurvedaService =
    options.ayurvedaService || new AyurvedaService(ayurvedaRepo);

  const graphService =
    options.graphService || new KnowledgeGraphService(graphRepo);

  const storageProvider = StorageProviderFactory.create(config.STORAGE_PROVIDER);
  const embeddingProvider = EmbeddingProviderFactory.create(config.EMBEDDING_PROVIDER);
  const vectorStore = VectorStoreFactory.create(config.VECTOR_STORE_PROVIDER);

  const documentService =
    options.documentService ||
    new DocumentService(docRepo, chunkRepo, storageProvider, embeddingProvider, vectorStore);

  const ragService =
    options.ragService ||
    new RAGService(docRepo, chunkRepo, embeddingProvider, vectorStore);

  const quizService =
    options.quizService || new QuizService(quizRepo, quizAttemptRepo, aiProvider);

  const healthService = new HealthService(dbService, redisClient);
  const healthController = new HealthController(healthService);
  const authController = new AuthController(authService, config);
  const adminController = new AdminController(userRepo);
  const wisdomController = new WisdomController(wisdomService);
  const ayurvedaController = new AyurvedaController(ayurvedaService);
  const knowledgeGraphController = new KnowledgeGraphController(graphService);
  const documentController = new DocumentController(documentService);
  const ragController = new RAGController(ragService);
  const quizController = new QuizController(quizService);

  // 6. Mount API routers
  const apiRouter = createApiRouter({
    healthController,
    authController,
    adminController,
    wisdomController,
    ayurvedaController,
    knowledgeGraphController,
    documentController,
    ragController,
    quizController,
    jwtSecret: config.JWT_ACCESS_SECRET,
  });
  app.use(apiRouter);

  // 7. Catch-all 404 handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
  });

  // 8. Centralized error handling
  app.use(createErrorMiddleware(logger));

  return app;
}
