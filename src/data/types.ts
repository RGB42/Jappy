// Gemeinsame Datentypen für alle Lerninhalte.
//
// Konventionen:
// - `jp`   = natürliche Schreibweise (mit Kanji, wo im Alltag üblich). Wird vorgelesen (TTS).
// - `kana` = Lesung nur in Hiragana/Katakana. In Sätzen werden Wörter und Partikeln
//            durch Leerzeichen getrennt („わたし は がくせい です。“), damit Einsteiger
//            die Struktur hören/sehen und Romaji korrekt erzeugt werden (は → wa).
// - `romaji` nur angeben, wenn die automatische Umschrift falsch wäre (z. B. こんにちは).
// - `de`   = deutsche Bedeutung, kurz.

export type Level = 1 | 2 | 3; // 1 = Einsteiger (≈N5), 2 = Grundstufe (≈N4), 3 = Fortgeschritten (≈N3+)

export type TopicId =
  | 'basics'
  | 'greetings'
  | 'self'
  | 'numbers'
  | 'time'
  | 'food'
  | 'shopping'
  | 'travel'
  | 'directions'
  | 'family'
  | 'home'
  | 'body'
  | 'nature'
  | 'work'
  | 'hobby'
  | 'feelings'
  | 'actions'
  | 'business';

export interface Sentence {
  jp: string;
  kana: string;
  de: string;
  romaji?: string;
}

/** Wort oder fester Ausdruck (Chunk) – Grundlage der Karteikarten (SRS). */
export interface LearnItem extends Sentence {
  id: string; // global eindeutig, z. B. "w-taberu" (Wort) oder "p-onegaishimasu" (Phrase)
  kind: 'word' | 'phrase';
  topic: TopicId;
  level: Level;
  /** Wortart, nur bei Wörtern: Nomen, Verb (u/ru/irr), i-Adj., na-Adj., Adverb, … */
  pos?: string;
  example?: Sentence;
  /** Kurzer Hinweis/Eselsbrücke auf Deutsch (max. 1 Satz). */
  note?: string;
}

export interface KanaMnemonic {
  kana: string; // z. B. "あ"
  hint: string; // Eselsbrücke auf Deutsch
}

export interface DialogueRole {
  id: 'A' | 'B';
  name: string; // Japanisch, z. B. "店員"
  nameDe: string; // z. B. "Kellner/in"
}

export interface DialogueLine extends Sentence {
  role: 'A' | 'B';
  /** Weitere akzeptierte Antworten (nur für die Rolle der lernenden Person), in Kana. */
  accept?: string[];
}

export interface Dialogue {
  id: string; // "d-konbini"
  title: string; // Deutsch
  titleJp: string;
  level: Level;
  topic: TopicId;
  situation: string; // 1–2 Sätze auf Deutsch
  roles: [DialogueRole, DialogueRole];
  /** Rolle, die die lernende Person spricht. */
  userRole: 'A' | 'B';
  lines: DialogueLine[];
}

export interface StoryQuestion {
  q: string; // Frage auf Deutsch
  options: string[]; // Antwortmöglichkeiten auf Deutsch
  answer: number; // Index der richtigen Option
}

/** Kurze Hörgeschichte (Comprehensible Input) mit Verständnisfragen. */
export interface Story {
  id: string; // "s-meinmorgen"
  title: string;
  titleJp: string;
  level: Level;
  topic: TopicId;
  sentences: Sentence[];
  questions: StoryQuestion[];
}

export interface Tile {
  jp: string;
  kana: string;
}

/** Satzbau-Übung: Bausteine in die richtige Reihenfolge bringen. */
export interface BuildExercise {
  de: string;
  /** Bausteine in korrekter Reihenfolge. jp-Satz = tiles.map(t => t.jp).join('') + Satzzeichen. */
  tiles: Tile[];
  /** Falsche Zusatzbausteine (optional), z. B. falsche Partikel. */
  distractors?: Tile[];
}

export interface GrammarPoint {
  id: string; // "g-desu"
  title: string; // Deutsch, kurz
  pattern: string; // z. B. "A は B です"
  level: Level;
  /** Max. 3 kurze Sätze – die App setzt auf Hören & Ausprobieren statt Lesen. */
  explanation: string;
  examples: Sentence[];
  exercises: BuildExercise[];
}

export interface MinimalPair {
  id: string;
  feature: string; // z. B. "Langer Vokal"
  a: Sentence;
  b: Sentence;
}
