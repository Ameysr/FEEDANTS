import type { Request, Response } from 'express';
import { sendOk } from '../../utils/apiResponse';
import { AppError, ErrorCode } from '../../utils/AppError';
import * as authService from './auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body);
  sendOk(res, result, 201);
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  sendOk(res, result);
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'Authentication required');
  }
  sendOk(res, { user: authService.getPublicUser(req.user) });
}
