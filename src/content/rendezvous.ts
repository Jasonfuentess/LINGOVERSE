import type { ChoiceExercise, Exercise, Lesson, LessonVariant, MissionProgress, TextExercise } from '../domain/learning/models';
import { validateLesson } from '../domain/learning/validation';
import { rendezvousLesson as rendezvousLessonV1 } from './rendezvous.v1';
export { rendezvousLessonV1 };

/**
 * LV-007B · Un rendez-vous à Paris v2: the two approved v1 stories (archived unchanged) with
 * contextual conversation. The contact no longer reveals the meeting point and then asks for it;
 * a student who names the place early is not asked again; one-word replies get a natural
 * clarification; small slips are understood while meaning-changing errors are still corrected.
 */
interface Context {
  contact: string; friend: string; friendWord: 'amie' | 'ami';
  place: 'fontaine' | 'kiosque'; placeFr: string; placeDe: string; placeEs: string; atPlace: string;
  waiting: string[]; early: string[]; ambiguous: string[]; wrongPlace: string;
  ask: { minor: string; better: string };
  paths: Record<string, string>;
}
const contexts: Record<string, Context> = {
  'jardin-bleu': {
    contact: 'Juliette', friend: 'Inès', friendWord: 'amie', place: 'fontaine', placeFr: 'la fontaine', placeDe: 'de la fontaine', placeEs: 'la fuente', atPlace: 'À la fontaine Médicis ? Je connais bien cet endroit. → ¿En la fuente Médicis? Conozco bien ese lugar.',
    waiting: ["Oui, j'attends une amie.", 'Oui, je cherche une amie.'],
    early: ["Oui, j'ai rendez-vous à la fontaine.", "J'ai rendez-vous à la fontaine.", "Oui, j'ai rendez-vous à la fontaine Médicis.", "J'ai rendez-vous près de la fontaine."],
    ambiguous: ['Je cherche la fontaine.', 'La fontaine.', 'La fontaine Médicis.'], wrongPlace: 'Je cherche la gare.',
    ask: { minor: 'Ou est la fontaine ?', better: 'Où est la fontaine ?' },
    paths: { 'route-a': 'arbres', 'route-a-alt': 'arbres', 'route-b': 'fleurs', 'route-b-alt': 'fleurs' },
  },
  'quai-des-cartes': {
    contact: 'Margot', friend: 'Émile', friendWord: 'ami', place: 'kiosque', placeFr: 'le kiosque', placeDe: 'du kiosque', placeEs: 'el quiosco', atPlace: 'Au kiosque vert ? Je connais bien cet endroit. → ¿En el quiosco verde? Conozco bien ese lugar.',
    waiting: ["Oui, j'attends un ami.", 'Oui, je cherche un ami.'],
    early: ["Oui, j'ai rendez-vous au kiosque.", "J'ai rendez-vous au kiosque.", "Oui, j'ai rendez-vous au kiosque vert.", "J'ai rendez-vous près du kiosque."],
    ambiguous: ['Je cherche le kiosque.', 'Le kiosque.', 'Le kiosque vert.'], wrongPlace: 'Je cherche la station de métro.',
    ask: { minor: 'Ou est le kiosque vert ?', better: 'Où est le kiosque vert ?' },
    paths: { 'route-a': 'pont', 'route-a-alt': 'pont', 'route-b': 'bouquinistes', 'route-b-alt': 'bouquinistes' },
  },
};

function contextual(exercise: Exercise, c: Context): Exercise {
  const base = { ...exercise, conversation: 'contextual-v1' as const };
  const your = c.friendWord === 'amie' ? 'Votre amie' : 'Votre ami';
  const yourEs = c.friendWord === 'amie' ? 'tu amiga' : 'tu amigo';
  if (base.kind === 'choice') {
    const choice: ChoiceExercise = base;
    if (choice.id === 'identify') return {
      ...choice, asks: 'meeting-point',
      // v1 had the contact state the meeting point and then ask for it; now the student recalls it.
      prompt: `${your} vous attend où ? Rappelez-vous son message.`, promptTranslation: `¿Dónde te espera ${yourEs}? Recordá su mensaje.`,
      contextualPrompts: [{ when: [{ fact: 'meeting-point', value: c.place, status: 'ambiguous' }], prompt: `Vous avez parlé ${c.placeDe}. ${your} vous attend où, exactement ?`, promptTranslation: `Mencionaste ${c.placeEs}. ¿Dónde te espera ${yourEs}, exactamente?` }],
      choices: choice.choices.map(option => option.id === 'meeting-point' ? { ...option, facts: { 'meeting-point': c.place } } : option),
    };
    if (choice.id === 'route') return { ...choice, choices: choice.choices.map(option => c.paths[option.id] ? { ...option, facts: { path: c.paths[option.id]! } } : option) };
    return choice;
  }
  const text: TextExercise = base;
  if (text.id === 'confirm') return {
    ...text, accepted: [...text.accepted, "Oui, j'ai un rendez-vous ici.", ...c.early],
    intents: [
      { id: 'waiting-friend', examples: c.waiting, facts: { companion: c.friendWord },
        reply: c.friendWord === 'amie' ? 'Vous attendez une amie ? Très bien, je peux vous aider. → ¿Esperás a una amiga? Muy bien, puedo ayudarte.' : 'Vous attendez un ami ? Très bien, je peux vous aider. → ¿Esperás a un amigo? Muy bien, puedo ayudarte.',
        explanation: `Explicaste que esperás a alguien; ${c.contact} lo entiende y te ofrece ayuda.`, spokenExplanation: 'Explicaste que esperás a alguien. Es una respuesta válida.' },
      { id: 'meeting-place', examples: c.early, facts: { 'meeting-point': c.place, 'place-mentioned': 'confirm' }, next: 'ask', completes: ['reconnaitre-lieu'], reply: c.atPlace,
        explanation: `Confirmaste la cita y dijiste dónde es. ${c.contact} ya sabe el lugar, así que no necesita preguntártelo.`, spokenExplanation: 'Confirmaste la cita y el lugar. La conversación avanza sin volver a preguntarlo.' },
    ],
    minorForms: [
      { input: "Oui, j'ai rendevous ici.", better: "Oui, j'ai rendez-vous ici.", issue: 'spelling', explanation: 'Se entiende la respuesta. Rendez-vous se escribe con z y guion.' },
      { input: 'Oui, jai rendez-vous ici.', better: "Oui, j'ai rendez-vous ici.", issue: 'spelling', explanation: "Se entiende la respuesta. J'ai lleva apóstrofo: je + ai se contrae." },
      { input: 'Oui, je ai rendez-vous ici.', better: "Oui, j'ai rendez-vous ici.", issue: 'structure', explanation: "Se entiende la respuesta. Delante de vocal, je se contrae: j'ai, no je ai." },
    ],
    clarifications: [{ inputs: c.ambiguous, facts: { 'meeting-point': c.place },
      reply: `${c.placeFr.charAt(0).toUpperCase()}${c.placeFr.slice(1)} ? Vous avez rendez-vous là-bas ? → ¿${c.placeEs.charAt(0).toUpperCase()}${c.placeEs.slice(1)}? ¿Tenés una cita allí?`,
      explanation: `${c.contact} entendió que mencionás ${c.placeEs}, pero no si tenés una cita. Respondé su pregunta: Oui, j'ai rendez-vous…`,
      spokenExplanation: 'Se entendió el lugar, pero falta confirmar la cita. Respondé la pregunta del personaje.' }],
    offContext: [
      { inputs: ['Bonjour !', 'Bonsoir !'], explanation: `Ya saludaste. Ahora ${c.contact} pregunta si tenés una cita aquí.` },
      { inputs: [c.wrongPlace], explanation: `En esta historia no buscás ese lugar: tenés una cita con ${c.friend}.` },
    ],
  };
  if (text.id === 'ask') return {
    ...text,
    contextualPrompts: [{ when: [{ fact: 'place-mentioned', value: 'confirm' }], prompt: 'Dites-moi ce que vous voulez savoir.', promptTranslation: 'Decime qué querés saber.' }],
    minorForms: [{ input: c.ask.minor, better: c.ask.better, issue: 'spelling', explanation: 'Se entiende por el contexto. Où (dónde) lleva acento grave; ou sin acento significa «o».' }],
    offContext: [{ inputs: ['Merci.', 'Au revoir.'], explanation: `Todavía no sabés por dónde ir: preguntá dónde está ${c.placeEs}.` }],
  };
  if (text.id.startsWith('clarify-') && text.accepted.includes('Je vais tout droit ?')) return {
    ...text, writtenRules: [...(text.writtenRules ?? []), { input: 'Je vais tout droite ?', issue: 'vocabulary', explanation: 'Droite significa derecha. Para «recto» se dice tout droit, sin e final.', spokenExplanation: 'Esa palabra significa derecha. Para decir recto se usa otra forma, sin e final.' }],
  };
  if (text.id.startsWith('meet-')) return {
    ...text,
    minorForms: [{ input: 'Oui, ca va, merci !', better: 'Oui, ça va, merci !', issue: 'spelling', explanation: 'Se entiende. Ça lleva cedilla (ç) y suena «sa»; sin ella se leería «ka».' }],
    offContext: [{ inputs: ['Au revoir !', 'Bonne nuit !'], explanation: `Acabás de encontrarte con ${c.friend}: respondé cómo estás.` }],
  };
  return text;
}
function contextualVariant(variant: LessonVariant): LessonVariant {
  const c = contexts[variant.id];
  if (!c) throw Error(`Sin contexto conversacional para ${variant.id}`);
  return { ...variant, exercises: variant.exercises.map(exercise => contextual(exercise, c)) };
}

export const rendezvousLesson: Lesson = validateLesson({ ...rendezvousLessonV1, version: 2, variants: rendezvousLessonV1.variants.map(contextualVariant) });

export function rendezvousLessonForProgress(progress: MissionProgress | null) {
  if (!progress) return rendezvousLesson;
  const lesson = progress.lessonId === rendezvousLesson.id ? [rendezvousLessonV1, rendezvousLesson].find(item => item.version === progress.contentVersion) : undefined;
  if (!lesson) throw Error('Versión de encuentro desconocida');
  return lesson;
}
