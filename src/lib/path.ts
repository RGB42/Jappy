// Fortschritt im Lernpfad.
import { units, type Step, type Unit } from '../data/curriculum';
import { isStepDone, isUnitComplete } from './progress';
import { navigate } from './router';
import type { AppState } from './store';

export { isStepDone, isUnitComplete, stationFor, unitProgress } from './progress';

/** Nächster offener Schritt – beginnend beim gewählten Niveau. */
export function nextStep(s: AppState): { unit: Unit; step: Step } | null {
  const ordered = [...units.filter((u) => u.level >= s.level), ...units.filter((u) => u.level < s.level)];
  for (const unit of ordered) {
    const step = unit.steps.find((st) => !isStepDone(s, st));
    if (step) return { unit, step };
  }
  return null;
}

export function currentUnit(s: AppState, level = s.level): Unit | undefined {
  return units.find((u) => u.level === level && !isUnitComplete(s, u)) ?? units.filter((u) => u.level === level).at(-1);
}

export function openStep(step: Step) {
  switch (step.type) {
    case 'kana':
      return navigate('/kana/quiz', { script: step.script, rows: step.rows.join(','), mode: 'listen', intro: 1 });
    case 'learn':
      return navigate('/learn', { items: step.items.join(',') });
    case 'grammar':
      return navigate('/grammar/point', { id: step.id });
    case 'dialogue':
      return navigate('/dialogue', { id: step.id });
    case 'story':
      return navigate('/story', { id: step.id });
    case 'listen':
      return navigate('/listen', { level: step.level, mode: 'sentences' });
    case 'pairs':
      return navigate('/pairs');
  }
}

export const STEP_ICON: Record<Step['type'], string> = {
  kana: 'あ',
  learn: '🆕',
  grammar: '🧩',
  dialogue: '🎭',
  story: '📻',
  listen: '👂',
  pairs: '🎵',
};
