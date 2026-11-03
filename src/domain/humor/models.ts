import type { CoachLocale } from '../preferences';
import type { CefrLevel, ContentLanguage, RandomSource } from '../variety/models';
export type HumorCategory = 'general' | 'correct' | 'error' | 'retry' | 'recovery' | 'recurring' | 'progress' | 'celebration';
export type HumorMode = 'friendly' | 'adult' | 'roast' | 'latam-mom';
export type HumorIntensity = 'gentle' | 'playful';
export interface Coach { id: string; locale: CoachLocale; name: string; personality: string; introduction: string }
export interface AdultConsent { version: 1; adultConfirmed: true; explicitlyAgreed: true; grantedAt: number }
export interface HumorPreferences { version: 1; enabled: boolean; intensity: HumorIntensity; adventureRoast?: boolean; adult: { enabled: boolean; consent: AdultConsent | null } }
export interface HumorContext {
  answerKind?: 'text' | 'choice';
  referenceId?: string;
  writtenIssue?: import('../learning/written').WrittenIssue;
  learningLanguage: ContentLanguage;
  interfaceLanguage: 'es';
  level: CefrLevel;
  scopeId: string;
  objectiveId: string;
  exerciseId: string;
  category: HumorCategory;
  result: 'correct' | 'incorrect';
  attempts: number;
  wrongAttempts: number;
  completed: number;
  total: number;
  errorRef?: string;
  eventKey: string;
}
export interface EditorialReaction { version: 1; id: string; locale: CoachLocale; category: HumorCategory; mode: HumorMode; intensity: HumorIntensity; explicit: boolean; text: string; writtenIssue?: import('../learning/written').WrittenIssue; exerciseId?: string; educational?: boolean; referenceId?: string; retired?: boolean; learningLanguages?: ('fr'|'en')[] }
export interface SavedReaction extends EditorialReaction { eventKey: string }
export interface HumorRequest { locale: CoachLocale; preferences: HumorPreferences; random?: RandomSource; writtenInput?: string }
