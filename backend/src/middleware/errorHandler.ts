import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError, ErrorCode } from '../utils/AppError';
import type { ApiErrorEnvelope } from '../utils/apiResponse';
import { isProduction } from '../config/env';
import { logger } from '../utils/logger';

interface MongoDuplicateKeyError {
  code: number;
  keyValue?: Record<string, unknown>;
}

function isDuplicateKeyError(err: unknown): err is MongoDuplicateKeyError {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiErrorEnvelope = {
    success: false,
    error: { code: ErrorCode.NOT_FOUND, message: `Route ${req.method} ${req.originalUrl} not found` },
  };
  res.status(404).json(body);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let code: string = ErrorCode.INTERNAL_ERROR;
  let message = 'Something went wrong';
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = ErrorCode.VALIDATION_ERROR;
    message = 'Validation failed';
    details = err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    code = ErrorCode.VALIDATION_ERROR;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    code = ErrorCode.INVALID_ID;
    message = `Invalid value for "${err.path}"`;
  } else if (isDuplicateKeyError(err)) {
    statusCode = 409;
    code = ErrorCode.VALIDATION_ERROR;
    message = 'Resource already exists';
    details = err.keyValue;
  } else if (err instanceof Error) {
    message = isProduction ? 'Something went wrong' : err.message;
  }

  if (statusCode >= 500) {
    logger.error('Unhandled error', err);
  }

  const body: ApiErrorEnvelope = {
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  };
  res.status(statusCode).json(body);
}
