import { z } from 'zod';
import type { ValidationSchemas } from '../../middleware/validate';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid competition id');

const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const competitionStates = [
  'UPCOMING',
  'REGISTRATION_OPEN',
  'FULL',
  'REGISTRATION_CLOSED',
  'LIVE',
  'ENDED',
] as const;

export const listCompetitionsSchema: ValidationSchemas = {
  query: pagination.extend({
    category: z.string().trim().min(1).max(60).optional(),
    state: z.enum(competitionStates).optional(),
    search: z.string().trim().min(1).max(100).optional(),
  }),
};

export const competitionIdSchema: ValidationSchemas = {
  params: z.object({ id: objectId }),
};

export const competitionParticipantsSchema: ValidationSchemas = {
  params: z.object({ id: objectId }),
  query: pagination,
};
