// Fortschritt im Lernpfad.
import { units, type Step, type Unit } from '../data/curriculum';
import { navigate } from './router';
import { isKnown, type AppState } from './store';

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
