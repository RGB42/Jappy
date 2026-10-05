// Zentraler App-Zustand (Fortschritt, Ziel, Spielstand, Einstellungen), gespeichert im localStorage.
import { useSyncExternalStore } from 'react';
import type { Level } from '../data/types';
import { celebrate, type Celebration } from './celebrate';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_REWARD,
  CHEST_REWARD,
  MAX_FREEZES,
  SHOP,
  achievementContext,
  levelInfo,
  questsFor,
  totalXP,
  type Metric,
} from './game';
import { daysBetween, syncStepLog, type Goal } from './goal';
import { collectedStamps, countDoneSteps } from './progress';
import { cardId, dayKey, DAY, newCard, review, type CardMode, type CardState, type Grade } from './srs';

export { isKnown } from './progress';

export interface Settings {
  rate: number; // Sprechtempo der Sprachausgabe
  voiceURI?: string;
  script: 'kana' | 'both' | 'kanji'; // Anzeige: nur Kana / Kanji + Kana / nur Kanji
  romaji: boolean;
  audioFirst: boolean; // Text erst nach dem Hören zeigen
  newPerDay: number;
  dailyGoal: number; // XP pro Tag
  theme: 'auto' | 'light' | 'dark';
  autoPlay: boolean; // Audio automatisch abspielen
  sound: boolean; // Sound-Effekte
  accent: string; // Farbthema (siehe THEMES)
  reminder: string; // Uhrzeit für die tägliche Erinnerung, z. B. "19:00"
  audioSource: 'clips' | 'browser'; // eingebaute Aufnahmen oder Browser-Stimme
  whisper: 'off' | 'fast'; // Offline-Spracherkennung (KI-Modell im Browser)
  sttEngine: 'auto' | 'whisper'; // auto = Browser-Erkennung, falls vorhanden
  glossView: boolean; // Satzbau farbig zeigen (Wort-für-Wort-Zuordnung Japanisch ↔ Deutsch)
}

export interface DoneEntry {
  best: number; // bestes Ergebnis 0…1
  count: number;
  last: number;
}

export interface Records {
  perfect: number;
  goalDays: number;
  quests: number;
  maxCombo: number;
  blitzBest: number;
  drawn: number;
  earlyBird: boolean;
  nightOwl: boolean;
}

export interface AppState {
  version: 1;
  onboarded: boolean;
  level: Level;
  settings: Settings;
  cards: Record<string, CardState>;
  kana: Record<string, number>; // Leitner-Fach 0…5 pro Kana
  done: Record<string, DoneEntry>; // abgeschlossene Lektionen, Dialoge, Geschichten …
  xp: Record<string, number>; // XP pro Tag (YYYY-MM-DD)
  streak: number;
  lastActive: string;
  newToday: { day: string; count: number };
  counters: { spoken: number; listened: number; reviews: number };
  // Ziel & Spiel
  goal: Goal | null;
  coins: number; // Yen in der Reisekasse
  freezes: number; // Streak-Schutz
  owned: string[]; // gekaufte Souvenirs/Farben
  achievements: Record<string, number>; // id → Zeitpunkt
  daily: { day: string; counts: Partial<Record<Metric, number>>; claimed: string[] };
  stampsSeen: string[];
  stepLog: Record<string, number>; // abgeschlossene Lernpfad-Schritte pro Tag
  stepsDone: number;
  records: Records;
}

const KEY = 'jappy:v1';

export const defaultSettings: Settings = {
  rate: 0.9,
  script: 'both',
  romaji: true,
  audioFirst: true,
  newPerDay: 10,
  dailyGoal: 50,
  theme: 'auto',
  autoPlay: true,
  sound: true,
  accent: 'beni',
  reminder: '19:00',
  audioSource: 'clips',
  whisper: 'off',
  sttEngine: 'auto',
  glossView: true,
};

const defaultRecords: Records = {
  perfect: 0,
  goalDays: 0,
  quests: 0,
  maxCombo: 0,
  blitzBest: 0,
  drawn: 0,
  earlyBird: false,
  nightOwl: false,
};

export function initialState(): AppState {
  return {
    version: 1,
    onboarded: false,
    level: 1,
    settings: { ...defaultSettings },
    cards: {},
    kana: {},
    done: {},
    xp: {},
    streak: 0,
    lastActive: '',
    newToday: { day: '', count: 0 },
    counters: { spoken: 0, listened: 0, reviews: 0 },
    goal: null,
    coins: 0,
    freezes: 0,
    owned: [],
    achievements: {},
    daily: { day: '', counts: {}, claimed: [] },
    stampsSeen: [],
    stepLog: {},
    stepsDone: 0,
    records: { ...defaultRecords },
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    return migrate(JSON.parse(raw));
  } catch {
    return initialState();
  }
}

function migrate(data: Partial<AppState>): AppState {
  const base = initialState();
  const merged: AppState = {
    ...base,
    ...data,
    settings: { ...base.settings, ...data.settings },
    counters: { ...base.counters, ...data.counters },
    records: { ...base.records, ...data.records },
    daily: data.daily ?? base.daily,
    newToday: data.newToday ?? base.newToday,
    version: 1,
  };
  // Ältere Spielstände: bisherigen Fortschritt nicht als „heute geschafft“ zählen.
  if (data.stepsDone === undefined) merged.stepsDone = countDoneSteps(merged);
  if (data.stampsSeen === undefined) merged.stampsSeen = collectedStamps(merged).map((x) => x.unit.id);
  return merged;
}

let state: AppState = typeof localStorage !== 'undefined' ? load() : initialState();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Speicher voll oder nicht verfügbar – App läuft trotzdem weiter */
  }
}

export function getState(): AppState {
  return state;
}

/**
 * Zustand ändern. Danach werden Belohnungen ausgewertet (Level-Up, Quests, Stempel, Abzeichen)
 * und als Feier-Ereignisse gemeldet.
 */
export function setState(updater: (s: AppState) => AppState) {
  const prev = state;
  let next = updater(prev);
  const events: Celebration[] = [];
  if (next.onboarded && prev.onboarded) next = rewards(prev, next, events);
  state = next;
  persist();
  listeners.forEach((l) => l());
  celebrate(events);
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function useSettings(): Settings {
  return useAppState().settings;
}

// ---------------------------------------------------------------------------
// Belohnungen

function rewards(prev: AppState, input: AppState, events: Celebration[]): AppState {
  let s = syncStepLog(prev, input);
  let coins = s.coins;
  const records = { ...s.records };

  // Level-Up
  const before = levelInfo(totalXP(prev));
  const after = levelInfo(totalXP(s));
  if (after.level > before.level) {
    coins += 100 * (after.level - before.level);
    events.push({ kind: 'level', level: after.level, rankDe: after.rank.de, rankJp: after.rank.jp, icon: after.rank.icon });
  }

  // Tagesziel
  const goal = s.settings.dailyGoal;
  if (xpToday(prev) < goal && xpToday(s) >= goal) {
    records.goalDays++;
    events.push({ kind: 'goal' });
  }

  // Tagesquests
  const today = dayKey();
  if (s.daily.day === today) {
    const claimed = [...s.daily.claimed];
    const quests = questsFor(s, today);
    for (const q of quests) {
      if (!claimed.includes(q.id) && (s.daily.counts[q.metric] ?? 0) >= q.target) {
        claimed.push(q.id);
        coins += q.reward;
        records.quests++;
        events.push({ kind: 'quest', icon: q.icon, text: q.text, reward: q.reward });
      }
    }
    if (!claimed.includes('chest') && quests.every((q) => claimed.includes(q.id))) {
      claimed.push('chest');
      coins += CHEST_REWARD;
      events.push({ kind: 'chest', reward: CHEST_REWARD });
    }
    s = { ...s, daily: { ...s.daily, claimed } };
  }

  // Reise-Stempel
  const stamps = collectedStamps(s).filter((x) => !s.stampsSeen.includes(x.unit.id));
  if (stamps.length) {
    coins += 300 * stamps.length;
    for (const x of stamps) events.push({ kind: 'stamp', unitId: x.unit.id });
    s = { ...s, stampsSeen: [...s.stampsSeen, ...stamps.map((x) => x.unit.id)] };
  }

  // Abzeichen
  s = { ...s, records };
  const ctx = achievementContext(s, currentStreak(s));
  const unlocked = { ...s.achievements };
  for (const a of ACHIEVEMENTS) {
    if (!unlocked[a.id] && a.check(s, ctx)) {
      unlocked[a.id] = Date.now();
      coins += ACHIEVEMENT_REWARD;
      events.push({ kind: 'achievement', icon: a.icon, title: a.title, reward: ACHIEVEMENT_REWARD });
    }
  }
  return { ...s, coins, achievements: unlocked };
}

function bump(s: AppState, metric: Metric, n = 1, mode: 'add' | 'max' = 'add'): AppState {
  const today = dayKey();
  const fresh = s.daily.day !== today;
  const counts = fresh ? {} : s.daily.counts;
  const cur = counts[metric] ?? 0;
  return {
    ...s,
    daily: {
      day: today,
      counts: { ...counts, [metric]: mode === 'max' ? Math.max(cur, n) : cur + n },
      claimed: fresh ? [] : s.daily.claimed,
    },
  };
}

// ---------------------------------------------------------------------------
// Aktionen

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function completeOnboarding(level: Level, dailyGoal: number, goal: Goal | null = null) {
  setState((s) => ({ ...s, onboarded: true, level, goal, settings: { ...s.settings, dailyGoal } }));
}

export function setGoal(goal: Goal | null, dailyGoal?: number) {
  setState((s) => ({ ...s, goal, settings: dailyGoal ? { ...s.settings, dailyGoal } : s.settings }));
}

export function setLevel(level: Level) {
  setState((s) => ({ ...s, level }));
}

/** Vergibt Erfahrungspunkte (+ gleich viele Yen) und pflegt die Tagesserie inkl. Streak-Schutz. */
export function addXP(amount: number) {
  const events: Celebration[] = [];
  setState((s) => {
    const today = dayKey();
    let { streak, lastActive, freezes } = s;
    if (lastActive !== today) {
      const gap = lastActive ? daysBetween(lastActive, today) : Infinity;
      const missed = gap - 1;
      if (gap === 1) streak += 1;
      else if (missed > 0 && missed <= freezes) {
        freezes -= missed;
        streak += 1;
        events.push({ kind: 'freeze', used: missed });
      } else streak = 1;
      lastActive = today;
    }
    const h = new Date().getHours();
    const records = { ...s.records, earlyBird: s.records.earlyBird || h < 8, nightOwl: s.records.nightOwl || h >= 22 };
    const next = { ...s, streak, lastActive, freezes, records, coins: s.coins + amount, xp: { ...s.xp, [today]: (s.xp[today] ?? 0) + amount } };
    return bump(next, 'xp', amount);
  });
  celebrate(events);
}

/** Serie inkl. Streak-Schutz: verpasste Tage werden gedeckt, solange genug Schutz da ist. */
export function currentStreak(s: AppState): number {
  if (!s.lastActive) return 0;
  const missed = daysBetween(s.lastActive, dayKey()) - 1;
  return missed <= 0 || missed <= s.freezes ? s.streak : 0;
}

/** Wird die Serie gerade durch Streak-Schutz gerettet? */
export function streakProtected(s: AppState): boolean {
  if (!s.lastActive) return false;
  const missed = daysBetween(s.lastActive, dayKey()) - 1;
  return missed > 0 && missed <= s.freezes;
}

export function xpToday(s: AppState): number {
  return s.xp[dayKey()] ?? 0;
}

export function countSpoken(perfect = false) {
  setState((s) => {
    let next: AppState = { ...s, counters: { ...s.counters, spoken: s.counters.spoken + 1 } };
    next = bump(next, 'spoken');
    if (perfect) next = bump({ ...next, records: { ...next.records, perfect: next.records.perfect + 1 } }, 'perfect');
    return next;
  });
}

export function countListened(n = 1) {
  setState((s) => ({ ...s, counters: { ...s.counters, listened: s.counters.listened + n } }));
}

export function countShadow() {
  setState((s) => bump(s, 'shadow'));
}

export function countDrawn() {
  setState((s) => bump({ ...s, records: { ...s.records, drawn: s.records.drawn + 1 } }, 'draw'));
}

/** Combo melden; jede 5er-Stufe gibt Bonus-XP. */
export function reportCombo(n: number) {
  if (n < 2) return;
  setState((s) => bump({ ...s, records: { ...s.records, maxCombo: Math.max(s.records.maxCombo, n) } }, 'combo', n, 'max'));
  if (n % 5 === 0) {
    addXP(n);
    celebrate([{ kind: 'combo', n, bonus: n }]);
  }
}

export function reportBlitz(score: number) {
  setState((s) => bump({ ...s, records: { ...s.records, blitzBest: Math.max(s.records.blitzBest, score) } }, 'blitz'));
}

/** Nimmt neue Lernelemente ins Wiederholungssystem auf (Hörkarte ab morgen, Sprechkarte nach einigen Stunden). */
export function introduceItems(itemIds: string[]) {
  setState((s) => {
    const now = Date.now();
    const cards = { ...s.cards };
    let added = 0;
    for (const id of itemIds) {
      const listenId = cardId(id, 'listen');
      if (!cards[listenId]) {
        cards[listenId] = { ...newCard(listenId, now), reps: 1, interval: 1, due: now + DAY };
        added++;
      }
      const speakId = cardId(id, 'speak');
      if (!cards[speakId]) cards[speakId] = { ...newCard(speakId, now), due: now + DAY / 2 };
    }
    const today = dayKey();
    const count = (s.newToday.day === today ? s.newToday.count : 0) + added;
    return bump({ ...s, cards, newToday: { day: today, count } }, 'learned', added);
  });
}

export function newIntroducedToday(s: AppState): number {
  return s.newToday.day === dayKey() ? s.newToday.count : 0;
}

export function gradeCard(id: string, grade: Grade) {
  setState((s) => {
    const card = s.cards[id] ?? newCard(id);
    return bump(
      {
        ...s,
        cards: { ...s.cards, [id]: review(card, grade) },
        counters: { ...s.counters, reviews: s.counters.reviews + 1 },
      },
      'reviewed',
    );
  });
}

export function dueCards(s: AppState, now = Date.now(), modes: CardMode[] = ['listen', 'speak']): CardState[] {
  return Object.values(s.cards)
    .filter((c) => c.due <= now && modes.some((m) => c.id.endsWith(`:${m}`)))
    .sort((a, b) => a.due - b.due);
}

export function setKanaBox(kana: string, correct: boolean) {
  setState((s) => {
    const box = s.kana[kana] ?? 0;
    const next = { ...s, kana: { ...s.kana, [kana]: correct ? Math.min(5, box + 1) : Math.max(0, box - 2) } };
    return correct ? bump(next, 'kana') : next;
  });
}

const DONE_METRIC: [string, Metric][] = [
  ['dialogue:', 'dialogue'],
  ['story:', 'story'],
  ['listen:', 'listen'],
  ['pairs', 'listen'],
  ['grammar:', 'grammar'],
  ['audio-lesson', 'audio'],
  ['blitz', 'blitz'],
];

export function markDone(key: string, score = 1) {
  setState((s) => {
    const prev = s.done[key];
    const next = {
      ...s,
      done: {
        ...s.done,
        [key]: { best: Math.max(prev?.best ?? 0, score), count: (prev?.count ?? 0) + 1, last: Date.now() },
      },
    };
    const metric = DONE_METRIC.find(([p]) => key.startsWith(p))?.[1];
    return metric && metric !== 'blitz' ? bump(next, metric) : next;
  });
}

// ---------------------------------------------------------------------------
// Laden

export function canBuy(s: AppState, itemId: string): boolean {
  const item = SHOP.find((i) => i.id === itemId);
  if (!item || s.coins < item.price) return false;
  if (item.kind === 'freeze') return s.freezes < MAX_FREEZES;
  return !s.owned.includes(itemId);
}

export function buy(itemId: string): boolean {
  const s = getState();
  if (!canBuy(s, itemId)) return false;
  const item = SHOP.find((i) => i.id === itemId)!;
  setState((st) => ({
    ...st,
    coins: st.coins - item.price,
    freezes: item.kind === 'freeze' ? st.freezes + 1 : st.freezes,
    owned: item.kind === 'freeze' ? st.owned : [...st.owned, itemId],
    settings: item.kind === 'theme' ? { ...st.settings, accent: itemId.replace('theme-', '') } : st.settings,
  }));
  return true;
}

// ---------------------------------------------------------------------------
// Daten

export function resetAll() {
  setState(() => initialState());
}

export function exportProgress(): string {
  return JSON.stringify(state, null, 2);
}

export function importProgress(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (typeof data !== 'object' || data.version !== 1) return false;
    setState(() => migrate(data));
    return true;
  } catch {
    return false;
  }
}
