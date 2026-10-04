// Ereignis-Warteschlange für Belohnungen (Toasts, Level-Up, Stempel …) – nur im Speicher, nicht persistent.
import { useSyncExternalStore } from 'react';

export type Celebration =
  | { kind: 'level'; level: number; rankDe: string; rankJp: string; icon: string }
  | { kind: 'achievement'; icon: string; title: string; reward: number }
  | { kind: 'quest'; icon: string; text: string; reward: number }
  | { kind: 'chest'; reward: number }
  | { kind: 'goal' }
  | { kind: 'stamp'; unitId: string }
  | { kind: 'combo'; n: number; bonus: number }
  | { kind: 'freeze'; used: number };

type Entry = Celebration & { uid: number };

let queue: Entry[] = [];
let uid = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function celebrate(events: Celebration[]) {
  if (!events.length) return;
  queue = [...queue, ...events.map((e) => ({ ...e, uid: ++uid }))];
  emit();
}

export function dismiss(id: number) {
  queue = queue.filter((e) => e.uid !== id);
  emit();
}

export function useCelebrations(): Entry[] {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => queue,
  );
}

// ---------------------------------------------------------------------------
// Combo: richtige Antworten in Folge (über alle Übungen hinweg, bis zum ersten Fehler)

let combo = 0;
export function getCombo() {
  return combo;
}
export function bumpCombo(correct: boolean): number {
  combo = correct ? combo + 1 : 0;
  return combo;
}
