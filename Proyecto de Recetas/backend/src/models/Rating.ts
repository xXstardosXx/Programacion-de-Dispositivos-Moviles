import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRating extends Document {
  user: Types.ObjectId;
  recipe: Types.ObjectId;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipe: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

ratingSchema.index({ user: 1, recipe: 1 }, { unique: true });
ratingSchema.index({ recipe: 1 });

export const Rating = mongoose.model<IRating>('Rating', ratingSchema);
