import type { Request, Response } from 'express';
import { sendOk } from '../../utils/apiResponse';
import { AppError, ErrorCode } from '../../utils/AppError';
import * as competitionService from './competition.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await competitionService.listCompetitions(
    req.query as unknown as competitionService.ListCompetitionsQuery,
    req.user?._id,
  );
  sendOk(res, result);
}

export async function detail(req: Request, res: Response): Promise<void> {
  const result = await competitionService.getCompetitionDetail(req.params.id, req.user?._id);
  sendOk(res, result);
}

export async function participants(req: Request, res: Response): Promise<void> {
  const result = await competitionService.getParticipants(
    req.params.id,
    req.query as unknown as competitionService.PaginationQuery,
  );
  sendOk(res, result);
}

export async function join(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'Authentication required');
  }
  const result = await competitionService.joinCompetition(req.params.id, req.user);
  sendOk(res, result, 201);
}
