import { SortOption } from './models';

export const LIMITS = {
  name: 50,
  email: 120,
  password: 64,
  reviewContent: 2000,
  search: 100,
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'score_desc', label: 'Mejor puntuados' },
  { value: 'date_desc', label: 'Más recientes' },
  { value: 'date_asc', label: 'Más antiguos' },
  { value: 'title_asc', label: 'Título A-Z' },
  { value: 'title_desc', label: 'Título Z-A' },
];
