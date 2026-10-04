// Hörtraining: Wörter oder ganze Sätze hören und verstehen – ohne Text (Ohr schulen).
import { useMemo, useState } from 'react';
import { SpeakButton } from '../components/Audio';
import { Choices, Feedback, MeaningChoices } from '../components/Quiz';
import { Finish, Header, JpText, ProgressBar, Segmented, sample, shuffle } from '../components/ui';
import { allItems, sentencePool, sayText } from '../data';
import type { LearnItem, Level } from '../data/types';
import { navigate, useRoute } from '../lib/router';
import { addXP, getState, isKnown, markDone, useAppState } from '../lib/store';

const ROUNDS = 10;

type Mode = 'words' | 'sentences';

export function Listening() {
  const { params } = useRoute();
  const state = useAppState();
  const [mode, setMode] = useState<Mode>((params.get('mode') as Mode) ?? 'words');
  const [level, setLevel] = useState<Level>((Number(params.get('level')) as Level) || state.level);
  const [started, setStarted] = useState(false);
  const [session, setSession] = useState(0);
  const again = () => setSession((x) => x + 1);

  if (!started) {
    return (
      <>
        <Header title="Hörtraining" subtitle="Nur hören – kein Text. Das schult dein Ohr." />
        <div className="stack">
          <div className="card stack">
            <div className="field-label">Was möchtest du hören?</div>
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: 'words', label: 'Wörter' },
                { value: 'sentences', label: 'Sätze' },
              ]}
            />
            <div className="field-label">Niveau</div>
            <Segmented
              value={level}
              onChange={(v) => setLevel(v)}
              options={[
                { value: 1, label: 'Einsteiger' },
                { value: 2, label: 'Grundstufe' },
                { value: 3, label: 'Fortgeschr.' },
              ]}
            />
          </div>
          <p className="muted small">
            💡 Tipp: Erst zweimal normal hören, dann – falls nötig – langsam (🐢). Rate ruhig: Fehler sind Teil des Lernens.
          </p>
          <button className="btn btn-primary btn-large btn-block" onClick={() => setStarted(true)}>
            Start
          </button>
          <button className="btn btn-block" onClick={() => navigate('/pairs')}>
            👂 Feine Unterschiede hören (Minimalpaare)
          </button>
        </div>
      </>
    );
  }

  return mode === 'words' ? (
    <WordRound key={session} level={level} onAgain={again} />
  ) : (
    <SentenceRound key={session} level={level} onAgain={again} />
  );
}

function WordRound({ level, onAgain }: { level: Level; onAgain: () => void }) {
  const items = useMemo(() => {
    const s = getState();
    const levelItems = allItems.filter((i) => i.level === level);
    const known = levelItems.filter((i) => isKnown(s, i.id));
    // Bevorzugt Bekanntes (Festigen), ergänzt um Neues (neugierig machen).
    const pick = [...sample(known, 7), ...sample(levelItems.filter((i) => !isKnown(s, i.id)), ROUNDS)];
    return pick.slice(0, ROUNDS);
  }, [level]);
  return <QuizRunner items={items} doneKey={`listen:words:${level}`} level={level} onAgain={onAgain} />;
}

function QuizRunner({
  items,
  doneKey,
  level,
  onAgain,
}: {
  items: LearnItem[];
  doneKey: string;
  level: Level;
  onAgain: () => void;
}) {
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);

  if (i >= items.length) {
    return (
      <>
        <Header title="Hörtraining" />
        <Finish score={correct / items.length} xp={correct * 2}>
          <button className="btn btn-primary btn-block" onClick={onAgain}>
            Noch eine Runde
          </button>
        </Finish>
      </>
    );
  }
  const item = items[i];
  return (
    <>
      <Header title="Was hörst du?" subtitle="Wörter" />
      <ProgressBar value={i} max={items.length} />
      <div className="lesson-stage" key={i}>
        <SpeakButton text={sayText(item)} size="xl" autoPlay slowButton />
        <div style={{ width: '100%' }}>
          <MeaningChoices
            item={item}
            pool={allItems.filter((x) => x.level === level)}
            onAnswer={(ok) => {
              setAnswer(ok);
              if (ok) setCorrect((c) => c + 1);
            }}
          />
        </div>
        {answer !== null && (
          <div className="stack" style={{ width: '100%' }}>
            <Feedback ok={answer} />
            <JpText s={item} center showDe />
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                const last = i + 1 >= items.length;
                if (last) {
                  const total = correct;
                  markDone(doneKey, total / items.length);
                  addXP(total * 2);
                }
                setAnswer(null);
                setI(i + 1);
              }}
            >
              Weiter
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SentenceRound({ level, onAgain }: { level: Level; onAgain: () => void }) {
  const pool = useMemo(() => sentencePool(level), [level]);
  const rounds = useMemo(() => {
    const picked = sample(pool, ROUNDS);
    return picked.map((s) => {
      const wrong = sample(
        pool.filter((p) => p.de !== s.de),
        3,
      ).map((p) => p.de);
      return { s, options: shuffle([s.de, ...wrong]) };
    });
  }, [pool]);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);

  if (i >= rounds.length) {
    return (
      <>
        <Header title="Hörtraining" />
        <Finish score={correct / rounds.length} xp={correct * 3}>
          <button className="btn btn-primary btn-block" onClick={onAgain}>
            Noch eine Runde
          </button>
        </Finish>
      </>
    );
  }
  const { s, options } = rounds[i];
  return (
    <>
      <Header title="Was bedeutet der Satz?" subtitle="Sätze" />
      <ProgressBar value={i} max={rounds.length} />
      <div className="lesson-stage" key={i}>
        <SpeakButton text={s.jp} size="xl" autoPlay slowButton />
        <div style={{ width: '100%' }}>
          <Choices
            options={options}
            correct={s.de}
            onAnswer={(ok) => {
              setAnswer(ok);
              if (ok) setCorrect((c) => c + 1);
            }}
          />
        </div>
        {answer !== null && (
          <div className="stack" style={{ width: '100%' }}>
            <Feedback ok={answer} />
            <JpText s={s} center showDe />
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                if (i + 1 >= rounds.length) {
                  markDone(`listen:sentences:${level}`, correct / rounds.length);
                  addXP(correct * 3);
                }
                setAnswer(null);
                setI(i + 1);
              }}
            >
              Weiter
            </button>
          </div>
        )}
      </div>
    </>
  );
}
