// Kurze Sound-Effekte über die Web Audio API (keine Audiodateien nötig).
import { getState } from './store';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !getState().settings.sound) return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  correct() {
    tone(880, 0, 0.12);
    tone(1318.5, 0.08, 0.18);
  },
  wrong() {
    tone(220, 0, 0.18, 'triangle', 0.1);
    tone(196, 0.1, 0.22, 'triangle', 0.08);
  },
  coin() {
    tone(1568, 0, 0.08, 'square', 0.05);
    tone(2093, 0.07, 0.16, 'square', 0.05);
  },
  combo() {
    [659.3, 784, 987.8].forEach((f, i) => tone(f, i * 0.06, 0.12, 'sine', 0.1));
  },
  fanfare() {
    // Pentatonische Fanfare – klingt ein bisschen nach Japan.
    [523.3, 587.3, 659.3, 784, 880, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.1));
  },
  tick() {
    tone(1200, 0, 0.04, 'square', 0.03);
  },
};
