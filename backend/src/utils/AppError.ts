/**
 * Operational error with an HTTP status and a stable machine-readable `code`.
 * The client maps `code` -> UI copy, so codes are part of the API contract.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(code: string, message: string, details?: unknown): AppError {
    return new AppError(400, code, message, details);
  }

  static unauthorized(code: string, message: string): AppError {
    return new AppError(401, code, message);
  }

  static forbidden(code: string, message: string): AppError {
    return new AppError(403, code, message);
  }

  static notFound(code: string, message: string): AppError {
    return new AppError(404, code, message);
  }

  /** Business-rule conflict: capacity, lifecycle window, duplicate registration, etc. */
  static conflict(code: string, message: string, details?: unknown): AppError {
    return new AppError(409, code, message, details);
  }

  static tooManyRequests(code: string, message: string): AppError {
    return new AppError(429, code, message);
  }
}

/** Stable error codes surfaced to the client. */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_ID: 'INVALID_ID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  REGISTRATION_NOT_OPEN: 'REGISTRATION_NOT_OPEN',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  COMPETITION_FULL: 'COMPETITION_FULL',
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  COMPETITION_ENDED: 'COMPETITION_ENDED',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];
