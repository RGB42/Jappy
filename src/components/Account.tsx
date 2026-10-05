// Online-Konto: anmelden/registrieren, Sync-Status, Fortschritt zwischen Handy und PC abgleichen.
import { useEffect, useState, type FormEvent } from 'react';
import { cloudConfigured } from '../lib/cloud';
import {
  deleteAccount,
  describe,
  login,
  logout,
  register,
  rename,
  resetPassword,
  resolveChoice,
  setNewPassword,
  syncNow,
  useSyncStatus,
  type Summary,
} from '../lib/sync';

function ago(ts: number): string {
  if (!ts) return 'noch nie';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return 'gerade eben';
  if (s < 3600) return `vor ${Math.round(s / 60)} Min.`;
  if (s < 86400) return `vor ${Math.round(s / 3600)} Std.`;
  return new Date(ts).toLocaleDateString('de-DE');
}

/** Aktualisiert die „vor x Min.“-Anzeige regelmäßig. */
function useTick(ms: number) {
  const [, set] = useState(0);
  useEffect(() => {
    const t = setInterval(() => set((x) => x + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
}

export function AccountCard({ compact = false }: { compact?: boolean }) {
  const st = useSyncStatus();
  useTick(30_000);

  if (!cloudConfigured()) {
    if (compact) return null;
    return (
      <div className="card stack">
        <b>☁️ Geräte-Synchronisierung</b>
        <p className="muted small">
          Noch nicht eingerichtet. Sobald ein Online-Speicher verbunden ist (siehe README, Abschnitt „Synchronisierung“),
          kannst du dich hier anmelden und auf Handy und PC mit demselben Stand lernen. Bis dahin: Export/Import unten.
        </p>
      </div>
    );
  }

  if (st.needsNewPassword) return <NewPassword />;
  if (st.phase === 'choose' && st.choice) return <Choose local={st.choice.local} remote={st.choice.remote} />;
  if (!st.user) return <SignIn compact={compact} error={st.error} notice={st.notice} />;
  return <Profile />;
}

function Profile() {
  const st = useSyncStatus();
  const user = st.user!;
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name ?? '');
  const [err, setErr] = useState<string | null>(null);
  const label = user.name || user.email.split('@')[0];

  const state =
    st.phase === 'syncing'
      ? { icon: '🔄', text: 'Synchronisiere …', cls: '' }
      : st.phase === 'offline'
        ? { icon: '📴', text: 'Offline – Änderungen werden später übertragen', cls: 'text-warn' }
        : st.phase === 'error'
          ? { icon: '⚠️', text: st.error ?? 'Fehler beim Synchronisieren', cls: 'text-bad' }
          : { icon: '✅', text: `Synchronisiert · ${ago(st.lastSync)}`, cls: 'text-ok' };

  return (
    <div className="card stack">
      <div className="row gap">
        <div className="avatar" aria-hidden>
          {label.slice(0, 1).toUpperCase()}
        </div>
        <div className="grow" style={{ minWidth: 0 }}>
          {editing ? (
            <form
              className="row gap-s"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await rename(name);
                  setEditing(false);
                } catch (x) {
                  setErr(describe(x));
                }
              }}
            >
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dein Name" autoFocus />
              <button className="btn btn-small btn-primary">OK</button>
            </form>
          ) : (
            <button className="link-btn account-name" onClick={() => setEditing(true)} title="Namen ändern">
              {label} ✏️
            </button>
          )}
          <div className="muted small ellipsis">{user.email}</div>
        </div>
      </div>
      <div className={`small ${state.cls}`} aria-live="polite">
        {state.icon} {state.text}
      </div>
      {st.notice && <div className="feedback feedback-info">{st.notice}</div>}
      {err && <div className="feedback feedback-bad">{err}</div>}
      <p className="muted small">Dein Fortschritt wird automatisch auf allen Geräten mit diesem Konto abgeglichen.</p>
      <div className="row gap wrap">
        <button className="btn grow" disabled={st.phase === 'syncing'} onClick={() => void syncNow()}>
          🔄 Jetzt synchronisieren
        </button>
        <button
          className="btn grow"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await logout();
            setBusy(false);
          }}
        >
          Abmelden
        </button>
      </div>
      <button
        className="btn btn-ghost btn-small text-bad"
        onClick={async () => {
          if (!confirm('Konto und Online-Daten endgültig löschen? Der Fortschritt auf diesem Gerät bleibt erhalten.')) return;
          try {
            await deleteAccount();
          } catch (x) {
            setErr(describe(x));
          }
        }}
      >
        Konto löschen
      </button>
    </div>
  );
}

function SignIn({ compact, error, notice }: { compact: boolean; error?: string; notice?: string }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(error ? { ok: false, text: error } : notice ? { ok: true, text: notice } : null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'login') await login(email, password);
      else if (!(await register(email, password, name)))
        setMsg({ ok: true, text: 'Fast geschafft! Bestätige deine E-Mail über den Link im Postfach – danach bist du angemeldet.' });
    } catch (x) {
      setMsg({ ok: false, text: describe(x) });
    }
    setBusy(false);
  };

  const forgot = async () => {
    if (!email.includes('@')) {
      setMsg({ ok: false, text: 'Bitte zuerst deine E-Mail-Adresse eingeben.' });
      return;
    }
    try {
      await resetPassword(email);
      setMsg({ ok: true, text: 'E-Mail zum Zurücksetzen verschickt. Öffne den Link auf diesem Gerät.' });
    } catch (x) {
      setMsg({ ok: false, text: describe(x) });
    }
  };

  return (
    <form className="card stack" onSubmit={submit}>
      <b>☁️ {compact ? 'Mit deinem Konto anmelden' : 'Konto – auf Handy und PC weiterlernen'}</b>
      {!compact && (
        <p className="muted small">
          Mit einem kostenlosen Konto wird dein Fortschritt online gespeichert und zwischen deinen Geräten abgeglichen.
        </p>
      )}
      <div className="segmented" role="tablist">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
          Anmelden
        </button>
        <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
          Registrieren
        </button>
      </div>
      {mode === 'register' && (
        <input type="text" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" />
      )}
      <input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      <input
        type="password"
        placeholder={mode === 'register' ? 'Passwort (mind. 6 Zeichen)' : 'Passwort'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
      />
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? '…' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
      </button>
      {mode === 'login' && (
        <button type="button" className="link-btn small" onClick={forgot}>
          Passwort vergessen?
        </button>
      )}
      {msg && <div className={`feedback ${msg.ok ? 'feedback-ok' : 'feedback-bad'}`}>{msg.text}</div>}
    </form>
  );
}

function Choose({ local, remote }: { local: Summary; remote: Summary }) {
  const line = (s: Summary) => `${s.xp} XP · ${s.cards} Karten · ${s.streak} Tage Serie`;
  return (
    <div className="card stack">
      <b>☁️ Zwei Spielstände gefunden</b>
      <p className="muted small">Auf diesem Gerät und in deinem Konto gibt es schon Fortschritt. Was soll gelten?</p>
      <div className="small">
        📱 Dieses Gerät: <b>{line(local)}</b>
        <br />
        ☁️ Online: <b>{line(remote)}</b>
      </div>
      <button className="btn btn-primary btn-block" onClick={() => void resolveChoice('merge')}>
        Zusammenführen (empfohlen)
      </button>
      <button className="btn btn-block" onClick={() => void resolveChoice('remote')}>
        Online-Stand übernehmen
      </button>
      <button className="btn btn-block" onClick={() => void resolveChoice('local')}>
        Stand dieses Geräts behalten
      </button>
    </div>
  );
}

function NewPassword() {
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="card stack"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await setNewPassword(pw);
        } catch (x) {
          setMsg(describe(x));
        }
      }}
    >
      <b>🔑 Neues Passwort festlegen</b>
      <input type="password" placeholder="Neues Passwort (mind. 6 Zeichen)" value={pw} onChange={(e) => setPw(e.target.value)} minLength={6} required autoComplete="new-password" />
      <button className="btn btn-primary btn-block">Speichern</button>
      {msg && <div className="feedback feedback-bad">{msg}</div>}
    </form>
  );
}
