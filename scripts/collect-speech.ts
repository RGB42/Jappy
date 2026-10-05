// Schreibt alle vorzulesenden Texte nach scripts/speech-corpus.json (Eingabe für generate_audio.py).
import { writeFileSync } from 'node:fs';
import { buildCorpus } from '../src/lib/speechCorpus';

const corpus = buildCorpus();
writeFileSync(new URL('./speech-corpus.json', import.meta.url), JSON.stringify(corpus, null, 1));
const byVoice = corpus.reduce<Record<string, number>>((acc, e) => ((acc[e.voice] = (acc[e.voice] ?? 0) + 1), acc), {});
console.log(`${corpus.length} Einträge`, byVoice);
