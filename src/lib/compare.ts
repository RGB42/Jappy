// Bewertung gesprochener Antworten: vergleicht Erkennungs-Alternativen mit Zielformen.
import { normalizeJa } from './kana';

export function levenshtein(a: string, b: string): number {
  const x = [...a];
  const y = [...b];
  if (!x.length) return y.length;
  if (!y.length) return x.length;
  let prev = Array.from({ length: y.length + 1 }, (_, i) => i);
  for (let i = 1; i <= x.length; i++) {
    const cur = [i];
    for (let j = 1; j <= y.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[y.length];
}

/** Ähnlichkeit 0…1 nach Normalisierung (Katakana = Hiragana, ohne Satzzeichen). */
export function similarity(a: string, b: string): number {
  const na = normalizeJa(a);
  const nb = normalizeJa(b);
  if (!na && !nb) return 1;
  const len = Math.max([...na].length, [...nb].length);
  return 1 - levenshtein(na, nb) / len;
}

export type SpeechGrade = 'perfect' | 'good' | 'retry';

export interface SpeechScore {
  score: number; // 0…1
  grade: SpeechGrade;
  heard: string; // beste erkannte Alternative
}

export function gradeFor(score: number): SpeechGrade {
  if (score >= 0.85) return 'perfect';
  if (score >= 0.6) return 'good';
  return 'retry';
}

/**
 * Vergleicht alle Alternativen der Spracherkennung mit allen akzeptierten Zielformen
 * (Kanji-Schreibweise, Kana-Lesung, Varianten) und nimmt das beste Ergebnis.
 */
export function scoreSpeech(heard: string[], targets: string[]): SpeechScore {
  let best: SpeechScore = { score: 0, grade: 'retry', heard: heard[0] ?? '' };
  for (const h of heard) {
    for (const t of targets) {
      if (!t) continue;
      const s = similarity(h, t);
      if (s > best.score) best = { score: s, grade: gradeFor(s), heard: h };
    }
  }
  return best;
}

export const GRADE_LABEL: Record<SpeechGrade, string> = {
  perfect: 'Perfekt! すごい！',
  good: 'Gut verstanden!',
  retry: 'Noch nicht ganz – hör noch mal hin.',
};
