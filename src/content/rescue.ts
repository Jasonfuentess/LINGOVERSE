import type { Exercise, LearnerAnswer } from '../domain/learning/models';
import { evaluateAnswer, normalizeAnswer } from '../domain/learning/engine';
import { containsPhrase, guidesWithin, pronunciationFor, pronunciationGuides, type PronunciationGuide } from './pronunciation';
export interface RescueModel { text: string; answer: LearnerAnswer }
export interface RescuePlan extends RescueModel {
  id: string; meaning: string; vocabulary: string; segments: string[];
  /** What the expression is for in this turn (the exercise's own instruction). */
  purpose: string;
  pronunciation: PronunciationGuide | null; alternatives: RescueModel[]; usefulGuides: PronunciationGuide[];
}
/** Only accepted editorial originals; nothing inferred from a student's transcript. */
export function learningRescue(language: 'fr' | 'en', adventure: 'cafe' | 'rendezvous', exercise: Exercise): RescuePlan | null {
  const alternatives: RescueModel[] = exercise.kind === 'choice'
    ? exercise.choices.filter(c => c.correct).map(c => ({ text: c.label, answer: { kind: 'choice', choiceId: c.id } }))
    : exercise.accepted.map(text => ({ text, answer: { kind: 'text', text } }));
  const preferred = alternatives.find(m => normalizeAnswer(m.text) === normalizeAnswer(exercise.correction.split(' / ')[0]!)) ?? alternatives[0];
  if (!preferred || !evaluateAnswer(exercise, preferred.answer).correct) return null;
  const guide = pronunciationFor(preferred.text, language);
  const useful = new Map<string, PronunciationGuide>();
  for (const item of pronunciationGuides) if (item.language === language && containsPhrase(exercise.teaching, item.original)) useful.set(item.id, item);
  for (const model of alternatives) for (const item of guidesWithin(model.text, language)) useful.set(item.id, item);
  return { ...preferred, id: `${language}:${adventure}:${exercise.id}`, meaning: guide?.translation ?? exercise.instruction, purpose: exercise.instruction, vocabulary: exercise.teaching,
    segments: guide?.segments ?? [preferred.text], pronunciation: guide, alternatives,
    usefulGuides: [...useful.values()].sort((a, b) => b.original.length - a.original.length) };
}
