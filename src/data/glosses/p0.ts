// Satzanalyse (Wort-für-Wort-Zuordnung Japanisch ↔ Deutsch) – Format siehe GlossEntry in ../types.ts.
import type { GlossEntry } from '../types';

export const glosses: GlossEntry[] = [
  [
    'お仕事は何ですか。',
    [
      ['お仕事', 'おしごと', 'Arbeit, Beruf', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['何', 'なん', 'was', 'Q'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Was|何} {machen Sie|です} {beruflich|お仕事}{?|か}',
  ],
  [
    'この電車は東京に行きますか。',
    [
      ['この', 'この', 'diese(r)', 'S'],
      ['電車', 'でんしゃ', 'Zug', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['東京', 'とうきょう', 'Tokio', 'L'],
      ['に', 'に', 'nach, zu', 'L'],
      ['行きます', 'いきます', 'fährt, geht', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Fährt|行きます} {dieser|この} {Zug|電車} {nach|に} {Tokio|東京}{?|か}',
  ],
  [
    '毎朝パンを食べます。',
    [
      ['毎朝', 'まいあさ', 'jeden Morgen', 'T'],
      ['パン', 'パン', 'Brot', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['食べます', 'たべます', 'essen (höflich)', 'V'],
    ],
    'Ich {esse|食べます} {jeden Morgen|毎朝} {Brot|パン}.',
  ],
  [
    '駅の近くにレストランがあります。',
    [
      ['駅', 'えき', 'Bahnhof', 'L'],
      ['の', 'の', 'von, -s', 'L'],
      ['近く', 'ちかく', 'Nähe', 'L'],
      ['に', 'に', 'in, an', 'L'],
      ['レストラン', 'レストラン', 'Restaurant', 'S'],
      ['が', 'が', '(Subjekt)', 'S'],
      ['あります', 'あります', 'es gibt, ist da', 'V'],
    ],
    '{In|に} der {Nähe|近く} {des Bahnhofs|駅} {gibt es|あります} {ein Restaurant|レストラン}.',
  ],
  [
    '東京は家賃が高いです。',
    [
      ['東京', 'とうきょう', 'Tokio', 'L'],
      ['は', 'は', '(Thema)', 'L'],
      ['家賃', 'やちん', 'Miete', 'S'],
      ['が', 'が', '(Subjekt)', 'S'],
      ['高い', 'たかい', 'hoch, teuer', 'V'],
      ['です', 'です', '(höflich)', 'V'],
    ],
    'In {Tokio|東京} {sind|です} {die Mieten|家賃} {hoch|高い}.',
  ],
  [
    'こんにちは。',
    [['こんにちは', 'こんにちは', 'guten Tag', 'X', 'konnichiwa']],
    '{Guten Tag|こんにちは}! / {Hallo|こんにちは}!',
  ],
  [
    'いえいえ、まだまだです。',
    [
      ['いえいえ', 'いえいえ', 'ach was, nein nein', 'X'],
      ['まだまだ', 'まだまだ', 'noch lange nicht', 'M'],
      ['です', 'です', 'ist (höflich)', 'V'],
    ],
    '{Ach was|いえいえ}, ich {lerne noch|まだまだ}.',
  ],
];
