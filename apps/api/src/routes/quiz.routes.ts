import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import {
  createQuizSchema,
  submitQuizAttemptSchema,
  generateDynamicQuizSchema,
  quizFilterSchema,
} from '@ai-gurukul/validation';

export interface QuizRoutesOptions {
  quizController: QuizController;
  jwtSecret: string;
}

export function createQuizRouter(options: QuizRoutesOptions): Router {
  const router = Router();
  const { quizController, jwtSecret } = options;
  const authGuard = requireAuth(jwtSecret);
  const optionalAuthGuard = optionalAuth(jwtSecret);

  // 1. List quizzes with filters & pagination
  router.get('/', validateQuery(quizFilterSchema), quizController.getQuizzes);

  // 2. Generate dynamic on-the-fly AI quiz
  router.post(
    '/generate',
    validateBody(generateDynamicQuizSchema),
    quizController.generateDynamicQuiz
  );

  // 3. User's quiz stats & history (Protected)
  router.get('/attempts/me', authGuard, quizController.getUserAttempts);
  router.get('/stats/me', authGuard, quizController.getUserStats);

  // 4. Specific attempt review
  router.get('/attempts/:id', quizController.getAttempt);

  // 5. Submit quiz attempt for scoring (Supports both logged-in and guest users)
  router.post(
    '/attempt',
    optionalAuthGuard,
    validateBody(submitQuizAttemptSchema),
    quizController.submitAttempt
  );

  // 6. Create curated quiz (Protected)
  router.post('/', authGuard, validateBody(createQuizSchema), quizController.createQuiz);

  // 7. Get single quiz client payload
  router.get('/:id', quizController.getQuiz);

  return router;
}
