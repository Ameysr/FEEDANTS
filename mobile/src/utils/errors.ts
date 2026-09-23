import type { ApiError } from '../api/client';

interface ValidationDetail {
  path: string;
  message: string;
}

/** Turn a server error code into copy a user can act on. */
export function describeApiError(error: unknown): string {
  const apiError = error as ApiError | undefined;

  if (apiError && typeof apiError === 'object' && 'code' in apiError) {
    switch (apiError.code) {
      case 'COMPETITION_FULL':
        return 'Sorry, every spot has just been taken.';
      case 'ALREADY_REGISTERED':
        return "You're already registered for this competition.";
      case 'REGISTRATION_NOT_OPEN':
        return 'Registration has not opened yet.';
      case 'REGISTRATION_CLOSED':
        return 'Registration is closed for this competition.';
      case 'COMPETITION_ENDED':
        return 'This competition has ended.';
      case 'AUTH_REQUIRED':
      case 'UNAUTHORIZED':
        return 'Please sign in to continue.';
      case 'EMAIL_TAKEN':
        return 'An account with this email already exists.';
      case 'INVALID_CREDENTIALS':
        return 'Incorrect email or password.';
      case 'NETWORK_ERROR':
        return apiError.message;
      case 'VALIDATION_ERROR': {
        const details = apiError.details as ValidationDetail[] | undefined;
        return details?.[0]?.message ?? 'Please check the details you entered.';
      }
      default:
        return apiError.message || 'Something went wrong.';
    }
  }

  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
}
