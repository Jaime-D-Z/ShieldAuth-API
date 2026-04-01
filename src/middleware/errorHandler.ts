import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@/shared/errors/AppError';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        details: err.issues,
      },
    });
  }

  const status = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  const message = err instanceof Error ? err.message : 'Error interno del servidor';

  console.error(`[Error] ${req.method} ${req.path}: ${message}`);

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
};