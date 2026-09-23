import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';
import { applyBaseToJSON } from './plugins';

export interface IPrize {
  /** 1-based position, e.g. 1 for "1st Winner". */
  position: number;
  label: string;
  amount: number;
}

export interface IPreviousWinner {
  name: string;
  /** e.g. "1st Winner" */
  rank: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export interface IJudge {
  name: string;
  role: string;
  subtitle?: string;
  experienceText?: string;
  avatarUrl?: string;
  introVideoUrl?: string;
}

export interface ICompetition {
  title: string;
  subtitle?: string;
  description: string;
  bannerUrl?: string;
  organizer: string;
  category: string;
  tags: string[];
  certificateText?: string;
  disclaimer?: string;
  refundPolicyText?: string;

  entryFee: number;
  prizePool: number;

  /** Lifecycle: registration window then the live competition window. */
  registrationOpensAt: Date;
  registrationClosesAt: Date;
  startAt: Date;
  endAt: Date;

  /** Deadline-style dates rendered in the "Important Dates" grid. */
  submissionStartsAt?: Date;
  submissionEndsAt?: Date;
  resultAt?: Date;

  maxParticipants: number;
  /** Denormalized, atomically maintained counter - the capacity source of truth. */
  participantCount: number;

  judge?: IJudge;
  prizes: IPrize[];
  previousWinners: IPreviousWinner[];

  aboutText?: string;
  judgingParameters: string[];
  rulesAndEligibility: string[];

  referralEarnText?: string;
  reviewSectionText?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type CompetitionDocument = HydratedDocument<ICompetition>;
export type CompetitionModel = Model<ICompetition>;

const prizeSchema = new Schema<IPrize>(
  {
    position: { type: Number, required: true },
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const previousWinnerSchema = new Schema<IPreviousWinner>(
  {
    name: { type: String, required: true },
    rank: { type: String, required: true },
    thumbnailUrl: String,
    videoUrl: String,
  },
  { _id: false },
);

const judgeSchema = new Schema<IJudge>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    subtitle: String,
    experienceText: String,
    avatarUrl: String,
    introVideoUrl: String,
  },
  { _id: false },
);

const competitionSchema = new Schema<ICompetition>(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    subtitle: { type: String, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true },
    bannerUrl: { type: String, trim: true },
    organizer: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    tags: { type: [String], default: [] },
    certificateText: String,
    disclaimer: String,
    refundPolicyText: String,

    entryFee: { type: Number, required: true, min: 0, default: 0 },
    prizePool: { type: Number, required: true, min: 0, default: 0 },

    registrationOpensAt: { type: Date, required: true },
    registrationClosesAt: { type: Date, required: true, index: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    submissionStartsAt: Date,
    submissionEndsAt: Date,
    resultAt: Date,

    maxParticipants: { type: Number, required: true, min: 1 },
    participantCount: { type: Number, required: true, min: 0, default: 0 },

    judge: { type: judgeSchema, default: undefined },
    prizes: { type: [prizeSchema], default: [] },
    previousWinners: { type: [previousWinnerSchema], default: [] },

    aboutText: String,
    judgingParameters: { type: [String], default: [] },
    rulesAndEligibility: { type: [String], default: [] },

    referralEarnText: String,
    reviewSectionText: String,
  },
  { timestamps: true },
);

applyBaseToJSON(competitionSchema);

// Guard against a malformed document where the counter exceeds capacity.
competitionSchema.pre('validate', function validateCapacity(next) {
  if (this.participantCount < 0) this.invalidate('participantCount', 'participantCount cannot be negative');
  next();
});

// Listing + filtering indexes.
competitionSchema.index({ startAt: -1 });
competitionSchema.index({ category: 1, startAt: -1 });
competitionSchema.index({ title: 'text', tags: 'text' });

export const Competition = model<ICompetition>('Competition', competitionSchema);

/** Type guard usable from services/controllers. */
export const isObjectId = (value: string): boolean => Types.ObjectId.isValid(value);
