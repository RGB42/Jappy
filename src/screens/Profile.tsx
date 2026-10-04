// Profil: Level & Rang, Reisekasse, Stempelheft, Abzeichen, Reisekoffer, Aktivität, Statistik.
import { useState } from 'react';
import { SpeakButton, say } from '../components/Audio';
import { Header, JpText, ProgressBar } from '../components/ui';
import { units } from '../data/curriculum';
import { stations } from '../data/stations';
import { ACHIEVEMENTS, SHOP, levelInfo, totalXP } from '../lib/game';
import { GOAL_TEMPLATES, forecast } from '../lib/goal';
import { isUnitComplete, stationFor } from '../lib/progress';
import { DAY, dayKey } from '../lib/srs';
import { navigate } from '../lib/router';
import { currentStreak, useAppState } from '../lib/store';
import { StatsSections } from './Stats';

export function Profile() {
  const state = useAppState();
  const xp = totalXP(state);
  const lvl = levelInfo(xp);
  const streak = currentStreak(state);
  const [station, setStation] = useState<string | null>(null);
  const journey = units.map((u) => ({ unit: u, station: stationFor(u), done: isUnitComplete(state, u) }));
  const stamps = journey.filter((j) => j.done).length;
  const unlocked = ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length;
  const souvenirs = SHOP.filter((i) => i.kind === 'souvenir' && state.owned.includes(i.id));
  const selected = stations.find((s) => s.id === station);
  const goalF = state.goal ? forecast(state.goal, state) : null;

  // Aktivität der letzten 5 Wochen (Montag bis Sonntag)
  const today = new Date();
  const offset = (today.getDay() + 6) % 7;
  const days = Array.from({ length: 35 }, (_, i) => {
    const ts = Date.now() - (34 - 6 + offset - i) * DAY;
    const key = dayKey(ts);
    const v = state.xp[key] ?? 0;
    const goal = state.settings.dailyGoal;
    return { key, future: ts > Date.now() + 1000, level: v === 0 ? 0 : v < goal / 2 ? 1 : v < goal ? 2 : 3 };
  });

  return (
    <>
      <Header title="Profil" onBack={false} right={<button className="btn btn-small" onClick={() => navigate('/settings')}>⚙︎</button>} />

      <div className="card tone-red stack">
        <div className="row gap">
          <div style={{ fontSize: '3rem', lineHeight: 1 }}>{lvl.rank.icon}</div>
          <div className="grow">
            <div style={{ fontWeight: 800, fontSize: '1.3rem' }}>Level {lvl.level}</div>
            <div className="muted">
              {lvl.rank.de} · <span lang="ja">{lvl.rank.jp}</span>
            </div>
          </div>
          <SpeakButton text={lvl.rank.kana} size="sm" />
        </div>
        <div>
          <div className="row between small">
            <span className="muted">Nächstes Level</span>
            <span>
              {lvl.into} / {lvl.span} XP
            </span>
          </div>
          <div className="progress" style={{ background: 'rgb(255 255 255 / 25%)' }}>
            <div className="progress-fill" style={{ width: `${(lvl.into / lvl.span) * 100}%`, background: '#fff' }} />
          </div>
        </div>
      </div>

      <div className="stat-grid mt">
        <button className="stat" style={{ textAlign: 'left' }} onClick={() => navigate('/shop')}>
          <div className="stat-value">¥{state.coins.toLocaleString('de-DE')}</div>
          <div className="stat-label">Reisekasse · zum Laden →</div>
        </button>
        <div className="stat">
          <div className="stat-value">
            🔥 {streak} {state.freezes > 0 && <span className="small">❄️×{state.freezes}</span>}
          </div>
          <div className="stat-label">Tage in Folge</div>
        </div>
      </div>

      {state.goal && goalF && (
        <button className="card row gap btn-block mt" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => navigate('/goal')}>
          <span style={{ fontSize: '1.8rem' }}>{GOAL_TEMPLATES[state.goal.type].icon}</span>
          <span className="grow">
            <b>{state.goal.title}</b>
            <div className="muted small">
              noch {Math.max(0, goalF.daysLeft)} Tage · {goalF.done}/{goalF.total} Schritte
            </div>
            <ProgressBar value={goalF.done} max={goalF.total} />
          </span>
        </button>
      )}

      <div className="section-title">Stempelheft · {stamps}/{journey.length}</div>
      <div className="card">
        <p className="muted small" style={{ marginTop: 0 }}>
          Jede abgeschlossene Einheit im Lernpfad bringt dich zur nächsten Station deiner Japan-Reise.
        </p>
        <div className="stamp-grid">
          {journey.map(({ unit, station: st, done }) => (
            <button
              key={unit.id}
              style={{ border: 0, background: 'transparent', padding: 0 }}
              onClick={() => (done ? setStation(st.id === station ? null : st.id) : navigate('/path'))}
              aria-label={done ? st.name : `${st.name} (noch nicht erreicht)`}
            >
              <span className={`stamp ${done ? '' : 'locked'}`}>
                <span>{st.emoji}</span>
                <small>{st.jp}</small>
              </span>
              <div className="stamp-label">{done ? st.name : '?'}</div>
            </button>
          ))}
        </div>
        {selected && (
          <div className="card mt stack" style={{ boxShadow: 'none' }}>
            <b>
              {selected.emoji} {selected.name} <span lang="ja">{selected.jp}</span>
            </b>
            <span className="small">{selected.fact}</span>
            <div className="row gap">
              <SpeakButton text={selected.phrase.jp} size="sm" />
              <JpText s={selected.phrase} size="sm" showDe />
            </div>
          </div>
        )}
      </div>

      <div className="section-title">
        Abzeichen · {unlocked}/{ACHIEVEMENTS.length}
      </div>
      <div className="badge-grid">
        {ACHIEVEMENTS.map((a) => (
          <div key={a.id} className={`ach ${state.achievements[a.id] ? '' : 'locked'}`} title={a.desc}>
            <span className="ach-icon" lang="ja">
              {a.icon}
            </span>
            <b>{a.title}</b>
            <span className="muted">{a.desc}</span>
          </div>
        ))}
      </div>

      <div className="section-title">Reisekoffer · {souvenirs.length} Souvenirs</div>
      <div className="card">
        {souvenirs.length ? (
          <>
            <div className="suitcase">
              {souvenirs.map((i) => (
                <button key={i.id} title={i.name} onClick={() => i.jp && say(i.jp.jp)} aria-label={i.name}>
                  {i.icon}
                </button>
              ))}
            </div>
            <p className="muted small" style={{ marginBottom: 0 }}>
              Tippe ein Souvenir an, um seinen japanischen Namen zu hören.
            </p>
          </>
        ) : (
          <p className="muted small" style={{ margin: 0 }}>
            Noch leer. Im <button className="btn btn-small" onClick={() => navigate('/shop')}>Laden</button> kannst du Souvenirs mit
            deinen Yen kaufen.
          </p>
        )}
      </div>

      <div className="section-title">Aktivität · letzte 5 Wochen</div>
      <div className="card">
        <div className="heatmap">
          {['M', 'D', 'M', 'D', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="muted small center">
              {d}
            </span>
          ))}
          {days.map((d) => (
            <span
              key={d.key}
              className={`heat ${d.future ? '' : `l${d.level}`} ${d.key === dayKey() ? 'today' : ''}`}
              style={d.future ? { opacity: 0.3 } : undefined}
              title={d.key}
            />
          ))}
        </div>
      </div>

      <StatsSections />
    </>
  );
}
