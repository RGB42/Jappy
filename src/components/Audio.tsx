// Audio-Bausteine: Vorlesen, Sprechen-Prüfen, eigene Stimme aufnehmen.
import { useEffect, useRef, useState } from 'react';
import type { AudioVoice } from '../lib/audioKey';
import { playClip } from '../lib/audioBank';
import { bumpCombo } from '../lib/celebrate';
import { GRADE_LABEL, scoreSpeech, type SpeechScore } from '../lib/compare';
import { toRomaji } from '../lib/kana';
import { describeSpeechError, listen, speak, sttSupported, type ListenHandle, type SpeechLang } from '../lib/speech';
import { sfx } from '../lib/sfx';
import { countListened, countSpoken, getState, reportCombo, useSettings } from '../lib/store';
import { Icon } from './Icon';
import { WhisperSetup } from './WhisperSetup';

/** Liest Text mit den Nutzer-Einstellungen vor. */
/**
 * Liest Text vor: bevorzugt die eingebauten Aufnahmen (natürliche Stimme, jeder Browser),
 * sonst die Sprachausgabe des Browsers.
 */
export async function say(text: string, opts: { slow?: boolean; lang?: SpeechLang; voice?: AudioVoice } = {}): Promise<void> {
  const { rate, voiceURI, audioSource } = getState().settings;
  const lang = opts.lang ?? 'ja-JP';
  const r = opts.slow ? Math.max(0.5, rate * 0.7) : rate;
  if (lang === 'ja-JP' && audioSource === 'clips' && (await playClip(text, { voice: opts.voice, rate: r }))) return;
  return speak(text, { lang, rate: r, voiceURI });
}

export function SpeakButton({
  text,
  size = 'md',
  label,
  slowButton = false,
  autoPlay = false,
  lang = 'ja-JP',
  voice,
  onPlayed,
}: {
  text: string;
  voice?: AudioVoice;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  slowButton?: boolean;
  autoPlay?: boolean;
  lang?: SpeechLang;
  onPlayed?: () => void;
}) {
  const [playing, setPlaying] = useState<'normal' | 'slow' | null>(null);
  const settings = useSettings();

  const play = async (slow = false) => {
    setPlaying(slow ? 'slow' : 'normal');
    await say(text, { slow, lang, voice });
    setPlaying(null);
    countListened();
    onPlayed?.();
  };

  useEffect(() => {
    if (autoPlay && settings.autoPlay) void play();
  }, [text, autoPlay]);

  return (
    <span className="speak-group">
      <button
        type="button"
        className={`btn-audio btn-audio-${size} ${playing === 'normal' ? 'is-playing' : ''}`}
        onClick={() => play(false)}
        aria-label={label ?? 'Anhören'}
        title="Anhören"
      >
        <Icon name="speaker" size={size === 'xl' ? 40 : size === 'lg' ? 30 : size === 'sm' ? 18 : 22} />
        {label && <span>{label}</span>}
      </button>
      {slowButton && (
        <button
          type="button"
          className={`btn-audio btn-audio-sm btn-slow ${playing === 'slow' ? 'is-playing' : ''}`}
          onClick={() => play(true)}
          aria-label="Langsam anhören"
          title="Langsam"
        >
          🐢
        </button>
      )}
    </span>
  );
}

export interface SpeechCheckResult extends SpeechScore {
  selfRated?: boolean;
}

/**
 * Sprechübung: Mikrofon antippen, sprechen, sofortiges Feedback.
 * Ohne Spracherkennung (z. B. Firefox): eigene Aufnahme anhören und selbst bewerten.
 */
export function SpeechCheck({
  targets,
  onResult,
  compact = false,
  prompt = 'Sprich nach',
}: {
  targets: string[];
  onResult?: (r: SpeechCheckResult) => void;
  compact?: boolean;
  prompt?: string;
}) {
  const [state, setState] = useState<'idle' | 'listening' | 'done'>('idle');
  const [interim, setInterim] = useState('');
  const [result, setResult] = useState<SpeechCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handle = useRef<ListenHandle | null>(null);
  useSettings(); // neu rendern, wenn die Offline-Spracherkennung aktiviert wird
  const key = targets.join('|');

  useEffect(() => {
    setState('idle');
    setResult(null);
    setError(null);
    setInterim('');
    return () => handle.current?.stop();
  }, [key]);

  if (!sttSupported()) {
    return (
      <div className="stack">
        <SelfRecord compact={compact} onRated={(ok) => onResult?.({ score: ok ? 1 : 0.4, grade: ok ? 'good' : 'retry', heard: '', selfRated: true })} />
        <WhisperSetup compact />
      </div>
    );
  }

  const start = async () => {
    if (state === 'listening') {
      handle.current?.stop();
      return;
    }
    setError(null);
    setResult(null);
    setInterim('');
    setState('listening');
    handle.current = listen('ja-JP', setInterim);
    const res = await handle.current.result;
    handle.current = null;
    if (!res.alternatives.length) {
      setError(describeSpeechError(res.error));
      setState('idle');
      return;
    }
    const score = scoreSpeech(res.alternatives, targets);
    setResult(score);
    setState('done');
    countSpoken(score.grade === 'perfect');
    if (score.grade === 'retry') sfx.wrong();
    else {
      sfx.correct();
      reportCombo(bumpCombo(true));
    }
    onResult?.(score);
  };

  return (
    <div className={`speech-check ${compact ? 'compact' : ''}`}>
      <button
        type="button"
        className={`btn-mic ${state === 'listening' ? 'is-listening' : ''}`}
        onClick={start}
        aria-label={state === 'listening' ? 'Aufnahme beenden' : 'Sprechen'}
      >
        <Icon name="mic" size={compact ? 26 : 34} />
      </button>
      <div className="speech-check-text" aria-live="polite">
        {state === 'idle' && !error && <span className="muted">{prompt} – tippe aufs Mikro</span>}
        {state === 'listening' && <span className="pulse-text">{interim || 'Ich höre zu …'}</span>}
        {error && <span className="text-bad">{error}</span>}
        {state === 'done' && result && (
          <>
            <span className={`grade grade-${result.grade}`}>{GRADE_LABEL[result.grade]}</span>
            <span className="heard">
              Gehört: <span lang="ja">{result.heard.length > 40 ? `${result.heard.slice(0, 40)}…` : result.heard}</span>
              {/^[぀-ヿ\s]+$/.test(result.heard) && result.heard.length <= 40 && <span className="muted"> ({toRomaji(result.heard)})</span>}
              <span className="muted"> · {Math.round(result.score * 100)} %</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/** Fallback ohne Spracherkennung: aufnehmen, anhören, selbst bewerten. */
function SelfRecord({ onRated, compact }: { onRated: (ok: boolean) => void; compact: boolean }) {
  const rec = useRecorder();
  const [rated, setRated] = useState(false);
  return (
    <div className={`speech-check ${compact ? 'compact' : ''}`}>
      <button
        type="button"
        className={`btn-mic ${rec.recording ? 'is-listening' : ''}`}
        onClick={() => (rec.recording ? rec.stop() : (setRated(false), rec.start()))}
        aria-label={rec.recording ? 'Aufnahme beenden' : 'Aufnehmen'}
      >
        <Icon name={rec.recording ? 'stop' : 'mic'} size={compact ? 26 : 34} />
      </button>
      <div className="speech-check-text">
        {!rec.url && !rec.recording && <span className="muted">Sag es laut – optional aufnehmen und vergleichen.</span>}
        {rec.recording && <span className="pulse-text">Aufnahme läuft … tippe zum Beenden</span>}
        {rec.error && <span className="text-bad">{rec.error}</span>}
        {rec.url && !rec.recording && (
          <span className="row gap-s wrap">
            <button className="btn btn-small" onClick={rec.play}>
              <Icon name="play" size={16} /> Meine Aufnahme
            </button>
            {!rated && (
              <>
                <button className="btn btn-small btn-ok" onClick={() => (setRated(true), onRated(true))}>
                  Klang gut
                </button>
                <button className="btn btn-small" onClick={() => (setRated(true), onRated(false))}>
                  Nochmal üben
                </button>
              </>
            )}
          </span>
        )}
        {!rec.url && !rec.recording && !rated && (
          <span className="row gap-s">
            <button className="btn btn-small btn-ok" onClick={() => (setRated(true), onRated(true))}>
              Gesagt ✓
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

/** Eigene Stimme aufnehmen (MediaRecorder) – zum Vergleich mit dem Original. */
export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mr = useRef<MediaRecorder | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(
    () => () => {
      mr.current?.stream.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const start = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Aufnahme wird von diesem Browser nicht unterstützt.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        setUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
        setRecording(false);
      };
      mr.current = recorder;
      recorder.start();
      setRecording(true);
      // Sicherheitsstopp nach 15 Sekunden
      setTimeout(() => recorder.state === 'recording' && recorder.stop(), 15000);
    } catch {
      setError('Kein Mikrofon-Zugriff. Bitte im Browser erlauben.');
    }
  };

  const stop = () => {
    if (mr.current?.state === 'recording') mr.current.stop();
  };

  const play = (): Promise<void> =>
    new Promise((resolve) => {
      if (!url) return resolve();
      audio.current?.pause();
      const a = new Audio(url);
      audio.current = a;
      a.onended = () => resolve();
      a.onerror = () => resolve();
      void a.play().catch(() => resolve());
    });

  const reset = () => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
  };

  return { recording, url, error, start, stop, play, reset };
}
