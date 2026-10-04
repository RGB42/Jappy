import { describe, expect, it } from 'vitest';
import { isKanaText, normalizeJa, toHiragana, toKatakana, toRomaji } from './kana';

describe('toRomaji', () => {
  it.each([
    ['ありがとう', 'arigatou'],
    ['きっぷ', 'kippu'],
    ['まっちゃ', 'matcha'],
    ['しんぶん', 'shinbun'],
    ['きんえん', "kin'en"],
    ['コーヒー', 'koohii'],
    ['パーティー', 'paatii'],
    ['ファミリー', 'famirii'],
    ['とうきょう', 'toukyou'],
    ['じゃあね', 'jaane'],
    ['わたし は がくせい です。', 'watashi wa gakusei desu.'],
    ['えき へ いきます', 'eki e ikimasu'],
    ['みず を のみます', 'mizu o nomimasu'],
    ['だれ は？', 'dare wa?'],
  ])('%s → %s', (kana, romaji) => {
    expect(toRomaji(kana)).toBe(romaji);
  });
});

describe('Kana helpers', () => {
  it('converts between scripts', () => {
    expect(toHiragana('カタカナ')).toBe('かたかな');
    expect(toKatakana('ひらがな')).toBe('ヒラガナ');
  });
  it('detects kana-only text', () => {
    expect(isKanaText('わたし は がくせい です。')).toBe(true);
    expect(isKanaText('コーヒー を ください！')).toBe(true);
    expect(isKanaText('私は学生です')).toBe(false);
  });
  it('normalizes for comparison', () => {
    expect(normalizeJa('コーヒー を ください。')).toBe('こーひーをください');
    expect(normalizeJa('ＡＢＣ１２３')).toBe('abc123');
  });
});

describe('kanaRomaji', async () => {
  const { kanaRomaji } = await import('../data/kana');
  it('liest einzelne は/へ als Silben', () => {
    expect(kanaRomaji('は')).toBe('ha');
    expect(kanaRomaji('ヘ')).toBe('he');
    expect(kanaRomaji('を')).toBe('wo');
    expect(kanaRomaji('きゃ')).toBe('kya');
  });
});

describe('soundKey', async () => {
  const { soundKey } = await import('../data/kana');
  it('gleich klingende Zeichen teilen den Schlüssel', () => {
    expect(soundKey('を')).toBe(soundKey('お'));
    expect(soundKey('ヂ')).toBe(soundKey('ジ'));
    expect(soundKey('は')).not.toBe(soundKey('わ'));
  });
});

describe('Romaji-Satzzeichen', () => {
  it('setzt Leerzeichen nach Satzzeichen, nicht davor', () => {
    expect(toRomaji('はい、げんき です。')).toBe('hai, genki desu.');
    expect(toRomaji('はい、 げんき です。 あなた は？')).toBe('hai, genki desu. anata wa?');
    expect(toRomaji('「はい」')).toBe('"hai"');
  });
});
