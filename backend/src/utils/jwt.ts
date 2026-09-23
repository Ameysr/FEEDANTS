import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError, ErrorCode } from './AppError';

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded.sub) {
      throw new Error('malformed payload');
    }
    return { sub: String(decoded.sub), email: String((decoded as jwt.JwtPayload).email ?? '') };
  } catch {
    throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'Invalid or expired access token');
  }
}
