import { useState } from 'react';
import { SpeakButton, SpeechCheck } from '../components/Audio';
import { LEVELS } from '../data';
import type { Level } from '../data/types';
import { WhisperSetup } from '../components/WhisperSetup';
import { nativeSttSupported } from '../lib/speech';
import { GoalEditor } from '../components/GoalEditor';
import { AccountCard } from '../components/Account';
import { cloudConfigured } from '../lib/cloud';
import { completeOnboarding } from '../lib/store';
import { useSyncStatus } from '../lib/sync';

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<Level>(1);
  const [haveAccount, setHaveAccount] = useState(false);
  const sync = useSyncStatus();
  // Über einen E-Mail-Link angemeldet (Bestätigung/Passwort) → Konto direkt zeigen.
  const showAccount = haveAccount || !!sync.user || !!sync.needsNewPassword || !!sync.error;

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
          <button className="btn btn-primary btn-large btn-block" onClick={() => setStep(1)}>
            Los geht's
          </button>
          {cloudConfigured() &&
            (showAccount ? (
              <div style={{ width: '100%' }}>
                <AccountCard compact />
              </div>
            ) : (
              <button className="btn btn-ghost btn-block" onClick={() => setHaveAccount(true)}>
                ☁️ Ich habe schon ein Konto
              </button>
            ))}
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
          {!nativeSttSupported() && (
            <div className="card stack">
              <b>🧠 Spracherkennung für diesen Browser</b>
              <WhisperSetup />
            </div>
          )}
          <button className="btn btn-primary btn-large btn-block" onClick={() => setStep(3)}>
            Weiter
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h1>Dein persönliches Ziel</h1>
          <p className="muted">
            Ein konkretes Ziel mit Datum hält dich am Ball. Jappy macht daraus einen Plan – mit Tagesquests, Countdown und Prognose.
          </p>
          <GoalEditor
            initialDailyGoal={40}
            saveLabel="Starten 🚀"
            onSave={(goal, xp) => completeOnboarding(level, xp, goal)}
            onSkip={() => completeOnboarding(level, 50, null)}
          />
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
