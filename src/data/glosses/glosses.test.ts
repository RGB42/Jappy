// Satzanalyse: jeder Shadowing-Satz hat eine gültige Wort-für-Wort-Zuordnung.
import { describe, expect, it } from 'vitest';
import { stripGlossDe, validateGloss } from '../../lib/gloss';
import { sentencePool } from '../index';
import { allGlosses, findGloss } from './index';

describe('Satzanalyse', () => {
  it('deckt alle Übungssätze ab', () => {
    const missing = sentencePool().filter((s) => {
      const g = findGloss(s);
      return !g || stripGlossDe(g[2]) !== s.de;
    });
    expect(missing.map((s) => `${s.jp} (${s.de})`)).toEqual([]);
  });

  it('Einträge sind gültig und eindeutig', () => {
    const pool = sentencePool();
    const seen = new Set<string>();
    const errors: string[] = [];
    for (const e of allGlosses) {
      const key = `${e[0]}\n${stripGlossDe(e[2])}`;
      if (seen.has(key)) errors.push(`doppelt: ${e[0]}`);
      seen.add(key);
      const s = pool.find((x) => x.jp === e[0] && x.de === stripGlossDe(e[2])) ?? pool.find((x) => x.jp === e[0]);
      if (!s) errors.push(`unbenutzt: ${e[0]}`);
      else errors.push(...validateGloss(e, s).map((x) => `${e[0]}: ${x}`));
    }
    expect(errors).toEqual([]);
  });
});
