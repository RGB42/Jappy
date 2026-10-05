// Schlüssel für eingebaute Audiodateien: stabiler Hash aus Stimme + Text.
// Wird identisch im Build-Skript (Korpus) und zur Laufzeit verwendet.

/** cyrb53 – schneller 53-Bit-String-Hash. */
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export type AudioVoice = 'f' | 'm';

export function audioKey(text: string, voice: AudioVoice = 'f'): string {
  return `${voice}${cyrb53(text.trim()).toString(36)}`;
}
