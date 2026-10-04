// Sprachausgabe (Text-to-Speech) und Spracherkennung (Speech-to-Text) über die Web Speech API.
// Funktioniert ohne Server: Chrome/Edge (Desktop & Android) und Safari (iOS/macOS).

export type SpeechLang = 'ja-JP' | 'de-DE';

export interface SpeakOptions {
  lang?: SpeechLang;
  rate?: number; // 0.5 – 1.5
  voiceURI?: string;
}

let voices: SpeechSynthesisVoice[] = [];
const voiceListeners = new Set<() => void>();

function loadVoices() {
  if (!ttsSupported()) return;
  voices = window.speechSynthesis.getVoices();
  voiceListeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function onVoicesChanged(fn: () => void): () => void {
  voiceListeners.add(fn);
  return () => voiceListeners.delete(fn);
}

export function getVoices(lang: SpeechLang): SpeechSynthesisVoice[] {
  const prefix = lang.slice(0, 2);
  return voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(prefix));
}

/** Bevorzugt hochwertige Stimmen (Google, Siri/„Enhanced“, Microsoft Online/Natural). */
function pickVoice(lang: SpeechLang, voiceURI?: string): SpeechSynthesisVoice | undefined {
  const list = getVoices(lang);
  if (voiceURI) {
    const chosen = list.find((v) => v.voiceURI === voiceURI);
    if (chosen) return chosen;
  }
  const score = (v: SpeechSynthesisVoice) =>
    (/google/i.test(v.name) ? 4 : 0) +
    (/natural|online|enhanced|premium|siri/i.test(v.name) ? 3 : 0) +
    (v.lang.replace('_', '-') === lang ? 1 : 0);
  return [...list].sort((a, b) => score(b) - score(a))[0];
}

let currentToken = 0;

/** Liest Text vor. Das Promise löst auf, wenn die Ausgabe fertig ist (oder abgebrochen wurde). */
export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!ttsSupported() || !text.trim()) return Promise.resolve();
  const synth = window.speechSynthesis;
  const token = ++currentToken;
  const busy = synth.speaking || synth.pending;
  if (busy) synth.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const lang = opts.lang ?? 'ja-JP';
    u.lang = lang;
    u.rate = opts.rate ?? 1;
    const voice = pickVoice(lang, lang === 'ja-JP' ? opts.voiceURI : undefined);
    if (voice) u.voice = voice;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(guard);
      resolve();
    };
    u.onend = finish;
    u.onerror = finish;
    // Manche Browser feuern „end“ nicht zuverlässig – Sicherheitsnetz nach geschätzter Dauer.
    const estimate = Math.max(2500, (text.length * (lang === 'ja-JP' ? 280 : 110)) / (u.rate || 1) + 2000);
    const guard = setTimeout(finish, estimate);
    if (!busy) {
      // Direkt sprechen: iOS erlaubt Sprachausgabe nur innerhalb der Tipp-Geste.
      synth.speak(u);
      return;
    }
    // Chrome verschluckt gelegentlich ein speak() direkt nach cancel().
    setTimeout(() => {
      if (token === currentToken) synth.speak(u);
      else finish();
    }, 30);
  });
}

export function stopSpeaking() {
  currentToken++;
  if (ttsSupported()) window.speechSynthesis.cancel();
}

export function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Spracherkennung

interface RecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface RecognitionEventLike {
  results: ArrayLike<ArrayLike<RecognitionAlternative> & { isFinal: boolean }>;
}
interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function recognitionCtor(): (new () => RecognitionLike) | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => RecognitionLike) | undefined;
}

export function sttSupported(): boolean {
  return !!recognitionCtor();
}

export interface ListenResult {
  alternatives: string[];
  error?: string;
}

export interface ListenHandle {
  result: Promise<ListenResult>;
  stop: () => void;
}

/**
 * Startet die Spracherkennung. Liefert mehrere Alternativen (die Erkennung schreibt
 * Japanisch mal in Kanji, mal in Kana – der Vergleich prüft alle).
 */
export function listen(lang: SpeechLang = 'ja-JP', onInterim?: (text: string) => void): ListenHandle {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    return { result: Promise.resolve({ alternatives: [], error: 'not-supported' }), stop: () => {} };
  }
  stopSpeaking();
  const rec = new Ctor();
  rec.lang = lang;
  rec.interimResults = !!onInterim;
  rec.maxAlternatives = 5;
  rec.continuous = false;

  let finished = false;
  const alternatives: string[] = [];
  let error: string | undefined;
  let resolveFn: (r: ListenResult) => void = () => {};
  const result = new Promise<ListenResult>((resolve) => (resolveFn = resolve));
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(guard);
    resolveFn({ alternatives, error: alternatives.length ? undefined : error ?? 'no-speech' });
  };

  rec.onresult = (e) => {
    for (let i = 0; i < e.results.length; i++) {
      const res = e.results[i];
      if (res.isFinal) {
        for (let j = 0; j < res.length; j++) {
          const t = res[j].transcript.trim();
          if (t && !alternatives.includes(t)) alternatives.push(t);
        }
      } else if (onInterim && res.length) {
        onInterim(res[0].transcript);
      }
    }
  };
  rec.onerror = (e) => {
    error = e.error;
  };
  rec.onend = finish;
  const guard = setTimeout(() => {
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
    setTimeout(finish, 600);
  }, 12000);

  try {
    rec.start();
  } catch {
    error = 'start-failed';
    finish();
  }

  return {
    result,
    stop: () => {
      try {
        rec.stop();
      } catch {
        finish();
      }
    },
  };
}

export function describeSpeechError(error?: string): string {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Mikrofon-Zugriff verweigert. Bitte in den Browser-Einstellungen erlauben.';
    case 'no-speech':
      return 'Ich habe nichts gehört. Tippe aufs Mikro und sprich direkt los.';
    case 'audio-capture':
      return 'Kein Mikrofon gefunden.';
    case 'network':
      return 'Die Spracherkennung braucht eine Internetverbindung.';
    case 'not-supported':
      return 'Spracherkennung wird von diesem Browser nicht unterstützt (am besten Chrome oder Safari).';
    default:
      return 'Das hat nicht geklappt. Versuch es noch einmal.';
  }
}
