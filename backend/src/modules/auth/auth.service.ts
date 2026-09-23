import { AppError, ErrorCode } from '../../utils/AppError';
import { signAccessToken } from '../../utils/jwt';
import { User, hashPassword, type UserDocument } from '../../models/User';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
}

function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
  };
}

function isDuplicateKey(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

export async function register(input: { name: string; email: string; password: string }): Promise<AuthResult> {
  const existing = await User.exists({ email: input.email });
  if (existing) {
    throw AppError.conflict(ErrorCode.EMAIL_TAKEN, 'An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);

  let user: UserDocument;
  try {
    user = await User.create({ name: input.name, email: input.email, passwordHash });
  } catch (err) {
    // Loses the race against a concurrent signup with the same email.
    if (isDuplicateKey(err)) {
      throw AppError.conflict(ErrorCode.EMAIL_TAKEN, 'An account with this email already exists');
    }
    throw err;
  }

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken({ sub: String(user._id), email: user.email }),
  };
}

export async function login(input: { email: string; password: string }): Promise<AuthResult> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');

  // Same error for "no such user" and "wrong password" to avoid account enumeration.
  if (!user || !(await user.comparePassword(input.password))) {
    throw AppError.unauthorized(ErrorCode.INVALID_CREDENTIALS, 'Incorrect email or password');
  }

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken({ sub: String(user._id), email: user.email }),
  };
}

export function getPublicUser(user: UserDocument): PublicUser {
  return toPublicUser(user);
}
