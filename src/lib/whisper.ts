// Steuerung der Offline-Spracherkennung (Whisper im Web Worker) + Mikrofonaufnahme mit Stilleerkennung.
import { useSyncExternalStore } from 'react';

// Moonshine (japanisch) verarbeitet nur die tatsächliche Länge der Aufnahme und ist im Browser
// etwa 10× schneller als Whisper bei gleicher Genauigkeit (eigene Messung in Firefox).
export type WhisperModel = 'fast';

export const WHISPER_MODELS: Record<WhisperModel, { label: string; size: string }> = {
  fast: { label: 'Moonshine (Japanisch)', size: '≈ 65 MB' },
};

export interface WhisperStatus {
  state: 'idle' | 'loading' | 'ready' | 'error';
  progress: number; // 0…1
  model?: WhisperModel;
  error?: string;
}

let status: WhisperStatus = { state: 'idle', progress: 0 };
const listeners = new Set<() => void>();
function setStatus(patch: Partial<WhisperStatus>) {
  status = { ...status, ...patch };
  listeners.forEach((l) => l());
}

export function useWhisperStatus(): WhisperStatus {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => status,
  );
}

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (v: string) => void; reject: (e: Error) => void }>();
const files = new Map<string, { loaded: number; total: number }>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./whisper.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (e: MessageEvent) => {
    const msg = e.data as { type: string; id?: number; text?: string; message?: string; file?: string; loaded?: number; total?: number };
    if (msg.type === 'progress' && msg.file) {
      files.set(msg.file, { loaded: msg.loaded ?? 0, total: msg.total ?? 0 });
      const all = [...files.values()];
      const total = all.reduce((s, f) => s + f.total, 0);
      setStatus({ progress: total ? all.reduce((s, f) => s + f.loaded, 0) / total : 0 });
      return;
    }
    const p = msg.id !== undefined ? pending.get(msg.id) : undefined;
    if (!p) return;
    pending.delete(msg.id!);
    if (msg.type === 'error') p.reject(new Error(msg.message));
    else p.resolve(msg.text ?? '');
  };
  return worker;
}

function request(type: 'load' | 'transcribe', model: WhisperModel, audio?: Float32Array): Promise<string> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ type, id, model, audio }, audio ? [audio.buffer] : []);
  });
}

/** Lädt das Modell (beim ersten Mal Download, danach aus dem Browser-Cache). */
export async function loadWhisper(model: WhisperModel): Promise<void> {
  if (status.state === 'ready' && status.model === model) return;
  files.clear();
  setStatus({ state: 'loading', progress: 0, model, error: undefined });
  try {
    await request('load', model);
    setStatus({ state: 'ready', progress: 1 });
  } catch (e) {
    setStatus({ state: 'error', error: e instanceof Error ? e.message : String(e) });
    throw e;
  }
}

export async function transcribe(audio: Float32Array, model: WhisperModel): Promise<string> {
  await loadWhisper(model);
  return request('transcribe', model, audio);
}

// ---------------------------------------------------------------------------
// Aufnahme mit einfacher Stilleerkennung (stoppt automatisch nach einer Sprechpause)

export interface RecordControl {
  stop?: () => void;
}

export async function recordSpeech(control: RecordControl, opts: { maxMs?: number } = {}): Promise<Float32Array> {
  // AudioContext noch innerhalb der Tipp-Geste anlegen und starten – sonst bleibt er in Firefox/Safari pausiert.
  const ctx = new AudioContext();
  void ctx.resume();
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    });
  } catch (e) {
    void ctx.close();
    throw e;
  }
  if (ctx.state !== 'running') await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 500))]);
  if (ctx.state !== 'running') {
    // Kein laufender Audio-Kontext (z. B. kein Ausgabegerät): mit MediaRecorder aufnehmen, danach auswerten.
    void ctx.close();
    return recordWithMediaRecorder(stream, control, Math.min(opts.maxMs ?? 9000, 6000));
  }
  const source = ctx.createMediaStreamSource(stream);
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];
  const rate = ctx.sampleRate;
  const maxMs = opts.maxMs ?? 9000;
  let elapsed = 0;
  let speech = false;
  let speechStart = 0; // Chunk, in dem Sprache beginnt (führende Stille wird abgeschnitten)
  let silence = 0;
  let loudMs = 0;
  let speechMs = 0;
  let totalLoud = 0;
  let noise = 0.004;

  return new Promise<Float32Array>((resolve, reject) => {
    let finished = false;
    const finish = async () => {
      if (finished) return;
      finished = true;
      clearTimeout(guard);
      proc.disconnect();
      source.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      try {
        const used = chunks.slice(Math.max(0, speechStart - 6));
        const length = used.reduce((s, c) => s + c.length, 0);
        const merged = new Float32Array(length);
        let off = 0;
        for (const c of used) {
          merged.set(c, off);
          off += c.length;
        }
        await ctx.close();
        // Weniger als ~0,3 s tatsächliche Sprache → nichts auswerten (sonst „erfindet“ die KI Text)
        resolve(speech && totalLoud >= 300 ? await resample(merged, rate) : new Float32Array(0));
      } catch (e) {
        reject(e);
      }
    };
    control.stop = () => void finish();
    // Sicherheitsnetz, falls das Audio-Processing nicht läuft
    const guard = setTimeout(() => void finish(), maxMs + 1500);
    proc.onaudioprocess = (e) => {
      const data = e.inputBuffer.getChannelData(0);
      chunks.push(new Float32Array(data));
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length);
      const ms = (data.length / rate) * 1000;
      elapsed += ms;
      if (!speech) noise = noise * 0.9 + Math.min(rms, 0.05) * 0.1;
      // Die ersten ~250 ms ignorieren (Knacken beim Öffnen des Mikrofons)
      const loud = elapsed > 250 && rms > Math.max(0.015, noise * 3);
      if (loud) totalLoud += ms;
      if (loud) {
        loudMs += ms;
        silence = 0;
        // Sprache erst ab ~170 ms durchgehendem Pegel (ignoriert Knacken/Klicks)
        if (!speech && loudMs >= 160) {
          speech = true;
          speechStart = Math.max(0, chunks.length - 1 - Math.ceil(loudMs / ms));
          speechMs = 0;
        }
      } else {
        loudMs = 0;
        if (speech) silence += ms;
      }
      if (speech) speechMs += ms;
      if ((speech && silence > 1100 && speechMs > 1000) || elapsed > maxMs || (!speech && elapsed > 7000)) void finish();
    };
    source.connect(proc);
    proc.connect(ctx.destination);
  });
}

/** Rückfall ohne Live-Pegel: feste Höchstdauer oder Stopp per Tippen, danach dekodieren. */
function recordWithMediaRecorder(stream: MediaStream, control: RecordControl, maxMs: number): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const rec = new MediaRecorder(stream);
    const parts: Blob[] = [];
    rec.ondataavailable = (e) => parts.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      try {
        const buf = await new Blob(parts, { type: rec.mimeType }).arrayBuffer();
        const decoder = new OfflineAudioContext(1, 16000, 16000);
        const audio = await decoder.decodeAudioData(buf);
        const data = audio.getChannelData(0);
        // Ohne Pegelmessung grob prüfen, ob überhaupt etwas gesprochen wurde
        let peak = 0;
        for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
        resolve(peak < 0.02 ? new Float32Array(0) : await resample(new Float32Array(data), audio.sampleRate));
      } catch (e) {
        reject(e);
      }
    };
    control.stop = () => rec.state === 'recording' && rec.stop();
    rec.start();
    setTimeout(() => rec.state === 'recording' && rec.stop(), maxMs);
  });
}

async function resample(data: Float32Array, from: number): Promise<Float32Array> {
  if (from === 16000) return data;
  const length = Math.ceil((data.length * 16000) / from);
  const offline = new OfflineAudioContext(1, length, 16000);
  const buf = offline.createBuffer(1, data.length, from);
  buf.copyToChannel(data as Float32Array<ArrayBuffer>, 0);
  const src = offline.createBufferSource();
  src.buffer = buf;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0).slice();
}
