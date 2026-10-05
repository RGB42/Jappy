import { describe, expect, it } from 'vitest';
import type { GlossPart } from '../data/types';
import { layoutGloss, parseGlossDe, partRomaji, resolveRef, stripGlossDe } from './gloss';

const parts: GlossPart[] = [
  ['お仕事', 'おしごと', 'Arbeit, Beruf', 'S'],
  ['は', 'は', '(Thema)', 'S'],
  ['何', 'なん', 'was', 'Q'],
  ['です', 'です', 'ist (höflich)', 'V'],
  ['か', 'か', '(Frage)', 'V'],
];

describe('gloss', () => {
  it('zerlegt die markierte Übersetzung', () => {
    const de = '{Was|何} {machen Sie|です} {beruflich|お仕事}{?|か}';
    expect(stripGlossDe(de)).toBe('Was machen Sie beruflich?');
    expect(parseGlossDe(de, parts)).toEqual([
      { text: 'Was', part: 2 },
      { text: ' ' },
      { text: 'machen Sie', part: 3 },
      { text: ' ' },
      { text: 'beruflich', part: 0 },
      { text: '?', part: 4 },
    ]);
  });

  it('löst Verweise auf', () => {
    expect(resolveRef(parts, '何')).toBe(2);
    expect(resolveRef(parts, '#1')).toBe(0);
    expect(resolveRef(parts, '#9')).toBe(-1);
    expect(resolveRef([...parts, ['は', 'は', '', 'S']], 'は')).toBe(-1);
  });

  it('ordnet Teile dem Satz zu und behält Satzzeichen', () => {
    expect(layoutGloss('お仕事は何ですか。', parts)).toEqual([{ part: 0 }, { part: 1 }, { part: 2 }, { part: 3 }, { part: 4 }, { punct: '。' }]);
    expect(layoutGloss('お仕事は何ですか。', parts.slice(1))).toBeNull();
  });

  it('Romaji: Partikel は als „wa“', () => {
    expect(partRomaji(parts[1])).toBe('wa');
    expect(partRomaji(['こんにちは', 'こんにちは', 'Hallo', 'X', 'konnichiwa'])).toBe('konnichiwa');
  });
});
