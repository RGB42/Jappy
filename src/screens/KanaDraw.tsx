// Kana schreiben: Zeichen hören, nachzeichnen (mit oder ohne Vorlage), grobe Bewertung.
import { useEffect, useMemo, useRef, useState } from 'react';
import { SpeakButton, say } from '../components/Audio';
import { Icon } from '../components/Icon';
import { Header, ProgressBar, Segmented, shuffle } from '../components/ui';
import { kanaMnemonic } from '../data';
import { kanaRomaji, kanaRows, rowChars, type KanaScript } from '../data/kana';
import { maskFromCanvas, maskFromGlyph, scoreDrawing } from '../lib/drawing';
import { useRoute } from '../lib/router';
import { addXP, setKanaBox } from '../lib/store';

// Gleiche Schrift wie die Vorlage (siehe --font-jp in styles.css).
const FONT_JP = "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic UI', 'Yu Gothic', Meiryo, sans-serif";

export function KanaDraw() {
  const { params } = useRoute();
  const script = (params.get('script') as KanaScript) ?? 'hiragana';
  const rowsParam = params.get('rows') ?? 'a';
  const chars = useMemo(() => {
    const rows = rowsParam.split(',');
    return shuffle(kanaRows.filter((r) => rows.includes(r.id)).flatMap((r) => rowChars(r, script)));
  }, [rowsParam, script]);
  const [i, setI] = useState(0);
  const [guide, setGuide] = useState<'trace' | 'memory'>('trace');
  const [score, setScore] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);

  const char = chars[i % chars.length];

  useEffect(() => {
    clear();
    void say(char);
  }, [char]);

  const ctx = () => canvasRef.current?.getContext('2d') ?? null;

  const setupCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const g = c.getContext('2d')!;
    g.scale(dpr, dpr);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.lineWidth = Math.max(8, rect.width * 0.045);
    g.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#c8374d';
  };

  function clear() {
    setupCanvas();
    strokes.current = 0;
    setScore(null);
  }

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent) => {
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    strokes.current++;
    const g = ctx();
    if (g && last.current) {
      g.beginPath();
      g.arc(last.current.x, last.current.y, g.lineWidth / 2, 0, Math.PI * 2);
      g.fillStyle = g.strokeStyle;
      g.fill();
    }
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const g = ctx();
    const p = pos(e);
    if (g && last.current) {
      g.beginPath();
      g.moveTo(last.current.x, last.current.y);
      g.lineTo(p.x, p.y);
      g.stroke();
    }
    last.current = p;
  };
  const up = () => {
    drawing.current = false;
    last.current = null;
  };

  const check = () => {
    const c = canvasRef.current;
    if (!c || !strokes.current) return;
    const s = scoreDrawing(maskFromCanvas(c), maskFromGlyph(char, FONT_JP));
    // Auf eine freundliche Skala abbilden: ein einzelner Strich ≈ 0 %, sauber nachgezeichnet ≈ 100 %.
    const friendly = Math.max(0, Math.min(1, (s - 0.3) / 0.5));
    setScore(friendly);
    setKanaBox(char, friendly >= 0.6);
    addXP(friendly >= 0.6 ? 2 : 1);
    void say(char);
  };

  const next = () => setI((x) => x + 1);

  return (
    <>
      <Header title="Kana schreiben" subtitle={`${script === 'hiragana' ? 'Hiragana' : 'Katakana'} · ${(i % chars.length) + 1}/${chars.length}`} />
      <ProgressBar value={(i % chars.length) + 1} max={chars.length} />
      <div className="stack mt">
        <Segmented
          value={guide}
          onChange={(v) => {
            setGuide(v);
            clear();
          }}
          options={[
            { value: 'trace', label: 'Nachzeichnen' },
            { value: 'memory', label: 'Aus dem Gedächtnis' },
          ]}
        />
        <div className="row gap center">
          <SpeakButton text={char} size="lg" />
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{kanaRomaji(char)}</div>
            {guide === 'memory' && score === null && <div className="muted small">Hör zu und schreib das Zeichen.</div>}
          </div>
        </div>
        <div className="draw-wrap">
          <div className="draw-cross" />
          {(guide === 'trace' || score !== null) && (
            <div className="draw-guide" lang="ja" style={score !== null ? { opacity: 0.25 } : undefined}>
              {char}
            </div>
          )}
          <canvas
            ref={canvasRef}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            aria-label={`Zeichenfläche für ${kanaRomaji(char)}`}
          />
        </div>
        {kanaMnemonic(char) && <p className="muted small center">💡 {kanaMnemonic(char)}</p>}
        {score !== null && (
          <div className={`feedback ${score >= 0.8 ? 'feedback-ok' : score >= 0.6 ? 'feedback-info' : 'feedback-bad'} center`}>
            {score >= 0.8 ? 'Sehr schön! 上手！' : score >= 0.6 ? 'Gut erkennbar!' : 'Probier es noch mal – achte auf die Form.'} ({Math.round(score * 100)} %)
          </div>
        )}
        <div className="row gap">
          <button className="btn grow" onClick={clear}>
            <Icon name="undo" size={18} /> Löschen
          </button>
          {score === null ? (
            <button className="btn btn-primary grow" onClick={check}>
              Prüfen
            </button>
          ) : (
            <button className="btn btn-primary grow" onClick={next}>
              Nächstes
            </button>
          )}
        </div>
        <p className="muted small center">Tipp: Japanische Zeichen werden von oben nach unten und von links nach rechts geschrieben.</p>
      </div>
    </>
  );
}
