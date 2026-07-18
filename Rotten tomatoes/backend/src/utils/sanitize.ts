/**
 * Utilidades de saneamiento de entrada.
 *
 * Objetivo: que ningún input pueda "romper" la app ni la vista:
 *  - Se recortan espacios al inicio/fin.
 *  - Se eliminan caracteres de control invisibles.
 *  - Se colapsan runs enormes de espacios/saltos de línea.
 *  - Se aplica un tope duro de longitud en el servidor (no confiar solo en el cliente).
 */

// Quita caracteres de control (excepto \n y \t que se manejan aparte).
const stripControlChars = (value: string): string =>
  // eslint-disable-next-line no-control-regex
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

/**
 * Texto de una sola línea (nombres, títulos de búsqueda, etc.).
 * Colapsa cualquier espacio en blanco a un solo espacio y corta a maxLen.
 */
export const cleanSingleLine = (value: unknown, maxLen: number): string => {
  if (typeof value !== 'string') return '';
  return stripControlChars(value)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
};

/**
 * Texto multilínea (contenido de reseñas). Permite saltos de línea, pero:
 *  - Colapsa 3+ saltos seguidos a máximo 2 (evita "muros" vacíos gigantes).
 *  - Colapsa espacios/tabs repetidos.
 *  - Corta a maxLen.
 */
export const cleanMultiLine = (value: unknown, maxLen: number): string => {
  if (typeof value !== 'string') return '';
  return stripControlChars(value)
    .replace(/[^\S\n]+/g, ' ') // espacios/tabs repetidos -> uno
    .replace(/\n{3,}/g, '\n\n') // 3+ saltos -> 2
    .replace(/ *\n */g, '\n')
    .trim()
    .slice(0, maxLen);
};

/**
 * Quita TODOS los espacios (para contraseñas y nombres de usuario).
 * Así un input de puros espacios queda vacío y falla la validación.
 */
export const stripAllWhitespace = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return stripControlChars(value).replace(/\s/g, '');
};
