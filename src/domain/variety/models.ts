export type ContentLanguage = 'en' | 'fr';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ContentCategory = 'mission-variant' | 'exercise' | 'dialogue' | 'reaction' | 'professional';
export type RandomSource = () => number;
export interface ContentCandidate {
  id: string;
  profileId?: string;
  category: ContentCategory;
  language: ContentLanguage;
  level: CefrLevel;
  objectives: string[];
  requires: string[];
  tags: string[];
  baseWeight: number;
  coachLocale?: string;
  explicit?: boolean;
  errorRef?: string;
}
export interface EducationalContext {
  category: ContentCategory;
  language: ContentLanguage;
  level: CefrLevel;
  objectives: string[];
  scopeId: string;
  variantId?: string;
  profileId?: string;
}
export interface SelectionContext extends EducationalContext {
  session: number;
  knownContent: string[];
  tags: string[];
  coachLocale?: string;
  allowExplicit?: boolean;
}
export interface Appearance {
  id: string;
  count: number;
  lastSession: number;
  lastAt: number | null;
  context: EducationalContext;
}
export interface ErrorIdentity {
  id: string;
  scopeId: string;
  objectiveId: string;
  exerciseId: string;
  variantId: string;
  language: ContentLanguage;
}
export interface ErrorFact extends ErrorIdentity { count: number; lastSession: number; lastAt: number | null }
export interface VarietyHistory {
  version: 1;
  session: number;
  entries: Appearance[];
  recent: { id: string; session: number }[];
  errors: ErrorFact[];
}
export interface SelectionPolicy { frequencyPower: number; cooldownSessions: number; repeatFloor: number; tagBonus: number }
export interface SelectionDecision {
  candidateId: string | null;
  reason: 'weighted' | 'no-eligible-content';
  weights: { id: string; weight: number }[];
  excluded: { id: string; reason: string }[];
  draw: number | null;
}
