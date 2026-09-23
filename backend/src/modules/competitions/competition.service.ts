import mongoose, { Types, type FilterQuery } from 'mongoose';
import { Competition, type ICompetition } from '../../models/Competition';
import { Participation } from '../../models/Participation';
import type { UserDocument } from '../../models/User';
import { AppError, ErrorCode } from '../../utils/AppError';
import { computeAvailability, computeState, type CompetitionState } from '../../utils/competitionState';
import { supportsTransactions } from '../../config/db';
import {
  toDetailDTO,
  toSummaryDTO,
  type CompetitionDetailDTO,
  type CompetitionSummaryDTO,
  type Paginated,
  type ParticipantDTO,
} from './competition.dto';

export interface ListCompetitionsQuery {
  page: number;
  limit: number;
  category?: string;
  state?: CompetitionState;
  search?: string;
}

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface JoinResultDTO {
  participation: { id: string; competitionId: string; registeredAt: string };
  state: CompetitionState;
  participantCount: number;
  maxParticipants: number;
  spotsLeft: number;
}

function availabilityInput(competition: ICompetition, isRegistered: boolean) {
  return {
    registrationOpensAt: competition.registrationOpensAt,
    registrationClosesAt: competition.registrationClosesAt,
    startAt: competition.startAt,
    endAt: competition.endAt,
    maxParticipants: competition.maxParticipants,
    participantCount: competition.participantCount,
    isRegistered,
  };
}

function paginate(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Derive a Mongo query from a lifecycle state (state itself is never stored). */
function buildStateFilter(state: CompetitionState, now: Date): FilterQuery<ICompetition> {
  const filters: Record<CompetitionState, Record<string, unknown>> = {
    UPCOMING: { registrationOpensAt: { $gt: now } },
    REGISTRATION_OPEN: {
      registrationOpensAt: { $lte: now },
      registrationClosesAt: { $gte: now },
      $expr: { $lt: ['$participantCount', '$maxParticipants'] },
    },
    FULL: {
      registrationOpensAt: { $lte: now },
      registrationClosesAt: { $gte: now },
      $expr: { $gte: ['$participantCount', '$maxParticipants'] },
    },
    REGISTRATION_CLOSED: { registrationClosesAt: { $lt: now }, startAt: { $gt: now } },
    LIVE: { startAt: { $lte: now }, endAt: { $gte: now } },
    ENDED: { endAt: { $lt: now } },
  };
  return filters[state] as unknown as FilterQuery<ICompetition>;
}

async function findRegistration(
  competitionId: string,
  userId?: Types.ObjectId,
): Promise<{ isRegistered: boolean; registeredAt: Date | null }> {
  if (!userId) return { isRegistered: false, registeredAt: null };
  const participation = await Participation.findOne({ userId, competitionId, status: 'registered' })
    .select('registeredAt')
    .lean();
  return { isRegistered: Boolean(participation), registeredAt: participation?.registeredAt ?? null };
}

async function findRegistrations(
  userId: Types.ObjectId,
  competitionIds: unknown[],
): Promise<Map<string, Date>> {
  if (competitionIds.length === 0) return new Map();
  const rows = await Participation.find({
    userId,
    competitionId: { $in: competitionIds },
    status: 'registered',
  })
    .select('competitionId registeredAt')
    .lean();
  return new Map(rows.map((row) => [String(row.competitionId), row.registeredAt as Date]));
}

export async function listCompetitions(
  query: ListCompetitionsQuery,
  viewerId?: Types.ObjectId,
): Promise<Paginated<CompetitionSummaryDTO>> {
  const now = new Date();
  const serverTime = now.toISOString();

  const filter: FilterQuery<ICompetition> = {};
  if (query.category) filter.category = query.category;
  if (query.search) filter.$text = { $search: query.search };
  if (query.state) Object.assign(filter, buildStateFilter(query.state, now));

  const skip = (query.page - 1) * query.limit;
  const [docs, total] = await Promise.all([
    Competition.find(filter).sort({ startAt: -1 }).skip(skip).limit(query.limit),
    Competition.countDocuments(filter),
  ]);

  const registrations = viewerId
    ? await findRegistrations(viewerId, docs.map((doc) => doc._id))
    : new Map<string, Date>();

  const items = docs.map((doc) => {
    const isRegistered = registrations.has(String(doc._id));
    const availability = computeAvailability(availabilityInput(doc, isRegistered), now);
    return toSummaryDTO(doc, availability, serverTime, isRegistered, Boolean(viewerId));
  });

  return { items, ...paginate(query.page, query.limit, total) };
}

export async function getCompetitionDetail(
  competitionId: string,
  viewerId?: Types.ObjectId,
): Promise<CompetitionDetailDTO> {
  const now = new Date();
  const competition = await Competition.findById(competitionId);
  if (!competition) {
    throw AppError.notFound(ErrorCode.NOT_FOUND, 'Competition not found');
  }

  const { isRegistered, registeredAt } = await findRegistration(competitionId, viewerId);
  const availability = computeAvailability(availabilityInput(competition, isRegistered), now);

  return toDetailDTO(competition, availability, now.toISOString(), isRegistered, registeredAt, Boolean(viewerId));
}

export async function getParticipants(
  competitionId: string,
  query: PaginationQuery,
): Promise<Paginated<ParticipantDTO>> {
  const exists = await Competition.exists({ _id: competitionId });
  if (!exists) {
    throw AppError.notFound(ErrorCode.NOT_FOUND, 'Competition not found');
  }

  const skip = (query.page - 1) * query.limit;
  const [rows, total] = await Promise.all([
    Participation.find({ competitionId, status: 'registered' })
      .sort({ registeredAt: 1 })
      .skip(skip)
      .limit(query.limit)
      .populate<{ userId: { _id: Types.ObjectId; name: string; avatarUrl?: string | null } }>(
        'userId',
        'name avatarUrl',
      )
      .lean(),
    Participation.countDocuments({ competitionId, status: 'registered' }),
  ]);

  const items: ParticipantDTO[] = rows.map((row) => ({
    id: String(row._id),
    registeredAt: (row.registeredAt as Date).toISOString(),
    user: {
      id: String(row.userId?._id ?? ''),
      name: row.userId?.name ?? 'Participant',
      avatarUrl: row.userId?.avatarUrl ?? null,
    },
  }));

  return { items, ...paginate(query.page, query.limit, total) };
}

// ---------------------------------------------------------------------------
// Join flow
// ---------------------------------------------------------------------------

function assertJoinable(state: CompetitionState): void {
  switch (state) {
    case 'REGISTRATION_OPEN':
      return;
    case 'UPCOMING':
      throw AppError.conflict(ErrorCode.REGISTRATION_NOT_OPEN, 'Registration has not opened yet');
    case 'FULL':
      throw AppError.conflict(ErrorCode.COMPETITION_FULL, 'This competition is full');
    case 'REGISTRATION_CLOSED':
    case 'LIVE':
      throw AppError.conflict(ErrorCode.REGISTRATION_CLOSED, 'Registration is closed for this competition');
    case 'ENDED':
      throw AppError.conflict(ErrorCode.COMPETITION_ENDED, 'This competition has ended');
  }
}

/** Explain WHY the guarded reserve failed, by re-reading the live document. */
async function explainReserveFailure(
  competitionId: string,
  now: Date,
  session: mongoose.ClientSession | null,
): Promise<AppError> {
  const competition = await Competition.findById(competitionId).session(session);
  if (!competition) return AppError.notFound(ErrorCode.NOT_FOUND, 'Competition not found');
  const state = computeState(competition, now);
  try {
    assertJoinable(state);
    return AppError.conflict(ErrorCode.COMPETITION_FULL, 'No spots available right now');
  } catch (err) {
    return err instanceof AppError ? err : AppError.conflict(ErrorCode.COMPETITION_FULL, 'Unable to join');
  }
}

/**
 * Atomically claim one spot. The capacity check and the increment happen in a
 * single document update, so concurrent requests can never oversell.
 * Returns the updated document, or null when no spot could be claimed.
 */
function reserveSpot(competitionId: string, now: Date, session: mongoose.ClientSession | null) {
  const filter = {
    _id: new Types.ObjectId(competitionId),
    registrationOpensAt: { $lte: now },
    registrationClosesAt: { $gte: now },
    $expr: { $lt: ['$participantCount', '$maxParticipants'] },
  } as unknown as FilterQuery<ICompetition>;

  return Competition.findOneAndUpdate(
    filter,
    { $inc: { participantCount: 1 } },
    { new: true, session: session ?? undefined },
  );
}

function isDuplicateKey(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

async function buildJoinResult(
  competitionId: string,
  participationId: string,
  registeredAt: Date,
  now: Date,
): Promise<JoinResultDTO> {
  const competition = await Competition.findById(competitionId);
  if (!competition) {
    throw AppError.notFound(ErrorCode.NOT_FOUND, 'Competition not found');
  }
  const availability = computeAvailability(availabilityInput(competition, true), now);
  return {
    participation: {
      id: participationId,
      competitionId,
      registeredAt: registeredAt.toISOString(),
    },
    state: availability.state,
    participantCount: competition.participantCount,
    maxParticipants: competition.maxParticipants,
    spotsLeft: availability.spotsLeft,
  };
}

/**
 * Register the current user for a competition.
 *
 * Correct under concurrency by construction:
 *  1. `reserveSpot` claims a spot with a single atomic, capacity-guarded update.
 *  2. The unique `{ userId, competitionId }` index rejects a duplicate registration.
 *  3. On a replica set the two writes run in one transaction; on standalone Mongo
 *     the reservation is rolled back if the insert fails (compensating write).
 */
export async function joinCompetition(
  competitionId: string,
  user: UserDocument,
): Promise<JoinResultDTO> {
  const now = new Date();

  // Friendly early checks (not the concurrency guarantee - the atomic writes below are).
  const existing = await Participation.findOne({ userId: user._id, competitionId, status: 'registered' });
  if (existing) {
    throw AppError.conflict(ErrorCode.ALREADY_REGISTERED, 'You are already registered for this competition', {
      registeredAt: existing.registeredAt.toISOString(),
    });
  }

  const competition = await Competition.findById(competitionId);
  if (!competition) {
    throw AppError.notFound(ErrorCode.NOT_FOUND, 'Competition not found');
  }
  assertJoinable(computeState(competition, now));

  if (supportsTransactions()) {
    const session = await mongoose.startSession();
    try {
      let participationId = '';
      let registeredAt = now;

      await session.withTransaction(async () => {
        const reserved = await reserveSpot(competitionId, now, session);
        if (!reserved) throw await explainReserveFailure(competitionId, now, session);

        const created = await Participation.create(
          [{ userId: user._id, competitionId, status: 'registered', registeredAt: now }],
          { session },
        );
        participationId = String(created[0]._id);
        registeredAt = created[0].registeredAt;
      });

      return await buildJoinResult(competitionId, participationId, registeredAt, now);
    } finally {
      await session.endSession();
    }
  }

  // Standalone Mongo path.
  const reserved = await reserveSpot(competitionId, now, null);
  if (!reserved) throw await explainReserveFailure(competitionId, now, null);

  let participationId: string;
  let registeredAt: Date;
  try {
    const created = await Participation.create([
      { userId: user._id, competitionId, status: 'registered', registeredAt: now },
    ]);
    participationId = String(created[0]._id);
    registeredAt = created[0].registeredAt;
  } catch (err) {
    // Give the reserved spot back so the counter never drifts upward.
    await Competition.updateOne({ _id: competitionId }, { $inc: { participantCount: -1 } });
    if (isDuplicateKey(err)) {
      throw AppError.conflict(ErrorCode.ALREADY_REGISTERED, 'You are already registered for this competition');
    }
    throw err;
  }

  return buildJoinResult(competitionId, participationId, registeredAt, now);
}
