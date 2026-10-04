// Startseite „Heute“: Maskottchen, Ziel-Countdown, Tagesziel + Quests, nächste Reisestation.
import { useMemo } from 'react';
import { SpeakButton } from '../components/Audio';
import { Icon } from '../components/Icon';
import { ProgressBar, Ring, Tile } from '../components/ui';
import { phrases } from '../data';
import { CHEST_REWARD, levelInfo, mascotMessage, questProgress, questsFor, totalXP } from '../lib/game';
import { GOAL_TEMPLATES, STATUS_TEXT, forecast } from '../lib/goal';
import { STEP_ICON, nextStep, openStep, stationFor, unitProgress } from '../lib/path';
import { dayKey } from '../lib/srs';
import { navigate } from '../lib/router';
import { currentStreak, dueCards, newIntroducedToday, streakProtected, useAppState, xpToday } from '../lib/store';
import { METHODS } from './Methods';

function greeting(): { jp: string; de: string } {
  const h = new Date().getHours();
  if (h < 11) return { jp: 'おはようございます', de: 'Guten Morgen' };
  if (h < 18) return { jp: 'こんにちは', de: 'Guten Tag' };
  return { jp: 'こんばんは', de: 'Guten Abend' };
}

/** Deterministisch „zufällig“ pro Tag. */
function daily<T>(list: T[], salt = 0): T {
  let h = salt;
  for (const ch of dayKey()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}

export function Home() {
  const state = useAppState();
  const g = greeting();
  const due = dueCards(state).length;
  const xp = xpToday(state);
  const goal = state.settings.dailyGoal;
  const streak = currentStreak(state);
  const lvl = levelInfo(totalXP(state));
  const next = nextStep(state);
  const newToday = newIntroducedToday(state);
  const quests = questsFor(state);
  const claimed = state.daily.day === dayKey() ? state.daily.claimed : [];
  const f = state.goal ? forecast(state.goal, state) : null;
  const mascot = mascotMessage(state, xp, f);
  const tip = daily(METHODS, 7);
  const phrase = useMemo(() => daily(phrases.filter((p) => p.level === state.level)), [state.level]);

  return (
    <>
      <header className="page-header">
        <div className="page-header-title">
          <div className="muted small">{g.de}</div>
          <h1 lang="ja">{g.jp}</h1>
        </div>
        <div className="header-chips">
          <button className="level-badge" onClick={() => navigate('/profile')} title={`${lvl.rank.de} – ${lvl.into}/${lvl.span} XP`}>
            {lvl.rank.icon} Lv {lvl.level}
          </button>
          <button className="chip" onClick={() => navigate('/profile')} title="Tage in Folge">
            {streakProtected(state) ? '❄️' : <Icon name="fire" size={15} />} {streak}
          </button>
          <button className="yen-chip" onClick={() => navigate('/shop')} title="Reisekasse">
            ¥{state.coins.toLocaleString('de-DE')}
          </button>
        </div>
      </header>

      <div className="mascot mb">
        <div className="mascot-face" aria-hidden="true">
          🐕
        </div>
        <div className="mascot-bubble">
          <div className="row gap-s">
            <b lang="ja">{mascot.jp}</b>
            <SpeakButton text={mascot.jp} size="sm" />
          </div>
          <div className="small">{mascot.de}</div>
        </div>
      </div>

      {state.goal && f ? (
        <button className="card goal-card btn-block stack" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => navigate('/goal')}>
          <div className="row between">
            <b>
              {GOAL_TEMPLATES[state.goal.type].icon} {state.goal.title}
            </b>
            <span className="small">{f.daysLeft >= 0 ? `noch ${f.daysLeft} Tage` : 'Zieldatum erreicht'}</span>
          </div>
          <ProgressBar value={f.done} max={f.total} />
          <div className="row between gap small">
            <span>{STATUS_TEXT[f.status]}</span>
            <span style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{f.total ? Math.round((f.done / f.total) * 100) : 0} %</span>
          </div>
          {state.goal.why && <div className="small muted" style={{ fontStyle: 'italic' }}>„{state.goal.why}“</div>}
        </button>
      ) : (
        <Tile icon="🎯" tone="blue" title="Setz dir ein persönliches Ziel" desc="Z. B. „Japan-Urlaub in 9 Monaten“ – mit Plan & Prognose" onClick={() => navigate('/goal')} />
      )}

      <div className="section-title">Heute</div>
      <div className="card">
        <div className="row gap-l">
          <Ring value={xp} max={goal} size={72}>
            {Math.min(100, Math.round((xp / goal) * 100))}%
          </Ring>
          <div className="grow">
            <div style={{ fontWeight: 700 }}>{xp >= goal ? 'Tagesziel erreicht! 🎉' : 'Tagesziel'}</div>
            <div className="muted small">
              {xp} / {goal} XP · {streak ? `🔥 ${streak} Tag${streak > 1 ? 'e' : ''} in Folge` : 'Starte heute deine Serie!'}
            </div>
            <div className="muted small">
              {claimed.includes('chest') ? '🎁 Tageskiste geöffnet' : `🎁 Alle 3 Quests = Tageskiste (+¥${CHEST_REWARD})`}
            </div>
          </div>
        </div>
        <div className="mt">
          {quests.map((q) => {
            const p = questProgress(state, q);
            const done = claimed.includes(q.id);
            return (
              <div key={q.id} className={`quest ${done ? 'done' : ''}`}>
                <span className="quest-icon" lang="ja">
                  {done ? '✅' : q.icon}
                </span>
                <div className="grow">
                  <div className="row between gap-s small">
                    <span className="quest-text">{q.text}</span>
                    <span className="yen-chip" style={{ fontSize: '0.75rem' }}>
                      ¥{q.reward}
                    </span>
                  </div>
                  <ProgressBar value={p} max={q.target} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {next && (
        <>
          <div className="section-title">Weiter auf deiner Reise</div>
          <button className="card row gap btn-block" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => openStep(next.step)}>
            <span className="tile-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }} lang="ja">
              {STEP_ICON[next.step.type]}
            </span>
            <span className="grow">
              <span className="muted small">
                {next.unit.title} · {unitProgress(state, next.unit).done}/{unitProgress(state, next.unit).total} → {stationFor(next.unit).emoji}{' '}
                {stationFor(next.unit).name}
              </span>
              <div style={{ fontWeight: 700 }}>{next.step.label}</div>
            </span>
            <Icon name="play" />
          </button>
          {next.step.type === 'learn' && newToday >= state.settings.newPerDay && (
            <div className="notice mt">Du hast heute schon {newToday} neue Ausdrücke gelernt. Mehr geht – aber Wiederholen bringt jetzt mehr.</div>
          )}
        </>
      )}

      <div className="section-title">Üben</div>
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
        <Tile icon="⏱️" tone="gold" title="Hör-Blitz" desc={`Rekord: ${state.records.blitzBest}`} onClick={() => navigate('/blitz')} />
        <Tile icon="🎭" tone="red" title="Rollenspiel" desc="Situationen" onClick={() => navigate('/dialogues')} />
        <Tile icon="🗣️" tone="red" title="Shadowing" desc="Mitsprechen" onClick={() => navigate('/shadow')} />
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
