// Satzanalyse: welcher japanische Satzteil gehört zu welchen deutschen Wörtern?
// Datenformat siehe GlossEntry in data/types.ts.
import type { GlossEntry, GlossPart, GlossRole, Sentence } from '../data/types';
import { toRomaji } from './kana';

export const ROLE_LABEL: Record<GlossRole, string> = {
  S: 'Subjekt / Thema',
  O: 'Objekt',
  V: 'Prädikat',
  Q: 'Fragewort',
  T: 'Zeit',
  L: 'Ort / Ziel',
  M: 'Ergänzung',
  X: 'Ausdruck',
};

export const ROLE_ORDER: GlossRole[] = ['S', 'O', 'V', 'Q', 'T', 'L', 'M', 'X'];

/** Partikeln werden etwas zurückhaltender dargestellt. */
const PARTICLES = new Set(['は', 'が', 'を', 'に', 'へ', 'で', 'と', 'も', 'の', 'か', 'ね', 'よ', 'や', 'から', 'まで', 'より', 'けど', 'が、', 'な', 'わ', 'って']);
export const isParticle = (p: GlossPart) => PARTICLES.has(p[1].trim());

const PUNCT = /[\s　。、？！?!「」『』…,.]/;
const PUNCT_ALL = new RegExp(PUNCT.source, 'g');

export const partRomaji = (p: GlossPart) => p[4] ?? toRomaji(p[1]);

export interface DeSegment {
  text: string;
  /** Index des japanischen Teils, falls markiert. */
  part?: number;
}

/** Zerlegt die markierte Übersetzung in Abschnitte. Ungültige Verweise → part undefined. */
export function parseGlossDe(de: string, parts: GlossPart[]): DeSegment[] {
  const out: DeSegment[] = [];
  const re = /\{([^{}|]+)\|([^{}]+)\}/g;
  let last = 0;
  for (const m of de.matchAll(re)) {
    if (m.index > last) out.push({ text: de.slice(last, m.index) });
    const idx = resolveRef(parts, m[2]);
    out.push({ text: m[1], part: idx >= 0 ? idx : undefined });
    last = m.index + m[0].length;
  }
  if (last < de.length) out.push({ text: de.slice(last) });
  return out;
}

export function stripGlossDe(de: string): string {
  return de.replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1');
}

/** Verweis auflösen: japanischer Text (eindeutig) oder #n (1-basiert). */
export function resolveRef(parts: GlossPart[], ref: string): number {
  const r = ref.trim();
  const num = r.match(/^#(\d+)$/);
  if (num) {
    const i = Number(num[1]) - 1;
    return i >= 0 && i < parts.length ? i : -1;
  }
  const hits = parts.flatMap((p, i) => (p[0] === r ? [i] : []));
  return hits.length === 1 ? hits[0] : -1;
}

export type LayoutItem = { part: number } | { punct: string };

/**
 * Ordnet die Teile dem Originalsatz zu (Satzzeichen dazwischen bleiben erhalten).
 * Liefert null, wenn die Teile nicht genau den Satz ergeben.
 */
export function layoutGloss(jp: string, parts: GlossPart[]): LayoutItem[] | null {
  const out: LayoutItem[] = [];
  let pos = 0;
  const eatPunct = () => {
    let p = '';
    while (pos < jp.length && PUNCT.test(jp[pos])) p += jp[pos++];
    if (p.trim()) out.push({ punct: p.trim() });
  };
  for (let i = 0; i < parts.length; i++) {
    eatPunct();
    if (!parts[i][0] || !jp.startsWith(parts[i][0], pos)) return null;
    pos += parts[i][0].length;
    out.push({ part: i });
  }
  eatPunct();
  return pos === jp.length ? out : null;
}

const tokens = (kana: string) =>
  kana
    .split(/\s+/)
    .map((t) => t.replace(PUNCT_ALL, ''))
    .filter(Boolean);

const ROLES = new Set<string>(ROLE_ORDER);

/** Prüft einen Eintrag gegen den Satz. Leere Liste = in Ordnung. */
export function validateGloss(entry: GlossEntry, s: Sentence): string[] {
  const [jp, parts, de] = entry;
  const errs: string[] = [];
  if (jp !== s.jp) errs.push(`jp passt nicht: ${jp} ≠ ${s.jp}`);
  if (!parts.length) errs.push('keine Teile');
  if (!layoutGloss(s.jp, parts)) errs.push(`Teile ergeben nicht den Satz: ${parts.map((p) => p[0]).join('|')} ≠ ${s.jp}`);
  const want = tokens(s.kana).join(' ');
  const got = parts.flatMap((p) => tokens(p[1])).join(' ');
  if (want !== got) errs.push(`Kana-Wörter passen nicht: „${got}“ ≠ „${want}“ (Teile müssen ganze Wörter aus kana enthalten)`);
  parts.forEach((p, i) => {
    if (p.length < 4 || p.length > 5) errs.push(`Teil ${i + 1}: falsche Länge`);
    if (!ROLES.has(p[3])) errs.push(`Teil ${i + 1} (${p[0]}): unbekannte Rolle ${p[3]}`);
    if (!p[2]?.trim()) errs.push(`Teil ${i + 1} (${p[0]}): Bedeutung fehlt`);
    else if (p[2].length > 32) errs.push(`Teil ${i + 1} (${p[0]}): Bedeutung zu lang (max. 32 Zeichen)`);
    if (PUNCT.test(p[0].replace(/[,…]/g, '')) && !/^[\d,]+/.test(p[0])) errs.push(`Teil ${i + 1} (${p[0]}): Satzzeichen gehören nicht in Teile`);
  });
  if (stripGlossDe(de) !== s.de) errs.push(`Übersetzung ohne Markierung ≠ de: „${stripGlossDe(de)}“ ≠ „${s.de}“`);
  if (/[{}]/.test(stripGlossDe(de))) errs.push(`kaputte Markierung in „${de}“`);
  let marks = 0;
  for (const m of de.matchAll(/\{([^{}|]+)\|([^{}]+)\}/g)) {
    marks++;
    if (resolveRef(parts, m[2]) < 0) errs.push(`Verweis „${m[2]}“ nicht eindeutig/unbekannt (Text eines Teils oder #n)`);
  }
  if (!marks) errs.push('keine Markierung in der Übersetzung');
  return errs;
}

/** Index: Satz (jp + de) → Eintrag. */
export function buildGlossIndex(entries: GlossEntry[]) {
  const map = new Map<string, GlossEntry>();
  const byJp = new Map<string, GlossEntry>();
  for (const e of entries) {
    map.set(`${e[0]}\n${stripGlossDe(e[2])}`, e);
    if (!byJp.has(e[0])) byJp.set(e[0], e);
  }
  return (s: Sentence): GlossEntry | null => map.get(`${s.jp}\n${s.de}`) ?? byJp.get(s.jp) ?? null;
}
