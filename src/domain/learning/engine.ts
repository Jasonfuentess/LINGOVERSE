import type { Evaluation, Exercise, LearnerAnswer, Lesson, MissionProgress, VariantSelector } from './models';
import { validateLesson } from './validation';

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
  let correct = false;
  let explanation = exercise.explanation;
  let reply = '';
  let next: string | null = null;
  if (exercise.kind === 'choice' && answer.kind === 'choice') {
    const choice = exercise.choices.find(item => item.id === answer.choiceId);
    correct = choice?.correct ?? false;
    explanation = choice?.explanation ?? 'Elegí una de las respuestas de esta escena.';
    if (correct && choice) { reply = choice.reply; next = choice.next; }
  } else if (exercise.kind === 'text' && answer.kind === 'text') {
    correct = exercise.accepted.some(value => normalizeAnswer(value) === normalizeAnswer(answer.text));
    if (correct) { reply = exercise.reply; next = exercise.next; }
    else explanation = 'Probá una de las expresiones enseñadas. Revisá las palabras y los acentos; se aceptan mayúsculas y puntuación diferentes.';
  } else explanation = 'El formato de respuesta no corresponde a este ejercicio.';
  return { correct, explanation, correction: exercise.correction, reply, next };
}
export function submitAnswer(lesson: Lesson, state: MissionProgress, answer: LearnerAnswer): MissionProgress {
  const exercise = currentExercise(lesson, state);
  if (state.feedback?.correct) throw Error('Leé la respuesta y continuá antes de responder otra vez');
  if (state.events.length >= 1024) throw Error('Se alcanzó el límite de intentos de este recorrido. Reiniciá para practicar de nuevo.');
  const feedback = evaluateAnswer(exercise, answer);
  return { ...state, feedback, events: [...state.events, { type: 'answer', nodeId: exercise.id, answer }] };
}
export function continueMission(lesson: Lesson, state: MissionProgress): MissionProgress {
  const exercise = currentExercise(lesson, state);
  if (!state.feedback?.correct) throw Error('Primero respondé correctamente');
  const nodeId = state.feedback.next;
  return { ...state, nodeId, status: nodeId === null ? 'completed' : 'active', feedback: null,
    completedObjectives: [...state.completedObjectives, exercise.objectiveId], events: [...state.events, { type: 'continue' }] };
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
      state = submitAnswer(lesson, state, event.answer as LearnerAnswer);
    } else if (event.type === 'continue') state = continueMission(lesson, state);
    else throw Error('Evento desconocido');
  }
  if (canonical(state) !== canonical(value)) throw Error('El progreso no coincide con las respuestas registradas');
  return state;
}
