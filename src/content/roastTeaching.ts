import type { EditorialReaction, HumorCategory } from '../domain/humor/models';
import type { CoachLocale } from '../domain/preferences';
const teaching: Record<CoachLocale, Record<string, string[]>> = {
  'es-SV': {
    bonjour: ['¡Ahuevo, mi perrito! Bonjour saluda de día; con madame o monsieur también entrás con cortesía, sin patear la puerta del francés.', '¡Puta, maje! Bonjour es el saludo de día que necesitábamos. No estabas despidiendo al café antes de entrar.'],
    prix: ['¡Ahuevo, mi perrito! Combien pregunta cuánto: con estas preguntas pedís el precio, no la escritura del local.', '¡Puta, maje! C’est combien y las preguntas con combien y coûter piden el precio. La billetera ya sabe por qué la llamaron.'],
    merci: ['¡Ahuevo, mi perrito! Merci agradece; beaucoup intensifica las gracias y je vous remercie también agradece con cortesía. Hasta la taza se siente atendida.', '¡Puta, maje! Usaste una expresión de agradecimiento. Merci bien o merci beaucoup refuerzan ese gracias, sin tener que dar un discurso.'],
    depart: ['¡Ahuevo, mi perrito! Au revoir despide y bonne journée desea un buen día. Ahora sí podés salir sin dejar la conversación colgada.', '¡Puta, maje! Cerraste con cortesía: au revoir es adiós y bonne journée es que tenga un buen día. El café ya no te tiene que perseguir.'],
  },
  'es-MX': {
    bonjour: ['¡Órale, cabrón! Bonjour saluda de día; madame y monsieur añaden el trato cortés. Esa pieza sí va al entrar.', 'No manches, quedó: bonjour abre la conversación durante el día. El saludo no necesitaba martillo.'],
    prix: ['¡Órale! Combien pregunta cuánto; estas expresiones piden el precio. Ahora sí estamos cotizando la bebida y no todo el taller.', 'Bien, cabrón: c’est combien y las preguntas con combien y coûter sirven para preguntar el precio. La cuenta ya tiene dónde encajar.'],
    merci: ['¡Órale, cabrón! Merci agradece, beaucoup refuerza las gracias y je vous remercie agradece con cortesía. Trabajo fino.', 'Quedó bien: merci bien y merci beaucoup refuerzan el agradecimiento. No hace falta envolverlo en cinta canela.'],
    depart: ['¡Órale! Au revoir despide; bonne journée desea un buen día. Cierre completo, sin piezas sobrantes.', 'Bien, cabrón: cerraste con una despedida cortés. Au revoir es adiós y bonne journée desea un buen día; guardamos las herramientas.'],
  },
  'es-CO': {
    bonjour: ['¡Qué nota, parce! Bonjour saluda de día; madame o monsieur añaden cortesía. El cuento empieza por la puerta correcta.', 'Bacano: bonjour abre una conversación de día. Esta historia no arrancó por la despedida.'],
    prix: ['¡Qué nota! Combien pregunta cuánto: así pedís el precio. El cuento de la cuenta ya tiene sentido, parce.', 'Bacano: c’est combien y las preguntas con combien y coûter piden el precio. Sin novela para saber cuánto vale la bebida.'],
    merci: ['¡Qué nota, parce! Merci agradece, beaucoup refuerza ese gracias y je vous remercie agradece con cortesía. Buen detalle en este capítulo.', 'Bacano: merci bien y merci beaucoup refuerzan el agradecimiento. Se puede cerrar ese gesto sin veinte capítulos de discurso.'],
    depart: ['¡Qué nota! Au revoir despide y bonne journée desea un buen día. Este cuento ya tiene cierre cortés.', 'Bacano, parce: au revoir es adiós y bonne journée desea un buen día. La conversación llegó al final sin dejar cabos sueltos.'],
  },
  'es-AR': {
    bonjour: ['¡Bien ahí, carajo! Bonjour saluda de día; madame o monsieur añaden cortesía. Entraste sin convocar al comité del saludo.', 'Bárbaro, che: bonjour abre la conversación durante el día. No hacía falta una conferencia de prensa para entrar.'],
    prix: ['¡Bien ahí! Combien pregunta cuánto; estas expresiones piden el precio. La cuenta dejó de ser una película de misterio.', 'Bárbaro, che: c’est combien y las preguntas con combien y coûter piden el precio. No estamos negociando la compra del edificio.'],
    merci: ['¡Bien ahí, carajo! Merci agradece, beaucoup refuerza las gracias y je vous remercie agradece con cortesía. Sin discurso de premiación.', 'Bárbaro: merci bien y merci beaucoup refuerzan el agradecimiento. El gracias ya está, podemos cancelar la ceremonia.'],
    depart: ['¡Bien ahí! Au revoir despide y bonne journée desea un buen día. Cerraste la conversación sin temporada extra.', 'Bárbaro, che: au revoir es adiós y bonne journée desea un buen día. Listo el cierre; la solemnidad puede irse a casa.'],
  },
};
export const roastTeaching: EditorialReaction[] = Object.entries(teaching).flatMap(([locale, exercises]) => Object.entries(exercises).flatMap(([exerciseId, lines]) => (['correct', 'recovery'] as HumorCategory[]).flatMap(category => lines.map((text, index) => ({ version: 1, id: `roast-teaching-v1:${locale}:${exerciseId}:${category}:${index}`, locale: locale as CoachLocale, exerciseId, category, mode: 'roast', intensity: 'playful', explicit: true, educational: true, text })))));
