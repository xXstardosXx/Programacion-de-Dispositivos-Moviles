import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Error de conexión';
  }
  return 'Ocurrió un error inesperado';
};

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: {
    name?: string;
    email?: string;
    password?: string;
    avatar?: string;
  }) => api.put('/auth/profile', data),
  deleteAccount: () => api.delete('/auth/profile'),
};

// Groups
export const groupsApi = {
  getAll: () => api.get('/groups'),
  getById: (id: string) => api.get(`/groups/${id}`),
  create: (data: { name: string; description?: string; color?: string }) =>
    api.post('/groups', data),
  update: (id: string, data: { name?: string; description?: string; color?: string }) =>
    api.put(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
  saveRecipe: (groupId: string, recipeId: string) =>
    api.post(`/groups/${groupId}/save/${recipeId}`),
  removeRecipe: (groupId: string, recipeId: string) =>
    api.delete(`/groups/${groupId}/recipes/${recipeId}`),
  getSavedForRecipe: (recipeId: string) =>
    api.get(`/groups/recipe/${recipeId}/saved`),
};

// Recipes
export const recipesApi = {
  getAll: () => api.get('/recipes'),
  getMine: () => api.get('/recipes/mine'),
  getById: (id: string) => api.get(`/recipes/${id}`),
  create: (data: {
    title: string;
    image?: string;
    ingredients: { name: string; quantity: string; unit: string }[];
    preparation: string;
    groupIds: string[];
  }) => api.post('/recipes', data),
  update: (
    id: string,
    data: {
      title?: string;
      image?: string;
      ingredients?: { name: string; quantity: string; unit: string }[];
      preparation?: string;
      groupIds?: string[];
    }
  ) => api.put(`/recipes/${id}`, data),
  delete: (id: string) => api.delete(`/recipes/${id}`),
  rate: (id: string, score: number) => api.post(`/recipes/${id}/rate`, { score }),
};
