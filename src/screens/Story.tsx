// Hörgeschichten: verstehbarer Input knapp über dem eigenen Niveau (i+1).
// Ablauf: 1. hören (ohne Text) → 2. Verständnisfragen → 3. mit Text nachhören.
import { useEffect, useRef, useState } from 'react';
import { SpeakButton, say } from '../components/Audio';
import { Icon } from '../components/Icon';
import { Choices } from '../components/Quiz';
import { Finish, Header, JpText } from '../components/ui';
import { LEVELS, TOPICS, stories, storyById } from '../data';
import type { Level, Story } from '../data/types';
import { wait } from '../lib/speech';
import { navigate, useRoute } from '../lib/router';
import { addXP, getState, markDone, useAppState } from '../lib/store';

export function StoryList() {
  const state = useAppState();
  return (
    <>
      <Header title="Hörgeschichten" subtitle="Zuhören wie bei einem Hörbuch – Verstehen kommt mit der Zeit" />
      {([1, 2, 3] as Level[]).map((level) => (
        <section key={level}>
          <div className="section-title">{LEVELS[level].label}</div>
          <div className="list">
            {stories
              .filter((s) => s.level === level)
              .map((s) => {
                const done = state.done[`story:${s.id}`];
                return (
                  <button key={s.id} className={`list-item ${done ? 'done' : ''}`} onClick={() => navigate('/story', { id: s.id })}>
                    <span className="tile-icon">{TOPICS[s.topic].icon}</span>
                    <span className="grow">
                      <b>{s.title}</b> <span className="muted small" lang="ja">{s.titleJp}</span>
                      <div className="muted small">{s.sentences.length} Sätze</div>
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

export function StoryPlayer() {
  const { params } = useRoute();
  const story = storyById.get(params.get('id') ?? '');
  const [phase, setPhase] = useState<'listen' | 'questions' | 'text' | 'done'>('listen');
  const [score, setScore] = useState(0);
  if (!story) return <Header title="Geschichte nicht gefunden" />;

  return (
    <>
      <Header title={story.title} subtitle={story.titleJp} />
      {phase === 'listen' && <ListenPhase story={story} onNext={() => setPhase('questions')} />}
      {phase === 'questions' && (
        <QuestionPhase
          story={story}
          onDone={(s) => {
            setScore(s);
            markDone(`story:${story.id}`, s);
            addXP(15);
            setPhase('text');
          }}
        />
      )}
      {phase === 'text' && <TextPhase story={story} score={score} onDone={() => setPhase('done')} />}
      {phase === 'done' && (
        <Finish title="Geschichte verstanden!" score={score} xp={15}>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/stories')}>
            Weitere Geschichten
          </button>
        </Finish>
      )}
    </>
  );
}

function usePlayAll(story: Story) {
  const [active, setActive] = useState<number | null>(null);
  const playing = useRef(false);
  useEffect(() => () => void (playing.current = false), []);
  const toggle = async (slow = false) => {
    if (playing.current) {
      playing.current = false;
      setActive(null);
      return;
    }
    playing.current = true;
    for (let i = 0; i < story.sentences.length && playing.current; i++) {
      setActive(i);
      await say(story.sentences[i].jp, { slow });
      await wait(slow ? 900 : 600);
    }
    playing.current = false;
    setActive(null);
  };
  return { active, toggle };
}

function ListenPhase({ story, onNext }: { story: Story; onNext: () => void }) {
  const { active, toggle } = usePlayAll(story);
  const [plays, setPlays] = useState(0);
  return (
    <div className="lesson-stage">
      <div className="big-icon">🎧</div>
      <p className="muted">
        Hör dir die Geschichte an – <b>ohne Text</b>. Du musst nicht jedes Wort verstehen. Achte auf bekannte Wörter und den
        roten Faden.
      </p>
      <div className="row gap center">
        {story.sentences.map((_, i) => (
          <span
            key={i}
            style={{ width: 10, height: 10, borderRadius: 9, background: active === i ? 'var(--accent)' : active !== null && i < active ? 'var(--accent-soft)' : 'var(--border)' }}
          />
        ))}
      </div>
      <div className="row gap">
        <button
          className="btn btn-primary btn-large"
          onClick={() => {
            setPlays((p) => p + 1);
            void toggle();
          }}
        >
          <Icon name={active !== null ? 'stop' : 'play'} /> {active !== null ? 'Stopp' : plays ? 'Nochmal hören' : 'Abspielen'}
        </button>
        <button className="btn btn-large" onClick={() => toggle(true)} title="Langsam">
          🐢
        </button>
      </div>
      <button className="btn btn-accent btn-block" disabled={plays === 0} onClick={onNext}>
        Zu den Fragen
      </button>
    </div>
  );
}

function QuestionPhase({ story, onDone }: { story: Story; onDone: (score: number) => void }) {
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const { active, toggle } = usePlayAll(story);
  const q = story.questions[i];
  return (
    <div className="stack" key={i}>
      <div className="row between">
        <span className="muted small">
          Frage {i + 1}/{story.questions.length}
        </span>
        <button className="btn btn-small" onClick={() => toggle()}>
          <Icon name={active !== null ? 'stop' : 'headphones'} size={16} /> {active !== null ? 'Stopp' : 'Nochmal hören'}
        </button>
      </div>
      <h2>{q.q}</h2>
      <Choices
        options={q.options}
        correct={q.options[q.answer]}
        onAnswer={(ok) => {
          setAnswered(ok);
          if (ok) setCorrect((c) => c + 1);
        }}
      />
      {answered !== null && (
        <button
          className="btn btn-primary btn-block"
          onClick={() => {
            if (i + 1 >= story.questions.length) onDone(correct / story.questions.length);
            else {
              setI(i + 1);
              setAnswered(null);
            }
          }}
        >
          Weiter
        </button>
      )}
    </div>
  );
}

function TextPhase({ story, score, onDone }: { story: Story; score: number; onDone: () => void }) {
  const [showDe, setShowDe] = useState(false);
  const { active, toggle } = usePlayAll(story);
  const romaji = getState().settings.romaji;
  return (
    <div className="stack">
      <div className={`feedback ${score >= 0.66 ? 'feedback-ok' : 'feedback-info'}`}>
        {Math.round(score * 100)} % richtig. Jetzt mit Text nachhören – tippe einzelne Sätze an.
      </div>
      <div className="row gap wrap">
        <button className="btn btn-primary" onClick={() => toggle()}>
          <Icon name={active !== null ? 'stop' : 'play'} size={18} /> {active !== null ? 'Stopp' : 'Alles abspielen'}
        </button>
        <button className="btn btn-small" onClick={() => setShowDe((s) => !s)}>
          {showDe ? 'Deutsch aus' : 'Deutsch an'}
        </button>
      </div>
      <div className="list">
        {story.sentences.map((s, i) => (
          <div key={i} className="list-item" style={active === i ? { outline: '2px solid var(--accent)' } : undefined}>
            <SpeakButton text={s.jp} size="sm" />
            <div className="grow">
              <JpText s={s} size="sm" showDe={showDe} />
            </div>
          </div>
        ))}
      </div>
      {!romaji && <p className="muted small">Romaji kannst du in den Einstellungen einschalten.</p>}
      <button className="btn btn-accent btn-block" onClick={onDone}>
        Fertig
      </button>
    </div>
  );
}
