import { Router, RequestHandler } from 'express';
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
  authLimiter?: RequestHandler;
}

export function createAuthRouter(options: AuthRoutesOptions): Router {
  const router = Router();
  const { authController, jwtSecret, authLimiter } = options;

  // Optional rate limiting middleware for sensitive auth operations
  const limit = authLimiter || ((_req, _res, next) => next());

  // Public authentication endpoints with brute-force protection
  router.post('/register', limit, validateBody(RegisterRequestSchema), authController.register);
  router.post('/login', limit, validateBody(LoginRequestSchema), authController.login);
  router.post('/google', limit, validateBody(GoogleAuthRequestSchema), authController.googleLogin);
  router.post('/refresh', limit, validateBody(RefreshTokenRequestSchema), authController.refresh);
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
