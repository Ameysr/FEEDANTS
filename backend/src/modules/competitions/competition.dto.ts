import type { ICompetition, IPreviousWinner, IPrize, IJudge } from '../../models/Competition';
import type { Availability, CompetitionState, JoinBlockedReason, MilestoneType } from '../../utils/competitionState';

export interface CompetitionSummaryDTO {
  id: string;
  title: string;
  subtitle: string | null;
  bannerUrl: string | null;
  organizer: string;
  category: string;
  tags: string[];
  entryFee: number;
  prizePool: number;
  registrationClosesAt: string;
  startAt: string;
  endAt: string;
  maxParticipants: number;
  participantCount: number;
  spotsLeft: number;
  state: CompetitionState;
  viewer: { isRegistered: boolean } | null;
  serverTime: string;
}

export interface CompetitionDetailDTO extends Omit<CompetitionSummaryDTO, 'viewer'> {
  description: string;
  certificateText: string | null;
  disclaimer: string | null;
  refundPolicyText: string | null;
  registrationOpensAt: string;
  submissionStartsAt: string | null;
  submissionEndsAt: string | null;
  resultAt: string | null;
  canJoin: boolean;
  joinBlockedReason: JoinBlockedReason | null;
  nextMilestone: { type: MilestoneType; at: string } | null;
  judge: IJudge | null;
  prizes: IPrize[];
  previousWinners: IPreviousWinner[];
  aboutText: string | null;
  judgingParameters: string[];
  rulesAndEligibility: string[];
  referralEarnText: string | null;
  reviewSectionText: string | null;
  viewer: { isRegistered: boolean; registeredAt: string | null } | null;
}

export function toSummaryDTO(
  competition: ICompetition & { _id: unknown },
  availability: Availability,
  serverTime: string,
  isRegistered: boolean,
  includeViewer: boolean,
): CompetitionSummaryDTO {
  return {
    id: String(competition._id),
    title: competition.title,
    subtitle: competition.subtitle ?? null,
    bannerUrl: competition.bannerUrl ?? null,
    organizer: competition.organizer,
    category: competition.category,
    tags: competition.tags ?? [],
    entryFee: competition.entryFee,
    prizePool: competition.prizePool,
    registrationClosesAt: competition.registrationClosesAt.toISOString(),
    startAt: competition.startAt.toISOString(),
    endAt: competition.endAt.toISOString(),
    maxParticipants: competition.maxParticipants,
    participantCount: competition.participantCount,
    spotsLeft: availability.spotsLeft,
    state: availability.state,
    viewer: includeViewer ? { isRegistered } : null,
    serverTime,
  };
}

export function toDetailDTO(
  competition: ICompetition & { _id: unknown },
  availability: Availability,
  serverTime: string,
  isRegistered: boolean,
  registeredAt: Date | null,
  isAuthenticated: boolean,
): CompetitionDetailDTO {
  // A viewer who is not signed in cannot join even if the competition is open.
  let canJoin = availability.canJoin;
  let joinBlockedReason = availability.joinBlockedReason;
  if (!isAuthenticated && canJoin) {
    canJoin = false;
    joinBlockedReason = 'AUTH_REQUIRED';
  }

  return {
    ...toSummaryDTO(competition, availability, serverTime, isRegistered, isAuthenticated),
    description: competition.description,
    certificateText: competition.certificateText ?? null,
    disclaimer: competition.disclaimer ?? null,
    refundPolicyText: competition.refundPolicyText ?? null,
    registrationOpensAt: competition.registrationOpensAt.toISOString(),
    submissionStartsAt: competition.submissionStartsAt?.toISOString() ?? null,
    submissionEndsAt: competition.submissionEndsAt?.toISOString() ?? null,
    resultAt: competition.resultAt?.toISOString() ?? null,
    canJoin,
    joinBlockedReason,
    nextMilestone: availability.nextMilestone,
    judge: competition.judge ?? null,
    prizes: competition.prizes ?? [],
    previousWinners: competition.previousWinners ?? [],
    aboutText: competition.aboutText ?? null,
    judgingParameters: competition.judgingParameters ?? [],
    rulesAndEligibility: competition.rulesAndEligibility ?? [],
    referralEarnText: competition.referralEarnText ?? null,
    reviewSectionText: competition.reviewSectionText ?? null,
    viewer: isAuthenticated
      ? { isRegistered, registeredAt: registeredAt ? registeredAt.toISOString() : null }
      : null,
  };
}

export interface ParticipantDTO {
  id: string;
  registeredAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
