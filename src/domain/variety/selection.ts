import { levels, validId, validateContext } from './history';
import type { ContentCandidate, RandomSource, SelectionContext, SelectionDecision, SelectionPolicy, VarietyHistory } from './models';
export const defaultPolicy: SelectionPolicy = { frequencyPower: 0.5, cooldownSessions: 4, repeatFloor: 0.08, tagBonus: 0.5 };
export function seededRandom(seed: number): RandomSource {
  if (!Number.isSafeInteger(seed)) throw Error('Semilla inválida');
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
export function selectContent(candidates: ContentCandidate[], context: SelectionContext, history: VarietyHistory, random: RandomSource, policy: SelectionPolicy = defaultPolicy): SelectionDecision {
  validateContext(context);
  if (!Number.isSafeInteger(context.session) || context.session < history.session || context.session < 1 || context.session > 1_000_000_000 || !Array.isArray(context.knownContent) || !Array.isArray(context.tags) || context.knownContent.length > 256 || context.tags.length > 64) throw Error('Contexto de selección inválido');
  [...context.knownContent, ...context.tags].forEach(validId);
  if (![policy.frequencyPower, policy.cooldownSessions, policy.repeatFloor, policy.tagBonus].every(Number.isFinite) || policy.frequencyPower < 0 || policy.cooldownSessions <= 0 || policy.repeatFloor <= 0 || policy.repeatFloor > 1 || policy.tagBonus < 0) throw Error('Política de pesos inválida');
  const excluded: SelectionDecision['excluded'] = [];
  const weights: SelectionDecision['weights'] = [];
  const ids = new Set<string>();
  for (const candidate of candidates) {
    validId(candidate.id);
    if (candidate.profileId !== undefined) validId(candidate.profileId);
    if (ids.has(candidate.id)) throw Error('Candidato duplicado');
    ids.add(candidate.id);
    validateContext({ ...candidate, scopeId: context.scopeId });
    if (!Array.isArray(candidate.requires) || candidate.requires.length > 256 || !Array.isArray(candidate.tags) || candidate.tags.length > 64 || new Set(candidate.tags).size !== candidate.tags.length || !Number.isFinite(candidate.baseWeight) || candidate.baseWeight <= 0 || candidate.baseWeight > 100) throw Error('Candidato o peso inválido');
    [...candidate.requires, ...candidate.tags].forEach(validId);
    if (candidate.errorRef !== undefined) validId(candidate.errorRef);
    if (candidate.coachLocale !== undefined) validId(candidate.coachLocale);
    if (candidate.explicit !== undefined && typeof candidate.explicit !== 'boolean') throw Error('Clasificación de contenido inválida');
    let reason = '';
    if (candidate.language !== context.language) reason = 'language';
    else if (candidate.category !== context.category) reason = 'category';
    else if (levels.indexOf(candidate.level) > levels.indexOf(context.level)) reason = 'level';
    else if (!context.objectives.every(id => candidate.objectives.includes(id))) reason = 'objectives';
    else if (!candidate.requires.every(id => context.knownContent.includes(id))) reason = 'prerequisites';
    else if (candidate.coachLocale && candidate.coachLocale !== context.coachLocale) reason = 'coach';
    else if (candidate.explicit && context.allowExplicit !== true) reason = 'consent';
    else if (candidate.errorRef && !history.errors.some(fact => fact.id === candidate.errorRef && fact.scopeId === context.scopeId && fact.language === context.language && context.objectives.includes(fact.objectiveId))) reason = 'unrecorded-error';
    if (reason) { excluded.push({ id: candidate.id, reason }); continue; }
    const previous = history.entries.find(item => item.id === candidate.id);
    const profile = candidate.profileId ? history.entries.filter(item => item.context.profileId === candidate.profileId && item.context.scopeId === context.scopeId && item.context.category === candidate.category && item.context.language === context.language) : [];
    // Use the stronger memory of the ID or its whole conversation, avoiding double punishment.
    const count = Math.max(previous?.count ?? 0, profile.reduce((sum, item) => sum + item.count, 0));
    const lastSession = Math.max(previous?.lastSession ?? 0, ...profile.map(item => item.lastSession));
    const frequency = 1 / Math.pow(1 + count, policy.frequencyPower);
    const gap = lastSession ? Math.max(0, context.session - lastSession) : policy.cooldownSessions;
    const recency = lastSession ? Math.max(policy.repeatFloor, Math.min(1, gap / policy.cooldownSessions)) : 1;
    const relevance = 1 + policy.tagBonus * candidate.tags.filter(tag => context.tags.includes(tag)).length;
    const levelFit = 1 / (1 + levels.indexOf(context.level) - levels.indexOf(candidate.level));
    const weight = candidate.baseWeight * frequency * recency * relevance * levelFit;
    if (!Number.isFinite(weight) || weight <= 0) throw Error('Peso calculado fuera de límites');
    weights.push({ id: candidate.id, weight });
  }
  if (!weights.length) return { candidateId: null, reason: 'no-eligible-content', weights, excluded, draw: null };
  const draw = random();
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw Error('El RNG debe devolver [0, 1)');
  let threshold = draw * weights.reduce((sum, item) => sum + item.weight, 0);
  let chosen = weights[weights.length - 1];
  for (const item of weights) { threshold -= item.weight; if (threshold < 0) { chosen = item; break; } }
  return { candidateId: chosen!.id, reason: 'weighted', weights, excluded, draw };
}
