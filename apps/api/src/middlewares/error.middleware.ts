import { Request, Response, NextFunction } from 'express';
import { AppError } from '@ai-gurukul/types';
import { ZodError } from 'zod';
import { Logger } from '@ai-gurukul/logging';

export function createErrorMiddleware(logger: Logger) {
  return (err: Error, req: Request, res: Response, _next: NextFunction): void => {
    const reqId = (req as Request & { id?: string }).id || 'unknown';

    // 1. Domain AppError
    if (err instanceof AppError) {
      if (err.statusCode >= 500) {
        logger.error({ err, reqId }, `AppError: ${err.message}`);
      } else {
        logger.warn({ err, reqId }, `ClientError: ${err.message}`);
      }

      res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
          requestId: reqId,
        },
      });
      return;
    }

    // 2. Zod Validation Error
    if (err instanceof ZodError || (err as any)?.name === 'ZodError') {
      const zodErr = err as ZodError;
      logger.warn({ issues: zodErr.issues, reqId }, 'Validation failed');
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The submitted request data failed schema validation',
          details: typeof zodErr.flatten === 'function' ? zodErr.flatten() : zodErr,
          requestId: reqId,
        },
      });
      return;
    }

    // 3. Unhandled Internal Server Error
    logger.error({ err, reqId }, 'Unhandled Internal Server Error');
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected internal server error occurred'
            : err.message,
        requestId: reqId,
      },
    });
  };
}
