import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { isTest } from '../config/env';
import { ErrorCode } from '../utils/AppError';
import type { ApiErrorEnvelope } from '../utils/apiResponse';

function rejectWith429(_req: Request, res: Response): void {
  const body: ApiErrorEnvelope = {
    success: false,
    error: { code: ErrorCode.RATE_LIMITED, message: 'Too many requests, please try again later' },
  };
  res.status(429).json(body);
}

const shared = {
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
  handler: rejectWith429,
  // Disabled during tests so concurrency/load assertions are not throttled.
  skip: () => isTest,
};

/** Tight limiter for credential endpoints to blunt brute-force / signup abuse. */
export const authLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 30,
});

/** Generous global limiter for the rest of the API. */
export const globalLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 1000,
  limit: 300,
});

/** Targeted limiter for the write-heavy join endpoint. */
export const joinLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 1000,
  limit: 60,
});
