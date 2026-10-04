// Zentraler Zugriff auf alle Lerninhalte.
import { dialogues } from './dialogues';
import { grammar } from './grammar';
import { hiraganaMnemonics, katakanaMnemonics } from './kanaMnemonics';
import { minimalPairs } from './minimalPairs';
import { phrases } from './phrases';
import { stories } from './stories';
import type { LearnItem, Level, Sentence, TopicId } from './types';
import { words } from './vocab';

export { dialogues, grammar, minimalPairs, phrases, stories, words };
export * from './types';

export const allItems: LearnItem[] = [...words, ...phrases];
export const itemById = new Map(allItems.map((i) => [i.id, i]));
export const dialogueById = new Map(dialogues.map((d) => [d.id, d]));
export const storyById = new Map(stories.map((s) => [s.id, s]));
export const grammarById = new Map(grammar.map((g) => [g.id, g]));

const mnemonicMap = new Map([...hiraganaMnemonics, ...katakanaMnemonics].map((m) => [m.kana, m.hint]));
export function kanaMnemonic(kana: string): string | undefined {
  return mnemonicMap.get(kana);
}

export const TOPICS: Record<TopicId, { label: string; icon: string }> = {
  basics: { label: 'Grundlagen', icon: '🌱' },
  greetings: { label: 'Begrüßung & Höflichkeit', icon: '🙇' },
  self: { label: 'Über mich', icon: '🙋' },
  numbers: { label: 'Zahlen', icon: '🔢' },
  time: { label: 'Zeit & Kalender', icon: '⏰' },
  food: { label: 'Essen & Trinken', icon: '🍣' },
  shopping: { label: 'Einkaufen', icon: '🛍️' },
  travel: { label: 'Reisen & Verkehr', icon: '🚄' },
  directions: { label: 'Orte & Wege', icon: '🗺️' },
  family: { label: 'Familie & Menschen', icon: '👨‍👩‍👧' },
  home: { label: 'Zuhause & Alltag', icon: '🏠' },
  body: { label: 'Körper & Gesundheit', icon: '🩺' },
  nature: { label: 'Wetter & Natur', icon: '🌸' },
  work: { label: 'Arbeit & Schule', icon: '💼' },
  hobby: { label: 'Freizeit & Hobbys', icon: '🎮' },
  feelings: { label: 'Gefühle & Eigenschaften', icon: '😊' },
  actions: { label: 'Wichtige Verben', icon: '🏃' },
  business: { label: 'Beruf & Keigo', icon: '🤝' },
};

export const LEVELS: Record<Level, { label: string; short: string; desc: string }> = {
  1: { label: 'Einsteiger', short: 'A', desc: 'Ohne Vorkenntnisse – Kana, Überlebenssätze, Basiswörter (≈ JLPT N5)' },
  2: { label: 'Grundstufe', short: 'B', desc: 'Alltagsgespräche, て-Form, Vergangenheit (≈ JLPT N4)' },
  3: { label: 'Fortgeschritten', short: 'C', desc: 'Keigo, Konditionale, natürliche Umgangssprache (≈ JLPT N3+)' },
};

/**
 * Text für die Sprachausgabe: Einzelwörter über die Kana-Lesung (einzelne Kanji haben oft
 * mehrere Lesungen, z. B. 分 = ふん/ぶん), Sätze über die natürliche Schreibweise (bessere Betonung).
 */
export function sayText(item: LearnItem): string {
  return item.kind === 'word' ? item.kana : item.jp;
}

export function itemsFor(topic: TopicId | undefined, level: Level | undefined): LearnItem[] {
  return allItems.filter((i) => (!topic || i.topic === topic) && (!level || i.level === level));
}

/** Alle Sätze (Beispiele, Phrasen, Dialogzeilen) – Material für Shadowing & Hörtraining. */
export function sentencePool(level?: Level): (Sentence & { level: Level; source: string })[] {
  const out: (Sentence & { level: Level; source: string })[] = [];
  for (const p of phrases) if (!level || p.level === level) out.push({ ...p, source: 'Phrase' });
  for (const w of words) {
    if (w.example && (!level || w.level === level)) out.push({ ...w.example, level: w.level, source: w.jp });
  }
  for (const d of dialogues) {
    if (level && d.level !== level) continue;
    for (const l of d.lines) out.push({ jp: l.jp, kana: l.kana, de: l.de, romaji: l.romaji, level: d.level, source: d.title });
  }
  for (const g of grammar) {
    if (level && g.level !== level) continue;
    for (const e of g.examples) out.push({ ...e, level: g.level, source: g.title });
  }
  return out;
}
