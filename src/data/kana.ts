// Kana-Tabellen (Gojūon). Katakana werden aus den Hiragana abgeleitet.
import { toHiragana, toKatakana, toRomaji } from '../lib/kana';

export type KanaScript = 'hiragana' | 'katakana';

export interface KanaRow {
  id: string;
  label: string; // z. B. "K-Reihe"
  group: 'basic' | 'dakuten' | 'yoon';
  chars: string[]; // Hiragana; leere Strings = Lücke in der Tabelle
}

export const kanaRows: KanaRow[] = [
  { id: 'a', label: 'Vokale', group: 'basic', chars: ['あ', 'い', 'う', 'え', 'お'] },
  { id: 'k', label: 'K-Reihe', group: 'basic', chars: ['か', 'き', 'く', 'け', 'こ'] },
  { id: 's', label: 'S-Reihe', group: 'basic', chars: ['さ', 'し', 'す', 'せ', 'そ'] },
  { id: 't', label: 'T-Reihe', group: 'basic', chars: ['た', 'ち', 'つ', 'て', 'と'] },
  { id: 'n', label: 'N-Reihe', group: 'basic', chars: ['な', 'に', 'ぬ', 'ね', 'の'] },
  { id: 'h', label: 'H-Reihe', group: 'basic', chars: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
  { id: 'm', label: 'M-Reihe', group: 'basic', chars: ['ま', 'み', 'む', 'め', 'も'] },
  { id: 'y', label: 'Y-Reihe', group: 'basic', chars: ['や', '', 'ゆ', '', 'よ'] },
  { id: 'r', label: 'R-Reihe', group: 'basic', chars: ['ら', 'り', 'る', 'れ', 'ろ'] },
  { id: 'w', label: 'W-Reihe & N', group: 'basic', chars: ['わ', '', 'を', '', 'ん'] },
  { id: 'g', label: 'G-Reihe', group: 'dakuten', chars: ['が', 'ぎ', 'ぐ', 'げ', 'ご'] },
  { id: 'z', label: 'Z-Reihe', group: 'dakuten', chars: ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'] },
  { id: 'd', label: 'D-Reihe', group: 'dakuten', chars: ['だ', 'ぢ', 'づ', 'で', 'ど'] },
  { id: 'b', label: 'B-Reihe', group: 'dakuten', chars: ['ば', 'び', 'ぶ', 'べ', 'ぼ'] },
  { id: 'p', label: 'P-Reihe', group: 'dakuten', chars: ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'] },
  { id: 'ky', label: 'KY/GY', group: 'yoon', chars: ['きゃ', 'きゅ', 'きょ', 'ぎゃ', 'ぎゅ', 'ぎょ'] },
  { id: 'sy', label: 'SH/J', group: 'yoon', chars: ['しゃ', 'しゅ', 'しょ', 'じゃ', 'じゅ', 'じょ'] },
  { id: 'cy', label: 'CH/NY', group: 'yoon', chars: ['ちゃ', 'ちゅ', 'ちょ', 'にゃ', 'にゅ', 'にょ'] },
  { id: 'hy', label: 'HY/BY/PY', group: 'yoon', chars: ['ひゃ', 'ひゅ', 'ひょ', 'びゃ', 'びゅ', 'びょ', 'ぴゃ', 'ぴゅ', 'ぴょ'] },
  { id: 'my', label: 'MY/RY', group: 'yoon', chars: ['みゃ', 'みゅ', 'みょ', 'りゃ', 'りゅ', 'りょ'] },
];

export const KANA_GROUP_LABEL: Record<KanaRow['group'], string> = {
  basic: 'Grundzeichen',
  dakuten: 'Mit Strichen (゛゜)',
  yoon: 'Kombinationen',
};

export function rowChars(row: KanaRow, script: KanaScript): string[] {
  const chars = row.chars.filter(Boolean);
  return script === 'katakana' ? chars.map(toKatakana) : chars;
}

/** Romaji eines einzelnen Kana-Zeichens (を wird als „wo“ angezeigt, gesprochen „o“). */
export function kanaRomaji(kana: string): string {
  if (kana === 'を' || kana === 'ヲ') return 'wo';
  // Einzeln stehend sind は/へ Silben, keine Partikeln.
  if (kana === 'は' || kana === 'ハ') return 'ha';
  if (kana === 'へ' || kana === 'ヘ') return 'he';
  if (kana === 'ぢ' || kana === 'ヂ') return 'ji (di)';
  if (kana === 'づ' || kana === 'ヅ') return 'zu (du)';
  return toRomaji(kana);
}

export function allKana(script: KanaScript, groups: KanaRow['group'][] = ['basic', 'dakuten', 'yoon']): string[] {
  return kanaRows.filter((r) => groups.includes(r.group)).flatMap((r) => rowChars(r, script));
}

/**
 * Einige Zeichen klingen identisch (ぢ/じ, づ/ず, を/お). In Hörquizzen dürfen sie
 * nicht gleichzeitig als Antwortoptionen erscheinen.
 */
export function soundKey(kana: string): string {
  const h = toHiragana(kana);
  const same: Record<string, string> = { を: 'o', ぢ: 'ji', づ: 'zu', は: 'ha', へ: 'he' };
  return same[h] ?? toRomaji(h);
}
