/** Types mirroring the backend API contract (see backend/src/modules). */

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

export interface Prize {
  position: number;
  label: string;
  amount: number;
}

export interface PreviousWinner {
  name: string;
  rank: string;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
}

export interface Judge {
  name: string;
  role: string;
  subtitle?: string | null;
  experienceText?: string | null;
  avatarUrl?: string | null;
  introVideoUrl?: string | null;
}

export interface CompetitionSummary {
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

export interface CompetitionDetail extends Omit<CompetitionSummary, 'viewer'> {
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
  judge: Judge | null;
  prizes: Prize[];
  previousWinners: PreviousWinner[];
  aboutText: string | null;
  judgingParameters: string[];
  rulesAndEligibility: string[];
  referralEarnText: string | null;
  reviewSectionText: string | null;
  viewer: { isRegistered: boolean; registeredAt: string | null } | null;
}

export interface Participant {
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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
}

export interface JoinResult {
  participation: { id: string; competitionId: string; registeredAt: string };
  state: CompetitionState;
  participantCount: number;
  maxParticipants: number;
  spotsLeft: number;
}

export interface ListCompetitionsParams {
  page?: number;
  limit?: number;
  category?: string;
  state?: CompetitionState;
  search?: string;
}
