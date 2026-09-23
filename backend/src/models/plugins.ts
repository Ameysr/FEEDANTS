import mongoose, { Schema } from 'mongoose';

/** Shared serializer: expose `id`, hide `_id`/`__v`, honour field-level `toJSON`. */
export function applyBaseToJSON(schema: Schema): void {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  });
}

/** Reuse a single connection across the app (and test harness). */
export const mongooseInstance = mongoose;
