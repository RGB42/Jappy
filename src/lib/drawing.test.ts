import { describe, expect, it } from 'vitest';
import { dilate, scoreDrawing } from './drawing';

const G = 10;
const mask = (cells: [number, number][]) => {
  const m = new Array<boolean>(G * G).fill(false);
  for (const [x, y] of cells) m[y * G + x] = true;
  return m;
};
const vertical = (x: number) => mask(Array.from({ length: 8 }, (_, i) => [x, i + 1] as [number, number]));
const horizontal = (y: number) => mask(Array.from({ length: 8 }, (_, i) => [i + 1, y] as [number, number]));

describe('Zeichen-Bewertung', () => {
  it('identische Striche ergeben 1', () => {
    expect(scoreDrawing(vertical(5), vertical(5), G)).toBe(1);
  });
  it('leicht versetzt bleibt hoch', () => {
    expect(scoreDrawing(vertical(6), vertical(5), G)).toBe(1);
  });
  it('quer statt längs ist schlecht', () => {
    expect(scoreDrawing(horizontal(5), vertical(5), G)).toBeLessThan(0.4);
  });
  it('leere Zeichnung ergibt 0', () => {
    expect(scoreDrawing(mask([]), vertical(5), G)).toBe(0);
  });
  it('dilate erweitert um den Radius', () => {
    expect(dilate(mask([[5, 5]]), 1, G).filter(Boolean)).toHaveLength(9);
  });
});
