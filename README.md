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
| 🗺️ Lernpfad | 20 Einheiten mit Kann-Zielen auf drei Niveaus – als Reise durch Japan | Interleaving, kleine Portionen |
| 🎯 Persönliches Ziel | Zieltyp, Datum, Fähigkeiten, „Mein Warum“ → Plan, Prognose, Reise-Checkliste | Zielsetzungstheorie |
| 🎮 Spielerisch | Level & Ränge, 3 Tagesquests + Tageskiste, Yen-Reisekasse & Laden, 27 Abzeichen, Stempelheft, Streak-Schutz, Hör-Blitz, Combos | Gewohnheitsschleife, Selbstbestimmungstheorie |
| 📅 Erinnerung | täglicher Kalendertermin (.ics) zur Wunsch-Uhrzeit | Wenn-dann-Pläne |

### Audio & Spracherkennung – in jedem Browser (auch Firefox)

- **Natürliche Aufnahmen:** Alle ~2.000 japanischen Texte sind als Audiodateien eingebaut (VOICEVOX, zwei Stimmen:
  Hauptstimme + zweite Stimme für Dialogpartner). Kein Systemstimmen-Problem mehr, gleiche Qualität überall,
  offline speicherbar (Einstellungen → „Alle Aufnahmen offline speichern“). Formate: Opus (Firefox, Chrome) und MP3 (Safari).
- **Spracherkennung:** Chrome/Edge/Safari nutzen ihre eingebaute Erkennung. Browser ohne Erkennung (Firefox) laden
  einmalig eine KI (Moonshine-Japanisch, ≈ 65 MB), die lokal im Browser läuft – die Stimme verlässt das Gerät nicht.
- Fallback ohne Mikrofon-Erkennung: eigene Stimme aufnehmen und selbst vergleichen.

Stimmen: **VOICEVOX:No.7**, **VOICEVOX:青山龍星** · Spracherkennung: [Moonshine](https://github.com/usefulsensors/moonshine) via transformers.js

### Audio neu erzeugen (nach Inhaltsänderungen)

`src/lib/audio.test.ts` schlägt fehl, wenn ein neuer Text keine Aufnahme hat. Dann:

```bash
npm run audio:collect                       # Textliste → scripts/speech-corpus.json
VOICEVOX_DIR=/pfad/zu/voicevox python3 scripts/generate_audio.py
```

`VOICEVOX_DIR` enthält `voicevox_onnxruntime-linux-x64-1.17.3/`, `open_jtalk_dic_utf_8-1.11/` und `vvms/` (Modelle 6 und 15)
aus den [VOICEVOX-Core-Releases](https://github.com/VOICEVOX/voicevox_core/releases); `pip install voicevox_core`-Wheel, ffmpeg.
Kanji-Lesungen werden automatisch gegen die Kana der Lerninhalte geprüft (`scripts/reading-fixes.json`).

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
