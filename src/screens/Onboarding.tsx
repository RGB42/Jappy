import { useState } from 'react';
import { SpeakButton, SpeechCheck } from '../components/Audio';
import { LEVELS } from '../data';
import type { Level } from '../data/types';
import { sttSupported, ttsSupported } from '../lib/speech';
import { completeOnboarding } from '../lib/store';

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<Level>(1);
  const [goal, setGoal] = useState(50);

  return (
    <div className="stack" style={{ paddingTop: 32 }}>
      {step === 0 && (
        <div className="lesson-stage">
          <div className="big-icon" lang="ja" style={{ fontSize: '4rem' }}>
            🗾
          </div>
          <h1>Willkommen bei Jappy!</h1>
          <p className="muted">
            Japanisch lernen wie ein Kind: <b>erst hören, dann sprechen, dann ausprobieren</b>. Lesen kommt dazu – aber nie
            als Erstes.
          </p>
          <div className="card col center gap" style={{ width: '100%' }}>
            <div className="muted small">Tippe auf den Lautsprecher:</div>
            <SpeakButton text="こんにちは。ようこそ！" size="xl" />
            <div className="muted small">„Konnichiwa. Yōkoso!“ – Hallo. Willkommen!</div>
          </div>
          {!ttsSupported() && (
            <div className="notice">Dein Browser unterstützt keine Sprachausgabe. Bitte nutze Chrome, Edge oder Safari.</div>
          )}
          <button className="btn btn-primary btn-large btn-block" onClick={() => setStep(1)}>
            Los geht's
          </button>
        </div>
      )}

      {step === 1 && (
        <>
          <h1>Wo stehst du?</h1>
          <p className="muted">Du kannst das jederzeit in den Einstellungen ändern.</p>
          <div className="list">
            {([1, 2, 3] as Level[]).map((l) => (
              <button
                key={l}
                className={`list-item ${level === l ? 'done' : ''}`}
                style={level === l ? { outline: '2px solid var(--primary)' } : undefined}
                onClick={() => setLevel(l)}
              >
                <span className="tile-icon">{['🌱', '🌿', '🌳'][l - 1]}</span>
                <span className="grow">
                  <b>{LEVELS[l].label}</b>
                  <div className="muted small">{LEVELS[l].desc}</div>
                </span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-large btn-block" onClick={() => setStep(2)}>
            Weiter
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1>Probier dein Mikro aus</h1>
          <p className="muted">
            Sprechen ist der Kern von Jappy. Hör zu, tippe aufs Mikro und sag es nach. Kein Stress – das Feedback ist nur für
            dich.
          </p>
          <div className="card col center gap">
            <SpeakButton text="ありがとう" size="lg" slowButton />
            <div>
              <b lang="ja">ありがとう</b> <span className="muted">· arigatou · Danke</span>
            </div>
            <SpeechCheck targets={['ありがとう', '有難う']} />
          </div>
          {!sttSupported() && (
            <div className="notice">
              Spracherkennung ist hier nicht verfügbar. Du kannst trotzdem laut sprechen, dich aufnehmen und vergleichen. Für
              automatisches Feedback: Chrome (Android/Desktop) oder Safari (iOS).
            </div>
          )}
          <button className="btn btn-primary btn-large btn-block" onClick={() => setStep(3)}>
            Weiter
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h1>Dein Tagesziel</h1>
          <p className="muted">Kleine, tägliche Einheiten wirken besser als seltene lange (verteiltes Lernen).</p>
          <div className="list">
            {[
              { xp: 20, label: 'Locker', desc: '≈ 5 Minuten am Tag' },
              { xp: 50, label: 'Regelmäßig', desc: '≈ 10–15 Minuten am Tag' },
              { xp: 100, label: 'Intensiv', desc: '≈ 25–30 Minuten am Tag' },
            ].map((g) => (
              <button
                key={g.xp}
                className="list-item"
                style={goal === g.xp ? { outline: '2px solid var(--primary)' } : undefined}
                onClick={() => setGoal(g.xp)}
              >
                <span className="grow">
                  <b>{g.label}</b>
                  <div className="muted small">{g.desc}</div>
                </span>
                <span className="chip">{g.xp} XP</span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-large btn-block" onClick={() => completeOnboarding(level, goal)}>
            Starten 🚀
          </button>
        </>
      )}

      <div className="row center gap-s mt">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{ width: 8, height: 8, borderRadius: 9, background: i === step ? 'var(--primary)' : 'var(--border)' }}
          />
        ))}
      </div>
    </div>
  );
}
