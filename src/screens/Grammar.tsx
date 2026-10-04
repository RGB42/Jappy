// Grammatik als Muster: kurz erklären, viele Beispiele hören, dann selbst Sätze bauen.
import { useState } from 'react';
import { SpeakButton, say } from '../components/Audio';
import { Icon } from '../components/Icon';
import { Header, JpText } from '../components/ui';
import { LEVELS, grammar, grammarById } from '../data';
import type { Level } from '../data/types';
import { wait } from '../lib/speech';
import { navigate, useRoute } from '../lib/router';
import { useAppState } from '../lib/store';

export function GrammarList() {
  const state = useAppState();
  return (
    <>
      <Header title="Grammatik-Muster" subtitle="Hören, verstehen, selbst Sätze bauen" />
      {([1, 2, 3] as Level[]).map((level) => (
        <section key={level}>
          <div className="section-title">{LEVELS[level].label}</div>
          <div className="list">
            {grammar
              .filter((g) => g.level === level)
              .map((g) => {
                const done = state.done[`grammar:${g.id}`];
                return (
                  <button key={g.id} className={`list-item ${done ? 'done' : ''}`} onClick={() => navigate('/grammar/point', { id: g.id })}>
                    <span className="grow">
                      <b>{g.title}</b>
                      <div className="muted small" lang="ja">
                        {g.pattern}
                      </div>
                    </span>
                    {done && <span className="chip chip-ok">✓</span>}
                  </button>
                );
              })}
          </div>
        </section>
      ))}
    </>
  );
}

export function GrammarDetail() {
  const { params } = useRoute();
  const g = grammarById.get(params.get('id') ?? '');
  const [playing, setPlaying] = useState<number | null>(null);
  if (!g) return <Header title="Nicht gefunden" />;

  const playAll = async () => {
    for (let i = 0; i < g.examples.length; i++) {
      setPlaying(i);
      await say(g.examples[i].jp);
      await wait(700);
    }
    setPlaying(null);
  };

  return (
    <>
      <Header title={g.title} subtitle={LEVELS[g.level].label} />
      <div className="card card-hero">
        <div lang="ja" style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-jp)' }}>
          {g.pattern}
        </div>
        <p className="muted mt" style={{ marginBottom: 0 }}>
          {g.explanation}
        </p>
      </div>

      <div className="row between mt">
        <div className="section-title" style={{ margin: 0 }}>
          Beispiele – erst hören
        </div>
        <button className="btn btn-small" onClick={playAll} disabled={playing !== null}>
          <Icon name="play" size={16} /> Alle
        </button>
      </div>
      <div className="list mt">
        {g.examples.map((e, i) => (
          <div key={i} className="list-item" style={playing === i ? { outline: '2px solid var(--accent)' } : undefined}>
            <SpeakButton text={e.jp} size="sm" />
            <div className="grow">
              <JpText s={e} size="sm" showDe />
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-l stack">
        <h3>🧩 Ausprobieren</h3>
        <p className="muted small" style={{ margin: 0 }}>
          Baue {g.exercises.length} Sätze aus Bausteinen. Jappy liest jeden fertigen Satz vor – sprich ihn laut mit.
        </p>
        <button className="btn btn-primary btn-block btn-large" onClick={() => navigate('/build', { id: g.id })}>
          Sätze bauen
        </button>
      </div>
    </>
  );
}
