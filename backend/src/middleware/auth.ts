import type { NextFunction, Request, Response } from 'express';
import { User } from '../models/User';
import { AppError, ErrorCode } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

async function resolveUser(req: Request): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) return;
  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub);
  if (!user) throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'Account no longer exists');
  req.user = user;
}

/** Requires a valid bearer token; rejects otherwise. */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!extractBearerToken(req)) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'Authentication required');
    }
    await resolveUser(req);
    if (!req.user) throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'Authentication required');
    next();
  } catch (err) {
    next(err);
  }
}

/** Attaches `req.user` when a token is present, but never rejects. Powers viewer-aware detail responses. */
export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    await resolveUser(req);
    next();
  } catch {
    // An invalid/expired token on a public route is treated as anonymous.
    req.user = undefined;
    next();
  }
}
