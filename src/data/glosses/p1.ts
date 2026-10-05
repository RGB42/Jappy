// Satzanalyse (Wort-für-Wort-Zuordnung Japanisch ↔ Deutsch) – Format siehe GlossEntry in ../types.ts.
import type { GlossEntry } from '../types';

export const glosses: GlossEntry[] = [
  [
    'おはようございます。',
    [['おはようございます', 'おはよう ございます', 'guten Morgen (höflich)', 'X']],
    '{Guten Morgen|おはようございます}.',
  ],
  [
    'こんにちは。',
    [['こんにちは', 'こんにちは', 'guten Tag', 'X', 'konnichiwa']],
    '{Guten Tag|こんにちは}! / {Hallo|こんにちは}!',
  ],
  [
    'こんばんは。',
    [['こんばんは', 'こんばんは', 'guten Abend', 'X', 'konbanwa']],
    '{Guten Abend|こんばんは}!',
  ],
  [
    'おやすみなさい。',
    [['おやすみなさい', 'おやすみなさい', 'gute Nacht', 'X']],
    '{Gute Nacht|おやすみなさい}.',
  ],
  [
    'さようなら。',
    [['さようなら', 'さようなら', 'auf Wiedersehen', 'X']],
    '{Auf Wiedersehen|さようなら}.',
  ],
  [
    'はじめまして。',
    [['はじめまして', 'はじめまして', 'freut mich (erstes Treffen)', 'X']],
    '{Freut mich, Sie kennenzulernen|はじめまして}.',
  ],
  [
    'よろしくお願いします。',
    [['よろしくお願いします', 'よろしく おねがい します', 'bitte um Wohlwollen', 'X']],
    '{Freut mich|よろしくお願いします}! / {Auf gute Zusammenarbeit|よろしくお願いします}.',
  ],
  [
    'また明日。',
    [
      ['また', 'また', 'wieder, bis dann', 'M'],
      ['明日', 'あした', 'morgen', 'T'],
    ],
    '{Bis|また} {morgen|明日}!',
  ],
  [
    'じゃあね。',
    [
      ['じゃあ', 'じゃあ', 'also dann, tschüss', 'X'],
      ['ね', 'ね', '(gell?)', 'V'],
    ],
    '{Tschüss|じゃあ}!',
  ],
  [
    'ありがとうございます。',
    [['ありがとうございます', 'ありがとう ございます', 'vielen Dank (höflich)', 'X']],
    '{Vielen Dank|ありがとうございます}.',
  ],
  [
    'どういたしまして。',
    [['どういたしまして', 'どう いたしまして', 'gern geschehen', 'X']],
    '{Gern geschehen|どういたしまして}.',
  ],
  [
    'すみません。',
    [['すみません', 'すみません', 'Entschuldigung', 'X']],
    '{Entschuldigung|すみません}. / {Verzeihung|すみません}.',
  ],
  [
    'ごめんなさい。',
    [['ごめんなさい', 'ごめんなさい', 'Entschuldigung, sorry', 'X']],
    '{Es tut mir leid|ごめんなさい}.',
  ],
  [
    'お願いします。',
    [['お願いします', 'おねがい します', 'bitte', 'X']],
    '{Bitte|お願いします}.',
  ],
  [
    '分かりません。',
    [['分かりません', 'わかりません', 'verstehe nicht (höflich)', 'V']],
    'Ich {verstehe nicht|分かりません}. / Ich {weiß|分かりません} es {nicht|分かりません}.',
  ],
  [
    '分かりました。',
    [['分かりました', 'わかりました', 'verstanden (höflich)', 'V']],
    '{Verstanden|分かりました}. / {Alles klar|分かりました}.',
  ],
  [
    'もう一度お願いします。',
    [
      ['もう一度', 'もう いちど', 'noch einmal', 'M'],
      ['お願いします', 'おねがい します', 'bitte', 'V'],
    ],
    '{Noch einmal|もう一度}, {bitte|お願いします}.',
  ],
  [
    'もう少しゆっくり話してください。',
    [
      ['もう少し', 'もう すこし', 'etwas mehr', 'M'],
      ['ゆっくり', 'ゆっくり', 'langsam', 'M'],
      ['話して', 'はなして', 'sprechen (te-Form)', 'V'],
      ['ください', 'ください', 'bitte', 'V'],
    ],
    '{Bitte|ください} {sprechen|話して} Sie {etwas|もう少し} {langsamer|ゆっくり}.',
  ],
  [
    '英語が話せますか。',
    [
      ['英語', 'えいご', 'Englisch', 'O'],
      ['が', 'が', '(Objekt)', 'O'],
      ['話せます', 'はなせます', 'sprechen können (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Sprechen|話せます} Sie {Englisch|英語}{?|か}',
  ],
  [
    'これは日本語で何と言いますか。',
    [
      ['これ', 'これ', 'das, dies', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['日本語', 'にほんご', 'Japanisch', 'M'],
      ['で', 'で', 'auf, mit', 'M'],
      ['何', 'なん', 'was', 'Q'],
      ['と', 'と', '(Zitat)', 'Q'],
      ['言います', 'いいます', 'sagen (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wie|何} {sagt|言います} man {das|これ} {auf|で} {Japanisch|日本語}{?|か}',
  ],
  [
    '大丈夫です。',
    [
      ['大丈夫', 'だいじょうぶ', 'in Ordnung', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
    ],
    '{Alles in Ordnung|大丈夫}. / Nein danke, {passt schon|大丈夫}.',
  ],
  [
    'ちょっと待ってください。',
    [
      ['ちょっと', 'ちょっと', 'kurz, einen Moment', 'M'],
      ['待って', 'まって', 'warten (te-Form)', 'V'],
      ['ください', 'ください', 'bitte', 'V'],
    ],
    '{Einen Moment|ちょっと}, {bitte|ください}.',
  ],
  [
    'そうですか。',
    [
      ['そう', 'そう', 'so', 'M'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    'Ach {so|そう}. / Ach, {wirklich|そう}{?|か}',
  ],
  [
    'お名前は何ですか。',
    [
      ['お名前', 'おなまえ', 'Name (höflich)', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['何', 'なん', 'was', 'Q'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wie|何} {heißen Sie|お名前}{?|か}',
  ],
  [
    '私はアンナです。',
    [
      ['私', 'わたし', 'ich', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['アンナ', 'アンナ', 'Anna', 'V'],
      ['です', 'です', 'bin (höflich)', 'V'],
    ],
    '{Ich|私} {bin|です} {Anna|アンナ}.',
  ],
  [
    'ドイツから来ました。',
    [
      ['ドイツ', 'ドイツ', 'Deutschland', 'L'],
      ['から', 'から', 'aus, von', 'L'],
      ['来ました', 'きました', 'bin gekommen (höflich)', 'V'],
    ],
    'Ich {komme|来ました} {aus|から} {Deutschland|ドイツ}.',
  ],
  [
    'どこから来ましたか。',
    [
      ['どこ', 'どこ', 'wo', 'Q'],
      ['から', 'から', 'aus, von', 'Q'],
      ['来ました', 'きました', 'sind gekommen (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wo|どこ}{her|から} {kommen|来ました} Sie{?|か}',
  ],
  [
    '日本語が少しできます。',
    [
      ['日本語', 'にほんご', 'Japanisch', 'O'],
      ['が', 'が', '(Objekt)', 'O'],
      ['少し', 'すこし', 'ein bisschen', 'M'],
      ['できます', 'できます', 'können (höflich)', 'V'],
    ],
    'Ich {kann|できます} {ein bisschen|少し} {Japanisch|日本語}.',
  ],
  [
    'メニューをお願いします。',
    [
      ['メニュー', 'メニュー', 'Speisekarte', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['お願いします', 'おねがい します', 'bitte', 'V'],
    ],
    '{Die Speisekarte|メニュー}, {bitte|お願いします}.',
  ],
  [
    'お水をください。',
    [
      ['お水', 'おみず', 'Wasser', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['ください', 'ください', 'bitte geben Sie', 'V'],
    ],
    '{Wasser|お水}, {bitte|ください}.',
  ],
  [
    'ビールを一つお願いします。',
    [
      ['ビール', 'ビール', 'Bier', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['一つ', 'ひとつ', 'eins, ein Stück', 'M'],
      ['お願いします', 'おねがい します', 'bitte', 'V'],
    ],
    '{Ein|一つ} {Bier|ビール}, {bitte|お願いします}.',
  ],
  [
    'お会計お願いします。',
    [
      ['お会計', 'おかいけい', 'Rechnung', 'O'],
      ['お願いします', 'おねがい します', 'bitte', 'V'],
    ],
    '{Die Rechnung|お会計}, {bitte|お願いします}.',
  ],
  [
    'いただきます。',
    [['いただきます', 'いただきます', 'guten Appetit (ich empfange)', 'X']],
    '{Guten Appetit|いただきます}!',
  ],
  [
    'ごちそうさまでした。',
    [['ごちそうさまでした', 'ごちそうさま でした', 'danke für das Essen', 'X']],
    '{Danke für das Essen|ごちそうさまでした}!',
  ],
  [
    'おいしいです。',
    [
      ['おいしい', 'おいしい', 'lecker', 'V'],
      ['です', 'です', '(höflich)', 'V'],
    ],
    'Das {ist|です} {lecker|おいしい}!',
  ],
  [
    '二人です。',
    [
      ['二人', 'ふたり', 'zwei Personen', 'M'],
      ['です', 'です', 'sind (höflich)', 'V'],
    ],
    'Wir {sind|です} {zu zweit|二人}.',
  ],
  [
    '乾杯！',
    [['乾杯', 'かんぱい', 'Prost', 'X']],
    '{Prost|乾杯}!',
  ],
  [
    'これをください。',
    [
      ['これ', 'これ', 'das, dies', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['ください', 'ください', 'bitte geben Sie', 'V'],
    ],
    '{Das hier|これ}, {bitte|ください}.',
  ],
  [
    'これはいくらですか。',
    [
      ['これ', 'これ', 'das, dies', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['いくら', 'いくら', 'wie viel', 'Q'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wie viel|いくら} {kostet|です} {das|これ}{?|か}',
  ],
  [
    'カードで払えますか。',
    [
      ['カード', 'カード', 'Karte', 'M'],
      ['で', 'で', 'mit', 'M'],
      ['払えます', 'はらえます', 'zahlen können (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Kann|払えます} ich {mit|で} {Karte|カード} {zahlen|払えます}{?|か}',
  ],
  [
    '見ているだけです。',
    [
      ['見て', 'みて', 'schauen (te-Form)', 'V'],
      ['いる', 'いる', '(Verlaufsform)', 'V'],
      ['だけ', 'だけ', 'nur', 'M'],
      ['です', 'です', '(höflich)', 'V'],
    ],
    'Ich {schaue|見て} {nur|だけ}.',
  ],
  [
    '袋は大丈夫です。',
    [
      ['袋', 'ふくろ', 'Tüte', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['大丈夫', 'だいじょうぶ', 'in Ordnung, nicht nötig', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
    ],
    'Ich {brauche keine|大丈夫} {Tüte|袋}.',
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
    'ここまでお願いします。',
    [
      ['ここ', 'ここ', 'hier', 'L'],
      ['まで', 'まで', 'bis', 'L'],
      ['お願いします', 'おねがい します', 'bitte', 'V'],
    ],
    '{Bis|まで} {hierhin|ここ}, {bitte|お願いします}.',
  ],
  [
    'チェックインをお願いします。',
    [
      ['チェックイン', 'チェックイン', 'Check-in', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['お願いします', 'おねがい します', 'bitte', 'V'],
    ],
    'Ich {möchte bitte|お願いします} {einchecken|チェックイン}.',
  ],
  [
    '駅はどこですか。',
    [
      ['駅', 'えき', 'Bahnhof', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['どこ', 'どこ', 'wo', 'Q'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wo|どこ} {ist|です} {der Bahnhof|駅}{?|か}',
  ],
  [
    'トイレはどこですか。',
    [
      ['トイレ', 'トイレ', 'Toilette', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['どこ', 'どこ', 'wo', 'Q'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wo|どこ} {ist|です} {die Toilette|トイレ}{?|か}',
  ],
  [
    '今何時ですか。',
    [
      ['今', 'いま', 'jetzt', 'T'],
      ['何時', 'なんじ', 'wie viel Uhr', 'Q'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wie spät|何時} {ist|です} es{?|か}',
  ],
  [
    '何時に開きますか。',
    [
      ['何時', 'なんじ', 'wie viel Uhr', 'Q'],
      ['に', 'に', 'um', 'Q'],
      ['開きます', 'あきます', 'öffnet, geht auf', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Um|に} {wie viel Uhr|何時} {öffnen|開きます} Sie{?|か}',
  ],
  [
    '疲れました。',
    [['疲れました', 'つかれました', 'müde geworden (höflich)', 'V']],
    'Ich {bin müde|疲れました}. / Ich {bin erschöpft|疲れました}.',
  ],
  [
    'すごい！',
    [['すごい', 'すごい', 'toll, unglaublich', 'X']],
    '{Wahnsinn|すごい}! / {Toll|すごい}!',
  ],
  [
    '大丈夫ですか。',
    [
      ['大丈夫', 'だいじょうぶ', 'in Ordnung', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Alles okay|大丈夫}{?|か} / {Geht es Ihnen gut|大丈夫}{?|か}',
  ],
  [
    '本当ですか。',
    [
      ['本当', 'ほんとう', 'wahr, wirklich', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wirklich|本当}{?|か}',
  ],
  [
    '趣味は何ですか。',
    [
      ['趣味', 'しゅみ', 'Hobby', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['何', 'なん', 'was', 'Q'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Was|何} {sind|です} Ihre {Hobbys|趣味}{?|か}',
  ],
  [
    '音楽が好きです。',
    [
      ['音楽', 'おんがく', 'Musik', 'O'],
      ['が', 'が', '(Objekt)', 'O'],
      ['好き', 'すき', 'mögen, gern', 'V'],
      ['です', 'です', '(höflich)', 'V'],
    ],
    'Ich {mag|好き} {Musik|音楽}.',
  ],
  [
    '会社員です。',
    [
      ['会社員', 'かいしゃいん', 'Firmenangestellte(r)', 'V'],
      ['です', 'です', 'bin (höflich)', 'V'],
    ],
    'Ich {bin|です} {Angestellte(r) in einer Firma|会社員}.',
  ],
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
    '助けて！',
    [['助けて', 'たすけて', 'hilf mir! (te-Form)', 'V']],
    '{Hilfe|助けて}!',
  ],
  [
    '救急車を呼んでください。',
    [
      ['救急車', 'きゅうきゅうしゃ', 'Krankenwagen', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['呼んで', 'よんで', 'rufen (te-Form)', 'V'],
      ['ください', 'ください', 'bitte', 'V'],
    ],
    '{Bitte|ください} {rufen|呼んで} Sie {einen Krankenwagen|救急車}!',
  ],
  [
    '警察を呼んでください。',
    [
      ['警察', 'けいさつ', 'Polizei', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['呼んで', 'よんで', 'rufen (te-Form)', 'V'],
      ['ください', 'ください', 'bitte', 'V'],
    ],
    '{Bitte|ください} {rufen|呼んで} Sie {die Polizei|警察}!',
  ],
  [
    '具合が悪いです。',
    [
      ['具合', 'ぐあい', 'Befinden, Zustand', 'S'],
      ['が', 'が', '(Subjekt)', 'S'],
      ['悪い', 'わるい', 'schlecht', 'V'],
      ['です', 'です', '(höflich)', 'V'],
    ],
    'Mir {geht es|具合} {nicht gut|悪い}.',
  ],
  [
    '頭が痛いです。',
    [
      ['頭', 'あたま', 'Kopf', 'S'],
      ['が', 'が', '(Subjekt)', 'S'],
      ['痛い', 'いたい', 'tut weh', 'V'],
      ['です', 'です', '(höflich)', 'V'],
    ],
    'Ich habe {Kopf|頭}{schmerzen|痛い}.',
  ],
  [
    '行ってきます。',
    [['行ってきます', 'いって きます', 'ich geh (und komm wieder)', 'X']],
    '{Ich geh dann|行ってきます}! / {Bis später|行ってきます}!',
  ],
  [
    '行ってらっしゃい。',
    [['行ってらっしゃい', 'いってらっしゃい', 'geh (und komm wieder)', 'X']],
    '{Bis später|行ってらっしゃい}! / {Mach’s gut|行ってらっしゃい}!',
  ],
  [
    'ただいま。',
    [['ただいま', 'ただいま', 'bin zurück', 'X']],
    '{Bin wieder da|ただいま}!',
  ],
  [
    'お帰りなさい。',
    [['お帰りなさい', 'おかえりなさい', 'willkommen zurück', 'X']],
    '{Willkommen zurück|お帰りなさい}!',
  ],
  [
    'お久しぶりです。',
    [
      ['お久しぶり', 'おひさしぶり', 'lange nicht gesehen', 'X'],
      ['です', 'です', '(höflich)', 'V'],
    ],
    '{Lange nicht gesehen|お久しぶり}!',
  ],
  [
    'お元気ですか。',
    [
      ['お元気', 'おげんき', 'munter, gesund (höflich)', 'V'],
      ['です', 'です', 'sind (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    'Wie {geht es Ihnen|お元気}{?|か}',
  ],
  [
    'おかげさまで、元気です。',
    [
      ['おかげさまで', 'おかげさま で', 'dank Ihnen, zum Glück', 'X'],
      ['元気', 'げんき', 'gesund, munter', 'V'],
      ['です', 'です', 'bin (höflich)', 'V'],
    ],
    '{Danke der Nachfrage|おかげさまで}, mir {geht es gut|元気}.',
  ],
  [
    '気をつけて。',
    [
      ['気', 'き', 'Aufmerksamkeit', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['つけて', 'つけて', 'richten (te-Form)', 'V'],
    ],
    '{Pass|つけて} auf dich {auf|つけて}! / {Komm gut heim|つけて}!',
  ],
  [
    'そうですね。',
    [
      ['そう', 'そう', 'so', 'M'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['ね', 'ね', '(gell?)', 'V'],
    ],
    '{Stimmt|そう}. / {Hmm, mal sehen|そう} …',
  ],
  [
    'いいですよ。',
    [
      ['いい', 'いい', 'gut', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['よ', 'よ', '(Betonung)', 'V'],
    ],
    '{Klar|よ}, {gerne|いい}!',
  ],
  [
    'ちょっと…',
    [['ちょっと', 'ちょっと', 'etwas, ein bisschen', 'M']],
    'Das ist {etwas|ちょっと} schwierig … (höfliches Nein)',
  ],
  [
    'お先にどうぞ。',
    [
      ['お先', 'おさき', 'zuerst, voraus', 'M'],
      ['に', 'に', '(Adverb)', 'M'],
      ['どうぞ', 'どうぞ', 'bitte (sehr)', 'X'],
    ],
    '{Bitte|どうぞ}, {nach Ihnen|お先}.',
  ],
  [
    'どういう意味ですか。',
    [
      ['どういう', 'どういう', 'was für ein', 'Q'],
      ['意味', 'いみ', 'Bedeutung', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Was|どういう} {bedeutet|意味} das{?|か}',
  ],
  [
    '日本語を勉強しています。',
    [
      ['日本語', 'にほんご', 'Japanisch', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['勉強', 'べんきょう', 'lernen, Studium', 'V'],
      ['して', 'して', 'tun (te-Form)', 'V'],
      ['います', 'います', '(Verlaufsform)', 'V'],
    ],
    'Ich {lerne|勉強} {Japanisch|日本語}.',
  ],
  [
    'いえいえ、まだまだです。',
    [
      ['いえいえ', 'いえいえ', 'ach was, nein nein', 'X'],
      ['まだまだ', 'まだまだ', 'noch lange nicht', 'M'],
      ['です', 'です', 'ist (höflich)', 'V'],
    ],
    '{Ach was|いえいえ}, ich muss {noch viel|まだまだ} lernen.',
  ],
  [
    'おすすめは何ですか。',
    [
      ['おすすめ', 'おすすめ', 'Empfehlung', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['何', 'なん', 'was', 'Q'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Was|何} können Sie {empfehlen|おすすめ}{?|か}',
  ],
  [
    'お肉は食べられません。',
    [
      ['お肉', 'おにく', 'Fleisch', 'O'],
      ['は', 'は', '(Thema)', 'O'],
      ['食べられません', 'たべられません', 'kann nicht essen (höflich)', 'V'],
    ],
    'Ich {kann kein|食べられません} {Fleisch|お肉} {essen|食べられません}.',
  ],
  [
    '持ち帰りでお願いします。',
    [
      ['持ち帰り', 'もちかえり', 'Mitnehmen', 'M'],
      ['で', 'で', 'als, zum', 'M'],
      ['お願いします', 'おねがい します', 'bitte', 'V'],
    ],
    '{Zum|で} {Mitnehmen|持ち帰り}, {bitte|お願いします}.',
  ],
  [
    'お寿司が食べたいです。',
    [
      ['お寿司', 'おすし', 'Sushi', 'O'],
      ['が', 'が', '(Objekt)', 'O'],
      ['食べたい', 'たべたい', 'möchte essen', 'V'],
      ['です', 'です', '(höflich)', 'V'],
    ],
    'Ich {möchte|食べたい} {Sushi|お寿司} {essen|食べたい}.',
  ],
  [
    '七時に二人で予約したいんですが。',
    [
      ['七時', 'しちじ', 'sieben Uhr', 'T'],
      ['に', 'に', 'um', 'T'],
      ['二人', 'ふたり', 'zwei Personen', 'M'],
      ['で', 'で', 'zu, mit', 'M'],
      ['予約', 'よやく', 'Reservierung', 'V'],
      ['したい', 'したい', 'möchte tun', 'V'],
      ['ん', 'ん', '(Erklärung)', 'V'],
      ['です', 'です', '(höflich)', 'V'],
      ['が', 'が', 'aber … (weicher Abschluss)', 'V'],
    ],
    'Ich {würde gern|したい} {für|で} {zwei Personen|二人} {um|に} {sieben Uhr|七時} {reservieren|予約}.',
  ],
  [
    '試着してもいいですか。',
    [
      ['試着', 'しちゃく', 'Anprobe, anprobieren', 'V'],
      ['して', 'して', 'tun (te-Form)', 'V'],
      ['も', 'も', 'auch wenn', 'V'],
      ['いい', 'いい', 'gut, in Ordnung', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Darf|いい} ich das {anprobieren|試着}{?|か}',
  ],
  [
    'もう少し安いのはありますか。',
    [
      ['もう少し', 'もう すこし', 'etwas mehr', 'M'],
      ['安い', 'やすい', 'billig, günstig', 'S'],
      ['の', 'の', 'eins, etwas (Nomen)', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['あります', 'あります', 'gibt es, ist da', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Haben|あります} Sie {etwas|の} {Günstig|安い}{eres|もう少し}{?|か}',
  ],
  [
    '免税できますか。',
    [
      ['免税', 'めんぜい', 'Steuerbefreiung', 'O'],
      ['できます', 'できます', 'können (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Kann|できます} ich {steuerfrei|免税} einkaufen{?|か}',
  ],
  [
    'これにします。',
    [
      ['これ', 'これ', 'das, dies', 'O'],
      ['に', 'に', 'für (Wahl)', 'O'],
      ['します', 'します', 'nehme (wörtl. mache)', 'V'],
    ],
    'Ich {nehme|します} {das|これ}.',
  ],
  [
    '予約しているシュミットです。',
    [
      ['予約', 'よやく', 'Reservierung', 'V'],
      ['して', 'して', 'tun (te-Form)', 'V'],
      ['いる', 'いる', '(Zustand)', 'V'],
      ['シュミット', 'シュミット', 'Schmidt', 'V'],
      ['です', 'です', 'bin (höflich)', 'V'],
    ],
    'Ich {habe reserviert|予約}, mein Name {ist|です} {Schmidt|シュミット}.',
  ],
  [
    '写真を撮ってもらえませんか。',
    [
      ['写真', 'しゃしん', 'Foto', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['撮って', 'とって', 'aufnehmen (te-Form)', 'V'],
      ['もらえません', 'もらえません', 'könnten Sie (für mich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Könnten Sie|もらえません} {ein Foto|写真} von uns {machen|撮って}{?|か}',
  ],
  [
    'ここで写真を撮ってもいいですか。',
    [
      ['ここ', 'ここ', 'hier', 'L'],
      ['で', 'で', 'in, an', 'L'],
      ['写真', 'しゃしん', 'Foto', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['撮って', 'とって', 'aufnehmen (te-Form)', 'V'],
      ['も', 'も', 'auch wenn', 'V'],
      ['いい', 'いい', 'gut, in Ordnung', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Darf|いい} ich {hier|ここ} {foto|写真}{grafieren|撮って}{?|か}',
  ],
  [
    'パスポートをなくしました。',
    [
      ['パスポート', 'パスポート', 'Reisepass', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['なくしました', 'なくしました', 'verloren (höflich)', 'V'],
    ],
    'Ich {habe|なくしました} meinen {Reisepass|パスポート} {verloren|なくしました}.',
  ],
  [
    '道に迷いました。',
    [
      ['道', 'みち', 'Weg', 'L'],
      ['に', 'に', 'auf, in', 'L'],
      ['迷いました', 'まよいました', 'verirrt (höflich)', 'V'],
    ],
    'Ich {habe|迷いました} mich {verlaufen|迷いました}.',
  ],
  [
    '歩いて行けますか。',
    [
      ['歩いて', 'あるいて', 'zu Fuß (gehend)', 'M'],
      ['行けます', 'いけます', 'gehen können (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Kann|行けます} man {zu Fuß|歩いて} {hingehen|行けます}{?|か}',
  ],
  [
    'どのくらいかかりますか。',
    [
      ['どのくらい', 'どのくらい', 'wie lange, wie viel', 'Q'],
      ['かかります', 'かかります', 'dauert, braucht', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wie lange|どのくらい} {dauert|かかります} es{?|か}',
  ],
  [
    '次の角を右に曲がってください。',
    [
      ['次', 'つぎ', 'nächste', 'L'],
      ['の', 'の', '(Attribut)', 'L'],
      ['角', 'かど', 'Ecke', 'L'],
      ['を', 'を', '(Ort der Bewegung)', 'L'],
      ['右', 'みぎ', 'rechts', 'L'],
      ['に', 'に', 'nach, zu', 'L'],
      ['曲がって', 'まがって', 'abbiegen (te-Form)', 'V'],
      ['ください', 'ください', 'bitte', 'V'],
    ],
    '{Biegen|曲がって} Sie {an|を} der {nächsten|次} {Ecke|角} {rechts|右} {ab|曲がって}.',
  ],
  [
    'いつがいいですか。',
    [
      ['いつ', 'いつ', 'wann', 'Q'],
      ['が', 'が', '(Subjekt)', 'Q'],
      ['いい', 'いい', 'gut', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wann|いつ} {passt|いい} es Ihnen{?|か}',
  ],
  [
    '土曜日は暇ですか。',
    [
      ['土曜日', 'どようび', 'Samstag', 'T'],
      ['は', 'は', '(Thema)', 'T'],
      ['暇', 'ひま', 'frei, Zeit haben', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Hast|暇} du {am Samstag|土曜日} {Zeit|暇}{?|か}',
  ],
  [
    'すみません、少し遅れます。',
    [
      ['すみません', 'すみません', 'Entschuldigung', 'X'],
      ['少し', 'すこし', 'ein bisschen', 'M'],
      ['遅れます', 'おくれます', 'sich verspäten (höflich)', 'V'],
    ],
    '{Entschuldigung|すみません}, ich {verspäte mich|遅れます} {etwas|少し}.',
  ],
  [
    'よかった！',
    [['よかった', 'よかった', 'zum Glück (wörtl. war gut)', 'X']],
    '{Zum Glück|よかった}! / {Wie schön|よかった}!',
  ],
  [
    '面白そうですね。',
    [
      ['面白そう', 'おもしろそう', 'scheint interessant', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['ね', 'ね', '(gell?)', 'V'],
    ],
    '{Klingt interessant|面白そう}!',
  ],
  [
    '楽しみにしています。',
    [
      ['楽しみ', 'たのしみ', 'Vorfreude', 'M'],
      ['に', 'に', 'zu (Ergebnis)', 'M'],
      ['して', 'して', 'machen (te-Form)', 'V'],
      ['います', 'います', '(Verlaufsform)', 'V'],
    ],
    'Ich {freue mich|楽しみ} darauf!',
  ],
  [
    'いいと思います。',
    [
      ['いい', 'いい', 'gut', 'O'],
      ['と', 'と', 'dass (Zitat)', 'O'],
      ['思います', 'おもいます', 'denken, finden (höflich)', 'V'],
    ],
    'Ich {finde|思います} das {gut|いい}.',
  ],
  [
    '楽しかったです。',
    [
      ['楽しかった', 'たのしかった', 'machte Spaß', 'V'],
      ['です', 'です', '(höflich)', 'V'],
    ],
    'Es {hat|楽しかった} viel {Spaß gemacht|楽しかった}!',
  ],
  [
    '一緒に行きませんか。',
    [
      ['一緒', 'いっしょ', 'zusammen', 'M'],
      ['に', 'に', '(Adverb)', 'M'],
      ['行きません', 'いきません', 'gehen nicht? (Einladung)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wollen wir|行きません} {zusammen|一緒} {hingehen|行きません}{?|か}',
  ],
  [
    'いいですね！',
    [
      ['いい', 'いい', 'gut', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['ね', 'ね', '(gell?)', 'V'],
    ],
    '{Gute|いい} Idee! / Klingt {gut|いい}!',
  ],
  [
    '映画を見に行きませんか。',
    [
      ['映画', 'えいが', 'Film', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['見', 'み', 'sehen', 'M'],
      ['に', 'に', 'um zu (Zweck)', 'M'],
      ['行きません', 'いきません', 'gehen nicht? (Einladung)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wollen wir|行きません} {ins Kino|映画} {gehen|行きません}{?|か}',
  ],
  [
    '日本のアニメを見たことがありますか。',
    [
      ['日本', 'にほん', 'Japan', 'O'],
      ['の', 'の', 'aus, -s', 'O'],
      ['アニメ', 'アニメ', 'Anime', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['見た', 'みた', 'gesehen (Vergangenheit)', 'V'],
      ['こと', 'こと', 'Sache → Erfahrung', 'V'],
      ['が', 'が', '(Subjekt)', 'V'],
      ['あります', 'あります', 'es gibt, haben', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Haben|あります} Sie {schon einmal|こと} {japanische|日本} {Anime|アニメ} {gesehen|見た}{?|か}',
  ],
  [
    '残念ですが、その日はちょっと…',
    [
      ['残念', 'ざんねん', 'schade', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['が', 'が', 'aber', 'V'],
      ['その', 'その', 'dieser, jener', 'T'],
      ['日', 'ひ', 'Tag', 'T'],
      ['は', 'は', '(Thema)', 'T'],
      ['ちょっと', 'ちょっと', 'etwas (schwierig)', 'M'],
    ],
    '{Schade|残念}, {aber|が} an {dem|その} {Tag|日} passt es leider {nicht so|ちょっと} …',
  ],
  [
    'お疲れ様です。',
    [
      ['お疲れ様', 'おつかれさま', 'danke für die Mühe', 'X'],
      ['です', 'です', '(höflich)', 'V'],
    ],
    '{Danke für Ihre Mühe|お疲れ様}. / {Hallo|お疲れ様}! (unter Kollegen)',
  ],
  [
    'お先に失礼します。',
    [
      ['お先', 'おさき', 'zuerst, voraus', 'M'],
      ['に', 'に', '(Adverb)', 'M'],
      ['失礼します', 'しつれい します', 'sich verabschieden (höfl.)', 'V'],
    ],
    'Ich {mache|失礼します} dann {schon mal|お先} {Feierabend|失礼します}.',
  ],
  [
    '失礼します。',
    [['失礼します', 'しつれい します', 'Entschuldigung (höflich)', 'X']],
    '{Entschuldigen Sie die Störung|失礼します}.',
  ],
  [
    '手伝いましょうか。',
    [
      ['手伝いましょう', 'てつだいましょう', 'helfen wir / soll ich helfen', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Soll ich|手伝いましょう} Ihnen {helfen|手伝いましょう}{?|か}',
  ],
  [
    '質問してもいいですか。',
    [
      ['質問', 'しつもん', 'Frage, fragen', 'V'],
      ['して', 'して', 'tun (te-Form)', 'V'],
      ['も', 'も', 'auch wenn', 'V'],
      ['いい', 'いい', 'gut, in Ordnung', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Darf|いい} ich etwas {fragen|質問}{?|か}',
  ],
  [
    '熱があります。',
    [
      ['熱', 'ねつ', 'Fieber', 'S'],
      ['が', 'が', '(Subjekt)', 'S'],
      ['あります', 'あります', 'es gibt, haben', 'V'],
    ],
    'Ich {habe|あります} {Fieber|熱}.',
  ],
  [
    '卵アレルギーがあります。',
    [
      ['卵', 'たまご', 'Ei', 'S'],
      ['アレルギー', 'アレルギー', 'Allergie', 'S'],
      ['が', 'が', '(Subjekt)', 'S'],
      ['あります', 'あります', 'es gibt, haben', 'V'],
    ],
    'Ich {habe|あります} eine {Eier|卵}{allergie|アレルギー}.',
  ],
  [
    'この薬は一日何回飲みますか。',
    [
      ['この', 'この', 'diese(s)', 'O'],
      ['薬', 'くすり', 'Medikament', 'O'],
      ['は', 'は', '(Thema)', 'O'],
      ['一日', 'いちにち', 'pro Tag', 'T'],
      ['何回', 'なんかい', 'wie oft', 'Q'],
      ['飲みます', 'のみます', 'einnehmen (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Wie oft|何回} {am Tag|一日} muss ich {dieses|この} {Medikament|薬} {nehmen|飲みます}{?|か}',
  ],
  [
    'お大事に。',
    [['お大事に', 'おだいじ に', 'gute Besserung', 'X']],
    '{Gute Besserung|お大事に}!',
  ],
  [
    'お邪魔します。',
    [['お邪魔します', 'おじゃま します', 'ich störe (höflich)', 'X']],
    '{Entschuldigen Sie die Störung|お邪魔します}. (beim Eintreten)',
  ],
  [
    'どうぞ、上がってください。',
    [
      ['どうぞ', 'どうぞ', 'bitte (sehr)', 'X'],
      ['上がって', 'あがって', 'eintreten (wörtl. hochsteigen)', 'V'],
      ['ください', 'ください', 'bitte', 'V'],
    ],
    '{Kommen|上がって} Sie {doch|どうぞ} {herein|上がって}.',
  ],
  [
    'トイレを借りてもいいですか。',
    [
      ['トイレ', 'トイレ', 'Toilette', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['借りて', 'かりて', 'ausleihen (te-Form)', 'V'],
      ['も', 'も', 'auch wenn', 'V'],
      ['いい', 'いい', 'gut, in Ordnung', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Darf|いい} ich Ihre {Toilette|トイレ} {benutzen|借りて}{?|か}',
  ],
  [
    'いつもお世話になっております。',
    [
      ['いつも', 'いつも', 'immer, stets', 'T'],
      ['お世話', 'おせわ', 'Fürsorge, Hilfe', 'M'],
      ['に', 'に', 'zu (Ergebnis)', 'M'],
      ['なって', 'なって', 'werden (te-Form)', 'V'],
      ['おります', 'おります', '(Verlaufsform, bescheiden)', 'V'],
    ],
    'Vielen Dank für die {stets|いつも} gute {Zusammenarbeit|お世話}.',
  ],
  [
    '恐れ入りますが、お名前を伺ってもよろしいでしょうか。',
    [
      ['恐れ入ります', 'おそれいります', 'Verzeihung (sehr höflich)', 'X'],
      ['が', 'が', 'aber', 'X'],
      ['お名前', 'おなまえ', 'Ihr Name', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['伺って', 'うかがって', 'fragen (bescheiden, te-Form)', 'V'],
      ['も', 'も', 'auch wenn', 'V'],
      ['よろしい', 'よろしい', 'gut (sehr höflich)', 'V'],
      ['でしょう', 'でしょう', 'wohl (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Verzeihung|恐れ入ります}, {dürfte|よろしい} ich nach {Ihrem Namen|お名前} {fragen|伺って}{?|か}',
  ],
  [
    '少々お待ちください。',
    [
      ['少々', 'しょうしょう', 'ein wenig, kurz', 'M'],
      ['お待ち', 'おまち', 'warten (höflich)', 'V'],
      ['ください', 'ください', 'bitte', 'V'],
    ],
    '{Einen Augenblick|少々}, {bitte|ください}.',
  ],
  [
    '承知しました。',
    [
      ['承知', 'しょうち', 'Kenntnis, Einverständnis', 'V'],
      ['しました', 'しました', 'tat (höflich)', 'V'],
    ],
    '{Sehr wohl|承知}. / {Verstanden|承知}.',
  ],
  [
    'かしこまりました。',
    [['かしこまりました', 'かしこまりました', 'verstanden (sehr höflich)', 'V']],
    '{Sehr wohl, gern|かしこまりました}.',
  ],
  [
    '申し訳ございません。',
    [['申し訳ございません', 'もうしわけ ございません', 'Entschuldigung (sehr höflich)', 'X']],
    'Ich {bitte vielmals um Entschuldigung|申し訳ございません}.',
  ],
  [
    '確認いたします。',
    [
      ['確認', 'かくにん', 'Prüfung, prüfen', 'V'],
      ['いたします', 'いたします', 'tue (bescheiden)', 'V'],
    ],
    'Ich {prüfe|確認} das für Sie.',
  ],
  [
    '折り返しお電話いたします。',
    [
      ['折り返し', 'おりかえし', 'zurück, umgehend', 'M'],
      ['お電話', 'おでんわ', 'Anruf (höflich)', 'V'],
      ['いたします', 'いたします', 'tue (bescheiden)', 'V'],
    ],
    'Ich {rufe|お電話} Sie {zurück|折り返し}.',
  ],
  [
    'お手数ですが、ご確認をお願いいたします。',
    [
      ['お手数', 'おてすう', 'Mühe, Umstände', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['が', 'が', 'aber', 'V'],
      ['ご確認', 'ごかくにん', 'Prüfung (höflich)', 'O'],
      ['を', 'を', '(Objekt)', 'O'],
      ['お願いいたします', 'おねがい いたします', 'bitte (sehr höflich)', 'V'],
    ],
    'Entschuldigen Sie die {Mühe|お手数}, {aber|が} {bitte|お願いいたします} {prüfen|ご確認} Sie das.',
  ],
  [
    '失礼ですが、どちら様でしょうか。',
    [
      ['失礼', 'しつれい', 'unhöflich', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
      ['が', 'が', 'aber', 'V'],
      ['どちら様', 'どちらさま', 'wer (sehr höflich)', 'Q'],
      ['でしょう', 'でしょう', 'wohl (höflich)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Verzeihung|失礼}, mit {wem|どちら様} spreche ich bitte{?|か}',
  ],
  [
    'お忙しいところすみません。',
    [
      ['お忙しい', 'おいそがしい', 'beschäftigt (höflich)', 'M'],
      ['ところ', 'ところ', 'Moment, in dem', 'M'],
      ['すみません', 'すみません', 'Entschuldigung', 'X'],
    ],
    '{Entschuldigen Sie die Störung|すみません} – Sie haben sicher {viel zu tun|お忙しい}.',
  ],
  [
    '田中様はいらっしゃいますか。',
    [
      ['田中様', 'たなかさま', 'Herr/Frau Tanaka (höflich)', 'S'],
      ['は', 'は', '(Thema)', 'S'],
      ['いらっしゃいます', 'いらっしゃいます', 'ist da (ehrerbietig)', 'V'],
      ['か', 'か', '(Frage)', 'V'],
    ],
    '{Ist|いらっしゃいます} {Herr/Frau Tanaka|田中様} {zu sprechen|いらっしゃいます}{?|か}',
  ],
  [
    'アンナと申します。',
    [
      ['アンナ', 'アンナ', 'Anna', 'O'],
      ['と', 'と', '(Zitat)', 'O'],
      ['申します', 'もうします', 'heiße (bescheiden)', 'V'],
    ],
    'Mein {Name ist|申します} {Anna|アンナ}.',
  ],
  [
    'ご無沙汰しております。',
    [
      ['ご無沙汰', 'ごぶさた', 'lange nichts hören lassen', 'V'],
      ['して', 'して', 'tun (te-Form)', 'V'],
      ['おります', 'おります', '(Verlaufsform, bescheiden)', 'V'],
    ],
    'Ich habe {lange nichts von mir hören lassen|ご無沙汰}.',
  ],
  [
    'いえいえ、とんでもないです。',
    [
      ['いえいえ', 'いえいえ', 'nein, nein', 'X'],
      ['とんでもない', 'とんでもない', 'keineswegs, nicht doch', 'V'],
      ['です', 'です', '(höflich)', 'V'],
    ],
    '{Aber|いえいえ} {nicht doch|とんでもない}! / {Keine Ursache|とんでもない}.',
  ],
  [
    'よろしければ、どうぞ。',
    [
      ['よろしければ', 'よろしければ', 'wenn es recht ist (höfl.)', 'M'],
      ['どうぞ', 'どうぞ', 'bitte (sehr)', 'X'],
    ],
    '{Wenn Sie mögen|よろしければ}, {bitte sehr|どうぞ}.',
  ],
  [
    'おっしゃる通りです。',
    [
      ['おっしゃる', 'おっしゃる', 'Sie sagen (ehrerbietig)', 'V'],
      ['通り', 'とおり', 'genau wie', 'V'],
      ['です', 'です', 'ist (höflich)', 'V'],
    ],
    'Da {haben Sie|おっしゃる} {völlig recht|通り}.',
  ],
];
