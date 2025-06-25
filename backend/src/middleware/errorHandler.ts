import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Error:', error);

  if (res.headersSent) {
    return next(error);
  }

  const isDevelopment = !config.IS_PRODUCTION;

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong',
    stack: isDevelopment ? error.stack : undefined
  });
};
