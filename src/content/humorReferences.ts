import type { CoachLocale } from '../domain/preferences';
import type { EditorialReaction } from '../domain/humor/models';
export interface HumorReference {
  version: 1; id: string; culturalReference: string; language: 'fr' | 'en'; scopeId: string; exerciseId: string; objectiveId: string;
  patterns: { id: string; exact: string }[];
  correction: string;
  interpretations: Record<CoachLocale, [string, string]>;
}
// Universal references; only the editorial interpretation is regional.
export const humorReferences: HumorReference[] = [
  { version: 1, id: 'reference-v1:messi-goku', culturalReference: 'Lionel Messi y Goku (Dragon Ball)', language: 'fr', scopeId: 'roast-cafe-fr-a1', exerciseId: 'merci', objectiveId: 'remercier', patterns: [{ id: 'messi-goku', exact: 'Messi Goku' }], correction: 'Merci beaucoup significa muchas gracias.', interpretations: {
    'es-SV': ['¡PUTAAAA, MAJE! ¿Messi Goku? Juntaste al fútbol con Dragon Ball y nosotros solo queríamos agradecer. Va, mi perrito: merci beaucoup significa muchas gracias.', '¡No jodás, cerote! Escribiste Messi Goku; ese agradecimiento llegó con balón y transformación. Para dar las gracias: merci beaucoup.'],
    'es-MX': ['No manches, ¿Messi Goku? Esa alineación sí mete miedo, pero no da las gracias. Merci beaucoup significa muchas gracias.', '¡Cabrón, Messi Goku! Ya armaste el equipo y falta agradecer el café. Es merci beaucoup: muchas gracias.'],
    'es-CO': ['Uy, parce, ¿Messi Goku? Ese partido me lo veo, pero primero agradezcamos la atención: merci beaucoup significa muchas gracias.', 'Qué cruce tan bravo, parce: Messi Goku. El café nos quedó entre el estadio y Dragon Ball. Para agradecer, escribí merci beaucoup: muchas gracias.'],
    'es-AR': ['Che, ¿Messi Goku? Con ese refuerzo ganamos todo, menos este agradecimiento. Merci beaucoup significa muchas gracias.', 'Messi Goku, mirá vos. Ya quiero ver ese partido, pero al café le debemos un gracias: merci beaucoup significa muchas gracias.'],
  } },
  { version: 1, id: 'reference-v1:bon-jovi', culturalReference: 'Bon Jovi', language: 'fr', scopeId: 'roast-cafe-fr-a1', exerciseId: 'bonjour', objectiveId: 'saluer', patterns: [{ id: 'bon-jovi', exact: 'Bon Jovi' }], correction: 'Bonjour significa hola o buenos días.', interpretations: {
    'es-SV': ['¡Puta, maje! Bon Jovi: venías a saludar y trajiste al grupo. Aquí basta con bonjour, que significa hola o buenos días.', 'Maje, escribiste Bon Jovi. Buen gusto para el concierto; para entrar al café, bonjour: hola o buenos días.'],
    'es-MX': ['No manches, Bon Jovi. Ya iba a pedir otra canción, pero estamos saludando: bonjour significa hola o buenos días.', 'Bon Jovi, cabrón. El café todavía no vende boletos. El saludo que buscamos es bonjour: hola o buenos días.'],
    'es-CO': ['Parce, Bon Jovi sí anima la entrada, pero aquí no estamos anunciando concierto. Bonjour significa hola o buenos días.', 'Uy, Bon Jovi. Me quedo al concierto, pero antes saludemos: bonjour quiere decir hola o buenos días.'],
    'es-AR': ['Che, Bon Jovi. Venías por un café y anunciaste el recital. Para saludar de día es bonjour: hola o buenos días.', 'Bon Jovi, mirá vos. Te sigo el estribillo después; ahora va bonjour, que significa hola o buenos días.'],
  } },
  { version: 1, id: 'reference-v1:berry-much', culturalReference: 'Berry (baya) frente a very (muy)', language: 'en', scopeId: 'roast-english-a1', exerciseId: 'thanks', objectiveId: 'thank', patterns: [{ id: 'thank-you-berry-much', exact: 'Thank you berry much' }], correction: 'Thank you very much significa muchas gracias; berry significa baya.', interpretations: {
    'es-SV': ['¡Puta, maje! Ese thank you berry much vino con fruta. Berry es baya; para decir muchas gracias usá thank you very much.', 'Maje, escribiste berry: baya. No hay que traer fruta para agradecer. Thank you very much significa muchas gracias.'],
    'es-MX': ['No manches, thank you berry much. El agradecimiento salió con fruta extra. Berry es baya; thank you very much significa muchas gracias.', 'Cabrón, berry es baya; el gracias no necesitaba ingredientes. Escribí thank you very much para decir muchas gracias.'],
    'es-CO': ['Parce, ese thank you berry much quedó para el jugo. Berry es baya; muchas gracias se dice thank you very much.', 'Uy, se nos metió fruta en el agradecimiento: berry significa baya. Thank you very much significa muchas gracias.'],
    'es-AR': ['Che, thank you berry much. Te pedí un gracias y apareció fruta. Berry es baya; thank you very much significa muchas gracias.', 'Berry es baya, che; agradecimos y abrimos una verdulería. Para muchas gracias, escribí thank you very much.'],
  } },
];
export const referenceReactions: EditorialReaction[] = humorReferences.flatMap(reference => Object.entries(reference.interpretations).flatMap(([locale, lines]) => (['error', 'retry', 'recurring'] as const).flatMap(category => lines.map((text, index) => ({ version: 1, id: `${reference.id}:${locale}:${category}:${index}`, locale: locale as CoachLocale, category, mode: 'roast', intensity: 'playful', explicit: true, educational: true, referenceId: reference.id, exerciseId: reference.exerciseId, text })))));
