// Satzbau: Bausteine antippen und in die richtige Reihenfolge bringen (Lernen durch Ausprobieren).
import { useMemo, useState } from 'react';
import { SpeakButton, SpeechCheck, say } from '../components/Audio';
import { Feedback, registerAnswer } from '../components/Quiz';
import { Finish, Header, JpText, ProgressBar, shuffle } from '../components/ui';
import { grammar, grammarById } from '../data';
import type { BuildExercise, Level, Sentence, Tile } from '../data/types';
import { toRomaji } from '../lib/kana';
import { back, useRoute } from '../lib/router';
import { addXP, markDone, useSettings } from '../lib/store';

// Einzeln vorgelesen klingen diese Partikeln sonst wie „ha/he/wo“.
const PARTICLE_SOUND: Record<string, string> = { は: 'わ', へ: 'え', を: 'お' };

export function exerciseSentence(ex: BuildExercise): Sentence {
  const end = /[?？]\s*$/.test(ex.de) ? '？' : '。';
  return {
    jp: ex.tiles.map((t) => t.jp).join('') + end,
    kana: ex.tiles.map((t) => t.kana).join(' ') + end,
    de: ex.de,
  };
}

export function Builder() {
  const { params } = useRoute();
  const id = params.get('id');
  const level = Number(params.get('level')) as Level;
  const g = id ? grammarById.get(id) : undefined;
  const initial = useMemo(() => {
    if (g) return g.exercises;
    return shuffle(grammar.filter((x) => !level || x.level === level).flatMap((x) => x.exercises)).slice(0, 8);
  }, [g, level]);

  const [queue, setQueue] = useState<BuildExercise[]>(initial);
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!initial.length) return <Header title="Satzbau" />;

  if (finished) {
    const score = Math.max(0, 1 - mistakes / initial.length);
    return (
      <>
        <Header title="Satzbau" />
        <Finish score={score} xp={10}>
          <div className="col gap">
            <button className="btn btn-primary btn-block" onClick={() => back('/grammar')}>
              Weiter
            </button>
          </div>
        </Finish>
      </>
    );
  }

  const ex = queue[i];
  return (
    <>
      <Header title={g ? g.title : 'Satzbau-Mix'} subtitle={g?.pattern} />
      <ProgressBar value={i} max={queue.length} />
      <Exercise
        key={i}
        ex={ex}
        onDone={(ok) => {
          if (!ok) {
            setMistakes((m) => m + 1);
            setQueue((q) => [...q, ex]);
          }
          if (i + 1 >= queue.length + (ok ? 0 : 1)) {
            if (g) markDone(`grammar:${g.id}`, Math.max(0, 1 - (mistakes + (ok ? 0 : 1)) / initial.length));
            addXP(10);
            setFinished(true);
          } else setI(i + 1);
        }}
      />
    </>
  );
}

function Exercise({ ex, onDone }: { ex: BuildExercise; onDone: (ok: boolean) => void }) {
  const settings = useSettings();
  const pool = useMemo(
    () => shuffle([...ex.tiles, ...(ex.distractors ?? [])]).map((tile, id) => ({ id, tile })),
    [ex],
  );
  const [answer, setAnswer] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const sentence = exerciseSentence(ex);

  const label = (t: Tile) => (settings.script === 'kana' ? t.kana : t.jp);
  const tileById = (id: number) => pool.find((p) => p.id === id)!.tile;

  const check = () => {
    const built = answer.map((id) => tileById(id).jp).join('');
    const ok = built === ex.tiles.map((t) => t.jp).join('');
    setResult(ok);
    registerAnswer(ok);
    void say(sentence.jp);
  };

  const renderTile = (t: Tile) => (
    <>
      <span lang="ja">{label(t)}</span>
      {settings.romaji && <span className="tile-romaji">{toRomaji(t.kana)}</span>}
    </>
  );

  return (
    <div className="stack mt">
      <div className="card">
        <div className="muted small">Bilde den Satz:</div>
        <h2 style={{ margin: '4px 0 0' }}>„{ex.de}“</h2>
      </div>

      <div className="build-answer" aria-label="Deine Antwort">
        {answer.map((id) => (
          <button key={id} className="build-tile" onClick={() => result === null && setAnswer((a) => a.filter((x) => x !== id))}>
            {renderTile(tileById(id))}
          </button>
        ))}
        {!answer.length && <span className="muted small">Tippe die Bausteine in der richtigen Reihenfolge an.</span>}
      </div>

      <div className="build-pool">
        {pool.map(({ id, tile }) => (
          <button
            key={id}
            className={`build-tile ${answer.includes(id) ? 'used' : ''}`}
            disabled={result !== null}
            onClick={() => {
              setAnswer((a) => [...a, id]);
              void say(PARTICLE_SOUND[tile.kana] ?? tile.jp);
            }}
          >
            {renderTile(tile)}
          </button>
        ))}
      </div>

      {result === null ? (
        <button className="btn btn-primary btn-block btn-large" disabled={answer.length !== ex.tiles.length} onClick={check}>
          Prüfen
        </button>
      ) : (
        <div className="stack">
          <Feedback ok={result}>{result ? 'Richtig! Hör zu und sprich mit.' : 'Fast! So ist es richtig:'}</Feedback>
          <div className="card row gap">
            <SpeakButton text={sentence.jp} slowButton />
            <div className="grow">
              <JpText s={sentence} size="md" />
            </div>
          </div>
          <SpeechCheck targets={[sentence.jp, sentence.kana]} compact prompt="Sprich den Satz" />
          <button className="btn btn-primary btn-block" onClick={() => onDone(result)}>
            Weiter
          </button>
        </div>
      )}
    </div>
  );
}
