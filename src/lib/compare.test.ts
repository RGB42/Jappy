import { describe, expect, it } from 'vitest';
import { levenshtein, scoreSpeech, similarity } from './compare';

describe('Sprachbewertung', () => {
  it('Levenshtein', () => {
    expect(levenshtein('ねこ', 'ねこ')).toBe(0);
    expect(levenshtein('ねこ', 'ねご')).toBe(1);
    expect(levenshtein('', 'あい')).toBe(2);
  });

  it('ignoriert Schriftart und Satzzeichen', () => {
    expect(similarity('コーヒー。', 'こーひー')).toBe(1);
  });

  it('nimmt die beste Alternative über alle Zielformen', () => {
    const r = scoreSpeech(['水を下さい', '水をください'], ['水をください。', 'みず を ください。']);
    expect(r.grade).toBe('perfect');
    expect(r.heard).toBe('水をください');
  });

  it('erkennt deutlich falsche Antworten', () => {
    expect(scoreSpeech(['さようなら'], ['ありがとう', 'ありがとう']).grade).toBe('retry');
  });

  it('leichte Abweichungen sind „gut“', () => {
    expect(scoreSpeech(['ありがと'], ['ありがとう']).grade).toBe('good');
  });
});
