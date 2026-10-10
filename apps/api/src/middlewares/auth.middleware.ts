import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, JwtUserPayload, UnauthorizedError, UserRole } from '@ai-gurukul/types';
import { verifyAccessToken } from '../utils/crypto.util.js';

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

/**
 * Middleware that requires a valid JWT access token in the Authorization header or HttpOnly cookie.
 */
export function requireAuth(jwtSecret: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    let token: string | undefined;

    // 1. Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 2. Fall back to HttpOnly cookie: access_token
    if (!token && req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return next(new UnauthorizedError('Authentication token is required'));
    }

    try {
      const payload = verifyAccessToken(token, jwtSecret);
      req.user = payload;
      return next();
    } catch {
      return next(new UnauthorizedError('Invalid or expired access token'));
    }
  };
}

/**
 * Middleware that enforces Role-Based Access Control (RBAC).
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`Insufficient permissions. Required role: ${allowedRoles.join(' or ')}`)
      );
    }

    return next();
  };
}

/**
 * Middleware that extracts user credentials if provided, but does not block unauthenticated requests.
 */
export function optionalAuth(jwtSecret: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    if (!token && req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (token) {
      try {
        const payload = verifyAccessToken(token, jwtSecret);
        req.user = payload;
      } catch {
        // Token invalid, ignore for optional auth
      }
    }

    return next();
  };
}
