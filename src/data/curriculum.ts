// Lernpfad: Einheiten mit Kann-Beschreibungen. Jede Einheit mischt Kana, neue Ausdrücke,
// Grammatik-Muster, Rollenspiele und Hörgeschichten (Interleaving statt Blocklernen).
import type { KanaScript } from './kana';
import type { Level, TopicId } from './types';
import { allItems, dialogueById, grammarById, stories } from './index';

export type Step =
  | { type: 'kana'; script: KanaScript; rows: string[]; label: string; key: string }
  | { type: 'learn'; items: string[]; label: string; key: string }
  | { type: 'grammar'; id: string; label: string; key: string }
  | { type: 'dialogue'; id: string; label: string; key: string }
  | { type: 'story'; id: string; label: string; key: string }
  | { type: 'listen'; level: Level; label: string; key: string }
  | { type: 'pairs'; label: string; key: string };

export interface Unit {
  id: string;
  level: Level;
  title: string;
  goal: string; // Kann-Beschreibung
  steps: Step[];
}

interface UnitDef {
  id: string;
  level: Level;
  title: string;
  goal: string;
  kana?: { script: KanaScript; rows: string[] }[];
  topics: TopicId[];
  grammar?: string[];
  dialogues?: string[];
  story?: boolean;
  listen?: boolean;
  pairs?: boolean;
}

const DEFS: UnitDef[] = [
  // ---------------- Einsteiger ----------------
  { id: 'u1', level: 1, title: 'Erste Laute & Grüße', goal: 'Du kannst grüßen, danken und dich entschuldigen.', kana: [{ script: 'hiragana', rows: ['a', 'k'] }], topics: ['greetings'], pairs: true },
  { id: 'u2', level: 1, title: 'Das bin ich', goal: 'Du kannst dich vorstellen und einfache Fragen stellen.', kana: [{ script: 'hiragana', rows: ['s', 't'] }], topics: ['self', 'basics'], grammar: ['g-desu', 'g-desu-ka'], dialogues: ['d-jikoshoukai'] },
  { id: 'u3', level: 1, title: 'Dies & das, Zahlen', goal: 'Du kannst auf Dinge zeigen, zählen und nach Preisen fragen.', kana: [{ script: 'hiragana', rows: ['n', 'h'] }], topics: ['numbers'], grammar: ['g-kosoado', 'g-no'], dialogues: ['d-konbini'] },
  { id: 'u4', level: 1, title: 'Essen & Trinken', goal: 'Du kannst im Café bestellen und sagen, was du isst und trinkst.', kana: [{ script: 'hiragana', rows: ['m', 'y', 'r'] }], topics: ['food'], grammar: ['g-masu'], dialogues: ['d-kissaten'], story: true },
  { id: 'u5', level: 1, title: 'Unterwegs', goal: 'Du kannst nach dem Weg fragen und eine Fahrkarte kaufen.', kana: [{ script: 'hiragana', rows: ['w', 'g', 'z'] }], topics: ['travel', 'directions'], grammar: ['g-ni-e', 'g-de'], dialogues: ['d-michi', 'd-kippu'], listen: true },
  { id: 'u6', level: 1, title: 'Mein Tag', goal: 'Du kannst über deinen Tagesablauf sprechen und dich verabreden.', kana: [{ script: 'hiragana', rows: ['d', 'b', 'p'] }], topics: ['time', 'actions'], grammar: ['g-mashita', 'g-masenka'], dialogues: ['d-yakusoku'], story: true },
  { id: 'u7', level: 1, title: 'Familie & Zuhause', goal: 'Du kannst deine Familie und deine Wohnung beschreiben.', kana: [{ script: 'hiragana', rows: ['ky', 'sy', 'cy', 'hy', 'my'] }], topics: ['family', 'home'], grammar: ['g-arimasu-imasu'], story: true },
  { id: 'u8', level: 1, title: 'Katakana & Einkaufen', goal: 'Du kannst Lehnwörter lesen, Dinge beschreiben und Wünsche äußern.', kana: [{ script: 'katakana', rows: ['a', 'k', 's', 't', 'n'] }], topics: ['shopping', 'feelings'], grammar: ['g-keiyoushi', 'g-tai'], dialogues: ['d-resutoran'] },
  { id: 'u9', level: 1, title: 'Freizeit & Natur', goal: 'Du kannst über Hobbys, Wetter und Befinden sprechen.', kana: [{ script: 'katakana', rows: ['h', 'm', 'y', 'r', 'w'] }, { script: 'katakana', rows: ['g', 'z', 'd', 'b', 'p'] }], topics: ['hobby', 'nature', 'body', 'work'], story: true, listen: true },
  // ---------------- Grundstufe ----------------
  { id: 'u10', level: 2, title: 'Bitten & Erlaubnis', goal: 'Du kannst höflich um etwas bitten und um Erlaubnis fragen.', topics: ['actions', 'greetings'], grammar: ['g-te-kudasai', 'g-temo-ii'], dialogues: ['d-hoteru'] },
  { id: 'u11', level: 2, title: 'Gesundheit & Gründe', goal: 'Du kannst Beschwerden beschreiben und Gründe nennen.', topics: ['body', 'basics'], grammar: ['g-te-imasu', 'g-kara'], dialogues: ['d-byouin'], story: true },
  { id: 'u12', level: 2, title: 'Shopping & Vergleiche', goal: 'Du kannst Dinge vergleichen, Vorlieben ausdrücken und anprobieren.', topics: ['shopping', 'feelings'], grammar: ['g-yori', 'g-suki-desu', 'g-keiyoushi-kako'], dialogues: ['d-fuku'] },
  { id: 'u13', level: 2, title: 'Freizeit & Erfahrungen', goal: 'Du kannst von Erlebnissen und Reisen erzählen.', topics: ['hobby', 'nature', 'travel'], grammar: ['g-ta-koto'], dialogues: ['d-shuumatsu'], story: true, listen: true },
  { id: 'u14', level: 2, title: 'Alltag & Meinungen', goal: 'Du kannst locker sprechen und deine Meinung sagen.', topics: ['home', 'time', 'work', 'food'], grammar: ['g-futsuukei', 'g-to-omoimasu'], dialogues: ['d-takuhaibin'], story: true },
  // ---------------- Fortgeschritten ----------------
  { id: 'u15', level: 3, title: 'Höflich im Beruf', goal: 'Du kannst am Telefon und im Büro angemessen höflich sprechen.', topics: ['business', 'work'], grammar: ['g-keigo'], dialogues: ['d-denwa'], story: true },
  { id: 'u16', level: 3, title: 'Pläne & Bedingungen', goal: 'Du kannst Pläne ändern und Bedingungen ausdrücken.', topics: ['time', 'travel', 'actions'], grammar: ['g-tara-ba', 'g-nagara'], dialogues: ['d-henkou'], listen: true },
  { id: 'u17', level: 3, title: 'Unter Freunden', goal: 'Du verstehst lockere Umgangssprache und kannst mitreden.', topics: ['feelings', 'hobby'], grammar: ['g-sou-desu', 'g-te-shimau'], dialogues: ['d-tomodachi'], story: true },
  { id: 'u18', level: 3, title: 'Probleme lösen', goal: 'Du kannst Probleme schildern und höflich Lösungen aushandeln.', topics: ['home', 'body', 'shopping'], grammar: ['g-ukemi', 'g-shieki', 'g-you-ni'], dialogues: ['d-kujou'], story: true },
];

const CHUNK = 6;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildUnits(): Unit[] {
  const defs = [...DEFS];
  // Themen, die in keiner Einheit eines Niveaus vorkommen, landen in einer Wortschatz-Einheit am Ende.
  for (const level of [1, 2, 3] as Level[]) {
    const covered = new Set(defs.filter((d) => d.level === level).flatMap((d) => d.topics));
    const missing = [...new Set(allItems.filter((i) => i.level === level && !covered.has(i.topic)).map((i) => i.topic))];
    if (missing.length) {
      const lastIdx = defs.map((d) => d.level).lastIndexOf(level);
      defs.splice(lastIdx + 1, 0, {
        id: `u-mix-${level}`,
        level,
        title: 'Wortschatz-Mix',
        goal: 'Du erweiterst deinen Wortschatz in weiteren Alltagsthemen.',
        topics: missing,
      });
    }
  }

  // Ausdrücke eines Themas/Niveaus gleichmäßig auf die Einheiten verteilen, die das Thema nutzen.
  const share = new Map<string, string[][]>();
  for (const level of [1, 2, 3] as Level[]) {
    const lvlDefs = defs.filter((d) => d.level === level);
    const topics = new Set(lvlDefs.flatMap((d) => d.topics));
    for (const t of topics) {
      const users = lvlDefs.filter((d) => d.topics.includes(t));
      const items = allItems.filter((i) => i.level === level && i.topic === t).map((i) => i.id);
      const per = Math.ceil(items.length / users.length);
      users.forEach((u, idx) => share.set(`${u.id}:${t}`, [items.slice(idx * per, (idx + 1) * per)]));
    }
  }

  const storyQueue: Record<Level, string[]> = { 1: [], 2: [], 3: [] };
  for (const s of stories) storyQueue[s.level].push(s.id);

  return defs.map((d) => {
    const kanaSteps: Step[] = (d.kana ?? []).map((k) => ({
      type: 'kana',
      script: k.script,
      rows: k.rows,
      label: `${k.script === 'hiragana' ? 'Hiragana' : 'Katakana'}: ${k.rows.map((r) => r.toUpperCase()).join(', ')}`,
      key: `kana:${k.script}:${k.rows.join(',')}`,
    }));
    const itemIds = d.topics.flatMap((t) => share.get(`${d.id}:${t}`)?.[0] ?? []);
    const learnSteps: Step[] = chunk(itemIds, CHUNK).map((items, i) => ({
      type: 'learn',
      items,
      label: `Neue Ausdrücke ${i + 1}`,
      key: `learn:${d.id}:${i}`,
    }));
    const other: Step[] = [];
    for (const g of d.grammar ?? []) {
      const gp = grammarById.get(g);
      if (gp) other.push({ type: 'grammar', id: g, label: `Muster: ${gp.title}`, key: `grammar:${g}` });
    }
    for (const id of d.dialogues ?? []) {
      const dl = dialogueById.get(id);
      if (dl) other.push({ type: 'dialogue', id, label: `Rollenspiel: ${dl.title}`, key: `dialogue:${id}` });
    }
    if (d.pairs) other.push({ type: 'pairs', label: 'Ohrtraining: Minimalpaare', key: 'pairs' });
    if (d.listen) other.push({ type: 'listen', level: d.level, label: 'Hörtraining: Sätze verstehen', key: `listen:sentences:${d.level}` });
    if (d.story) {
      const id = storyQueue[d.level].shift();
      const st = stories.find((s) => s.id === id);
      if (st) other.push({ type: 'story', id: st.id, label: `Hörgeschichte: ${st.title}`, key: `story:${st.id}` });
    }
    // Abwechselnd: neue Ausdrücke – Anwenden – neue Ausdrücke – …
    const mixed: Step[] = [];
    const max = Math.max(learnSteps.length, other.length);
    for (let i = 0; i < max; i++) {
      if (learnSteps[i]) mixed.push(learnSteps[i]);
      if (other[i]) mixed.push(other[i]);
    }
    return { id: d.id, level: d.level, title: d.title, goal: d.goal, steps: [...kanaSteps, ...mixed] };
  });
}

export const units: Unit[] = buildUnits();
