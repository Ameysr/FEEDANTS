import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { joinLimiter } from '../../middleware/rateLimit';
import * as competitionController from './competition.controller';
import {
  competitionIdSchema,
  competitionParticipantsSchema,
  listCompetitionsSchema,
} from './competition.schema';

const router = Router();

// Public discovery - optional auth so the viewer's registration state is included.
router.get('/', optionalAuthenticate, validate(listCompetitionsSchema), asyncHandler(competitionController.list));

router.get(
  '/:id/participants',
  validate(competitionParticipantsSchema),
  asyncHandler(competitionController.participants),
);

router.get('/:id', optionalAuthenticate, validate(competitionIdSchema), asyncHandler(competitionController.detail));

// Authenticated action.
router.post(
  '/:id/join',
  authenticate,
  joinLimiter,
  validate(competitionIdSchema),
  asyncHandler(competitionController.join),
);

export const competitionRoutes = router;
