// Grobe Bewertung einer Freihand-Zeichnung gegen ein Schriftzeichen.
// Beide Bilder werden auf ein Raster verkleinert; verglichen wird die Überdeckung
// (Wie viel des Zeichens wurde getroffen? Wie viel wurde daneben gemalt?).

export const GRID = 48;

/** Erzeugt eine Maske (true = Tinte) aus einem Canvas. */
export function maskFromCanvas(canvas: HTMLCanvasElement, grid = GRID): boolean[] {
  const small = document.createElement('canvas');
  small.width = grid;
  small.height = grid;
  const ctx = small.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(canvas, 0, 0, grid, grid);
  const data = ctx.getImageData(0, 0, grid, grid).data;
  const mask: boolean[] = [];
  for (let i = 0; i < grid * grid; i++) mask.push(data[i * 4 + 3] > 40);
  return mask;
}

/** Rendert ein Zeichen in eine Maske – gleiche Schrift und Größe wie die Vorlage. */
export function maskFromGlyph(glyph: string, font: string, grid = GRID): boolean[] {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(size * 0.72)}px ${font}`;
  ctx.fillText(glyph, size / 2, size / 2 + size * 0.03);
  return maskFromCanvas(c, grid);
}

export function dilate(mask: boolean[], radius: number, grid = GRID): boolean[] {
  const out = new Array<boolean>(mask.length).fill(false);
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      if (!mask[y * grid + x]) continue;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < grid && ny < grid) out[ny * grid + nx] = true;
        }
      }
    }
  }
  return out;
}

/**
 * Bewertet 0…1: Trefferquote (Zeichen abgedeckt) und Genauigkeit (wenig daneben),
 * mit etwas Toleranz. Strichreihenfolge wird nicht geprüft – es geht ums Ausprobieren.
 */
export function scoreDrawing(user: boolean[], glyph: boolean[], grid = GRID): number {
  const userCount = user.filter(Boolean).length;
  const glyphCount = glyph.filter(Boolean).length;
  if (!userCount || !glyphCount) return 0;
  const glyphWide = dilate(glyph, 1, grid);
  const userWide = dilate(user, 1, grid);
  let inside = 0;
  for (let i = 0; i < user.length; i++) if (user[i] && glyphWide[i]) inside++;
  let covered = 0;
  for (let i = 0; i < glyph.length; i++) if (glyph[i] && userWide[i]) covered++;
  const precision = inside / userCount;
  const recall = covered / glyphCount;
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}
