/**
 * Competition lifecycle + availability.
 *
 * State is DERIVED from dates and the live participant counter - it is never
 * persisted, so it can never drift out of sync with reality. Both the API and
 * the client rely on this single source of truth, and the API always returns
 * `serverTime` so clients can render accurate countdowns regardless of device
 * clock skew.
 */

export type CompetitionState =
  | 'UPCOMING'
  | 'REGISTRATION_OPEN'
  | 'FULL'
  | 'REGISTRATION_CLOSED'
  | 'LIVE'
  | 'ENDED';

export type JoinBlockedReason =
  | 'NOT_OPEN'
  | 'CLOSED'
  | 'FULL'
  | 'ALREADY_JOINED'
  | 'ENDED'
  | 'AUTH_REQUIRED';

export type MilestoneType = 'REGISTRATION_OPENS' | 'REGISTRATION_CLOSES' | 'STARTS' | 'ENDS';

export interface AvailabilityInput {
  registrationOpensAt: Date;
  registrationClosesAt: Date;
  startAt: Date;
  endAt: Date;
  maxParticipants: number;
  participantCount: number;
  /** Whether the requesting viewer is already registered (defaults to false). */
  isRegistered?: boolean;
}

export interface Availability {
  state: CompetitionState;
  spotsLeft: number;
  canJoin: boolean;
  joinBlockedReason: JoinBlockedReason | null;
  /** The next upcoming date boundary - the target the UI counts down to. */
  nextMilestone: { type: MilestoneType; at: string } | null;
}

/**
 * Compute lifecycle state. Precedence is ordered so a past-dated competition can
 * never report as "open", regardless of inconsistent registration windows.
 */
export function computeState(input: AvailabilityInput, now: Date = new Date()): CompetitionState {
  const { registrationOpensAt, registrationClosesAt, startAt, endAt, maxParticipants, participantCount } = input;
  const t = now.getTime();

  if (t >= endAt.getTime()) return 'ENDED';
  if (t >= startAt.getTime()) return 'LIVE';
  if (t < registrationOpensAt.getTime()) return 'UPCOMING';
  if (t >= registrationClosesAt.getTime()) return 'REGISTRATION_CLOSED';
  return participantCount >= maxParticipants ? 'FULL' : 'REGISTRATION_OPEN';
}

export function computeAvailability(input: AvailabilityInput, now: Date = new Date()): Availability {
  const isRegistered = input.isRegistered ?? false;
  const state = computeState(input, now);
  const spotsLeft = Math.max(0, input.maxParticipants - input.participantCount);

  let canJoin = false;
  let joinBlockedReason: JoinBlockedReason | null = null;

  if (isRegistered) {
    joinBlockedReason = 'ALREADY_JOINED';
  } else {
    switch (state) {
      case 'REGISTRATION_OPEN':
        canJoin = true;
        break;
      case 'UPCOMING':
        joinBlockedReason = 'NOT_OPEN';
        break;
      case 'FULL':
        joinBlockedReason = 'FULL';
        break;
      case 'REGISTRATION_CLOSED':
      case 'LIVE':
        joinBlockedReason = 'CLOSED';
        break;
      case 'ENDED':
        joinBlockedReason = 'ENDED';
        break;
    }
  }

  const milestones: Array<{ type: MilestoneType; at: Date }> = [
    { type: 'REGISTRATION_OPENS', at: input.registrationOpensAt },
    { type: 'REGISTRATION_CLOSES', at: input.registrationClosesAt },
    { type: 'STARTS', at: input.startAt },
    { type: 'ENDS', at: input.endAt },
  ];
  const next = milestones.find((m) => m.at.getTime() > now.getTime());

  return {
    state,
    spotsLeft,
    canJoin,
    joinBlockedReason,
    nextMilestone: next ? { type: next.type, at: next.at.toISOString() } : null,
  };
}
