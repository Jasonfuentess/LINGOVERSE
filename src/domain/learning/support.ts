import type { LearningLanguage } from '../preferences';

/** Self-selected support, never a measured CEFR level. Later levels have no content here. */
export type LearningStage = 'pre-a1' | 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';
export type EntryStage = Extract<LearningStage, 'pre-a1' | 'a1'>;
export type PreparationStep = 'listen' | 'meaning' | 'parts' | 'rehearse' | 'respond' | 'done';
export type PhraseId = 'fr-greeting' | 'en-help-greeting-v4' | 'en-greeting-legacy';
export interface LanguageSupport {
  stage: EntryStage;
  mode: 'guided' | 'independent';
  checkpoints: Partial<Record<PhraseId, PreparationStep>>;
}
export interface LearningSupport { version: 1; languages: Record<LearningLanguage, LanguageSupport> }
export interface SupportChange { stage?: EntryStage; mode?: LanguageSupport['mode']; checkpoint?: { id: PhraseId; step: PreparationStep } }
export type PedagogicalMode = 'starter' | 'a1' | 'autonomous';
export function pedagogicalMode(entry: Pick<LanguageSupport, 'stage' | 'mode'>): PedagogicalMode {
  return entry.mode === 'independent' ? 'autonomous' : entry.stage === 'pre-a1' ? 'starter' : 'a1';
}
const steps: PreparationStep[] = ['listen', 'meaning', 'parts', 'rehearse', 'respond', 'done'];
export function advancePreparation(step: PreparationStep): PreparationStep {
  return step === 'respond' || step === 'done' ? step : steps[steps.indexOf(step) + 1]!;
}
export function supportDefaults(): LearningSupport {
  return { version: 1, languages: { fr: { stage: 'pre-a1', mode: 'guided', checkpoints: {} }, en: { stage: 'pre-a1', mode: 'guided', checkpoints: {} } } };
}
export function decodeSupport(raw: string): LearningSupport {
  const value = JSON.parse(raw) as LearningSupport;
  if (!value || value.version !== 1 || !value.languages || typeof value.languages !== 'object') throw Error('Ayuda de aprendizaje incompatible');
  const result = supportDefaults();
  for (const language of ['fr', 'en'] as const) {
    const entry = value.languages[language];
    if (!entry || !['pre-a1', 'a1'].includes(entry.stage) || !['guided', 'independent'].includes(entry.mode) || !entry.checkpoints || typeof entry.checkpoints !== 'object' || Array.isArray(entry.checkpoints)) throw Error('Ayuda de aprendizaje inválida');
    for (const [id, step] of Object.entries(entry.checkpoints)) {
      if (!(language === 'fr' ? ['fr-greeting'] : ['en-help-greeting-v4', 'en-greeting-legacy']).includes(id) || !steps.includes(step)) throw Error('Expresión o idioma de práctica inválido');
    }
    result.languages[language] = { stage: entry.stage, mode: entry.mode, checkpoints: { ...entry.checkpoints } };
  }
  return result;
}
