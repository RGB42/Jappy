// Spiel-Elemente: Level & Ränge, Tagesquests, Abzeichen, Laden, Maskottchen.
// Ziel: tägliche Gewohnheit aufbauen (Auslöser → Routine → Belohnung) und Fortschritt sichtbar machen.
import { allItems, sentencePool } from '../data/index';
import type { Sentence } from '../data/types';
import { STATUS_TEXT, type Forecast, type Skill } from './goal';
import { collectedStamps, isKnown, kanaMastery } from './progress';
import { dayKey } from './srs';
import type { AppState } from './store';

// ---------------------------------------------------------------------------
// Level & Ränge

/** Benötigte Gesamt-XP für ein Level: 0, 50, 150, 300, 500, 750 … */
export function xpForLevel(level: number): number {
  return 25 * level * (level - 1);
}

export function levelInfo(totalXP: number): { level: number; into: number; span: number; rank: Rank } {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXP) level++;
  const base = xpForLevel(level);
  return { level, into: totalXP - base, span: xpForLevel(level + 1) - base, rank: rankFor(level) };
}

export interface Rank {
  min: number;
  jp: string;
  kana: string;
  de: string;
  icon: string;
}

export const RANKS: Rank[] = [
  { min: 1, jp: '観光客', kana: 'かんこうきゃく', de: 'Tourist/in', icon: '🎒' },
  { min: 5, jp: '旅人', kana: 'たびびと', de: 'Reisende/r', icon: '🧳' },
  { min: 10, jp: '探検家', kana: 'たんけんか', de: 'Entdecker/in', icon: '🧭' },
  { min: 15, jp: '通', kana: 'つう', de: 'Kenner/in', icon: '🍵' },
  { min: 22, jp: '達人', kana: 'たつじん', de: 'Meister/in', icon: '🥋' },
  { min: 30, jp: '先生', kana: 'せんせい', de: 'Sensei', icon: '🎓' },
];

export function rankFor(level: number): Rank {
  return [...RANKS].reverse().find((r) => level >= r.min) ?? RANKS[0];
}

export function totalXP(s: AppState): number {
  return Object.values(s.xp).reduce((a, b) => a + b, 0);
}

// ---------------------------------------------------------------------------
// Tagesquests

export type Metric =
  | 'xp'
  | 'spoken'
  | 'perfect'
  | 'reviewed'
  | 'learned'
  | 'dialogue'
  | 'story'
  | 'listen'
  | 'kana'
  | 'audio'
  | 'shadow'
  | 'grammar'
  | 'combo'
  | 'blitz'
  | 'draw';

export interface Quest {
  id: string;
  metric: Metric;
  target: number;
  text: string;
  icon: string;
  reward: number; // Yen
}

const ALL: Skill[] = ['read', 'speak', 'listen', 'write'];

const QUEST_POOL: (Quest & { skills: Skill[] })[] = [
  { id: 'speak10', metric: 'spoken', target: 10, text: 'Sprich 10-mal ins Mikrofon', icon: '🎤', reward: 60, skills: ['speak'] },
  { id: 'perfect3', metric: 'perfect', target: 3, text: '3× „Perfekt“-Aussprache', icon: '💯', reward: 80, skills: ['speak'] },
  { id: 'review15', metric: 'reviewed', target: 15, text: 'Wiederhole 15 Karten', icon: '🔁', reward: 60, skills: ['read', 'speak', 'listen'] },
  { id: 'learn6', metric: 'learned', target: 6, text: 'Lerne 6 neue Ausdrücke', icon: '🆕', reward: 60, skills: ALL },
  { id: 'dialogue1', metric: 'dialogue', target: 1, text: 'Spiele ein Rollenspiel durch', icon: '🎭', reward: 80, skills: ['speak', 'listen'] },
  { id: 'story1', metric: 'story', target: 1, text: 'Hör dir eine Geschichte an', icon: '📻', reward: 70, skills: ['listen'] },
  { id: 'listen1', metric: 'listen', target: 1, text: 'Schaffe eine Hörtraining-Runde', icon: '👂', reward: 60, skills: ['listen'] },
  { id: 'kana15', metric: 'kana', target: 15, text: 'Erkenne 15 Kana richtig', icon: 'あ', reward: 60, skills: ['read', 'write'] },
  { id: 'audio1', metric: 'audio', target: 1, text: 'Mach eine Audio-Lektion', icon: '🎧', reward: 80, skills: ['listen', 'speak'] },
  { id: 'shadow5', metric: 'shadow', target: 5, text: 'Sprich 5 Sätze beim Shadowing', icon: '🗣️', reward: 70, skills: ['speak'] },
  { id: 'combo5', metric: 'combo', target: 5, text: 'Schaffe eine 5er-Serie richtiger Antworten', icon: '⚡', reward: 60, skills: ALL },
  { id: 'blitz1', metric: 'blitz', target: 1, text: 'Spiel eine Runde Hör-Blitz', icon: '⏱️', reward: 50, skills: ['listen'] },
  { id: 'grammar1', metric: 'grammar', target: 1, text: 'Bau Sätze zu einem Grammatik-Muster', icon: '🧩', reward: 60, skills: ['read', 'speak'] },
  { id: 'draw5', metric: 'draw', target: 5, text: 'Schreib 5 Kana mit dem Finger', icon: '✍️', reward: 50, skills: ['write'] },
];

function seeded(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Drei Quests pro Tag: Tagesziel + zwei zufällige, passend zu den Ziel-Fähigkeiten. */
export function dailyQuests(day: string, dailyGoal: number, skills: Skill[] = ALL): Quest[] {
  const rand = seeded(day);
  const pool = QUEST_POOL.filter((q) => q.skills.some((sk) => skills.includes(sk)));
  const picked: Quest[] = [];
  while (picked.length < 2 && pool.length) {
    const i = Math.floor(rand() * pool.length);
    const [q] = pool.splice(i, 1);
    picked.push({ id: q.id, metric: q.metric, target: q.target, text: q.text, icon: q.icon, reward: q.reward });
  }
  return [{ id: 'goal', metric: 'xp', target: dailyGoal, text: 'Erreiche dein Tagesziel', icon: '🎯', reward: 100 }, ...picked];
}

export const CHEST_REWARD = 200;

export function questsFor(s: AppState, day = dayKey()): Quest[] {
  return dailyQuests(day, s.settings.dailyGoal, s.goal?.skills);
}

export function questProgress(s: AppState, q: Quest): number {
  const counts = s.daily.day === dayKey() ? s.daily.counts : {};
  return Math.min(q.target, counts[q.metric] ?? 0);
}

// ---------------------------------------------------------------------------
// Abzeichen

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  check: (s: AppState, c: AchievementContext) => boolean;
}

export interface AchievementContext {
  known: number;
  streak: number;
  stamps: number;
  level: number;
  doneCount: (prefix: string) => number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', icon: '🌱', title: 'Erste Schritte', desc: 'Die ersten Ausdrücke gelernt', check: (_, c) => c.known >= 1 },
  { id: 'words-50', icon: '📗', title: 'Wortsammler', desc: '50 Ausdrücke gelernt', check: (_, c) => c.known >= 50 },
  { id: 'words-150', icon: '📘', title: 'Vielredner', desc: '150 Ausdrücke gelernt', check: (_, c) => c.known >= 150 },
  { id: 'words-300', icon: '📙', title: 'Wortschatz-Profi', desc: '300 Ausdrücke gelernt', check: (_, c) => c.known >= 300 },
  { id: 'words-500', icon: '📚', title: 'Wandelndes Wörterbuch', desc: '500 Ausdrücke gelernt', check: (_, c) => c.known >= 500 },
  { id: 'streak-3', icon: '🔥', title: 'Dranbleiber', desc: '3 Tage in Folge geübt', check: (_, c) => c.streak >= 3 },
  { id: 'streak-7', icon: '🔥', title: 'Eine ganze Woche', desc: '7 Tage in Folge geübt', check: (_, c) => c.streak >= 7 },
  { id: 'streak-30', icon: '🌋', title: 'Monats-Serie', desc: '30 Tage in Folge geübt', check: (_, c) => c.streak >= 30 },
  { id: 'streak-100', icon: '🏆', title: 'Hundert Tage', desc: '100 Tage in Folge geübt', check: (_, c) => c.streak >= 100 },
  { id: 'hiragana', icon: 'あ', title: 'Hiragana-Meister', desc: 'Alle Hiragana sicher erkannt', check: (s) => kanaMastery(s, 'hiragana') >= 0.95 },
  { id: 'katakana', icon: 'ア', title: 'Katakana-Meister', desc: 'Alle Katakana sicher erkannt', check: (s) => kanaMastery(s, 'katakana') >= 0.95 },
  { id: 'speak-50', icon: '🎤', title: 'Mutig gesprochen', desc: '50-mal laut gesprochen', check: (s) => s.counters.spoken >= 50 },
  { id: 'speak-500', icon: '📣', title: 'Plaudertasche', desc: '500-mal laut gesprochen', check: (s) => s.counters.spoken >= 500 },
  { id: 'perfect-10', icon: '💯', title: 'Klare Aussprache', desc: '10× „Perfekt“ beim Sprechen', check: (s) => s.records.perfect >= 10 },
  { id: 'roleplay-1', icon: '🎭', title: 'Erste Szene', desc: 'Ein Rollenspiel durchgespielt', check: (_, c) => c.doneCount('dialogue:') >= 1 },
  { id: 'roleplay-10', icon: '🎬', title: 'Bühnenprofi', desc: '10 verschiedene Rollenspiele', check: (_, c) => c.doneCount('dialogue:') >= 10 },
  { id: 'story-5', icon: '📻', title: 'Gute Zuhörer/in', desc: '5 Hörgeschichten verstanden', check: (_, c) => c.doneCount('story:') >= 5 },
  { id: 'audio-5', icon: '🎧', title: 'Unterwegs gelernt', desc: '5 Audio-Lektionen', check: (s) => (s.done['audio-lesson']?.count ?? 0) >= 5 },
  { id: 'goal-7', icon: '🎯', title: 'Zielstrebig', desc: 'Tagesziel 7-mal erreicht', check: (s) => s.records.goalDays >= 7 },
  { id: 'early', icon: '🌅', title: 'Frühaufsteher/in', desc: 'Vor 8 Uhr geübt', check: (s) => s.records.earlyBird },
  { id: 'night', icon: '🦉', title: 'Nachteule', desc: 'Nach 22 Uhr geübt', check: (s) => s.records.nightOwl },
  { id: 'combo-10', icon: '⚡', title: 'Volltreffer-Serie', desc: '10 richtige Antworten am Stück', check: (s) => s.records.maxCombo >= 10 },
  { id: 'blitz-15', icon: '⏱️', title: 'Blitzmerker', desc: '15 Punkte im Hör-Blitz', check: (s) => s.records.blitzBest >= 15 },
  { id: 'quests-20', icon: '📜', title: 'Quest-Held/in', desc: '20 Tagesquests geschafft', check: (s) => s.records.quests >= 20 },
  { id: 'stamp-1', icon: '🎫', title: 'Erster Stempel', desc: 'Die erste Reisestation erreicht', check: (_, c) => c.stamps >= 1 },
  { id: 'stamp-5', icon: '🗾', title: 'Weit gereist', desc: '5 Stempel gesammelt', check: (_, c) => c.stamps >= 5 },
  { id: 'level-10', icon: '⭐', title: 'Level 10', desc: 'Level 10 erreicht', check: (_, c) => c.level >= 10 },
];

export const ACHIEVEMENT_REWARD = 100;

export function achievementContext(s: AppState, streak: number): AchievementContext {
  const doneKeys = Object.keys(s.done);
  return {
    known: allItems.filter((i) => isKnown(s, i.id)).length,
    streak,
    stamps: collectedStamps(s).length,
    level: levelInfo(totalXP(s)).level,
    doneCount: (prefix) => doneKeys.filter((k) => k.startsWith(prefix)).length,
  };
}

// ---------------------------------------------------------------------------
// Laden

export interface ShopItem {
  id: string;
  kind: 'freeze' | 'souvenir' | 'theme';
  icon: string;
  name: string;
  jp?: Sentence; // japanischer Name zum Anhören
  price: number;
}

export const MAX_FREEZES = 2;

export const SHOP: ShopItem[] = [
  { id: 'freeze', kind: 'freeze', icon: '❄️', name: 'Streak-Schutz', price: 500 },
  { id: 'theme-sakura', kind: 'theme', icon: '🌸', name: 'Farbe „Sakura“', price: 1000 },
  { id: 'theme-matcha', kind: 'theme', icon: '🍵', name: 'Farbe „Matcha“', price: 1000 },
  { id: 'theme-ai', kind: 'theme', icon: '🌊', name: 'Farbe „Ai-Indigo“', price: 1000 },
  { id: 'theme-yuzu', kind: 'theme', icon: '🍊', name: 'Farbe „Yuzu“', price: 1000 },
  { id: 'dango', kind: 'souvenir', icon: '🍡', name: 'Dango', jp: { jp: '団子', kana: 'だんご', de: 'Reisklößchen' }, price: 300 },
  { id: 'hashi', kind: 'souvenir', icon: '🥢', name: 'Essstäbchen', jp: { jp: '箸', kana: 'はし', de: 'Essstäbchen' }, price: 300 },
  { id: 'bento', kind: 'souvenir', icon: '🍱', name: 'Bentō-Box', jp: { jp: '弁当', kana: 'べんとう', de: 'Lunchbox' }, price: 400 },
  { id: 'daruma', kind: 'souvenir', icon: '🎎', name: 'Puppen', jp: { jp: '人形', kana: 'にんぎょう', de: 'Puppe' }, price: 500 },
  { id: 'chochin', kind: 'souvenir', icon: '🏮', name: 'Papierlaterne', jp: { jp: '提灯', kana: 'ちょうちん', de: 'Papierlaterne' }, price: 500 },
  { id: 'furin', kind: 'souvenir', icon: '🎐', name: 'Windspiel', jp: { jp: '風鈴', kana: 'ふうりん', de: 'Windglocke' }, price: 600 },
  { id: 'hanafuda', kind: 'souvenir', icon: '🎴', name: 'Blumenkarten', jp: { jp: '花札', kana: 'はなふだ', de: 'Hanafuda-Karten' }, price: 700 },
  { id: 'manekineko', kind: 'souvenir', icon: '🐱', name: 'Winkekatze', jp: { jp: '招き猫', kana: 'まねきねこ', de: 'Winkekatze' }, price: 800 },
  { id: 'matcha', kind: 'souvenir', icon: '🍵', name: 'Matcha-Set', jp: { jp: '抹茶', kana: 'まっちゃ', de: 'Grüntee-Pulver' }, price: 800 },
  { id: 'koinobori', kind: 'souvenir', icon: '🎏', name: 'Karpfenfahnen', jp: { jp: '鯉のぼり', kana: 'こいのぼり', de: 'Karpfen-Windsack' }, price: 900 },
  { id: 'yukata', kind: 'souvenir', icon: '👘', name: 'Yukata', jp: { jp: '浴衣', kana: 'ゆかた', de: 'Sommerkimono' }, price: 1200 },
  { id: 'kasa', kind: 'souvenir', icon: '⛱️', name: 'Schirm', jp: { jp: '傘', kana: 'かさ', de: 'Schirm' }, price: 600 },
  { id: 'onigiri', kind: 'souvenir', icon: '🍙', name: 'Onigiri', jp: { jp: 'おにぎり', kana: 'おにぎり', de: 'Reisball' }, price: 300 },
  { id: 'shiro', kind: 'souvenir', icon: '🏯', name: 'Burg-Modell', jp: { jp: '城', kana: 'しろ', de: 'Burg' }, price: 2000 },
];

export const THEMES: Record<string, string> = {
  beni: 'Beni-Rot',
  sakura: 'Sakura',
  matcha: 'Matcha',
  ai: 'Ai-Indigo',
  yuzu: 'Yuzu',
};

// ---------------------------------------------------------------------------
// Maskottchen „Hachi“ (benannt nach dem treuen Hund Hachikō vom Bahnhof Shibuya)

export function mascotMessage(s: AppState, xpToday: number, forecast: Forecast | null, now = new Date()): Sentence {
  const h = now.getHours();
  const goal = s.settings.dailyGoal;
  if (xpToday >= goal) return { jp: 'すごい！', kana: 'すごい！', de: 'Tagesziel geschafft! Morgen geht’s weiter – oder noch eine Runde?' };
  if (xpToday === 0 && h >= 18 && s.streak > 0)
    return { jp: 'ちょっとだけ！', kana: 'ちょっと だけ！', de: `Nur ein bisschen! Deine ${s.streak}-Tage-Serie wartet auf dich.` };
  if (forecast && s.goal && forecast.daysLeft >= 0 && forecast.status !== 'done') {
    const pick = (now.getDate() + h) % 3;
    if (pick === 0)
      return { jp: 'がんばって！', kana: 'がんばって！', de: `Noch ${forecast.daysLeft} Tage bis „${s.goal.title}“. ${STATUS_TEXT[forecast.status]}` };
  }
  if (h < 11) return { jp: 'おはよう！', kana: 'おはよう！', de: 'Guten Morgen! Fünf Minuten Japanisch zum Kaffee?' };
  if (xpToday > 0) return { jp: 'いいね！', kana: 'いい ね！', de: `Schon ${xpToday} von ${goal} XP – weiter so!` };
  return { jp: 'いっしょに がんばろう！', kana: 'いっしょ に がんばろう！', de: 'Lass uns zusammen loslegen!' };
}

/** Ein zufälliger Satz aus dem Inhalt – für „Ausdruck des Tages“ & Co. */
export function sentenceOfDay(level: 1 | 2 | 3): Sentence | undefined {
  const pool = sentencePool(level);
  if (!pool.length) return undefined;
  return pool[Math.floor(seeded(dayKey())() * pool.length)];
}
