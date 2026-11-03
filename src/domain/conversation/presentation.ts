import { beginMission, continueMission, currentExercise, normalizeAnswer, submitAnswer } from '../learning/engine';
import type { Evaluation, LearnerAnswer, Lesson, MissionProgress, TextExercise } from '../learning/models';

export function verifiedWrittenText(exercise: TextExercise, answer?: LearnerAnswer): string {
  return exercise.accepted.find(text => answer?.kind === 'text' && normalizeAnswer(text) === normalizeAnswer(answer.text)) ?? exercise.accepted[0]!;
}

// Text-only projection defaults; the voice layer discovers actual device capabilities.
export interface VoiceCapabilities {
  playback: 'unavailable' | 'available';
  spokenResponse: 'unavailable' | 'available';
}
export interface Intervention {
  id: string;
  role: 'npc' | 'student';
  speaker: string;
  text: string;
  translation?: string;
  audio?: { contentId: string; language: 'fr' | 'en' };
}
export interface ConversationTurn {
  id: string;
  scene: string;
  messages: Intervention[];
  feedback: Evaluation;
  attempts: number;
}
/** The last *completed* interaction only: never infer next lines from the graph. */
export interface ConversationBeat {
  turnId: string;
  prompt: Intervention;
  student: Intervention;
  reply?: Intervention;
}
export function latestConversationBeat(history: readonly ConversationTurn[]): ConversationBeat | null {
  const last = history.at(-1);
  if (!last) return null;
  const prompt = last.messages[0];
  const student = last.messages[1];
  if (prompt?.role !== 'npc' || student?.role !== 'student') return null;
  // A reply can be omitted by the editorial content; keep the prior question-and-answer instead.
  const reply = last.messages.slice(2).find(message => message.role === 'npc');
  return { turnId: last.id, prompt, student, ...(reply ? { reply } : {}) };
}
export interface AdventureFact {
  id: string;
  type: 'objective-practiced' | 'decision-verified' | 'mission-completed';
  lessonId: string;
  contentVersion: number;
  variantId: string;
  objectiveId?: string;
  choiceId?: string;
}

/** Derived from validated saved events, never persisted or independently advanced. */
export function conversationPresentation(lesson: Lesson, progress: MissionProgress) {
  let cursor = beginMission(lesson, progress.run, () => progress.variantId);
  const history: ConversationTurn[] = [];
  const facts: AdventureFact[] = [];
  let attempts = 0;
  const prefix = `${lesson.id}:${lesson.version}:${progress.run}`;
  for (const [index, event] of progress.events.entries()) {
    if (event.type === 'answer') {
      cursor = submitAnswer(lesson, cursor, event.answer);
      attempts++;
      continue;
    }
    const exercise = currentExercise(lesson, cursor);
    const answer = cursor.events.at(-1);
    const feedback = cursor.feedback!;
    const id = `${prefix}:${exercise.id}`;
    // Only canonical accepted content goes into the transcript, never arbitrary input.
    const choiceId = answer?.type === 'answer' && answer.answer.kind === 'choice' ? answer.answer.choiceId : undefined;
    const choice = exercise.kind === 'choice' ? exercise.choices.find(item => item.id === choiceId) : undefined;
    const text = choice?.label ?? (exercise.kind === 'text' ? verifiedWrittenText(exercise, answer?.type === 'answer' ? answer.answer : undefined) : 'Respuesta verificada');
    history.push({ id, scene: exercise.scene, attempts, feedback, messages: [
      { id: `${id}:prompt`, role: 'npc', speaker: exercise.speaker, text: exercise.prompt, translation: exercise.promptTranslation },
      { id: `${id}:answer`, role: 'student', speaker: 'Vos · respuesta verificada', text },
      ...(feedback.reply ? [{ id: `${id}:reply`, role: 'npc' as const, speaker: exercise.speaker, text: feedback.reply }] : []),
    ] });
    const base = { lessonId: lesson.id, contentVersion: lesson.version, variantId: progress.variantId, objectiveId: exercise.objectiveId };
    facts.push({ ...base, id: `${id}:practice`, type: 'objective-practiced' });
    if (choice) facts.push({ ...base, id: `${id}:decision`, type: 'decision-verified', choiceId: choice.id });
    cursor = continueMission(lesson, cursor);
    if (cursor.status === 'completed') facts.push({ ...base, id: `${prefix}:completed:${index}`, type: 'mission-completed' });
    attempts = 0;
  }
  return { history, facts, voice: { playback: 'unavailable', spokenResponse: 'unavailable' } as VoiceCapabilities };
}
