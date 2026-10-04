// Eselsbrücken für die 46 Grundzeichen: Die Form des Zeichens wird mit seinem Klang verknüpft.
// Katakana greifen, wo möglich, das Bild der passenden Hiragana wieder auf.
import type { KanaMnemonic } from './types';

export const hiraganaMnemonics: KanaMnemonic[] = [
  { kana: 'あ', hint: '„A“-nker: Querbalken, senkrechter Schaft und unten der geschwungene Ankerbogen.' },
  { kana: 'い', hint: 'Zwei aufrechte Striche nebeneinander – wie zwei kleine „i“ ohne Punkt.' },
  { kana: 'う', hint: 'Ein „U“-hu im Profil: oben das Federohr, darunter der runde Bauch.' },
  { kana: 'え', hint: 'Eine „E“-nte mit Federtupfer auf dem Kopf, die mit dem Schwanz wackelt.' },
  { kana: 'お', hint: 'Unten eine fast runde Schlaufe wie ein „O“, daneben ein Spritzer – „Oh!“' },

  { kana: 'か', hint: 'Ein „Ka“-ratekämpfer mit angewinkeltem Arm, daneben fliegt sein Kampfschrei.' },
  { kana: 'き', hint: 'Eine junge „Ki“-efer: zwei Äste quer über dem Stamm, unten die gebogene Wurzel.' },
  { kana: 'く', hint: '„Ku“-ckuck! Der weit geöffnete Schnabel eines rufenden Vogels.' },
  { kana: 'け', hint: 'Links ein Pfosten, rechts ein „Ke“-scher mit Querstange und langem Stiel.' },
  { kana: 'こ', hint: 'Zwei Stück „Ko“-hle liegen übereinander auf dem Grill.' },

  { kana: 'さ', hint: 'Mit der „Sä“-ge wurde bei き ein Querast abgesägt – übrig bleibt „sa“.' },
  { kana: 'し', hint: 'Ein „Schi“ von der Seite: unten biegt sich die Spitze nach oben.' },
  { kana: 'す', hint: '„Su“-ppe: Der Löffel taucht senkrecht ein und rührt unten eine Schlaufe.' },
  { kana: 'せ', hint: 'Eine Bank am „See“: lange Sitzfläche, zwei Beine, eines knickt nach außen.' },
  { kana: 'そ', hint: 'Oben ein Zickzack, unten ein Bogen – „So“-ße, die aus der Flasche kleckert.' },

  { kana: 'た', hint: 'Links ein kleines „t“, rechts zwei Striche wie ein angedeutetes „a“ – zusammen „ta“.' },
  { kana: 'ち', hint: 'Eine „Chi“-lischote: oben der Stiel, unten krümmt sie sich zum Bauch.' },
  { kana: 'つ', hint: 'Eine einzige große Welle rollt heran – „Tsu“-nami!' },
  { kana: 'て', hint: 'Ein großes „T“, dessen Stiel sich zur Seite biegt – „te“.' },
  { kana: 'と', hint: 'Eine „To“-rte: oben steckt schräg die Kerze, darunter der geschwungene Rand.' },

  { kana: 'な', hint: 'Links kreuzt eine „Na“-del, rechts unten hat sie einen Knoten genäht.' },
  { kana: 'に', hint: 'Links ein Bein, rechts zwei Pflaster fürs aufgeschlagene „Knie“ („ni“).' },
  { kana: 'ぬ', hint: 'Ein Bündel „Nu“-deln, das sich am Ende zu einer Schlaufe ringelt.' },
  { kana: 'ね', hint: '„Ne“-ssie: links der lange Hals, rechts die Buckel und ein eingerollter Schwanz.' },
  { kana: 'の', hint: 'Wie ein Verbotsschild – ein Kreis mit Schrägstrich: „Nö!“' },

  { kana: 'は', hint: 'Links ein Pfosten, rechts hängt ein „Ha“-ken mit verknotetem Seil.' },
  { kana: 'ひ', hint: 'Ein breites Grinsen – jemand kichert „hi-hi-hi“.' },
  { kana: 'ふ', hint: 'Ein „Fu“-ßballer im Sprung: Kopf oben, der Körper dreht sich, links und rechts die Arme.' },
  { kana: 'へ', hint: 'Ein Hügel: kurz „he“-rauf, dann lange wieder hinunter.' },
  { kana: 'ほ', hint: 'Wie は mit einem Stockwerk mehr – ein „Ho“-chhaus.' },

  { kana: 'ま', hint: 'Ein Schiffs-„Ma“-st mit zwei Querstangen, unten ist das Tau verknotet.' },
  { kana: 'み', hint: 'Do-Re-„Mi“: die Schlaufe ist der Notenkopf, der Strich rechts ein Taktstrich.' },
  { kana: 'む', hint: 'Die Kuh macht „Muh“: Kreuz und Schlaufe sind ihr Kopf, der Punkt ist eine Fliege.' },
  { kana: 'め', hint: 'Ein Auge mit Wimpernstrich – und „Auge“ heißt auf Japanisch tatsächlich „me“ (目).' },
  { kana: 'も', hint: 'Ein Angelhaken mit zwei Ködern – „Mo“-rgens beißen die Fische am besten.' },

  { kana: 'や', hint: 'Eine „Ya“-cht mit geblähtem Segel und schrägem Mast.' },
  { kana: 'ゆ', hint: 'Ein „U“-Boot von vorn – mit dem Periskop in der Mitte wird daraus „yu“.' },
  { kana: 'よ', hint: 'Ein „Jo“-jo: oben der Finger, unten dreht sich die Schnur in einer Schlaufe.' },

  { kana: 'ら', hint: 'Eine „Ra“-upe reckt das Köpfchen hoch und krümmt den Rücken.' },
  { kana: 'り', hint: 'Ein Zwerg und ein „Ri“-ese nebeneinander: links kurz, rechts lang.' },
  { kana: 'る', hint: 'Eine „Ru“-tsche im Zickzack mit Looping am Ende.' },
  { kana: 'れ', hint: 'Links ein Wanderstock, rechts ein Bein, das weit ausschreitet – ein „Re“-nnläufer.' },
  { kana: 'ろ', hint: 'Wie る, nur ohne Looping – die „Ro“-ute endet offen.' },

  { kana: 'わ', hint: 'Ein „Wa“-l taucht auf: links die Fontäne, rechts der runde Rücken.' },
  { kana: 'を', hint: 'Ein Kellner mit Tablett stolpert: „Oh!“ – gesprochen wird を wie „o“.' },
  { kana: 'ん', hint: 'Sieht aus wie ein schwungvoll geschriebenes „n“ – und klingt auch so.' },
];

export const katakanaMnemonics: KanaMnemonic[] = [
  { kana: 'ア', hint: 'Eine „A“-ngel: oben die Rute mit Knick, nach unten hängt die Schnur.' },
  { kana: 'イ', hint: 'Ein müdes „I“: ein schräger Strich lehnt sich an einen geraden.' },
  { kana: 'ウ', hint: 'Wie う mit Dach – der „U“-hu sitzt jetzt in seiner Hütte.' },
  { kana: 'エ', hint: 'Querschnitt einer „E“-isenbahnschiene: schmaler Kopf, Steg, breiter Fuß.' },
  { kana: 'オ', hint: 'Wie お ohne Schlaufe und Spritzer – nur das „O“-Gerüst aus Kreuz und Schrägstrich bleibt.' },

  { kana: 'カ', hint: 'Wie か ohne Kampfschrei – nur noch der kantige „Ka“-rate-Arm.' },
  { kana: 'キ', hint: 'Wie き ohne Wurzel – ein kahler „Ki“-efernstamm mit zwei Ästen.' },
  { kana: 'ク', hint: 'Wie く mit Dach – der „Ku“-ckuck schaut aus seiner Uhr.' },
  { kana: 'ケ', hint: 'Sieht aus wie ein schiefes „K“ – „K“ wie „ke“.' },
  { kana: 'コ', hint: 'Die zwei Striche von こ, rechts eckig verbunden – ein aufgeklappter „Ko“-ffer.' },

  { kana: 'サ', hint: 'Ein „Sä“-gebock: Querbalken auf zwei Beinen, eins davon geschwungen.' },
  { kana: 'シ', hint: 'Ein „Schi“-lift: der lange Strich fährt von unten nach oben, links warten zwei Skifahrer.' },
  { kana: 'ス', hint: 'Ein Läufer im Spagatsprung – „Su“-per, wie weit er die Beine streckt!' },
  { kana: 'セ', hint: 'Wie せ in kantig – dieselbe Bank am „See“, nur mit einem Bein weniger.' },
  { kana: 'ソ', hint: 'Ein Tropfen und ein langer Strahl „So“-ße – beide laufen von oben nach unten.' },

  { kana: 'タ', hint: 'Wie ク, aber mit einem Strich darin – eine gefüllte „Ta“-sche.' },
  { kana: 'チ', hint: 'Eine „Chi“-lischote am Strauch: oben ein Blatt, dann der Querast, der Stiel krümmt sich.' },
  { kana: 'ツ', hint: 'Drei Tropfen oben, der lange Strich stürzt von oben herab – wie ein „Tsu“-nami.' },
  { kana: 'テ', hint: 'Ein „Te“-legrafenmast mit zwei Querbalken.' },
  { kana: 'ト', hint: 'Ein Pfosten mit Fähnchen – das Zeichen für „To“-r!' },

  { kana: 'ナ', hint: 'Das Kreuz von な ganz allein – eine „Na“-del ohne Faden.' },
  { kana: 'ニ', hint: 'Wie に ohne Bein – nur die zwei Pflaster vom „Knie“ („ni“) bleiben.' },
  { kana: 'ヌ', hint: 'Ein Essstäbchen sticht quer durch die „Nu“-deln.' },
  { kana: 'ネ', hint: 'Eine „Ne“-lke: Knospe oben, Blüte, Stängel und zwei Blätter unten.' },
  { kana: 'ノ', hint: 'Nur der Schrägstrich aus dem Verbotsschild von の – immer noch „Nö!“' },

  { kana: 'ハ', hint: 'Ein Scheitel: die „Ha“-are fallen links und rechts herab.' },
  { kana: 'ヒ', hint: 'Ein Mund von der Seite, der „hi-hi“ kichert: Oberlippe kurz, Unterlippe lang.' },
  { kana: 'フ', hint: 'Ein abgeknickter Strohhalm – „Fuuu“, so pustet man hindurch.' },
  { kana: 'ヘ', hint: 'Genau wie へ: kurz „he“-rauf, lange wieder hinunter.' },
  { kana: 'ホ', hint: 'Ein „Ho“-chspannungsmast: Querträger oben, zwei Streben unten.' },

  { kana: 'マ', hint: 'Ein „Ma“-rtiniglas, leicht schräg gehalten.' },
  { kana: 'ミ', hint: 'Drei Schnurrhaare der „Mi“-eze.' },
  { kana: 'ム', hint: 'Eine Kuhnase von vorn – und die Kuh sagt „Muh“.' },
  { kana: 'メ', hint: 'Zwei gekreuzte „Me“-sser – genau das Kreuz, das auch in め steckt.' },
  { kana: 'モ', hint: 'Wie も, nur kantig: der Angelhaken, „mo“-rgens mit zwei Ködern bestückt.' },

  { kana: 'ヤ', hint: 'Wie や, nur kantiger – dieselbe „Ya“-cht mit Segel und Mast.' },
  { kana: 'ユ', hint: 'Ein auf die Seite gekipptes „U“ mit langem Unterstrich – „yu“.' },
  { kana: 'ヨ', hint: 'Ein „E“, das sich beim „Yo“-ga spiegelverkehrt verbogen hat.' },

  { kana: 'ラ', hint: 'Wie ら in kantig: oben der Fühler, darunter der gekrümmte Rücken der „Ra“-upe.' },
  { kana: 'リ', hint: 'Wie り, nur gerader: der Zwerg und der „Ri“-ese stehen stramm.' },
  { kana: 'ル', hint: 'Zwei Beine, das rechte kickt nach oben – ein „Ru“-gbyspieler beim Schuss.' },
  { kana: 'レ', hint: 'Ein Häkchen auf der „Re“-chnung: erledigt!' },
  { kana: 'ロ', hint: 'Ein quadratischer „Ro“-boterkopf.' },

  { kana: 'ワ', hint: 'Ein „Wa“-sserhahn: kurzes Rohr, dann biegt sich der Hahn nach unten.' },
  { kana: 'ヲ', hint: 'Eine „7“ mit Gürtel – „Oh, schick!“; gesprochen wie „o“, aber selten benutzt.' },
  { kana: 'ン', hint: 'Ein Tropfen und ein Schwung von unten nach oben – wie das Ende eines geschriebenen „n“.' },
];
