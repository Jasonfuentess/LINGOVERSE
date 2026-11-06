import type { KeyValueStorage } from './contracts';

/**
 * RML-002 Roast Me Live practice preferences: the learning mode and the preferred way to answer.
 * Stored apart from humor consent, coach, voices and progress, so changing or resetting one never
 * touches the others. `mode: null` means the student has not chosen yet (the choice is required).
 */
export type LiveMode = 'guided' | 'free';
export type LiveAnswerMode = 'spoken' | 'written';
export interface LivePreferences { version: 1; mode: LiveMode | null; answer: LiveAnswerMode }
const KEY = 'lingoverse.live-preferences.v1';
export const defaultLivePreferences = (): LivePreferences => ({ version: 1, mode: null, answer: 'spoken' });
export function decodeLivePreferences(raw: string): LivePreferences {
  const value = JSON.parse(raw) as Record<string, unknown>;
  if (!value || value.version !== 1 || ![null, 'guided', 'free'].includes(value.mode as string | null) || !['spoken', 'written'].includes(value.answer as string)) throw Error('Preferencias de Roast Me Live inválidas');
  return { version: 1, mode: value.mode as LiveMode | null, answer: value.answer as LiveAnswerMode };
}
export class LivePreferencesRepository {
  constructor(private readonly storage: KeyValueStorage) {}
  async load(): Promise<LivePreferences> {
    const raw = await this.storage.getItem(KEY);
    if (raw === null) return defaultLivePreferences();
    try { return decodeLivePreferences(raw); } catch { return defaultLivePreferences(); }
  }
  async save(change: Partial<Omit<LivePreferences, 'version'>>, previous: LivePreferences): Promise<LivePreferences> {
    const next = decodeLivePreferences(JSON.stringify({ ...previous, ...change, version: 1 }));
    await this.storage.setItem(KEY, JSON.stringify(next));
    return next;
  }
}
