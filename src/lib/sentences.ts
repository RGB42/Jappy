// Gemeinsame Satz-Helfer (UI + Audio-Korpus).
import type { BuildExercise, Sentence } from '../data/types';

// Einzeln vorgelesen klingen diese Partikeln sonst wie „ha/he/wo“.
export const PARTICLE_SOUND: Record<string, string> = { は: 'わ', へ: 'え', を: 'お' };

export function exerciseSentence(ex: BuildExercise): Sentence {
  const end = /[?？]\s*$/.test(ex.de) ? '？' : '。';
  return {
    jp: ex.tiles.map((t) => t.jp).join('') + end,
    kana: ex.tiles.map((t) => t.kana).join(' ') + end,
    de: ex.de,
  };
}
