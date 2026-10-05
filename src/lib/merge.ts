// Fortschritt zweier Geräte zusammenführen (3-Wege-Merge).
// base   = Stand der letzten Synchronisierung
// local  = Stand auf diesem Gerät
// remote = Stand auf dem Server (z. B. vom Handy hochgeladen)
// Ziel: Nichts geht verloren – XP und Zähler addieren sich, Karteikarten nehmen die neuere Wiederholung,
// Einstellungen: was hier geändert wurde, gewinnt.
import { MAX_FREEZES } from './game';
import { countDoneSteps } from './progress';
import type { CardState } from './srs';
import { initialState, type AppState, type DoneEntry, type Settings } from './store';

/** Einstellungen, die nur für dieses Gerät gelten (Systemstimme, heruntergeladenes Offline-Modell). */
export const DEVICE_SETTINGS: (keyof Settings)[] = ['voiceURI', 'whisper', 'sttEngine'];

/** Tiefer Vergleich, unabhängig von der Reihenfolge der Schlüssel (der Server sortiert sie um). */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    const bb = b as unknown[];
    return a.length === bb.length && a.every((x, i) => deepEqual(x, bb[i]));
  }
  const ka = Object.keys(a).filter((k) => (a as Record<string, unknown>)[k] !== undefined);
  const kb = Object.keys(b).filter((k) => (b as Record<string, unknown>)[k] !== undefined);
  return ka.length === kb.length && ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

type Merge<T> = (base: T | undefined, local: T | undefined, remote: T | undefined) => T | undefined;

/** Nur eine Seite geändert → diese; beide → `both`. */
const threeWay =
  <T,>(both: (local: T, remote: T, base: T | undefined) => T | undefined): Merge<T> =>
  (b, l, r) => {
    if (deepEqual(l, b)) return r;
    if (deepEqual(r, b)) return l;
    if (l === undefined) return r;
    if (r === undefined) return l;
    return both(l, r, b);
  };

/** Einfacher Wert: Änderung auf diesem Gerät gewinnt. */
const pick = <T,>(b: T | undefined, l: T | undefined, r: T | undefined): T | undefined => (deepEqual(l, b) ? r : l);

/** Zähler: Zuwachs beider Seiten addieren. */
const add = (b = 0, l = 0, r = 0) => r + (l - b);

function mergeMap<V>(b: Record<string, V> | undefined, l: Record<string, V>, r: Record<string, V>, merge: Merge<V>) {
  const out: Record<string, V> = {};
  for (const k of new Set([...Object.keys(r ?? {}), ...Object.keys(l ?? {})])) {
    const v = merge(b?.[k], l?.[k], r?.[k]);
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/** Menge: Hinzugefügtes beider Seiten behalten, Entferntes entfernen. */
function mergeSet(b: string[] = [], l: string[] = [], r: string[] = []): string[] {
  const removed = new Set([...b.filter((x) => !l.includes(x)), ...b.filter((x) => !r.includes(x))]);
  return [...new Set([...r, ...l])].filter((x) => !removed.has(x));
}

const mergeCard = threeWay<CardState>((l, r) => (l.last >= r.last ? l : r));
const mergeDone = threeWay<DoneEntry>((l, r, b) => ({
  best: Math.max(l.best, r.best),
  count: add(b?.count, l.count, r.count),
  last: Math.max(l.last, r.last),
}));
const mergeCount: Merge<number> = (b, l, r) => {
  const v = add(b, l, r);
  return v > 0 ? v : undefined;
};

/** Tageszähler ({ day, … }): neuerer Tag gewinnt; am selben Tag Zuwachs addieren. */
function sameDay<T extends { day: string }>(b: T | undefined, l: T, r: T, combine: (b: T | undefined, l: T, r: T) => T): T {
  if (l.day !== r.day) return l.day > r.day ? l : r;
  return combine(b?.day === l.day ? b : undefined, l, r);
}

export function mergeStates(base: AppState | null, local: AppState, remote: AppState): AppState {
  const b = base ?? initialState();
  const l = local;
  const r = remote;

  const settings = { ...r.settings } as Settings;
  for (const k of new Set([...Object.keys(r.settings), ...Object.keys(l.settings)]) as Set<keyof Settings>) {
    (settings as unknown as Record<string, unknown>)[k] = DEVICE_SETTINGS.includes(k) ? l.settings[k] : pick(b.settings[k], l.settings[k], r.settings[k]);
  }

  // Serie: der Stand mit dem jüngsten aktiven Tag zählt.
  const streakOf = (s: AppState) => ({ streak: s.streak, lastActive: s.lastActive });
  const streak =
    threeWay<{ streak: number; lastActive: string }>((x, y) =>
      x.lastActive !== y.lastActive ? (x.lastActive > y.lastActive ? x : y) : x.streak >= y.streak ? x : y,
    )(streakOf(b), streakOf(l), streakOf(r)) ?? streakOf(r);

  const recs = { ...r.records };
  for (const k of ['perfect', 'goalDays', 'quests', 'drawn'] as const) recs[k] = Math.max(0, add(b.records[k], l.records[k], r.records[k]));
  recs.maxCombo = Math.max(l.records.maxCombo, r.records.maxCombo);
  recs.blitzBest = Math.max(l.records.blitzBest, r.records.blitzBest);
  recs.earlyBird = l.records.earlyBird || r.records.earlyBird;
  recs.nightOwl = l.records.nightOwl || r.records.nightOwl;

  const merged: AppState = {
    ...r,
    ...l,
    version: 1,
    onboarded: l.onboarded || r.onboarded,
    level: pick(b.level, l.level, r.level) ?? r.level,
    settings,
    cards: mergeMap(b.cards, l.cards, r.cards, mergeCard),
    kana: mergeMap(b.kana, l.kana, r.kana, threeWay<number>((x, y) => Math.max(x, y))),
    done: mergeMap(b.done, l.done, r.done, mergeDone),
    xp: mergeMap(b.xp, l.xp, r.xp, mergeCount),
    ...streak,
    newToday: sameDay(b.newToday, l.newToday, r.newToday, (bb, x, y) => ({ day: x.day, count: add(bb?.count, x.count, y.count) })),
    counters: {
      spoken: add(b.counters.spoken, l.counters.spoken, r.counters.spoken),
      listened: add(b.counters.listened, l.counters.listened, r.counters.listened),
      reviews: add(b.counters.reviews, l.counters.reviews, r.counters.reviews),
    },
    goal: pick(b.goal, l.goal, r.goal) ?? null,
    coins: Math.max(0, add(b.coins, l.coins, r.coins)),
    freezes: Math.min(MAX_FREEZES, Math.max(0, add(b.freezes, l.freezes, r.freezes))),
    owned: mergeSet(b.owned, l.owned, r.owned),
    achievements: mergeMap(b.achievements, l.achievements, r.achievements, threeWay<number>((x, y) => Math.min(x, y))),
    daily: sameDay(b.daily, l.daily, r.daily, (bb, x, y) => {
      const counts: AppState['daily']['counts'] = {};
      for (const k of new Set([...Object.keys(x.counts), ...Object.keys(y.counts)]) as Set<keyof typeof counts>) {
        // Combo ist ein Bestwert, alles andere zählt hoch.
        counts[k] = k === 'combo' ? Math.max(x.counts[k] ?? 0, y.counts[k] ?? 0) : add(bb?.counts[k], x.counts[k], y.counts[k]);
      }
      return { day: x.day, counts, claimed: mergeSet(bb?.claimed, x.claimed, y.claimed) };
    }),
    stampsSeen: mergeSet(b.stampsSeen, l.stampsSeen, r.stampsSeen),
    stepLog: mergeMap(b.stepLog, l.stepLog, r.stepLog, mergeCount),
    records: recs,
  };
  merged.stepsDone = countDoneSteps(merged);
  return merged;
}
