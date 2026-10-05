/// <reference lib="webworker" />
// Spracherkennung im Browser (Moonshine-JA über transformers.js, WebAssembly) – läuft in jedem modernen
// Browser, auch in Firefox. Das Modell wird einmalig geladen und vom Browser zwischengespeichert.
import { env, pipeline } from '@huggingface/transformers';

env.allowLocalModels = false;

const MODELS: Record<string, { repo: string; whisper: boolean }> = {
  fast: { repo: 'onnx-community/moonshine-base-ja-ONNX', whisper: false },
};

type Asr = (audio: Float32Array, opts: Record<string, unknown>) => Promise<{ text: string } | { text: string }[]>;

let asr: Asr | null = null;
let loaded = '';
let loading: Promise<void> | null = null;

function post(msg: unknown) {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);
}

async function ensure(model: string) {
  if (asr && loaded === model) return;
  if (loading && loaded === model) return loading;
  loaded = model;
  loading = (async () => {
    asr = (await pipeline('automatic-speech-recognition', (MODELS[model] ?? MODELS.fast).repo, {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: (p: { status: string; file?: string; loaded?: number; total?: number }) => {
        if (p.status === 'progress') post({ type: 'progress', file: p.file, loaded: p.loaded, total: p.total });
      },
    })) as unknown as Asr;
  })();
  try {
    await loading;
  } catch (e) {
    asr = null;
    loaded = '';
    throw e;
  } finally {
    loading = null;
  }
}

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data as { type: 'load' | 'transcribe'; id: number; model: string; audio?: Float32Array };
  try {
    await ensure(msg.model);
    if (msg.type === 'load') {
      post({ type: 'ready', id: msg.id });
      return;
    }
    // Moonshine-ja ist rein japanisch; Whisper braucht die Sprachangabe.
    // Moonshine: Textlänge an die Aufnahmedauer koppeln (verhindert endlose Wiederholungen bei Störgeräuschen).
    const seconds = msg.audio!.length / 16000;
    const opts = (MODELS[msg.model] ?? MODELS.fast).whisper
      ? { language: 'japanese', task: 'transcribe' }
      : { max_new_tokens: Math.min(80, Math.ceil(seconds * 6.5) + 4) };
    const out = await asr!(msg.audio!, opts);
    const text = Array.isArray(out) ? out.map((o) => o.text).join('') : out.text;
    post({ type: 'result', id: msg.id, text: text.trim() });
  } catch (err) {
    post({ type: 'error', id: msg.id, message: err instanceof Error ? err.message : String(err) });
  }
};
