// Minimalpaare fürs Hörtraining: zwei echte, gebräuchliche Wörter, die sich nur in
// einem Lautmerkmal unterscheiden (Vokallänge, っ, ん, stimmhaft/stimmlos, ähnliche Silben).
// jp wird vorgelesen (TTS): bewusst nur Schreibweisen mit eindeutiger Lesung (kein 家, 音, 金, 月, 十 …).
import type { MinimalPair, Sentence } from './types';

const w = (jp: string, kana: string, de: string): Sentence => ({ jp, kana, de });
const pair = (id: string, feature: string, a: Sentence, b: Sentence): MinimalPair => ({ id, feature, a, b });

const LONG = 'Langer Vokal';
const DOUBLE = 'Doppelkonsonant';
const N = 'ん-Laut';
const VOICE = 'Stimmhaft/stimmlos';
const SIMILAR = 'Ähnliche Silben';

export const minimalPairs: MinimalPair[] = [
  // Langer Vokal
  pair('m-obasan', LONG, w('おばさん', 'おばさん', 'Tante'), w('おばあさん', 'おばあさん', 'Großmutter')),
  pair('m-ojisan', LONG, w('おじさん', 'おじさん', 'Onkel'), w('おじいさん', 'おじいさん', 'Großvater')),
  pair('m-yuki', LONG, w('雪', 'ゆき', 'Schnee'), w('勇気', 'ゆうき', 'Mut')),
  pair('m-koko', LONG, w('ここ', 'ここ', 'hier'), w('高校', 'こうこう', 'Oberschule')),
  pair('m-tori', LONG, w('鳥', 'とり', 'Vogel'), w('通り', 'とおり', 'Straße')),
  pair('m-biru', LONG, w('ビル', 'ビル', 'Gebäude, Hochhaus'), w('ビール', 'ビール', 'Bier')),
  pair('m-chizu', LONG, w('地図', 'ちず', 'Landkarte, Stadtplan'), w('チーズ', 'チーズ', 'Käse')),
  pair('m-soko', LONG, w('そこ', 'そこ', 'dort (bei dir)'), w('倉庫', 'そうこ', 'Lagerhaus')),

  // Doppelkonsonant (kleines っ = kurze Pause)
  pair('m-kite', DOUBLE, w('来て', 'きて', 'komm! (て-Form von „kommen“)'), w('切手', 'きって', 'Briefmarke')),
  pair('m-kata', DOUBLE, w('肩', 'かた', 'Schulter'), w('買った', 'かった', 'habe gekauft')),
  pair('m-saka', DOUBLE, w('坂', 'さか', 'Hang, Steigung'), w('作家', 'さっか', 'Schriftsteller/in')),
  pair('m-machi', DOUBLE, w('町', 'まち', 'Stadt'), w('マッチ', 'マッチ', 'Streichholz')),
  pair('m-seken', DOUBLE, w('世間', 'せけん', 'die Gesellschaft, die Leute'), w('石けん', 'せっけん', 'Seife')),
  pair('m-buka', DOUBLE, w('部下', 'ぶか', 'Untergebene/r'), w('物価', 'ぶっか', 'Preise, Lebenshaltungskosten')),

  // ん-Laut
  pair('m-kanji', N, w('漢字', 'かんじ', 'Kanji (Schriftzeichen)'), w('火事', 'かじ', 'Brand, Feuer')),
  pair('m-konya', N, w('今夜', 'こんや', 'heute Abend'), w('小屋', 'こや', 'Hütte')),
  pair('m-kinen', N, w('禁煙', 'きんえん', 'Rauchen verboten'), w('記念', 'きねん', 'Andenken, Gedenken')),
  pair('m-tanin', N, w('他人', 'たにん', 'Fremde/r, andere Leute'), w('単に', 'たんに', 'bloß, lediglich')),
  pair('m-genki', N, w('元気', 'げんき', 'munter, gesund'), w('劇', 'げき', 'Theaterstück')),

  // Stimmhaft / stimmlos
  pair('m-tenki', VOICE, w('天気', 'てんき', 'Wetter'), w('電気', 'でんき', 'Strom, Licht')),
  pair('m-kaki', VOICE, w('柿', 'かき', 'Kaki (Frucht)'), w('鍵', 'かぎ', 'Schlüssel')),
  pair('m-futa', VOICE, w('ふた', 'ふた', 'Deckel'), w('豚', 'ぶた', 'Schwein')),
  pair('m-kurasu', VOICE, w('クラス', 'クラス', 'Klasse'), w('グラス', 'グラス', '(Trink-)Glas')),
  pair('m-tango', VOICE, w('単語', 'たんご', 'Wort, Vokabel'), w('団子', 'だんご', 'Reisklößchen (Dango)')),
  pair('m-pan', VOICE, w('パン', 'パン', 'Brot'), w('晩', 'ばん', 'Abend')),

  // Ähnliche Silben
  pair('m-tsuru', SIMILAR, w('鶴', 'つる', 'Kranich'), w('する', 'する', 'tun, machen')),
  pair('m-natsu', SIMILAR, w('夏', 'なつ', 'Sommer'), w('なす', 'なす', 'Aubergine')),
  pair('m-itsu', SIMILAR, w('いつ', 'いつ', 'wann'), w('椅子', 'いす', 'Stuhl')),
  pair('m-kyou', SIMILAR, w('今日', 'きょう', 'heute'), w('器用', 'きよう', 'geschickt')),
  pair('m-byouin', SIMILAR, w('病院', 'びょういん', 'Krankenhaus'), w('美容院', 'びよういん', 'Friseursalon')),
];
