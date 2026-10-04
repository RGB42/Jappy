// Multiple-Choice-Baustein: Antwort wählen, sofortiges Feedback.
import { useState, type ReactNode } from 'react';
import type { LearnItem } from '../data/types';
import { bumpCombo } from '../lib/celebrate';
import { sfx } from '../lib/sfx';
import { reportCombo } from '../lib/store';
import { shuffle } from './ui';

/** Sound + Combo-Zähler für jede beantwortete Frage. */
export function registerAnswer(ok: boolean) {
  if (ok) sfx.correct();
  else sfx.wrong();
  reportCombo(bumpCombo(ok));
}

export function Choices({
  options,
  correct,
  onAnswer,
  kana = false,
  columns = 1,
  silent = false,
}: {
  options: string[];
  correct: string;
  onAnswer: (ok: boolean, chosen: string) => void;
  kana?: boolean;
  columns?: 1 | 2;
  /** true: Sound/Combo übernimmt der Aufrufer */
  silent?: boolean;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <div className={`choices ${columns === 2 ? 'choices-2' : ''}`}>
      {options.map((o) => {
        const state = chosen === null ? '' : o === correct ? 'correct' : o === chosen ? 'wrong' : '';
        return (
          <button
            key={o}
            className={`choice ${state} ${kana ? 'choice-kana' : ''}`}
            disabled={chosen !== null}
            onClick={() => {
              setChosen(o);
              if (!silent) registerAnswer(o === correct);
              onAnswer(o === correct, o);
            }}
            lang={kana ? 'ja' : undefined}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** Wählt plausible falsche Antworten (gleiches Thema / gleiche Art bevorzugt). */
export function meaningOptions(item: LearnItem, pool: LearnItem[], n = 4): string[] {
  const others = pool.filter((p) => p.id !== item.id && p.de !== item.de);
  const close = shuffle(others.filter((p) => p.topic === item.topic && p.kind === item.kind));
  const rest = shuffle(others.filter((p) => p.kind === item.kind));
  const picked: string[] = [];
  for (const p of [...close, ...rest]) {
    if (picked.length >= n - 1) break;
    if (!picked.includes(p.de)) picked.push(p.de);
  }
  return shuffle([item.de, ...picked]);
}

export function Feedback({ ok, children }: { ok: boolean; children?: ReactNode }) {
  return <div className={`feedback ${ok ? 'feedback-ok' : 'feedback-bad'}`}>{children ?? (ok ? 'Richtig! ✓' : 'Leider falsch.')}</div>;
}

/** Bedeutungs-Quiz für ein Lernelement; Optionen bleiben während der Frage stabil. */
export function MeaningChoices({
  item,
  pool,
  onAnswer,
}: {
  item: LearnItem;
  pool: LearnItem[];
  onAnswer: (ok: boolean) => void;
}) {
  const [options] = useState(() => meaningOptions(item, pool));
  return <Choices options={options} correct={item.de} onAnswer={onAnswer} />;
}
