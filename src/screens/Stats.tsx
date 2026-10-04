// Fortschritt: Serie, XP-Verlauf, Wortschatz, Kana-Beherrschung.
import { ProgressBar } from '../components/ui';
import { LEVELS, allItems } from '../data';
import { allKana } from '../data/kana';
import type { Level } from '../data/types';
import { DAY, dayKey, isMature } from '../lib/srs';
import { navigate } from '../lib/router';
import { currentStreak, isKnown, useAppState } from '../lib/store';

/** Statistik-Abschnitte (im Profil eingebettet). */
export function StatsSections() {
  const state = useAppState();
  const cards = Object.values(state.cards);
  const known = allItems.filter((i) => isKnown(state, i.id)).length;
  const mature = cards.filter((c) => c.id.endsWith(':speak') && isMature(c)).length;
  const totalXP = Object.values(state.xp).reduce((a, b) => a + b, 0);
  const days = Array.from({ length: 14 }, (_, i) => {
    const ts = Date.now() - (13 - i) * DAY;
    return { key: dayKey(ts), label: new Date(ts).toLocaleDateString('de-DE', { weekday: 'narrow' }) };
  });
  const maxXP = Math.max(state.settings.dailyGoal, ...days.map((d) => state.xp[d.key] ?? 0));

  return (
    <>
      <div className="section-title">Statistik</div>
      <div className="stat-grid">
        <div className="stat">
          <div className="stat-value">🔥 {currentStreak(state)}</div>
          <div className="stat-label">Tage in Folge</div>
        </div>
        <div className="stat">
          <div className="stat-value">{totalXP}</div>
          <div className="stat-label">XP gesamt</div>
        </div>
        <div className="stat">
          <div className="stat-value">{known}</div>
          <div className="stat-label">Ausdrücke gelernt</div>
        </div>
        <div className="stat">
          <div className="stat-value">{mature}</div>
          <div className="stat-label">sicher abrufbar (≥ 3 Wochen)</div>
        </div>
        <div className="stat">
          <div className="stat-value">🎤 {state.counters.spoken}</div>
          <div className="stat-label">Mal gesprochen</div>
        </div>
        <div className="stat">
          <div className="stat-value">🔊 {state.counters.listened}</div>
          <div className="stat-label">Mal gehört</div>
        </div>
      </div>

      <div className="section-title">Letzte 14 Tage</div>
      <div className="card">
        <div className="bars" aria-label="XP pro Tag">
          {days.map((d) => {
            const v = state.xp[d.key] ?? 0;
            return <div key={d.key} className={`bar ${v ? '' : 'zero'}`} style={{ height: `${(v / maxXP) * 100}%` }} title={`${d.key}: ${v} XP`} />;
          })}
        </div>
        <div className="bar-labels mt">
          {days.map((d) => (
            <span key={d.key}>{d.label}</span>
          ))}
        </div>
      </div>

      <div className="section-title">Wortschatz nach Niveau</div>
      <div className="card stack">
        {([1, 2, 3] as Level[]).map((l) => {
          const total = allItems.filter((i) => i.level === l).length;
          const k = allItems.filter((i) => i.level === l && isKnown(state, i.id)).length;
          return (
            <div key={l}>
              <div className="row between small">
                <b>{LEVELS[l].label}</b>
                <span className="muted">
                  {k} / {total}
                </span>
              </div>
              <ProgressBar value={k} max={total} />
            </div>
          );
        })}
      </div>

      <div className="section-title">Kana</div>
      <div className="card stack">
        {(['hiragana', 'katakana'] as const).map((script) => {
          const list = allKana(script, ['basic', 'dakuten']);
          const solid = list.filter((k) => (state.kana[k] ?? 0) >= 3).length;
          return (
            <button key={script} className="step" onClick={() => navigate('/kana', { script })}>
              <span className="grow">
                <div className="row between small">
                  <b>{script === 'hiragana' ? 'Hiragana' : 'Katakana'}</b>
                  <span className="muted">
                    {solid} / {list.length} sicher
                  </span>
                </div>
                <ProgressBar value={solid} max={list.length} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="section-title">Wiederholungen</div>
      <div className="card small muted">
        {state.counters.reviews} Karten wiederholt · {cards.length} Karten im System. Je öfter du etwas erfolgreich abrufst, desto
        länger werden die Abstände – so landet es im Langzeitgedächtnis.
      </div>
    </>
  );
}
