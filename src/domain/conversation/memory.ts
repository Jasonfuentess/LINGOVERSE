import { beginMission, continueMission, currentExercise, submitAnswer } from '../learning/engine';
import type { Evaluation, Exercise, FactCondition, FactStatus, LearnerAnswer, Lesson, MissionProgress } from '../learning/models';

/**
 * LV-007B conversation memory. Derived only from the validated event log, so it survives reload,
 * needs no migration and can never disagree with saved progress. It stores reviewed fact values
 * (e.g. destination: hostel), never the student's free text.
 */
export interface FactRecord { value: string; status: FactStatus; nodeId: string }
export interface ConversationMemory {
  facts: Record<string, FactRecord>;
  /** Confirmed choices, in order. */
  decisions: { nodeId: string; choiceId: string }[];
}
export const emptyMemory = (): ConversationMemory => ({ facts: {}, decisions: [] });

/** Pure update from one evaluated answer. Confirmed facts are never downgraded by a later ambiguity. */
export function rememberFeedback(memory: ConversationMemory, nodeId: string, feedback: Evaluation, answer: LearnerAnswer): ConversationMemory {
  const facts = { ...memory.facts };
  for (const [fact, value] of Object.entries(feedback.facts ?? {})) {
    const status = feedback.factStatus ?? 'confirmed';
    if (status === 'ambiguous' && facts[fact]?.status === 'confirmed') continue;
    facts[fact] = { value, status, nodeId };
  }
  const decisions = feedback.correct && answer.kind === 'choice' ? [...memory.decisions, { nodeId, choiceId: answer.choiceId }] : memory.decisions;
  return { facts, decisions };
}

/** `turn-start` ignores answers given in the current, unfinished turn (the prompt must not change mid-turn). */
export function conversationMemory(lesson: Lesson, progress: MissionProgress, scope: 'all' | 'turn-start' = 'all'): ConversationMemory {
  let cursor = beginMission(lesson, progress.run, () => progress.variantId);
  let memory = emptyMemory();
  let turnStart = memory;
  for (const event of progress.events) {
    if (event.type === 'continue') { cursor = continueMission(lesson, cursor); turnStart = memory; continue; }
    cursor = submitAnswer(lesson, cursor, event.answer, event.support);
    const recorded = cursor.events.at(-1);
    if (recorded?.type === 'answer' && cursor.feedback) memory = rememberFeedback(memory, event.nodeId, cursor.feedback, recorded.answer);
  }
  return scope === 'turn-start' ? turnStart : memory;
}

export function factsMatch(memory: ConversationMemory, conditions: FactCondition[]): boolean {
  return conditions.every(condition => {
    const fact = memory.facts[condition.fact];
    return fact !== undefined && fact.value === condition.value && (condition.status === undefined ? fact.status === 'confirmed' : fact.status === condition.status);
  });
}

/** The exercise as the character says it now: the first contextual prompt whose conditions hold. */
export function withContext(exercise: Exercise, memory: ConversationMemory): Exercise {
  const contextual = exercise.contextualPrompts?.find(item => factsMatch(memory, item.when));
  return contextual ? { ...exercise, prompt: contextual.prompt, promptTranslation: contextual.promptTranslation } : exercise;
}
export function contextualExercise(lesson: Lesson, progress: MissionProgress): Exercise {
  return withContext(currentExercise(lesson, progress), conversationMemory(lesson, progress, 'turn-start'));
}
