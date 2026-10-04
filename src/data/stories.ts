// Kurze Hörgeschichten (Comprehensible Input, i+1) mit Verständnisfragen.
// Level 1: höfliche Form, sehr einfache Sätze. Level 2: etwas länger, mehr Verbformen.
// Level 3: Erzählstil in einfacher Form (だ/である), mit Umgangssprache und Dialekt in Zitaten.
import type { Story } from './types';

export const stories: Story[] = [
  // ───────────────────────────── Level 1 ─────────────────────────────
  {
    id: 's-ichinichi',
    title: 'Mein Tag',
    titleJp: '私の一日',
    level: 1,
    topic: 'time',
    sentences: [
      { jp: '私は毎朝6時に起きます。', kana: 'わたし は まいあさ ろくじ に おきます。', de: 'Ich stehe jeden Morgen um sechs Uhr auf.' },
      { jp: '朝ご飯はパンとコーヒーです。', kana: 'あさごはん は パン と コーヒー です。', de: 'Zum Frühstück gibt es Brot und Kaffee.' },
      { jp: '8時に電車で会社へ行きます。', kana: 'はちじ に でんしゃ で かいしゃ へ いきます。', de: 'Um acht fahre ich mit dem Zug zur Arbeit.' },
      {
        jp: '昼ご飯は、いつも会社の近くでラーメンを食べます。',
        kana: 'ひるごはん は、 いつも かいしゃ の ちかく で ラーメン を たべます。',
        de: 'Mittags esse ich immer Ramen in der Nähe der Firma.',
      },
      { jp: '夜は家で日本語を勉強します。', kana: 'よる は いえ で にほんご を べんきょう します。', de: 'Abends lerne ich zu Hause Japanisch.' },
      { jp: 'でも、すぐ眠くなります。', kana: 'でも、 すぐ ねむく なります。', de: 'Aber ich werde schnell müde.' },
    ],
    questions: [
      { q: 'Wann steht die Person auf?', options: ['Um 6 Uhr', 'Um 7 Uhr', 'Um 8 Uhr'], answer: 0 },
      { q: 'Was isst die Person mittags?', options: ['Sushi', 'Brot', 'Ramen'], answer: 2 },
      {
        q: 'Was passiert abends beim Japanischlernen?',
        options: ['Sie sieht fern.', 'Sie wird schnell müde.', 'Sie trinkt Kaffee.'],
        answer: 1,
      },
    ],
  },
  {
    id: 's-kazoku',
    title: 'Meine Familie',
    titleJp: '私の家族',
    level: 1,
    topic: 'family',
    sentences: [
      { jp: '私の家族は四人です。', kana: 'わたし の かぞく は よにん です。', de: 'Meine Familie hat vier Personen.' },
      { jp: '父と母と妹と私です。', kana: 'ちち と はは と いもうと と わたし です。', de: 'Vater, Mutter, meine kleine Schwester und ich.' },
      { jp: '父は料理が上手です。', kana: 'ちち は りょうり が じょうず です。', de: 'Mein Vater kocht gut.' },
      { jp: '母は毎朝走ります。', kana: 'はは は まいあさ はしります。', de: 'Meine Mutter geht jeden Morgen laufen.' },
      { jp: '妹は10歳で、猫が大好きです。', kana: 'いもうと は じゅっさい で、 ねこ が だいすき です。', de: 'Meine Schwester ist zehn und liebt Katzen.' },
      {
        jp: 'うちの猫のモチは、家で一番えらいです。',
        kana: 'うち の ねこ の モチ は、 いえ で いちばん えらい です。',
        de: 'Unsere Katze Mochi ist die Chefin im Haus.',
      },
    ],
    questions: [
      { q: 'Wie viele Personen hat die Familie?', options: ['Drei', 'Vier', 'Fünf'], answer: 1 },
      { q: 'Was kann der Vater gut?', options: ['Kochen', 'Laufen', 'Singen'], answer: 0 },
      { q: 'Wer ist die „Chefin“ im Haus?', options: ['Die Mutter', 'Die Schwester', 'Die Katze Mochi'], answer: 2 },
    ],
  },
  {
    id: 's-suupaa',
    title: 'Im Supermarkt',
    titleJp: 'スーパーで',
    level: 1,
    topic: 'shopping',
    sentences: [
      {
        jp: '今日、スーパーへ卵を買いに行きました。',
        kana: 'きょう、 スーパー へ たまご を かい に いきました。',
        de: 'Heute bin ich in den Supermarkt gegangen, um Eier zu kaufen.',
      },
      {
        jp: 'スーパーで、りんごとパンと牛乳を買いました。',
        kana: 'スーパー で、 りんご と パン と ぎゅうにゅう を かいました。',
        de: 'Im Supermarkt habe ich Äpfel, Brot und Milch gekauft.',
      },
      { jp: 'アイスも一つ買いました。', kana: 'アイス も ひとつ かいました。', de: 'Ein Eis habe ich auch gekauft.' },
      { jp: '全部で800円でした。', kana: 'ぜんぶ で はっぴゃくえん でした。', de: 'Alles zusammen kostete 800 Yen.' },
      { jp: '家に帰って、袋を開けました。', kana: 'いえ に かえって、 ふくろ を あけました。', de: 'Ich kam nach Hause und machte die Tüte auf.' },
      { jp: 'あれ？卵がありません！', kana: 'あれ？ たまご が ありません！', de: 'Huch? Keine Eier!' },
    ],
    questions: [
      {
        q: 'Warum ging die Person in den Supermarkt?',
        options: ['Um Eis zu essen', 'Um Eier zu kaufen', 'Um Freunde zu treffen'],
        answer: 1,
      },
      { q: 'Wie viel hat sie insgesamt bezahlt?', options: ['500 Yen', '800 Yen', '1.000 Yen'], answer: 1 },
      {
        q: 'Was ist das Problem am Ende?',
        options: ['Das Eis ist geschmolzen.', 'Die Tüte ist kaputt.', 'Sie hat keine Eier gekauft.'],
        answer: 2,
      },
    ],
  },
  {
    id: 's-shuumatsu',
    title: 'Kens Wochenende',
    titleJp: 'ケンさんの週末',
    level: 1,
    topic: 'hobby',
    sentences: [
      {
        jp: '土曜日、ケンさんは友だちと公園へ行きました。',
        kana: 'どようび、 ケン さん は ともだち と こうえん へ いきました。',
        de: 'Am Samstag ging Ken mit einem Freund in den Park.',
      },
      { jp: '天気がとてもよかったです。', kana: 'てんき が とても よかった です。', de: 'Das Wetter war sehr schön.' },
      { jp: '二人はサッカーをしました。', kana: 'ふたり は サッカー を しました。', de: 'Die beiden spielten Fußball.' },
      {
        jp: 'それから、公園でお弁当を食べました。',
        kana: 'それから、 こうえん で おべんとう を たべました。',
        de: 'Danach aßen sie im Park ihr Bento.',
      },
      { jp: '日曜日は雨でした。', kana: 'にちようび は あめ でした。', de: 'Am Sonntag regnete es.' },
      { jp: 'ケンさんは昼の12時まで寝ました。', kana: 'ケン さん は ひる の じゅうにじ まで ねました。', de: 'Ken schlief bis zwölf Uhr mittags.' },
    ],
    questions: [
      { q: 'Wohin ging Ken am Samstag?', options: ['In den Park', 'Ins Kino', 'Ans Meer'], answer: 0 },
      { q: 'Was haben die beiden gespielt?', options: ['Tennis', 'Fußball', 'Baseball'], answer: 1 },
      {
        q: 'Was machte Ken am Sonntag?',
        options: ['Er spielte wieder Fußball.', 'Er ging einkaufen.', 'Er schlief bis zwölf Uhr mittags.'],
        answer: 2,
      },
    ],
  },

  // ───────────────────────────── Level 2 ─────────────────────────────
  {
    id: 's-kyouto',
    title: 'Reise nach Kyoto',
    titleJp: '京都旅行',
    level: 2,
    topic: 'travel',
    sentences: [
      {
        jp: '先週、友だちと新幹線で京都へ行きました。',
        kana: 'せんしゅう、 ともだち と しんかんせん で きょうと へ いきました。',
        de: 'Letzte Woche bin ich mit einer Freundin mit dem Shinkansen nach Kyoto gefahren.',
      },
      {
        jp: '東京から京都まで、2時間ぐらいかかりました。',
        kana: 'とうきょう から きょうと まで、 にじかん ぐらい かかりました。',
        de: 'Von Tokio nach Kyoto hat es etwa zwei Stunden gedauert.',
      },
      { jp: 'まず、金閣寺を見に行きました。', kana: 'まず、 きんかくじ を み に いきました。', de: 'Zuerst haben wir uns den Kinkaku-ji angesehen.' },
      {
        jp: 'お寺は写真で見るより、ずっときれいでした。',
        kana: 'おてら は しゃしん で みる より、 ずっと きれい でした。',
        de: 'Der Tempel war viel schöner als auf Fotos.',
      },
      {
        jp: 'お昼は、有名なお店で湯豆腐を食べました。',
        kana: 'おひる は、 ゆうめい な おみせ で ゆどうふ を たべました。',
        de: 'Mittags haben wir in einem bekannten Lokal Yudofu (heißen Tofu) gegessen.',
      },
      {
        jp: '午後は、着物を着て町を歩きました。',
        kana: 'ごご は、 きもの を きて まち を あるきました。',
        de: 'Nachmittags sind wir im Kimono durch die Stadt spaziert.',
      },
      {
        jp: '着物は少し苦しかったですが、とても楽しかったです。',
        kana: 'きもの は すこし くるしかった です が、 とても たのしかった です。',
        de: 'Der Kimono war etwas eng, aber es hat großen Spaß gemacht.',
      },
      {
        jp: '夜、ホテルに帰ってから、足が痛くてすぐに寝てしまいました。',
        kana: 'よる、 ホテル に かえって から、 あし が いたくて すぐ に ねて しまいました。',
        de: 'Abends im Hotel taten mir die Füße weh und ich bin sofort eingeschlafen.',
      },
    ],
    questions: [
      {
        q: 'Wie lange dauerte die Fahrt von Tokio nach Kyoto?',
        options: ['Etwa eine Stunde', 'Etwa zwei Stunden', 'Etwa vier Stunden'],
        answer: 1,
      },
      { q: 'Was haben sie mittags gegessen?', options: ['Ramen', 'Sushi', 'Yudofu (heißen Tofu)', 'Tempura'], answer: 2 },
      {
        q: 'Wie war es im Kimono?',
        options: ['Etwas eng, aber sehr lustig', 'Zu kalt', 'Sehr bequem, aber langweilig'],
        answer: 0,
      },
    ],
  },
  {
    id: 's-hatsushukkin',
    title: 'Der erste Arbeitstag',
    titleJp: '初出勤',
    level: 2,
    topic: 'work',
    sentences: [
      { jp: '今日はアンナさんの初出勤の日です。', kana: 'きょう は アンナ さん の はつしゅっきん の ひ です。', de: 'Heute ist Annas erster Arbeitstag.' },
      {
        jp: 'アンナさんは緊張して、朝5時に起きてしまいました。',
        kana: 'アンナ さん は きんちょう して、 あさ ごじ に おきて しまいました。',
        de: 'Anna war so nervös, dass sie schon um fünf Uhr morgens wach war.',
      },
      {
        jp: '会社に着くと、部長が「おはよう。今日からよろしくね」と言いました。',
        kana: 'かいしゃ に つく と、 ぶちょう が 「おはよう。 きょう から よろしく ね」 と いいました。',
        de: 'In der Firma sagte der Abteilungsleiter: „Morgen! Auf gute Zusammenarbeit ab heute.“',
      },
      {
        jp: 'アンナさんは、みんなの前で自己紹介をしました。',
        kana: 'アンナ さん は、 みんな の まえ で じこしょうかい を しました。',
        de: 'Anna stellte sich vor allen vor.',
      },
      {
        jp: 'でも、緊張して、「おはようございます」の代わりに「おやすみなさい」と言ってしまいました。',
        kana: 'でも、 きんちょう して、 「おはよう ございます」 の かわり に 「おやすみなさい」 と いって しまいました。',
        de: 'Aber vor Aufregung sagte sie statt „Guten Morgen“ „Gute Nacht“.',
      },
      {
        jp: 'みんなは笑いましたが、そのおかげで、すぐに仲良くなりました。',
        kana: 'みんな は わらいました が、 その おかげ で、 すぐ に なかよく なりました。',
        de: 'Alle lachten – aber dadurch verstand sie sich sofort gut mit allen.',
      },
      {
        jp: '昼休みには、先輩の田中さんがおいしいお弁当屋さんを教えてくれました。',
        kana: 'ひるやすみ に は、 せんぱい の たなか さん が おいしい おべんとうやさん を おしえて くれました。',
        de: 'In der Mittagspause zeigte ihr die erfahrene Kollegin Frau Tanaka einen leckeren Bento-Laden.',
      },
      {
        jp: '帰りの電車で、アンナさんは「明日も頑張ろう」と思いました。',
        kana: 'かえり の でんしゃ で、 アンナ さん は 「あした も がんばろう」 と おもいました。',
        de: 'In der Bahn nach Hause dachte Anna: „Morgen gebe ich wieder mein Bestes.“',
      },
    ],
    questions: [
      {
        q: 'Warum war Anna schon um fünf Uhr wach?',
        options: ['Ihr Zug fuhr sehr früh.', 'Sie war nervös.', 'Ihre Katze hat sie geweckt.'],
        answer: 1,
      },
      {
        q: 'Was sagte Anna aus Versehen?',
        options: [
          '„Gute Nacht“ statt „Guten Morgen“',
          '„Auf Wiedersehen“ statt „Hallo“',
          '„Danke“ statt „Entschuldigung“',
        ],
        answer: 0,
      },
      {
        q: 'Was zeigte Frau Tanaka ihr in der Mittagspause?',
        options: ['Den Kopierer', 'Den Weg zum Bahnhof', 'Einen leckeren Bento-Laden'],
        answer: 2,
      },
    ],
  },
  {
    id: 's-amenohi',
    title: 'Ein Regentag',
    titleJp: '雨の日の傘',
    level: 2,
    topic: 'nature',
    sentences: [
      {
        jp: '今朝は晴れていたので、傘を持たないで出かけました。',
        kana: 'けさ は はれて いた ので、 かさ を もたない で でかけました。',
        de: 'Heute Morgen war es sonnig, deshalb bin ich ohne Schirm losgegangen.',
      },
      {
        jp: 'でも、午後から急に雨が降り出しました。',
        kana: 'でも、 ごご から きゅう に あめ が ふりだしました。',
        de: 'Aber am Nachmittag fing es plötzlich an zu regnen.',
      },
      { jp: '駅の出口で、私は困っていました。', kana: 'えき の でぐち で、 わたし は こまって いました。', de: 'Am Bahnhofsausgang stand ich ratlos da.' },
      {
        jp: 'コンビニまで走ろうと思いましたが、雨がとても強かったです。',
        kana: 'コンビニ まで はしろう と おもいました が、 あめ が とても つよかった です。',
        de: 'Ich wollte zum Konbini rennen, aber der Regen war sehr stark.',
      },
      {
        jp: 'すると、知らないおばあさんが「これ、使って」と傘をくれました。',
        kana: 'すると、 しらない おばあさん が 「これ、 つかって」 と かさ を くれました。',
        de: 'Da gab mir eine fremde ältere Frau einen Schirm und sagte: „Hier, nimm den.“',
      },
      {
        jp: '「おばあさんは大丈夫ですか」と聞くと、おばあさんはかばんからもう一本傘を出して、にっこり笑いました。',
        kana: '「おばあさん は だいじょうぶ です か」 と きく と、 おばあさん は かばん から もう いっぽん かさ を だして、 にっこり わらいました。',
        de: 'Als ich fragte: „Und Sie?“, holte sie einen zweiten Schirm aus der Tasche und lächelte.',
      },
      {
        jp: '次の日、私はその傘を返すために、同じ時間に駅へ行きました。',
        kana: 'つぎ の ひ、 わたし は その かさ を かえす ため に、 おなじ じかん に えき へ いきました。',
        de: 'Am nächsten Tag ging ich zur selben Zeit zum Bahnhof, um den Schirm zurückzugeben.',
      },
      { jp: 'でも、おばあさんには会えませんでした。', kana: 'でも、 おばあさん に は あえません でした。', de: 'Aber ich habe sie nicht wiedergetroffen.' },
      {
        jp: '今もその傘は、うちの玄関にあります。',
        kana: 'いま も その かさ は、 うち の げんかん に あります。',
        de: 'Der Schirm steht bis heute bei mir im Eingang.',
      },
    ],
    questions: [
      {
        q: 'Warum hatte die Person keinen Schirm dabei?',
        options: ['Morgens schien die Sonne.', 'Ihr Schirm war kaputt.', 'Sie hatte ihn im Zug vergessen.'],
        answer: 0,
      },
      {
        q: 'Wer gab ihr einen Schirm?',
        options: ['Ein Bahnangestellter', 'Eine fremde ältere Frau', 'Eine Freundin'],
        answer: 1,
      },
      {
        q: 'Was passierte am nächsten Tag?',
        options: ['Sie gab den Schirm zurück.', 'Es regnete wieder.', 'Sie traf die Frau nicht wieder.'],
        answer: 2,
      },
    ],
  },
  {
    id: 's-tanjoubi',
    title: 'Der Geburtstag',
    titleJp: '誕生日',
    level: 2,
    topic: 'feelings',
    sentences: [
      { jp: '今日は私の誕生日です。', kana: 'きょう は わたし の たんじょうび です。', de: 'Heute ist mein Geburtstag.' },
      {
        jp: 'でも、朝から誰も「おめでとう」と言ってくれません。',
        kana: 'でも、 あさ から だれ も 「おめでとう」 と いって くれません。',
        de: 'Aber seit dem Morgen hat mir niemand gratuliert.',
      },
      { jp: '家族も友だちも、いつもと同じです。', kana: 'かぞく も ともだち も、 いつも と おなじ です。', de: 'Familie und Freunde sind wie immer.' },
      {
        jp: '少しさびしい気持ちで、夜7時に家に帰りました。',
        kana: 'すこし さびしい きもち で、 よる しちじ に いえ に かえりました。',
        de: 'Etwas traurig kam ich um sieben Uhr abends nach Hause.',
      },
      { jp: 'ドアを開けると、部屋が真っ暗でした。', kana: 'ドア を あける と、 へや が まっくら でした。', de: 'Als ich die Tür öffnete, war es stockdunkel.' },
      {
        jp: '電気をつけると、みんなが「お誕生日おめでとう！」と言いました。',
        kana: 'でんき を つける と、 みんな が 「おたんじょうび おめでとう！」 と いいました。',
        de: 'Als ich das Licht anmachte, riefen alle: „Alles Gute zum Geburtstag!“',
      },
      {
        jp: '家族と友だちが、サプライズパーティーを準備してくれていたんです。',
        kana: 'かぞく と ともだち が、 サプライズ パーティー を じゅんび して くれて いた ん です。',
        de: 'Familie und Freunde hatten eine Überraschungsparty vorbereitet.',
      },
      {
        jp: 'ケーキには、ろうそくが30本も立っていました。',
        kana: 'ケーキ に は、 ろうそく が さんじゅっぽん も たって いました。',
        de: 'Auf dem Kuchen steckten ganze dreißig Kerzen.',
      },
      { jp: '火を消すのは、ちょっと大変でした。', kana: 'ひ を けす の は、 ちょっと たいへん でした。', de: 'Sie auszupusten war ganz schön anstrengend.' },
    ],
    questions: [
      {
        q: 'Wie fühlte sich die Person auf dem Heimweg?',
        options: ['Etwas traurig und einsam', 'Sehr müde', 'Wütend'],
        answer: 0,
      },
      {
        q: 'Was war los, als sie nach Hause kam?',
        options: [
          'Der Strom war ausgefallen.',
          'Familie und Freunde hatten eine Überraschungsparty vorbereitet.',
          'Ein Paket war angekommen.',
        ],
        answer: 1,
      },
      { q: 'Wie viele Kerzen waren auf dem Kuchen?', options: ['20', '30', '40'], answer: 1 },
    ],
  },

  // ───────────────────────────── Level 3 ─────────────────────────────
  {
    id: 's-hikkoshi',
    title: 'Umzug nach Osaka',
    titleJp: '大阪に引っ越して',
    level: 3,
    topic: 'home',
    sentences: [
      {
        jp: '先月、仕事の都合で東京から大阪に引っ越してきた。',
        kana: 'せんげつ、 しごと の つごう で とうきょう から おおさか に ひっこして きた。',
        de: 'Letzten Monat bin ich beruflich von Tokio nach Osaka gezogen.',
      },
      {
        jp: '同じ日本なのに、驚くことがたくさんある。',
        kana: 'おなじ にほん な のに、 おどろく こと が たくさん ある。',
        de: 'Obwohl es dasselbe Japan ist, überrascht mich vieles.',
      },
      {
        jp: 'まず、エスカレーターでは、東京と反対の右側に立つ。',
        kana: 'まず、 エスカレーター で は、 とうきょう と はんたい の みぎがわ に たつ。',
        de: 'Erstens: Auf der Rolltreppe steht man rechts – genau umgekehrt wie in Tokio.',
      },
      {
        jp: '最初の日、いつものように左に立っていたら、後ろの人に「すんません」と言われてしまった。',
        kana: 'さいしょ の ひ、 いつも の よう に ひだり に たって いたら、 うしろ の ひと に 「すんません」 と いわれて しまった。',
        de: 'Am ersten Tag stand ich wie gewohnt links, und jemand hinter mir sagte: „Tschuldigung!“',
      },
      {
        jp: 'それから、大阪の人はとにかくよく話しかけてくる。',
        kana: 'それから、 おおさか の ひと は とにかく よく はなしかけて くる。',
        de: 'Außerdem sprechen einen die Leute in Osaka ständig an.',
      },
      {
        jp: 'スーパーのレジで、知らないおばちゃんに「その大根、安かったやろ？」と聞かれた。',
        kana: 'スーパー の レジ で、 しらない おばちゃん に 「その だいこん、 やすかった やろ？」 と きかれた。',
        de: 'An der Supermarktkasse fragte mich eine fremde Frau: „Der Rettich war billig, oder?“',
      },
      {
        jp: '答えに困っていると、おばちゃんはかばんから飴を出して、「はい、飴ちゃん」とくれた。',
        kana: 'こたえ に こまって いる と、 おばちゃん は かばん から あめ を だして、 「はい、 あめちゃん」 と くれた。',
        de: 'Als ich nicht wusste, was ich sagen sollte, holte sie ein Bonbon aus der Tasche: „Hier, ein Bonbönchen.“',
      },
      {
        jp: '最初はびっくりしたけど、今はこの距離の近さが好きになった。',
        kana: 'さいしょ は びっくり した けど、 いま は この きょり の ちかさ が すき に なった。',
        de: 'Anfangs war ich verblüfft, aber inzwischen mag ich diese Nähe.',
      },
      {
        jp: '最近は、私もつい「ほんまに？」と言ってしまう。',
        kana: 'さいきん は、 わたし も つい 「ほんま に？」 と いって しまう。',
        de: 'Neuerdings rutscht mir selbst „Echt jetzt?“ auf Osaka-Dialekt heraus.',
      },
      {
        jp: 'でも、会社の人には「その関西弁、ちょっと変やで」と笑われている。',
        kana: 'でも、 かいしゃ の ひと に は 「その かんさいべん、 ちょっと へん や で」 と わらわれて いる。',
        de: 'Aber meine Kollegen lachen: „Dein Kansai-Dialekt klingt irgendwie komisch.“',
      },
    ],
    questions: [
      { q: 'Auf welcher Seite der Rolltreppe steht man in Osaka?', options: ['Links', 'Rechts', 'In der Mitte'], answer: 1 },
      {
        q: 'Was gab die fremde Frau im Supermarkt der Person?',
        options: ['Ein Bonbon', 'Einen Rettich', 'Einen Gutschein'],
        answer: 0,
      },
      {
        q: 'Was sagen die Kollegen über den Kansai-Dialekt der Person?',
        options: ['Er ist perfekt.', 'Er ist zu schnell.', 'Er klingt etwas komisch.'],
        answer: 2,
      },
    ],
  },
  {
    id: 's-gokai',
    title: 'Ein Missverständnis',
    titleJp: '小さな誤解',
    level: 3,
    topic: 'shopping',
    sentences: [
      {
        jp: 'マークさんは日本に来て、まだ一週間だ。',
        kana: 'マーク さん は にほん に きて、 まだ いっしゅうかん だ。',
        de: 'Mark ist erst seit einer Woche in Japan.',
      },
      {
        jp: 'ある日、コンビニで弁当と飲み物とお菓子をたくさん買った。',
        kana: 'ある ひ、 コンビニ で べんとう と のみもの と おかし を たくさん かった。',
        de: 'Eines Tages kaufte er im Konbini Bento, Getränke und jede Menge Süßigkeiten.',
      },
      {
        jp: '店員に「袋は大丈夫ですか」と聞かれて、マークさんは元気に「大丈夫です！」と答えた。',
        kana: 'てんいん に 「ふくろ は だいじょうぶ です か」 と きかれて、 マーク さん は げんき に 「だいじょうぶ です！」 と こたえた。',
        de: 'Der Verkäufer fragte: „Kommen Sie ohne Tüte klar?“, und Mark antwortete fröhlich: „Daijōbu desu!“',
      },
      {
        jp: 'マークさんは「はい、袋をください」という意味で言ったのだ。',
        kana: 'マーク さん は 「はい、 ふくろ を ください」 と いう いみ で いった の だ。',
        de: 'Er meinte damit: „Ja, bitte eine Tüte.“',
      },
      {
        jp: 'でも、店員は袋を出さずに、商品をそのまま渡してくれた。',
        kana: 'でも、 てんいん は ふくろ を ださず に、 しょうひん を その まま わたして くれた。',
        de: 'Doch der Verkäufer gab ihm die Sachen ohne Tüte.',
      },
      {
        jp: '日本語の「大丈夫です」は、「いりません」という意味にもなるのだ。',
        kana: 'にほんご の 「だいじょうぶ です」 は、 「いりません」 と いう いみ に も なる の だ。',
        de: 'Das japanische „Daijōbu desu“ kann nämlich auch „Brauche ich nicht“ bedeuten.',
      },
      {
        jp: 'マークさんは、両手いっぱいに弁当とお菓子を抱えて、家まで歩いた。',
        kana: 'マーク さん は、 りょうて いっぱい に べんとう と おかし を かかえて、 いえ まで あるいた。',
        de: 'Mark trug Bento und Süßigkeiten mit vollen Armen nach Hause.',
      },
      {
        jp: '途中でポテトチップスを一袋落としたが、拾う手がなかった。',
        kana: 'とちゅう で ポテトチップス を ひとふくろ おとした が、 ひろう て が なかった。',
        de: 'Unterwegs fiel ihm eine Tüte Chips herunter, aber er hatte keine Hand frei, um sie aufzuheben.',
      },
      {
        jp: '次の日から、マークさんは「袋、お願いします」とはっきり言うようにしている。',
        kana: 'つぎ の ひ から、 マーク さん は 「ふくろ、 おねがい します」 と はっきり いう よう に して いる。',
        de: 'Seitdem sagt Mark immer deutlich: „Eine Tüte, bitte.“',
      },
      { jp: 'ついでに、エコバッグも買った。', kana: 'ついで に、 エコバッグ も かった。', de: 'Und nebenbei hat er sich auch eine Einkaufstasche gekauft.' },
    ],
    questions: [
      {
        q: 'Was antwortete Mark auf die Frage nach der Tüte?',
        options: ['„Nein, danke.“', '„Daijōbu desu!“', '„Zwei Tüten, bitte.“'],
        answer: 1,
      },
      {
        q: 'Was kann „Daijōbu desu“ auf Japanisch auch bedeuten?',
        options: ['„Sehr gern“', '„Das ist zu teuer“', '„Brauche ich nicht“'],
        answer: 2,
      },
      {
        q: 'Was ist Mark auf dem Heimweg passiert?',
        options: ['Ihm sind Chips heruntergefallen.', 'Er hat sich verlaufen.', 'Er hat sein Bento gegessen.'],
        answer: 0,
      },
    ],
  },
  {
    id: 's-sentou',
    title: 'Zum ersten Mal im Sento',
    titleJp: '初めての銭湯',
    level: 3,
    topic: 'travel',
    sentences: [
      { jp: '先週末、初めて銭湯に行ってみた。', kana: 'せんしゅうまつ、 はじめて せんとう に いって みた。', de: 'Letztes Wochenende war ich zum ersten Mal in einem Sento.' },
      {
        jp: '入口で靴を脱いで、番台のおばあさんに550円を払った。',
        kana: 'いりぐち で くつ を ぬいで、 ばんだい の おばあさん に ごひゃくごじゅうえん を はらった。',
        de: 'Am Eingang zog ich die Schuhe aus und zahlte der alten Dame an der Kasse 550 Yen.',
      },
      {
        jp: '脱衣所で服を脱いだが、タオルをどこまで持っていっていいのか分からなかった。',
        kana: 'だついじょ で ふく を ぬいだ が、 タオル を どこ まで もって いって いい の か わからなかった。',
        de: 'In der Umkleide zog ich mich aus, wusste aber nicht, wie weit ich das Handtuch mitnehmen darf.',
      },
      {
        jp: '湯船に入ろうとすると、隣のおじいさんに「まず体を洗ってからね」と優しく言われた。',
        kana: 'ゆぶね に はいろう と する と、 となり の おじいさん に 「まず からだ を あらって から ね」 と やさしく いわれた。',
        de: 'Als ich ins Becken steigen wollte, sagte ein alter Herr freundlich: „Erst den Körper waschen, ja?“',
      },
      {
        jp: 'それから、タオルはお湯に入れないこと、髪が長い人は結ぶことなど、いろいろ教えてくれた。',
        kana: 'それから、 タオル は おゆ に いれない こと、 かみ が ながい ひと は むすぶ こと など、 いろいろ おしえて くれた。',
        de: 'Dann erklärte er mir noch einiges: Das Handtuch kommt nicht ins Wasser, lange Haare bindet man zusammen und so weiter.',
      },
      {
        jp: 'お湯はとても熱くて、最初は足を入れるだけで精一杯だった。',
        kana: 'おゆ は とても あつくて、 さいしょ は あし を いれる だけ で せいいっぱい だった。',
        de: 'Das Wasser war sehr heiß – anfangs schaffte ich gerade mal die Füße.',
      },
      {
        jp: 'おじいさんは平気な顔で肩まで入って、「これがいいんだよ」と笑っていた。',
        kana: 'おじいさん は へいき な かお で かた まで はいって、 「これ が いい ん だ よ」 と わらって いた。',
        de: 'Der alte Herr stieg seelenruhig bis zu den Schultern hinein und lachte: „Genau das ist das Schöne!“',
      },
      {
        jp: '壁には大きな富士山の絵が描いてあって、まるで外のお風呂みたいだった。',
        kana: 'かべ に は おおきな ふじさん の え が かいて あって、 まるで そと の おふろ みたい だった。',
        de: 'An der Wand war ein großer Fuji gemalt – fast wie in einem Freiluftbad.',
      },
      {
        jp: 'お風呂から上がると、おじいさんが「銭湯の後はこれだ」と、フルーツ牛乳をおごってくれた。',
        kana: 'おふろ から あがる と、 おじいさん が 「せんとう の あと は これ だ」 と、 フルーツぎゅうにゅう を おごって くれた。',
        de: 'Nach dem Bad spendierte er mir eine Fruchtmilch: „Nach dem Sento gehört das dazu.“',
      },
      {
        jp: '腰に手を当てて一気に飲むのが、正しい飲み方らしい。',
        kana: 'こし に て を あてて いっき に のむ の が、 ただしい のみかた らしい。',
        de: 'Angeblich trinkt man sie richtig, indem man die Hand in die Hüfte stemmt und sie in einem Zug leert.',
      },
      {
        jp: '体も心もぽかぽかになって、来週もまた来ようと思った。',
        kana: 'からだ も こころ も ぽかぽか に なって、 らいしゅう も また こよう と おもった。',
        de: 'Mir war innerlich und äußerlich ganz warm, und ich beschloss, nächste Woche wiederzukommen.',
      },
    ],
    questions: [
      {
        q: 'Was soll man laut dem alten Herrn zuerst tun?',
        options: ['Ein Handtuch kaufen', 'Den Körper waschen', 'Kaltes Wasser trinken'],
        answer: 1,
      },
      { q: 'Was war an der Wand gemalt?', options: ['Ein Kirschbaum', 'Ein Tiger', 'Der Berg Fuji'], answer: 2 },
      {
        q: 'Was trank die Person nach dem Bad?',
        options: ['Fruchtmilch', 'Bier', 'Grünen Tee', 'Wasser'],
        answer: 0,
      },
    ],
  },
  {
    id: 's-teiji',
    title: 'Feierabend',
    titleJp: 'ノー残業デー',
    level: 3,
    topic: 'work',
    sentences: [
      {
        jp: '中村さんの会社では、最近「ノー残業デー」が始まった。',
        kana: 'なかむら さん の かいしゃ で は、 さいきん 「ノー ざんぎょう デー」 が はじまった。',
        de: 'In Nakamuras Firma gibt es seit Kurzem einen „Tag ohne Überstunden“.',
      },
      {
        jp: '毎週水曜日は、6時までに帰らなければならない。',
        kana: 'まいしゅう すいようび は、 ろくじ まで に かえらなければ ならない。',
        de: 'Jeden Mittwoch muss man bis sechs Uhr gehen.',
      },
      {
        jp: 'でも、初めてのノー残業デー、6時になっても誰も席を立たなかった。',
        kana: 'でも、 はじめて の ノー ざんぎょう デー、 ろくじ に なって も だれ も せき を たたなかった。',
        de: 'Doch am ersten „Tag ohne Überstunden“ stand um sechs niemand auf.',
      },
      {
        jp: 'みんな、部長が帰るのを待っているのだ。',
        kana: 'みんな、 ぶちょう が かえる の を まって いる の だ。',
        de: 'Alle warteten nämlich darauf, dass der Abteilungsleiter geht.',
      },
      {
        jp: '部長はパソコンの画面をじっと見たまま、全然動かない。',
        kana: 'ぶちょう は パソコン の がめん を じっと みた まま、 ぜんぜん うごかない。',
        de: 'Der Abteilungsleiter starrte auf seinen Bildschirm und rührte sich nicht.',
      },
      {
        jp: '6時半、中村さんは勇気を出して立ち上がり、「お先に失礼します」と言った。',
        kana: 'ろくじはん、 なかむら さん は ゆうき を だして たちあがり、 「おさき に しつれい します」 と いった。',
        de: 'Um halb sieben fasste Nakamura Mut, stand auf und sagte: „Ich verabschiede mich dann.“',
      },
      { jp: 'オフィスが一瞬、静かになった。', kana: 'オフィス が いっしゅん、 しずか に なった。', de: 'Im Büro wurde es einen Moment lang still.' },
      {
        jp: 'すると、部長がほっとした顔で「よかった。実は私も、誰かが先に帰るのを待っていたんだよ」と言った。',
        kana: 'すると、 ぶちょう が ほっと した かお で 「よかった。 じつ は わたし も、 だれか が さき に かえる の を まって いた ん だ よ」 と いった。',
        de: 'Da sagte der Abteilungsleiter erleichtert: „Zum Glück! Ehrlich gesagt habe ich auch darauf gewartet, dass jemand als Erstes geht.“',
      },
      {
        jp: '部長のパソコンの画面には、明日の天気予報が映っていただけだった。',
        kana: 'ぶちょう の パソコン の がめん に は、 あした の てんきよほう が うつって いた だけ だった。',
        de: 'Auf seinem Bildschirm war übrigens nur die Wettervorhersage für morgen zu sehen.',
      },
      { jp: '5分後、オフィスには誰もいなくなった。', kana: 'ごふんご、 オフィス に は だれ も いなく なった。', de: 'Fünf Minuten später war das Büro leer.' },
      {
        jp: 'それ以来、水曜日の6時になると、部長が一番に「お先に！」と帰っていく。',
        kana: 'それ いらい、 すいようび の ろくじ に なる と、 ぶちょう が いちばん に 「おさき に！」 と かえって いく。',
        de: 'Seitdem ist mittwochs um sechs der Chef der Erste, der „Bis morgen!“ ruft und geht.',
      },
    ],
    questions: [
      {
        q: 'Warum blieben um sechs Uhr alle sitzen?',
        options: ['Sie hatten noch viel Arbeit.', 'Sie warteten darauf, dass der Chef geht.', 'Draußen regnete es.'],
        answer: 1,
      },
      {
        q: 'Was war auf dem Bildschirm des Chefs zu sehen?',
        options: ['Eine wichtige E-Mail', 'Ein Videospiel', 'Die Wettervorhersage'],
        answer: 2,
      },
      {
        q: 'Was macht der Chef seitdem mittwochs um sechs?',
        options: ['Er geht als Erster nach Hause.', 'Er macht Überstunden.', 'Er hält eine Besprechung ab.'],
        answer: 0,
      },
    ],
  },
];
