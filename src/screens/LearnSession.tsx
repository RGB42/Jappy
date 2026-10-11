// Neue Wörter/Ausdrücke lernen: Hören → Verstehen → Nachsprechen → Abrufen.
import { useMemo, useState } from 'react';
import { SpeakButton, SpeechCheck, say } from '../components/Audio';
import { Feedback, MeaningChoices } from '../components/Quiz';
import { ResumeBanner } from '../components/Resume';
import { Finish, Header, JpText, ProgressBar, shuffle } from '../components/ui';
import { allItems, itemById, sayText } from '../data';
import type { LearnItem } from '../data/types';
import { idList, useRouteResume } from '../lib/resume';
import { back, navigate, useRoute } from '../lib/router';
import { addXP, introduceItems, useSettings } from '../lib/store';

type Phase = 'intro' | 'quiz' | 'speak' | 'done';

const itemCodec = idList((id) => itemById.get(id), (x: LearnItem) => x.id);

export function LearnSession() {
  const { params } = useRoute();
  const items = useMemo(
    () => (params.get('items') ?? '').split(',').map((id) => itemById.get(id)).filter(Boolean) as LearnItem[],
    [params],
  );
  // Phase, Position und Reihenfolge werden gespeichert → nach Neuladen oder später weitermachen.
  const r = useRouteResume(`Neue Ausdrücke: ${items.map((i) => i.de).slice(0, 2).join(', ')}${items.length > 2 ? ' …' : ''}`);
  const [phase, setPhase] = r.field<Phase>('phase', 'intro');
  const [index, setIndex] = r.field('index', 0);
  const [queue, setQueue] = r.field<LearnItem[]>('queue', [], itemCodec);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [mistakes, setMistakes] = r.field('mistakes', 0);
  const [heard, setHeard] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const settings = useSettings();

  if (!items.length) {
    return (
      <>
        <Header title="Lernen" />
        <p className="muted">Keine Inhalte gefunden.</p>
      </>
    );
  }

  const total = items.length * 3;
  const progress = phase === 'intro' ? index : phase === 'quiz' ? items.length + Math.min(index, items.length) : phase === 'speak' ? items.length * 2 + index : total;
  r.progress(progress, total);

  const next = () => {
    setAnswered(null);
    setHeard(false);
    setRevealed(false);
    if (phase === 'intro') {
      if (index + 1 < items.length) setIndex(index + 1);
      else {
        setQueue(shuffle(items));
        setIndex(0);
        setPhase('quiz');
      }
    } else if (phase === 'quiz') {
      if (index + 1 < queue.length) setIndex(index + 1);
      else {
        setQueue(shuffle(items));
        setIndex(0);
        setPhase('speak');
      }
    } else if (phase === 'speak') {
      if (index + 1 < queue.length) setIndex(index + 1);
      else finish();
    }
  };

  const finish = () => {
    r.finish();
    introduceItems(items.map((i) => i.id));
    addXP(items.length * 5);
    setPhase('done');
  };

  const title = { intro: 'Neu: Hören & Nachsprechen', quiz: 'Was bedeutet das?', speak: 'Jetzt du: Sag es auf Japanisch', done: 'Fertig' }[phase];

  return (
    <>
      <Header title={title} subtitle={phase !== 'done' ? `${items.length} neue Ausdrücke` : undefined} />
      {phase !== 'done' && <ResumeBanner r={r} />}
      {phase !== 'done' && <ProgressBar value={progress} max={total} />}

      {phase === 'intro' && (
        <IntroCard
          key={items[index].id}
          item={items[index]}
          heard={heard || !settings.audioFirst}
          onHeard={() => setHeard(true)}
          onNext={next}
        />
      )}

      {phase === 'quiz' && queue[index] && (
        <div className="lesson-stage" key={`q-${index}-${queue[index].id}`}>
          <SpeakButton text={sayText(queue[index])} size="xl" autoPlay slowButton />
          <p className="muted">Hör zu und wähle die Bedeutung.</p>
          <div style={{ width: '100%' }}>
            <MeaningChoices
              item={queue[index]}
              pool={allItems}
              onAnswer={(ok) => {
                setAnswered(ok);
                if (!ok) {
                  setMistakes((m) => m + 1);
                  setQueue((q) => [...q, q[index]]);
                }
              }}
            />
          </div>
          {answered !== null && (
            <div className="stack" style={{ width: '100%' }}>
              <Feedback ok={answered}>{answered ? 'Richtig! ✓' : 'Nicht ganz – kommt gleich noch mal.'}</Feedback>
              <JpText s={queue[index]} center showDe />
              <button className="btn btn-primary btn-block" onClick={next}>
                Weiter
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'speak' && queue[index] && (
        <div className="lesson-stage" key={`s-${index}`}>
          <div className="card col center gap" style={{ width: '100%' }}>
            <div className="muted small">Wie sagt man …</div>
            <h2 style={{ margin: 0 }}>„{queue[index].de}“</h2>
          </div>
          <div style={{ width: '100%' }}>
            <SpeechCheck targets={[queue[index].jp, queue[index].kana]} prompt="Sag es laut" />
          </div>
          {revealed ? (
            <div className="col center gap">
              <JpText s={queue[index]} center size="lg" />
              <SpeakButton text={sayText(queue[index])} slowButton />
            </div>
          ) : (
            <button
              className="btn btn-ghost"
              onClick={() => {
                setRevealed(true);
                void say(sayText(queue[index]));
              }}
            >
              Lösung anhören
            </button>
          )}
          <button className="btn btn-primary btn-block" onClick={next}>
            Weiter
          </button>
        </div>
      )}

      {phase === 'done' && (
        <Finish title="Neue Ausdrücke gelernt!" xp={items.length * 5} score={1 - mistakes / (items.length * 2)}>
          <p className="muted">
            Sie sind jetzt in deinen Wiederholungen. Jappy fragt sie kurz vor dem Vergessen wieder ab – erst hörend, dann
            sprechend.
          </p>
          <div className="col gap">
            <button className="btn btn-primary btn-block" onClick={() => back('/path')}>
              Weiter
            </button>
            <button className="btn btn-block" onClick={() => navigate('/audio', { items: items.map((i) => i.id).join(',') })}>
              🎧 Als Audio-Lektion wiederholen
            </button>
          </div>
        </Finish>
      )}
    </>
  );
}

function IntroCard({
  item,
  heard,
  onHeard,
  onNext,
}: {
  item: LearnItem;
  heard: boolean;
  onHeard: () => void;
  onNext: () => void;
}) {
  return (
    <div className="lesson-stage">
      <SpeakButton text={sayText(item)} size="xl" autoPlay slowButton onPlayed={onHeard} />
      {!heard ? (
        <p className="muted">Hör genau hin … (tippe zum Wiederholen)</p>
      ) : (
        <>
          <JpText s={item} size="lg" center />
          <h2 style={{ margin: 0 }}>{item.de}</h2>
          {item.pos && <span className="chip">{item.pos}</span>}
          {item.note && <p className="muted small">💡 {item.note}</p>}
          {item.example && (
            <div className="card row gap" style={{ width: '100%', textAlign: 'left' }}>
              <SpeakButton text={item.example.jp} size="sm" />
              <div className="grow">
                <JpText s={item.example} size="sm" showDe />
              </div>
            </div>
          )}
        </>
      )}
      <div style={{ width: '100%' }}>
        <SpeechCheck targets={[item.jp, item.kana]} />
      </div>
      <button className="btn btn-primary btn-block" onClick={onNext}>
        Weiter
      </button>
    </div>
  );
}
