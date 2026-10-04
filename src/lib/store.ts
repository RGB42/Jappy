// Zentraler App-Zustand (Fortschritt + Einstellungen), gespeichert im localStorage.
import { useSyncExternalStore } from 'react';
import type { Level } from '../data/types';
import { DAY, cardId, dayKey, newCard, review, type CardMode, type CardState, type Grade } from './srs';

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
}

export interface DoneEntry {
  best: number; // bestes Ergebnis 0…1
  count: number;
  last: number;
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
  return {
    ...base,
    ...data,
    settings: { ...base.settings, ...data.settings },
    counters: { ...base.counters, ...data.counters },
    newToday: data.newToday ?? base.newToday,
    version: 1,
  };
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

export function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
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
// Aktionen

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function completeOnboarding(level: Level, dailyGoal: number) {
  setState((s) => ({ ...s, onboarded: true, level, settings: { ...s.settings, dailyGoal } }));
}

export function setLevel(level: Level) {
  setState((s) => ({ ...s, level }));
}

/** Vergibt Erfahrungspunkte und pflegt die Tagesserie (Streak). */
export function addXP(amount: number) {
  setState((s) => {
    const today = dayKey();
    let { streak, lastActive } = s;
    if (lastActive !== today) {
      streak = lastActive === dayKey(Date.now() - DAY) ? streak + 1 : 1;
      lastActive = today;
    }
    return { ...s, streak, lastActive, xp: { ...s.xp, [today]: (s.xp[today] ?? 0) + amount } };
  });
}

export function currentStreak(s: AppState): number {
  const today = dayKey();
  const yesterday = dayKey(Date.now() - DAY);
  return s.lastActive === today || s.lastActive === yesterday ? s.streak : 0;
}

export function xpToday(s: AppState): number {
  return s.xp[dayKey()] ?? 0;
}

export function countSpoken() {
  setState((s) => ({ ...s, counters: { ...s.counters, spoken: s.counters.spoken + 1 } }));
}

export function countListened(n = 1) {
  setState((s) => ({ ...s, counters: { ...s.counters, listened: s.counters.listened + n } }));
}

/** Nimmt neue Lernelemente ins Wiederholungssystem auf (Hörkarte sofort, Sprechkarte ab morgen). */
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
    return { ...s, cards, newToday: { day: today, count } };
  });
}

export function newIntroducedToday(s: AppState): number {
  return s.newToday.day === dayKey() ? s.newToday.count : 0;
}

export function gradeCard(id: string, grade: Grade) {
  setState((s) => {
    const card = s.cards[id] ?? newCard(id);
    return {
      ...s,
      cards: { ...s.cards, [id]: review(card, grade) },
      counters: { ...s.counters, reviews: s.counters.reviews + 1 },
    };
  });
}

export function isKnown(s: AppState, itemId: string): boolean {
  return !!s.cards[cardId(itemId, 'listen')];
}

export function dueCards(s: AppState, now = Date.now(), modes: CardMode[] = ['listen', 'speak']): CardState[] {
  return Object.values(s.cards)
    .filter((c) => c.due <= now && modes.some((m) => c.id.endsWith(`:${m}`)))
    .sort((a, b) => a.due - b.due);
}

export function setKanaBox(kana: string, correct: boolean) {
  setState((s) => {
    const box = s.kana[kana] ?? 0;
    return { ...s, kana: { ...s.kana, [kana]: correct ? Math.min(5, box + 1) : Math.max(0, box - 2) } };
  });
}

export function markDone(key: string, score = 1) {
  setState((s) => {
    const prev = s.done[key];
    return {
      ...s,
      done: {
        ...s.done,
        [key]: { best: Math.max(prev?.best ?? 0, score), count: (prev?.count ?? 0) + 1, last: Date.now() },
      },
    };
  });
}

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
