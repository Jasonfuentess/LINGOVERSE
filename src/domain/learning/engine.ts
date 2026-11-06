import type { AnswerChannel, AnswerSupport, Evaluation, Exercise, LearnerAnswer, Lesson, MissionProgress, VariantSelector } from './models';
import { validateLesson } from './validation';
import { validateWritten } from './written';
import { interpretAnswer } from './interpretation';

export const alternateVariant: VariantSelector = (lesson, run) => {
  const variant = lesson.variants[run % lesson.variants.length];
  if (!variant) throw Error('No hay variantes disponibles');
  return variant.id;
};
export function beginMission(lesson: Lesson, run = 0, selector: VariantSelector = alternateVariant): MissionProgress {
  validateLesson(lesson);
  if (!Number.isSafeInteger(run) || run < 0) throw Error('Número de recorrido inválido');
  const variantId = selector(lesson, run);
  const variant = lesson.variants.find(item => item.id === variantId);
  if (!variant) throw Error('Variante desconocida');
  return { version: 1, lessonId: lesson.id, contentVersion: lesson.version, variantId, run, status: 'active', nodeId: variant.start, completedObjectives: [], events: [], feedback: null };
}
export function currentExercise(lesson: Lesson, state: MissionProgress): Exercise {
  if (state.lessonId !== lesson.id || state.contentVersion !== lesson.version || state.status !== 'active') throw Error('No hay una escena activa compatible');
  const variant = lesson.variants.find(item => item.id === state.variantId);
  const exercise = variant?.exercises.find(item => item.id === state.nodeId);
  if (!exercise) throw Error('Escena desconocida');
  return exercise;
}
export function normalizeAnswer(text: string): string {
  return text.normalize('NFC').toLocaleLowerCase('fr').replace(/[’‘]/g, "'").replace(/[.!?¿¡,;:]/g, '').replace(/\s+/g, ' ').trim();
}
function validAnswer(answer: LearnerAnswer) {
  if (!answer || (answer.kind !== 'choice' && answer.kind !== 'text')) throw Error('Respuesta inválida');
  const value = answer.kind === 'choice' ? answer.choiceId : answer.text;
  if (typeof value !== 'string' || value.length > 400) throw Error('Respuesta inválida o demasiado larga');
}
export function evaluateAnswer(exercise: Exercise, answer: LearnerAnswer): Evaluation {
  validAnswer(answer);
  // LV-007B: opt-in per exercise, so archived content evaluates byte-for-byte as before.
  if (exercise.conversation === 'contextual-v1') return interpretAnswer(exercise, answer).evaluation;
  if (exercise.kind === 'text' && exercise.writtenRules && answer.kind === 'text') {
    const result = validateWritten(exercise, answer.text);
    return { correct: result.correct, explanation: result.explanation, correction: exercise.correction, reply: result.correct ? exercise.reply : '', next: result.correct ? exercise.next : null, ...(result.issue ? { writtenIssue: result.issue } : {}), ...(result.spokenExplanation ? { spokenExplanation: result.spokenExplanation } : {}) };
  }
  let correct = false;
  let explanation = exercise.explanation;
  let spokenExplanation: string | undefined;
  let reply = '';
  let next: string | null = null;
  if (exercise.kind === 'choice' && answer.kind === 'choice') {
    const choice = exercise.choices.find(item => item.id === answer.choiceId);
    correct = choice?.correct ?? false;
    explanation = choice?.explanation ?? 'Elegí una de las respuestas de esta escena.';
    spokenExplanation = choice?.spokenExplanation;
    if (correct && choice) { reply = choice.reply; next = choice.next; }
  } else if (exercise.kind === 'text' && answer.kind === 'text') {
    correct = exercise.accepted.some(value => normalizeAnswer(value) === normalizeAnswer(answer.text));
    if (correct) { reply = exercise.reply; next = exercise.next; }
    else explanation = 'Probá una de las expresiones enseñadas. Revisá las palabras y los acentos; se aceptan mayúsculas y puntuación diferentes.';
  } else explanation = 'El formato de respuesta no corresponde a este ejercicio.';
  return { correct, explanation, correction: exercise.correction, reply, next, ...(spokenExplanation ? { spokenExplanation } : {}) };
}
export function submitAnswer(lesson: Lesson, state: MissionProgress, answer: LearnerAnswer, support?: AnswerSupport, channel?: AnswerChannel): MissionProgress {
  if (support !== undefined && support !== 'assisted' && support !== 'independent') throw Error('Evidencia de ayuda inválida');
  if (channel !== undefined && channel !== 'spoken' && channel !== 'written') throw Error('Canal de respuesta inválido');
  const exercise = currentExercise(lesson, state);
  if (state.feedback?.correct) throw Error('Leé la respuesta y continuá antes de responder otra vez');
  if (state.events.length >= 1024) throw Error('Se alcanzó el límite de intentos de este recorrido. Reiniciá para practicar de nuevo.');
  const feedback = evaluateAnswer(exercise, answer);
  // Only editorial phrasings are retained; unrecognised free text is stored as an empty marker.
  if (exercise.conversation === 'contextual-v1') answer = interpretAnswer(exercise, answer).retained;
  else if (exercise.kind === 'text' && exercise.writtenRules && answer.kind === 'text') answer ={ kind: 'text', text: validateWritten(exercise, answer.text).retained };
  return { ...state, feedback, events: [...state.events, { type: 'answer', nodeId: exercise.id, answer, ...(support ? { support } : {}), ...(channel ? { channel } : {}) }] };
}
export function continueMission(lesson: Lesson, state: MissionProgress): MissionProgress {
  const exercise = currentExercise(lesson, state);
  if (!state.feedback?.correct) throw Error('Primero respondé correctamente');
  const nodeId = state.feedback.next;
  return { ...state, nodeId, status: nodeId === null ? 'completed' : 'active', feedback: null,
    completedObjectives: [...state.completedObjectives, exercise.objectiveId, ...(state.feedback.completes ?? [])], events: [...state.events, { type: 'continue' }] };
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  return JSON.stringify(value) ?? 'undefined';
}
export function restoreProgress(lesson: Lesson, value: unknown): MissionProgress {
  if (!value || typeof value !== 'object') throw Error('Progreso inválido');
  const raw = value as Record<string, unknown>;
  if (raw.version !== 1 || raw.lessonId !== lesson.id || raw.contentVersion !== lesson.version || typeof raw.variantId !== 'string' || typeof raw.run !== 'number' || !Array.isArray(raw.events) || raw.events.length > 1025) throw Error('Versión o historial de progreso no admitido');
  let state = beginMission(lesson, raw.run, () => raw.variantId as string);
  for (const value of raw.events) {
    if (!value || typeof value !== 'object') throw Error('Evento inválido');
    const event = value as Record<string, unknown>;
    if (event.type === 'answer') {
      if (event.nodeId !== state.nodeId) throw Error('Historial fuera de orden');
      state = submitAnswer(lesson, state, event.answer as LearnerAnswer, event.support as AnswerSupport | undefined, event.channel as AnswerChannel | undefined);
    } else if (event.type === 'continue') state = continueMission(lesson, state);
    else throw Error('Evento desconocido');
  }
  if (canonical(state) !== canonical(value)) throw Error('El progreso no coincide con las respuestas registradas');
  return state;
}
