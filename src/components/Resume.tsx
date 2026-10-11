// Unterbrochene Übungen: Hinweis in der Übung und „Weitermachen“-Karte auf der Startseite.
import { clearResume, useResumeList, type Resume } from '../lib/resume';
import { navigate } from '../lib/router';
import { ago } from '../lib/time';
import { ProgressBar } from './ui';

/** Hinweis oben in einer fortgesetzten Übung. */
export function ResumeBanner({ r }: { r: Resume }) {
  if (!r.resumed) return null;
  return (
    <div className="resume-banner">
      <span>▶ Fortgesetzt, wo du warst</span>
      <button type="button" className="link-btn nowrap" onClick={r.restart}>
        Neu starten
      </button>
    </div>
  );
}

/** Startseite: zuletzt unterbrochene Übungen. */
export function ContinueCard() {
  const list = useResumeList().slice(0, 2);
  if (!list.length) return null;
  return (
    <div className="card stack">
      <b>⏸️ Weitermachen</b>
      {list.map((r) => (
        <div key={r.id} className="continue-item">
          <button type="button" className="continue-main" onClick={() => navigate(r.id)}>
            <span className="ellipsis">{r.title}</span>
            <ProgressBar value={r.done} max={Math.max(r.total, r.done, 1)} />
            <span className="muted small">
              {r.done} von {Math.max(r.total, r.done)} · {ago(r.savedAt)}
            </span>
          </button>
          <button type="button" className="btn-icon-sm" aria-label="Verwerfen" title="Verwerfen" onClick={() => clearResume(r.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
