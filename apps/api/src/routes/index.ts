import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';
import { AuthController } from '../controllers/auth.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { WisdomController } from '../controllers/wisdom.controller.js';
import { createHealthRouter } from './health.routes.js';
import { createAuthRouter } from './auth.routes.js';
import { createAdminRouter } from './admin.routes.js';
import { createWisdomRouter } from './wisdom.routes.js';

export interface AppRoutersOptions {
  healthController: HealthController;
  authController?: AuthController;
  adminController?: AdminController;
  wisdomController?: WisdomController;
  jwtSecret?: string;
}

export function createApiRouter(options: AppRoutersOptions): Router {
  const router = Router();
  const {
    healthController,
    authController,
    adminController,
    wisdomController,
    jwtSecret = 'default_secret',
  } = options;

  // Root health endpoints as requested by specifications:
  // GET /health confirms process is running
  // GET /ready verifies dependencies (MongoDB, Redis)
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
    v1.use('/auth', createAuthRouter({ authController, jwtSecret }));
  }

  // Mount Wisdom routes if controller provided
  if (wisdomController) {
    v1.use('/wisdom', createWisdomRouter({ wisdomController, jwtSecret }));
  }

  // Mount Admin routes if controller provided
  if (adminController) {
    v1.use('/admin', createAdminRouter({ adminController, jwtSecret }));
  }

  router.use('/api/v1', v1);

  return router;
}
