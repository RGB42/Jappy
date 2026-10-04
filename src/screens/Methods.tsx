// Die Lernkonzepte hinter Jappy – kurz und konkret.
import { Header } from '../components/ui';
import { navigate } from '../lib/router';

export const METHODS = [
  {
    icon: '👂',
    title: 'Hören zuerst',
    theory: 'Input-Hypothese (Krashen), natürlicher Spracherwerb',
    text: 'Kinder hören monatelang, bevor sie sprechen und lesen. Wer den Klang zuerst verankert, spricht später natürlicher.',
    how: 'Jede neue Karte startet mit Audio, der Text kommt erst danach („Erst hören, dann lesen“).',
    to: '/listen',
  },
  {
    icon: '🗣️',
    title: 'Shadowing',
    theory: 'Shadowing-Technik (Arguelles), Imitationslernen',
    text: 'Gleichzeitiges Nachsprechen trainiert Aussprache, Rhythmus und Satzmelodie – und das Hörverstehen gleich mit.',
    how: 'Endlosschleife, Aufnahme deiner Stimme und direkter Vergleich mit dem Original.',
    to: '/shadow',
  },
  {
    icon: '🎤',
    title: 'Sprechen von Anfang an',
    theory: 'Output-Hypothese (Swain)',
    text: 'Erst beim Sprechen merkst du, was dir noch fehlt. Lautes Sprechen verankert Wörter zusätzlich motorisch.',
    how: 'Fast jede Übung hat ein Mikrofon mit sofortigem Feedback durch Spracherkennung.',
    to: '/review',
  },
  {
    icon: '🧠',
    title: 'Aktives Abrufen',
    theory: 'Testing-Effekt (Roediger & Karpicke)',
    text: 'Etwas aus dem Gedächtnis hervorzuholen festigt es stärker als erneutes Lesen oder Hören.',
    how: 'Sprechkarten: Du siehst Deutsch und sagst die Antwort, bevor du sie hörst.',
    to: '/review',
  },
  {
    icon: '📈',
    title: 'Verteilte Wiederholung',
    theory: 'Vergessenskurve (Ebbinghaus), SM-2-Algorithmus',
    text: 'Wiederholen kurz vor dem Vergessen spart Zeit und bringt Wissen ins Langzeitgedächtnis.',
    how: 'Jede Karte bekommt ihren eigenen Abstand: 1 Tag, 3 Tage, eine Woche, ein Monat …',
    to: '/review',
  },
  {
    icon: '🎧',
    title: 'Pimsleur-Prinzip',
    theory: 'Antizipation & gestaffelte Intervalle (Pimsleur)',
    text: 'Eine Frage, eine Pause zum Antworten, dann die Lösung. Neues kommt nach wachsenden Abständen wieder.',
    how: 'Freihändige Audio-Lektionen mit Rückwärtsaufbau langer Sätze – ideal unterwegs.',
    to: '/audio',
  },
  {
    icon: '🧱',
    title: 'Chunks statt Einzelwörter',
    theory: 'Lexical Approach (Lewis), Chunking',
    text: 'Feste Ausdrücke wie おねがいします werden als Ganzes gespeichert und sind sofort einsetzbar.',
    how: 'Phrasen, Dialogzeilen und Beispielsätze werden wie Vokabeln gelernt und wiederholt.',
    to: '/words',
  },
  {
    icon: '🎭',
    title: 'Lernen durch echte Aufgaben',
    theory: 'Aufgabenbasiertes Lernen (TBLT), Erfahrungslernen (Kolb)',
    text: 'Sprache bleibt hängen, wenn du sie für etwas benutzt: bestellen, nach dem Weg fragen, telefonieren.',
    how: 'Rollenspiele: Die App spielt die eine Rolle, du sprichst die andere – mit Hilfen bei Bedarf.',
    to: '/dialogues',
  },
  {
    icon: '🧩',
    title: 'Ausprobieren statt Regeln pauken',
    theory: 'Entdeckendes Lernen, sofortiges Feedback',
    text: 'Grammatik wird als Muster erlebt: viele Beispiele hören, dann selbst Sätze bauen und sofort hören, ob es stimmt.',
    how: 'Satzbau-Puzzle mit Vorlesefunktion; Erklärungen sind maximal drei Sätze lang.',
    to: '/grammar',
  },
  {
    icon: '🖼️',
    title: 'Klang + Bild verknüpfen',
    theory: 'Duale Kodierung (Paivio), Mnemotechnik',
    text: 'Was über zwei Kanäle gespeichert wird, ist leichter abrufbar.',
    how: 'Kana mit Eselsbrücken, die Form und Klang verbinden; Zeichen hören, sehen und selbst schreiben.',
    to: '/kana',
  },
  {
    icon: '🎵',
    title: 'Ohrtraining',
    theory: 'Phonologische Wahrnehmung, Minimalpaare',
    text: 'Im Japanischen ändern lange Vokale und Doppelkonsonanten die Bedeutung (おばさん ≠ おばあさん).',
    how: 'Minimalpaar-Training: Welches der beiden Wörter hast du gehört?',
    to: '/pairs',
  },
  {
    icon: '📻',
    title: 'Verstehbarer Input (i+1)',
    theory: 'Comprehensible Input (Krashen)',
    text: 'Geschichten knapp über deinem Niveau – den Rest erschließt du aus dem Zusammenhang.',
    how: 'Hörgeschichten: erst ohne Text hören, Fragen beantworten, dann mit Text nachhören.',
    to: '/stories',
  },
  {
    icon: '🔀',
    title: 'Mischen & wünschenswerte Erschwernisse',
    theory: 'Interleaving (Bjork)',
    text: 'Abwechslung zwischen Übungsarten fühlt sich schwerer an, wirkt aber nachhaltiger als Blocklernen.',
    how: 'Der Lernpfad wechselt zwischen Hören, Sprechen, Lesen, Schreiben und Grammatik.',
    to: '/path',
  },
  {
    icon: '🔥',
    title: 'Kleine Portionen, feste Gewohnheit',
    theory: 'Microlearning, Gewohnheitsschleife (Auslöser → Routine → Belohnung)',
    text: '10 Minuten täglich schlagen 2 Stunden am Wochenende. Lerneinheiten mit 6 neuen Ausdrücken überfordern nicht.',
    how: 'Tagesziel, Serie mit Streak-Schutz, drei Tagesquests und eine Tageskiste als Belohnung.',
    to: '/',
  },
  {
    icon: '🎯',
    title: 'Persönliches Ziel mit Datum',
    theory: 'Zielsetzungstheorie (Locke & Latham)',
    text: 'Konkrete, terminierte Ziele motivieren deutlich stärker als „ein bisschen Japanisch lernen“.',
    how: 'Dein Ziel (z. B. Japan-Urlaub) mit Countdown, Plan, Prognose und „Ich kann …“-Checkliste.',
    to: '/goal',
  },
  {
    icon: '📅',
    title: 'Wenn-dann-Pläne',
    theory: 'Implementation Intentions (Gollwitzer)',
    text: '„Wenn es 19 Uhr ist, übe ich Japanisch.“ Ein fester Auslöser macht das Üben fast automatisch.',
    how: 'Tägliche Erinnerung als Kalendertermin zu deiner Wunsch-Uhrzeit.',
    to: '/goal',
  },
  {
    icon: '🎮',
    title: 'Spielerisch dranbleiben',
    theory: 'Selbstbestimmungstheorie (Deci & Ryan), Gamification',
    text: 'Motivation wächst mit Autonomie, Kompetenzerleben und sichtbarem Fortschritt.',
    how: 'Level & Ränge, Yen-Reisekasse, Abzeichen, Hör-Blitz und eine Reise durch Japan mit Stempelheft.',
    to: '/profile',
  },
];

export function Methods() {
  return (
    <>
      <Header title="Wie Jappy lehrt" subtitle="Die Lernkonzepte hinter der App" />
      <p className="muted">
        Du lernst am besten durch <b>Hören, Sprechen und Ausprobieren</b>. Darauf ist Jappy aufgebaut – Lesen ist Unterstützung,
        nicht Ausgangspunkt.
      </p>
      <div className="stack">
        {METHODS.map((m) => (
          <div key={m.title} className="card method-card">
            <h3>
              <span>{m.icon}</span> {m.title}
            </h3>
            <div className="muted small">{m.theory}</div>
            <p className="mt" style={{ marginBottom: 6 }}>
              {m.text}
            </p>
            <p className="small" style={{ marginBottom: 8 }}>
              <b>In Jappy:</b> {m.how}
            </p>
            <button className="btn btn-small" onClick={() => navigate(m.to)}>
              Ausprobieren →
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
