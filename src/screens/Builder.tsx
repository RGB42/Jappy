// Satzbau: Bausteine antippen und in die richtige Reihenfolge bringen (Lernen durch Ausprobieren).
import { useMemo, useState } from 'react';
import { SpeakButton, SpeechCheck, say } from '../components/Audio';
import { Feedback, registerAnswer } from '../components/Quiz';
import { ResumeBanner } from '../components/Resume';
import { Finish, Header, JpText, ProgressBar, shuffle } from '../components/ui';
import { grammar, grammarById } from '../data';
import type { BuildExercise, Level, Tile } from '../data/types';
import { PARTICLE_SOUND, exerciseSentence } from '../lib/sentences';
import { toRomaji } from '../lib/kana';
import { useRouteResume, type Codec } from '../lib/resume';
import { back, useRoute } from '../lib/router';
import { addXP, markDone, useSettings } from '../lib/store';

// Übungen haben keine eigene ID → „Grammatik-ID#Nummer“.
const exerciseKeys = new Map<BuildExercise, string>();
const exerciseByKey = new Map<string, BuildExercise>();
for (const g of grammar)
  g.exercises.forEach((ex, n) => {
    exerciseKeys.set(ex, `${g.id}#${n}`);
    exerciseByKey.set(`${g.id}#${n}`, ex);
  });
const exerciseCodec: Codec<BuildExercise[]> = {
  save: (list) => list.map((ex) => exerciseKeys.get(ex) ?? ''),
  load: (raw) => {
    if (!Array.isArray(raw)) return undefined;
    const out = raw.map((k) => exerciseByKey.get(String(k)));
    return out.length && out.every(Boolean) ? (out as BuildExercise[]) : undefined;
  },
};

export function Builder() {
  const { params } = useRoute();
  const id = params.get('id');
  const level = Number(params.get('level')) as Level;
  const g = id ? grammarById.get(id) : undefined;
  const initial = useMemo(() => {
    if (g) return g.exercises;
    return shuffle(grammar.filter((x) => !level || x.level === level).flatMap((x) => x.exercises)).slice(0, 8);
  }, [g, level]);

  // Reihenfolge, Position und Fehler werden gespeichert → später weitermachen.
  const r = useRouteResume(g ? `Satzbau: ${g.title}` : 'Satzbau-Mix');
  const [queue, setQueue] = r.field<BuildExercise[]>('queue', initial, exerciseCodec);
  const [i, setI] = r.field('i', 0);
  const [mistakes, setMistakes] = r.field('mistakes', 0);
  const [finished, setFinished] = useState(false);
  r.progress(i, queue.length);

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
      <ResumeBanner r={r} />
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
            r.finish();
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
          <button data-autoscroll className="btn btn-primary btn-block" onClick={() => onDone(result)}>
            Weiter
          </button>
        </div>
      )}
    </div>
  );
}
