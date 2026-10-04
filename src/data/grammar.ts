// Grammatik über Muster + vorgelesene Beispiele + Satzbau-Puzzle.
// Erklärungen bewusst kurz (max. 3 Sätze) – gelernt wird durch Hören & Ausprobieren.
//
// Satzbau-Übungen: Bausteine in korrekter Reihenfolge, Partikeln als eigene Bausteine,
// ohne Satzzeichen am Ende. Sätze sind so gewählt, dass die Reihenfolge eindeutig ist
// (keine frei vertauschbaren Zeit-/Ortsangaben). Distraktoren sind falsche Partikeln
// oder Formen, die keinen gleichwertig richtigen Satz ergeben.
import type { BuildExercise, GrammarPoint, Sentence, Tile } from './types';

/** Baustein; ohne zweites Argument ist die Kana-Lesung identisch mit jp. */
const t = (jp: string, kana: string = jp): Tile => ({ jp, kana });
const s = (jp: string, kana: string, de: string): Sentence => ({ jp, kana, de });
const b = (de: string, tiles: Tile[], distractors?: Tile[]): BuildExercise =>
  distractors ? { de, tiles, distractors } : { de, tiles };

export const grammar: GrammarPoint[] = [
  // ───────────────────────────── Level 1 ─────────────────────────────
  {
    id: 'g-desu',
    title: 'A ist B: です / じゃないです',
    pattern: 'A は B です / A は B じゃないです',
    level: 1,
    explanation:
      'は markiert das Thema („Was A angeht …“), です steht am Satzende wie „ist/bin“. Verneint wird mit じゃないです („ist nicht“).',
    examples: [
      s('私は学生です。', 'わたし は がくせい です。', 'Ich bin Student/in.'),
      s('田中さんは先生です。', 'たなかさん は せんせい です。', 'Herr/Frau Tanaka ist Lehrer/in.'),
      s('これは水です。', 'これ は みず です。', 'Das ist Wasser.'),
      s('私は日本人じゃないです。', 'わたし は にほんじん じゃ ない です。', 'Ich bin kein/e Japaner/in.'),
      s('今日は休みじゃないです。', 'きょう は やすみ じゃ ない です。', 'Heute ist kein freier Tag.'),
    ],
    exercises: [
      b('Ich bin Student/in.', [t('私', 'わたし'), t('は'), t('学生', 'がくせい'), t('です')], [t('を')]),
      b(
        'Herr Tanaka ist kein Lehrer.',
        [t('田中さん', 'たなかさん'), t('は'), t('先生', 'せんせい'), t('じゃないです')],
        [t('です')],
      ),
      b('Morgen ist ein freier Tag.', [t('明日', 'あした'), t('は'), t('休み', 'やすみ'), t('です')], [t('じゃないです')]),
    ],
  },
  {
    id: 'g-desu-ka',
    title: 'Fragen mit か',
    pattern: 'A は B です か',
    level: 1,
    explanation:
      'Hänge か ans Satzende – schon ist es eine Frage, die Wortstellung bleibt gleich. Fragewörter wie なん (was) oder だれ (wer) stehen dort, wo die Antwort stehen würde.',
    examples: [
      s('学生ですか。', 'がくせい です か。', 'Bist du Student/in?'),
      s('これは何ですか。', 'これ は なん です か。', 'Was ist das?'),
      s('あの人はだれですか。', 'あの ひと は だれ です か。', 'Wer ist die Person dort?'),
      s('田中さんは先生ですか。', 'たなかさん は せんせい です か。', 'Ist Herr/Frau Tanaka Lehrer/in?'),
      s('はい、そうです。', 'はい、そう です。', 'Ja, genau.'),
    ],
    exercises: [
      b('Was ist das?', [t('これ'), t('は'), t('何', 'なん'), t('です'), t('か')], [t('を')]),
      b(
        'Ist Herr Tanaka Japaner?',
        [t('田中さん', 'たなかさん'), t('は'), t('日本人', 'にほんじん'), t('です'), t('か')],
        [t('の')],
      ),
      b('Wer ist der Lehrer?', [t('先生', 'せんせい'), t('は'), t('だれ'), t('です'), t('か')], [t('に')]),
    ],
  },
  {
    id: 'g-no',
    title: 'の: mein, dein, von …',
    pattern: 'A の B',
    level: 1,
    explanation:
      'の verbindet zwei Nomen: A の B = „B von A“. Wie bei „Peters Buch“ steht der Besitzer zuerst: 私の本 = mein Buch.',
    examples: [
      s('私の本です。', 'わたし の ほん です。', 'Das ist mein Buch.'),
      s('これは田中さんの傘です。', 'これ は たなかさん の かさ です。', 'Das ist der Schirm von Herrn/Frau Tanaka.'),
      s('山田さんは日本語の先生です。', 'やまださん は にほんご の せんせい です。', 'Herr/Frau Yamada ist Japanischlehrer/in.'),
      s('私の友達はドイツ人です。', 'わたし の ともだち は ドイツじん です。', 'Mein Freund / meine Freundin ist Deutsche/r.'),
      s('だれのかばんですか。', 'だれ の かばん です か。', 'Wessen Tasche ist das?'),
    ],
    exercises: [
      b('Das ist mein Buch.', [t('これ'), t('は'), t('私', 'わたし'), t('の'), t('本', 'ほん'), t('です')], [t('を')]),
      b(
        'Wessen Tasche ist das?',
        [t('これ'), t('は'), t('だれ'), t('の'), t('かばん'), t('です'), t('か')],
        [t('に')],
      ),
      b(
        'Das ist der Schirm von Herrn Tanaka.',
        [t('これ'), t('は'), t('田中さん', 'たなかさん'), t('の'), t('傘', 'かさ'), t('です')],
        [t('を')],
      ),
    ],
  },
  {
    id: 'g-kosoado',
    title: 'こ・そ・あ・ど: dies, das, jenes',
    pattern: 'これ・それ・あれ・どれ / ここ・そこ・あそこ・どこ',
    level: 1,
    explanation:
      'こ = bei mir, そ = bei dir, あ = weit weg von uns beiden, ど = Frage. これ/それ/あれ/どれ sind Dinge, ここ/そこ/あそこ/どこ sind Orte.',
    examples: [
      s('これは何ですか。', 'これ は なん です か。', 'Was ist das (hier bei mir)?'),
      s('それは私のペンです。', 'それ は わたし の ペン です。', 'Das (bei dir) ist mein Stift.'),
      s('あれは富士山です。', 'あれ は ふじさん です。', 'Das dort drüben ist der Fuji.'),
      s('トイレはどこですか。', 'トイレ は どこ です か。', 'Wo ist die Toilette?'),
      s('駅はあそこです。', 'えき は あそこ です。', 'Der Bahnhof ist dort drüben.'),
    ],
    exercises: [
      b('Wo ist die Toilette?', [t('トイレ'), t('は'), t('どこ'), t('です'), t('か')], [t('どれ')]),
      b('Der Bahnhof ist dort drüben.', [t('駅', 'えき'), t('は'), t('あそこ'), t('です')], [t('ここ')]),
      b(
        'Das (bei dir) ist mein Stift.',
        [t('それ'), t('は'), t('私', 'わたし'), t('の'), t('ペン'), t('です')],
        [t('これ')],
      ),
      b('Was ist das dort drüben?', [t('あれ'), t('は'), t('何', 'なん'), t('です'), t('か')], [t('それ')]),
    ],
  },
  {
    id: 'g-keiyoushi',
    title: 'Adjektive: い und な',
    pattern: 'A は い-Adj. です / A は な-Adj. です',
    level: 1,
    explanation:
      'い-Adjektive enden auf い: おいしいです. な-Adjektive bekommen vor einem Nomen ein な: 静かな町 (eine ruhige Stadt). Verneint: おいしくないです / 静かじゃないです.',
    examples: [
      s('このラーメンはおいしいです。', 'この ラーメン は おいしい です。', 'Diese Ramen sind lecker.'),
      s('東京は大きいです。', 'とうきょう は おおきい です。', 'Tokyo ist groß.'),
      s('この町は静かです。', 'この まち は しずか です。', 'Diese Stadt ist ruhig.'),
      s('京都はきれいな町です。', 'きょうと は きれい な まち です。', 'Kyoto ist eine schöne Stadt.'),
      s('今日は寒くないです。', 'きょう は さむくない です。', 'Heute ist es nicht kalt.'),
    ],
    exercises: [
      b('Diese Ramen sind lecker.', [t('この'), t('ラーメン'), t('は'), t('おいしい'), t('です')], [t('おいしくない')]),
      b(
        'Kyoto ist eine schöne Stadt.',
        [t('京都', 'きょうと'), t('は'), t('きれいな'), t('町', 'まち'), t('です')],
        [t('きれい')],
      ),
      b('Heute ist es nicht kalt.', [t('今日', 'きょう'), t('は'), t('寒くない', 'さむくない'), t('です')], [t('寒い', 'さむい')]),
      b('Diese Stadt ist ruhig.', [t('この'), t('町', 'まち'), t('は'), t('静か', 'しずか'), t('です')], [t('静かな', 'しずかな')]),
    ],
  },
  {
    id: 'g-masu',
    title: 'Verben: ～ます / ～ません (mit を)',
    pattern: 'B を V-ます / V-ません',
    level: 1,
    explanation:
      'Höfliche Verben enden auf ～ます (ich tue / werde tun), verneint auf ～ません. を markiert das Objekt – das „Was?“ der Handlung. Das Verb steht immer am Ende.',
    examples: [
      s('毎朝コーヒーを飲みます。', 'まいあさ コーヒー を のみます。', 'Ich trinke jeden Morgen Kaffee.'),
      s('肉を食べません。', 'にく を たべません。', 'Ich esse kein Fleisch.'),
      s('明日、映画を見ます。', 'あした、えいが を みます。', 'Morgen sehe ich einen Film.'),
      s('お酒を飲みません。', 'おさけ を のみません。', 'Ich trinke keinen Alkohol.'),
      s('日本語を勉強します。', 'にほんご を べんきょう します。', 'Ich lerne Japanisch.'),
    ],
    exercises: [
      b('Ich trinke Kaffee.', [t('コーヒー'), t('を'), t('飲みます', 'のみます')], [t('に')]),
      b('Ich esse kein Fleisch.', [t('肉', 'にく'), t('を'), t('食べません', 'たべません')], [t('食べます', 'たべます')]),
      b('Ich lerne Japanisch.', [t('日本語', 'にほんご'), t('を'), t('勉強します', 'べんきょうします')], [t('が')]),
      b('Ich höre Musik.', [t('音楽', 'おんがく'), t('を'), t('聞きます', 'ききます')], [t('へ')]),
    ],
  },
  {
    id: 'g-mashita',
    title: 'Vergangenheit: ～ました / ～ませんでした',
    pattern: 'V-ました / V-ませんでした',
    level: 1,
    explanation:
      'Aus ～ます wird ～ました (habe … getan), aus ～ません wird ～ませんでした (habe nicht …). Ein eigenes Futur gibt es nicht – ～ます gilt für jetzt und später.',
    examples: [
      s('昨日、すしを食べました。', 'きのう、すし を たべました。', 'Gestern habe ich Sushi gegessen.'),
      s('宿題をしませんでした。', 'しゅくだい を しませんでした。', 'Ich habe die Hausaufgaben nicht gemacht.'),
      s('週末、映画を見ました。', 'しゅうまつ、えいが を みました。', 'Am Wochenende habe ich einen Film gesehen.'),
      s('朝ご飯を食べませんでした。', 'あさごはん を たべませんでした。', 'Ich habe nicht gefrühstückt.'),
      s('よく寝ました。', 'よく ねました。', 'Ich habe gut geschlafen.'),
    ],
    exercises: [
      b('Ich habe Sushi gegessen.', [t('すし'), t('を'), t('食べました', 'たべました')], [t('食べます', 'たべます')]),
      b(
        'Ich habe nicht gefrühstückt.',
        [t('朝ご飯', 'あさごはん'), t('を'), t('食べませんでした', 'たべませんでした')],
        [t('食べました', 'たべました')],
      ),
      b(
        'Ich habe die Hausaufgaben nicht gemacht.',
        [t('宿題', 'しゅくだい'), t('を'), t('しませんでした')],
        [t('しません')],
      ),
      b('Ich habe einen Film gesehen.', [t('映画', 'えいが'), t('を'), t('見ました', 'みました')], [t('が')]),
    ],
  },
  {
    id: 'g-ni-e',
    title: 'Ziel: に / へ',
    pattern: 'Ort に/へ 行きます',
    level: 1,
    explanation:
      'に oder へ zeigen das Ziel einer Bewegung – wie „nach/zu“. Typische Verben: 行きます (gehen), 来ます (kommen), 帰ります (heimkehren). Als Partikel wird へ „e“ gesprochen.',
    examples: [
      s('日本に行きます。', 'にほん に いきます。', 'Ich fahre nach Japan.'),
      s('明日、学校へ行きます。', 'あした、がっこう へ いきます。', 'Morgen gehe ich zur Schule.'),
      s('家に帰ります。', 'いえ に かえります。', 'Ich gehe nach Hause.'),
      s('田中さんは東京へ来ました。', 'たなかさん は とうきょう へ きました。', 'Herr/Frau Tanaka ist nach Tokyo gekommen.'),
      s('どこへ行きますか。', 'どこ へ いきます か。', 'Wohin gehst du?'),
    ],
    exercises: [
      b('Ich fahre nach Japan.', [t('日本', 'にほん'), t('に'), t('行きます', 'いきます')], [t('で')]),
      b('Ich gehe nach Hause.', [t('家', 'いえ'), t('に'), t('帰ります', 'かえります')], [t('を')]),
      b('Wohin gehst du?', [t('どこ'), t('へ'), t('行きます', 'いきます'), t('か')], [t('で')]),
      b('Ich bin zum Bahnhof gegangen.', [t('駅', 'えき'), t('へ'), t('行きました', 'いきました')], [t('を')]),
    ],
  },
  {
    id: 'g-de',
    title: 'で: wo und womit',
    pattern: 'Ort で V / Mittel で V',
    level: 1,
    explanation:
      'で sagt, wo etwas passiert („in/an“) oder womit („mit/per“). Merke: Ziel einer Bewegung → に, Ort einer Tätigkeit → で.',
    examples: [
      s('図書館で勉強します。', 'としょかん で べんきょう します。', 'Ich lerne in der Bibliothek.'),
      s('バスで行きます。', 'バス で いきます。', 'Ich fahre mit dem Bus.'),
      s('レストランで晩ご飯を食べました。', 'レストラン で ばんごはん を たべました。', 'Ich habe im Restaurant zu Abend gegessen.'),
      s('はしで食べます。', 'はし で たべます。', 'Ich esse mit Stäbchen.'),
      s('日本語で話します。', 'にほんご で はなします。', 'Ich spreche auf Japanisch.'),
    ],
    exercises: [
      b('Ich lerne in der Bibliothek.', [t('図書館', 'としょかん'), t('で'), t('勉強します', 'べんきょうします')], [t('に')]),
      b('Ich fahre mit dem Bus.', [t('バス'), t('で'), t('行きます', 'いきます')], [t('を')]),
      b('Ich esse mit Stäbchen.', [t('はし'), t('で'), t('食べます', 'たべます')], [t('を')]),
      b('Ich kaufe im Supermarkt ein.', [t('スーパー'), t('で'), t('買い物します', 'かいものします')], [t('に')]),
    ],
  },
  {
    id: 'g-arimasu-imasu',
    title: 'Es gibt: あります / います',
    pattern: 'Ort に N が あります / います',
    level: 1,
    explanation:
      'あります für Dinge und Pflanzen, います für Lebewesen (Menschen, Tiere). Der Ort bekommt に, das Ding oder Wesen が. Auch „haben“ drückt man so aus: 時間があります = ich habe Zeit.',
    examples: [
      s('机の上に本があります。', 'つくえ の うえ に ほん が あります。', 'Auf dem Tisch liegt ein Buch.'),
      s('公園に犬がいます。', 'こうえん に いぬ が います。', 'Im Park ist ein Hund.'),
      s('近くにコンビニがありますか。', 'ちかく に コンビニ が あります か。', 'Gibt es in der Nähe einen Konbini?'),
      s('兄弟がいます。', 'きょうだい が います。', 'Ich habe Geschwister.'),
      s('時間がありません。', 'じかん が ありません。', 'Ich habe keine Zeit.'),
    ],
    exercises: [
      b('Da ist ein Hund.', [t('犬', 'いぬ'), t('が'), t('います')], [t('あります')]),
      b('Ich habe keine Zeit.', [t('時間', 'じかん'), t('が'), t('ありません')], [t('いません')]),
      b('Wo ist die Katze?', [t('猫', 'ねこ'), t('は'), t('どこ'), t('に'), t('います'), t('か')], [t('あります')]),
      b('Ich habe einen jüngeren Bruder.', [t('弟', 'おとうと'), t('が'), t('います')], [t('あります')]),
    ],
  },
  {
    id: 'g-tai',
    title: 'Wünsche: ～たいです',
    pattern: 'V-たい です',
    level: 1,
    explanation:
      'Nimm den ます-Stamm und hänge たいです an: 食べます → 食べたいです (ich möchte essen). Verneint: 食べたくないです.',
    examples: [
      s('日本に行きたいです。', 'にほん に いきたい です。', 'Ich möchte nach Japan fahren.'),
      s('すしを食べたいです。', 'すし を たべたい です。', 'Ich möchte Sushi essen.'),
      s('何を飲みたいですか。', 'なに を のみたい です か。', 'Was möchtest du trinken?'),
      s('今日は働きたくないです。', 'きょう は はたらきたくない です。', 'Heute will ich nicht arbeiten.'),
      s('富士山に登りたいです。', 'ふじさん に のぼりたい です。', 'Ich möchte auf den Fuji steigen.'),
    ],
    exercises: [
      b('Ich möchte nach Japan fahren.', [t('日本', 'にほん'), t('に'), t('行きたい', 'いきたい'), t('です')], [t('行きます', 'いきます')]),
      b(
        'Was möchtest du trinken?',
        [t('何', 'なに'), t('を'), t('飲みたい', 'のみたい'), t('です'), t('か')],
        [t('飲みます', 'のみます')],
      ),
      b(
        'Heute will ich nicht arbeiten.',
        [t('今日', 'きょう'), t('は'), t('働きたくない', 'はたらきたくない'), t('です')],
        [t('働きたい', 'はたらきたい')],
      ),
      b('Ich möchte auf den Fuji steigen.', [t('富士山', 'ふじさん'), t('に'), t('登りたい', 'のぼりたい'), t('です')], [t('で')]),
    ],
  },
  {
    id: 'g-masenka',
    title: 'Einladen: ～ませんか / ～ましょう',
    pattern: 'V-ません か / V-ましょう',
    level: 1,
    explanation:
      '～ませんか ist eine höfliche Einladung: „Wollen wir nicht …?“. Mit ～ましょう sagst du „Lass uns …!“ – perfekt als Antwort: いいですね、行きましょう！',
    examples: [
      s('一緒に映画を見ませんか。', 'いっしょに えいが を みません か。', 'Wollen wir nicht zusammen einen Film sehen?'),
      s('いいですね、行きましょう。', 'いい です ね、いきましょう。', 'Gute Idee, lass uns gehen!'),
      s('週末、ハイキングに行きませんか。', 'しゅうまつ、ハイキング に いきません か。', 'Wollen wir am Wochenende wandern gehen?'),
      s('ちょっと休みましょう。', 'ちょっと やすみましょう。', 'Lass uns kurz Pause machen.'),
      s('コーヒーを飲みませんか。', 'コーヒー を のみません か。', 'Wollen wir einen Kaffee trinken?'),
    ],
    exercises: [
      b(
        'Wollen wir einen Kaffee trinken?',
        [t('コーヒー'), t('を'), t('飲みません', 'のみません'), t('か')],
        [t('飲みました', 'のみました')],
      ),
      b('Lass uns Sushi essen!', [t('すし'), t('を'), t('食べましょう', 'たべましょう')], [t('食べません', 'たべません')]),
      b('Wollen wir ins Kino gehen?', [t('映画館', 'えいがかん'), t('に'), t('行きません', 'いきません'), t('か')], [t('で')]),
      b('Lass uns nach Hause gehen!', [t('家', 'いえ'), t('に'), t('帰りましょう', 'かえりましょう')], [t('帰りません', 'かえりません')]),
    ],
  },

  // ───────────────────────────── Level 2 ─────────────────────────────
  {
    id: 'g-te-kudasai',
    title: 'Bitten: ～てください',
    pattern: 'V-て ください',
    level: 2,
    explanation:
      'て-Form + ください ist eine höfliche Bitte: 待ってください = „Bitte warten Sie“. Die て-Form brauchst du für viele weitere Muster – präg sie dir übers Ohr ein.',
    examples: [
      s('ちょっと待ってください。', 'ちょっと まって ください。', 'Warten Sie bitte einen Moment.'),
      s('もう一度言ってください。', 'もう いちど いって ください。', 'Sagen Sie es bitte noch einmal.'),
      s('ゆっくり話してください。', 'ゆっくり はなして ください。', 'Sprechen Sie bitte langsam.'),
      s('ここに名前を書いてください。', 'ここ に なまえ を かいて ください。', 'Schreiben Sie bitte hier Ihren Namen hin.'),
      s('窓を開けてください。', 'まど を あけて ください。', 'Öffnen Sie bitte das Fenster.'),
    ],
    exercises: [
      b('Öffnen Sie bitte das Fenster.', [t('窓', 'まど'), t('を'), t('開けて', 'あけて'), t('ください')], [t('開けます', 'あけます')]),
      b('Sprechen Sie bitte langsam.', [t('ゆっくり'), t('話して', 'はなして'), t('ください')], [t('話します', 'はなします')]),
      b('Schreiben Sie bitte Ihren Namen.', [t('名前', 'なまえ'), t('を'), t('書いて', 'かいて'), t('ください')], [t('書きて', 'かきて')]),
      b('Warten Sie bitte einen Moment.', [t('ちょっと'), t('待って', 'まって'), t('ください')], [t('待ちて', 'まちて')]),
    ],
  },
  {
    id: 'g-te-imasu',
    title: 'Gerade & Zustand: ～ています',
    pattern: 'V-て います',
    level: 2,
    explanation:
      '～ています beschreibt, was gerade passiert („ich bin gerade am …“). Bei manchen Verben ist es ein Zustand: 結婚しています = ich bin verheiratet, 住んでいます = ich wohne.',
    examples: [
      s('今、ご飯を食べています。', 'いま、ごはん を たべて います。', 'Ich esse gerade.'),
      s('雨が降っています。', 'あめ が ふって います。', 'Es regnet.'),
      s('何をしていますか。', 'なに を して います か。', 'Was machst du gerade?'),
      s('姉は結婚しています。', 'あね は けっこん して います。', 'Meine ältere Schwester ist verheiratet.'),
      s('東京に住んでいます。', 'とうきょう に すんで います。', 'Ich wohne in Tokyo.'),
    ],
    exercises: [
      b('Es regnet.', [t('雨', 'あめ'), t('が'), t('降って', 'ふって'), t('います')], [t('を')]),
      b('Was machst du gerade?', [t('何', 'なに'), t('を'), t('して'), t('います'), t('か')], [t('します')]),
      b('Ich wohne in Tokyo.', [t('東京', 'とうきょう'), t('に'), t('住んで', 'すんで'), t('います')], [t('で')]),
      b(
        'Meine ältere Schwester ist verheiratet.',
        [t('姉', 'あね'), t('は'), t('結婚して', 'けっこんして'), t('います')],
        [t('結婚します', 'けっこんします')],
      ),
    ],
  },
  {
    id: 'g-temo-ii',
    title: 'Erlaubnis & Verbot',
    pattern: 'V-て も いい です か / V-て は いけません',
    level: 2,
    explanation:
      '～てもいいですか fragt um Erlaubnis: „Darf ich …?“. ～てはいけません ist ein Verbot: „Man darf nicht …“ (は wird hier „wa“ gesprochen).',
    examples: [
      s('写真を撮ってもいいですか。', 'しゃしん を とって も いい です か。', 'Darf ich ein Foto machen?'),
      s('ここに座ってもいいですか。', 'ここ に すわって も いい です か。', 'Darf ich mich hierhin setzen?'),
      s('窓を開けてもいいですか。', 'まど を あけて も いい です か。', 'Darf ich das Fenster öffnen?'),
      s('ここでたばこを吸ってはいけません。', 'ここ で たばこ を すって は いけません。', 'Hier darf man nicht rauchen.'),
      s('美術館で写真を撮ってはいけません。', 'びじゅつかん で しゃしん を とって は いけません。', 'Im Museum darf man nicht fotografieren.'),
    ],
    exercises: [
      b(
        'Darf ich ein Foto machen?',
        [t('写真', 'しゃしん'), t('を'), t('撮って', 'とって'), t('も'), t('いいですか')],
        [t('は')],
      ),
      b(
        'Darf ich mich hierhin setzen?',
        [t('ここ'), t('に'), t('座って', 'すわって'), t('も'), t('いいですか')],
        [t('座ります', 'すわります')],
      ),
      b('Man darf nicht rauchen.', [t('たばこ'), t('を'), t('吸って', 'すって'), t('は'), t('いけません')], [t('も')]),
      b(
        'Darf ich das Fenster öffnen?',
        [t('窓', 'まど'), t('を'), t('開けて', 'あけて'), t('も'), t('いいですか')],
        [t('は')],
      ),
    ],
  },
  {
    id: 'g-keiyoushi-kako',
    title: 'Adjektive in der Vergangenheit',
    pattern: 'い-Adj. → ～かったです / な-Adj. → ～でした',
    level: 2,
    explanation:
      'Bei い-Adjektiven wird い zu かった: 楽しい → 楽しかったです. な-Adjektive und Nomen bekommen でした: 静かでした. Achtung: いい → よかったです.',
    examples: [
      s('旅行は楽しかったです。', 'りょこう は たのしかった です。', 'Die Reise hat Spaß gemacht.'),
      s('昨日は寒かったです。', 'きのう は さむかった です。', 'Gestern war es kalt.'),
      s('町はとても静かでした。', 'まち は とても しずか でした。', 'Die Stadt war sehr ruhig.'),
      s('天気がよかったです。', 'てんき が よかった です。', 'Das Wetter war gut.'),
      s('映画は面白くなかったです。', 'えいが は おもしろくなかった です。', 'Der Film war nicht interessant.'),
    ],
    exercises: [
      b(
        'Die Reise hat Spaß gemacht.',
        [t('旅行', 'りょこう'), t('は'), t('楽しかった', 'たのしかった'), t('です')],
        [t('楽しい', 'たのしい'), t('でした')],
      ),
      b(
        'Gestern war es kalt.',
        [t('昨日', 'きのう'), t('は'), t('寒かった', 'さむかった'), t('です')],
        [t('寒いでした', 'さむいでした')],
      ),
      b('Die Stadt war ruhig.', [t('町', 'まち'), t('は'), t('静か', 'しずか'), t('でした')], [t('静かかった', 'しずかかった')]),
      b('Das Wetter war gut.', [t('天気', 'てんき'), t('が'), t('よかった'), t('です')], [t('いかった')]),
    ],
  },
  {
    id: 'g-suki-desu',
    title: 'Mögen & Können: 好き / 上手',
    pattern: 'A は B が 好き です / 上手 です',
    level: 2,
    explanation:
      '好き (mögen) und 上手 (gut in etwas) sind な-Adjektive – deshalb bekommt das Gemochte が, nicht を. Die Gegenteile sind 嫌い (nicht mögen) und 下手 (schlecht in etwas).',
    examples: [
      s('私は猫が好きです。', 'わたし は ねこ が すき です。', 'Ich mag Katzen.'),
      s('何が好きですか。', 'なに が すき です か。', 'Was magst du?'),
      s('田中さんは料理が上手です。', 'たなかさん は りょうり が じょうず です。', 'Herr/Frau Tanaka kocht gut.'),
      s('私は歌が下手です。', 'わたし は うた が へた です。', 'Ich singe schlecht.'),
      s('野菜があまり好きじゃないです。', 'やさい が あまり すき じゃ ない です。', 'Ich mag Gemüse nicht so gern.'),
    ],
    exercises: [
      b('Ich mag Katzen.', [t('猫', 'ねこ'), t('が'), t('好き', 'すき'), t('です')], [t('を')]),
      b('Was magst du?', [t('何', 'なに'), t('が'), t('好き', 'すき'), t('です'), t('か')], [t('は')]),
      b('Ich singe schlecht.', [t('歌', 'うた'), t('が'), t('下手', 'へた'), t('です')], [t('上手', 'じょうず'), t('を')]),
      b(
        'Ich mag keinen Fisch.',
        [t('魚', 'さかな'), t('が'), t('好きじゃない', 'すきじゃない'), t('です')],
        [t('好きくない', 'すきくない')],
      ),
    ],
  },
  {
    id: 'g-kara',
    title: 'Begründen: ～から',
    pattern: 'Grund から、Folge',
    level: 2,
    explanation:
      'から heißt „weil“, steht aber HINTER dem Grund: 暑いから = „weil es heiß ist“. Erst kommt der Grund, dann die Folge.',
    examples: [
      s('暑いから、窓を開けます。', 'あつい から、まど を あけます。', 'Weil es heiß ist, öffne ich das Fenster.'),
      s('時間がないから、タクシーで行きます。', 'じかん が ない から、タクシー で いきます。', 'Weil ich keine Zeit habe, fahre ich mit dem Taxi.'),
      s('明日は休みですから、ゆっくり寝ます。', 'あした は やすみ です から、ゆっくり ねます。', 'Weil morgen frei ist, schlafe ich aus.'),
      s('雨ですから、出かけません。', 'あめ です から、でかけません。', 'Weil es regnet, gehe ich nicht raus.'),
    ],
    exercises: [
      b(
        'Weil es heiß ist, öffne ich das Fenster.',
        [t('暑い', 'あつい'), t('から'), t('窓', 'まど'), t('を'), t('開けます', 'あけます')],
        [t('まで')],
      ),
      b(
        'Weil ich keine Zeit habe, fahre ich mit dem Taxi.',
        [t('時間', 'じかん'), t('が'), t('ない'), t('から'), t('タクシー'), t('で'), t('行きます', 'いきます')],
        [t('を')],
      ),
      b(
        'Weil es regnet, gehe ich nicht raus.',
        [t('雨', 'あめ'), t('です'), t('から'), t('出かけません', 'でかけません')],
        [t('出かけます', 'でかけます')],
      ),
      b(
        'Weil es lecker ist, esse ich viel.',
        [t('おいしい'), t('から'), t('たくさん'), t('食べます', 'たべます')],
        [t('を')],
      ),
    ],
  },
  {
    id: 'g-yori',
    title: 'Vergleichen: より / のほうが',
    pattern: 'A は B より Adj. / B の ほう が Adj.',
    level: 2,
    explanation:
      'より heißt „als“: 電車はバスより速いです = Der Zug ist schneller als der Bus. Mit のほうが hebst du die „Gewinner“-Seite hervor. Das Adjektiv selbst ändert sich nicht – kein „-er“ wie im Deutschen.',
    examples: [
      s('東京は大阪より大きいです。', 'とうきょう は おおさか より おおきい です。', 'Tokyo ist größer als Osaka.'),
      s('電車はバスより速いです。', 'でんしゃ は バス より はやい です。', 'Der Zug ist schneller als der Bus.'),
      s('コーヒーと紅茶とどちらが好きですか。', 'コーヒー と こうちゃ と どちら が すき です か。', 'Was magst du lieber, Kaffee oder Tee?'),
      s('紅茶のほうが好きです。', 'こうちゃ の ほう が すき です。', 'Ich mag Tee lieber.'),
      s('夏より冬のほうが好きです。', 'なつ より ふゆ の ほう が すき です。', 'Ich mag den Winter lieber als den Sommer.'),
    ],
    exercises: [
      b(
        'Der Zug ist schneller als der Bus.',
        [t('電車', 'でんしゃ'), t('は'), t('バス'), t('より'), t('速い', 'はやい'), t('です')],
        [t('から')],
      ),
      b(
        'Ich mag Tee lieber.',
        [t('紅茶', 'こうちゃ'), t('の'), t('ほう'), t('が'), t('好き', 'すき'), t('です')],
        [t('を')],
      ),
      b('Welches ist billiger?', [t('どちら'), t('が'), t('安い', 'やすい'), t('です'), t('か')], [t('は')]),
      b(
        'Japanisch ist schwieriger als Englisch.',
        [t('日本語', 'にほんご'), t('は'), t('英語', 'えいご'), t('より'), t('難しい', 'むずかしい'), t('です')],
        [t('の')],
      ),
    ],
  },
  {
    id: 'g-futsuukei',
    title: 'Plain-Form unter Freunden',
    pattern: 'V (Wörterbuchform) / V-ない',
    level: 2,
    explanation:
      'Unter Freunden und in der Familie lässt man です/ます weg: 行きます → 行く, 行きません → 行かない. Diese Form steht auch so im Wörterbuch – und sie steckt in vielen späteren Mustern.',
    examples: [
      s('今、時間ある？', 'いま、じかん ある？', 'Hast du gerade Zeit?'),
      s('明日のパーティー、行く？', 'あした の パーティー、いく？', 'Gehst du morgen zur Party?'),
      s('うん、行く。', 'うん、いく。', 'Ja, ich gehe hin.'),
      s('今日は飲まない。', 'きょう は のまない。', 'Heute trinke ich nicht.'),
      s('わからない。', 'わからない。', 'Weiß ich nicht.'),
    ],
    exercises: [
      b('Ich trinke Kaffee. (locker)', [t('コーヒー'), t('を'), t('飲む', 'のむ')], [t('飲みる', 'のみる')]),
      b('Ich gehe nicht zur Schule. (locker)', [t('学校', 'がっこう'), t('に'), t('行かない', 'いかない')], [t('行きない', 'いきない')]),
      b('Ich habe kein Geld. (locker)', [t('お金', 'おかね'), t('が'), t('ない')], [t('あらない')]),
      b('Ich verstehe kein Japanisch. (locker)', [t('日本語', 'にほんご'), t('が'), t('わからない')], [t('わかりない')]),
    ],
  },
  {
    id: 'g-ta-koto',
    title: 'Erfahrung: ～たことがあります',
    pattern: 'V-た こと が あります',
    level: 2,
    explanation:
      'た-Form + ことがあります = „Ich habe schon einmal … (gemacht)“; mit ありません heißt es „noch nie“. Die た-Form bildest du wie die て-Form, nur mit a: 食べて → 食べた, 行って → 行った.',
    examples: [
      s('日本に行ったことがあります。', 'にほん に いった こと が あります。', 'Ich war schon einmal in Japan.'),
      s('納豆を食べたことがありますか。', 'なっとう を たべた こと が あります か。', 'Hast du schon mal Nattō gegessen?'),
      s('富士山に登ったことがありません。', 'ふじさん に のぼった こと が ありません。', 'Ich war noch nie auf dem Fuji.'),
      s('着物を着たことがあります。', 'きもの を きた こと が あります。', 'Ich habe schon einmal einen Kimono getragen.'),
    ],
    exercises: [
      b(
        'Ich war schon einmal in Japan.',
        [t('日本', 'にほん'), t('に'), t('行った', 'いった'), t('こと'), t('が'), t('あります')],
        [t('行って', 'いって')],
      ),
      b(
        'Hast du schon mal Nattō gegessen?',
        [t('納豆', 'なっとう'), t('を'), t('食べた', 'たべた'), t('こと'), t('が'), t('あります'), t('か')],
        [t('食べて', 'たべて')],
      ),
      b(
        'Ich habe noch nie einen Kimono getragen.',
        [t('着物', 'きもの'), t('を'), t('着た', 'きた'), t('こと'), t('が'), t('ありません')],
        [t('あります')],
      ),
      b(
        'Ich war noch nie auf dem Fuji.',
        [t('富士山', 'ふじさん'), t('に'), t('登った', 'のぼった'), t('こと'), t('が'), t('ありません')],
        [t('登りた', 'のぼりた')],
      ),
    ],
  },
  {
    id: 'g-to-omoimasu',
    title: 'Meinung: ～と思います',
    pattern: 'Plain-Form + と 思います',
    level: 2,
    explanation:
      '„Ich glaube/finde, dass …“ = Plain-Form + と思います. Nach Nomen und な-Adjektiven steht だ: 雨だと思います. Das と ist wie ein gesprochenes Anführungszeichen.',
    examples: [
      s('明日は雨だと思います。', 'あした は あめ だ と おもいます。', 'Ich glaube, morgen regnet es.'),
      s('この映画は面白いと思います。', 'この えいが は おもしろい と おもいます。', 'Ich finde diesen Film interessant.'),
      s('田中さんは来ないと思います。', 'たなかさん は こない と おもいます。', 'Ich glaube, Herr/Frau Tanaka kommt nicht.'),
      s('もう帰ったと思います。', 'もう かえった と おもいます。', 'Ich glaube, er/sie ist schon nach Hause gegangen.'),
    ],
    exercises: [
      b('Ich glaube, es regnet.', [t('雨', 'あめ'), t('だ'), t('と'), t('思います', 'おもいます')], [t('です')]),
      b(
        'Ich finde diesen Film interessant.',
        [t('この'), t('映画', 'えいが'), t('は'), t('面白い', 'おもしろい'), t('と'), t('思います', 'おもいます')],
        [t('面白いだ', 'おもしろいだ')],
      ),
      b(
        'Ich glaube, Herr Tanaka kommt nicht.',
        [t('田中さん', 'たなかさん'), t('は'), t('来ない', 'こない'), t('と'), t('思います', 'おもいます')],
        [t('来ません', 'きません')],
      ),
      b(
        'Ich glaube, sie ist schon nach Hause gegangen.',
        [t('もう'), t('帰った', 'かえった'), t('と'), t('思います', 'おもいます')],
        [t('帰りました', 'かえりました')],
      ),
    ],
  },

  // ───────────────────────────── Level 3 ─────────────────────────────
  {
    id: 'g-nagara',
    title: 'Gleichzeitig: ～ながら',
    pattern: 'V1 (ます-Stamm) ながら V2',
    level: 3,
    explanation:
      'ます-Stamm + ながら = „während/nebenbei“ – eine Person macht zwei Dinge gleichzeitig. Die Haupthandlung steht am Ende: 音楽を聞きながら勉強します = Ich lerne und höre dabei Musik.',
    examples: [
      s('音楽を聞きながら勉強します。', 'おんがく を ききながら べんきょう します。', 'Ich lerne, während ich Musik höre.'),
      s('テレビを見ながらご飯を食べます。', 'テレビ を みながら ごはん を たべます。', 'Ich esse beim Fernsehen.'),
      s('コーヒーを飲みながら話しましょう。', 'コーヒー を のみながら はなしましょう。', 'Lass uns bei einem Kaffee reden.'),
      s('働きながら日本語を勉強しています。', 'はたらきながら にほんご を べんきょう して います。', 'Ich lerne Japanisch neben der Arbeit.'),
    ],
    exercises: [
      b(
        'Ich esse beim Fernsehen.',
        [t('テレビ'), t('を'), t('見ながら', 'みながら'), t('食べます', 'たべます')],
        [t('見るながら', 'みるながら')],
      ),
      b(
        'Ich jogge und höre dabei Musik.',
        [t('音楽', 'おんがく'), t('を'), t('聞きながら', 'ききながら'), t('走ります', 'はしります')],
        [t('聞いてながら', 'きいてながら')],
      ),
      b(
        'Lass uns bei einem Kaffee reden.',
        [t('コーヒー'), t('を'), t('飲みながら', 'のみながら'), t('話しましょう', 'はなしましょう')],
        [t('飲むながら', 'のむながら')],
      ),
    ],
  },
  {
    id: 'g-tara-ba',
    title: 'Wenn …: ～たら / ～ば',
    pattern: 'V-たら、… / V-ば、…',
    level: 3,
    explanation:
      '～たら (た-Form + ら) = „wenn/sobald“ – im Gespräch die häufigste Form. ～ば betont die Bedingung: 行く → 行けば, 安い → 安ければ, いい → よければ.',
    examples: [
      s('日本に行ったら、すしを食べたいです。', 'にほん に いったら、すし を たべたい です。', 'Wenn ich in Japan bin, möchte ich Sushi essen.'),
      s('雨が降ったら、家にいます。', 'あめ が ふったら、いえ に います。', 'Wenn es regnet, bleibe ich zu Hause.'),
      s('駅に着いたら、電話してください。', 'えき に ついたら、でんわ して ください。', 'Ruf bitte an, wenn du am Bahnhof ankommst.'),
      s('安ければ買います。', 'やすければ かいます。', 'Wenn es billig ist, kaufe ich es.'),
      s('急げば間に合います。', 'いそげば まにあいます。', 'Wenn wir uns beeilen, schaffen wir es noch.'),
    ],
    exercises: [
      b(
        'Wenn es regnet, bleibe ich zu Hause.',
        [t('雨', 'あめ'), t('が'), t('降ったら', 'ふったら'), t('家', 'いえ'), t('に'), t('います')],
        [t('を')],
      ),
      b(
        'Ruf bitte an, wenn du am Bahnhof ankommst.',
        [t('駅', 'えき'), t('に'), t('着いたら', 'ついたら'), t('電話して', 'でんわして'), t('ください')],
        [t('で')],
      ),
      b(
        'Wenn das Wetter gut ist, gehe ich spazieren.',
        [t('天気', 'てんき'), t('が'), t('よければ'), t('散歩します', 'さんぽします')],
        [t('いければ')],
      ),
      b(
        'Wenn Sie geradeaus gehen, kommt der Bahnhof.',
        [t('まっすぐ'), t('行けば', 'いけば'), t('駅', 'えき'), t('が'), t('あります')],
        [t('行くば', 'いくば')],
      ),
    ],
  },
  {
    id: 'g-sou-desu',
    title: '～そうです: sieht aus / soll',
    pattern: 'Stamm + そうです (Anschein) / Plain-Form + そうです (Hörensagen)',
    level: 3,
    explanation:
      'Stamm + そうです = „sieht aus wie“: おいしそうです (sieht lecker aus). Plain-Form + そうです = „ich habe gehört“: 雨が降るそうです (es soll regnen). Gleiches Wort, andere Anbindung – hör genau hin!',
    examples: [
      s('このケーキはおいしそうです。', 'この ケーキ は おいしそう です。', 'Dieser Kuchen sieht lecker aus.'),
      s('雨が降りそうです。', 'あめ が ふりそう です。', 'Es sieht nach Regen aus.'),
      s('田中さんは忙しそうです。', 'たなかさん は いそがしそう です。', 'Herr/Frau Tanaka scheint beschäftigt zu sein.'),
      s('天気予報によると、明日は雪が降るそうです。', 'てんきよほう に よる と、あした は ゆき が ふる そう です。', 'Laut Wetterbericht soll es morgen schneien.'),
      s('山田さんは結婚したそうです。', 'やまださん は けっこん した そう です。', 'Ich habe gehört, dass Herr/Frau Yamada geheiratet hat.'),
    ],
    exercises: [
      b(
        'Dieser Kuchen sieht lecker aus.',
        [t('この'), t('ケーキ'), t('は'), t('おいしそう'), t('です')],
        [t('おいしいそう')],
      ),
      b('Es sieht nach Regen aus.', [t('雨', 'あめ'), t('が'), t('降りそう', 'ふりそう'), t('です')], [t('を')]),
      b(
        'Ich habe gehört, dass Herr Yamada geheiratet hat.',
        [t('山田さん', 'やまださん'), t('は'), t('結婚した', 'けっこんした'), t('そう'), t('です')],
        [t('結婚しました', 'けっこんしました')],
      ),
      b('Ich habe gehört, es soll schneien.', [t('雪', 'ゆき'), t('が'), t('降る', 'ふる'), t('そう'), t('です')], [t('だ')]),
    ],
  },
  {
    id: 'g-te-shimau',
    title: 'Ups! ～てしまう',
    pattern: 'V-て しまいました',
    level: 3,
    explanation:
      '～てしまいました zeigt, dass etwas (leider) passiert oder komplett erledigt ist – oft mit Bedauern: „Mist, ich habe …“. Umgangssprachlich wird daraus ～ちゃった: 忘れちゃった！',
    examples: [
      s('財布を忘れてしまいました。', 'さいふ を わすれて しまいました。', 'Ich habe (leider) mein Portemonnaie vergessen.'),
      s('電車に乗り遅れてしまいました。', 'でんしゃ に のりおくれて しまいました。', 'Ich habe den Zug verpasst.'),
      s('ケーキを全部食べてしまいました。', 'ケーキ を ぜんぶ たべて しまいました。', 'Ich habe den ganzen Kuchen aufgegessen.'),
      s('スマホを落としてしまいました。', 'スマホ を おとして しまいました。', 'Ich habe mein Handy fallen lassen.'),
      s('宿題、もう終わっちゃった。', 'しゅくだい、もう おわっちゃった。', 'Die Hausaufgaben sind schon fertig!'),
    ],
    exercises: [
      b(
        'Ich habe mein Portemonnaie vergessen.',
        [t('財布', 'さいふ'), t('を'), t('忘れて', 'わすれて'), t('しまいました')],
        [t('忘れた', 'わすれた')],
      ),
      b(
        'Ich habe den Zug verpasst.',
        [t('電車', 'でんしゃ'), t('に'), t('乗り遅れて', 'のりおくれて'), t('しまいました')],
        [t('で')],
      ),
      b(
        'Ich habe mein Handy fallen lassen.',
        [t('スマホ'), t('を'), t('落として', 'おとして'), t('しまいました')],
        [t('落ちて', 'おちて')],
      ),
      b(
        'Ich habe den Schlüssel verloren.',
        [t('鍵', 'かぎ'), t('を'), t('なくして'), t('しまいました')],
        [t('なくなって')],
      ),
    ],
  },
  {
    id: 'g-you-ni',
    title: '～ようにする / ～ようになる',
    pattern: 'V-る/V-ない ように して います / V-る ように なりました',
    level: 3,
    explanation:
      '～ようにしています = „ich achte darauf, dass …“ – eine Gewohnheit, die man bewusst pflegt. ～ようになりました = „jetzt kann/tue ich es“ – eine Veränderung mit der Zeit.',
    examples: [
      s('毎日野菜を食べるようにしています。', 'まいにち やさい を たべる よう に して います。', 'Ich achte darauf, jeden Tag Gemüse zu essen.'),
      s('夜遅く食べないようにしています。', 'よる おそく たべない よう に して います。', 'Ich achte darauf, abends nicht spät zu essen.'),
      s('日本語が話せるようになりました。', 'にほんご が はなせる よう に なりました。', 'Jetzt kann ich Japanisch sprechen.'),
      s('納豆が食べられるようになりました。', 'なっとう が たべられる よう に なりました。', 'Inzwischen kann ich Nattō essen.'),
    ],
    exercises: [
      b(
        'Jetzt kann ich Japanisch sprechen.',
        [t('日本語', 'にほんご'), t('が'), t('話せる', 'はなせる'), t('ように'), t('なりました')],
        [t('しました')],
      ),
      b(
        'Ich achte darauf, früh schlafen zu gehen.',
        [t('早く', 'はやく'), t('寝る', 'ねる'), t('ように'), t('して'), t('います')],
        [t('なって')],
      ),
      b(
        'Ich achte darauf, keine Süßigkeiten zu essen.',
        [t('甘い物', 'あまいもの'), t('を'), t('食べない', 'たべない'), t('ように'), t('して'), t('います')],
        [t('食べません', 'たべません')],
      ),
      b(
        'Inzwischen kann ich Nattō essen.',
        [t('納豆', 'なっとう'), t('が'), t('食べられる', 'たべられる'), t('ように'), t('なりました')],
        [t('食べる', 'たべる')],
      ),
    ],
  },
  {
    id: 'g-ukemi',
    title: 'Passiv: ～られる',
    pattern: 'A は B に V-(ら)れる',
    level: 3,
    explanation:
      'ru-Verben bekommen られる, u-Verben wechseln zum a-Laut + れる: 書く → 書かれる. Wer handelt, bekommt に – wie „von“ im Deutschen. Oft klingt mit, dass einem etwas Unangenehmes passiert ist.',
    examples: [
      s('先生に褒められました。', 'せんせい に ほめられました。', 'Ich wurde vom Lehrer gelobt.'),
      s('犬にかまれました。', 'いぬ に かまれました。', 'Ich wurde von einem Hund gebissen.'),
      s('電車で足を踏まれました。', 'でんしゃ で あし を ふまれました。', 'Im Zug ist mir jemand auf den Fuß getreten.'),
      s('この本は世界中で読まれています。', 'この ほん は せかいじゅう で よまれて います。', 'Dieses Buch wird auf der ganzen Welt gelesen.'),
      s('雨に降られました。', 'あめ に ふられました。', 'Ich bin in den Regen gekommen.'),
    ],
    exercises: [
      b('Ich wurde vom Lehrer gelobt.', [t('先生', 'せんせい'), t('に'), t('褒められました', 'ほめられました')], [t('褒めました', 'ほめました')]),
      b('Ich wurde von einem Hund gebissen.', [t('犬', 'いぬ'), t('に'), t('かまれました')], [t('かみました')]),
      b(
        'Mir wurde das Portemonnaie gestohlen.',
        [t('財布', 'さいふ'), t('を'), t('盗まれました', 'ぬすまれました')],
        [t('盗みました', 'ぬすみました')],
      ),
      b('Ich bin in den Regen gekommen.', [t('雨', 'あめ'), t('に'), t('降られました', 'ふられました')], [t('が')]),
    ],
  },
  {
    id: 'g-shieki',
    title: 'Kausativ: ～させる',
    pattern: 'A は B に/を V-(さ)せる',
    level: 3,
    explanation:
      'Kausativ = jemanden etwas tun lassen: ru-Verben + させる, u-Verben a-Laut + せる (行く → 行かせる). Mit ～させてください bittest du höflich: „Lassen Sie mich …“.',
    examples: [
      s('母は弟に野菜を食べさせます。', 'はは は おとうと に やさい を たべさせます。', 'Meine Mutter lässt meinen kleinen Bruder Gemüse essen.'),
      s('先生は学生に作文を書かせました。', 'せんせい は がくせい に さくぶん を かかせました。', 'Der Lehrer ließ die Schüler einen Aufsatz schreiben.'),
      s('子供を公園で遊ばせます。', 'こども を こうえん で あそばせます。', 'Ich lasse die Kinder im Park spielen.'),
      s('ちょっと考えさせてください。', 'ちょっと かんがえさせて ください。', 'Lassen Sie mich kurz nachdenken.'),
      s('私に払わせてください。', 'わたし に はらわせて ください。', 'Lassen Sie mich bitte bezahlen.'),
    ],
    exercises: [
      b(
        'Lassen Sie mich kurz nachdenken.',
        [t('ちょっと'), t('考えさせて', 'かんがえさせて'), t('ください')],
        [t('考えて', 'かんがえて')],
      ),
      b(
        'Lassen Sie mich bitte bezahlen.',
        [t('私', 'わたし'), t('に'), t('払わせて', 'はらわせて'), t('ください')],
        [t('払って', 'はらって')],
      ),
      b('Ich lasse die Kinder spielen.', [t('子供', 'こども'), t('を'), t('遊ばせます', 'あそばせます')], [t('遊びます', 'あそびます')]),
      b(
        'Ich lasse meinen Sohn im Ausland studieren.',
        [t('息子', 'むすこ'), t('を'), t('留学させます', 'りゅうがくさせます')],
        [t('留学します', 'りゅうがくします')],
      ),
    ],
  },
  {
    id: 'g-keigo',
    title: 'Keigo: 尊敬語 & 謙譲語',
    pattern: '尊敬語: いらっしゃる・召し上がる / 謙譲語: 参る・申す・お～します',
    level: 3,
    explanation:
      '尊敬語 hebt die anderen an (was Kunde oder Chef tun), 謙譲語 macht dich selbst bescheidener (was du tust). Viele Verben haben eigene Wörter: 行く → いらっしゃる (andere) / 参る (ich).',
    examples: [
      s('社長はいらっしゃいますか。', 'しゃちょう は いらっしゃいます か。', 'Ist der Firmenchef da?'),
      s('何を召し上がりますか。', 'なに を めしあがります か。', 'Was möchten Sie essen?'),
      s('明日、そちらに参ります。', 'あした、そちら に まいります。', 'Ich komme morgen zu Ihnen.'),
      s('私がお持ちします。', 'わたし が おもち します。', 'Ich trage das für Sie.'),
      s('田中と申します。', 'たなか と もうします。', 'Mein Name ist Tanaka.'),
    ],
    exercises: [
      b('Mein Name ist Tanaka. (bescheiden)', [t('田中', 'たなか'), t('と'), t('申します', 'もうします')], [t('を')]),
      b(
        'Was möchten Sie essen? (respektvoll)',
        [t('何', 'なに'), t('を'), t('召し上がります', 'めしあがります'), t('か')],
        [t('いただきます')],
      ),
      b(
        'Ist der Firmenchef da? (respektvoll)',
        [t('社長', 'しゃちょう'), t('は'), t('いらっしゃいます'), t('か')],
        [t('おります')],
      ),
      b(
        'Ich trage das für Sie. (bescheiden)',
        [t('私', 'わたし'), t('が'), t('お持ちします', 'おもちします')],
        [t('お持ちになります', 'おもちになります')],
      ),
    ],
  },
];
