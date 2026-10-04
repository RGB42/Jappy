// Prüft alle Lerninhalte auf Konsistenz (eindeutige IDs, reine Kana-Lesungen, gültige Antworten …).
import { describe, expect, it } from 'vitest';
import { isKanaText, normalizeJa } from '../lib/kana';
import type {
  BuildExercise,
  Dialogue,
  GrammarPoint,
  KanaMnemonic,
  LearnItem,
  MinimalPair,
  Sentence,
  Story,
} from './types';

const mods = import.meta.glob(['./*.ts', '!./*.test.ts'], { eager: true }) as Record<string, Record<string, unknown>>;
const get = <T,>(file: string, name: string): T[] => (mods[file]?.[name] as T[] | undefined) ?? [];

const TOPICS = [
  'basics', 'greetings', 'self', 'numbers', 'time', 'food', 'shopping', 'travel', 'directions',
  'family', 'home', 'body', 'nature', 'work', 'hobby', 'feelings', 'actions', 'business',
];

const hasKanji = (s: string) => /[一-鿿々]/.test(s);

function checkSentence(s: Sentence, where: string) {
  expect(s.jp?.trim(), `${where}: jp fehlt`).toBeTruthy();
  expect(s.de?.trim(), `${where}: de fehlt`).toBeTruthy();
  expect(isKanaText(s.kana), `${where}: kana enthält Nicht-Kana: "${s.kana}"`).toBe(true);
  if (!hasKanji(s.jp)) {
    expect(normalizeJa(s.kana), `${where}: jp „${s.jp}“ und kana „${s.kana}“ passen nicht`).toBe(
      normalizeJa(s.jp),
    );
  }
}

function checkBuild(ex: BuildExercise, where: string) {
  expect(ex.de, `${where}: de fehlt`).toBeTruthy();
  expect(ex.tiles.length, `${where}: zu wenige Bausteine`).toBeGreaterThanOrEqual(3);
  for (const t of [...ex.tiles, ...(ex.distractors ?? [])]) {
    expect(t.jp, `${where}: Baustein ohne jp`).toBeTruthy();
    expect(isKanaText(t.kana), `${where}: Baustein-kana „${t.kana}“`).toBe(true);
    if (!hasKanji(t.jp)) expect(normalizeJa(t.kana), `${where}: Baustein „${t.jp}“`).toBe(normalizeJa(t.jp));
  }
  const tileSet = new Set(ex.tiles.map((t) => t.jp));
  for (const d of ex.distractors ?? []) {
    expect(tileSet.has(d.jp), `${where}: Distraktor „${d.jp}“ ist auch richtiger Baustein`).toBe(false);
  }
}

describe('Lerninhalte', () => {
  const words = get<LearnItem>('./vocab.ts', 'words');
  const phrases = get<LearnItem>('./phrases.ts', 'phrases');
  const items = [...words, ...phrases];

  it('Vokabeln & Phrasen sind gültig', () => {
    const ids = new Set<string>();
    for (const it of items) {
      expect(ids.has(it.id), `doppelte ID ${it.id}`).toBe(false);
      ids.add(it.id);
      expect(TOPICS, `${it.id}: Thema ${it.topic}`).toContain(it.topic);
      expect([1, 2, 3], `${it.id}: Level`).toContain(it.level);
      expect(it.id.startsWith(it.kind === 'word' ? 'w-' : 'p-'), `${it.id}: Präfix`).toBe(true);
      checkSentence(it, it.id);
      if (it.example) checkSentence(it.example, `${it.id}.example`);
    }
  });

  it('Kana-Eselsbrücken sind gültig', () => {
    for (const name of ['hiraganaMnemonics', 'katakanaMnemonics']) {
      const list = get<KanaMnemonic>('./kanaMnemonics.ts', name);
      const seen = new Set<string>();
      for (const m of list) {
        expect(seen.has(m.kana), `${name}: doppelt ${m.kana}`).toBe(false);
        seen.add(m.kana);
        expect(m.hint.length, `${name}: ${m.kana}`).toBeGreaterThan(5);
      }
    }
  });

  it('Dialoge sind gültig', () => {
    const ids = new Set<string>();
    for (const d of get<Dialogue>('./dialogues.ts', 'dialogues')) {
      expect(ids.has(d.id), `doppelte ID ${d.id}`).toBe(false);
      ids.add(d.id);
      expect(TOPICS).toContain(d.topic);
      expect(d.lines.length, `${d.id}: zu kurz`).toBeGreaterThanOrEqual(4);
      expect(d.lines.some((l) => l.role === d.userRole), `${d.id}: keine Nutzerzeilen`).toBe(true);
      d.lines.forEach((l, i) => {
        checkSentence(l, `${d.id}[${i}]`);
        for (const a of l.accept ?? []) expect(isKanaText(a), `${d.id}[${i}] accept „${a}“`).toBe(true);
      });
    }
  });

  it('Hörgeschichten sind gültig', () => {
    const ids = new Set<string>();
    for (const s of get<Story>('./stories.ts', 'stories')) {
      expect(ids.has(s.id), `doppelte ID ${s.id}`).toBe(false);
      ids.add(s.id);
      expect(TOPICS).toContain(s.topic);
      s.sentences.forEach((x, i) => checkSentence(x, `${s.id}[${i}]`));
      expect(s.questions.length, `${s.id}: Fragen`).toBeGreaterThanOrEqual(2);
      for (const q of s.questions) {
        expect(q.answer, `${s.id}: ${q.q}`).toBeGreaterThanOrEqual(0);
        expect(q.answer, `${s.id}: ${q.q}`).toBeLessThan(q.options.length);
      }
    }
  });

  it('Grammatik ist gültig', () => {
    const ids = new Set<string>();
    for (const g of get<GrammarPoint>('./grammar.ts', 'grammar')) {
      expect(ids.has(g.id), `doppelte ID ${g.id}`).toBe(false);
      ids.add(g.id);
      expect(g.examples.length, `${g.id}: Beispiele`).toBeGreaterThanOrEqual(2);
      g.examples.forEach((x, i) => checkSentence(x, `${g.id}.ex[${i}]`));
      g.exercises.forEach((x, i) => checkBuild(x, `${g.id}.build[${i}]`));
    }
  });

  it('Minimalpaare sind gültig', () => {
    for (const p of get<MinimalPair>('./minimalPairs.ts', 'minimalPairs')) {
      checkSentence(p.a, `${p.id}.a`);
      checkSentence(p.b, `${p.id}.b`);
      expect(normalizeJa(p.a.kana)).not.toBe(normalizeJa(p.b.kana));
    }
  });
});
