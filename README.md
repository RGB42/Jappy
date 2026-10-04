# Jappy 🗾 – Japanisch lernen durch Hören, Sprechen und Ausprobieren

Web-App (PWA) für Einsteiger bis Fortgeschrittene. Audio zuerst, Lesen als Unterstützung.
Läuft im Browser auf Handy und PC, offline-fähig, ohne Konto – der Fortschritt bleibt lokal.

## Funktionen

| Bereich | Was du tust | Lernprinzip |
|---|---|---|
| 🆕 Neue Ausdrücke | hören → verstehen → nachsprechen → abrufen | Audio zuerst, aktives Abrufen |
| 🔁 Wiederholen | Hörkarten (hören → Bedeutung) und Sprechkarten (Deutsch → sprechen) | Verteilte Wiederholung (SM-2) |
| 🎧 Audio-Lektion | freihändig: Frage, laut antworten, Lösung | Pimsleur (Antizipation, gestaffelte Intervalle, Rückwärtsaufbau) |
| 🗣️ Shadowing | Endlosschleife, mitsprechen, eigene Aufnahme vergleichen | Shadowing, Imitation |
| 🎭 Rollenspiele | 16 Alltagssituationen: App spielt eine Rolle, du die andere | Aufgabenbasiertes Lernen |
| 📻 Hörgeschichten | 12 Geschichten: ohne Text hören, Fragen, dann mit Text | Verstehbarer Input (i+1) |
| 👂 Hörtraining & Minimalpaare | Wörter/Sätze verstehen, おばさん vs. おばあさん unterscheiden | Ohrtraining |
| 🧩 Grammatik & Satzbau | 30 Muster: Beispiele hören, Sätze aus Bausteinen bauen | Entdeckendes Lernen, sofortiges Feedback |
| あ Kana | Zeichen hören, lesen, mit dem Finger schreiben (mit Bewertung) | Duale Kodierung, Eselsbrücken, Leitner-System |
| 🗺️ Lernpfad | 18+ Einheiten mit Kann-Zielen auf drei Niveaus | Interleaving, kleine Portionen |

Sprechübungen nutzen die Spracherkennung des Browsers (Chrome/Edge, Safari) und geben sofort Feedback.
Ohne Spracherkennung: eigene Stimme aufnehmen und selbst vergleichen.

Details zu den Lernkonzepten: [docs/LERNKONZEPT.md](docs/LERNKONZEPT.md)

## Starten

```bash
npm install
npm run dev      # Entwicklungsserver: http://localhost:5173
npm test         # Tests (Logik + Prüfung aller Lerninhalte)
npm run build    # Produktions-Build nach dist/
```

**Am Handy nutzen:** Build auf einen beliebigen Webspace legen (z. B. GitHub Pages, siehe unten), im Browser öffnen,
„Zum Startbildschirm hinzufügen“. Mikrofon-Zugriff erfordert HTTPS.

**GitHub Pages:** Der Workflow `.github/workflows/deploy.yml` testet, baut und veröffentlicht bei jedem Push auf `main`.
Einmalig aktivieren: *Settings → Pages → Source: GitHub Actions*.

## Tipps

- Japanische Stimme fehlt? In den Systemeinstellungen eine japanische Sprachausgabe installieren (Windows: *Zeit & Sprache → Sprache*; iOS: *Bedienungshilfen → Gesprochene Inhalte → Stimmen*). Chrome bringt „Google 日本語“ mit.
- Einstellungen: Sprechtempo, Stimme, Kana/Kanji-Anzeige, Romaji an/aus, „Erst hören, dann lesen“.
- Fortschritt lässt sich in den Einstellungen exportieren/importieren.

## Aufbau

```
src/
  data/        Lerninhalte (Vokabeln, Phrasen, Dialoge, Geschichten, Grammatik, Kana) + Lernpfad
  lib/         Logik: Sprachausgabe/-erkennung, SRS, Kana/Romaji, Bewertung, Audio-Lektion, Speicher
  components/  UI-Bausteine (Vorlesen, Mikrofon-Check, Quiz, Textanzeige)
  screens/     Bildschirme
```

React 19 + TypeScript + Vite, keine weiteren Laufzeit-Abhängigkeiten. Inhalte werden durch `src/data/data.test.ts`
automatisch geprüft (eindeutige IDs, reine Kana-Lesungen, gültige Antworten).
