// Belohnungen sichtbar machen: Toasts (Quest, Abzeichen, Combo) und Feier-Dialoge (Level, Stempel, Tageskiste).
import { useEffect } from 'react';
import { units } from '../data/curriculum';
import { dismiss, useCelebrations, type Celebration } from '../lib/celebrate';
import { stationFor } from '../lib/progress';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sfx';
import { SpeakButton } from './Audio';
import { Confetti } from './Confetti';
import { JpText } from './ui';

const MODAL_KINDS: Celebration['kind'][] = ['level', 'stamp', 'chest'];

function Toast({ c, onDone }: { c: Celebration & { uid: number }; onDone: () => void }) {
  useEffect(() => {
    if (c.kind === 'combo') sfx.combo();
    else sfx.coin();
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, []);
  let icon = '✨';
  let text = '';
  let reward: number | undefined;
  switch (c.kind) {
    case 'quest':
      icon = c.icon;
      text = `Quest geschafft: ${c.text}`;
      reward = c.reward;
      break;
    case 'achievement':
      icon = c.icon;
      text = `Abzeichen: ${c.title}`;
      reward = c.reward;
      break;
    case 'goal':
      icon = '🎯';
      text = 'Tagesziel erreicht! すごい！';
      break;
    case 'combo':
      icon = '⚡';
      text = `${c.n}er-Serie! +${c.bonus} XP`;
      break;
    case 'freeze':
      icon = '❄️';
      text = `Streak-Schutz hat deine Serie gerettet (${c.used} Tag${c.used > 1 ? 'e' : ''})`;
      break;
  }
  return (
    <button className="toast" onClick={onDone}>
      <span className="toast-icon">{icon}</span>
      <span className="grow">{text}</span>
      {reward !== undefined && <span className="yen-chip">+¥{reward}</span>}
    </button>
  );
}

function Modal({ c, onDone }: { c: Celebration & { uid: number }; onDone: () => void }) {
  useEffect(() => {
    sfx.fanfare();
  }, []);
  const unit = c.kind === 'stamp' ? units.find((u) => u.id === c.unitId) : undefined;
  const station = unit ? stationFor(unit) : undefined;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <Confetti />
      <div className="modal card">
        {c.kind === 'level' && (
          <>
            <div className="modal-icon">{c.icon}</div>
            <div className="muted small">Level-Up!</div>
            <h2>Level {c.level}</h2>
            <p>
              Rang: <b>{c.rankDe}</b> <span lang="ja">（{c.rankJp}）</span>
            </p>
            <div className="yen-chip">+¥100</div>
          </>
        )}
        {c.kind === 'chest' && (
          <>
            <div className="modal-icon">🎁</div>
            <h2>Alle Tagesquests geschafft!</h2>
            <p className="muted">Die Tageskiste ist offen.</p>
            <div className="yen-chip">+¥{c.reward}</div>
          </>
        )}
        {c.kind === 'stamp' && station && (
          <>
            <div className="stamp stamp-big">
              <span>{station.emoji}</span>
              <small lang="ja">{station.jp}</small>
            </div>
            <div className="muted small">Neuer Stempel · Einheit „{unit?.title}“ geschafft</div>
            <h2>Willkommen in {station.name}!</h2>
            <p className="small">{station.fact}</p>
            <div className="card row gap" style={{ textAlign: 'left', boxShadow: 'none' }}>
              <SpeakButton text={station.phrase.jp} size="sm" />
              <JpText s={station.phrase} size="sm" showDe />
            </div>
            <div className="yen-chip">+¥300</div>
          </>
        )}
        <div className="col gap mt">
          <button className="btn btn-primary btn-block" onClick={onDone}>
            Weiter
          </button>
          {c.kind === 'stamp' && (
            <button
              className="btn btn-block btn-ghost"
              onClick={() => {
                onDone();
                navigate('/profile');
              }}
            >
              Zum Stempelheft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CelebrationLayer() {
  const queue = useCelebrations();
  const modal = queue.find((c) => MODAL_KINDS.includes(c.kind));
  const toasts = queue.filter((c) => !MODAL_KINDS.includes(c.kind)).slice(0, 3);
  return (
    <>
      <div className="toasts" aria-live="polite">
        {toasts.map((c) => (
          <Toast key={c.uid} c={c} onDone={() => dismiss(c.uid)} />
        ))}
      </div>
      {modal && <Modal key={modal.uid} c={modal} onDone={() => dismiss(modal.uid)} />}
    </>
  );
}
