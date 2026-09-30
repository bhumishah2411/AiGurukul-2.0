import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  const requestId =
    typeof existingId === 'string' && existingId.trim() !== '' ? existingId : crypto.randomUUID();

  // Attach to request object and response header
  (req as Request & { id: string }).id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
