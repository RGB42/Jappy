#!/usr/bin/env python3
"""Erzeugt die eingebauten Audiodateien (public/audio/ja/*.mp3) mit VOICEVOX.

Eingabe:  scripts/speech-corpus.json  (npm run audio:collect)
Ausgabe:  public/audio/ja/<key>.ogg (Opus) + <key>.mp3 + public/audio/index.json

Voraussetzungen (siehe README, Abschnitt „Audio neu erzeugen“):
  - voicevox_core (Python-Wheel), VOICEVOX ONNX Runtime, Open-JTalk-Wörterbuch, Stimmmodelle (VVM)
  - ffmpeg mit libmp3lame
  Umgebungsvariable VOICEVOX_DIR zeigt auf den Ordner mit diesen Dateien.

Kanji-Lesungen werden gegen die Kana-Lesung aus den Lerninhalten geprüft; weicht die
Aussprache ab, wird direkt aus den Kana synthetisiert.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile

ROOT = Path(__file__).resolve().parent.parent
VV = Path(os.environ.get('VOICEVOX_DIR', '/tmp/vv'))
OUT = ROOT / 'public' / 'audio' / 'ja'

# Stimmen: f = No.7 (ノーマル), m = 青山龍星 (ノーマル)
VOICES = {
    'f': {'vvm': 6, 'style': 29, 'credit': 'VOICEVOX:No.7'},
    'm': {'vvm': 15, 'style': 13, 'credit': 'VOICEVOX:青山龍星'},
}

HIRA_TO_KATA = {chr(c): chr(c + 0x60) for c in range(0x3041, 0x3097)}
PUNCT_RE = re.compile(r'[\s　。、？！?!「」・…〜～（）()]')


def to_kata(s: str) -> str:
    return ''.join(HIRA_TO_KATA.get(ch, ch) for ch in s)


def make_synth() -> Synthesizer:
    ort = Onnxruntime.load_once(filename=str(VV / 'voicevox_onnxruntime-linux-x64-1.17.3/lib/libvoicevox_onnxruntime.so.1.17.3'))
    synth = Synthesizer(ort, OpenJtalk(str(VV / 'open_jtalk_dic_utf_8-1.11')), cpu_num_threads=os.cpu_count() or 4)
    for v in VOICES.values():
        with VoiceModelFile.open(str(VV / 'vvms' / f"{v['vvm']}.vvm")) as m:
            synth.load_voice_model(m)
    return synth


def moras(query) -> str:
    return ''.join(m.text for ap in query.accent_phrases for m in ap.moras)


_ROWS = {
    'a': 'アカサタナハマヤラワガザダバパァャヮ',
    'i': 'イキシチニヒミリギジヂビピィ',
    'u': 'ウクスツヌフムユルグズヅブプゥュヴ',
    'e': 'エケセテネヘメレゲゼデベペェ',
    'o': 'オコソトノホモヨロヲゴゾドボポォョ',
}
_VOWEL = {ch: v for v, chars in _ROWS.items() for ch in chars}


def same_pronunciation(a: str, b: str) -> bool:
    """Vergleicht zwei Aussprachen; Vokaldehnungen (セイ = セエ, トウ = トオ, ー) zählen als gleich."""

    def norm(s: str) -> str:
        out = []
        for ch in s:
            prev = _VOWEL.get(out[-1]) if out else None
            if ch == 'ー' and prev:
                ch = {'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ'}[prev]
            elif ch == 'イ' and prev == 'e':
                ch = 'エ'
            elif ch == 'ウ' and prev == 'o':
                ch = 'オ'
            out.append(ch)
        return ''.join(out)

    return norm(a) == norm(b)


def plain(s: str) -> str:
    return PUNCT_RE.sub('', s)


# Sätze, bei denen die Engine は falsch zuordnet und die Kana-Lesung erzwungen werden muss
# („袋はいりますか“ = „fukuro wa irimasu ka“, nicht „hairimasu“).
FORCE_KANA = {'袋はいりますか。'}

_SMALL = set('ャュョァィゥェォヮ')
_PARTICLE_PRON = {'は': 'ワ', 'へ': 'エ', 'を': 'オ'}
_RELAXED = [{'ハ', 'ワ'}, {'ヘ', 'エ'}, {'ヲ', 'オ'}]


def split_moras(kata: str) -> list[str]:
    out: list[str] = []
    for ch in kata:
        if ch in _SMALL and out:
            out[-1] += ch
        else:
            out.append(ch)
    return out


def norm_pron(s: str) -> str:
    """Vokaldehnung vereinheitlichen (セイ → セエ, トウ → トオ, ー → Vokal)."""
    out: list[str] = []
    for ch in s:
        prev = _VOWEL.get(out[-1][-1]) if out else None
        if ch == 'ー' and prev:
            ch = {'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ'}[prev]
        elif ch == 'イ' and prev == 'e':
            ch = 'エ'
        elif ch == 'ウ' and prev == 'o':
            ch = 'オ'
        out.append(ch)
    return ''.join(out)


def kana_pron(kana: str) -> str:
    """Aussprache aus der Kana-Lesung: einzeln stehende Partikeln は/へ/を → ワ/エ/オ."""
    parts = []
    for token in re.split(r'[\s　。、？！?!「」・…〜～（）()]+', kana):
        if not token:
            continue
        parts.append(_PARTICLE_PRON.get(token) or to_kata(token).replace('ヲ', 'オ'))
    pron = ''.join(parts)
    for a, b in (('コンニチハ', 'コンニチワ'), ('コンバンハ', 'コンバンワ')):
        pron = pron.replace(a, b)
    return pron


def relaxed_eq(a: str, b: str) -> bool:
    return a == b or {a, b} in _RELAXED


def kana_notation(final: list[str], text_query, kana: str) -> str:
    """AquesTalk-ähnliche Lautschrift für VOICEVOX. Betonung aus der Kanji-Analyse, wenn die Silbenzahl passt."""
    phrases = text_query.accent_phrases
    if sum(len(ap.moras) for ap in phrases) == len(final):
        out, i = [], 0
        for n, ap in enumerate(phrases):
            ms = final[i : i + len(ap.moras)]
            i += len(ap.moras)
            acc = max(1, min(ap.accent, len(ms)))
            piece = ''.join(ms[:acc]) + "'" + ''.join(ms[acc:])
            if ap.is_interrogative:
                piece += '？'
            out.append(piece)
            if n < len(phrases) - 1:
                out.append('、' if ap.pause_mora is not None else '/')
        return ''.join(out)
    # Fallback: Phrasen nach Wörtern der Kana-Lesung, flache Betonung
    out = []
    for token in re.split(r'[\s　。、？！?!「」・…〜～（）()]+', kana):
        if not token:
            continue
        ms = split_moras(norm_pron((_PARTICLE_PRON.get(token) or to_kata(token).replace('ヲ', 'オ')).replace('ヅ', 'ズ').replace('ヂ', 'ジ')).replace('ー', ''))
        if token in _PARTICLE_PRON and out:
            out[-1] += ms
        else:
            out.append(ms)
    return '/'.join(''.join(ms) + "'" for ms in out if ms)


def build_query(synth: Synthesizer, entry: dict, style: int, log: list):
    text = entry['text']
    kana = entry.get('kana')
    # Einzelne Kana-Silben: Aussprache erzwingen (sonst wird „は“ als Partikel „wa“ gelesen).
    if len(plain(text)) <= 2 and kana and plain(text) == plain(kana) and re.fullmatch(r'[ぁ-ヿ]+', plain(text)):
        k = to_kata(plain(text)).replace('ヲ', 'オ').replace('ヂ', 'ジ').replace('ヅ', 'ズ')
        try:
            return synth.create_audio_query_from_kana(f"{k}'", style)
        except Exception:  # noqa: BLE001
            pass
    # Einzelwörter: aus der Kanji-Form synthetisieren (das Wort ist bekannt → natürliche Betonung)
    query = synth.create_audio_query(entry.get('synth') or text, style)
    if not kana:
        return query
    engine_raw = split_moras(moras(query))
    ours_raw = split_moras(kana_pron(kana))
    # Vergleich mit vereinheitlichter Vokaldehnung (Silbenzahl bleibt dabei gleich)
    engine = split_moras(norm_pron(''.join(engine_raw)))
    ours = split_moras(norm_pron(''.join(ours_raw)))
    if text not in FORCE_KANA and len(engine) == len(ours) and all(relaxed_eq(a, b) for a, b in zip(engine, ours)):
        return query  # Engine liest richtig (Partikel-は usw. kennt sie aus dem Kontext)
    if text in FORCE_KANA:
        engine_raw = ours_raw  # Kana-Lesung vollständig übernehmen
    # Abweichung: Aussprache aus den Kana erzwingen. Wo beide übereinstimmen, die (natürlichere) Engine-Silbe nehmen.
    if len(engine) == len(ours):
        final = [er if relaxed_eq(e, o) else orw for er, e, o, orw in zip(engine_raw, engine, ours, ours_raw)]
    else:
        final = ours_raw
    final = [m.replace('ヅ', 'ズ').replace('ヂ', 'ジ') for m in final]
    # Die Lautschrift kennt kein „ー“: als Vokal schreiben (コーヒー → コオヒイ)
    for i, m in enumerate(final):
        if m == 'ー' and i > 0:
            final[i] = {'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ'}.get(_VOWEL.get(final[i - 1][-1], 'a'), 'ア')
    notation = kana_notation(final, query, kana)
    entry_log = {'key': entry['key'], 'text': text, 'kana': kana, 'engine': ''.join(engine), 'forced': ''.join(final), 'notation': notation}
    try:
        fixed = synth.create_audio_query_from_kana(notation, style)
        entry_log['result'] = moras(fixed)
        log.append(entry_log)
        return fixed
    except Exception as err:  # noqa: BLE001
        entry_log['error'] = str(err)
        log.append(entry_log)
        return query


def encode(wav: bytes, base: Path):
    """Speichert MP3 (Safari) und Opus/Ogg (Firefox dekodiert Opus immer selbst, MP3 nicht überall)."""
    subprocess.run(
        ['ffmpeg', '-loglevel', 'error', '-y', '-i', 'pipe:0', '-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', '40k', str(base.with_suffix('.mp3'))],
        input=wav,
        check=True,
    )
    subprocess.run(
        ['ffmpeg', '-loglevel', 'error', '-y', '-i', 'pipe:0', '-ac', '1', '-codec:a', 'libopus', '-b:a', '24k', '-application', 'voip', str(base.with_suffix('.ogg'))],
        input=wav,
        check=True,
    )


def main():
    corpus = json.loads((ROOT / 'scripts' / 'speech-corpus.json').read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    synth = make_synth()
    log: list = []
    force = '--force' in sys.argv
    # --only=<datei>: nur diese Schlüssel neu erzeugen (eine Zeile pro Schlüssel)
    only = set()
    for arg in sys.argv:
        if arg.startswith('--only='):
            only = set(Path(arg[7:]).read_text().split())
    keys = []
    for i, entry in enumerate(corpus):
        base = OUT / entry['key']
        keys.append(entry['key'])
        if base.with_suffix('.mp3').exists() and base.with_suffix('.ogg').exists() and not force and entry['key'] not in only:
            continue
        style = VOICES[entry['voice']]['style']
        query = build_query(synth, entry, style, log)
        query.pre_phoneme_length = 0.08
        query.post_phoneme_length = 0.12
        encode(synth.synthesis(query, style), base)
        if i % 100 == 0:
            print(f'{i}/{len(corpus)}', flush=True)
    # Verwaiste Dateien entfernen
    valid = set(keys)
    for f in [*OUT.glob('*.mp3'), *OUT.glob('*.ogg')]:
        if f.stem not in valid:
            f.unlink()
    index = {'version': 2, 'formats': ['ogg', 'mp3'], 'credits': sorted({v['credit'] for v in VOICES.values()}), 'keys': sorted(valid)}
    (ROOT / 'public' / 'audio' / 'index.json').write_text(json.dumps(index, ensure_ascii=False, separators=(',', ':')))
    (ROOT / 'scripts' / 'reading-fixes.json').write_text(json.dumps(log, ensure_ascii=False, indent=1))
    print(f'fertig: {len(valid)} Dateien, {len(log)} Lesungen aus Kana korrigiert')


if __name__ == '__main__':
    main()
