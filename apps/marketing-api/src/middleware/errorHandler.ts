import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/logger';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof err?.status === 'number' ? err.status : 500;

  if (status >= 500) {
    logger.error({ err }, 'Unhandled error');
  }

  res.status(status).json({
    error: {
      message: err?.message ?? 'Internal Server Error',
    },
  });
}
