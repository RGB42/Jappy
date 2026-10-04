// Kana-Quiz: Hören → Zeichen wählen, oder Zeichen sehen → Laut wählen. Adaptiv (Leitner-System).
import { useMemo, useState } from 'react';
import { SpeakButton, say } from '../components/Audio';
import { Choices, Feedback } from '../components/Quiz';
import { Finish, Header, ProgressBar, shuffle } from '../components/ui';
import { kanaMnemonic } from '../data';
import { allKana, kanaRomaji, kanaRows, rowChars, soundKey, type KanaScript } from '../data/kana';
import { back, useRoute } from '../lib/router';
import { addXP, getState, markDone, setKanaBox } from '../lib/store';

const ROUNDS = 15;

/** Wählt bevorzugt Zeichen, die noch nicht sitzen (niedriges Leitner-Fach). */
function pickNext(pool: string[], last?: string): string {
  const boxes = getState().kana;
  const weighted = pool.filter((k) => k !== last || pool.length === 1).map((k) => ({ k, w: 6 - (boxes[k] ?? 0) }));
  const total = weighted.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const x of weighted) {
    r -= x.w;
    if (r <= 0) return x.k;
  }
  return weighted[0].k;
}

function distractors(correct: string, pool: string[], script: KanaScript): string[] {
  const used = new Set([soundKey(correct)]);
  const out: string[] = [];
  const candidates = [...shuffle(pool), ...shuffle(allKana(script, ['basic', 'dakuten']))];
  for (const k of candidates) {
    if (out.length >= 3) break;
    const key = soundKey(k);
    if (used.has(key)) continue;
    used.add(key);
    out.push(k);
  }
  return out;
}

export function KanaQuiz() {
  const { params } = useRoute();
  const script = (params.get('script') as KanaScript) ?? 'hiragana';
  const mode = params.get('mode') === 'read' ? 'read' : 'listen';
  const rowsParam = params.get('rows') ?? 'a';
  const pool = useMemo(() => {
    const ids = rowsParam.split(',');
    return kanaRows.filter((r) => ids.includes(r.id)).flatMap((r) => rowChars(r, script));
  }, [rowsParam, script]);

  const [introIdx, setIntroIdx] = useState(params.get('intro') ? 0 : -1);
  const [round, setRound] = useState(0);
  const [current, setCurrent] = useState(() => pickNext(pool));
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const options = useMemo(() => shuffle([current, ...distractors(current, pool, script)]), [current, pool, script, round]);

  const finished = round >= ROUNDS;

  if (introIdx >= 0 && introIdx < pool.length) {
    const k = pool[introIdx];
    return (
      <>
        <Header title="Neue Zeichen" subtitle={`${introIdx + 1} von ${pool.length} – hören, ansehen, nachsprechen`} />
        <ProgressBar value={introIdx} max={pool.length} />
        <div className="lesson-stage" key={k}>
          <div lang="ja" style={{ fontSize: '7rem', lineHeight: 1.1, fontFamily: 'var(--font-jp)' }}>
            {k}
          </div>
          <SpeakButton text={k} size="lg" autoPlay />
          <h2 style={{ margin: 0 }}>{kanaRomaji(k)}</h2>
          {kanaMnemonic(k) && <p className="muted">💡 {kanaMnemonic(k)}</p>}
          <p className="muted small">Sprich das Zeichen laut nach.</p>
          <button className="btn btn-primary btn-block" onClick={() => setIntroIdx(introIdx + 1)}>
            {introIdx + 1 < pool.length ? 'Nächstes Zeichen' : 'Jetzt üben'}
          </button>
        </div>
      </>
    );
  }

  const onAnswer = (ok: boolean) => {
    setAnswer(ok);
    setKanaBox(current, ok);
    if (ok) setCorrectCount((c) => c + 1);
    void say(current);
  };

  const next = () => {
    const nr = round + 1;
    setAnswer(null);
    setRound(nr);
    if (nr >= ROUNDS) {
      const score = (correctCount) / ROUNDS;
      markDone(`kana:${script}:${rowsParam}`, score);
      addXP(correctCount);
      return;
    }
    setCurrent(pickNext(pool, current));
  };

  return (
    <>
      <Header title={mode === 'listen' ? 'Kana hören' : 'Kana lesen'} subtitle={script === 'hiragana' ? 'Hiragana' : 'Katakana'} />
      {!finished && <ProgressBar value={round} max={ROUNDS} />}

      {finished ? (
        <Finish score={correctCount / ROUNDS} xp={correctCount}>
          <p className="muted">Zeichen, die noch wackeln, kommen beim nächsten Mal häufiger dran.</p>
          <div className="col gap">
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                setRound(0);
                setCorrectCount(0);
                setCurrent(pickNext(pool));
              }}
            >
              Noch eine Runde
            </button>
            <button className="btn btn-block" onClick={() => back('/kana')}>
              Zurück
            </button>
          </div>
        </Finish>
      ) : (
        <div className="lesson-stage" key={round}>
          {mode === 'listen' ? (
            <>
              <SpeakButton text={current} size="xl" autoPlay />
              <p className="muted">Welches Zeichen hörst du?</p>
              <div style={{ width: '100%' }}>
                <Choices options={options} correct={current} onAnswer={onAnswer} kana columns={2} />
              </div>
            </>
          ) : (
            <>
              <div lang="ja" style={{ fontSize: '6rem', lineHeight: 1.1, fontFamily: 'var(--font-jp)' }}>
                {current}
              </div>
              <p className="muted">Wie klingt dieses Zeichen? Sag es laut, dann wähle.</p>
              <div style={{ width: '100%' }}>
                <Choices
                  options={options.map(kanaRomaji)}
                  correct={kanaRomaji(current)}
                  onAnswer={onAnswer}
                  columns={2}
                />
              </div>
            </>
          )}
          {answer !== null && (
            <div className="stack" style={{ width: '100%' }}>
              <Feedback ok={answer}>
                <span lang="ja">{current}</span> = {kanaRomaji(current)}
                {!answer && kanaMnemonic(current) && <div className="small" style={{ fontWeight: 400 }}>💡 {kanaMnemonic(current)}</div>}
              </Feedback>
              <button className="btn btn-primary btn-block" onClick={next}>
                Weiter
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
