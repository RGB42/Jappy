/** „gerade eben“, „vor 5 Min.“, „vor 2 Std.“ oder Datum. */
export function ago(ts: number): string {
  if (!ts) return 'noch nie';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return 'gerade eben';
  if (s < 3600) return `vor ${Math.round(s / 60)} Min.`;
  if (s < 86400) return `vor ${Math.round(s / 3600)} Std.`;
  return new Date(ts).toLocaleDateString('de-DE');
}
