// Startseite „Heute“: Tagesziel, nächster Schritt im Lernpfad, fällige Wiederholungen.
import { useMemo } from 'react';
import { SpeakButton } from '../components/Audio';
import { Icon } from '../components/Icon';
import { Ring, Tile } from '../components/ui';
import { LEVELS, phrases } from '../data';
import { STEP_ICON, nextStep, openStep, unitProgress } from '../lib/path';
import { dayKey } from '../lib/srs';
import { navigate } from '../lib/router';
import { currentStreak, dueCards, newIntroducedToday, useAppState, xpToday } from '../lib/store';
import { METHODS } from './Methods';

function greeting(): { jp: string; de: string } {
  const h = new Date().getHours();
  if (h < 11) return { jp: 'おはようございます', de: 'Guten Morgen' };
  if (h < 18) return { jp: 'こんにちは', de: 'Guten Tag' };
  return { jp: 'こんばんは', de: 'Guten Abend' };
}

/** Deterministisch „zufällig“ pro Tag. */
function daily<T>(list: T[], salt = 0): T {
  const key = dayKey();
  let h = salt;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}

export function Home() {
  const state = useAppState();
  const g = greeting();
  const due = dueCards(state).length;
  const xp = xpToday(state);
  const goal = state.settings.dailyGoal;
  const streak = currentStreak(state);
  const next = nextStep(state);
  const newToday = newIntroducedToday(state);
  const tip = daily(METHODS, 7);
  const phrase = useMemo(() => daily(phrases.filter((p) => p.level === state.level)), [state.level]);

  return (
    <>
      <header className="page-header">
        <div className="page-header-title">
          <div className="muted small">{g.de}</div>
          <h1 lang="ja">{g.jp}</h1>
        </div>
        <span className="chip" title="Tage in Folge">
          <Icon name="fire" size={16} /> {streak}
        </span>
        <button className="icon-btn" onClick={() => navigate('/settings')} aria-label="Einstellungen">
          <Icon name="settings" />
        </button>
      </header>

      <div className="card tone-red row gap-l">
        <Ring value={xp} max={goal} size={76}>
          {Math.min(100, Math.round((xp / goal) * 100))}%
        </Ring>
        <div className="grow">
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{xp >= goal ? 'Tagesziel erreicht! 🎉' : 'Dein Tagesziel'}</div>
          <div className="muted small">
            {xp} / {goal} XP · {LEVELS[state.level].label}
          </div>
          <div className="muted small">{streak ? `🔥 ${streak} Tag${streak > 1 ? 'e' : ''} in Folge` : 'Starte heute deine Serie!'}</div>
        </div>
      </div>

      {next && (
        <>
          <div className="section-title">Weiter im Lernpfad</div>
          <button className="card row gap btn-block" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => openStep(next.step)}>
            <span className="tile-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              {STEP_ICON[next.step.type]}
            </span>
            <span className="grow">
              <span className="muted small">
                {next.unit.title} · {unitProgress(state, next.unit).done}/{unitProgress(state, next.unit).total}
              </span>
              <div style={{ fontWeight: 700 }}>{next.step.label}</div>
            </span>
            <Icon name="play" />
          </button>
          {next.step.type === 'learn' && newToday >= state.settings.newPerDay && (
            <div className="notice mt">
              Du hast heute schon {newToday} neue Ausdrücke gelernt. Mehr geht – aber Wiederholen bringt jetzt mehr.
            </div>
          )}
        </>
      )}

      <div className="section-title">Heute üben</div>
      <div className="tiles">
        <Tile
          icon="🔁"
          tone="red"
          title={due ? `${due} Wiederholungen fällig` : 'Keine Wiederholungen fällig'}
          desc={due ? 'Hören & sprechen – kurz vor dem Vergessen' : 'Super! Später kommen wieder welche.'}
          badge={due || undefined}
          onClick={() => navigate('/review')}
        />
        <Tile icon="🎧" tone="blue" title="Audio-Lektion" desc="Freihändig üben – ideal unterwegs (≈ 5 Min.)" onClick={() => navigate('/audio')} />
      </div>
      <div className="tiles tiles-2 mt">
        <Tile icon="🗣️" tone="red" title="Shadowing" desc="Mitsprechen" onClick={() => navigate('/shadow')} />
        <Tile icon="🎭" tone="red" title="Rollenspiel" desc="Situationen" onClick={() => navigate('/dialogues')} />
        <Tile icon="👂" tone="blue" title="Hörtraining" desc="Ohr schulen" onClick={() => navigate('/listen')} />
        <Tile icon="🧱" tone="green" title="Satzbau" desc="Ausprobieren" onClick={() => navigate('/build', { level: state.level })} />
      </div>

      {phrase && (
        <>
          <div className="section-title">Ausdruck des Tages</div>
          <div className="card row gap">
            <SpeakButton text={phrase.jp} slowButton />
            <div className="grow">
              <div lang="ja" style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                {phrase.jp}
              </div>
              <div className="muted small">{phrase.de}</div>
            </div>
          </div>
        </>
      )}

      <div className="section-title">Lerntipp</div>
      <button className="card btn-block" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => navigate('/methods')}>
        <b>
          {tip.icon} {tip.title}
        </b>
        <p className="muted small" style={{ margin: '4px 0 0' }}>
          {tip.text}
        </p>
      </button>
    </>
  );
}
