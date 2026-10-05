// Satzbau farbig: japanische Satzteile und ihre deutschen Entsprechungen in derselben Farbe.
// Antippen hebt ein Paar hervor. Die Daten werden erst bei Bedarf geladen (eigener Code-Chunk).
import { useEffect, useState } from 'react';
import type { GlossEntry, GlossRole, Sentence } from '../data/types';
import { ROLE_LABEL, ROLE_ORDER, isParticle, layoutGloss, parseGlossDe, partRomaji } from '../lib/gloss';
import { useSettings } from '../lib/store';

type Finder = (s: Sentence) => GlossEntry | null;
let finder: Finder | null = null;
let loading: Promise<Finder> | null = null;

function loadGlosses(): Promise<Finder> {
  loading ??= import('../data/glosses').then((m) => (finder = m.findGloss));
  return loading;
}

/** Satzanalyse zum Satz – null, solange sie lädt oder es keine gibt. */
export function useGloss(s: Sentence | undefined): GlossEntry | null {
  const [find, setFind] = useState<Finder | null>(finder);
  useEffect(() => {
    if (!find) void loadGlosses().then((f) => setFind(() => f), () => {});
  }, [find]);
  return s && find ? find(s) : null;
}

const hasKanji = (s: string) => /[一-鿿々]/.test(s);

export function GlossText({ s, entry }: { s: Sentence; entry: GlossEntry }) {
  const settings = useSettings();
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => setActive(null), [entry]);

  const parts = entry[1];
  const layout = layoutGloss(s.jp, parts);
  if (!layout) return null;
  const units: { part: number; lead: string; trail: string }[] = [];
  let lead = '';
  for (const item of layout) {
    if ('part' in item) {
      units.push({ part: item.part, lead, trail: '' });
      lead = '';
    } else if (units.length) units[units.length - 1].trail += item.punct;
    else lead += item.punct;
  }
  const de = parseGlossDe(entry[2], parts);
  const furigana = settings.script === 'both' && parts.some((p) => hasKanji(p[0]));
  const roles = ROLE_ORDER.filter((r) => parts.some((p) => p[3] === r));
  const hasFree = de.some((d) => d.part === undefined && /\p{L}/u.test(d.text));
  const linked = (i: number | undefined) => active === null || i === active;
  const toggle = (i: number) => setActive((a) => (a === i ? null : i));
  const roleClass = (r: GlossRole) => `role-${r}`;

  return (
    <div className={`gloss ${furigana ? 'has-furi' : ''}`}>
      <div className="gloss-jp" lang="ja">
        {units.map(({ part: i, lead, trail }) => {
          const p = parts[i];
          const kana = p[1].replace(/ /g, '');
          return (
            // Satzzeichen hängen am Wort, damit sie nie allein in eine neue Zeile rutschen.
            <span key={i} className="gloss-unit">
              {lead && <span className="gloss-punct">{lead}</span>}
              <button
                type="button"
                className={`gloss-chunk ${roleClass(p[3])} ${isParticle(p) ? 'is-particle' : ''} ${active === i ? 'is-active' : ''} ${linked(i) ? '' : 'is-dim'}`}
                onClick={() => toggle(i)}
                aria-pressed={active === i}
                title={`${p[0]} – ${p[2]} (${ROLE_LABEL[p[3]]})`}
              >
                {furigana && <span className="gloss-furi">{hasKanji(p[0]) ? kana : '\u00a0'}</span>}
                <span className="gloss-word">{settings.script === 'kana' ? kana : p[0]}</span>
                {settings.romaji && <span className="gloss-romaji">{partRomaji(p)}</span>}
                <span className="gloss-mean" lang="de">
                  {p[2]}
                </span>
              </button>
              {trail && <span className="gloss-punct">{trail}</span>}
            </span>
          );
        })}
      </div>

      <div className="gloss-de">
        {de.map((d, k) =>
          d.part === undefined ? (
            <span key={k} className={`gloss-free ${active === null ? '' : 'is-dim'}`}>
              {d.text}
            </span>
          ) : (
            <button
              key={k}
              type="button"
              className={`gloss-seg ${roleClass(parts[d.part][3])} ${active === d.part ? 'is-active' : ''} ${linked(d.part) ? '' : 'is-dim'}`}
              onClick={() => toggle(d.part!)}
            >
              {d.text}
            </button>
          ),
        )}
      </div>

      <div className="gloss-legend">
        {roles.map((r) => (
          <span key={r} className={`gloss-key ${roleClass(r)}`}>
            {ROLE_LABEL[r]}
          </span>
        ))}
        {hasFree && <span className="gloss-key gloss-key-free">steht nicht im Japanischen</span>}
      </div>
    </div>
  );
}
