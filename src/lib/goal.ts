// Persönliches Lernziel: Zieltyp + Datum + Fähigkeiten → Zielumfang, Meilensteine, Prognose.
// Grundlage: Zielsetzungstheorie (Locke & Latham) – konkrete, terminierte Ziele motivieren stärker.
import { units, type Step } from '../data/curriculum';
import { dialogueById, stories } from '../data/index';
import type { Level } from '../data/types';
import { countDoneSteps, isKnown, isStepDone, isUnitComplete, kanaMastery } from './progress';
import { DAY, cardId, dayKey } from './srs';
import type { AppState } from './store';

export type Skill = 'read' | 'speak' | 'listen' | 'write';
export type GoalType = 'travel' | 'basics' | 'conversation' | 'advanced';

export interface Goal {
  type: GoalType;
  title: string;
  why?: string; // „Mein Warum“ in eigenen Worten
  targetDate: string; // YYYY-MM-DD
  skills: Skill[];
  createdAt: number;
}

export const SKILLS: Record<Skill, { label: string; icon: string }> = {
  read: { label: 'Lesen', icon: '📖' },
  speak: { label: 'Sprechen', icon: '🗣️' },
  listen: { label: 'Verstehen', icon: '👂' },
  write: { label: 'Schreiben', icon: '✍️' },
};

export const GOAL_TEMPLATES: Record<GoalType, { title: string; icon: string; desc: string; skills: Skill[]; level: Level }> = {
  travel: {
    title: 'Japan-Urlaub',
    icon: '✈️',
    desc: 'Alle Basics für die Reise: Kana lesen, bestellen, einkaufen, Weg finden, Hotel – sprechen und verstehen.',
    skills: ['read', 'speak', 'listen'],
    level: 1,
  },
  basics: {
    title: 'Grundlagen (≈ JLPT N5)',
    icon: '🌱',
    desc: 'Solide Basis: Hiragana, Katakana, Grundwortschatz und einfache Sätze.',
    skills: ['read', 'speak', 'listen', 'write'],
    level: 1,
  },
  conversation: {
    title: 'Gespräche führen (≈ N4)',
    icon: '💬',
    desc: 'Mit Freunden und im Alltag reden, von Erlebnissen erzählen, Meinungen sagen.',
    skills: ['speak', 'listen'],
    level: 1,
  },
  advanced: {
    title: 'Fortgeschritten & Beruf (≈ N3)',
    icon: '💼',
    desc: 'Keigo, natürliche Umgangssprache und komplexere Satzmuster.',
    skills: ['speak', 'listen', 'read'],
    level: 2,
  },
};

// Reise-relevante Einheiten der Grundstufe: Hotel & Bitten, Arzt & Apotheke, Einkaufen.
const TRAVEL_EXTRA_UNITS = ['u10', 'u11', 'u12'];

function levelsFor(type: GoalType): Level[] {
  return type === 'conversation' ? [1, 2] : type === 'advanced' ? [2, 3] : [1];
}

/** Alle Lernpfad-Schritte, die zum Ziel gehören. */
export function targetSteps(goal: Goal): Step[] {
  const levels = levelsFor(goal.type);
  return units
    .filter((u) => levels.includes(u.level) || (goal.type === 'travel' && TRAVEL_EXTRA_UNITS.includes(u.id)))
    .flatMap((u) => u.steps);
}

export interface Milestone {
  label: string;
  icon: string;
  done: boolean;
  route: { path: string; params?: Record<string, string | number> };
}

const dlg = (s: AppState, id: string) => !!s.done[`dialogue:${id}`];
const unitDone = (s: AppState, id: string) => {
  const u = units.find((x) => x.id === id);
  return !!u && isUnitComplete(s, u);
};

/** Kann-Beschreibungen („Ich kann …“) als Reise-Checkliste bzw. aus den Einheiten. */
export function milestones(goal: Goal, s: AppState): Milestone[] {
  if (goal.type === 'travel') {
    const d = (id: string): Milestone['route'] => ({ path: '/dialogue', params: { id } });
    const list: Milestone[] = [
      { icon: '🙇', label: 'Grüßen, danken, entschuldigen', done: unitDone(s, 'u1'), route: { path: '/path' } },
      { icon: 'あ', label: 'Hiragana lesen', done: kanaMastery(s, 'hiragana') >= 0.9, route: { path: '/kana', params: { script: 'hiragana' } } },
      { icon: 'ア', label: 'Katakana lesen (Speisekarten, Schilder)', done: kanaMastery(s, 'katakana') >= 0.9, route: { path: '/kana', params: { script: 'katakana' } } },
      { icon: '🙋', label: 'Mich vorstellen', done: dlg(s, 'd-jikoshoukai'), route: d('d-jikoshoukai') },
      { icon: '🔢', label: 'Zahlen & Preise verstehen', done: unitDone(s, 'u3'), route: { path: '/path' } },
      { icon: '🏪', label: 'Im Konbini einkaufen', done: dlg(s, 'd-konbini'), route: d('d-konbini') },
      { icon: '☕', label: 'Im Café bestellen', done: dlg(s, 'd-kissaten'), route: d('d-kissaten') },
      { icon: '🍜', label: 'Im Restaurant bestellen & zahlen', done: dlg(s, 'd-resutoran'), route: d('d-resutoran') },
      { icon: '🗺️', label: 'Nach dem Weg fragen', done: dlg(s, 'd-michi'), route: d('d-michi') },
      { icon: '🚄', label: 'Zugtickets kaufen', done: dlg(s, 'd-kippu'), route: d('d-kippu') },
      { icon: '⏰', label: 'Uhrzeiten & Verabredungen', done: dlg(s, 'd-yakusoku'), route: d('d-yakusoku') },
      { icon: '🏨', label: 'Im Hotel einchecken', done: dlg(s, 'd-hoteru'), route: d('d-hoteru') },
      { icon: '💊', label: 'Beim Arzt / in der Apotheke', done: dlg(s, 'd-byouin'), route: d('d-byouin') },
      { icon: '👕', label: 'Kleidung kaufen & anprobieren', done: dlg(s, 'd-fuku'), route: d('d-fuku') },
      {
        icon: '📻',
        label: 'Einfache Gespräche verstehen',
        done: stories.filter((st) => st.level === 1).every((st) => s.done[`story:${st.id}`]),
        route: { path: '/stories' },
      },
    ];
    return list.filter((m) => m.route.path !== '/dialogue' || dialogueById.has(String(m.route.params?.id)));
  }
  const levels = levelsFor(goal.type);
  return units
    .filter((u) => levels.includes(u.level) && !u.id.startsWith('u-mix'))
    .map((u) => ({ icon: '🎯', label: u.goal.replace(/^Du kannst /, '').replace(/\.$/, ''), done: isUnitComplete(s, u), route: { path: '/path' } }));
}

/** Fähigkeiten 0…1 bezogen auf den Zielumfang. */
export function skillScores(goal: Goal, s: AppState): Record<Skill, number> {
  const steps = targetSteps(goal);
  const items = steps.flatMap((st) => (st.type === 'learn' ? st.items : []));
  const dialogs = steps.filter((st) => st.type === 'dialogue');
  const levels = levelsFor(goal.type);
  const storyList = stories.filter((st) => levels.includes(st.level));
  const frac = (n: number, d: number) => (d ? Math.min(1, n / d) : 0);
  const solid = (mode: 'listen' | 'speak') => items.filter((id) => (s.cards[cardId(id, mode)]?.reps ?? 0) >= 2).length;
  const known = items.filter((id) => isKnown(s, id)).length;
  const hira = kanaMastery(s, 'hiragana');
  const kata = kanaMastery(s, 'katakana');
  return {
    read: 0.4 * hira + 0.4 * kata + 0.2 * frac(known, items.length),
    speak:
      0.5 * frac(solid('speak'), items.length) +
      0.3 * frac(dialogs.filter((d) => isStepDone(s, d)).length, dialogs.length) +
      0.2 * frac(s.counters.spoken, 300),
    listen:
      0.5 * frac(solid('listen'), items.length) +
      0.3 * frac(storyList.filter((st) => s.done[`story:${st.id}`]).length, storyList.length) +
      0.2 * frac(s.counters.listened, 600),
    write: 0.35 * hira + 0.35 * kata + 0.3 * frac(s.records.drawn, 150),
  };
}

export function parseDay(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function daysBetween(fromKey: string, toKey: string): number {
  return Math.round((parseDay(toKey) - parseDay(fromKey)) / DAY);
}

export type GoalStatus = 'done' | 'ahead' | 'ontrack' | 'behind' | 'start' | 'overdue';

export interface Forecast {
  total: number;
  done: number;
  remaining: number;
  daysLeft: number;
  perWeekNeeded: number;
  ratePerWeek: number; // tatsächliches Tempo (letzte 14 Tage)
  finish?: number; // voraussichtliches Ziel-Datum (ms)
  status: GoalStatus;
  recommendedXP: number;
  minutesPerDay: number;
}

const XP_PER_STEP = 35;
const MIN_PER_STEP = 7;

export function forecast(goal: Goal, s: AppState, now = Date.now()): Forecast {
  const steps = targetSteps(goal);
  const total = steps.length;
  const done = steps.filter((st) => isStepDone(s, st)).length;
  const remaining = total - done;
  const today = dayKey(now);
  const daysLeft = daysBetween(today, goal.targetDate);
  const weeksLeft = Math.max(daysLeft, 1) / 7;
  const perWeekNeeded = remaining / weeksLeft;
  // Tempo der letzten bis zu 14 Tage – bei frischen Zielen nur seit dem Start messen.
  const sinceStart = Math.max(0, Math.floor((now - goal.createdAt) / DAY));
  const window = Math.min(14, sinceStart + 1);
  let recent = 0;
  for (let i = 0; i < window; i++) recent += s.stepLog[dayKey(now - i * DAY)] ?? 0;
  const ratePerWeek = (recent / window) * 7;
  const finish = ratePerWeek > 0 ? now + (remaining / ratePerWeek) * 7 * DAY : undefined;
  let status: GoalStatus;
  if (remaining === 0) status = 'done';
  else if (daysLeft < 0) status = 'overdue';
  else if (!finish || sinceStart < 3) status = 'start';
  else {
    const slack = parseDay(goal.targetDate) - finish;
    status = slack > 21 * DAY ? 'ahead' : slack >= 0 ? 'ontrack' : 'behind';
  }
  const perDay = remaining / Math.max(daysLeft, 1);
  // Neue Lernschritte + Wiederholungen (die mit dem Wortschatz wachsen).
  const recommendedXP = Math.min(150, Math.max(30, Math.round((perDay * XP_PER_STEP + 25) / 10) * 10));
  return {
    total,
    done,
    remaining,
    daysLeft,
    perWeekNeeded,
    ratePerWeek,
    finish,
    status,
    recommendedXP,
    minutesPerDay: Math.max(10, Math.round(perDay * MIN_PER_STEP + 8)),
  };
}

export const STATUS_TEXT: Record<GoalStatus, string> = {
  done: 'Ziel erreicht! 🎉',
  ahead: 'Du bist dem Plan voraus 🚀',
  ontrack: 'Im Plan ✓',
  behind: 'Etwas hinter dem Plan – ein paar Minuten mehr pro Tag reichen',
  start: 'Guter Start! Nach ein paar Tagen zeigt Jappy dir hier deine Prognose',
  overdue: 'Zieldatum erreicht – setz dir ein neues Ziel!',
};

/** Hält das tägliche Protokoll abgeschlossener Lernpfad-Schritte aktuell (für die Prognose). */
export function syncStepLog(prev: AppState, next: AppState): AppState {
  const count = countDoneSteps(next);
  if (count === next.stepsDone) return next;
  const today = dayKey();
  const diff = count - (prev.stepsDone ?? count);
  return {
    ...next,
    stepsDone: count,
    stepLog: diff > 0 ? { ...next.stepLog, [today]: (next.stepLog[today] ?? 0) + diff } : next.stepLog,
  };
}

export function defaultTargetDate(months = 9, now = Date.now()): string {
  const d = new Date(now);
  d.setMonth(d.getMonth() + months);
  return dayKey(d.getTime());
}
