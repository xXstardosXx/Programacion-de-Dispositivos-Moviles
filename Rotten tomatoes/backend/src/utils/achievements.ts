export type AchievementCode =
  | 'first_blood'
  | 'perfect_ten'
  | 'trash_talk'
  | 'wall_of_text'
  | 'critic_pass'
  | 'rage_quit';

export interface AchievementDef {
  code: AchievementCode;
  title: string;
  description: string;
  howTo: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    code: 'first_blood',
    title: 'Primera sangre',
    description: 'Publicaste tu primera reseña. El mundo gamer tiembla.',
    howTo: 'Publica tu primera reseña en cualquier juego.',
    icon: 'flame',
  },
  {
    code: 'perfect_ten',
    title: 'Dios del 10',
    description: 'Le diste un 10/10 a un juego. Sin filtros.',
    howTo: 'Dale un 10/10 a un juego al reseñarlo.',
    icon: 'star',
  },
  {
    code: 'trash_talk',
    title: 'Ni el tutorial',
    description: 'Le diste un 1/10. Brutalmente honesto.',
    howTo: 'Dale un 1/10 a un juego al reseñarlo.',
    icon: 'thumbs-down',
  },
  {
    code: 'wall_of_text',
    title: 'Wall of text',
    description: 'Escribiste una reseña de más de 200 caracteres.',
    howTo: 'Escribe una reseña con 200 caracteres o más.',
    icon: 'document-text',
  },
  {
    code: 'critic_pass',
    title: 'Con carnet de crítico',
    description: 'Activaste el rol Crítico. Tus notas pesan distinto.',
    howTo: 'Cambia tu tipo de cuenta a Crítico en el perfil.',
    icon: 'ribbon',
  },
  {
    code: 'rage_quit',
    title: 'Rage quit',
    description: 'Borraste tu cuenta. Hasta nunca… o hasta el próximo registro.',
    howTo: 'Elimina tu cuenta desde el perfil (irreversible).',
    icon: 'exit',
  },
];

export const getAchievement = (code: string): AchievementDef | undefined =>
  ACHIEVEMENTS.find((a) => a.code === code);
