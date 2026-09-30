import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';
import { createHealthRouter } from './health.routes.js';

export interface AppRoutersOptions {
  healthController: HealthController;
}

export function createApiRouter(options: AppRoutersOptions): Router {
  const router = Router();

  // Root health endpoints as requested by specifications:
  // GET /health confirms process is running
  // GET /ready verifies dependencies (MongoDB, Redis)
  router.get('/health', options.healthController.getLive);
  router.get('/ready', options.healthController.getReady);
  router.use('/health', createHealthRouter(options.healthController));

  // Version 1 API routes
  const v1 = Router();
  v1.get('/health', options.healthController.getLive);
  v1.get('/ready', options.healthController.getReady);
  v1.use('/health', createHealthRouter(options.healthController));

  router.use('/api/v1', v1);

  return router;
}
