export type LearningLanguage = 'en' | 'fr';
export type CoachLocale = 'es-SV' | 'es-MX' | 'es-CO' | 'es-AR';
export interface Preferences {
  version: 1;
  mode: 'guest';
  learningLanguage: LearningLanguage;
  interfaceLanguage: 'es';
  coachLocale: CoachLocale;
  voiceProvider: 'none';
  explicitHumorEnabled: false;
  onboardingCompleted: boolean;
}
export type PreferencesChange = Partial<Pick<Preferences, 'learningLanguage' | 'coachLocale' | 'onboardingCompleted'>>;
export function defaults(): Preferences {
  return { version: 1, mode: 'guest', learningLanguage: 'en', interfaceLanguage: 'es', coachLocale: 'es-SV', voiceProvider: 'none', explicitHumorEnabled: false, onboardingCompleted: false };
}
export function decodePreferences(raw: string): Preferences {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('Preferencias inválidas');
  const p = value as Record<string, unknown>;
  if (p.version !== 1 || p.mode !== 'guest' || typeof p.learningLanguage !== 'string' || !['en', 'fr'].includes(p.learningLanguage) ||
    typeof p.coachLocale !== 'string' || !['es-SV', 'es-MX', 'es-CO', 'es-AR'].includes(p.coachLocale) || p.interfaceLanguage !== 'es' ||
    p.voiceProvider !== 'none' || p.explicitHumorEnabled !== false || typeof p.onboardingCompleted !== 'boolean') {
    throw new Error('Versión o preferencias no admitidas');
  }
  return { ...defaults(), learningLanguage: p.learningLanguage as LearningLanguage, coachLocale: p.coachLocale as CoachLocale, onboardingCompleted: p.onboardingCompleted };
}
export function changePreferences(previous: Preferences, change: PreferencesChange): Preferences {
  return decodePreferences(JSON.stringify({ ...previous, ...change }));
}
