import { beforeEach, describe, expect, it } from 'vitest';
import { dailyQuests, levelInfo, rankFor, xpForLevel } from './game';
import { forecast, type Goal } from './goal';
import { buildReminderICS } from './reminder';
import { DAY, dayKey } from './srs';
import { addXP, currentStreak, getState, initialState, setState } from './store';

describe('Level & Ränge', () => {
  it('XP-Schwellen wachsen', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(50);
    expect(xpForLevel(3)).toBe(150);
    expect(levelInfo(0).level).toBe(1);
    expect(levelInfo(149).level).toBe(2);
    expect(levelInfo(150)).toMatchObject({ level: 3, into: 0, span: 150 });
  });
  it('Ränge', () => {
    expect(rankFor(1).de).toBe('Tourist/in');
    expect(rankFor(12).de).toBe('Entdecker/in');
  });
});

describe('Tagesquests', () => {
  it('sind pro Tag stabil und enthalten das Tagesziel', () => {
    const a = dailyQuests('2026-10-04', 40);
    const b = dailyQuests('2026-10-04', 40);
    expect(a).toEqual(b);
    expect(a).toHaveLength(3);
    expect(a[0]).toMatchObject({ id: 'goal', metric: 'xp', target: 40 });
    expect(new Set(a.map((q) => q.id)).size).toBe(3);
  });
  it('passen zu den Ziel-Fähigkeiten', () => {
    for (let d = 1; d <= 20; d++) {
      const qs = dailyQuests(`2026-11-${String(d).padStart(2, '0')}`, 40, ['write']);
      expect(qs.slice(1).every((q) => ['kana', 'draw', 'learned', 'combo'].includes(q.metric))).toBe(true);
    }
  });
});

describe('Serie & Belohnungen', () => {
  beforeEach(() => setState(() => ({ ...initialState(), onboarded: true })));

  it('Streak-Schutz rettet verpasste Tage', () => {
    setState((s) => ({ ...s, streak: 10, lastActive: dayKey(Date.now() - 3 * DAY), freezes: 2 }));
    expect(currentStreak(getState())).toBe(10);
    addXP(5);
    expect(getState().streak).toBe(11);
    expect(getState().freezes).toBe(0);
  });

  it('ohne genug Schutz beginnt die Serie neu', () => {
    setState((s) => ({ ...s, streak: 10, lastActive: dayKey(Date.now() - 3 * DAY), freezes: 1 }));
    expect(currentStreak(getState())).toBe(0);
    addXP(5);
    expect(getState().streak).toBe(1);
    expect(getState().freezes).toBe(1);
  });

  it('Tagesziel-Quest zahlt Yen aus', () => {
    const goal = getState().settings.dailyGoal;
    addXP(goal);
    const s = getState();
    expect(s.daily.claimed).toContain('goal');
    expect(s.coins).toBeGreaterThanOrEqual(goal + 100);
    expect(s.records.goalDays).toBe(1);
  });
});

describe('Ziel-Prognose', () => {
  it('berechnet Umfang und Tempo', () => {
    const goal: Goal = { type: 'travel', title: 'Japan', targetDate: dayKey(Date.now() + 100 * DAY), skills: ['read', 'speak', 'listen'], createdAt: 0 };
    const f = forecast(goal, initialState());
    expect(f.total).toBeGreaterThan(50);
    expect(f.remaining).toBe(f.total);
    expect(f.daysLeft).toBe(100);
    expect(f.status).toBe('start');
    expect(f.recommendedXP).toBeGreaterThanOrEqual(20);
  });
  it('erkennt Rückstand', () => {
    const goal: Goal = { type: 'travel', title: 'Japan', targetDate: dayKey(Date.now() + 10 * DAY), skills: ['speak'], createdAt: 0 };
    const s = { ...initialState(), stepLog: { [dayKey()]: 1 } };
    expect(forecast(goal, s).status).toBe('behind');
  });
});

describe('Erinnerung', () => {
  it('erzeugt einen täglichen Kalendertermin', () => {
    const ics = buildReminderICS('19:30', '2027-06-01', new Date('2026-10-04T10:00:00'));
    expect(ics).toContain('RRULE:FREQ=DAILY;UNTIL=20270601T235959');
    expect(ics).toContain('DTSTART:20261005T193000');
    expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR');
  });
});

describe('Reise-Stempel', async () => {
  const { units } = await import('../data/curriculum');
  const { cardId, newCard } = await import('./srs');
  const { markDone } = await import('./store');
  beforeEach(() => setState(() => ({ ...initialState(), onboarded: true })));

  it('abgeschlossene Einheit bringt Stempel und Yen', () => {
    const u1 = units[0];
    const last = [...u1.steps].reverse().find((st) => st.type !== 'learn')!;
    setState((s) => {
      const cards = { ...s.cards };
      const done = { ...s.done };
      for (const st of u1.steps) {
        if (st.type === 'learn') for (const id of st.items) cards[cardId(id, 'listen')] = newCard(cardId(id, 'listen'));
        else if (st !== last) done[st.key] = { best: 1, count: 1, last: 0 };
      }
      return { ...s, cards, done };
    });
    const before = getState().coins;
    markDone(last.key, 1);
    const s = getState();
    expect(s.stampsSeen).toContain(u1.id);
    expect(s.coins - before).toBeGreaterThanOrEqual(300);
    expect(s.achievements['stamp-1']).toBeTruthy();
  });
});
