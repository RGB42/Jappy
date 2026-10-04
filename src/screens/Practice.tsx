// Übersicht aller Übungsformen – sortiert nach Hören, Sprechen, Ausprobieren.
import { Header, Tile } from '../components/ui';
import { navigate } from '../lib/router';
import { dueCards, useAppState } from '../lib/store';

export function Practice() {
  const state = useAppState();
  const due = dueCards(state).length;
  return (
    <>
      <Header title="Üben" subtitle="Wähle, worauf du gerade Lust hast" onBack={false} />

      <div className="section-title">Wiederholen</div>
      <div className="tiles">
        <Tile icon="🔁" tone="red" title="Wiederholungen" desc="Hör- und Sprechkarten kurz vor dem Vergessen" badge={due || undefined} onClick={() => navigate('/review')} />
      </div>

      <div className="section-title">👂 Hören</div>
      <div className="tiles tiles-2">
        <Tile icon="🎧" tone="blue" title="Audio-Lektion" desc="Freihändig, Pimsleur-Prinzip" onClick={() => navigate('/audio')} />
        <Tile icon="👂" tone="blue" title="Hörtraining" desc="Wörter & Sätze verstehen" onClick={() => navigate('/listen')} />
        <Tile icon="📻" tone="blue" title="Hörgeschichten" desc="Zuhören & verstehen" onClick={() => navigate('/stories')} />
        <Tile icon="🎵" tone="blue" title="Minimalpaare" desc="Feine Unterschiede hören" onClick={() => navigate('/pairs')} />
        <Tile icon="⏱️" tone="gold" title="Hör-Blitz" desc={`60 Sekunden · Rekord ${state.records.blitzBest}`} onClick={() => navigate('/blitz')} />
      </div>

      <div className="section-title">🎤 Sprechen</div>
      <div className="tiles tiles-2">
        <Tile icon="🗣️" tone="red" title="Shadowing" desc="Mitsprechen wie ein Echo" onClick={() => navigate('/shadow')} />
        <Tile icon="🎭" tone="red" title="Rollenspiele" desc="Alltagssituationen spielen" onClick={() => navigate('/dialogues')} />
      </div>

      <div className="section-title">🧩 Ausprobieren</div>
      <div className="tiles tiles-2">
        <Tile icon="🧱" tone="green" title="Satzbau" desc="Sätze aus Bausteinen" onClick={() => navigate('/build', { level: state.level })} />
        <Tile icon="📐" tone="green" title="Grammatik-Muster" desc="Hören & anwenden" onClick={() => navigate('/grammar')} />
        <Tile icon="あ" tone="gold" title="Hiragana" desc="Hören, lesen, schreiben" onClick={() => navigate('/kana', { script: 'hiragana' })} />
        <Tile icon="ア" tone="gold" title="Katakana" desc="Für Lehnwörter" onClick={() => navigate('/kana', { script: 'katakana' })} />
      </div>

      <div className="section-title">📚 Mehr</div>
      <div className="tiles">
        <Tile icon="🎯" tone="purple" title="Mein Ziel" desc="Countdown, Plan, Reise-Checkliste" onClick={() => navigate('/goal')} />
        <Tile icon="🛍️" tone="gold" title="Laden" desc={`¥${state.coins.toLocaleString('de-DE')} in der Reisekasse`} onClick={() => navigate('/shop')} />
        <Tile icon="📖" tone="purple" title="Wortschatz" desc="Alle Wörter & Ausdrücke nach Thema – antippen und hören" onClick={() => navigate('/words')} />
        <Tile icon="🧠" tone="purple" title="Wie Jappy lehrt" desc="Die Lernmethoden hinter der App" onClick={() => navigate('/methods')} />
      </div>
    </>
  );
}
