import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface IRecipe extends Document {
  title: string;
  image?: string;
  ingredients: IIngredient[];
  preparation: string;
  groups: Types.ObjectId[];
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSchema = new Schema<IIngredient>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    quantity: { type: String, default: '', trim: true, maxlength: 20 },
    unit: { type: String, default: 'unidad', trim: true, maxlength: 20 },
  },
  { _id: false }
);

const recipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    image: { type: String, default: '' },
    ingredients: { type: [ingredientSchema], default: [] },
    preparation: { type: String, default: '', maxlength: 5000 },
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

recipeSchema.index({ title: 1 });
recipeSchema.index({ user: 1 });

export const Recipe = mongoose.model<IRecipe>('Recipe', recipeSchema);
