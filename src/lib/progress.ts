// Reine Fortschrittsfunktionen (ohne UI/Navigation) – gemeinsam genutzt von Lernpfad, Spiel und Ziel.
import { units, type Step, type Unit } from '../data/curriculum';
import { allKana, type KanaScript } from '../data/kana';
import { stations, type Station } from '../data/stations';
import { cardId } from './srs';
import type { AppState } from './store';

export function isKnown(s: AppState, itemId: string): boolean {
  return !!s.cards[cardId(itemId, 'listen')];
}

export function isStepDone(s: AppState, step: Step): boolean {
  if (step.type === 'learn') return step.items.every((id) => isKnown(s, id));
  const entry = s.done[step.key];
  if (!entry) return false;
  return step.type === 'kana' ? entry.best >= 0.7 : true;
}

export function unitProgress(s: AppState, unit: Unit): { done: number; total: number } {
  return { done: unit.steps.filter((st) => isStepDone(s, st)).length, total: unit.steps.length };
}

export function isUnitComplete(s: AppState, unit: Unit): boolean {
  return unit.steps.every((st) => isStepDone(s, st));
}

export function countDoneSteps(s: AppState): number {
  let n = 0;
  for (const u of units) for (const st of u.steps) if (isStepDone(s, st)) n++;
  return n;
}

/** Anteil sicherer Kana (Leitner-Fach ≥ 3) der Grundzeichen + Striche. */
export function kanaMastery(s: AppState, script: KanaScript): number {
  const list = allKana(script, ['basic', 'dakuten']);
  return list.filter((k) => (s.kana[k] ?? 0) >= 3).length / list.length;
}

/** Station, zu der eine Einheit führt (Reise durch Japan). */
export function stationFor(unit: Unit): Station {
  const idx = units.findIndex((u) => u.id === unit.id);
  return stations[Math.max(0, idx) % stations.length];
}

export function collectedStamps(s: AppState): { unit: Unit; station: Station }[] {
  return units.filter((u) => isUnitComplete(s, u)).map((u) => ({ unit: u, station: stationFor(u) }));
}
