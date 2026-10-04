// Hör-Blitz: 60 Sekunden – Wort hören, Bedeutung antippen. Serien geben Bonuspunkte.
// Die Uhr läuft nur, während du antworten kannst (nicht während der Sprachausgabe).
import { useEffect, useRef, useState } from 'react';
import { say } from '../components/Audio';
import { Icon } from '../components/Icon';
import { Choices, meaningOptions, registerAnswer } from '../components/Quiz';
import { Finish, Header, sample } from '../components/ui';
import { allItems, sayText } from '../data';
import type { LearnItem } from '../data/types';
import { stopSpeaking } from '../lib/speech';
import { addXP, getState, isKnown, markDone, reportBlitz, useAppState } from '../lib/store';

const DURATION = 60_000;

function buildPool(): LearnItem[] {
  const s = getState();
  const words = allItems.filter((i) => i.kind === 'word' && i.level <= Math.max(1, s.level));
  const known = words.filter((i) => isKnown(s, i.id));
  return known.length >= 12 ? known : words;
}

export function Blitz() {
  const state = useAppState();
  const [phase, setPhase] = useState<'ready' | 'play' | 'over'>('ready');
  const [pool] = useState(buildPool);
  const [q, setQ] = useState<{ item: LearnItem; options: string[]; n: number } | null>(null);
  const [status, setStatus] = useState<'speaking' | 'answer' | 'feedback'>('speaking');
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [record, setRecord] = useState(false);
  const statusRef = useRef(status);
  statusRef.current = status;
  const alive = useRef(true);
  const bestBefore = useRef(state.records.blitzBest);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'play') return;
    const t = setInterval(() => {
      if (statusRef.current === 'answer') setTimeLeft((x) => Math.max(0, x - 100));
    }, 100);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'play' && timeLeft <= 0) end();
  }, [timeLeft, phase]);

  const qRef = useRef(0);
  const ask = async (n: number) => {
    const item = sample(pool, 1)[0];
    qRef.current = n;
    setQ({ item, options: meaningOptions(item, pool), n });
    setStatus('speaking');
    statusRef.current = 'speaking';
    await say(sayText(item));
    // Nur umschalten, wenn noch dieselbe Frage offen ist (man darf schon während der Ausgabe antworten).
    if (alive.current && qRef.current === n && statusRef.current === 'speaking') setStatus('answer');
  };

  const start = () => {
    bestBefore.current = getState().records.blitzBest;
    setScore(0);
    setCombo(0);
    setTimeLeft(DURATION);
    setRecord(false);
    setPhase('play');
    void ask(0);
  };

  const end = () => {
    stopSpeaking();
    setPhase('over');
    setRecord(score > bestBefore.current && score > 0);
    reportBlitz(score);
    markDone('blitz', Math.min(1, score / 20));
    if (score > 0) addXP(score * 2);
  };

  const onAnswer = (ok: boolean) => {
    registerAnswer(ok);
    setStatus('feedback');
    statusRef.current = 'feedback';
    const nextCombo = ok ? combo + 1 : 0;
    setCombo(nextCombo);
    if (ok) setScore((s) => s + (nextCombo >= 5 ? 2 : 1));
    setTimeout(() => {
      if (alive.current && statusRef.current === 'feedback') void ask((q?.n ?? 0) + 1);
    }, ok ? 250 : 900);
  };

  if (phase === 'ready') {
    return (
      <>
        <Header title="Hör-Blitz" subtitle="Wie viele Wörter erkennst du in 60 Sekunden?" />
        <div className="lesson-stage">
          <div className="big-icon">⏱️</div>
          <p className="muted">
            Hör das Wort, tippe die Bedeutung. Ab einer <b>5er-Serie</b> zählt jede Antwort doppelt. Die Uhr läuft nur, während du
            antworten kannst.
          </p>
          <div className="card col center" style={{ width: '100%' }}>
            <div className="muted small">Dein Rekord</div>
            <div className="score-big">{state.records.blitzBest}</div>
          </div>
          <button className="btn btn-primary btn-large btn-block" onClick={start}>
            Los!
          </button>
        </div>
      </>
    );
  }

  if (phase === 'over') {
    return (
      <>
        <Header title="Hör-Blitz" />
        <Finish title={record ? 'Neuer Rekord! 🏆' : 'Zeit ist um!'} xp={score * 2} score={record ? 1 : undefined}>
          <div className="score-big">{score}</div>
          <div className="muted">Punkte · Rekord: {Math.max(score, bestBefore.current)}</div>
          <button className="btn btn-primary btn-block" onClick={start}>
            Nochmal
          </button>
        </Finish>
      </>
    );
  }

  return (
    <>
      <Header title="Hör-Blitz" right={<span className="score-big" style={{ fontSize: '1.6rem' }}>{score}</span>} />
      <div className="timer-bar">
        <div className="timer-fill" style={{ width: `${(timeLeft / DURATION) * 100}%`, backgroundPosition: `${(1 - timeLeft / DURATION) * 100}% 0` }} />
      </div>
      <div className="row between small mt">
        <span className="muted">{Math.ceil(timeLeft / 1000)} s</span>
        {combo >= 2 && <span className="combo-chip">⚡ {combo}er-Serie{combo >= 5 ? ' · ×2' : ''}</span>}
      </div>
      {q && (
        <div className="lesson-stage" key={q.n}>
          <button className={`btn-audio btn-audio-xl ${status === 'speaking' ? 'is-playing' : ''}`} onClick={() => say(sayText(q.item))} aria-label="Nochmal hören">
            <Icon name="speaker" size={44} />
          </button>
          <div style={{ width: '100%', opacity: status === 'speaking' ? 0.6 : 1 }}>
            <Choices options={q.options} correct={q.item.de} onAnswer={(ok) => onAnswer(ok)} silent />
          </div>
          {status === 'feedback' && (
            <div className="muted small">
              <span lang="ja">{q.item.jp}</span> = {q.item.de}
            </div>
          )}
        </div>
      )}
    </>
  );
}
