// Shadowing: Muttersprachler-Audio hören und zeitgleich bzw. direkt danach nachsprechen.
// Eigene Aufnahme mit dem Original vergleichen → Aussprache, Rhythmus und Melodie verbessern.
import { useEffect, useMemo, useRef, useState } from 'react';
import { SpeakButton, SpeechCheck, say, useRecorder } from '../components/Audio';
import { Icon } from '../components/Icon';
import { Header, JpText, ProgressBar, Segmented, sample } from '../components/ui';
import { sentencePool } from '../data';
import type { Level } from '../data/types';
import { wait } from '../lib/speech';
import { addXP, markDone, useAppState } from '../lib/store';

const COUNT = 8;

export function Shadowing() {
  const state = useAppState();
  const [level, setLevel] = useState<Level>(state.level);
  const [session, setSession] = useState(0);
  const sentences = useMemo(() => {
    // Kurze Sätze zuerst für Einsteiger.
    const pool = sentencePool(level).filter((s) => (level === 1 ? s.kana.length <= 22 : true));
    return sample(pool, COUNT);
  }, [level, session]);
  const [i, setI] = useState(0);
  const [looping, setLooping] = useState(false);
  const [showText, setShowText] = useState(!state.settings.audioFirst);
  const loopRef = useRef(false);
  const rec = useRecorder();
  const s = sentences[i];

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
      setSession((x) => x + 1);
      setI(0);
      return;
    }
    setI(Math.max(0, n));
  };

  return (
    <>
      <Header title="Shadowing" subtitle="Hören – mitsprechen – vergleichen" />
      <Segmented
        value={level}
        onChange={(v) => {
          setLevel(v);
          setI(0);
        }}
        options={[
          { value: 1, label: 'Einsteiger' },
          { value: 2, label: 'Grundstufe' },
          { value: 3, label: 'Fortgeschr.' },
        ]}
      />
      <div className="mt">
        <ProgressBar value={i + 1} max={sentences.length} />
      </div>

      <div className="card stack mt" key={`${session}-${i}`}>
        <div className="row between">
          <span className="chip">{s.source}</span>
          <span className="muted small">
            {i + 1}/{sentences.length}
          </span>
        </div>
        <div className="col center gap">
          <SpeakButton text={s.jp} size="xl" slowButton autoPlay />
          {showText ? (
            <JpText s={s} size="lg" center showDe />
          ) : (
            <button className="reveal center" onClick={() => setShowText(true)}>
              <Icon name="eye" size={18} /> Text zeigen
            </button>
          )}
        </div>

        <div className="section-title">1 · Mitsprechen</div>
        <p className="muted small" style={{ marginTop: -6 }}>
          Starte die Schleife und sprich <b>gleichzeitig</b> oder direkt danach mit. Ahme Melodie und Rhythmus nach – nicht nur
          die Wörter.
        </p>
        <button className={`btn ${looping ? 'btn-accent' : ''}`} onClick={startLoop}>
          <Icon name={looping ? 'stop' : 'repeat'} size={18} /> {looping ? 'Schleife stoppen' : 'Endlosschleife starten'}
        </button>

        <div className="section-title">2 · Aufnehmen & vergleichen</div>
        <div className="row gap wrap">
          <button className={`btn ${rec.recording ? 'btn-primary' : ''}`} onClick={() => (rec.recording ? rec.stop() : rec.start())}>
            <Icon name={rec.recording ? 'stop' : 'record'} size={18} /> {rec.recording ? 'Stopp' : 'Aufnehmen'}
          </button>
          <button className="btn" disabled={!rec.url} onClick={compare}>
            <Icon name="play" size={18} /> Original + ich
          </button>
        </div>
        {rec.error && <div className="text-bad small">{rec.error}</div>}

        <div className="section-title">3 · Aussprache prüfen</div>
        <SpeechCheck
          targets={[s.jp, s.kana]}
          onResult={(r) => {
            addXP(r.grade === 'retry' ? 1 : 3);
            if (r.grade === 'retry') setShowText(true);
          }}
        />
      </div>

      <div className="row gap mt">
        <button className="btn grow" onClick={() => next(-1)} disabled={i === 0}>
          <Icon name="back" size={18} /> Zurück
        </button>
        <button className="btn btn-primary grow" onClick={() => next(1)}>
          {i + 1 >= sentences.length ? 'Neue Sätze' : 'Nächster Satz'} <Icon name="next" size={18} />
        </button>
      </div>
    </>
  );
}
