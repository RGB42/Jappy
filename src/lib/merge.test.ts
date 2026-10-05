import { describe, expect, it } from 'vitest';
import { deepEqual, mergeStates } from './merge';
import { initialState, type AppState } from './store';

const card = (id: string, last: number, interval = 1) => ({ id, ease: 2.5, interval, reps: 1, lapses: 0, due: last + 86400000, last });

function base(): AppState {
  return {
    ...initialState(),
    onboarded: true,
    xp: { '2026-10-01': 50 },
    coins: 100,
    cards: { 'w-a:listen': card('w-a:listen', 1000) },
    owned: ['theme-sakura'],
    achievements: { first: 1 },
    counters: { spoken: 10, listened: 20, reviews: 5 },
    streak: 3,
    lastActive: '2026-10-01',
  };
}

describe('mergeStates', () => {
  it('addiert XP, Yen und Zähler beider Geräte', () => {
    const b = base();
    const phone = { ...b, xp: { ...b.xp, '2026-10-02': 30 }, coins: b.coins + 30, counters: { ...b.counters, spoken: 14 } };
    const pc = { ...b, xp: { ...b.xp, '2026-10-02': 20 }, coins: b.coins + 20 - 50, counters: { ...b.counters, spoken: 11 } };
    const m = mergeStates(b, phone, pc);
    expect(m.xp).toEqual({ '2026-10-01': 50, '2026-10-02': 50 });
    expect(m.coins).toBe(100);
    expect(m.counters.spoken).toBe(15);
  });

  it('Karteikarten: neuere Wiederholung gewinnt, neue Karten von beiden Seiten bleiben', () => {
    const b = base();
    const phone = { ...b, cards: { ...b.cards, 'w-a:listen': card('w-a:listen', 5000, 4), 'w-b:listen': card('w-b:listen', 4000) } };
    const pc = { ...b, cards: { ...b.cards, 'w-a:listen': card('w-a:listen', 3000, 2), 'w-c:speak': card('w-c:speak', 3500) } };
    const m = mergeStates(b, phone, pc);
    expect(m.cards['w-a:listen'].interval).toBe(4);
    expect(Object.keys(m.cards).sort()).toEqual(['w-a:listen', 'w-b:listen', 'w-c:speak']);
  });

  it('Einstellungen: Änderung dieses Geräts gewinnt, gerätebezogene bleiben lokal', () => {
    const b = base();
    const local = { ...b, settings: { ...b.settings, romaji: false, whisper: 'fast' as const } };
    const remote = { ...b, settings: { ...b.settings, rate: 1.1, whisper: 'off' as const } };
    const m = mergeStates(b, local, remote);
    expect(m.settings.romaji).toBe(false);
    expect(m.settings.rate).toBe(1.1);
    expect(m.settings.whisper).toBe('fast');
  });

  it('Mengen und Abzeichen werden vereinigt, Serie vom jüngsten Tag', () => {
    const b = base();
    const local = { ...b, owned: [...b.owned, 'souvenir-daruma'], achievements: { ...b.achievements, xp100: 50 }, streak: 4, lastActive: '2026-10-02' };
    const remote = { ...b, owned: [...b.owned, 'theme-matcha'], achievements: { ...b.achievements, kana10: 40 }, streak: 5, lastActive: '2026-10-03' };
    const m = mergeStates(b, local, remote);
    expect(m.owned.sort()).toEqual(['souvenir-daruma', 'theme-matcha', 'theme-sakura']);
    expect(Object.keys(m.achievements).sort()).toEqual(['first', 'kana10', 'xp100']);
    expect([m.streak, m.lastActive]).toEqual([5, '2026-10-03']);
  });

  it('ohne gemeinsamen Stand (zwei getrennt genutzte Geräte) wird der Fortschritt addiert', () => {
    const a = base();
    const c = { ...base(), xp: { '2026-10-01': 20, '2026-09-30': 10 }, coins: 30 };
    const m = mergeStates(null, a, c);
    expect(m.xp).toEqual({ '2026-10-01': 70, '2026-09-30': 10 });
    expect(m.coins).toBe(130);
  });

  it('Vergleich ignoriert die Reihenfolge der Schlüssel (Server sortiert um)', () => {
    expect(deepEqual({ a: 1, b: { c: 2, d: [1, 2] } }, { b: { d: [1, 2], c: 2 }, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
  });
});
