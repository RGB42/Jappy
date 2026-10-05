// Satzanalyse für alle Übungssätze (wird nur bei Bedarf geladen).
import { buildGlossIndex } from '../../lib/gloss';
import type { GlossEntry } from '../types';
import { glosses as p1 } from './p1';
import { glosses as p2 } from './p2';
import { glosses as p3 } from './p3';
import { glosses as p4 } from './p4';
import { glosses as p5 } from './p5';
import { glosses as p6 } from './p6';

export const allGlosses: GlossEntry[] = [...p1, ...p2, ...p3, ...p4, ...p5, ...p6];

export const findGloss = buildGlossIndex(allGlosses);
