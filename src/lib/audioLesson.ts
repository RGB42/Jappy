// Ablaufplan für freihändige Audio-Lektionen nach dem Pimsleur-Prinzip:
// – Antizipation: Erst kommt die deutsche Frage, du antwortest laut, dann die Lösung.
// – Gestaffelte Wiederholung: Neues wird nach immer längeren Abständen erneut abgefragt.
// – Rückwärtsaufbau: Lange Ausdrücke werden vom Ende her Stück für Stück aufgebaut.

export interface LessonItem {
  id: string;
  jp: string;
  kana: string;
  de: string;
  isNew: boolean;
}

export type Cue =
  | { type: 'marker'; itemId: string; phase: 'intro' | 'recall' }
  | { type: 'de'; text: string }
  | { type: 'ja'; text: string; slow?: boolean }
  | { type: 'pause'; ms: number; label: string };

const PARTICLES = new Set(['は', 'が', 'を', 'に', 'へ', 'で', 'と', 'も', 'の', 'か', 'や', 'から', 'まで', 'より', 'ね', 'よ']);

/** Abstände (in Abfrage-Slots) zwischen Einführung und Wiederholungen. */
export const RECALL_GAPS = [2, 5, 10];

export function pauseFor(kana: string): number {
  const len = kana.replace(/\s/g, '').length;
  return Math.min(7000, Math.max(2500, 1500 + len * 260));
}

/** Verteilt Einführungen und Wiederholungen auf eine Zeitleiste von Slots. */
export function schedule(items: LessonItem[]): { item: LessonItem; phase: 'intro' | 'recall' }[] {
  const slots: ({ item: LessonItem; phase: 'intro' | 'recall' } | undefined)[] = [];
  const place = (at: number, entry: { item: LessonItem; phase: 'intro' | 'recall' }) => {
    let s = at;
    while (slots[s]) s++;
    slots[s] = entry;
    return s;
  };
  let cursor = 0;
  for (const item of items) {
    while (slots[cursor]) cursor++;
    const start = place(cursor, { item, phase: item.isNew ? 'intro' : 'recall' });
    const gaps = item.isNew ? RECALL_GAPS : [4];
    for (const g of gaps) place(start + g, { item, phase: 'recall' });
    cursor = start + 1;
  }
  return slots.filter((s): s is { item: LessonItem; phase: 'intro' | 'recall' } => !!s);
}

export function buildLessonScript(items: LessonItem[]): Cue[] {
  const cues: Cue[] = [
    { type: 'de', text: 'Willkommen zur Audio-Lektion. Antworte immer laut, bevor die Lösung kommt. Los geht’s!' },
  ];
  const introduced = new Set<string>();
  for (const { item, phase } of schedule(items)) {
    const pause = pauseFor(item.kana);
    cues.push({ type: 'marker', itemId: item.id, phase });
    if (phase === 'intro' && !introduced.has(item.id)) {
      introduced.add(item.id);
      cues.push({ type: 'de', text: `So sagt man „${item.de}“:` });
      cues.push({ type: 'ja', text: item.jp });
      cues.push({ type: 'pause', ms: pause, label: 'Sprich nach' });
      const tokens = item.kana.replace(/[。、？！]/g, '').split(' ').filter(Boolean);
      if (tokens.length >= 3 && tokens.length <= 6) {
        // Rückwärtsaufbau: „…です“ → „がくせい です“ → „わたし は がくせい です“
        cues.push({ type: 'de', text: 'Stück für Stück, vom Ende her:' });
        for (let k = 1; k < tokens.length; k++) {
          // Fragmente, die mit einer Partikel beginnen, klingen unnatürlich (und は würde „ha“ gelesen).
          if (PARTICLES.has(tokens[tokens.length - k])) continue;
          const part = tokens.slice(-k).join('');
          cues.push({ type: 'ja', text: part, slow: true });
          cues.push({ type: 'pause', ms: pauseFor(part), label: 'Sprich nach' });
        }
      }
      cues.push({ type: 'ja', text: item.jp, slow: true });
      cues.push({ type: 'pause', ms: pause, label: 'Sprich nach' });
    } else {
      cues.push({ type: 'de', text: `Wie sagt man: „${item.de}“?` });
      cues.push({ type: 'pause', ms: pause + 800, label: 'Antworte laut' });
      cues.push({ type: 'ja', text: item.jp });
      cues.push({ type: 'pause', ms: pause, label: 'Wiederhole' });
    }
  }
  cues.push({ type: 'de', text: 'Sehr gut! Das war die Lektion.' });
  cues.push({ type: 'ja', text: 'おつかれさまでした！' });
  return cues;
}

/** Ungefähre Dauer in Sekunden (für die Anzeige). */
export function estimateSeconds(cues: Cue[]): number {
  let ms = 0;
  for (const c of cues) {
    if (c.type === 'pause') ms += c.ms;
    else if (c.type === 'de') ms += c.text.length * 75;
    else if (c.type === 'ja') ms += c.text.length * (c.slow ? 300 : 200) + 300;
  }
  return Math.round(ms / 1000);
}
