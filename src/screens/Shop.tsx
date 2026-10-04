// Laden: Yen aus der Reisekasse gegen Streak-Schutz, Farbthemen und Souvenirs tauschen.
import { useState } from 'react';
import { say } from '../components/Audio';
import { Header } from '../components/ui';
import { MAX_FREEZES, SHOP, THEMES, type ShopItem } from '../lib/game';
import { sfx } from '../lib/sfx';
import { buy, canBuy, updateSettings, useAppState } from '../lib/store';

export function Shop() {
  const state = useAppState();
  const [msg, setMsg] = useState<string | null>(null);

  const purchase = (item: ShopItem) => {
    if (buy(item.id)) {
      sfx.coin();
      setMsg(`${item.icon} ${item.name} gekauft!`);
      if (item.jp) void say(item.jp.jp);
    }
  };

  const section = (kind: ShopItem['kind']) => SHOP.filter((i) => i.kind === kind);
  const owned = (id: string) => state.owned.includes(id);

  return (
    <>
      <Header title="Laden" subtitle="お店 · Belohnungen für deinen Fleiß" right={<span className="yen-chip">¥{state.coins.toLocaleString('de-DE')}</span>} />
      <p className="muted small">
        Yen verdienst du mit jedem XP (1 XP = ¥1), mit Tagesquests, der Tageskiste, Abzeichen und Reise-Stempeln.
      </p>
      {msg && <div className="feedback feedback-ok mb">{msg}</div>}

      <div className="section-title">Streak-Schutz</div>
      <div className="card row gap">
        <span className="shop-icon">❄️</span>
        <div className="grow">
          <b>Streak-Schutz</b>
          <div className="muted small">
            Rettet deine Serie, wenn du einen Tag verpasst. Du hast {state.freezes}/{MAX_FREEZES}.
          </div>
        </div>
        <button className="btn btn-small btn-primary" disabled={!canBuy(state, 'freeze')} onClick={() => purchase(section('freeze')[0])}>
          ¥500
        </button>
      </div>

      <div className="section-title">Farben</div>
      <div className="shop-grid">
        <div className="shop-item">
          <span className="shop-icon">🔴</span>
          <b>{THEMES.beni}</b>
          <button className="btn btn-small" disabled={state.settings.accent === 'beni'} onClick={() => updateSettings({ accent: 'beni' })}>
            {state.settings.accent === 'beni' ? 'Aktiv' : 'Anwenden'}
          </button>
        </div>
        {section('theme').map((item) => {
          const id = item.id.replace('theme-', '');
          return (
            <div key={item.id} className="shop-item">
              <span className="shop-icon">{item.icon}</span>
              <b>{THEMES[id]}</b>
              {owned(item.id) ? (
                <button className="btn btn-small" disabled={state.settings.accent === id} onClick={() => updateSettings({ accent: id })}>
                  {state.settings.accent === id ? 'Aktiv' : 'Anwenden'}
                </button>
              ) : (
                <button className="btn btn-small btn-primary" disabled={!canBuy(state, item.id)} onClick={() => purchase(item)}>
                  ¥{item.price}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="section-title">Souvenirs für deinen Reisekoffer</div>
      <div className="shop-grid">
        {section('souvenir').map((item) => (
          <div key={item.id} className="shop-item">
            <button className="shop-icon" style={{ border: 0, background: 'transparent' }} onClick={() => item.jp && say(item.jp.jp)} aria-label={`${item.name} anhören`}>
              {item.icon}
            </button>
            <b>{item.name}</b>
            {item.jp && (
              <span className="small muted" lang="ja">
                {item.jp.jp}（{item.jp.kana}）
              </span>
            )}
            {owned(item.id) ? (
              <span className="chip chip-ok">Im Koffer ✓</span>
            ) : (
              <button className="btn btn-small btn-primary" disabled={!canBuy(state, item.id)} onClick={() => purchase(item)}>
                ¥{item.price}
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
