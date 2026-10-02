import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

export interface AdminRoutesOptions {
  adminController: AdminController;
  jwtSecret: string;
}

export function createAdminRouter(options: AdminRoutesOptions): Router {
  const router = Router();
  const { adminController, jwtSecret } = options;

  // Protect all admin endpoints with authentication and 'admin' role check
  router.use(requireAuth(jwtSecret));
  router.use(requireRole(['admin']));

  router.get('/users', adminController.listUsers);
  router.patch('/users/:userId/role', adminController.updateUserRole);

  return router;
}
