import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    logger.error('Unexpected server error: %o', err);
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid Database ID resource format.';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = (err as any).errors;
  }

  if ((err as any).code === 11000) {
    statusCode = 409;
    const key = Object.keys((err as any).keyValue)[0];
    message = `Duplicate field value entered: ${key}. Please use another value.`;
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
