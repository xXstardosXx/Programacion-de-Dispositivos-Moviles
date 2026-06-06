import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISavedRecipe extends Document {
  user: Types.ObjectId;
  recipe: Types.ObjectId;
  group: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const savedRecipeSchema = new Schema<ISavedRecipe>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipe: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  },
  { timestamps: true }
);

savedRecipeSchema.index({ user: 1, recipe: 1, group: 1 }, { unique: true });
savedRecipeSchema.index({ user: 1, group: 1 });

export const SavedRecipe = mongoose.model<ISavedRecipe>('SavedRecipe', savedRecipeSchema);
