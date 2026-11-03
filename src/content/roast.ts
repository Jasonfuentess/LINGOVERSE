// Pinned to café v2: LV-007B café v3 must not silently change the versioned Roast package.
import { cafeLessonV2 as cafeLesson } from './cafe';
import type { Lesson } from '../domain/learning/models';
// Pedagogy and branches remain the versioned café package; progress is isolated.
export const roastLessonV2: Lesson = { ...cafeLesson, id: 'roast-cafe-fr-a1', title: 'Roast Me · Un café sin pena' };
export const roastLesson: Lesson = { ...roastLessonV2, version: 3, variants: roastLessonV2.variants.map(variant => ({ ...variant, exercises: variant.exercises.map(exercise => {
  if (exercise.id === 'bonjour') return { ...exercise, kind: 'text' as const, instruction: 'Escribí un saludo cortés de día.', accepted: ['Bonjour', 'Bonjour madame', 'Bonjour monsieur'], next: 'commande', reply: 'Bonjour ! → ¡Buenos días!', correction: 'Bonjour ! → ¡Hola! / ¡Buenos días!', writtenRules: [
    { input: 'bonjor', issue: 'spelling' as const, explanation: 'Bonjour se escribe con ou: es un saludo de día.' },
    { input: 'merci', issue: 'vocabulary' as const, explanation: 'Merci significa gracias; para saludar al entrar se usa bonjour.' },
    { input: 'au revoir', issue: 'vocabulary' as const, explanation: 'Au revoir significa adiós; aquí necesitamos un saludo de entrada.' },
  ] };
  if (exercise.kind !== 'text') return exercise;
  if (exercise.id === 'prix') return { ...exercise, accepted: [...exercise.accepted, 'Ça coûte combien ?', 'Combien est-ce que ça coûte ?'], teaching: `${exercise.teaching} Ça coûte combien ? / Combien est-ce que ça coûte ? = ¿Cuánto cuesta?`, correction: 'Combien ça coûte ? → ¿Cuánto cuesta?', writtenRules: [
    { input: 'combien ca coute', issue: 'spelling' as const, explanation: 'En esta pregunta, ça lleva cedilla y coûte lleva acento circunflejo.' },
    { input: 'combien ça', issue: 'structure' as const, explanation: 'Esta formulación está incompleta: añadí coûte para preguntar cuánto cuesta.' },
    { input: 'merci', issue: 'vocabulary' as const, explanation: 'Merci agradece; combien pregunta por una cantidad o precio.' },
  ] };
  if (exercise.id === 'merci') return { ...exercise, accepted: [...exercise.accepted, 'Je vous remercie', 'Merci bien'], teaching: `${exercise.teaching} Je vous remercie = le agradezco; merci bien = muchas gracias.`, correction: 'Merci beaucoup. → Muchas gracias.', writtenRules: [
    { input: 'merci bocoup', issue: 'spelling' as const, explanation: 'Muchas gracias se escribe merci beaucoup; beaucoup termina en coup.' },
    { input: 'bonjour', issue: 'vocabulary' as const, explanation: 'Bonjour saluda; merci agradece la atención recibida.' },
  ] };
  return { ...exercise, accepted: [...exercise.accepted, 'Au revoir et bonne journée'], teaching: `${exercise.teaching} Au revoir et bonne journée = adiós y que tenga un buen día.`, correction: 'Au revoir. → Adiós / hasta luego.', writtenRules: [
    { input: 'bonne journee', issue: 'spelling' as const, explanation: 'Journée lleva é; bonne journée desea un buen día.' },
    { input: 'bonjour', issue: 'vocabulary' as const, explanation: 'Bonjour abre la conversación; au revoir la cierra.' },
  ] };
}) })) };
export const roastLessonForProgress = (progress: import('../domain/learning/models').MissionProgress | null) => progress?.contentVersion === 2 ? roastLessonV2 : roastLesson;
