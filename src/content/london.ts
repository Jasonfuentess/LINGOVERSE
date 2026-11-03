import type { ChoiceExercise, Exercise, Lesson, LessonVariant, MissionProgress, TextExercise } from '../domain/learning/models';
import { validateLesson } from '../domain/learning/validation';
import { londonLessonV1 } from './london.v1';
import { londonLessonV2 } from './london.v2';
import { londonLesson as londonLessonV3 } from './london.v3';
import { londonLesson as londonLessonV4 } from './london.v4';
export { londonLesson as londonLessonV3 } from './london.v3';
export { londonLesson as londonLessonV4 } from './london.v4';
export { londonLessonV1 } from './london.v1';
export { londonLessonV2 } from './london.v2';

/**
 * LV-007B · London v5: the same two approved stories (v4, archived unchanged) with contextual
 * conversation. Characters remember the destination and route, react to it, never ask again for a
 * confirmed destination, clarify ambiguous one-word replies and explain off-context replies.
 * Every recognised phrasing is editorial and exact; nothing is inferred from keywords.
 */
interface Context {
  guide: string;
  destination: 'hostel' | 'theatre';
  full: string; short: string; shortEs: string;
  /** Reviewed replies that state the destination while answering "What do you need?". */
  stateDestination: string[];
  minor: { input: string; better: string; issue: 'spelling' | 'structure'; explanation: string }[];
  ambiguous: string[];
  wrongPlaces: { inputs: string[]; explanation: string }[];
  visitingReply: string;
  routes: Record<string, string>;
}
const contexts: Record<string, Context> = {
  'station-arrival': {
    guide: 'Maya', destination: 'hostel', full: 'the Blue Door Hostel', short: 'the hostel', shortEs: 'el hostal',
    stateDestination: ["I'm looking for the Blue Door Hostel.", "I'm looking for the hostel.", 'I need to go to the Blue Door Hostel.', 'I need to go to the hostel.', 'Can you help me find the hostel?', 'Could you help me find the hostel?', 'Where is the Blue Door Hostel?', 'Where is the hostel?'],
    minor: [
      { input: 'I looking for the hostel.', better: "I'm looking for the hostel.", issue: 'structure', explanation: 'Se entiende perfectamente que buscás el hostal. Falta am: I am looking… o I’m looking…' },
      { input: "I'm looking for the hostal.", better: "I'm looking for the hostel.", issue: 'spelling', explanation: 'Se entiende que buscás el hostal. En inglés se escribe hostel (con e).' },
      { input: 'I need go to the hostel.', better: 'I need to go to the hostel.', issue: 'structure', explanation: 'Se entiende tu destino. Después de need se usa to: I need to go…' },
      { input: 'Where is hostel?', better: 'Where is the hostel?', issue: 'structure', explanation: 'Se entiende que buscás el hostal. En inglés se dice the hostel, con artículo.' },
    ],
    ambiguous: ['The hostel.', 'Hostel.', 'The Blue Door Hostel.'],
    wrongPlaces: [
      { inputs: ["I'm looking for the station.", 'Where is the station?', 'I need to go to the station.'], explanation: 'Ya estás en la estación King’s Cross: lo que buscás es el hostal Blue Door. Decí qué necesitás o adónde vas.' },
      { inputs: ["I'm looking for the theatre.", 'Where is the theatre?', 'I need to go to the theatre.'], explanation: 'En esta historia buscás un hostal, no un teatro. Revisá tu destino en la escena.' },
    ],
    visitingReply: "Welcome to London! I'm Maya. → ¡Bienvenido/a a Londres! Soy Maya.",
    routes: { 'route-a': 'walk', 'route-a-alt': 'walk', 'route-b': 'bus', 'route-b-alt': 'bus' },
  },
  'riverside-rain': {
    guide: 'Ollie', destination: 'theatre', full: 'the Lantern Theatre', short: 'the theatre', shortEs: 'el teatro',
    stateDestination: ["I'm looking for the Lantern Theatre.", "I'm looking for the theatre.", 'I need to go to the Lantern Theatre.', 'I need to go to the theatre.', 'Can you help me find the theatre?', 'Could you help me find the theatre?', 'Where is the Lantern Theatre?', 'Where is the theatre?'],
    minor: [
      { input: 'I looking for the theatre.', better: "I'm looking for the theatre.", issue: 'structure', explanation: 'Se entiende perfectamente que buscás el teatro. Falta am: I am looking… o I’m looking…' },
      { input: "I'm looking for the teatre.", better: "I'm looking for the theatre.", issue: 'spelling', explanation: 'Se entiende que buscás el teatro. En inglés se escribe theatre, con th.' },
      { input: 'I need go to the theatre.', better: 'I need to go to the theatre.', issue: 'structure', explanation: 'Se entiende tu destino. Después de need se usa to: I need to go…' },
      { input: 'Where is theatre?', better: 'Where is the theatre?', issue: 'structure', explanation: 'Se entiende que buscás el teatro. En inglés se dice the theatre, con artículo.' },
    ],
    ambiguous: ['The theatre.', 'Theatre.', 'The Lantern Theatre.', 'The theater.'],
    wrongPlaces: [
      { inputs: ["I'm looking for the river.", 'Where is the river?'], explanation: 'Ya estás junto al río: lo que buscás es el Lantern Theatre. Decí qué necesitás o adónde vas.' },
      { inputs: ["I'm looking for the hostel.", 'Where is the hostel?', 'I need to go to the hostel.'], explanation: 'En esta historia buscás un teatro, no un hostal. Revisá tu destino en la escena.' },
    ],
    visitingReply: "Welcome to London! I'm Ollie. → ¡Bienvenido/a a Londres! Soy Ollie.",
    routes: { 'route-a': 'river', 'route-a-alt': 'river', 'route-b': 'market', 'route-b-alt': 'market' },
  },
};
const unique = (values: string[]) => [...new Map(values.map(value => [value.toLocaleLowerCase(), value])).values()];

function contextual(exercise: Exercise, c: Context, whereReply: string): Exercise {
  const base = { ...exercise, conversation: 'contextual-v1' as const };
  if (base.kind === 'choice') {
    const choice: ChoiceExercise = base;
    if (choice.id !== 'choose-path') return choice;
    return { ...choice, choices: choice.choices.map(option => c.routes[option.id] ? { ...option, facts: { route: c.routes[option.id]! } } : option) };
  }
  const text: TextExercise = base;
  const leaving = { inputs: ['Goodbye!', 'Bye!', 'See you!'], explanation: `Te estás despidiendo, pero ${c.guide} sigue ayudándote. Respondé a lo que te pregunta.` };
  switch (text.id) {
    case 'introduce': return {
      ...text, accepted: [...text.accepted, 'Yes.'],
      acceptedFeedback: [...(text.acceptedFeedback ?? []), { input: 'Yes.', explanation: 'Respuesta breve y válida. Para practicar más, podés decir I’m new here.', spokenExplanation: 'Respuesta breve y válida. También podés decir que sos nuevo por aquí.' }],
      intents: [{ id: 'visiting', examples: ["I'm visiting London.", 'I am visiting London.', "Yes, I'm visiting London.", 'Yes, I am visiting London.'], facts: { visit: 'visiting' }, reply: c.visitingReply,
        explanation: `Contaste que estás de visita en Londres, y ${c.guide} te da la bienvenida.`, spokenExplanation: 'Contaste que estás de visita y te dieron la bienvenida.' }],
      minorForms: [{ input: 'Im new here.', better: "I'm new here.", issue: 'spelling', explanation: 'Se entiende perfectamente. I’m lleva apóstrofo: es la forma corta de I am.' },
        { input: "I'm new hear.", better: "I'm new here.", issue: 'spelling', explanation: 'Se entiende por el contexto. Here (aquí) y hear (oír) suenan igual, pero se escriben distinto.' }],
      offContext: [leaving],
    };
    case 'help': return {
      ...text, accepted: unique([...text.accepted, ...c.stateDestination]),
      intents: [{ id: 'state-destination', examples: c.stateDestination, facts: { destination: c.destination }, next: 'choose-path', completes: ['ask-where'], reply: whereReply,
        explanation: `Pediste ayuda y además dijiste adónde vas. ${c.guide} ya conoce tu destino, así que no necesita preguntártelo otra vez.`,
        spokenExplanation: 'Muy bien. Dijiste adónde vas, así que la conversación avanza directo a elegir el camino.' }],
      minorForms: c.minor.map(form => ({ ...form, intent: 'state-destination' })),
      clarifications: [{ inputs: c.ambiguous, facts: { destination: c.destination },
        reply: c.destination === 'hostel' ? 'The hostel? Sure, I can help with that. What do you need? → ¿El hostal? Claro, puedo ayudarte con eso. ¿Qué necesitás?' : 'The theatre? Sure, I can help with that. What do you need? → ¿El teatro? Claro, puedo ayudarte con eso. ¿Qué necesitás?',
        explanation: `${c.guide} entendió «${c.short.replace('the ', '')}», pero una sola palabra no dice qué necesitás. Pedí ayuda con una frase: I need help. / I'm looking for ${c.short}.`,
        spokenExplanation: 'Se entendió el lugar, pero falta decir qué necesitás. Probá con una frase completa.' }],
      offContext: [...c.wrongPlaces, leaving],
    };
    case 'where': return {
      ...text, asks: 'destination', acceptedFacts: { destination: c.destination },
      contextualPrompts: [{ when: [{ fact: 'destination', value: c.destination, status: 'ambiguous' }],
        prompt: `You said ${c.short}, right? Ask me where it is.`, promptTranslation: `Dijiste ${c.shortEs}, ¿no? Preguntame dónde queda.` }],
      minorForms: [{ input: c.minor[3]!.input, better: c.minor[3]!.better, issue: 'structure', explanation: c.minor[3]!.explanation },
        { input: c.destination === 'hostel' ? 'Where is the hostal?' : 'Where is the teatre?', better: `Where is ${c.short}?`, issue: 'spelling', explanation: c.destination === 'hostel' ? 'Se entiende la pregunta. En inglés se escribe hostel, con e.' : 'Se entiende la pregunta. En inglés se escribe theatre, con th.' }],
      writtenRules: [...(text.writtenRules ?? []), { input: `Where ${c.short} is?`, issue: 'structure', explanation: `En una pregunta, is va antes del lugar: Where is ${c.short}?`, spokenExplanation: 'En las preguntas con dónde, el verbo va antes del lugar.' }],
      offContext: c.wrongPlaces.map(item => ({ ...item, inputs: item.inputs.filter(input => !text.accepted.some(value => value.toLocaleLowerCase() === input.toLocaleLowerCase())) })).filter(item => item.inputs.length),
    };
    default:
      if (text.id.startsWith('thanks-')) return { ...text, minorForms: [{ input: 'Tank you!', better: 'Thank you!', issue: 'spelling', explanation: 'Se entiende el agradecimiento. Thank se escribe con th; tank significa tanque.' }],
        offContext: [{ inputs: ['Goodbye!', 'Bye!'], explanation: `Antes de despedirte, agradecé a quien te ayudó: ${text.correction}` }] };
      if (text.id.startsWith('bye-')) return { ...text, minorForms: [{ input: 'Good bye!', better: 'Goodbye!', issue: 'spelling', explanation: 'Se entiende la despedida. Hoy se escribe junto: goodbye.' }] };
      return text;
  }
}
function contextualVariant(variant: LessonVariant): LessonVariant {
  const c = contexts[variant.id];
  if (!c) throw Error(`Sin contexto conversacional para ${variant.id}`);
  const whereReply = (variant.exercises.find(item => item.id === 'where') as TextExercise).reply;
  return { ...variant, exercises: variant.exercises.map(exercise => contextual(exercise, c, whereReply)) };
}

export const londonLesson: Lesson = validateLesson({ ...londonLessonV4, version: 5, variants: londonLessonV4.variants.map(contextualVariant) });

export function londonLessonForProgress(progress: MissionProgress | null): Lesson {
  if (!progress) return londonLesson;
  if (progress.lessonId !== londonLesson.id) throw Error('Versión de aventura inglesa no admitida');
  const lesson = [londonLessonV1, londonLessonV2, londonLessonV3, londonLessonV4, londonLesson].find(item => item.version === progress.contentVersion);
  if (!lesson) throw Error('Versión de aventura inglesa no admitida');
  return lesson;
}
