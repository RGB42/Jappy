// Wortschatz nach Thema und Niveau – antippen zum Hören, gezielt lernen.
import { useMemo, useState } from 'react';
import { SpeakButton } from '../components/Audio';
import { Header, JpText, Segmented } from '../components/ui';
import { TOPICS, itemsFor, sayText } from '../data';
import type { Level, TopicId } from '../data/types';
import { cardId, isMature } from '../lib/srs';
import { navigate } from '../lib/router';
import { isKnown, useAppState } from '../lib/store';

export function Words() {
  const state = useAppState();
  const [level, setLevel] = useState<Level>(state.level);
  const [topic, setTopic] = useState<TopicId | ''>('');
  const [open, setOpen] = useState<string | null>(null);
  const items = useMemo(() => itemsFor(topic || undefined, level), [topic, level]);
  const unknown = items.filter((i) => !isKnown(state, i.id));

  const status = (id: string) => {
    const c = state.cards[cardId(id, 'speak')];
    if (!isKnown(state, id)) return null;
    if (c && isMature(c)) return <span className="chip chip-ok">gefestigt</span>;
    return <span className="chip chip-blue">gelernt</span>;
  };

  return (
    <>
      <Header title="Wortschatz" subtitle={`${items.length} Einträge · ${items.length - unknown.length} gelernt`} />
      <div className="stack">
        <Segmented
          value={level}
          onChange={setLevel}
          options={[
            { value: 1, label: 'Einsteiger' },
            { value: 2, label: 'Grundstufe' },
            { value: 3, label: 'Fortgeschr.' },
          ]}
        />
        <select value={topic} onChange={(e) => setTopic(e.target.value as TopicId | '')} aria-label="Thema">
          <option value="">Alle Themen</option>
          {(Object.keys(TOPICS) as TopicId[]).map((t) => (
            <option key={t} value={t}>
              {TOPICS[t].icon} {TOPICS[t].label}
            </option>
          ))}
        </select>
        {unknown.length > 0 && (
          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate('/learn', { items: unknown.slice(0, 6).map((i) => i.id).join(',') })}
          >
            {Math.min(6, unknown.length)} neue davon lernen
          </button>
        )}
      </div>
      <div className="list mt">
        {items.map((i) => (
          <div key={i.id} className="list-item" style={{ alignItems: 'flex-start' }}>
            <SpeakButton text={sayText(i)} size="sm" />
            <div
              className="grow"
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              onClick={() => setOpen(open === i.id ? null : i.id)}
              onKeyDown={(e) => e.key === 'Enter' && setOpen(open === i.id ? null : i.id)}
            >
              <div className="row between gap-s">
                <JpText s={i} size="sm" />
                {status(i.id)}
              </div>
              <div className="small">{i.de}</div>
              {open === i.id && (
                <div className="stack mt small">
                  {i.pos && <span className="chip">{i.pos}</span>}
                  {i.note && <div className="muted">💡 {i.note}</div>}
                  {i.example && (
                    <div className="row gap" onClick={(e) => e.stopPropagation()}>
                      <SpeakButton text={i.example.jp} size="sm" />
                      <JpText s={i.example} size="sm" showDe />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
