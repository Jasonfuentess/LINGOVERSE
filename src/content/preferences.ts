import type { CoachLocale, LearningLanguage } from '../domain/preferences';
// Stable IDs and UI labels only. These are not lesson or coach dialogue packs.
export const languages: { id: LearningLanguage; label: string; detail: string }[] = [
  { id: 'en', label: 'Inglés', detail: 'English' },
  { id: 'fr', label: 'Francés', detail: 'Français' },
];
export const coaches: { id: CoachLocale; label: string; detail: string }[] = [
  { id: 'es-SV', label: 'El Salvador', detail: 'Español salvadoreño' },
  { id: 'es-MX', label: 'México', detail: 'Español mexicano' },
  { id: 'es-CO', label: 'Colombia', detail: 'Español colombiano' },
  { id: 'es-AR', label: 'Argentina', detail: 'Español argentino' },
];
