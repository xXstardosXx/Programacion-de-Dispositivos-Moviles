export const LIMITS = {
  name: 50,
  email: 80,
  password: 64,
  title: 100,
  ingredientName: 80,
  ingredientQuantity: 20,
  preparation: 5000,
  groupName: 50,
  groupDescription: 200,
};

export const UNITS = [
  'unidad',
  'g',
  'kg',
  'ml',
  'litros',
  'taza',
  'cucharada',
  'cucharadita',
  'pizca',
] as const;

export type Unit = (typeof UNITS)[number];
