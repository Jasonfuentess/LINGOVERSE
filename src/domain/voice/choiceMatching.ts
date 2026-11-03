import type { ChoiceExercise } from '../learning/models';
import { normalizeAnswer } from '../learning/engine';
/** A spoken choice is only mapped when it unambiguously matches one visible option.
 * Never guess from approximate phrases or decide the correct answer for the student. */
export function matchSpokenChoice(exercise: ChoiceExercise, transcription: string): string | null {
  const normalized = normalizeAnswer(transcription);
  if (!normalized) return null;
  const matches = exercise.choices.filter(choice => [choice.label, ...(choice.spokenAlternatives ?? [])].some(label => normalizeAnswer(label) === normalized));
  return matches.length === 1 ? matches[0]!.id : null;
}
