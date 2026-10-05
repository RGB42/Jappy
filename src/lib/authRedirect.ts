// Rückkehr aus einem E-Mail-Link (Konto bestätigen, Passwort vergessen): Supabase hängt die Anmeldedaten
// als „#access_token=…“ an. Das muss vor dem Hash-Router passieren – daher als erster Import in main.tsx.
if (typeof window !== 'undefined' && /(^#|&)(access_token|error_description)=/.test(window.location.hash)) {
  const params = Object.fromEntries(new URLSearchParams(window.location.hash.slice(1)));
  try {
    sessionStorage.setItem('jappy:auth-redirect', JSON.stringify(params));
  } catch {
    /* ohne sessionStorage keine automatische Anmeldung */
  }
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/settings`);
}
export {};
