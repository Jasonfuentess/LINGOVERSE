import type { EducationalContext, ErrorIdentity, VarietyHistory } from './models';
export const LIMITS = { entries: 256, recent: 64, errors: 64, counter: 1_000_000_000 } as const;
export const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const categories = ['mission-variant', 'exercise', 'dialogue', 'reaction', 'professional'] as const;
export function emptyHistory(): VarietyHistory { return { version: 1, session: 0, entries: [], recent: [], errors: [] }; }
export function validId(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9:/._-]{0,199}$/.test(value)) throw Error('ID de contenido inválido');
}
function integer(value: unknown, max: number = LIMITS.counter): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < 0 || (value as number) > max) throw Error('Contador de historial inválido');
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Registro de historial inválido');
  return value as Record<string, unknown>;
}
function array(value: unknown, max: number): asserts value is unknown[] {
  if (!Array.isArray(value) || value.length > max) throw Error('Historial fuera de límites');
}
function language(value: unknown) { if (value !== 'en' && value !== 'fr') throw Error('Idioma inválido'); }
function timestamp(value: number | null) {
  if (value !== null && (!Number.isSafeInteger(value) || value < 0)) throw Error('Fecha inválida');
}
export function validateContext(value: unknown): asserts value is EducationalContext {
  const ctx = record(value);
  validId(ctx.scopeId); language(ctx.language);
  if (!categories.includes(ctx.category as never) || !levels.includes(ctx.level as never)) throw Error('Categoría o CEFR inválido');
  array(ctx.objectives, 64); ctx.objectives.forEach(validId);
  if (ctx.variantId !== undefined) validId(ctx.variantId);
  if (ctx.profileId !== undefined) validId(ctx.profileId);
}
export function validateHistory(value: unknown): VarietyHistory {
  const history = record(value);
  if (history.version !== 1) throw Error('Versión de historial no admitida');
  integer(history.session);
  array(history.entries, LIMITS.entries); array(history.errors, LIMITS.errors); array(history.recent, LIMITS.recent);
  const ids = new Set<string>();
  for (const raw of history.entries) {
    const item = record(raw); validId(item.id); integer(item.count); integer(item.lastSession, history.session);
    if (item.count === 0 || ids.has(item.id)) throw Error('Aparición duplicada o vacía');
    ids.add(item.id); validateContext(item.context);
    if (item.lastAt !== null) { if (typeof item.lastAt !== 'number' || !Number.isSafeInteger(item.lastAt) || item.lastAt < 0) throw Error('Fecha inválida'); }
  }
  ids.clear();
  for (const raw of history.errors) {
    const item = record(raw);
    for (const key of ['id', 'scopeId', 'objectiveId', 'exerciseId', 'variantId']) validId(item[key]);
    language(item.language); integer(item.count); integer(item.lastSession, history.session);
    if (!item.count || ids.has(String(item.id))) throw Error('Hecho de error inválido');
    ids.add(String(item.id));
    if (item.lastAt !== null && (typeof item.lastAt !== 'number' || !Number.isSafeInteger(item.lastAt) || item.lastAt < 0)) throw Error('Fecha inválida');
  }
  for (const raw of history.recent) { const item = record(raw); validId(item.id); integer(item.session, history.session); }
  // Rebuild only the allowed fields; arbitrary extra text/personal fields are not retained.
  const typed = value as VarietyHistory;
  return { version: 1, session: typed.session,
    entries: typed.entries.map(item => ({ id: item.id, count: item.count, lastSession: item.lastSession, lastAt: item.lastAt, context: compactContext(item.context) })),
    recent: typed.recent.map(item => ({ id: item.id, session: item.session })),
    errors: typed.errors.map(item => ({ id: item.id, scopeId: item.scopeId, objectiveId: item.objectiveId, exerciseId: item.exerciseId, variantId: item.variantId, language: item.language, count: item.count, lastSession: item.lastSession, lastAt: item.lastAt })),
  };
}
function compactContext(ctx: EducationalContext): EducationalContext {
  return { category: ctx.category, language: ctx.language, level: ctx.level, scopeId: ctx.scopeId, objectives: [...ctx.objectives], ...(ctx.variantId ? { variantId: ctx.variantId } : {}), ...(ctx.profileId ? { profileId: ctx.profileId } : {}) };
}
export function nextSession(history: VarietyHistory): VarietyHistory {
  if (history.session >= LIMITS.counter) throw Error('Se alcanzó el límite de sesiones');
  return { ...history, session: history.session + 1 };
}
export function noteAppearance(history: VarietyHistory, id: string, context: EducationalContext, at: number | null): VarietyHistory {
  validId(id); validateContext(context); timestamp(at); integer(history.session);
  const previous = history.entries.find(item => item.id === id);
  const entry = { id, count: Math.min((previous?.count ?? 0) + 1, LIMITS.counter), lastSession: history.session, lastAt: at, context: compactContext(context) };
  return { ...history, entries: [...history.entries.filter(item => item.id !== id), entry].slice(-LIMITS.entries), recent: [...history.recent, { id, session: history.session }].slice(-LIMITS.recent) };
}
// Callers must supply a fact derived from a real evaluator, never an inferred pronunciation mistake.
export function recordError(history: VarietyHistory, identity: ErrorIdentity, at: number | null): VarietyHistory {
  for (const field of ['id', 'scopeId', 'objectiveId', 'exerciseId', 'variantId'] as const) validId(identity[field]);
  language(identity.language); timestamp(at); integer(history.session);
  const previous = history.errors.find(item => item.id === identity.id);
  const fact = { id: identity.id, scopeId: identity.scopeId, objectiveId: identity.objectiveId, exerciseId: identity.exerciseId, variantId: identity.variantId, language: identity.language, count: Math.min((previous?.count ?? 0) + 1, LIMITS.counter), lastSession: history.session, lastAt: at };
  return { ...history, errors: [...history.errors.filter(item => item.id !== identity.id), fact].slice(-LIMITS.errors) };
}
