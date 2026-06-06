export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  color: string;
  user: string;
  recipeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  _id: string;
  title: string;
  image?: string;
  ingredients: Ingredient[] | string[];
  preparation?: string;
  steps?: string[];
  groups: Group[];
  user: User | string;
  averageRating?: number;
  ratingCount?: number;
  userRating?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
}
