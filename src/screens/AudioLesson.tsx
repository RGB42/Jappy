// Freihändige Audio-Lektion (Pimsleur-Prinzip) – ideal unterwegs, beim Spazieren oder Kochen.
import { useEffect, useMemo, useRef, useState } from 'react';
import { say } from '../components/Audio';
import { Icon } from '../components/Icon';
import { Finish, Header, JpText, ProgressBar, sample } from '../components/ui';
import { allItems, itemById, sayText } from '../data';
import type { LearnItem } from '../data/types';
import { buildLessonScript, estimateSeconds, type Cue, type LessonItem } from '../lib/audioLesson';
import { parseCardId } from '../lib/srs';
import { speak, stopSpeaking, wait } from '../lib/speech';
import { useRoute } from '../lib/router';
import { addXP, dueCards, getState, introduceItems, isKnown, markDone } from '../lib/store';

/** Wählt Inhalte: fällige und frisch gelernte Ausdrücke, ergänzt um ein paar neue. */
function pickItems(explicit: string | null): LessonItem[] {
  const s = getState();
  const toLesson = (i: LearnItem): LessonItem => ({ id: i.id, jp: sayText(i), kana: i.kana, de: i.de, isNew: !isKnown(s, i.id) });
  if (explicit) {
    return explicit
      .split(',')
      .map((id) => itemById.get(id))
      .filter((i): i is LearnItem => !!i)
      .map((i) => ({ ...toLesson(i), isNew: true }));
  }
  const due = dueCards(s)
    .map((c) => parseCardId(c.id).itemId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx && itemById.has(id))
    .slice(0, 4)
    .map((id) => itemById.get(id)!);
  const recent = Object.values(s.cards)
    .filter((c) => c.id.endsWith(':speak') && c.interval < 7)
    .map((c) => itemById.get(parseCardId(c.id).itemId))
    .filter((i): i is LearnItem => !!i && !due.includes(i));
  const picked = [...due, ...sample(recent, Math.max(0, 5 - due.length))];
  const fresh = sample(
    allItems.filter((i) => i.level === s.level && !isKnown(s, i.id) && i.kana.length <= 24),
    picked.length >= 5 ? 2 : 6 - picked.length,
  );
  return [...picked, ...fresh].map(toLesson);
}

export function AudioLesson() {
  const { params } = useRoute();
  const [seed, setSeed] = useState(0);
  const items = useMemo(() => pickItems(params.get('items')), [params, seed]);
  const cues = useMemo(() => buildLessonScript(items), [items]);
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showText, setShowText] = useState(false);
  const [done, setDone] = useState(false);
  const run = useRef(0);
  const posRef = useRef(0);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(
    () => () => {
      run.current++;
      stopSpeaking();
      void wakeLock.current?.release().catch(() => {});
    },
    [],
  );

  const current = useMemo(() => {
    for (let i = Math.min(pos, cues.length - 1); i >= 0; i--) {
      const c = cues[i];
      if (c.type === 'marker') return { item: itemById.get(c.itemId), phase: c.phase };
    }
    return null;
  }, [pos, cues]);
  const label = useMemo(() => {
    const c = cues[pos];
    if (!c) return '';
    if (c.type === 'pause') return c.label;
    if (c.type === 'de') return 'Ansage';
    if (c.type === 'ja') return 'Hör zu';
    return '';
  }, [pos, cues]);

  const execute = async (c: Cue, token: number) => {
    if (c.type === 'de') await speak(c.text, { lang: 'de-DE', rate: 1 });
    else if (c.type === 'ja') await say(c.text, { slow: c.slow });
    else if (c.type === 'pause') {
      // Pause in kleinen Schritten, damit „Pause“ sofort greift.
      const end = Date.now() + c.ms;
      while (Date.now() < end && run.current === token) await wait(100);
    }
  };

  const play = async () => {
    if (playing) {
      run.current++;
      stopSpeaking();
      setPlaying(false);
      return;
    }
    const token = ++run.current;
    setPlaying(true);
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
      wakeLock.current = (await nav.wakeLock?.request('screen')) ?? null;
    } catch {
      /* optional */
    }
    for (let i = posRef.current; i < cues.length; i++) {
      if (run.current !== token) return;
      posRef.current = i;
      setPos(i);
      await execute(cues[i], token);
    }
    if (run.current !== token) return;
    setPlaying(false);
    void wakeLock.current?.release().catch(() => {});
    finish();
  };

  const finish = () => {
    const fresh = items.filter((i) => i.isNew).map((i) => i.id);
    if (fresh.length) introduceItems(fresh);
    markDone('audio-lesson', 1);
    addXP(25);
    setDone(true);
  };

  const jump = (dir: 1 | -1) => {
    // Zum nächsten/vorigen Abschnitt (Marker) springen.
    let i = posRef.current + dir;
    while (i > 0 && i < cues.length && cues[i].type !== 'marker') i += dir;
    i = Math.max(0, Math.min(cues.length - 1, i));
    const wasPlaying = playing;
    run.current++;
    stopSpeaking();
    posRef.current = i;
    setPos(i);
    setPlaying(false);
    if (wasPlaying) setTimeout(() => void playRef.current(), 50);
  };
  const playRef = useRef(play);
  playRef.current = play;

  if (done) {
    return (
      <>
        <Header title="Audio-Lektion" />
        <Finish title="Lektion beendet!" xp={25}>
          <p className="muted">{items.filter((i) => i.isNew).length} neue Ausdrücke sind jetzt in deinen Wiederholungen.</p>
          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              setDone(false);
              setPos(0);
              posRef.current = 0;
              setSeed((s) => s + 1);
            }}
          >
            Neue Lektion
          </button>
        </Finish>
      </>
    );
  }

  const minutes = Math.max(1, Math.round(estimateSeconds(cues) / 60));

  return (
    <>
      <Header title="Audio-Lektion" subtitle={`Freihändig · ca. ${minutes} Min. · ${items.length} Ausdrücke`} />
      <ProgressBar value={pos} max={cues.length - 1} />
      <div className="lesson-stage">
        <div className="audio-lesson-phase">{playing ? label : pos === 0 ? 'Bereit' : 'Pausiert'}</div>
        {current?.item ? (
          <>
            <h2 style={{ margin: 0 }}>„{current.item.de}“</h2>
            {showText ? <JpText s={current.item} size="lg" center /> : <span className="muted small">Japanischer Text ausgeblendet – nur hören</span>}
          </>
        ) : (
          <p className="muted">
            Kopfhörer auf, Handy in die Tasche. Jappy fragt auf Deutsch, <b>du antwortest laut auf Japanisch</b>, dann kommt die
            Lösung. Neues wird in wachsenden Abständen wiederholt.
          </p>
        )}
        <div className="row gap center">
          <button className="icon-btn" onClick={() => jump(-1)} aria-label="Vorheriger Abschnitt">
            <Icon name="back" size={30} />
          </button>
          <button className={`btn-audio btn-audio-xl ${playing ? 'is-playing' : ''}`} onClick={play} aria-label={playing ? 'Pause' : 'Start'}>
            <Icon name={playing ? 'pause' : 'play'} size={48} />
          </button>
          <button className="icon-btn" onClick={() => jump(1)} aria-label="Nächster Abschnitt">
            <Icon name="next" size={30} />
          </button>
        </div>
        <button className="btn btn-small" onClick={() => setShowText((s) => !s)}>
          <Icon name="eye" size={16} /> {showText ? 'Text ausblenden' : 'Text einblenden'}
        </button>
        <p className="muted small">Hinweis: Lass den Bildschirm an – manche Handys stoppen die Sprachausgabe im Sperrbildschirm.</p>
      </div>
    </>
  );
}
