// Offline-Spracherkennung einrichten (für Browser ohne eingebaute Erkennung, z. B. Firefox).
import { nativeSttSupported } from '../lib/speech';
import { updateSettings, useSettings } from '../lib/store';
import { WHISPER_MODELS, loadWhisper, useWhisperStatus, type WhisperModel } from '../lib/whisper';
import { ProgressBar } from './ui';

export function WhisperSetup({ compact = false }: { compact?: boolean }) {
  const settings = useSettings();
  const status = useWhisperStatus();
  const model: WhisperModel = 'fast';
  const enabled = settings.whisper !== 'off';

  const enable = async () => {
    try {
      await loadWhisper(model);
      updateSettings({ whisper: model });
    } catch {
      /* Fehler wird im Status angezeigt */
    }
  };

  if (status.state === 'loading') {
    return (
      <div className="stack">
        <div className="small">
          Lade Spracherkennung ({WHISPER_MODELS[status.model ?? model].size}) – nur beim ersten Mal …
        </div>
        <ProgressBar value={Math.round(status.progress * 100)} max={100} />
        <div className="muted small">{Math.round(status.progress * 100)} %</div>
      </div>
    );
  }

  if (compact) {
    return enabled ? null : (
      <button className="btn btn-small btn-accent" onClick={enable}>
        🧠 Spracherkennung aktivieren ({WHISPER_MODELS[model].size}, einmalig)
      </button>
    );
  }

  return (
    <div className="stack">
      <p className="small" style={{ margin: 0 }}>
        {nativeSttSupported()
          ? 'Dein Browser hat eine eingebaute Spracherkennung. Optional kannst du stattdessen die Offline-KI nutzen (funktioniert ohne Internet, Daten bleiben auf dem Gerät).'
          : 'Dein Browser (z. B. Firefox) hat keine eingebaute Spracherkennung. Jappy kann eine Spracherkennungs-KI direkt im Browser ausführen – einmal herunterladen, danach offline. Deine Stimme verlässt das Gerät nicht.'}
      </p>
      {enabled && settings.whisper === model ? (
        <div className="feedback feedback-ok">✓ Offline-Spracherkennung aktiv ({WHISPER_MODELS[model].label})</div>
      ) : (
        <button className="btn btn-accent" onClick={enable}>
          🧠 Herunterladen & aktivieren ({WHISPER_MODELS[model].size}, einmalig)
        </button>
      )}
      {status.state === 'error' && <div className="text-bad small">Fehler beim Laden: {status.error}. Bitte Internetverbindung prüfen.</div>}
      {enabled && nativeSttSupported() && (
        <label className="switch-row small">
          <span>Offline-KI statt Browser-Erkennung verwenden</span>
          <input
            type="checkbox"
            checked={settings.sttEngine === 'whisper'}
            onChange={(e) => updateSettings({ sttEngine: e.target.checked ? 'whisper' : 'auto' })}
          />
        </label>
      )}
      {enabled && (
        <button className="btn btn-small btn-ghost" onClick={() => updateSettings({ whisper: 'off', sttEngine: 'auto' })}>
          Offline-Spracherkennung ausschalten
        </button>
      )}
    </div>
  );
}
