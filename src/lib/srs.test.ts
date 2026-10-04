import { describe, expect, it } from 'vitest';
import { DAY, newCard, parseCardId, review } from './srs';

const NOW = new Date('2026-01-10T12:00:00').getTime();
const fixed = () => 0.5;

describe('SRS', () => {
  it('„Nochmal“ zeigt die Karte in einer Minute erneut', () => {
    const c = review(newCard('x:listen', NOW), 0, NOW, fixed);
    expect(c.due - NOW).toBe(60_000);
    expect(c.reps).toBe(0);
  });

  it('Intervalle wachsen bei „Gut“', () => {
    let c = newCard('x:listen', NOW);
    const intervals: number[] = [];
    let t = NOW;
    for (let i = 0; i < 5; i++) {
      c = review(c, 2, t, fixed);
      intervals.push(c.interval);
      t = c.due;
    }
    expect(intervals[0]).toBe(1);
    expect(intervals[1]).toBe(3);
    for (let i = 1; i < intervals.length; i++) expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
  });

  it('„Leicht“ gibt längere Abstände als „Gut“, „Schwer“ kürzere', () => {
    const base = { ...newCard('x:speak', NOW), reps: 3, interval: 10 };
    const hard = review(base, 1, NOW, fixed).interval;
    const good = review(base, 2, NOW, fixed).interval;
    const easy = review(base, 3, NOW, fixed).interval;
    expect(hard).toBeLessThan(good);
    expect(good).toBeLessThan(easy);
  });

  it('Leichtigkeitsfaktor fällt nie unter 1.3', () => {
    let c = newCard('x:listen', NOW);
    for (let i = 0; i < 20; i++) c = review(c, 0, NOW, fixed);
    expect(c.ease).toBe(1.3);
  });

  it('fällig am Folgetag nach „Gut“', () => {
    const c = review(newCard('x:listen', NOW), 2, NOW, fixed);
    expect(c.due).toBeGreaterThan(NOW);
    expect(c.due - NOW).toBeLessThan(2 * DAY);
  });

  it('zerlegt Karten-IDs', () => {
    expect(parseCardId('w-taberu:speak')).toEqual({ itemId: 'w-taberu', mode: 'speak' });
  });
});
