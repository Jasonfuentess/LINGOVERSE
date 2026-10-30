import type { TextExercise } from './models';
export type WrittenIssue = 'spelling' | 'vocabulary' | 'structure' | 'unknown';
export interface WrittenRule { input: string; issue: WrittenIssue; explanation: string }
export function normalizeWritten(value: string): string {
  return value.normalize('NFC').toLocaleLowerCase('fr').replace(/[’‘]/g, "'").replace(/^[¡¿\s]+|[.!?\s]+$/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
}
// Exact editorial equivalences and known mistakes; no fuzzy semantic acceptance.
export function validateWritten(exercise: TextExercise, input: string) {
  const normalized = normalizeWritten(input);
  const accepted = exercise.accepted.find(value => normalizeWritten(value) === normalized);
  if (accepted) return { correct: true, retained: accepted, issue: undefined, explanation: exercise.explanation };
  const rule = exercise.writtenRules?.find(value => normalizeWritten(value.input) === normalized);
  return { correct: false, retained: rule?.input ?? '', issue: rule?.issue ?? 'unknown' as WrittenIssue, explanation: rule?.explanation ?? 'No podemos identificar con certeza la causa. Usá una de las expresiones enseñadas; otras formulaciones pueden quedar fuera de este ejercicio guiado.' };
}
