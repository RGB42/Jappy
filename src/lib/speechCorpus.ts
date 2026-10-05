// Alle japanischen Texte, die die App vorliest – Grundlage für die eingebauten Audiodateien.
// Jeder Eintrag enthält den gesprochenen Text (genau wie er an say() geht) und – wenn bekannt –
// die Kana-Lesung, damit die Sprachsynthese Kanji garantiert richtig liest.
import { allItems, dialogues, grammar, minimalPairs, sayText, stories } from '../data/index';
import { kanaRows, rowChars } from '../data/kana';
import { stations } from '../data/stations';
import { buildLessonScript } from './audioLesson';
import { audioKey, type AudioVoice } from './audioKey';
import { RANKS, SHOP } from './game';
import { PARTICLE_SOUND, exerciseSentence } from './sentences';

export interface CorpusEntry {
  key: string;
  text: string;
  kana?: string;
  voice: AudioVoice;
}

/** Feste Sätze aus der Oberfläche (Onboarding, Einstellungen, Maskottchen, Audio-Lektion). */
export const UI_PHRASES: { text: string; kana?: string }[] = [
  { text: 'こんにちは。ようこそ！', kana: 'こんにちは。 ようこそ！' },
  { text: 'ありがとう' },
  { text: 'はじめまして。どうぞ よろしく おねがいします。' },
  { text: 'おつかれさまでした！' },
  { text: 'すごい！' },
  { text: 'ちょっとだけ！' },
  { text: 'がんばって！' },
  { text: 'おはよう！' },
  { text: 'いいね！' },
  { text: 'いっしょに がんばろう！' },
];

export function buildCorpus(): CorpusEntry[] {
  const map = new Map<string, CorpusEntry>();
  const add = (text: string, kana?: string, voice: AudioVoice = 'f') => {
    const t = text.trim();
    if (!t) return;
    const key = audioKey(t, voice);
    if (!map.has(key)) map.set(key, { key, text: t, kana, voice });
  };

  for (const item of allItems) {
    add(sayText(item), item.kana);
    if (item.example) add(item.example.jp, item.example.kana);
    // Audio-Lektion: Rückwärtsaufbau langer Ausdrücke
    for (const cue of buildLessonScript([{ id: item.id, jp: sayText(item), kana: item.kana, de: item.de, isNew: true }])) {
      if (cue.type === 'ja') add(cue.text);
    }
  }
  for (const d of dialogues) {
    for (const line of d.lines) {
      add(line.jp, line.kana);
      // Zweite Stimme für die Gesprächspartner-Rolle, damit Dialoge lebendiger klingen.
      if (line.role !== d.userRole) add(line.jp, line.kana, 'm');
    }
  }
  for (const s of stories) for (const x of s.sentences) add(x.jp, x.kana);
  for (const g of grammar) {
    for (const e of g.examples) add(e.jp, e.kana);
    for (const ex of g.exercises) {
      const s = exerciseSentence(ex);
      add(s.jp, s.kana);
      for (const t of [...ex.tiles, ...(ex.distractors ?? [])]) add(PARTICLE_SOUND[t.kana] ?? t.jp, PARTICLE_SOUND[t.kana] ?? t.kana);
    }
  }
  for (const p of minimalPairs) {
    add(p.a.jp, p.a.kana);
    add(p.b.jp, p.b.kana);
  }
  for (const row of kanaRows) {
    for (const k of rowChars(row, 'hiragana')) add(k, k);
    for (const k of rowChars(row, 'katakana')) add(k, k);
  }
  for (const st of stations) add(st.phrase.jp, st.phrase.kana);
  for (const item of SHOP) if (item.jp) add(item.jp.jp, item.jp.kana);
  for (const r of RANKS) add(r.kana, r.kana);
  for (const p of UI_PHRASES) add(p.text, p.kana);
  return [...map.values()];
}
