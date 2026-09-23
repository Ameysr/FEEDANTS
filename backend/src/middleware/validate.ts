import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError, ErrorCode } from '../utils/AppError';

export interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

/**
 * Parses and REPLACES request segments with validated output, so downstream
 * handlers only ever see coerced, trusted values.
 */
export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
      if (schemas.query) {
        // req.query is a getter-only property on newer Express typings.
        Object.defineProperty(req, 'query', {
          value: schemas.query.parse(req.query),
          writable: true,
          configurable: true,
        });
      }
      if (schemas.body) req.body = schemas.body.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof Error && err.name === 'ZodError') {
        next(err);
        return;
      }
      next(AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'Invalid request'));
    }
  };
}
