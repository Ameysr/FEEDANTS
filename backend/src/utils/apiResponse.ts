import type { Response } from 'express';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Send a success response in the standard envelope. */
export function sendOk<T>(res: Response, data: T, statusCode = 200): Response {
  const body: ApiEnvelope<T> = { success: true, data };
  return res.status(statusCode).json(body);
}
