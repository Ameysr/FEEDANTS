import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';
import { applyBaseToJSON } from './plugins';

export type ParticipationStatus = 'registered' | 'cancelled';

export interface IParticipation {
  userId: Types.ObjectId;
  competitionId: Types.ObjectId;
  status: ParticipationStatus;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ParticipationDocument = HydratedDocument<IParticipation>;
export type ParticipationModel = Model<IParticipation>;

const participationSchema = new Schema<IParticipation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    status: { type: String, enum: ['registered', 'cancelled'], default: 'registered' },
    registeredAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

applyBaseToJSON(participationSchema);

/**
 * Hard guarantee against double registration: even under concurrent requests,
 * MongoDB rejects the second insert with a duplicate-key (E11000) error.
 * Partial filter keeps cancelled rows from blocking a future re-join.
 */
participationSchema.index(
  { userId: 1, competitionId: 1 },
  { unique: true, partialFilterExpression: { status: 'registered' } },
);

// Participant listing / count-per-competition.
participationSchema.index({ competitionId: 1, registeredAt: -1 });

export const Participation = model<IParticipation>('Participation', participationSchema);
