import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';

export function createHealthRouter(controller: HealthController): Router {
  const router = Router();

  router.get('/', controller.getLive);
  router.get('/live', controller.getLive);
  router.get('/ready', controller.getReady);

  return router;
}
