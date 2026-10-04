// Mein Ziel: Countdown, Prognose, Fähigkeiten, Reise-Checkliste, Erinnerung.
import { useState } from 'react';
import { GoalEditor } from '../components/GoalEditor';
import { Header, ProgressBar } from '../components/ui';
import { GOAL_TEMPLATES, SKILLS, STATUS_TEXT, forecast, milestones, parseDay, skillScores } from '../lib/goal';
import { downloadReminder } from '../lib/reminder';
import { navigate, useRoute } from '../lib/router';
import { setGoal, updateSettings, useAppState } from '../lib/store';

const fmt = (ts: number) => new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

export function Goal() {
  const state = useAppState();
  const { params } = useRoute();
  const [editing, setEditing] = useState(params.get('edit') === '1' || !state.goal);
  const goal = state.goal;

  if (editing || !goal) {
    return (
      <>
        <Header title={goal ? 'Ziel ändern' : 'Dein persönliches Ziel'} subtitle="Konkrete Ziele mit Datum motivieren am meisten" />
        <GoalEditor
          initial={goal}
          initialDailyGoal={state.settings.dailyGoal}
          onSave={(g, xp) => {
            setGoal(g, xp);
            setEditing(false);
          }}
        />
      </>
    );
  }

  const f = forecast(goal, state);
  const skills = skillScores(goal, state);
  const ms = milestones(goal, state);
  const msDone = ms.filter((m) => m.done).length;
  const pct = f.total ? Math.round((f.done / f.total) * 100) : 0;

  return (
    <>
      <Header title="Mein Ziel" right={<button className="btn btn-small" onClick={() => setEditing(true)}>Ändern</button>} />

      <div className="card goal-card stack">
        <div className="row between">
          <span style={{ fontWeight: 700 }}>
            {GOAL_TEMPLATES[goal.type].icon} {goal.title}
          </span>
          <span className="muted small">{fmt(parseDay(goal.targetDate))}</span>
        </div>
        <div className="row gap-l">
          <div>
            <div className="countdown-big">{Math.max(0, f.daysLeft)}</div>
            <div className="muted small">Tage übrig</div>
          </div>
          <div className="grow">
            <div className="row between small">
              <span>Lernschritte</span>
              <b>
                {f.done}/{f.total} · {pct} %
              </b>
            </div>
            <ProgressBar value={f.done} max={f.total} />
            <div className="small mt" style={{ fontWeight: 600 }}>
              {STATUS_TEXT[f.status]}
            </div>
          </div>
        </div>
      </div>

      {goal.why && (
        <div className="card mt">
          <div className="muted small">Mein Warum</div>
          <div style={{ fontWeight: 600, fontStyle: 'italic' }}>„{goal.why}“</div>
        </div>
      )}

      <div className="section-title">Plan & Prognose</div>
      <div className="card stack small">
        <div className="row between">
          <span>Nötiges Tempo</span>
          <b>≈ {Math.ceil(f.perWeekNeeded)} Schritte/Woche</b>
        </div>
        <div className="row between">
          <span>Dein Tempo (letzte 2 Wochen)</span>
          <b>{f.ratePerWeek.toFixed(1).replace('.', ',')} Schritte/Woche</b>
        </div>
        {f.finish && f.status !== 'done' && (
          <div className="row between">
            <span>Voraussichtlich fertig</span>
            <b>{fmt(f.finish)}</b>
          </div>
        )}
        <div className="row between">
          <span>Empfohlen</span>
          <b>
            ≈ {f.minutesPerDay} Min./Tag · {f.recommendedXP} XP
          </b>
        </div>
        {f.recommendedXP > state.settings.dailyGoal && f.status !== 'done' && (
          <button className="btn btn-small" onClick={() => updateSettings({ dailyGoal: f.recommendedXP })}>
            Tagesziel auf {f.recommendedXP} XP setzen (aktuell {state.settings.dailyGoal})
          </button>
        )}
      </div>

      <div className="section-title">Deine Fähigkeiten</div>
      <div className="card stack">
        {goal.skills.map((sk) => (
          <div key={sk} className="skill-row">
            <span>
              {SKILLS[sk].icon} {SKILLS[sk].label}
            </span>
            <ProgressBar value={skills[sk] * 100} max={100} />
            <b className="small">{Math.round(skills[sk] * 100)} %</b>
          </div>
        ))}
      </div>

      <div className="section-title">
        {goal.type === 'travel' ? 'Reise-Checkliste' : 'Kann-Ziele'} · {msDone}/{ms.length}
      </div>
      <div className="card">
        {ms.map((m) => (
          <button key={m.label} className={`milestone ${m.done ? 'done' : ''}`} onClick={() => navigate(m.route.path, m.route.params)}>
            <span className="step-check" style={m.done ? { background: 'var(--ok)', borderColor: 'var(--ok)', color: '#fff' } : undefined}>
              {m.done ? '✓' : ''}
            </span>
            <span className="tile-icon" style={{ width: 32, height: 32, fontSize: '1rem' }} lang="ja">
              {m.icon}
            </span>
            <span className="grow milestone-label">Ich kann: {m.label}</span>
          </button>
        ))}
      </div>

      <div className="section-title">Tägliche Erinnerung</div>
      <div className="card stack">
        <p className="small" style={{ margin: 0 }}>
          Feste Uhrzeit = feste Gewohnheit. <b>„Wenn es {state.settings.reminder} Uhr ist, übe ich Japanisch.“</b>
        </p>
        <div className="row gap">
          <input
            type="time"
            value={state.settings.reminder}
            onChange={(e) => e.target.value && updateSettings({ reminder: e.target.value })}
            aria-label="Uhrzeit"
            style={{ maxWidth: 140 }}
          />
          <button className="btn grow" onClick={() => downloadReminder(state.settings.reminder, goal.targetDate)}>
            📅 In Kalender eintragen
          </button>
        </div>
        <span className="muted small">Lädt einen täglichen Termin (.ics) bis zu deinem Zieldatum – öffnen und speichern.</span>
      </div>
    </>
  );
}
