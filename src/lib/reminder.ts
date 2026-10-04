// Tägliche Erinnerung als Kalender-Termin (.ics) – funktioniert auf jedem Gerät, ohne Push-Server.
// Psychologie: „Wenn-dann-Plan“ (Implementation Intention, Gollwitzer): „Wenn es 19 Uhr ist, übe ich Japanisch.“

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function buildReminderICS(time: string, until?: string, now = new Date()): string {
  const [h, m] = time.split(':').map(Number);
  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  const date = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}`;
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const rrule = until ? `RRULE:FREQ=DAILY;UNTIL=${until.replace(/-/g, '')}T235959` : 'RRULE:FREQ=DAILY';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jappy//Japanisch lernen//DE',
    'BEGIN:VEVENT',
    `UID:jappy-daily-${date}@jappy.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${date}T${pad(h)}${pad(m)}00`,
    'DURATION:PT15M',
    rrule,
    'SUMMARY:🇯🇵 Japanisch üben mit Jappy',
    'DESCRIPTION:Ein paar Minuten reichen – Serie halten und Quests holen! がんばって！',
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Zeit für Japanisch!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadReminder(time: string, until?: string) {
  const blob = new Blob([buildReminderICS(time, until)], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'jappy-erinnerung.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
