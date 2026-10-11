// Übungen unterbrechen und später weitermachen: Der Stand einer laufenden Übung wird nach jedem Schritt auf dem
// Gerät gespeichert (pro Route). Nach Neuladen, App-Wechsel oder späterem Öffnen geht es dort weiter.
import { useEffect, useRef, useState, useSyncExternalStore, type Dispatch, type SetStateAction } from 'react';
import { useRoute } from './router';

const KEY = 'jappy:resume';
const MAX_AGE = 14 * 24 * 60 * 60 * 1000;

export interface ResumeRecord {
  id: string; // Route inkl. Parameter, z. B. "/learn?items=w-a,w-b"
  title: string;
  done: number;
  total: number;
  savedAt: number;
  fields: Record<string, unknown>;
}

/** Umwandlung für gespeicherte Werte (z. B. Objekte → IDs). `load` liefert undefined, wenn ungültig. */
export interface Codec<T> {
  save: (value: T) => unknown;
  load: (raw: unknown) => T | undefined;
}

const memory = new Map<string, string>();
let records: ResumeRecord[] | null = null;
let version = 0;
const listeners = new Set<() => void>();

function read(): ResumeRecord[] {
  if (records) return records;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = memory.get(KEY) ?? null;
  }
  try {
    const list = raw ? (JSON.parse(raw) as ResumeRecord[]) : [];
    records = list.filter((r) => r && typeof r.id === 'string' && Date.now() - r.savedAt < MAX_AGE);
  } catch {
    records = [];
  }
  return records;
}

function write(next: ResumeRecord[]) {
  records = next;
  version++;
  const json = JSON.stringify(next);
  try {
    localStorage.setItem(KEY, json);
  } catch {
    memory.set(KEY, json);
  }
  listeners.forEach((l) => l());
}

export function getResume(id: string): ResumeRecord | undefined {
  return read().find((r) => r.id === id);
}

export function saveResume(rec: ResumeRecord) {
  write([rec, ...read().filter((r) => r.id !== rec.id)].slice(0, 20));
}

export function clearResume(id: string) {
  if (read().some((r) => r.id === id)) write(read().filter((r) => r.id !== id));
}

/** Unterbrochene Übungen, neueste zuerst. */
export function useResumeList(): ResumeRecord[] {
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => version,
  );
  return [...read()].sort((a, b) => b.savedAt - a.savedAt);
}

export interface Resume {
  /** Wie useState – aber der Wert wird mit der Übung gespeichert und beim Fortsetzen wiederhergestellt. */
  field: <T>(name: string, init: T | (() => T), codec?: Codec<T>) => [T, Dispatch<SetStateAction<T>>];
  /** Fortschritt melden (bei jedem Rendern). Gespeichert wird erst ab dem ersten erledigten Schritt. */
  progress: (done: number, total: number) => void;
  /** Übung abgeschlossen → gespeicherten Stand löschen. */
  finish: () => void;
  /** Von vorn beginnen. */
  restart: () => void;
  /** Wurde ein gespeicherter Stand geladen? */
  resumed: boolean;
}

/**
 * Speicherbarer Zustand für eine Übung. `id` ist meist die aktuelle Route.
 * Alle `field`-Aufrufe müssen (wie Hooks) bei jedem Rendern in derselben Reihenfolge erfolgen.
 */
export function useResume(id: string, title: string): Resume {
  const [initial] = useState(() => getResume(id));
  const record = useRef(initial); // wird nach Abschluss/Neustart verworfen
  const [resumed, setResumed] = useState(!!initial);
  const fields = useRef(new Map<string, { value: unknown; codec?: Codec<unknown>; init: () => unknown; set: Dispatch<SetStateAction<unknown>> }>());
  const meta = useRef({ done: 0, total: 0 });
  const finished = useRef(false);
  const lastSaved = useRef('');
  const pending = useRef(false);

  const save = () => {
    const { done, total } = meta.current;
    if (finished.current) {
      // Neue Runde im selben Bildschirm (z. B. „Neue Sätze“) → wieder speichern.
      if (done === 0) finished.current = false;
      return;
    }
    if (done <= 0) {
      if (lastSaved.current) clearResume(id);
      lastSaved.current = '';
      return;
    }
    const data: Record<string, unknown> = {};
    for (const [k, f] of fields.current) data[k] = f.codec ? f.codec.save(f.value) : f.value;
    const json = JSON.stringify([data, done, total]);
    if (json === lastSaved.current) return;
    lastSaved.current = json;
    saveResume({ id, title, done, total, savedAt: Date.now(), fields: data });
  };
  // Nach dem Rendern (auch von Unterkomponenten, die Felder besitzen) einmal gesammelt speichern.
  const schedule = () => {
    if (pending.current) return;
    pending.current = true;
    queueMicrotask(() => {
      pending.current = false;
      save();
    });
  };
  useEffect(schedule);

  function field<T>(name: string, init: T | (() => T), codec?: Codec<T>): [T, Dispatch<SetStateAction<T>>] {
    const initFn = (typeof init === 'function' ? init : () => init) as () => T;
    const [value, set] = useState<T>(() => {
      const rec = record.current;
      if (rec && name in rec.fields) {
        const raw = rec.fields[name];
        const v = codec ? codec.load(raw) : (raw as T);
        if (v !== undefined) return v;
      }
      return initFn();
    });
    fields.current.set(name, { value, codec: codec as Codec<unknown> | undefined, init: initFn, set: set as Dispatch<SetStateAction<unknown>> });
    useEffect(schedule);
    return [value, set];
  }

  return {
    field,
    progress: (done, total) => {
      meta.current = { done, total };
    },
    finish: () => {
      finished.current = true;
      record.current = undefined;
      clearResume(id);
    },
    restart: () => {
      finished.current = false;
      record.current = undefined;
      lastSaved.current = '';
      clearResume(id);
      for (const f of fields.current.values()) f.set(f.init());
      setResumed(false);
    },
    resumed,
  };
}

/** Codec für Listen von Objekten mit ID (z. B. Lerninhalte): gespeichert werden nur die IDs. */
export function idList<T>(byId: (id: string) => T | undefined, idOf: (x: T) => string): Codec<T[]> {
  return {
    save: (list) => list.map(idOf),
    load: (raw) => {
      if (!Array.isArray(raw)) return undefined;
      const out = raw.map((x) => byId(String(x)));
      return out.every((x) => x !== undefined) ? (out as T[]) : undefined;
    },
  };
}

/** useResume für die aktuelle Route (Pfad + Parameter, z. B. Lektion oder Dialog). */
export function useRouteResume(title: string): Resume {
  const { path, params } = useRoute();
  const q = params.toString();
  return useResume(q ? `${path}?${q}` : path, title);
}
