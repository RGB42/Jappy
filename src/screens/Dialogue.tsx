// Rollenspiele: echte Situationen durchspielen (aufgabenbasiertes Lernen).
// Erst anhören, dann selbst eine Rolle sprechen – die App spielt die andere.
import { useEffect, useRef, useState } from 'react';
import { SpeakButton, SpeechCheck, say } from '../components/Audio';
import { Icon } from '../components/Icon';
import { Finish, Header, JpText, Segmented } from '../components/ui';
import { LEVELS, TOPICS, dialogueById, dialogues } from '../data';
import type { Dialogue, Level } from '../data/types';
import { wait } from '../lib/speech';
import { navigate, useRoute } from '../lib/router';
import { addXP, markDone, useAppState, useSettings } from '../lib/store';

export function DialogueList() {
  const state = useAppState();
  return (
    <>
      <Header title="Rollenspiele" subtitle="Alltagssituationen hören und selbst sprechen" />
      {([1, 2, 3] as Level[]).map((level) => (
        <section key={level}>
          <div className="section-title">{LEVELS[level].label}</div>
          <div className="list">
            {dialogues
              .filter((d) => d.level === level)
              .map((d) => {
                const done = state.done[`dialogue:${d.id}`];
                return (
                  <button key={d.id} className={`list-item ${done ? 'done' : ''}`} onClick={() => navigate('/dialogue', { id: d.id })}>
                    <span className="tile-icon">{TOPICS[d.topic].icon}</span>
                    <span className="grow">
                      <b>{d.title}</b> <span className="muted small" lang="ja">{d.titleJp}</span>
                      <div className="muted small">{d.situation}</div>
                    </span>
                    {done && <span className="chip chip-ok">{Math.round(done.best * 100)} %</span>}
                  </button>
                );
              })}
          </div>
        </section>
      ))}
    </>
  );
}

export function DialoguePlayer() {
  const { params } = useRoute();
  const d = dialogueById.get(params.get('id') ?? '');
  const [mode, setMode] = useState<'listen' | 'play'>('listen');
  const [swap, setSwap] = useState(false);
  const [run, setRun] = useState(0);
  if (!d) return <Header title="Dialog nicht gefunden" />;
  const userRole = swap ? (d.userRole === 'A' ? 'B' : 'A') : d.userRole;
  const roleName = (id: 'A' | 'B') => d.roles.find((r) => r.id === id)!;

  return (
    <>
      <Header title={d.title} subtitle={d.titleJp} />
      <div className="card mb">
        <div className="small">🎬 {d.situation}</div>
        <div className="muted small mt">
          Du bist: <b>{roleName(userRole).nameDe}</b> <span lang="ja">（{roleName(userRole).name}）</span>
        </div>
      </div>
      <Segmented
        value={mode}
        onChange={(m) => {
          setMode(m);
          setRun((r) => r + 1);
        }}
        options={[
          { value: 'listen', label: '1 · Anhören' },
          { value: 'play', label: '2 · Mitspielen' },
        ]}
      />
      <div className="mt">
        {mode === 'listen' ? (
          <ListenMode key={run} d={d} userRole={userRole} onDone={() => setMode('play')} />
        ) : (
          <PlayMode
            key={`${run}-${swap}`}
            d={d}
            userRole={userRole}
            onRestart={() => setRun((r) => r + 1)}
            onSwap={() => {
              setSwap((s) => !s);
              setRun((r) => r + 1);
            }}
          />
        )}
      </div>
    </>
  );
}

function ListenMode({ d, userRole, onDone }: { d: Dialogue; userRole: 'A' | 'B'; onDone: () => void }) {
  const settings = useSettings();
  const [active, setActive] = useState<number | null>(null);
  const [showText, setShowText] = useState(!settings.audioFirst);
  const [showDe, setShowDe] = useState(false);
  const playing = useRef(false);

  useEffect(() => () => void (playing.current = false), []);

  const playAll = async () => {
    if (playing.current) {
      playing.current = false;
      setActive(null);
      return;
    }
    playing.current = true;
    for (let i = 0; i < d.lines.length && playing.current; i++) {
      setActive(i);
      await say(d.lines[i].jp);
      await wait(450);
    }
    playing.current = false;
    setActive(null);
  };

  return (
    <div className="stack">
      <div className="row gap wrap">
        <button className="btn btn-primary" onClick={playAll}>
          <Icon name={active !== null ? 'stop' : 'play'} size={18} /> {active !== null ? 'Stopp' : 'Ganzen Dialog hören'}
        </button>
        <button className="btn btn-small" onClick={() => setShowText((s) => !s)}>
          {showText ? 'Text aus' : 'Text an'}
        </button>
        <button className="btn btn-small" onClick={() => setShowDe((s) => !s)}>
          {showDe ? 'Deutsch aus' : 'Deutsch an'}
        </button>
      </div>
      {!showText && <p className="muted small">Erst ohne Text hören: Was verstehst du schon? Dann Text oder Deutsch einblenden.</p>}
      <div className="bubbles">
        {d.lines.map((l, i) => {
          const role = d.roles.find((r) => r.id === l.role)!;
          return (
            <div
              key={i}
              className={`bubble ${l.role === userRole ? 'me' : ''} ${active === i ? 'active' : ''}`}
              onClick={() => say(l.jp)}
              role="button"
              tabIndex={0}
            >
              <div className="bubble-role">
                {role.nameDe} · <span lang="ja">{role.name}</span> 🔊
              </div>
              {showText ? <JpText s={l} size="sm" showDe={showDe} /> : showDe ? <div className="de">{l.de}</div> : <div className="muted">· · ·</div>}
            </div>
          );
        })}
      </div>
      <button className="btn btn-accent btn-block btn-large" onClick={onDone}>
        Jetzt mitspielen 🎤
      </button>
    </div>
  );
}

function PlayMode({
  d,
  userRole,
  onRestart,
  onSwap,
}: {
  d: Dialogue;
  userRole: 'A' | 'B';
  onRestart: () => void;
  onSwap: () => void;
}) {
  const settings = useSettings();
  const [pos, setPos] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [hint, setHint] = useState(0); // 0 = nur Deutsch, 1 = Text, 2 = vorgesprochen
  const [answered, setAnswered] = useState(false);
  const alive = useRef(true);
  const bottom = useRef<HTMLDivElement>(null);
  const finished = pos >= d.lines.length;
  const line = d.lines[pos];

  useEffect(() => {
    alive.current = true;
    return () => void (alive.current = false);
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    if (!line || line.role === userRole) return;
    let cancelled = false;
    (async () => {
      await wait(350);
      if (cancelled) return;
      await say(line.jp);
      await wait(400);
      if (!cancelled && alive.current) setPos((p) => p + 1);
    })();
    return () => {
      cancelled = true;
    };
  }, [pos, line, userRole]);

  useEffect(() => {
    if (finished && d.lines.some((l) => l.role === userRole)) {
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      markDone(`dialogue:${d.id}`, avg);
      addXP(20);
    }
  }, [finished]);

  const nextLine = () => {
    setHint(0);
    setAnswered(false);
    setPos((p) => p + 1);
  };

  if (finished) {
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return (
      <Finish title="Dialog geschafft!" score={avg} xp={20}>
        <p className="muted">Wiederhole den Dialog, bis er flüssig klingt – oder tausche die Rolle.</p>
        <div className="col gap">
          <button className="btn btn-primary btn-block" onClick={onRestart}>
            Nochmal spielen
          </button>
          <button className="btn btn-block" onClick={onSwap}>
            🔄 Rolle tauschen
          </button>
          <button className="btn btn-block" onClick={() => navigate('/dialogues')}>
            Andere Situation
          </button>
        </div>
      </Finish>
    );
  }

  return (
    <div className="stack">
      <div className="bubbles">
        {d.lines.slice(0, pos).map((l, i) => (
          <div key={i} className={`bubble ${l.role === userRole ? 'me' : ''}`} onClick={() => say(l.jp)} role="button" tabIndex={0}>
            <div className="bubble-role">{d.roles.find((r) => r.id === l.role)!.nameDe}</div>
            {l.role === userRole || !settings.audioFirst ? <JpText s={l} size="sm" /> : <div className="de">{l.de}</div>}
          </div>
        ))}
        {line.role !== userRole && (
          <div className="bubble active">
            <div className="bubble-role">{d.roles.find((r) => r.id === line.role)!.nameDe} spricht …</div>
            <div className="pulse-text">🔊 · · ·</div>
          </div>
        )}
      </div>

      {line.role === userRole && (
        <div className="card stack" style={{ borderColor: 'var(--primary)' }}>
          <div className="muted small">Du bist dran. Sag auf Japanisch:</div>
          <h3 style={{ margin: 0 }}>„{line.de}“</h3>
          {hint >= 1 && <JpText s={line} size="md" />}
          <div className="row gap-s wrap">
            {hint < 1 && (
              <button className="btn btn-small" onClick={() => setHint(1)}>
                💡 Text zeigen
              </button>
            )}
            <button
              className="btn btn-small"
              onClick={() => {
                setHint(2);
                void say(line.jp);
              }}
            >
              🔊 Vorsprechen
            </button>
            <SpeakButton text={line.jp} size="sm" slowButton />
          </div>
          <SpeechCheck
            targets={[line.jp, line.kana, ...(line.accept ?? [])]}
            prompt="Sprich deine Zeile"
            onResult={(r) => {
              // Hilfe kostet ein bisschen – trotzdem immer belohnt.
              const penalty = hint === 2 ? 0.15 : hint === 1 ? 0.05 : 0;
              setScores((s) => [...s, Math.max(0, r.score - penalty)]);
              setAnswered(true);
            }}
          />
          <button
            className={`btn btn-block ${answered ? 'btn-primary' : ''}`}
            onClick={() => {
              if (!answered) setScores((s) => [...s, 0]);
              nextLine();
            }}
          >
            {answered ? 'Weiter' : 'Überspringen'}
          </button>
        </div>
      )}
      <div ref={bottom} />
    </div>
  );
}
