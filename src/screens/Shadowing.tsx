// Shadowing: Muttersprachler-Audio hören und zeitgleich bzw. direkt danach nachsprechen.
// Eigene Aufnahme mit dem Original vergleichen → Aussprache, Rhythmus und Melodie verbessern.
import { useEffect, useRef, useState } from 'react';
import { SpeakButton, SpeechCheck, say, useRecorder } from '../components/Audio';
import { GlossText, useGloss } from '../components/GlossText';
import { Icon } from '../components/Icon';
import { ResumeBanner } from '../components/Resume';
import { Header, JpText, ProgressBar, sample } from '../components/ui';
import { sentencePool } from '../data';
import type { Level, Sentence } from '../data/types';
import { useResume, type Codec } from '../lib/resume';
import { wait } from '../lib/speech';
import { addXP, countShadow, markDone, updateSettings, useAppState } from '../lib/store';

const COUNT = 8;

/** Zufällige Sätze; kurze Sätze für Einsteiger. */
const pick = (level: Level) => sample(sentencePool(level).filter((s) => (level === 1 ? s.kana.length <= 22 : true)), COUNT);

type PoolSentence = Sentence & { level: Level; source: string };
const keyOf = (s: Sentence) => `${s.jp}|${s.de}`;
let poolIndex: Map<string, PoolSentence> | null = null;
/** Gespeichert werden nur Satz-Schlüssel (jp|de). */
const sentenceCodec: Codec<PoolSentence[]> = {
  save: (list) => list.map(keyOf),
  load: (raw) => {
    if (!Array.isArray(raw)) return undefined;
    poolIndex ??= new Map(sentencePool().map((s) => [keyOf(s), s]));
    const out = raw.map((k) => poolIndex!.get(String(k)));
    return out.length && out.every(Boolean) ? (out as PoolSentence[]) : undefined;
  },
};

export function Shadowing() {
  const state = useAppState();
  // Niveau, Satzauswahl und Position werden gespeichert → später weitermachen.
  const r = useResume('/shadow', 'Shadowing');
  const [level, setLevel] = r.field<Level>('level', state.level);
  const [session, setSession] = useState(0);
  const [sentences, setSentences] = r.field('sentences', () => pick(level), sentenceCodec);
  const [i, setI] = r.field('i', 0);
  r.progress(i, sentences.length);
  const [looping, setLooping] = useState(false);
  const [showText, setShowText] = useState(!state.settings.audioFirst);
  const loopRef = useRef(false);
  const rec = useRecorder();
  const s = sentences[i];
  const gloss = useGloss(s);
  const glossOn = state.settings.glossView && !!gloss;

  useEffect(() => {
    loopRef.current = false;
    setLooping(false);
    setShowText(!state.settings.audioFirst);
    rec.reset();
  }, [i, session]);

  useEffect(() => () => void (loopRef.current = false), []);

  if (!s) return <Header title="Shadowing" />;

  const startLoop = async () => {
    if (loopRef.current) {
      loopRef.current = false;
      setLooping(false);
      return;
    }
    loopRef.current = true;
    setLooping(true);
    // Endlosschleife: Original – Pause zum Nachsprechen – Original …
    while (loopRef.current) {
      await say(s.jp);
      if (!loopRef.current) break;
      await wait(Math.max(1800, s.kana.length * 220));
    }
  };

  const compare = async () => {
    await say(s.jp);
    await wait(300);
    await rec.play();
  };

  const next = (d: number) => {
    const n = i + d;
    if (n >= sentences.length) {
      markDone(`shadow:${level}`, 1);
      r.finish();
      setSession((x) => x + 1);
      setSentences(pick(level));
      setI(0);
      return;
    }
    setI(Math.max(0, n));
  };

  const changeLevel = (v: Level) => {
    setLevel(v);
    setSentences(pick(v));
    setI(0);
  };

  return (
    <>
      <Header
        title="Shadowing"
        right={
          <select className="select-chip" value={level} onChange={(e) => changeLevel(Number(e.target.value) as Level)} aria-label="Niveau">
            <option value={1}>Einsteiger</option>
            <option value={2}>Grundstufe</option>
            <option value={3}>Fortgeschritten</option>
          </select>
        }
      />
      <ResumeBanner r={r} />
      <div className="progress-row">
        <ProgressBar value={i + 1} max={sentences.length} />
        <span className="muted small">
          {i + 1}/{sentences.length}
        </span>
      </div>

      <div className="card tight stack mt" key={`${session}-${i}`}>
        <div className="row between gap-s">
          <span className="chip ellipsis">{s.source}</span>
          {gloss && showText && (
            <button
              type="button"
              className={`chip gloss-toggle ${glossOn ? 'is-on' : ''}`}
              onClick={() => updateSettings({ glossView: !state.settings.glossView })}
              aria-pressed={glossOn}
              title="Welches deutsche Wort gehört zu welchem japanischen?"
            >
              🎨 Satzbau
            </button>
          )}
        </div>
        <div className="col center gap">
          <SpeakButton text={s.jp} size="xl" slowButton autoPlay />
          {showText && glossOn ? (
            <GlossText s={s} entry={gloss} />
          ) : showText ? (
            <JpText s={s} size="lg" center showDe />
          ) : (
            <button className="reveal center" onClick={() => setShowText(true)}>
              <Icon name="eye" size={18} /> Text zeigen
            </button>
          )}
        </div>

        {/* Mitsprechen · Aufnehmen · Vergleichen – kompakt in einer Zeile */}
        <div className="tool-row">
          <button className={`tool-btn ${looping ? 'is-on' : ''}`} onClick={startLoop} title="Endlosschleife: gleichzeitig mitsprechen">
            <Icon name={looping ? 'stop' : 'repeat'} size={20} />
            {looping ? 'Stopp' : 'Schleife'}
          </button>
          <button className={`tool-btn ${rec.recording ? 'is-rec' : ''}`} onClick={() => (rec.recording ? rec.stop() : rec.start())} title="Eigene Stimme aufnehmen">
            <Icon name={rec.recording ? 'stop' : 'record'} size={20} />
            {rec.recording ? 'Stopp' : 'Aufnehmen'}
          </button>
          <button className="tool-btn" disabled={!rec.url} onClick={compare} title="Original und eigene Aufnahme nacheinander hören">
            <Icon name="play" size={20} />
            Vergleichen
          </button>
        </div>
        {looping && <div className="muted small center">Sprich gleichzeitig mit – Melodie und Rhythmus nachahmen.</div>}
        {rec.error && <div className="text-bad small">{rec.error}</div>}

        <SpeechCheck
          compact
          prompt="Aussprache prüfen"
          targets={[s.jp, s.kana]}
          onResult={(r) => {
            addXP(r.grade === 'retry' ? 1 : 3);
            countShadow();
            if (r.grade === 'retry') setShowText(true);
          }}
        />
      </div>

      <div className="action-bar">
        <button className="btn btn-square" onClick={() => next(-1)} disabled={i === 0} aria-label="Vorheriger Satz">
          <Icon name="back" size={20} />
        </button>
        <button className="btn btn-primary grow" onClick={() => next(1)}>
          {i + 1 >= sentences.length ? 'Neue Sätze' : 'Nächster Satz'} <Icon name="next" size={18} />
        </button>
      </div>
    </>
  );
}
