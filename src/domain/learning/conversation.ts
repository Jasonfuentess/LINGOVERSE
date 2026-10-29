import type { LessonVariant } from './models';
import { normalizeAnswer } from './engine';

// Names, Spanish framing and opening/closing formulas do not define a new conversation.
export function conversationSignature(variant: LessonVariant): string {
  const cache = new Map<string, unknown>();
  const active = new Set<string>();
  const french = (text: string) => normalizeAnswer(text.split('→')[0] ?? '');
  const visit = (id: string | null): unknown => {
    if (id === null) return null;
    if (active.has(id)) throw Error('Ciclo en el perfil conversacional');
    if (cache.has(id)) return cache.get(id);
    const exercise = variant.exercises.find(item => item.id === id);
    if (!exercise) throw Error('Referencia desconocida en perfil conversacional');
    active.add(id);
    let result: unknown;
    if (exercise.objectiveId === 'saluer-depart') result = null;
    else if (exercise.objectiveId === 'saluer') {
      const targets = exercise.kind === 'text' ? [exercise.next] : [...new Set(exercise.choices.filter(option => option.correct).map(option => option.next))];
      const branches = targets.map(visit);
      result = branches.length === 1 ? branches[0] : branches;
    } else if (exercise.kind === 'choice') {
      result = { prompt: french(exercise.prompt), kind: 'choice', answers: exercise.choices.map(option => ({ label: french(option.label), correct: option.correct, reply: french(option.reply), next: option.correct ? visit(option.next) : null })).sort((a, b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0) };
    } else result = { prompt: french(exercise.prompt), kind: 'text', accepted: exercise.accepted.map(french).sort(), reply: french(exercise.reply), next: visit(exercise.next) };
    active.delete(id);
    cache.set(id, result);
    return result;
  };
  return JSON.stringify(visit(variant.start));
}
export function conversationFingerprint(variant: LessonVariant): string {
  let hash = 2166136261;
  for (const character of conversationSignature(variant)) { hash ^= character.codePointAt(0)!; hash = Math.imul(hash, 16777619); }
  return `conversation-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
export function assertDistinctConversations(variants: LessonVariant[]): void {
  const signatures = variants.map(conversationSignature);
  if (new Set(signatures).size !== variants.length) throw Error('Dos variantes comparten la misma conversación educativa');
}
