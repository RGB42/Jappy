// Allgemeine UI-Bausteine.
import { useState, type ReactNode } from 'react';
import type { Sentence } from '../data/types';
import { toRomaji } from '../lib/kana';
import { back } from '../lib/router';
import { useSettings } from '../lib/store';
import { Icon } from './Icon';

const hasKanji = (s: string) => /[一-鿿々]/.test(s);

/**
 * Zeigt japanischen Text gemäß Einstellungen (Kana / Kanji+Kana / Kanji, optional Romaji).
 * `hidden`: Audio-first – Text erst auf Wunsch einblenden.
 */
export function JpText({
  s,
  size = 'md',
  hidden = false,
  showDe = false,
  center = false,
}: {
  s: Sentence;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hidden?: boolean;
  showDe?: boolean;
  center?: boolean;
}) {
  const settings = useSettings();
  const [revealed, setRevealed] = useState(false);
  if (hidden && !revealed) {
    return (
      <button type="button" className={`reveal ${center ? 'center' : ''}`} onClick={() => setRevealed(true)}>
        <Icon name="eye" size={18} /> Text zeigen
      </button>
    );
  }
  const kanaOnly = s.kana.replace(/ /g, '');
  const kanji = hasKanji(s.jp);
  // Nur-Kana-Modus (Einsteiger): Wortgrenzen als Leerzeichen sichtbar lassen.
  const main = settings.script === 'kana' ? s.kana : s.jp;
  const sub = settings.script === 'both' && kanji ? kanaOnly : null;
  return (
    <div className={`jp-text jp-${size} ${center ? 'center' : ''}`}>
      {sub && (
        <div className="jp-sub" lang="ja">
          {sub}
        </div>
      )}
      <div className="jp-main" lang="ja">
        {main}
      </div>
      {settings.romaji && <div className="romaji">{s.romaji ?? toRomaji(s.kana)}</div>}
      {showDe && <div className="de">{s.de}</div>}
    </div>
  );
}

export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: (() => void) | false;
  right?: ReactNode;
}) {
  return (
    <header className="page-header">
      {onBack !== false && (
        <button className="icon-btn" onClick={onBack ?? (() => back())} aria-label="Zurück">
          <Icon name="back" size={26} />
        </button>
      )}
      <div className="page-header-title">
        <h1>{title}</h1>
        {subtitle && <div className="muted small">{subtitle}</div>}
      </div>
      {right}
    </header>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemax={max} aria-label={label}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({ value, max, size = 64, children }: { value: number; max: number; size?: number; children?: ReactNode }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = max ? Math.min(1, value / max) : 0;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" strokeWidth={7} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-fg"
          strokeWidth={7}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  );
}

export function Tile({
  icon,
  title,
  desc,
  onClick,
  badge,
  tone,
}: {
  icon: ReactNode;
  title: string;
  desc?: string;
  onClick: () => void;
  badge?: ReactNode;
  tone?: 'red' | 'blue' | 'green' | 'gold' | 'purple';
}) {
  return (
    <button type="button" className={`tile ${tone ? `tone-${tone}` : ''}`} onClick={onClick}>
      <span className="tile-icon">{icon}</span>
      <span className="tile-body">
        <span className="tile-title">{title}</span>
        {desc && <span className="tile-desc">{desc}</span>}
      </span>
      {badge !== undefined && <span className="badge">{badge}</span>}
    </button>
  );
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

/** Abschluss-Bildschirm einer Übung. */
export function Finish({
  title = 'Geschafft!',
  score,
  xp,
  children,
}: {
  title?: string;
  score?: number;
  xp?: number;
  children?: ReactNode;
}) {
  return (
    <div className="finish">
      <div className="finish-emoji">{score === undefined || score >= 0.8 ? '🎉' : score >= 0.5 ? '👍' : '💪'}</div>
      <h2>{title}</h2>
      {score !== undefined && <div className="finish-score">{Math.round(score * 100)} %</div>}
      {xp !== undefined && <div className="xp-chip">+{xp} XP</div>}
      {children}
    </div>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="tab"
          aria-selected={o.value === value}
          className={o.value === value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
