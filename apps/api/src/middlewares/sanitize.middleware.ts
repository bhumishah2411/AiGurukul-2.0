import { Request, Response, NextFunction } from 'express';

/**
 * Recursively strips keys starting with '$' or containing '.' from objects.
 * Protects against MongoDB Operator Injection attacks in body, query, and params.
 */
function cleanObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanObject).filter((item) => item !== undefined);
  }

  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    // Drop keys that start with '$' (Mongo operators) or contain '.' (path traversal / prototype)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    const val = cleanObject(obj[key]);
    if (val !== undefined) {
      cleaned[key] = val;
    }
  }

  // If object had keys originally and all were stripped operators, drop it
  if (Object.keys(obj).length > 0 && Object.keys(cleaned).length === 0) {
    return undefined;
  }

  return cleaned;
}

export function sanitizeMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = cleanObject(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = cleanObject(req.params);
  }

  next();
}
