import type { ChoiceExercise, Exercise, Lesson, MissionProgress, TextExercise } from '../domain/learning/models';
import { validateLesson } from '../domain/learning/validation';
import { cafeLesson as cafeLessonV1 } from './cafe.v1';
import { cafeLessonV2 } from './cafe.v2';
export { cafeLessonV1, cafeLessonV2 };

/**
 * LV-007B · Café v3: the six approved v2 conversations (archived unchanged) with contextual memory.
 * The server remembers the drink, the place and the sugar; combined replies have real consequences;
 * frequent small slips are understood and corrected without blocking the order.
 */
const facts: Record<string, Record<string, string>> = {
  cafe: { drink: 'cafe' }, the: { drink: 'the' },
  'sur-place': { place: 'sur-place' }, emporter: { place: 'emporter' },
  'oui-sucre': { sugar: 'avec' }, 'non-sucre': { sugar: 'sans' },
};
const drinks = [['cafe', 'café', 'café'], ['the', 'thé', 'té']] as const;
const ready = drinks.flatMap(([drink, fr, es]) => [
  { when: [{ fact: 'drink', value: drink }, { fact: 'place', value: 'sur-place' }], prompt: `Voilà, votre ${fr} est prêt.`, promptTranslation: `Listo, su ${es} está preparado.` },
  { when: [{ fact: 'drink', value: drink }, { fact: 'place', value: 'emporter' }], prompt: `Votre ${fr} à emporter est prêt.`, promptTranslation: `Su ${es} para llevar está listo.` },
]);
const served = drinks.flatMap(([drink, fr, es]) => [
  { when: [{ fact: 'drink', value: drink }, { fact: 'sugar', value: 'avec' }], prompt: `Voilà votre ${fr}, avec du sucre.`, promptTranslation: `Aquí tiene su ${es}, con azúcar.` },
  { when: [{ fact: 'drink', value: drink }, { fact: 'sugar', value: 'sans' }], prompt: `Voilà votre ${fr}, sans sucre.`, promptTranslation: `Aquí tiene su ${es}, sin azúcar.` },
]);

function contextual(exercise: Exercise): Exercise {
  const base = { ...exercise, conversation: 'contextual-v1' as const };
  if (base.kind === 'choice') {
    const choice: ChoiceExercise = base;
    return { ...choice, choices: choice.choices.map(option => option.correct && facts[option.id] ? { ...option, facts: facts[option.id]! } : option) };
  }
  const text: TextExercise = base;
  if (text.id === 'prix') return {
    ...text, contextualPrompts: ready, accepted: [...text.accepted, 'Ça coûte combien ?'],
    minorForms: [
      { input: 'Cest combien ?', better: "C'est combien ?", issue: 'spelling', explanation: "Se entiende la pregunta. C'est lleva apóstrofo: es c(e) + est." },
      { input: 'Combien ça coute ?', better: 'Combien ça coûte ?', issue: 'spelling', explanation: 'Se entiende la pregunta. Coûte lleva acento circunflejo: û.' },
      { input: 'Ca coûte combien ?', better: 'Ça coûte combien ?', issue: 'spelling', explanation: 'Se entiende la pregunta. Ça lleva cedilla: sin ella, ca se leería «ka».' },
      { input: 'Combien ?', better: "C'est combien ?", issue: 'structure', explanation: "Se entiende que preguntás el precio. Con una frase completa suena más cortés: C'est combien ?" },
    ],
    offContext: [
      { inputs: ['Merci.', 'Merci beaucoup.'], explanation: 'Todavía no sabés cuánto cuesta: primero preguntá el precio.' },
      { inputs: ['Au revoir.', 'Bonne journée.'], explanation: 'Todavía no pagaste tu bebida: primero preguntá cuánto cuesta.' },
    ],
  };
  if (text.id === 'merci') return {
    ...text, contextualPrompts: served, accepted: [...text.accepted, 'Merci, bonne journée.', 'Merci, au revoir.'],
    intents: [{ id: 'thanks-and-goodbye', examples: ['Merci, bonne journée.', 'Merci, au revoir.'], next: null, completes: ['saluer-depart'],
      reply: 'Merci, à vous aussi ! Au revoir ! → ¡Gracias, igualmente! ¡Adiós!',
      explanation: 'Agradeciste y te despediste en una sola frase, como se hace en una cafetería. La conversación termina con naturalidad.',
      spokenExplanation: 'Agradeciste y te despediste a la vez. La conversación termina con naturalidad.' }],
    minorForms: [
      { input: 'Mersi.', better: 'Merci.', issue: 'spelling', explanation: 'Se entiende el agradecimiento. Merci se escribe con c.' },
      { input: 'Merci boucoup.', better: 'Merci beaucoup.', issue: 'spelling', explanation: 'Se entiende el agradecimiento. Beaucoup se escribe con eau: beau-coup.' },
    ],
    offContext: [{ inputs: ['Au revoir.', 'Bonne journée.'], explanation: 'Te están entregando tu bebida: antes de irte, agradecé. También podés decir las dos cosas: Merci, bonne journée.' }],
  };
  if (text.id === 'depart') return {
    ...text,
    minorForms: [
      { input: 'Aurevoir.', better: 'Au revoir.', issue: 'spelling', explanation: 'Se entiende la despedida. Au revoir se escribe en dos palabras.' },
      { input: 'Au revoire.', better: 'Au revoir.', issue: 'spelling', explanation: 'Se entiende la despedida. Revoir termina en r, sin e.' },
    ],
  };
  return text;
}

export const cafeLesson: Lesson = validateLesson({ ...cafeLessonV2, version: 3, variants: cafeLessonV2.variants.map(variant => ({ ...variant, exercises: variant.exercises.map(contextual) })) });

export function cafeLessonForProgress(progress: MissionProgress | null) {
  if (!progress) return cafeLesson;
  if (progress.lessonId !== cafeLesson.id) throw Error('Misión desconocida');
  const lesson = [cafeLessonV1, cafeLessonV2, cafeLesson].find(item => item.version === progress.contentVersion);
  if (!lesson) throw Error('Versión de contenido no admitida');
  return lesson;
}
