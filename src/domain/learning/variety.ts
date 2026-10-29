import { beginMission, continueMission, currentExercise, submitAnswer } from './engine';
import type { Lesson, MissionProgress } from './models';
import { nextSession, noteAppearance, recordError } from '../variety/history';
import type { ContentCandidate, EducationalContext, SelectionContext, VarietyHistory } from '../variety/models';
import { conversationFingerprint } from './conversation';

export const variantContentId = (lesson: Lesson, variantId: string) => `${lesson.id}${lesson.version === 1 ? '' : `:v${lesson.version}`}:${variantId}`;
export function lessonCandidates(lesson: Lesson): ContentCandidate[] {
  return lesson.variants.map(variant => ({ id: variantContentId(lesson, variant.id), profileId: conversationFingerprint(variant), category: 'mission-variant', language: lesson.language, level: lesson.level, objectives: [...lesson.objectives], requires: [], tags: ['guided'], baseWeight: 1 }));
}
export function annotateConversationProfiles(history: VarietyHistory, lessons: Lesson[]): VarietyHistory {
  const candidates = lessons.flatMap(lessonCandidates);
  return { ...history, entries: history.entries.map(entry => {
    const known = candidates.find(candidate => candidate.id === entry.id);
    return known && entry.context.category === 'mission-variant' ? { ...entry, context: { ...entry.context, profileId: known.profileId } } : entry;
  }) };
}
export function lessonContext(lesson: Lesson, session: number): SelectionContext {
  // No claim of mastered vocabulary: this package teaches all required expressions inline.
  return { category: 'mission-variant', language: lesson.language, level: lesson.level, objectives: [...lesson.objectives], scopeId: lesson.id, session, knownContent: [], tags: ['guided'], allowExplicit: false };
}
export function historyForProgress(lesson: Lesson, history: VarietyHistory, previous: MissionProgress | null, next: MissionProgress, at: number | null): VarietyHistory {
  const newRun = !previous || previous.run !== next.run;
  if (previous && (next.run < previous.run || (newRun && next.run !== previous.run + 1))) throw Error('Número de recorrido fuera de secuencia');
  const offset = newRun ? 0 : previous!.events.length;
  if (!newRun && (previous!.contentVersion !== next.contentVersion || previous!.variantId !== next.variantId || next.events.length < offset || JSON.stringify(previous!.events) !== JSON.stringify(next.events.slice(0, offset)))) throw Error('No se puede reescribir la versión o el historial del recorrido');
  let result = newRun ? nextSession(history) : history;
  const context: EducationalContext = { ...lessonContext(lesson, result.session), variantId: next.variantId };
  const show = (nodeId: string) => {
    const exercise = lesson.variants.find(item => item.id === next.variantId)!.exercises.find(item => item.id === nodeId)!;
    result = noteAppearance(result, `${variantContentId(lesson, next.variantId)}:${nodeId}`, { ...context, category: 'exercise', objectives: [exercise.objectiveId] }, at);
  };
  let replay = beginMission(lesson, next.run, () => next.variantId);
  if (newRun) { result = noteAppearance(result, variantContentId(lesson, next.variantId), { ...context, profileId: conversationFingerprint(lesson.variants.find(item => item.id === next.variantId)!) }, at); show(replay.nodeId!); }
  next.events.forEach((event, index) => {
    if (event.type === 'answer') {
      const exercise = currentExercise(lesson, replay);
      replay = submitAnswer(lesson, replay, event.answer);
      if (index >= offset && !replay.feedback!.correct) {
        result = recordError(result, { id: `${lesson.id}:${exercise.id}`, scopeId: lesson.id, objectiveId: exercise.objectiveId, exerciseId: exercise.id, variantId: next.variantId, language: lesson.language }, at);
      }
    } else {
      replay = continueMission(lesson, replay);
      if (index >= offset && replay.nodeId) show(replay.nodeId);
    }
  });
  return result;
}
