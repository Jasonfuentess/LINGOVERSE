import type { CoachLocale } from '../domain/preferences';
import type { KeyValueStorage } from './contracts';

/** RML-001: the voice identifier the user chose for each coach. Only identifiers are stored, never audio. */
export interface LiveVoices { version: 1; voices: Partial<Record<CoachLocale, string>> }
const KEY = 'lingoverse.live-voices.v1';
const LOCALES: CoachLocale[] = ['es-SV', 'es-MX', 'es-CO', 'es-AR'];
export const emptyLiveVoices = (): LiveVoices => ({ version: 1, voices: {} });
export function decodeLiveVoices(raw: string): LiveVoices {
  const value = JSON.parse(raw) as Record<string, unknown>;
  if (!value || value.version !== 1 || !value.voices || typeof value.voices !== 'object' || Array.isArray(value.voices)) throw Error('Voces de Roast Me Live inválidas');
  const voices: LiveVoices['voices'] = {};
  for (const [locale, id] of Object.entries(value.voices as Record<string, unknown>)) {
    if (!LOCALES.includes(locale as CoachLocale) || typeof id !== 'string' || !id || id.length > 400) throw Error('Voz de entrenador inválida');
    voices[locale as CoachLocale] = id;
  }
  return { version: 1, voices };
}
export class LiveVoiceRepository {
  constructor(private readonly storage: KeyValueStorage) {}
  async load(): Promise<LiveVoices> {
    const raw = await this.storage.getItem(KEY);
    if (raw === null) return emptyLiveVoices();
    try { return decodeLiveVoices(raw); } catch { return emptyLiveVoices(); }
  }
  async choose(previous: LiveVoices, coach: CoachLocale, voiceId: string | null): Promise<LiveVoices> {
    const voices = { ...previous.voices };
    if (voiceId) voices[coach] = voiceId; else delete voices[coach];
    const next = decodeLiveVoices(JSON.stringify({ version: 1, voices }));
    await this.storage.setItem(KEY, JSON.stringify(next));
    return next;
  }
}
