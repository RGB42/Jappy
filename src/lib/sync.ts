// Geräte-Synchronisierung: Fortschritt nach jeder Änderung hochladen, beim Öffnen/Zurückkehren abholen.
// Konflikte (auf zwei Geräten offline geübt) werden per 3-Wege-Merge zusammengeführt – nichts geht verloren.
import { useSyncExternalStore } from 'react';
import * as cloud from './cloud';
import { CloudError, type CloudUser, type Session } from './cloud';
import { DEVICE_SETTINGS, mergeStates } from './merge';
import { getState, migrate, replaceState, subscribe, type AppState } from './store';

interface Meta {
  session: Session | null;
  rev: number | null; // Server-Version, auf der `base` beruht
  base: AppState | null; // Stand der letzten Synchronisierung
  dirty: boolean; // lokale Änderungen seit der letzten Synchronisierung
  lastSync: number;
}

export type SyncPhase = 'off' | 'idle' | 'syncing' | 'offline' | 'error' | 'choose';

export interface Summary {
  xp: number;
  cards: number;
  streak: number;
}

export interface SyncStatus {
  phase: SyncPhase;
  user: CloudUser | null;
  lastSync: number;
  error?: string;
  /** Erste Anmeldung auf einem Gerät mit eigenem Fortschritt: welcher Stand soll gelten? */
  choice?: { local: Summary; remote: Summary };
  /** Über einen „Passwort vergessen“-Link angemeldet → neues Passwort setzen. */
  needsNewPassword?: boolean;
  notice?: string;
}

const META_KEY = 'jappy:sync';
const REDIRECT_KEY = 'jappy:auth-redirect';
const PUSH_DELAY = 3000;

const memory = new Map<string, string>();
const storage = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return memory.get(k) ?? null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      memory.set(k, v);
    }
  },
};

const emptyMeta = (): Meta => ({ session: null, rev: null, base: null, dirty: false, lastSync: 0 });

function loadMeta(): Meta {
  try {
    return { ...emptyMeta(), ...(JSON.parse(storage.get(META_KEY) ?? 'null') as Partial<Meta> | null) };
  } catch {
    return emptyMeta();
  }
}

let meta = emptyMeta();
let status: SyncStatus = { phase: 'off', user: null, lastSync: 0 };
const listeners = new Set<() => void>();
let applying = false;
let running: Promise<void> | null = null;
let again = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;
let pendingRemote: AppState | null = null;
let pendingRev = 0;

function saveMeta() {
  storage.set(META_KEY, JSON.stringify(meta));
}

function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  listeners.forEach((l) => l());
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => status,
  );
}

export const getSyncStatus = () => status;

const device = () => (typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Handy' : 'Computer');

const totalXP = (s: AppState) => Object.values(s.xp).reduce((a, b) => a + b, 0);
const summary = (s: AppState): Summary => ({ xp: totalXP(s), cards: Object.keys(s.cards).length, streak: s.streak });
const hasProgress = (s: AppState) => s.onboarded && (totalXP(s) > 0 || Object.keys(s.cards).length > 0);

/** Fremden Stand übernehmen; gerätebezogene Einstellungen bleiben erhalten. */
function apply(next: AppState): AppState {
  const local = getState();
  const settings = { ...next.settings };
  for (const k of DEVICE_SETTINGS) (settings as Record<string, unknown>)[k] = local.settings[k];
  applying = true;
  try {
    replaceState({ ...next, settings });
  } finally {
    applying = false;
  }
  return getState();
}

async function authed<T>(fn: (s: Session) => Promise<T>): Promise<T> {
  if (!meta.session) throw new CloudError('nicht angemeldet', 401);
  if (meta.session.expires_at * 1000 - Date.now() < 60_000) await renew();
  try {
    return await fn(meta.session!);
  } catch (e) {
    if (e instanceof CloudError && e.status === 401) {
      await renew();
      return fn(meta.session!);
    }
    throw e;
  }
}

async function renew() {
  try {
    meta.session = await cloud.refresh(meta.session!);
    saveMeta();
  } catch (e) {
    if (e instanceof CloudError && e.status >= 400 && e.status < 500) {
      // Sitzung abgelaufen oder widerrufen: abmelden, Fortschritt bleibt lokal.
      meta = { ...emptyMeta(), dirty: meta.dirty };
      saveMeta();
      setStatus({ phase: 'off', user: null, error: 'Sitzung abgelaufen – bitte neu anmelden.' });
    }
    throw e;
  }
}

/** Ein Durchgang: Server-Version prüfen, ggf. zusammenführen, hochladen. */
async function syncOnce(): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const head = await authed((s) => cloud.fetchProgress(s, false));
    if (!head) {
      const snapshot = getState();
      if (await authed((s) => cloud.createProgress(s, snapshot, device()))) return committed(snapshot, 1);
      continue;
    }
    if (meta.rev === null) {
      // Erste Synchronisierung auf diesem Gerät.
      const row = (await authed((s) => cloud.fetchProgress(s)))!;
      const remote = migrate(row.data as Partial<AppState>);
      if (!hasProgress(getState())) return committed(apply(remote), row.rev);
      if (!hasProgress(remote)) {
        meta.rev = row.rev;
        meta.base = remote;
        meta.dirty = true;
        continue;
      }
      pendingRemote = remote;
      pendingRev = row.rev;
      setStatus({ phase: 'choose', choice: { local: summary(getState()), remote: summary(remote) } });
      return;
    }
    if (head.rev === meta.rev) {
      if (!meta.dirty) return committed(getState(), head.rev);
      const snapshot = getState();
      if (await authed((s) => cloud.saveProgress(s, snapshot, head.rev, device()))) return committed(snapshot, head.rev + 1);
      continue; // jemand war schneller → neu holen und zusammenführen
    }
    // Ein anderes Gerät hat hochgeladen.
    const row = await authed((s) => cloud.fetchProgress(s));
    if (!row) continue;
    const remote = migrate(row.data as Partial<AppState>);
    if (!meta.dirty) return committed(apply(remote), row.rev);
    const merged = apply(mergeStates(meta.base, getState(), remote));
    if (await authed((s) => cloud.saveProgress(s, merged, row.rev, device()))) return committed(merged, row.rev + 1);
    meta.rev = row.rev;
    meta.base = remote;
  }
  throw new CloudError('Zu viele gleichzeitige Änderungen – bitte gleich nochmal versuchen.');
}

/** `snapshot` ist auf dem Server; wurde währenddessen weitergeübt, bleibt der Stand „geändert“. */
function committed(snapshot: AppState, rev: number) {
  meta.rev = rev;
  meta.base = snapshot;
  meta.dirty = getState() !== snapshot;
  meta.lastSync = Date.now();
  saveMeta();
  setStatus({ phase: 'idle', lastSync: meta.lastSync, error: undefined });
}

/** Jetzt synchronisieren (läuft nie doppelt; Anfragen währenddessen lösen einen weiteren Durchgang aus). */
export function syncNow(): Promise<void> {
  if (!meta.session || !cloud.cloudConfigured() || status.phase === 'choose') return Promise.resolve();
  if (running) {
    again = true;
    return running;
  }
  clearTimeout(pushTimer);
  setStatus({ phase: 'syncing' });
  running = (async () => {
    try {
      do {
        again = false;
        await syncOnce();
      } while (again && meta.session);
    } catch (e) {
      if (!meta.session) return;
      const offline = e instanceof CloudError && (e.message === 'offline' || e.status >= 500);
      setStatus({ phase: offline ? 'offline' : 'error', error: offline ? undefined : describe(e) });
    } finally {
      running = null;
    }
  })();
  return running;
}

function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void syncNow(), PUSH_DELAY);
}

/** Bei der ersten Anmeldung: welcher Fortschritt soll gelten? */
export async function resolveChoice(choice: 'merge' | 'remote' | 'local') {
  const remote = pendingRemote;
  if (!remote) return;
  pendingRemote = null;
  if (choice === 'remote') apply(remote);
  else if (choice === 'merge') apply(mergeStates(null, getState(), remote));
  meta.rev = pendingRev;
  meta.base = remote;
  meta.dirty = choice !== 'remote';
  saveMeta();
  setStatus({ phase: 'idle', choice: undefined });
  await syncNow();
}

function loggedIn(session: Session) {
  meta = { ...emptyMeta(), session, dirty: meta.dirty };
  saveMeta();
  setStatus({ phase: 'idle', user: session.user, error: undefined, notice: undefined });
  return syncNow();
}

export async function login(email: string, password: string) {
  await loggedIn(await cloud.signIn(email.trim(), password));
}

/** Registrieren. Liefert false, wenn erst die E-Mail bestätigt werden muss. */
export async function register(email: string, password: string, name: string): Promise<boolean> {
  const session = await cloud.signUp(email.trim(), password, name.trim() || undefined);
  if (!session) return false;
  await loggedIn(session);
  return true;
}

export async function logout() {
  if (meta.session) {
    await syncNow().catch(() => {});
    await cloud.signOut(meta.session);
  }
  meta = emptyMeta();
  saveMeta();
  setStatus({ phase: 'off', user: null, error: undefined, choice: undefined, needsNewPassword: false });
}

export async function deleteAccount() {
  await authed((s) => cloud.deleteAccount(s));
  meta = emptyMeta();
  saveMeta();
  setStatus({ phase: 'off', user: null, notice: 'Konto und Online-Daten gelöscht. Dein Fortschritt bleibt auf diesem Gerät.' });
}

export const resetPassword = (email: string) => cloud.requestPasswordReset(email.trim());

export async function setNewPassword(password: string) {
  await authed((s) => cloud.updatePassword(s, password));
  setStatus({ needsNewPassword: false, notice: 'Neues Passwort gespeichert.' });
}

export async function rename(name: string) {
  await authed((s) => cloud.updateName(s, name.trim()));
  meta.session = { ...meta.session!, user: { ...meta.session!.user, name: name.trim() } };
  saveMeta();
  setStatus({ user: meta.session.user });
}

export function describe(e: unknown): string {
  if (!(e instanceof CloudError)) return 'Unbekannter Fehler.';
  const m = e.message.toLowerCase();
  if (m === 'offline') return 'Keine Verbindung zum Server.';
  if (m.includes('invalid login') || e.code === 'invalid_credentials') return 'E-Mail oder Passwort falsch.';
  if (m.includes('email not confirmed') || e.code === 'email_not_confirmed') return 'Bitte bestätige zuerst deine E-Mail (Link im Postfach).';
  if (m.includes('already registered') || e.code === 'user_already_exists') return 'Für diese E-Mail gibt es schon ein Konto – bitte anmelden.';
  if (m.includes('password') && (m.includes('least') || m.includes('weak'))) return 'Passwort zu schwach (mind. 6 Zeichen).';
  if (m.includes('rate limit') || e.status === 429) return 'Zu viele Versuche – bitte kurz warten.';
  if (m.includes('valid email') || m.includes('invalid format')) return 'Bitte eine gültige E-Mail-Adresse eingeben.';
  return e.message;
}

/** Rückkehr aus einem E-Mail-Link (Bestätigung oder Passwort vergessen). */
async function consumeRedirect() {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
  } catch {
    /* kein sessionStorage */
  }
  if (!raw) return;
  const p = JSON.parse(raw) as Record<string, string>;
  if (p.error_description) {
    setStatus({ error: p.error_description.replace(/\+/g, ' ') });
    return;
  }
  if (!p.access_token || !p.refresh_token) return;
  try {
    const user = await cloud.getUser(p.access_token);
    const session: Session = {
      access_token: p.access_token,
      refresh_token: p.refresh_token,
      expires_at: Number(p.expires_at) || Math.floor(Date.now() / 1000) + Number(p.expires_in || 3600),
      user,
    };
    if (p.type === 'recovery') setStatus({ needsNewPassword: true });
    else setStatus({ notice: 'E-Mail bestätigt – du bist angemeldet.' });
    await loggedIn(session);
  } catch (e) {
    setStatus({ error: describe(e) });
  }
}

let started = false;

/** Beim App-Start aufrufen. */
export function startSync() {
  if (started || !cloud.cloudConfigured()) return;
  started = true;
  meta = loadMeta();
  if (meta.session) setStatus({ phase: 'idle', user: meta.session.user, lastSync: meta.lastSync });
  subscribe(() => {
    if (applying) return;
    if (!meta.dirty) {
      meta.dirty = true;
      saveMeta();
    }
    if (meta.session) schedulePush();
  });
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => void syncNow());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void syncNow();
      else if (meta.dirty) void syncNow(); // beim Verlassen sofort sichern
    });
    setInterval(() => document.visibilityState === 'visible' && void syncNow(), 120_000);
  }
  void consumeRedirect().then(() => syncNow());
}

/** Nur für Tests. */
export function _resetSyncForTests() {
  meta = emptyMeta();
  status = { phase: 'off', user: null, lastSync: 0 };
  started = false;
  running = null;
  pendingRemote = null;
  memory.clear();
}
