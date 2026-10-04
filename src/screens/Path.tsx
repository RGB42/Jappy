// Lernpfad: Einheiten mit Kann-Zielen; jeder Schritt mischt Hören, Sprechen und Ausprobieren.
import { useState } from 'react';
import { Header, ProgressBar, Segmented } from '../components/ui';
import { LEVELS } from '../data';
import { units } from '../data/curriculum';
import type { Level } from '../data/types';
import { STEP_ICON, currentUnit, isStepDone, isUnitComplete, openStep, stationFor, unitProgress } from '../lib/path';
import { useAppState } from '../lib/store';

export function Path() {
  const state = useAppState();
  const [level, setLevel] = useState<Level>(state.level);
  const current = currentUnit(state, level);
  const [open, setOpen] = useState<string | undefined>(current?.id);
  const list = units.filter((u) => u.level === level);

  return (
    <>
      <Header title="Lernpfad" subtitle={`Deine Reise durch Japan · ${LEVELS[level].desc}`} onBack={false} />
      <Segmented
        value={level}
        onChange={(v) => {
          setLevel(v);
          setOpen(currentUnit(state, v)?.id);
        }}
        options={([1, 2, 3] as Level[]).map((l) => ({ value: l, label: LEVELS[l].label }))}
      />
      <div className="stack mt">
        {list.map((u, idx) => {
          const p = unitProgress(state, u);
          const complete = isUnitComplete(state, u);
          const isCurrent = current?.id === u.id && !complete;
          const expanded = open === u.id;
          const station = stationFor(u);
          return (
            <div key={u.id} className={`unit ${complete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}>
              <span className="unit-dot">{complete ? station.emoji : idx + 1}</span>
              <div className="card" style={isCurrent ? { borderColor: 'var(--primary)' } : undefined}>
                <button
                  className="btn-block"
                  style={{ border: 0, background: 'transparent', padding: 0, textAlign: 'left' }}
                  onClick={() => setOpen(expanded ? undefined : u.id)}
                  aria-expanded={expanded}
                >
                  <div className="row between gap">
                    <h3 style={{ margin: 0 }}>{u.title}</h3>
                    <span className="muted small">
                      {p.done}/{p.total}
                    </span>
                  </div>
                  <div className="muted small" style={{ margin: '4px 0 2px' }}>
                    🎯 {u.goal}
                  </div>
                  <div className="small" style={{ margin: '0 0 8px', color: complete ? 'var(--ok)' : 'var(--accent)' }}>
                    {complete ? '✓ Stempel erhalten:' : '🚄 Nächste Station:'} {station.emoji} {station.name} <span lang="ja">{station.jp}</span>
                  </div>
                  <ProgressBar value={p.done} max={p.total} />
                </button>
                {expanded && (
                  <div className="mt">
                    {u.steps.map((st) => {
                      const done = isStepDone(state, st);
                      return (
                        <button key={st.key} className={`step ${done ? 'done' : ''}`} onClick={() => openStep(st)}>
                          <span className="step-check">{done ? '✓' : ''}</span>
                          <span className="tile-icon" style={{ width: 32, height: 32, fontSize: '1rem' }}>
                            {STEP_ICON[st.type]}
                          </span>
                          <span className="grow">{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="muted small center mt-l">
        Du kannst jederzeit springen – die Reihenfolge ist eine Empfehlung, kein Zwang.
      </p>
    </>
  );
}
