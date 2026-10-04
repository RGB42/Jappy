// Persönliches Lernziel festlegen: Was? Bis wann? Welche Fähigkeiten? Warum? Wie viel Zeit pro Tag?
import { useMemo, useState } from 'react';
import { GOAL_TEMPLATES, SKILLS, defaultTargetDate, forecast, type Goal, type GoalType, type Skill } from '../lib/goal';
import { getState } from '../lib/store';

const MINUTES = [
  { min: 5, xp: 20 },
  { min: 10, xp: 40 },
  { min: 15, xp: 60 },
  { min: 20, xp: 80 },
  { min: 30, xp: 120 },
];

export function GoalEditor({
  initial,
  initialDailyGoal,
  saveLabel = 'Ziel speichern',
  onSave,
  onSkip,
}: {
  initial?: Goal | null;
  initialDailyGoal?: number;
  saveLabel?: string;
  onSave: (goal: Goal, dailyGoal: number) => void;
  onSkip?: () => void;
}) {
  const [type, setType] = useState<GoalType>(initial?.type ?? 'travel');
  const [title, setTitle] = useState(initial?.title ?? GOAL_TEMPLATES.travel.title);
  const [date, setDate] = useState(initial?.targetDate ?? defaultTargetDate(9));
  const [skills, setSkills] = useState<Skill[]>(initial?.skills ?? GOAL_TEMPLATES.travel.skills);
  const [why, setWhy] = useState(initial?.why ?? '');
  const [xp, setXp] = useState(initialDailyGoal ?? 40);

  const goal: Goal = { type, title: title.trim() || GOAL_TEMPLATES[type].title, targetDate: date, skills, why: why.trim() || undefined, createdAt: initial?.createdAt ?? Date.now() };
  const plan = useMemo(() => forecast(goal, getState()), [type, date]);
  const chosen = MINUTES.find((m) => m.xp === xp) ?? MINUTES[1];
  const recommended = MINUTES.find((m) => m.xp >= plan.recommendedXP) ?? MINUTES[MINUTES.length - 1];

  const pickType = (t: GoalType) => {
    setType(t);
    const prevTemplateTitle = GOAL_TEMPLATES[type].title;
    if (!title.trim() || title === prevTemplateTitle) setTitle(GOAL_TEMPLATES[t].title);
    setSkills(GOAL_TEMPLATES[t].skills);
  };

  const toggleSkill = (sk: Skill) =>
    setSkills((list) => (list.includes(sk) ? (list.length > 1 ? list.filter((x) => x !== sk) : list) : [...list, sk]));

  return (
    <div className="stack">
      <div className="field-label">Was möchtest du erreichen?</div>
      <div className="list">
        {(Object.keys(GOAL_TEMPLATES) as GoalType[]).map((t) => (
          <button key={t} className={`choice-card ${type === t ? 'selected' : ''}`} onClick={() => pickType(t)}>
            <span style={{ fontSize: '1.8rem' }}>{GOAL_TEMPLATES[t].icon}</span>
            <span className="grow">
              <b>{GOAL_TEMPLATES[t].title}</b>
              <div className="muted small">{GOAL_TEMPLATES[t].desc}</div>
            </span>
          </button>
        ))}
      </div>

      <label className="col gap-s">
        <span className="field-label">Name deines Ziels</span>
        <input type="text" value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Japan-Urlaub" />
      </label>

      <div className="col gap-s">
        <span className="field-label">Bis wann?</span>
        <div className="row gap-s wrap">
          {[3, 6, 9, 12].map((m) => (
            <button key={m} className={`chip-toggle ${date === defaultTargetDate(m) ? 'on' : ''}`} onClick={() => setDate(defaultTargetDate(m))}>
              {m} Monate
            </button>
          ))}
        </div>
        <input type="date" value={date} min={defaultTargetDate(0)} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Zieldatum" />
      </div>

      <div className="col gap-s">
        <span className="field-label">Was ist dir wichtig?</span>
        <div className="row gap-s wrap">
          {(Object.keys(SKILLS) as Skill[]).map((sk) => (
            <button key={sk} className={`chip-toggle ${skills.includes(sk) ? 'on' : ''}`} onClick={() => toggleSkill(sk)} aria-pressed={skills.includes(sk)}>
              {SKILLS[sk].icon} {SKILLS[sk].label}
            </button>
          ))}
        </div>
        <span className="muted small">Die Tagesquests richten sich danach.</span>
      </div>

      <label className="col gap-s">
        <span className="field-label">Mein Warum (optional)</span>
        <textarea
          rows={2}
          maxLength={160}
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          placeholder="z. B. Im Urlaub selbst Ramen bestellen und mit Einheimischen plaudern"
        />
        <span className="muted small">Wird dir auf der Startseite gezeigt – als Erinnerung, wofür du übst.</span>
      </label>

      <div className="col gap-s">
        <span className="field-label">Wie viel Zeit pro Tag?</span>
        <div className="row gap-s wrap">
          {MINUTES.map((m) => (
            <button key={m.min} className={`chip-toggle ${xp === m.xp ? 'on' : ''}`} onClick={() => setXp(m.xp)}>
              {m.min} Min.
            </button>
          ))}
        </div>
      </div>

      <div className="card small">
        <b>📋 Dein Plan</b>
        <div className="mt">
          {plan.remaining} Lernschritte bis zum Ziel · {Math.max(0, plan.daysLeft)} Tage Zeit
          <br />≈ {Math.ceil(plan.perWeekNeeded)} Schritte pro Woche · empfohlen ≈ {recommended.min} Min. am Tag
        </div>
        {chosen.min < recommended.min ? (
          <div className="notice mt">Mit {chosen.min} Min. wird es knapp – mehr Zeit oder ein späteres Datum macht es entspannter.</div>
        ) : (
          <div className="feedback feedback-ok mt">Das passt – mit {chosen.min} Min. am Tag schaffst du das! 💪</div>
        )}
      </div>

      <button className="btn btn-primary btn-large btn-block" onClick={() => onSave(goal, xp)}>
        {saveLabel}
      </button>
      {onSkip && (
        <button className="btn btn-ghost btn-block" onClick={onSkip}>
          Später festlegen
        </button>
      )}
    </div>
  );
}
