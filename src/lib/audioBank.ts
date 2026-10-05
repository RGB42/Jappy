// Eingebaute Audiodateien (natürliche Stimmen, erzeugt mit VOICEVOX) – funktioniert in jedem Browser,
// auch ohne installierte japanische Systemstimme (z. B. Firefox unter Windows/Linux).
import { audioKey, type AudioVoice } from './audioKey';

interface AudioIndex {
  version: number;
  formats?: string[]; // z. B. ['ogg', 'mp3']
  credits: string[];
  keys: string[];
}

let keys: Set<string> | null = null;
let credits: string[] = [];
let version = 1;
let formats: string[] = ['mp3'];
let loading: Promise<void> | null = null;
let player: HTMLAudioElement | null = null;

const BASE = './audio/';

export function loadAudioIndex(): Promise<void> {
  if (keys) return Promise.resolve();
  loading ??= fetch(`${BASE}index.json`)
    .then((r) => (r.ok ? (r.json() as Promise<AudioIndex>) : Promise.reject(new Error(String(r.status)))))
    .then((idx) => {
      keys = new Set(idx.keys);
      credits = idx.credits;
      version = idx.version;
      formats = preferredOrder(idx.formats ?? ['mp3']);
    })
    .catch(() => {
      keys = new Set();
      loading = null; // später erneut versuchen (z. B. wieder online)
    });
  return loading;
}

export function audioCredits(): string[] {
  return credits;
}

export function audioCount(): number {
  return keys?.size ?? 0;
}

/**
 * Opus/Ogg zuerst, wenn der Browser es sicher kann (Firefox dekodiert Opus immer selbst –
 * MP3 hängt dort teils von Systembibliotheken ab). Safari bekommt MP3.
 */
function preferredOrder(available: string[]): string[] {
  const probe = typeof Audio !== 'undefined' ? new Audio() : null;
  const opus = probe?.canPlayType('audio/ogg; codecs=opus') === 'probably';
  return [...available].sort((a, b) => (a === 'ogg' ? (opus ? -1 : 1) : 0) - (b === 'ogg' ? (opus ? -1 : 1) : 0));
}

function urlFor(key: string, format: string): string {
  return `${BASE}ja/${key}.${format}?v=${version}`;
}

export function allAudioUrls(): string[] {
  return [...(keys ?? [])].map((k) => urlFor(k, formats[0]));
}

function clipKey(text: string, voice: AudioVoice): string | null {
  if (!keys) return null;
  for (const v of voice === 'm' ? (['m', 'f'] as const) : (['f'] as const)) {
    const k = audioKey(text, v);
    if (keys.has(k)) return k;
  }
  return null;
}

export function hasClip(text: string, voice: AudioVoice = 'f'): boolean {
  return !!clipKey(text, voice);
}

// Kleine Silent-WAV zum „Entsperren“ der Audiowiedergabe (iOS/Safari verlangen eine Nutzer-Geste).
const SILENCE = 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

function getPlayer(): HTMLAudioElement {
  player ??= new Audio();
  return player;
}

/** Beim ersten Tippen aufrufen: danach darf die App Audio auch zeitversetzt abspielen. */
export function unlockAudio() {
  const a = getPlayer();
  if (a.src) return;
  a.src = SILENCE;
  void a.play().catch(() => {});
}

// Aufnahmen werden als Blob geladen (funktioniert zuverlässig mit dem Offline-Cache)
// und im Speicher gehalten.
const blobs = new Map<string, string>();
async function blobUrl(url: string): Promise<string> {
  const hit = blobs.get(url);
  if (hit) return hit;
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  const obj = URL.createObjectURL(await res.blob());
  blobs.set(url, obj);
  if (blobs.size > 300) {
    const [first, firstUrl] = blobs.entries().next().value as [string, string];
    URL.revokeObjectURL(firstUrl);
    blobs.delete(first);
  }
  return obj;
}

let current: ((ok: boolean) => void) | null = null;

function finishCurrent(ok: boolean) {
  const resolve = current;
  current = null;
  resolve?.(ok);
}

/**
 * Spielt die eingebaute Aufnahme ab. Liefert false, wenn es keine gibt oder das Abspielen
 * scheitert – dann übernimmt die Sprachausgabe des Browsers. Wird die Wiedergabe durch eine
 * neue unterbrochen, löst das Promise mit true auf.
 */
export async function playClip(text: string, opts: { voice?: AudioVoice; rate?: number } = {}): Promise<boolean> {
  if (!keys) await loadAudioIndex();
  const key = clipKey(text, opts.voice ?? 'f');
  if (!key) return false;
  finishCurrent(true);
  const a = getPlayer();
  a.onended = a.onerror = null;
  a.pause();
  return new Promise<boolean>((resolve) => {
    current = resolve;
    const own = (ok: boolean) => {
      if (current === resolve) finishCurrent(ok);
    };
    // Formate der Reihe nach probieren; scheitert das Dekodieren, das nächste nehmen.
    const order = formats.slice();
    const tryFormat = async (i: number) => {
      if (current !== resolve) return;
      if (i >= order.length) return own(false);
      let src: string;
      try {
        src = await blobUrl(urlFor(key, order[i]));
      } catch {
        return tryFormat(i + 1);
      }
      if (current !== resolve) return;
      a.onended = () => {
        if (a.src === src) own(true);
      };
      a.onerror = () => {
        if (a.src !== src) return; // verspätetes Ereignis einer früheren Quelle
        // Dieses Format kann der Browser nicht – künftig gleich das nächste verwenden.
        if (formats[0] === order[i] && formats.length > 1) formats = [...formats.slice(1), formats[0]];
        void tryFormat(i + 1);
      };
      a.src = src;
      a.playbackRate = Math.min(2, Math.max(0.5, opts.rate ?? 1));
      (a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
      a.play().catch((err: unknown) => {
        // Dekodierfehler meldet onerror; andere Fehler (z. B. Autoplay blockiert) beenden die Wiedergabe.
        if (!(err instanceof DOMException && err.name === 'NotSupportedError')) own(false);
      });
    };
    void tryFormat(0);
  });
}

export function stopClip() {
  player?.pause();
  finishCurrent(true);
}

/** Lädt alle Aufnahmen in den Offline-Speicher (Service-Worker-Cache). */
export async function cacheAllAudio(onProgress: (done: number, total: number) => void): Promise<void> {
  await loadAudioIndex();
  const urls = allAudioUrls();
  const cache = await caches.open('jappy-audio');
  let done = 0;
  const queue = [...urls];
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift()!;
      if (!(await cache.match(url))) {
        try {
          const res = await fetch(url);
          if (res.ok) await cache.put(url, res);
        } catch {
          /* einzelne Fehler ignorieren */
        }
      }
      onProgress(++done, urls.length);
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
}

export async function cachedAudioCount(): Promise<number> {
  if (typeof caches === 'undefined') return 0;
  const cache = await caches.open('jappy-audio');
  return (await cache.keys()).length;
}
