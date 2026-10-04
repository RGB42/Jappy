// Virtuelle Reise durch Japan: Jede abgeschlossene Einheit des Lernpfads bringt dich
// zur nächsten Station – mit Stempel fürs Stempelheft (wie die echten 駅スタンプ an Bahnhöfen).
import type { Sentence } from './types';

export interface Station {
  id: string;
  name: string; // Deutsch
  jp: string;
  emoji: string;
  fact: string; // kurzer Fakt (1 Satz)
  phrase: Sentence; // passender Ausdruck für diesen Ort
}

export const stations: Station[] = [
  {
    id: 'tokyo',
    name: 'Tokio',
    jp: '東京',
    emoji: '🗼',
    fact: 'Der Großraum Tokio ist mit rund 37 Millionen Menschen die größte Metropolregion der Welt.',
    phrase: { jp: 'はじめまして。', kana: 'はじめまして。', de: 'Freut mich, Sie kennenzulernen.' },
  },
  {
    id: 'asakusa',
    name: 'Asakusa',
    jp: '浅草',
    emoji: '🏮',
    fact: 'Der Sensō-ji in Asakusa ist der älteste Tempel Tokios – berühmt für seine riesige rote Laterne.',
    phrase: { jp: '写真を撮ってもいいですか。', kana: 'しゃしん を とって も いい です か。', de: 'Darf ich ein Foto machen?' },
  },
  {
    id: 'akihabara',
    name: 'Akihabara',
    jp: '秋葉原',
    emoji: '🎮',
    fact: 'In Akihabara reihen sich Elektronikläden, Spielhallen und Anime-Shops über mehrere Stockwerke.',
    phrase: { jp: 'これはいくらですか。', kana: 'これ は いくら です か。', de: 'Was kostet das?' },
  },
  {
    id: 'tsukiji',
    name: 'Tsukiji',
    jp: '築地',
    emoji: '🍣',
    fact: 'Auf dem äußeren Markt von Tsukiji gibt es frisches Sushi schon zum Frühstück.',
    phrase: { jp: 'おすすめは何ですか。', kana: 'おすすめ は なん です か。', de: 'Was empfehlen Sie?' },
  },
  {
    id: 'kamakura',
    name: 'Kamakura',
    jp: '鎌倉',
    emoji: '🗿',
    fact: 'Der Große Buddha von Kamakura ist über 11 Meter hoch und sitzt seit dem 13. Jahrhundert unter freiem Himmel.',
    phrase: { jp: '駅はどこですか。', kana: 'えき は どこ です か。', de: 'Wo ist der Bahnhof?' },
  },
  {
    id: 'hakone',
    name: 'Hakone',
    jp: '箱根',
    emoji: '♨️',
    fact: 'In Hakone badet man in heißen Quellen (Onsen) – bei gutem Wetter mit Blick auf den Fuji.',
    phrase: { jp: '気持ちいいですね。', kana: 'きもち いい です ね。', de: 'Das fühlt sich gut an, nicht wahr?' },
  },
  {
    id: 'fuji',
    name: 'Fuji',
    jp: '富士山',
    emoji: '🗻',
    fact: 'Der Fuji ist mit 3776 Metern Japans höchster Berg – im Sommer steigen Tausende nachts zum Sonnenaufgang hinauf.',
    phrase: { jp: 'きれいですね。', kana: 'きれい です ね。', de: 'Wie schön!' },
  },
  {
    id: 'nagoya',
    name: 'Nagoya',
    jp: '名古屋',
    emoji: '🏯',
    fact: 'Auf dem Dach der Burg von Nagoya glänzen zwei goldene Fabelfische, die Shachihoko.',
    phrase: { jp: '次の電車は何時ですか。', kana: 'つぎ の でんしゃ は なんじ です か。', de: 'Um wie viel Uhr fährt der nächste Zug?' },
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    jp: '京都',
    emoji: '⛩️',
    fact: 'Am Fushimi-Inari-Schrein führen Tausende rote Torii-Tore den Berg hinauf.',
    phrase: { jp: 'ここで靴を脱ぎますか。', kana: 'ここ で くつ を ぬぎます か。', de: 'Zieht man hier die Schuhe aus?' },
  },
  {
    id: 'nara',
    name: 'Nara',
    jp: '奈良',
    emoji: '🦌',
    fact: 'Im Nara-Park leben über tausend zahme Hirsche – manche verbeugen sich für einen Keks.',
    phrase: { jp: 'かわいい！', kana: 'かわいい！', de: 'Wie süß!' },
  },
  {
    id: 'osaka',
    name: 'Osaka',
    jp: '大阪',
    emoji: '🐙',
    fact: 'Osaka gilt als „Küche der Nation“ – probier Takoyaki und Okonomiyaki in Dōtonbori.',
    phrase: { jp: 'おいしい！', kana: 'おいしい！', de: 'Lecker!' },
  },
  {
    id: 'himeji',
    name: 'Himeji',
    jp: '姫路',
    emoji: '🏯',
    fact: 'Die strahlend weiße Burg Himeji wird „Weißer Reiher“ genannt und ist Weltkulturerbe.',
    phrase: { jp: '入り口はどこですか。', kana: 'いりぐち は どこ です か。', de: 'Wo ist der Eingang?' },
  },
  {
    id: 'hiroshima',
    name: 'Hiroshima',
    jp: '広島',
    emoji: '🕊️',
    fact: 'Der Friedenspark in Hiroshima erinnert an 1945 – heute ist die Stadt auch für ihr Okonomiyaki bekannt.',
    phrase: { jp: 'ゆっくり話してください。', kana: 'ゆっくり はなして ください。', de: 'Bitte sprechen Sie langsam.' },
  },
  {
    id: 'miyajima',
    name: 'Miyajima',
    jp: '宮島',
    emoji: '⛩️',
    fact: 'Bei Flut scheint das große rote Torii von Miyajima auf dem Meer zu schwimmen.',
    phrase: { jp: 'フェリー乗り場はどこですか。', kana: 'フェリー のりば は どこ です か。', de: 'Wo ist der Fähranleger?' },
  },
  {
    id: 'fukuoka',
    name: 'Fukuoka',
    jp: '福岡',
    emoji: '🍜',
    fact: 'In Fukuoka isst man abends Tonkotsu-Ramen an kleinen Straßenständen, den Yatai.',
    phrase: { jp: 'ラーメンを一つください。', kana: 'ラーメン を ひとつ ください。', de: 'Eine Ramen, bitte.' },
  },
  {
    id: 'kanazawa',
    name: 'Kanazawa',
    jp: '金沢',
    emoji: '🌸',
    fact: 'Kanazawa hat einen der drei schönsten Gärten Japans und vergoldet sogar Eiscreme mit Blattgold.',
    phrase: { jp: 'お土産を探しています。', kana: 'おみやげ を さがして います。', de: 'Ich suche ein Mitbringsel.' },
  },
  {
    id: 'shirakawago',
    name: 'Shirakawa-gō',
    jp: '白川郷',
    emoji: '🏡',
    fact: 'Die Bauernhäuser von Shirakawa-gō haben steile Strohdächer, die wie zum Gebet gefaltete Hände aussehen.',
    phrase: { jp: '一泊いくらですか。', kana: 'いっぱく いくら です か。', de: 'Was kostet eine Nacht?' },
  },
  {
    id: 'nikko',
    name: 'Nikkō',
    jp: '日光',
    emoji: '🐒',
    fact: 'In Nikkō stammen die berühmten drei Affen: nichts Böses sehen, hören, sagen.',
    phrase: { jp: 'もう一度お願いします。', kana: 'もう いちど おねがい します。', de: 'Noch einmal, bitte.' },
  },
  {
    id: 'sapporo',
    name: 'Sapporo',
    jp: '札幌',
    emoji: '❄️',
    fact: 'Beim Schneefestival in Sapporo stehen jeden Februar riesige Skulpturen aus Eis und Schnee.',
    phrase: { jp: '寒いですね。', kana: 'さむい です ね。', de: 'Kalt, nicht wahr?' },
  },
  {
    id: 'okinawa',
    name: 'Okinawa',
    jp: '沖縄',
    emoji: '🏝️',
    fact: 'Okinawa ist subtropisch: weiße Strände, Korallenriffe und eine eigene Kultur und Sprache.',
    phrase: { jp: 'ありがとうございました！', kana: 'ありがとう ございました！', de: 'Vielen Dank (für alles)!' },
  },
];
