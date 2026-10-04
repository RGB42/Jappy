// Wiederholung (Spaced Repetition): Hörkarten und Sprechkarten.
import { useMemo, useState } from 'react';
import { SpeakButton, SpeechCheck, say, type SpeechCheckResult } from '../components/Audio';
import { Empty, Finish, Header, JpText, ProgressBar } from '../components/ui';
import { TOPICS, itemById, sayText } from '../data';
import { parseCardId, previewInterval, type Grade } from '../lib/srs';
import { navigate } from '../lib/router';
import { addXP, dueCards, getState, gradeCard, useSettings } from '../lib/store';

const MAX = 30;

export function Review() {
  const initial = useMemo(
    () =>
      dueCards(getState())
        .filter((c) => itemById.has(parseCardId(c.id).itemId))
        .slice(0, MAX)
        .map((c) => c.id),
    [],
  );
  const [queue, setQueue] = useState(initial);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [suggested, setSuggested] = useState<Grade | null>(null);
  const [stats, setStats] = useState({ done: 0, good: 0 });
  const settings = useSettings();

  if (!initial.length) {
    return (
      <>
        <Header title="Wiederholen" />
        <Empty icon="✅" title="Alles wiederholt!">
          <p className="muted">Gerade ist nichts fällig. Lerne neue Ausdrücke oder trainiere dein Ohr.</p>
          <div className="col gap">
            <button className="btn btn-primary" onClick={() => navigate('/path')}>
              Zum Lernpfad
            </button>
            <button className="btn" onClick={() => navigate('/listen')}>
              Hörtraining
            </button>
          </div>
        </Empty>
      </>
    );
  }

  if (pos >= queue.length) {
    return (
      <>
        <Header title="Wiederholen" />
        <Finish title="Wiederholung abgeschlossen" score={stats.done ? stats.good / stats.done : 1} xp={stats.done * 2 + stats.good}>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/')}>
            Fertig
          </button>
        </Finish>
      </>
    );
  }

  const id = queue[pos];
  const { itemId, mode } = parseCardId(id);
  const item = itemById.get(itemId)!;
  const card = getState().cards[id];

  const grade = (g: Grade) => {
    gradeCard(id, g);
    addXP(g > 0 ? 3 : 1);
    setStats((s) => ({ done: s.done + 1, good: s.good + (g > 0 ? 1 : 0) }));
    // „Nochmal“: Karte kommt am Ende dieser Runde erneut.
    if (g === 0) setQueue((q) => [...q, id]);
    setRevealed(false);
    setSuggested(null);
    setPos((p) => p + 1);
  };

  const onSpoken = (r: SpeechCheckResult) => {
    setSuggested(r.grade === 'perfect' ? 2 : r.grade === 'good' ? 1 : 0);
    setRevealed(true);
    void say(sayText(item));
  };

  return (
    <>
      <Header
        title={mode === 'listen' ? 'Hörkarte' : 'Sprechkarte'}
        subtitle={`${TOPICS[item.topic].icon} ${TOPICS[item.topic].label}`}
        right={<span className="chip">{queue.length - pos}</span>}
      />
      <ProgressBar value={pos} max={queue.length} />

      <div className="lesson-stage" key={`${id}-${pos}`}>
        {mode === 'listen' ? (
          <>
            <SpeakButton text={sayText(item)} size="xl" autoPlay slowButton />
            <p className="muted">Was bedeutet das? Denk an die Antwort, dann auflösen.</p>
            {!settings.audioFirst && !revealed && <JpText s={item} size="lg" center />}
          </>
        ) : (
          <>
            <div className="card col center gap" style={{ width: '100%' }}>
              <div className="muted small">Sag auf Japanisch:</div>
              <h2 style={{ margin: 0 }}>„{item.de}“</h2>
              {item.pos && <span className="chip">{item.pos}</span>}
            </div>
            {!revealed && (
              <div style={{ width: '100%' }}>
                <SpeechCheck targets={[item.jp, item.kana]} onResult={onSpoken} prompt="Sag es laut" />
              </div>
            )}
          </>
        )}

        {revealed ? (
          <div className="stack" style={{ width: '100%' }}>
            <div className="card col center gap">
              <JpText s={item} size="lg" center />
              <h3 style={{ margin: 0 }}>{item.de}</h3>
              {mode === 'speak' && <SpeakButton text={sayText(item)} slowButton />}
              {item.example && (
                <div className="row gap" style={{ textAlign: 'left' }}>
                  <SpeakButton text={item.example.jp} size="sm" />
                  <JpText s={item.example} size="sm" showDe />
                </div>
              )}
            </div>
            <div className="muted small center">Wie gut wusstest du es?</div>
            <div className="grade-buttons">
              {(['Nochmal', 'Schwer', 'Gut', 'Leicht'] as const).map((label, g) => (
                <button
                  key={label}
                  className={`grade-btn g${g}`}
                  onClick={() => grade(g as Grade)}
                  style={suggested === g ? { outline: '2px solid currentColor' } : undefined}
                >
                  {label}
                  <small>{card ? previewInterval(card, g as Grade) : ''}</small>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            className="btn btn-accent btn-block btn-large"
            onClick={() => {
              setRevealed(true);
              if (mode === 'speak') void say(sayText(item));
            }}
          >
            Auflösen
          </button>
        )}
      </div>
    </>
  );
}
