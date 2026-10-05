import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { audioKey } from './audioKey';
import { buildCorpus } from './speechCorpus';

describe('Eingebaute Aufnahmen', () => {
  it('Schlüssel sind stabil und hängen von Stimme und Text ab', () => {
    expect(audioKey('ありがとう')).toBe(audioKey(' ありがとう '));
    expect(audioKey('ありがとう', 'f')).not.toBe(audioKey('ありがとう', 'm'));
    expect(audioKey('ありがとう')).not.toBe(audioKey('ありがとう。'));
  });

  it('jeder vorgelesene Text hat eine Aufnahme (sonst: npm run audio)', () => {
    const index = JSON.parse(readFileSync(new URL('../../public/audio/index.json', import.meta.url), 'utf8')) as { keys: string[] };
    const keys = new Set(index.keys);
    const missing = buildCorpus().filter((e) => !keys.has(e.key));
    expect(missing.map((e) => e.text).slice(0, 10)).toEqual([]);
  });
});
