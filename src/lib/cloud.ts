// Online-Konto über Supabase (Auth + eine Tabelle „progress“) – schlanker Client nur mit fetch.
// Konfiguration beim Build: VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY (siehe README, supabase/schema.sql).

export interface CloudUser {
  id: string;
  email: string;
  name?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Sekunden seit 1970
  user: CloudUser;
}

export interface ProgressRow {
  data: unknown;
  rev: number;
  updated_at?: string;
}

export class CloudError extends Error {
  constructor(
    message: string,
    readonly status = 0,
    readonly code = '',
  ) {
    super(message);
  }
}

const env = import.meta.env as Record<string, string | undefined>;
const config = {
  url: (env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, ''),
  key: env.VITE_SUPABASE_ANON_KEY ?? '',
};

/** Für Tests: andere Server-Adresse setzen. */
export function configureCloud(url: string, key: string) {
  config.url = url.replace(/\/+$/, '');
  config.key = key;
}

export const cloudConfigured = () => !!(config.url && config.key);

/** Wohin Bestätigungs- und Passwort-Links aus E-Mails zurückführen. */
export const appUrl = () => (typeof location !== 'undefined' ? location.origin + location.pathname : '');

async function call<T>(path: string, init: RequestInit & { token?: string; prefer?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { apikey: config.key, 'Content-Type': 'application/json' };
  headers.Authorization = `Bearer ${init.token ?? config.key}`;
  if (init.prefer) headers.Prefer = init.prefer;
  let res: Response;
  try {
    res = await fetch(config.url + path, { ...init, headers });
  } catch {
    throw new CloudError('offline');
  }
  const text = await res.text();
  const body = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  if (!res.ok) {
    const msg = String(body?.msg ?? body?.error_description ?? body?.message ?? body?.error ?? res.statusText);
    throw new CloudError(msg, res.status, String(body?.error_code ?? body?.code ?? ''));
  }
  return body as T;
}

interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: { id: string; email: string; user_metadata?: { name?: string } };
  id?: string; // Registrierung mit E-Mail-Bestätigung liefert nur den Nutzer
}

export function toSession(r: AuthResponse): Session | null {
  if (!r.access_token || !r.refresh_token || !r.user) return null;
  return {
    access_token: r.access_token,
    refresh_token: r.refresh_token,
    expires_at: r.expires_at ?? Math.floor(Date.now() / 1000) + (r.expires_in ?? 3600),
    user: { id: r.user.id, email: r.user.email, name: r.user.user_metadata?.name },
  };
}

/** Registrieren. Liefert null, wenn erst die E-Mail bestätigt werden muss. */
export async function signUp(email: string, password: string, name?: string): Promise<Session | null> {
  const r = await call<AuthResponse>(`/auth/v1/signup?redirect_to=${encodeURIComponent(appUrl())}`, {
    method: 'POST',
    body: JSON.stringify({ email, password, data: name ? { name } : {} }),
  });
  return toSession(r);
}

export async function signIn(email: string, password: string): Promise<Session> {
  const r = await call<AuthResponse>('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const s = toSession(r);
  if (!s) throw new CloudError('Anmeldung fehlgeschlagen');
  return s;
}

export async function refresh(session: Session): Promise<Session> {
  const r = await call<AuthResponse>('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  return toSession(r) ?? session;
}

/** Nutzer zu einem Token (z. B. aus einem E-Mail-Link) abrufen. */
export async function getUser(accessToken: string): Promise<CloudUser> {
  const u = await call<{ id: string; email: string; user_metadata?: { name?: string } }>('/auth/v1/user', { token: accessToken });
  return { id: u.id, email: u.email, name: u.user_metadata?.name };
}

export async function signOut(session: Session): Promise<void> {
  await call('/auth/v1/logout', { method: 'POST', token: session.access_token }).catch(() => {});
}

export async function requestPasswordReset(email: string): Promise<void> {
  await call(`/auth/v1/recover?redirect_to=${encodeURIComponent(appUrl())}`, { method: 'POST', body: JSON.stringify({ email }) });
}

export async function updatePassword(session: Session, password: string): Promise<void> {
  await call('/auth/v1/user', { method: 'PUT', token: session.access_token, body: JSON.stringify({ password }) });
}

export async function updateName(session: Session, name: string): Promise<void> {
  await call('/auth/v1/user', { method: 'PUT', token: session.access_token, body: JSON.stringify({ data: { name } }) });
}

// ---------------------------------------------------------------------------
// Fortschritt: eine Zeile pro Nutzer (Row Level Security), mit Versionsnummer gegen gleichzeitiges Überschreiben.

export async function fetchProgress(session: Session, withData = true): Promise<ProgressRow | null> {
  const rows = await call<ProgressRow[]>(`/rest/v1/progress?select=${withData ? 'rev,data,updated_at' : 'rev'}`, { token: session.access_token });
  return rows[0] ?? null;
}

/** Erste Zeile anlegen. Liefert false, wenn ein anderes Gerät schneller war. */
export async function createProgress(session: Session, data: unknown, device: string): Promise<boolean> {
  try {
    await call('/rest/v1/progress', {
      method: 'POST',
      token: session.access_token,
      prefer: 'return=minimal',
      body: JSON.stringify({ user_id: session.user.id, data, rev: 1, device }),
    });
    return true;
  } catch (e) {
    if (e instanceof CloudError && e.status === 409) return false;
    throw e;
  }
}

/** Nur speichern, wenn der Server noch Version `rev` hat. Liefert false bei einem Konflikt. */
export async function saveProgress(session: Session, data: unknown, rev: number, device: string): Promise<boolean> {
  const rows = await call<ProgressRow[]>(`/rest/v1/progress?user_id=eq.${session.user.id}&rev=eq.${rev}&select=rev`, {
    method: 'PATCH',
    token: session.access_token,
    prefer: 'return=representation',
    body: JSON.stringify({ data, rev: rev + 1, device, updated_at: new Date().toISOString() }),
  });
  return rows.length === 1;
}

/** Konto samt Online-Daten löschen (SQL-Funktion delete_account, siehe supabase/schema.sql). */
export async function deleteAccount(session: Session): Promise<void> {
  await call('/rest/v1/rpc/delete_account', { method: 'POST', token: session.access_token, body: '{}' });
}
