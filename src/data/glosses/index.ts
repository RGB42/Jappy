// Satzanalyse für alle Übungssätze (wird nur bei Bedarf geladen).
import { buildGlossIndex } from '../../lib/gloss';
import type { GlossEntry } from '../types';
import { glosses as p0 } from './p0';

export const allGlosses: GlossEntry[] = [...p0];

export const findGloss = buildGlossIndex(allGlosses);
