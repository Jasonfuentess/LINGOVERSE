import { coaches, reactionLibrary } from '../../content/humor';
import type { CoachLocale } from '../preferences';
import { selectContent } from '../variety/selection';
import { validId } from '../variety/history';
import type { RandomSource, SelectionContext, VarietyHistory } from '../variety/models';
import { decodeHumorPreferences } from './preferences';
import type { EditorialReaction, HumorContext, HumorPreferences, SavedReaction } from './models';
import { humorReferences } from '../../content/humorReferences';
import { referenceMatchesContext } from './references';
const categories = ['general', 'correct', 'error', 'retry', 'recovery', 'recurring', 'progress', 'celebration'];
export function validateLibrary(library: EditorialReaction[]): void {
  const ids = new Set<string>();
  if (!Array.isArray(library) || library.length > 512) throw Error('Biblioteca de humor inválida');
  for (const item of library) {
    if(item.learningLanguages && (!Array.isArray(item.learningLanguages)||!item.learningLanguages.length||item.learningLanguages.some(language=>language!=='fr'&&language!=='en'))) throw Error('Idioma de reacción inválido');
    validId(item.id);
    if (ids.has(item.id) || item.version !== 1 || !coaches.some(coach => coach.locale === item.locale) || !categories.includes(item.category) || !['friendly', 'adult', 'roast', 'latam-mom'].includes(item.mode) || !['gentle', 'playful'].includes(item.intensity) || typeof item.explicit !== 'boolean' || typeof item.text !== 'string' || item.text.trim().length < 10 || item.text.length > 500) throw Error('Reacción editorial inválida');
    ids.add(item.id);
  }
}
function categorySupported(item: EditorialReaction, context: HumorContext | null, history: VarietyHistory): boolean {
  if(context && item.learningLanguages && !item.learningLanguages.includes(context.learningLanguage)) return false;
  if (item.referenceId) {
    const reference = humorReferences.find(r => r.id === item.referenceId);
    if (!context || context.referenceId !== item.referenceId || !reference || !referenceMatchesContext(reference, context)) return false;
  }
  if (item.exerciseId && item.exerciseId !== context?.exerciseId) return false;
  if (item.writtenIssue && item.writtenIssue !== context?.writtenIssue) return false;
  if (item.category === 'general') return true;
  if (!context || item.category !== context.category) return false;
  switch (item.category) {
    case 'correct': return context.result === 'correct' && context.wrongAttempts === 0;
    case 'error': return context.result === 'incorrect';
    case 'retry': return context.result === 'incorrect' && context.attempts >= 2;
    case 'recovery': return context.result === 'correct' && context.wrongAttempts > 0 && history.errors.some(fact => fact.id === context.errorRef && fact.scopeId === context.scopeId && fact.objectiveId === context.objectiveId && fact.language === context.learningLanguage && fact.count >= context.wrongAttempts);
    case 'recurring': return context.result === 'incorrect' && history.errors.some(fact => fact.id === context.errorRef && fact.scopeId === context.scopeId && fact.objectiveId === context.objectiveId && fact.language === context.learningLanguage && fact.count >= 3);
    case 'progress': return context.result === 'correct' && context.completed > 0 && context.completed < context.total;
    case 'celebration': return context.result === 'correct' && context.total > 0 && context.completed === context.total;
  }
}
function fallback(locale: CoachLocale): EditorialReaction {
  const coach = coaches.find(coach => coach.locale === locale);
  if (!coach) throw Error('Región de entrenador desconocida');
  return { version: 1, id: `humor-v1:fallback:${locale}`, locale, category: 'general', mode: 'friendly', intensity: 'gentle', explicit: false, text: coach.introduction };
}
export function selectReaction(context: HumorContext | null, locale: CoachLocale, settings: HumorPreferences, history: VarietyHistory, random: RandomSource, library = reactionLibrary, mode: 'friendly' | 'roast' = 'friendly'): SavedReaction | null {
  const preferences = decodeHumorPreferences(JSON.stringify(settings));
  if (mode === 'friendly' && !preferences.enabled) return null;
  validateLibrary(library);
  const adultAllowed = preferences.adult.enabled && preferences.adult.consent !== null;
  if (mode === 'roast' && !adultAllowed) return null;
  const eligible = library.filter(item => !item.retired && item.locale === locale && (mode === 'roast' || item.intensity === 'gentle' || preferences.intensity === 'playful') && (mode === 'roast' ? item.mode === 'roast' : item.mode === 'friendly' || (item.mode === 'adult' && adultAllowed)) && (!item.explicit || adultAllowed) && categorySupported(item, context, history));
  const specific = eligible.filter(item => item.category === context?.category);
  const references = specific.filter(item => item.referenceId);
  const diagnosed = references.length ? references : specific.filter(item => (item.writtenIssue === context?.writtenIssue && item.writtenIssue) || item.educational);
  const pool = diagnosed.length ? diagnosed : specific.length ? specific : eligible.filter(item => item.category === 'general');
  // Roast's small contextual pools need within-session memory as well as session cooldown.
  // Keep a positive weight: repetitions remain possible and singleton pools still work.
  const lastInPool = mode === 'roast' && pool.length > 1 ? [...history.recent].reverse().find(appearance => pool.some(item => item.id === appearance.id))?.id : undefined;
  const selectionContext: SelectionContext = {
    language: context?.learningLanguage ?? 'fr', level: context?.level ?? 'A1', category: 'reaction', scopeId: context?.scopeId ?? 'practice',
    objectives: context ? [context.objectiveId] : [], session: Math.max(1, history.session), knownContent: [], tags: [], coachLocale: locale, allowExplicit: adultAllowed,
  };
  const decision = selectContent(pool.map(item => ({ id: item.id, language: selectionContext.language, level: selectionContext.level, category: 'reaction', objectives: selectionContext.objectives, requires: [], tags: [], baseWeight: item.id === lastInPool ? 0.05 : 1, coachLocale: item.locale, explicit: item.explicit, ...(item.category === 'recurring' ? { errorRef: context?.errorRef } : {}) })), selectionContext, history, random);
  const selected = pool.find(item => item.id === decision.candidateId) ?? fallback(locale);
  return { ...selected, eventKey: context?.eventKey ?? 'general' };
}
export function restoreReaction(value: unknown, context: HumorContext | null, history: VarietyHistory, library = reactionLibrary): SavedReaction | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as SavedReaction;
  if (!coaches.some(coach => coach.locale === saved.locale)) return null;
  const source = library.find(item => item.id === saved.id) ?? fallback(saved.locale);
  if (source.locale !== saved.locale || source.id !== saved.id || source.text !== saved.text || source.version !== saved.version || source.category !== saved.category || source.mode !== saved.mode || source.explicit !== saved.explicit || source.intensity !== saved.intensity || saved.eventKey !== (context?.eventKey ?? 'general') || !categorySupported(source, context, history)) return null;
  return { ...source, eventKey: saved.eventKey };
}
