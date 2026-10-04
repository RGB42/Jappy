// Kana-Übersicht: Zeichen antippen und hören, Reihen auswählen und üben.
import { useState } from 'react';
import { say } from '../components/Audio';
import { Header, Segmented } from '../components/ui';
import { kanaMnemonic } from '../data';
import { KANA_GROUP_LABEL, kanaRomaji, kanaRows, type KanaRow, type KanaScript } from '../data/kana';
import { toKatakana } from '../lib/kana';
import { navigate, useRoute } from '../lib/router';
import { useAppState } from '../lib/store';

export function KanaHub() {
  const { params } = useRoute();
  const state = useAppState();
  const [script, setScript] = useState<KanaScript>((params.get('script') as KanaScript) ?? 'hiragana');
  const [selected, setSelected] = useState<string[]>(['a', 'k']);
  const [focus, setFocus] = useState<string | null>(null);

  const conv = (k: string) => (script === 'katakana' ? toKatakana(k) : k);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const go = (path: string, mode?: string) => navigate(path, { script, rows: selected.join(','), mode });

  const groups: KanaRow['group'][] = ['basic', 'dakuten', 'yoon'];

  return (
    <>
      <Header title="Kana" subtitle="Die Silbenschriften – erst hören, dann lesen, dann schreiben" />
      <Segmented
        value={script}
        onChange={setScript}
        options={[
          { value: 'hiragana', label: 'Hiragana あ' },
          { value: 'katakana', label: 'Katakana ア' },
        ]}
      />
      <p className="muted small mt">
        Tippe ein Zeichen zum Anhören. {script === 'hiragana' ? 'Hiragana sind für japanische Wörter und Endungen.' : 'Katakana sind für Lehnwörter wie コーヒー (Kaffee).'}
      </p>

      {focus && (
        <div className="card row gap mb" style={{ alignItems: 'flex-start' }}>
          <div lang="ja" style={{ fontSize: '3rem', lineHeight: 1, fontFamily: 'var(--font-jp)' }}>
            {focus}
          </div>
          <div className="grow">
            <b>{kanaRomaji(focus)}</b>
            <div className="muted small">{kanaMnemonic(focus) ?? 'Hör genau hin und sprich es laut nach.'}</div>
          </div>
        </div>
      )}

      {groups.map((g) => (
        <section key={g}>
          <div className="section-title">{KANA_GROUP_LABEL[g]}</div>
          <div className="stack">
            {kanaRows
              .filter((r) => r.group === g)
              .map((row) => (
                <div key={row.id} className="row gap" style={{ alignItems: 'stretch' }}>
                  <button
                    className={`row-toggle ${selected.includes(row.id) ? 'on' : ''}`}
                    onClick={() => toggle(row.id)}
                    style={{ width: 54, flexShrink: 0, padding: 0 }}
                    aria-pressed={selected.includes(row.id)}
                    title={`${row.label} zum Üben auswählen`}
                  >
                    {selected.includes(row.id) ? '✓' : '+'}
                  </button>
                  <div className={`kana-grid grow ${row.group === 'yoon' ? 'cols-6' : ''}`}>
                    {row.chars.map((k, i) =>
                      k ? (
                        <button
                          key={k}
                          className="kana-cell"
                          onClick={() => {
                            setFocus(conv(k));
                            void say(conv(k));
                          }}
                        >
                          <span className="k" lang="ja">
                            {conv(k)}
                          </span>
                          <span className="r">{kanaRomaji(k)}</span>
                          <span className="dots">
                            {[1, 3, 5].map((t) => (
                              <i key={t} className={(state.kana[conv(k)] ?? 0) >= t ? 'on' : ''} />
                            ))}
                          </span>
                        </button>
                      ) : (
                        <span key={`e${i}`} className="kana-cell empty" />
                      ),
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}

      <div style={{ height: 150 }} />
      <div
        className="card"
        style={{ position: 'fixed', left: 16, right: 16, bottom: 16, maxWidth: 648, margin: '0 auto', zIndex: 6 }}
      >
        <div className="muted small mb">{selected.length ? `${selected.length} Reihe(n) ausgewählt` : 'Wähle Reihen mit + aus'}</div>
        <div className="row gap-s">
          <button className="btn btn-primary grow" disabled={!selected.length} onClick={() => go('/kana/quiz', 'listen')}>
            👂 Hören
          </button>
          <button className="btn btn-accent grow" disabled={!selected.length} onClick={() => go('/kana/quiz', 'read')}>
            👀 Lesen
          </button>
          <button className="btn grow" disabled={!selected.length} onClick={() => go('/kana/draw')}>
            ✍️ Schreiben
          </button>
        </div>
      </div>
    </>
  );
}
