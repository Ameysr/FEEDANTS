import type { UserDocument } from '../models/User';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Populated by the auth middleware when a valid bearer token is present. */
      user?: UserDocument;
    }
  }
}

export {};
