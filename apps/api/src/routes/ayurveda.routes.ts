import { Router } from 'express';
import { AyurvedaController } from '../controllers/ayurveda.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import {
  SubmitPrakritiAnswersSchema,
  LogSymptomsSchema,
  AyurvedaCategoryQuerySchema,
} from '@ai-gurukul/validation';

export interface AyurvedaRoutesOptions {
  ayurvedaController: AyurvedaController;
  jwtSecret: string;
}

export function createAyurvedaRouter(options: AyurvedaRoutesOptions): Router {
  const router = Router();
  const { ayurvedaController, jwtSecret } = options;
  const authGuard = requireAuth(jwtSecret);

  // 1. Classical Questionnaire & Symptom Catalog (Public discovery)
  router.get('/questionnaire', ayurvedaController.getQuestionnaire);

  // 2. Prakriti Assessment Submission (Protected)
  router.post(
    '/prakriti',
    authGuard,
    validateBody(SubmitPrakritiAnswersSchema),
    ayurvedaController.submitPrakriti
  );

  // 3. Current Ayurveda Profile (Protected)
  router.get('/profile', authGuard, ayurvedaController.getProfile);

  // 4. Log Acute Symptoms & Vikriti Imbalances (Protected)
  router.post(
    '/symptoms',
    authGuard,
    validateBody(LogSymptomsSchema),
    ayurvedaController.logSymptoms
  );

  // 5. Prescriptions & Recommendations (Protected)
  router.get(
    '/recommendations',
    authGuard,
    validateQuery(AyurvedaCategoryQuerySchema),
    ayurvedaController.getRecommendations
  );

  return router;
}
