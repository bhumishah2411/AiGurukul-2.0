import { Router } from 'express';
import { WisdomController } from '../controllers/wisdom.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import {
  CreateConversationSchema,
  SendMessageSchema,
  ConversationQuerySchema,
  WisdomVerseQuerySchema,
} from '@ai-gurukul/validation';

export interface WisdomRoutesOptions {
  wisdomController: WisdomController;
  jwtSecret: string;
}

export function createWisdomRouter(options: WisdomRoutesOptions): Router {
  const router = Router();
  const { wisdomController, jwtSecret } = options;

  // 1. Public discovery endpoints
  router.get('/personas', wisdomController.getPersonas);
  router.get('/verses', validateQuery(WisdomVerseQuerySchema), wisdomController.getVerses);

  // 2. Protected Seeker conversation endpoints
  router.post(
    '/conversations',
    requireAuth(jwtSecret),
    validateBody(CreateConversationSchema),
    wisdomController.startConversation
  );

  router.get(
    '/conversations',
    requireAuth(jwtSecret),
    validateQuery(ConversationQuerySchema),
    wisdomController.listConversations
  );

  router.get('/conversations/:id', requireAuth(jwtSecret), wisdomController.getConversation);

  router.delete('/conversations/:id', requireAuth(jwtSecret), wisdomController.archiveConversation);

  router.post(
    '/conversations/:id/messages',
    requireAuth(jwtSecret),
    validateBody(SendMessageSchema),
    wisdomController.sendMessageSync
  );

  // SSE streaming endpoints (Supports POST for body payload and GET for browser EventSource)
  router.post('/conversations/:id/stream', requireAuth(jwtSecret), wisdomController.streamMessage);

  router.get('/conversations/:id/stream', requireAuth(jwtSecret), wisdomController.streamMessage);

  return router;
}
