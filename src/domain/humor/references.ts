import { humorReferences } from '../../content/humorReferences';
import type { HumorContext } from './models';
export interface ReferenceEvidence { version: 1; referenceId: string; patternId: string; eventKey: string }
export function normalizeReference(input: string): string {
  return input.normalize('NFC').toLowerCase().replace(/[’‘]/g, "'").replace(/^[¡¿\s]+|[.!?\s]+$/g, '').replace(/\s+/g, ' ').trim();
}
export function referenceMatchesContext(reference: typeof humorReferences[number], context: HumorContext): boolean {
  return context.answerKind === 'text' && context.result === 'incorrect' && ['error', 'retry', 'recurring'].includes(context.category) && reference.language === context.learningLanguage && reference.scopeId === context.scopeId && reference.exerciseId === context.exerciseId && reference.objectiveId === context.objectiveId;
}
export function detectReference(input: string, context: HumorContext): ReferenceEvidence | null {
  if (input.length > 400) return null;
  const normalized = normalizeReference(input);
  for (const reference of humorReferences) {
    if (!referenceMatchesContext(reference, context)) continue;
    const pattern = reference.patterns.find(p => normalizeReference(p.exact) === normalized);
    if (pattern) return { version: 1, referenceId: reference.id, patternId: pattern.id, eventKey: context.eventKey };
  }
  return null;
}
export function restoreReference(value: unknown, context: HumorContext | null): ReferenceEvidence | null {
  if (!context || !value || typeof value !== 'object') return null;
  const evidence = value as ReferenceEvidence;
  const source = humorReferences.find(r => r.id === evidence.referenceId);
  if (evidence.version !== 1 || evidence.eventKey !== context.eventKey || !source || !referenceMatchesContext(source, context) || !source.patterns.some(p => p.id === evidence.patternId)) return null;
  return { version: 1, referenceId: source.id, patternId: evidence.patternId, eventKey: context.eventKey };
}
