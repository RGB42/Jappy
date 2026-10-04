// Minimalpaare: feine Lautunterschiede hören (langer Vokal, Doppelkonsonant …).
import { useMemo, useState } from 'react';
import { SpeakButton, say } from '../components/Audio';
import { Feedback, registerAnswer } from '../components/Quiz';
import { Finish, Header, JpText, ProgressBar, sample } from '../components/ui';
import { minimalPairs } from '../data';
import { addXP, markDone } from '../lib/store';

const ROUNDS = 10;

export function MinimalPairs() {
  const [session, setSession] = useState(0);
  return <PairRound key={session} onAgain={() => setSession((s) => s + 1)} />;
}

function PairRound({ onAgain }: { onAgain: () => void }) {
  const rounds = useMemo(
    () => sample(minimalPairs, Math.min(ROUNDS, minimalPairs.length)).map((p) => ({ p, target: Math.random() < 0.5 ? 'a' : 'b' as 'a' | 'b' })),
    [],
  );
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<'a' | 'b' | null>(null);
  const [correct, setCorrect] = useState(0);

  if (!rounds.length) return <Header title="Minimalpaare" />;

  if (i >= rounds.length) {
    return (
      <>
        <Header title="Minimalpaare" />
        <Finish score={correct / rounds.length} xp={correct * 2}>
          <p className="muted">Dein Ohr wird mit jeder Runde feiner – genau wie bei Musik.</p>
          <button className="btn btn-primary btn-block" onClick={onAgain}>
            Noch eine Runde
          </button>
        </Finish>
      </>
    );
  }

  const { p, target } = rounds[i];
  const targetS = p[target];
  const answer = (side: 'a' | 'b') => {
    if (chosen) return;
    setChosen(side);
    registerAnswer(side === target);
    if (side === target) setCorrect((c) => c + 1);
  };

  return (
    <>
      <Header title="Welches Wort hörst du?" subtitle={p.feature} />
      <ProgressBar value={i} max={rounds.length} />
      <div className="lesson-stage" key={i}>
        <SpeakButton text={targetS.jp} size="xl" autoPlay slowButton />
        <div className="choices choices-2" style={{ width: '100%' }}>
          {(['a', 'b'] as const).map((side) => {
            const s = p[side];
            const state = !chosen ? '' : side === target ? 'correct' : side === chosen ? 'wrong' : '';
            return (
              <button key={side} className={`choice ${state}`} onClick={() => answer(side)} disabled={!!chosen}>
                <JpText s={s} size="md" center />
                <div className="small muted" style={{ fontWeight: 400 }}>
                  {s.de}
                </div>
              </button>
            );
          })}
        </div>
        {chosen && (
          <div className="stack" style={{ width: '100%' }}>
            <Feedback ok={chosen === target} />
            <div className="row gap center">
              <button className="btn btn-small" onClick={() => say(p.a.jp)}>
                🔊 {p.a.kana}
              </button>
              <button className="btn btn-small" onClick={() => say(p.b.jp)}>
                🔊 {p.b.kana}
              </button>
            </div>
            <p className="muted small center">Vergleiche beide – hörst du den Unterschied?</p>
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                if (i + 1 >= rounds.length) {
                  markDone('pairs', correct / rounds.length);
                  addXP(correct * 2);
                }
                setChosen(null);
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
