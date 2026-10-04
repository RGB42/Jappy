import { describe, expect, it } from 'vitest';
import { buildLessonScript, schedule, type LessonItem } from './audioLesson';

const item = (id: string, isNew = true, kana = 'ねこ'): LessonItem => ({ id, jp: id, kana, de: id, isNew });

describe('Audio-Lektion', () => {
  it('fragt neue Elemente in wachsenden Abständen erneut ab', () => {
    const plan = schedule([item('a'), item('b'), item('c')]);
    const positions = plan.map((p, i) => (p.item.id === 'a' ? i : -1)).filter((i) => i >= 0);
    expect(plan[positions[0]].phase).toBe('intro');
    expect(positions).toHaveLength(4);
    const gaps = positions.slice(1).map((p, i) => p - positions[i]);
    for (let i = 1; i < gaps.length; i++) expect(gaps[i]).toBeGreaterThanOrEqual(gaps[i - 1]);
  });

  it('bekannte Elemente werden nur abgefragt, nicht eingeführt', () => {
    const plan = schedule([item('x', false)]);
    expect(plan.every((p) => p.phase === 'recall')).toBe(true);
    expect(plan).toHaveLength(2);
  });

  it('baut lange Ausdrücke rückwärts auf, ohne mit einer Partikel zu beginnen', () => {
    const cues = buildLessonScript([{ id: 's', jp: '私は学生です。', kana: 'わたし は がくせい です。', de: 'Ich bin Student.', isNew: true }]);
    const parts = cues.filter((c) => c.type === 'ja').map((c) => (c as { text: string }).text);
    expect(parts).toContain('です');
    expect(parts).toContain('がくせいです');
    expect(parts.some((p) => p.startsWith('は'))).toBe(false);
  });
});
