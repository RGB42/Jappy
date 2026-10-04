// Einstellungen: Stimme, Tempo, Anzeige, Niveau, Datensicherung.
import { useEffect, useState } from 'react';
import { say } from '../components/Audio';
import { Header, Segmented } from '../components/ui';
import { LEVELS } from '../data';
import type { Level } from '../data/types';
import { getVoices, onVoicesChanged, sttSupported, ttsSupported } from '../lib/speech';
import { downloadReminder } from '../lib/reminder';
import { navigate } from '../lib/router';
import { exportProgress, importProgress, resetAll, setLevel, updateSettings, useAppState } from '../lib/store';

export function Settings() {
  const state = useAppState();
  const s = state.settings;
  const [voices, setVoices] = useState(() => getVoices('ja-JP'));
  const [importText, setImportText] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => onVoicesChanged(() => setVoices(getVoices('ja-JP'))), []);

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `jappy-fortschritt-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <Header title="Einstellungen" />

      <div className="section-title">Stimme & Audio</div>
      <div className="card">
        <div className="field">
          <span className="field-label">Japanische Stimme</span>
          {voices.length ? (
            <select value={s.voiceURI ?? ''} onChange={(e) => updateSettings({ voiceURI: e.target.value || undefined })}>
              <option value="">Automatisch (beste verfügbare)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} {v.localService ? '' : '(online)'}
                </option>
              ))}
            </select>
          ) : (
            <div className="notice">
              {ttsSupported()
                ? 'Keine japanische Stimme gefunden. Installiere eine in den Sprach-Einstellungen deines Geräts (z. B. Windows: Einstellungen → Zeit & Sprache → Sprache → Japanisch; iOS: Bedienungshilfen → Gesprochene Inhalte → Stimmen).'
                : 'Dieser Browser unterstützt keine Sprachausgabe.'}
            </div>
          )}
        </div>
        <div className="field">
          <span className="field-label">
            Sprechtempo: {Math.round(s.rate * 100)} %
          </span>
          <input type="range" min={0.5} max={1.3} step={0.05} value={s.rate} onChange={(e) => updateSettings({ rate: Number(e.target.value) })} />
          <button className="btn btn-small" onClick={() => say('はじめまして。どうぞ よろしく おねがいします。')}>
            🔊 Testen
          </button>
        </div>
        <label className="field switch-row">
          <span>
            <span className="field-label">Audio automatisch abspielen</span>
            <div className="muted small">Neue Karten werden sofort vorgelesen.</div>
          </span>
          <input type="checkbox" checked={s.autoPlay} onChange={(e) => updateSettings({ autoPlay: e.target.checked })} />
        </label>
        <label className="field switch-row">
          <span>
            <span className="field-label">Sound-Effekte</span>
            <div className="muted small">Kurze Töne bei richtig/falsch, Serien und Belohnungen.</div>
          </span>
          <input type="checkbox" checked={s.sound} onChange={(e) => updateSettings({ sound: e.target.checked })} />
        </label>
        <div className="field small muted">
          Spracherkennung: {sttSupported() ? '✅ verfügbar' : '❌ nicht verfügbar (Chrome/Edge oder Safari nutzen)'}
        </div>
      </div>

      <div className="section-title">Anzeige</div>
      <div className="card">
        <label className="field switch-row">
          <span>
            <span className="field-label">Erst hören, dann lesen</span>
            <div className="muted small">Japanischer Text erscheint erst nach dem Hören (empfohlen).</div>
          </span>
          <input type="checkbox" checked={s.audioFirst} onChange={(e) => updateSettings({ audioFirst: e.target.checked })} />
        </label>
        <div className="field">
          <span className="field-label">Schrift</span>
          <Segmented
            value={s.script}
            onChange={(v) => updateSettings({ script: v })}
            options={[
              { value: 'kana', label: 'Nur Kana' },
              { value: 'both', label: 'Kanji + Kana' },
              { value: 'kanji', label: 'Nur Kanji' },
            ]}
          />
        </div>
        <label className="field switch-row">
          <span>
            <span className="field-label">Romaji anzeigen</span>
            <div className="muted small">Lateinische Umschrift als Lesehilfe. Später abschalten!</div>
          </span>
          <input type="checkbox" checked={s.romaji} onChange={(e) => updateSettings({ romaji: e.target.checked })} />
        </label>
        <div className="field">
          <span className="field-label">Design</span>
          <Segmented
            value={s.theme}
            onChange={(v) => updateSettings({ theme: v })}
            options={[
              { value: 'auto', label: 'Automatisch' },
              { value: 'light', label: 'Hell' },
              { value: 'dark', label: 'Dunkel' },
            ]}
          />
        </div>
      </div>

      <div className="section-title">Lernen</div>
      <div className="card">
        <div className="field">
          <span className="field-label">Persönliches Ziel</span>
          <div className="muted small">{state.goal ? `${state.goal.title} · bis ${state.goal.targetDate.split('-').reverse().join('.')}` : 'Noch kein Ziel festgelegt'}</div>
          <button className="btn btn-small" onClick={() => navigate('/goal', state.goal ? { edit: 1 } : undefined)}>
            🎯 {state.goal ? 'Ziel ändern' : 'Ziel festlegen'}
          </button>
        </div>
        <div className="field">
          <span className="field-label">Tägliche Erinnerung</span>
          <div className="row gap">
            <input type="time" value={s.reminder} onChange={(e) => e.target.value && updateSettings({ reminder: e.target.value })} style={{ maxWidth: 140 }} aria-label="Uhrzeit" />
            <button className="btn btn-small grow" onClick={() => downloadReminder(s.reminder, state.goal?.targetDate)}>
              📅 In Kalender eintragen
            </button>
          </div>
        </div>
        <div className="field">
          <span className="field-label">Niveau</span>
          <Segmented
            value={state.level}
            onChange={(v) => setLevel(v as Level)}
            options={([1, 2, 3] as Level[]).map((l) => ({ value: l, label: LEVELS[l].label }))}
          />
        </div>
        <div className="field">
          <span className="field-label">Tagesziel: {s.dailyGoal} XP</span>
          <input type="range" min={10} max={150} step={10} value={s.dailyGoal} onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })} />
        </div>
        <div className="field">
          <span className="field-label">Neue Ausdrücke pro Tag: {s.newPerDay}</span>
          <input type="range" min={3} max={30} step={1} value={s.newPerDay} onChange={(e) => updateSettings({ newPerDay: Number(e.target.value) })} />
        </div>
        <button className="btn btn-block mt" onClick={() => navigate('/methods')}>
          🧠 Wie Jappy lehrt
        </button>
      </div>

      <div className="section-title">Daten</div>
      <div className="card stack">
        <p className="muted small">Dein Fortschritt wird nur lokal in diesem Browser gespeichert. Sichere ihn, um das Gerät zu wechseln.</p>
        <button className="btn btn-block" onClick={download}>
          ⬇️ Fortschritt exportieren
        </button>
        <textarea rows={3} placeholder="Exportierten Fortschritt (JSON) hier einfügen …" value={importText} onChange={(e) => setImportText(e.target.value)} />
        <button
          className="btn btn-block"
          disabled={!importText.trim()}
          onClick={() => {
            setMsg(importProgress(importText) ? 'Fortschritt importiert ✓' : 'Ungültige Datei.');
            setImportText('');
          }}
        >
          ⬆️ Fortschritt importieren
        </button>
        {msg && <div className="feedback feedback-info">{msg}</div>}
        <button
          className="btn btn-block btn-ghost text-bad"
          onClick={() => {
            if (confirm('Wirklich den gesamten Fortschritt löschen?')) resetAll();
          }}
        >
          Alles zurücksetzen
        </button>
      </div>
      <p className="muted small center mt">Jappy · Japanisch lernen durch Hören, Sprechen und Ausprobieren</p>
    </>
  );
}
