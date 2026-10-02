import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  GoogleAuthRequestSchema,
  RefreshTokenRequestSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
} from '@ai-gurukul/validation';

export interface AuthRoutesOptions {
  authController: AuthController;
  jwtSecret: string;
}

export function createAuthRouter(options: AuthRoutesOptions): Router {
  const router = Router();
  const { authController, jwtSecret } = options;

  // Public authentication endpoints
  router.post('/register', validateBody(RegisterRequestSchema), authController.register);
  router.post('/login', validateBody(LoginRequestSchema), authController.login);
  router.post('/google', validateBody(GoogleAuthRequestSchema), authController.googleLogin);
  router.post('/refresh', validateBody(RefreshTokenRequestSchema), authController.refresh);
  router.post('/logout', authController.logout);

  // Authenticated user endpoints
  router.get('/me', requireAuth(jwtSecret), authController.getMe);
  router.patch(
    '/profile',
    requireAuth(jwtSecret),
    validateBody(UpdateProfileSchema),
    authController.updateProfile
  );
  router.post(
    '/change-password',
    requireAuth(jwtSecret),
    validateBody(ChangePasswordSchema),
    authController.changePassword
  );

  return router;
}
