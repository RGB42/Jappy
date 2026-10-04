// Spaced Repetition (verteilte Wiederholung) – angelehnt an SM-2 / Anki.
// Jede Karte wird kurz vor dem Vergessen wiederholt; leichte Karten seltener, schwere öfter.

export type Grade = 0 | 1 | 2 | 3; // Nochmal, Schwer, Gut, Leicht

/** Hörkarte: Japanisch hören → Bedeutung abrufen. Sprechkarte: Deutsch sehen → Japanisch sagen. */
export type CardMode = 'listen' | 'speak';

export interface CardState {
  id: string; // `${itemId}:${mode}`
  ease: number;
  interval: number; // Tage
  reps: number; // erfolgreiche Wiederholungen in Folge
  lapses: number;
  due: number; // Zeitstempel (ms)
  last: number;
}

export const DAY = 24 * 60 * 60 * 1000;
const MIN = 60 * 1000;

export function cardId(itemId: string, mode: CardMode): string {
  return `${itemId}:${mode}`;
}

export function parseCardId(id: string): { itemId: string; mode: CardMode } {
  const i = id.lastIndexOf(':');
  return { itemId: id.slice(0, i), mode: id.slice(i + 1) as CardMode };
}

export function newCard(id: string, now = Date.now()): CardState {
  return { id, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, last: 0 };
}

/** Berechnet den nächsten Zustand einer Karte nach einer Bewertung. */
export function review(card: CardState, grade: Grade, now = Date.now(), rand = Math.random): CardState {
  const c = { ...card, last: now };
  if (grade === 0) {
    c.reps = 0;
    c.lapses += card.reps > 0 ? 1 : 0;
    c.ease = Math.max(1.3, c.ease - 0.2);
    c.interval = 0;
    c.due = now + MIN;
    return c;
  }
  if (c.reps === 0) {
    c.interval = grade === 1 ? 0 : grade === 2 ? 1 : 3;
  } else if (c.reps === 1) {
    c.interval = grade === 1 ? 1 : grade === 2 ? 3 : 6;
  } else {
    const base = Math.max(1, c.interval);
    const factor = grade === 1 ? 1.2 : grade === 2 ? c.ease : c.ease * 1.3;
    c.interval = Math.round(base * factor * (0.95 + rand() * 0.1));
  }
  c.ease = Math.max(1.3, c.ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0));
  c.reps += 1;
  // „Schwer“ bei einer neuen Karte: in 10 Minuten noch einmal.
  c.due = c.interval === 0 ? now + 10 * MIN : startOfDay(now) + c.interval * DAY + 4 * 60 * MIN;
  return c;
}

/** Nächste Fälligkeit als Text, z. B. für die Bewertungs-Buttons. */
export function previewInterval(card: CardState, grade: Grade): string {
  const next = review(card, grade, Date.now(), () => 0.5);
  const diff = next.due - Date.now();
  if (diff < 60 * MIN) return `${Math.max(1, Math.round(diff / MIN))} Min.`;
  const days = next.interval;
  if (days < 30) return `${days} T.`;
  if (days < 365) return `${Math.round(days / 30)} Mon.`;
  return `${(days / 365).toFixed(1)} J.`;
}

export function isDue(card: CardState, now = Date.now()): boolean {
  return card.due <= now;
}

/** Karte gilt als „gefestigt“, wenn sie mindestens 3 Wochen Abstand hat. */
export function isMature(card: CardState): boolean {
  return card.interval >= 21;
}

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dayKey(ts = Date.now()): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
