import type { Lesson, MissionProgress } from '../learning/models';
import { evaluateAnswer } from '../learning/engine';
import type { VarietyHistory } from '../variety/models';
import type { HumorContext } from './models';

export function humorContext(lesson: Lesson, state: MissionProgress, history: VarietyHistory): HumorContext | null {
  const last = state.events.at(-1);
  if (!last) return null;
  if (last.type === 'continue' && state.status !== 'completed' && ![3, 6].includes(state.completedObjectives.length)) return null;
  const answerEvents = state.events.filter(event => event.type === 'answer');
  const answer = answerEvents.at(-1);
  const exercise = lesson.variants.find(variant => variant.id === state.variantId)?.exercises.find(item => item.id === answer?.nodeId);
  if (!answer || !exercise) return null;
  const attempts = answerEvents.filter(event => event.nodeId === exercise.id);
  const wrong = attempts.filter(event => !evaluateAnswer(exercise, event.answer).correct).length;
  const correct = evaluateAnswer(exercise, answer.answer).correct;
  const fact = history.errors.find(item => item.scopeId === lesson.id && item.exerciseId === exercise.id && item.objectiveId === exercise.objectiveId && item.language === lesson.language);
  const category = last.type === 'continue' ? state.status === 'completed' ? 'celebration' : 'progress' : correct ? wrong > 0 ? 'recovery' : 'correct' : fact && fact.count >= 3 ? 'recurring' : attempts.length > 1 ? 'retry' : 'error';
  return { learningLanguage: lesson.language, interfaceLanguage: 'es', level: lesson.level, scopeId: lesson.id, objectiveId: exercise.objectiveId, exerciseId: exercise.id,
    ...(last.type === 'answer' ? { answerKind: answer.answer.kind } : {}),
    ...(last.type === 'answer' && state.feedback?.writtenIssue ? { writtenIssue: state.feedback.writtenIssue } : {}),
    result: correct ? 'correct' : 'incorrect', attempts: attempts.length, wrongAttempts: wrong, completed: state.completedObjectives.length, total: lesson.objectives.length, category,
    ...(fact ? { errorRef: fact.id } : {}), eventKey: `${state.contentVersion}:${state.run}:${state.events.length}:${state.status}:${state.nodeId ?? 'done'}` };
}
