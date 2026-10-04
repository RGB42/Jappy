// Kana-Werkzeuge: Umwandlung Katakana ↔ Hiragana, Kana → Romaji (Hepburn, Wāpuro-Stil)
// und Normalisierung für den Vergleich von Spracherkennungs-Ergebnissen.

const KATA_START = 0x30a1; // ァ
const KATA_END = 0x30f6; // ヶ
const KATA_OFFSET = 0x60;

export function toHiragana(input: string): string {
  let out = '';
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    out += code >= KATA_START && code <= KATA_END ? String.fromCodePoint(code - KATA_OFFSET) : ch;
  }
  return out;
}

export function toKatakana(input: string): string {
  let out = '';
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    const kata = code + KATA_OFFSET;
    out += code >= 0x3041 && code <= 0x3096 ? String.fromCodePoint(kata) : ch;
  }
  return out;
}

const BASE: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', ゐ: 'wi', ゑ: 'we', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ゔ: 'vu',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
  ゃ: 'ya', ゅ: 'yu', ょ: 'yo', ゎ: 'wa',
};

// Zweizeichen-Kombinationen (Yōon und Lautkombinationen aus Lehnwörtern).
const COMBO: Record<string, string> = {
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo',
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho', しぇ: 'she',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho', ちぇ: 'che',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo', じぇ: 'je',
  ぢゃ: 'ja', ぢゅ: 'ju', ぢょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
  ふぁ: 'fa', ふぃ: 'fi', ふぇ: 'fe', ふぉ: 'fo', ふゅ: 'fyu',
  てぃ: 'ti', でぃ: 'di', とぅ: 'tu', どぅ: 'du', でゅ: 'dyu',
  うぃ: 'wi', うぇ: 'we', うぉ: 'wo',
  ゔぁ: 'va', ゔぃ: 'vi', ゔぇ: 've', ゔぉ: 'vo',
  つぁ: 'tsa', つぃ: 'tsi', つぇ: 'tse', つぉ: 'tso',
  いぇ: 'ye',
};

const PUNCT: Record<string, string> = {
  '。': '. ', '、': ', ', '？': '? ', '！': '! ', '「': '"', '」': '"', '・': ' ',
  '～': '~', '〜': '~', '（': '(', '）': ')', '　': ' ', '…': '...',
};

const PARTICLES: Record<string, string> = { は: 'wa', へ: 'e', を: 'o' };

/**
 * Wandelt Kana in Romaji um. Einzeln stehende Partikeln (durch Leerzeichen getrennt)
 * werden wie gesprochen umgeschrieben: は → wa, へ → e, を → o.
 * Zeichen, die keine Kana sind (z. B. Kanji, Ziffern), bleiben erhalten.
 */
export function toRomaji(input: string): string {
  return input
    .split(/( +)/)
    .map((token) => {
      const [, body, punct] = token.match(/^(.*?)([。、？！]*)$/)!;
      if (PARTICLES[body]) return PARTICLES[body] + wordToRomaji(punct);
      return wordToRomaji(token);
    })
    .join('')
    .replace(/ +([,.?!"])/g, '$1')
    .replace(/ {2,}/g, ' ')
    .trim();
}

function wordToRomaji(word: string): string {
  const s = toHiragana(word);
  let out = '';
  let sokuon = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const pair = s.slice(i, i + 2);
    let syl: string | undefined;
    if (COMBO[pair]) {
      syl = COMBO[pair];
      i++;
    } else if (ch === 'っ') {
      sokuon = true;
      continue;
    } else if (ch === 'ー') {
      const lastVowel = out.match(/[aeiou](?=[^aeiou]*$)/);
      out += lastVowel ? lastVowel[0] : '';
      continue;
    } else if (ch === 'ん') {
      const next = s[i + 1] ?? '';
      const nextRom = BASE[next] ?? '';
      syl = /^[aeiouy]/.test(nextRom) ? "n'" : 'n';
    } else {
      syl = BASE[ch] ?? PUNCT[ch] ?? ch;
    }
    if (sokuon) {
      sokuon = false;
      if (/^[a-z]/.test(syl) && !/^[aeiou]/.test(syl)) {
        syl = (syl.startsWith('ch') ? 't' : syl[0]) + syl;
      }
    }
    out += syl;
  }
  return out;
}

const KANA_RE = /^[ぁ-ゖァ-ヺー・、。！？「」～〜…\s0-9０-９a-zA-Z,.!?〜ー（）]*$/;

/** Prüft, ob ein String nur aus Kana (plus Satzzeichen/Leerzeichen/Ziffern) besteht. */
export function isKanaText(input: string): boolean {
  return KANA_RE.test(input);
}

export function isKanaChar(ch: string): boolean {
  const c = ch.codePointAt(0)!;
  return (c >= 0x3041 && c <= 0x3096) || (c >= 0x30a1 && c <= 0x30fa) || c === 0x30fc;
}

/**
 * Normalisiert japanischen Text für Vergleiche: Unicode NFKC, Katakana → Hiragana,
 * Satzzeichen und Leerzeichen entfernen.
 */
export function normalizeJa(input: string): string {
  return toHiragana(input.normalize('NFKC'))
    .toLowerCase()
    .replace(/[\s。、，．,.!?！？「」『』・…~〜（）()"'`-]/g, '');
}
