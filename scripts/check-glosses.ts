// Prüft Satzanalyse-Dateien: npx tsx scripts/check-glosses.ts src/data/glosses/p1.ts [chunk.json]
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { sentencePool } from '../src/data/index';
import type { GlossEntry, Sentence } from '../src/data/types';
import { stripGlossDe, validateGloss } from '../src/lib/gloss';

const [file, chunk] = process.argv.slice(2);
const mod = (await import(pathToFileURL(resolve(file)).href)) as { glosses: GlossEntry[] };
const pool = new Map<string, Sentence>();
for (const s of sentencePool()) pool.set(`${s.jp}\n${s.de}`, s);

let errors = 0;
const seen = new Set<string>();
for (const e of mod.glosses) {
  const key = `${e[0]}\n${stripGlossDe(e[2])}`;
  if (seen.has(key)) {
    console.log(`✗ doppelt: ${e[0]}`);
    errors++;
  }
  seen.add(key);
  const s = pool.get(key) ?? [...pool.values()].find((x) => x.jp === e[0]);
  if (!s) {
    console.log(`✗ ${e[0]}: Satz nicht gefunden`);
    errors++;
    continue;
  }
  const errs = validateGloss(e, s);
  for (const x of errs) console.log(`✗ ${e[0]}: ${x}`);
  errors += errs.length;
}
if (chunk) {
  const want = JSON.parse(readFileSync(chunk, 'utf8')) as Sentence[];
  const missing = want.filter((s) => !seen.has(`${s.jp}\n${s.de}`));
  for (const s of missing) console.log(`✗ fehlt: ${s.jp} (${s.de})`);
  errors += missing.length;
  console.log(`${want.length - missing.length}/${want.length} Sätze abgedeckt`);
}
console.log(errors ? `${errors} Fehler` : `OK – ${mod.glosses.length} Einträge`);
process.exit(errors ? 1 : 0);
