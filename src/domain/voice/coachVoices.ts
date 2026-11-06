import type { CoachLocale } from '../preferences';
import type { DeviceVoice } from './playback';

/**
 * RML-001 coach voice selection. Platforms expose only name, language tag and local/network flag; no
 * gender. Gender is therefore a *hint* from a documented table of first names used by common engines
 * (Microsoft, Apple), shown to the user as "probable", never as a guarantee. Accent is a real
 * preference: exact region first, then Latin American Spanish, then Spain. Nothing alters pitch or rate
 * to imitate an accent.
 */
const MALE = ['raul', 'raúl', 'jorge', 'pablo', 'alvaro', 'álvaro', 'gonzalo', 'tomas', 'tomás', 'rodrigo', 'alonso', 'juan', 'diego', 'carlos', 'gerardo', 'enrique', 'andres', 'andrés', 'federico', 'emilio', 'mateo', 'jose', 'josé', 'luciano', 'santiago'];
const FEMALE = ['sabina', 'dalia', 'helena', 'laura', 'elvira', 'salome', 'salomé', 'elena', 'lorena', 'paloma', 'paulina', 'monica', 'mónica', 'soledad', 'marisol', 'lucia', 'lucía', 'carmen', 'isabela', 'renata', 'valeria', 'google español'];
const LATAM = ['es-sv', 'es-mx', 'es-co', 'es-ar', 'es-us', 'es-419', 'es-cl', 'es-pe', 'es-ve', 'es-gt', 'es-hn', 'es-ni', 'es-cr', 'es-pa', 'es-uy', 'es-py', 'es-bo', 'es-ec', 'es-do', 'es-pr', 'es-cu'];
const tag = (language: string) => language.replace(/_/g, '-').toLowerCase();
const words = (name: string) => name.toLowerCase().normalize('NFC');

export type VoiceGenderHint = 'male' | 'female' | 'unknown';
export type VoiceRegionMatch = 'exact' | 'latam' | 'spain' | 'other';
export interface RankedVoice { voice: DeviceVoice; gender: VoiceGenderHint; region: VoiceRegionMatch }

export function genderHint(voice: DeviceVoice): VoiceGenderHint {
  const name = words(voice.name);
  if (FEMALE.some(item => new RegExp(`(^|[^a-záéíóú])${item}([^a-záéíóú]|$)`).test(name))) return 'female';
  if (MALE.some(item => new RegExp(`(^|[^a-záéíóú])${item}([^a-záéíóú]|$)`).test(name))) return 'male';
  return 'unknown';
}
export function regionMatch(voice: DeviceVoice, coach: CoachLocale): VoiceRegionMatch {
  const language = tag(voice.language);
  if (language === tag(coach)) return 'exact';
  if (LATAM.includes(language)) return 'latam';
  if (language === 'es-es' || language === 'es') return 'spain';
  return 'other';
}
/** Spanish voices for a coach, best first: region, then probable male, then local before network. */
export function rankCoachVoices(voices: DeviceVoice[], coach: CoachLocale, allowNetwork: boolean): RankedVoice[] {
  const regionScore = { exact: 3, latam: 2, spain: 1, other: 0 } as const;
  const genderScore = { male: 2, unknown: 1, female: 0 } as const;
  return voices
    .filter(voice => tag(voice.language).split('-')[0] === 'es' && (voice.local !== false || allowNetwork))
    .map(voice => ({ voice, gender: genderHint(voice), region: regionMatch(voice, coach) }))
    .sort((a, b) => regionScore[b.region] * 10 + genderScore[b.gender] * 3 + (b.voice.local !== false ? 1 : 0) - (regionScore[a.region] * 10 + genderScore[a.gender] * 3 + (a.voice.local !== false ? 1 : 0)) || a.voice.name.localeCompare(b.voice.name));
}
export interface CoachVoiceChoice { voice: DeviceVoice | null; ranked: RankedVoice[]; chosenByUser: boolean; notice: string }
const regionName: Record<CoachLocale, string> = { 'es-SV': 'El Salvador', 'es-MX': 'México', 'es-CO': 'Colombia', 'es-AR': 'Argentina' };
export function chooseCoachVoice(voices: DeviceVoice[], coach: CoachLocale, allowNetwork: boolean, savedId?: string | null): CoachVoiceChoice {
  const ranked = rankCoachVoices(voices, coach, allowNetwork);
  const saved = savedId ? ranked.find(item => item.voice.identifier === savedId) : undefined;
  const best = saved ?? ranked.find(item => item.gender === 'male') ?? ranked[0];
  if (!best) return { voice: null, ranked, chosenByUser: false, notice: 'No hay voces en español disponibles. El entrenador se lee en pantalla; podés activar voces del navegador con Internet en «Voces del dispositivo».' };
  const notes: string[] = [];
  if (best.region !== 'exact') notes.push(`No hay voz de ${regionName[coach]} en este dispositivo; se usa ${best.voice.name} (${best.voice.language}).`);
  if (best.gender === 'female') notes.push('No encontramos una voz masculina; se usa una voz femenina.');
  else if (best.gender === 'unknown') notes.push('No podemos confirmar si esta voz es masculina.');
  notes.push('La personalidad regional está en el texto; la voz sintética no garantiza el acento.');
  return { voice: best.voice, ranked, chosenByUser: Boolean(saved), notice: notes.join(' ') };
}
