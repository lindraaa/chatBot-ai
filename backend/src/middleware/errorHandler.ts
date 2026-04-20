import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
  details?: string;
}

const errorHandler = (
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status: number = error.status || 500;
  const message: string = error.message || 'Internal Server Error';
  const details: string | undefined = error.details;

  console.error(`[ERROR] ${status}: ${message}`, details);

  res.status(status).json({
    error: {
      message,
      ...(details && { details }),
      status,
    },
  });
};

export default errorHandler;
