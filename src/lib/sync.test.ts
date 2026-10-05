// Synchronisierung Ende-zu-Ende: zwei „Geräte“ (frische Modul-Instanzen) gegen einen nachgebauten Supabase-Server.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeSupabase } from '../test/fakeSupabase';

let server: ReturnType<typeof createFakeSupabase>;

async function device() {
  vi.resetModules();
  const store = await import('./store');
  const cloud = await import('./cloud');
  const sync = await import('./sync');
  cloud.configureCloud('http://fake.supabase', 'anon-key');
  sync.startSync();
  const xp = () => Object.values(store.getState().xp).reduce((a, b) => a + b, 0);
  return { store, sync, xp };
}

beforeEach(() => {
  server = createFakeSupabase();
  vi.stubGlobal('fetch', server.fetch);
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Geräte-Synchronisierung', () => {
  it('Handy und PC teilen sich den Fortschritt – auch nach Offline-Üben auf beiden', async () => {
    const phone = await device();
    phone.store.completeOnboarding(1, 50);
    phone.store.addXP(30);
    phone.store.introduceItems(['w-taberu']);
    expect(await phone.sync.register('ich@example.com', 'geheim123', 'Ralph')).toBe(true);
    expect(server.rows.size).toBe(1);
    expect(phone.sync.getSyncStatus().phase).toBe('idle');

    // Zweites Gerät, frisch: Anmelden übernimmt den Online-Stand (inkl. Onboarding).
    const pc = await device();
    await pc.sync.login('ich@example.com', 'geheim123');
    expect(pc.store.getState().onboarded).toBe(true);
    expect(pc.xp()).toBe(30);
    expect(Object.keys(pc.store.getState().cards)).toContain('w-taberu:listen');
    expect(pc.sync.getSyncStatus().user?.name).toBe('Ralph');

    // Beide üben, ohne zwischendurch zu synchronisieren.
    phone.store.addXP(10);
    pc.store.addXP(20);
    pc.store.introduceItems(['w-nomu']);
    await phone.sync.syncNow();
    await pc.sync.syncNow(); // Konflikt → zusammenführen
    await phone.sync.syncNow();
    expect(pc.xp()).toBe(60);
    expect(phone.xp()).toBe(60);
    expect(Object.keys(phone.store.getState().cards)).toContain('w-nomu:speak');
    expect(server.rows.values().next().value!.rev).toBe(3);

    // Ohne Änderungen wird nichts hochgeladen.
    const patches = server.log.filter((l) => l.startsWith('PATCH')).length;
    await phone.sync.syncNow();
    expect(server.log.filter((l) => l.startsWith('PATCH')).length).toBe(patches);
  });

  it('erste Anmeldung auf einem Gerät mit eigenem Fortschritt fragt nach – Zusammenführen addiert', async () => {
    const a = await device();
    a.store.completeOnboarding(1, 50);
    a.store.addXP(40);
    await a.sync.register('x@example.com', 'geheim123', '');

    const b = await device();
    b.store.completeOnboarding(2, 50);
    b.store.addXP(15);
    await b.sync.login('x@example.com', 'geheim123');
    const st = b.sync.getSyncStatus();
    expect(st.phase).toBe('choose');
    expect(st.choice).toMatchObject({ local: { xp: 15 }, remote: { xp: 40 } });
    await b.sync.resolveChoice('merge');
    expect(b.xp()).toBe(55);
    await a.sync.syncNow();
    expect(a.xp()).toBe(55);
  });

  it('abgelaufene Sitzung wird erneuert; falsches Passwort meldet verständlichen Fehler', async () => {
    server = createFakeSupabase({ tokenTtl: 30 }); // läuft sofort „bald“ ab → Erneuern vor jeder Anfrage
    vi.stubGlobal('fetch', server.fetch);
    const a = await device();
    a.store.completeOnboarding(1, 50);
    await a.sync.register('y@example.com', 'geheim123', '');
    a.store.addXP(5);
    await a.sync.syncNow();
    expect(a.sync.getSyncStatus().phase).toBe('idle');
    expect(server.log.some((l) => l.includes('grant_type=refresh_token'))).toBe(true);

    const b = await device();
    await expect(b.sync.login('y@example.com', 'falsch!!')).rejects.toThrow();
    try {
      await b.sync.login('y@example.com', 'falsch!!');
    } catch (e) {
      expect(b.sync.describe(e)).toBe('E-Mail oder Passwort falsch.');
    }
  });

  it('Registrierung mit E-Mail-Bestätigung: erst bestätigen, dann anmelden', async () => {
    server = createFakeSupabase({ confirmEmail: true });
    vi.stubGlobal('fetch', server.fetch);
    const a = await device();
    expect(await a.sync.register('z@example.com', 'geheim123', '')).toBe(false);
    await expect(a.sync.login('z@example.com', 'geheim123')).rejects.toThrow(/confirmed/);
    server.confirm('z@example.com');
    await a.sync.login('z@example.com', 'geheim123');
    expect(a.sync.getSyncStatus().user?.email).toBe('z@example.com');
  });

  it('Gerätebezogene Einstellungen (Offline-Modell) werden nicht übertragen', async () => {
    const a = await device();
    a.store.completeOnboarding(1, 50);
    a.store.updateSettings({ whisper: 'fast', romaji: false });
    await a.sync.register('w@example.com', 'geheim123', '');
    const b = await device();
    await b.sync.login('w@example.com', 'geheim123');
    expect(b.store.getState().settings.romaji).toBe(false);
    expect(b.store.getState().settings.whisper).toBe('off');
  });
});
