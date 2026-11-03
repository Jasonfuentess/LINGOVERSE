import type { Exercise } from '../domain/learning/models';
import type { PhraseId } from '../domain/learning/support';
export interface BeginnerPhrase {
  id: PhraseId;
  text: string;
  meaning: string;
  parts: { text: string; meaning: string }[];
  note: string;
  transfer: { context: string; choices: { text: string; correct: boolean; explanation: string }[] };
}
/** Scaffolding for two existing scenes, not another lesson or pronunciation evaluator. */
export function beginnerPhrase(language: 'fr' | 'en', adventure: 'cafe' | 'rendezvous', exercise: Exercise): BeginnerPhrase | null {
  if (adventure === 'rendezvous' || exercise.kind !== 'choice') return null;
  if (language === 'fr' && exercise.id === 'bonjour') return {
    id: 'fr-greeting', text: 'Bonjour !', meaning: 'Hola / buenos días. Un saludo cortés al entrar de día a una tienda.',
    parts: [{ text: 'Bonjour !', meaning: 'Saludo completo: conserva juntos los sonidos de la palabra.' }],
    note: 'Escuchá los sonidos del modelo francés. Las partes aisladas pueden sonar distintas; volvé siempre a la palabra completa. No necesitás imitar una escritura fonética española.',
    transfer: { context: 'Entrás de día a otra tienda. ¿Cómo saludás?', choices: [{ text: 'Bonjour !', correct: true, explanation: 'El mismo saludo sirve al entrar de día a otra tienda.' }, { text: 'Au revoir !', correct: false, explanation: 'Au revoir sirve para despedirse. Para llegar y saludar, usá Bonjour.' }] },
  };
  if (language === 'en' && exercise.id === 'greet') {
    const modern = exercise.choices.some(c => c.correct && c.label === 'Hello! Yes, please.');
    return {
      id: modern ? 'en-help-greeting-v4' : 'en-greeting-legacy', text: modern ? 'Hello! Yes, please.' : 'Hello!',
      meaning: modern ? '¡Hola! Sí, por favor. Saludás y aceptás la ayuda que te ofrecen.' : 'Hola. Tu recorrido anterior practica primero el saludo; después vas a pedir ayuda.',
      parts: modern ? [{ text: 'Hello!', meaning: '¡Hola!' }, { text: 'Yes, please.', meaning: 'Sí, por favor.' }] : [{ text: 'Hello', meaning: 'Hola.' }, { text: 'Hi', meaning: 'Otra forma breve de saludar.' }],
      note: 'Escuchá cada grupo de palabras y luego la frase completa. No hace falta hablar al micrófono para practicar: podés repetir sin grabar.',
      transfer: { context: 'Otra persona te ofrece ayuda y querés aceptarla con cortesía. ¿Qué decís?', choices: [{ text: 'Yes, please.', correct: true, explanation: 'Yes, please acepta una oferta con cortesía.' }, { text: 'No, thank you.', correct: false, explanation: 'Es una frase cortés, pero rechaza la ayuda; en este contexto querés aceptarla.' }] },
    };
  }
  return null;
}
