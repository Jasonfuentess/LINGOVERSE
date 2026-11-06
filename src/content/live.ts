import type { ErrorPattern, Lesson, LessonVariant, TextExercise, UnderstandingRule } from '../domain/learning/models';
import { validateLesson } from '../domain/learning/validation';

/**
 * RML-001 Roast Me Live scenarios. Short role-plays (the coach sets the scene in Spanish; the partner
 * speaks the target language) built on the LV-007B contextual contracts: reviewed intents with
 * consequences and facts, minor slips that still communicate, real errors with explanations,
 * ambiguous replies the partner asks about and off-context replies. Nothing is generated at runtime.
 * Every scenario follows the same four objectives so validation covers every route.
 *
 * RML-002 (content version 2): each turn also has reviewed understanding rules for natural replies
 * (variants, short answers, negatives, quantities, places) and error patterns for reviewed mistakes
 * inside longer replies. See src/domain/learning/understanding.ts for the matching guarantees.
 */
export const liveObjectives = ['live-open', 'live-request', 'live-detail', 'live-close'];
type Turn = Omit<TextExercise, 'kind' | 'conversation' | 'objectiveId' | 'title' | 'scene' | 'speaker' | 'writtenRules'> & {
  writtenRules?: TextExercise['writtenRules'];
};
interface Scenario { id: string; title: string; setup: string; partner: string; turns: [Turn, Turn, Turn, Turn] }
const titles = ['Abrir la conversación', 'Pedir lo que necesitás', 'Precisar un detalle', 'Cerrar con naturalidad'];
const unknownFr = 'Todavía no pude interpretar esa frase en esta escena. No significa que esté mal ni que sea un error tuyo: reformulala con otras palabras o mirá la ayuda.';
const unknownEn = unknownFr;

// ——— RML-002 reviewed vocabulary for natural replies (whole words; accents/case ignored) ———
const YES_FR = ['oui', 'ouais', 'bien sur', 'volontiers', 'avec plaisir', 'd accord', 'ok', 'okay', 'pourquoi pas', 'parfait', 'tres bien'];
const NO_FR = ['non', 'pas', 'jamais', 'sans'];
const POLITE_FR = ['s il vous plait', 's il te plait', 'svp', 'merci', 'je voudrais', 'volontiers', 'je veux bien', 'avec plaisir'];
const FILLER_FR = ['bonjour', 'salut', 'madame', 'monsieur', 'alors', 'euh', 'ah', 'oh', 'eh', 'ben', 'bah', 'bon', 'oui', 'non', 'merci', 'beaucoup', 's', 'il', 'vous', 'plait', 'svp', 'tres', 'bien', 'super', 'parfait', 'je', 'j', 'voudrais', 'veux', 'pour', 'et', 'avec', 'un', 'une', 'le', 'la', 'les', 'de', 'du', 'des', 'd', 'c', 'est', 'ca', 'moi', 'voila', 'ok', 'okay', 'accord', 'aussi', 'juste', 'peu'];
const YES_EN = ['yes', 'yeah', 'yep', 'yup', 'sure', 'of course', 'ok', 'okay', 'absolutely', 'definitely', 'that would be great', 'why not'];
const NO_EN = ['no', 'not', 'don t', 'do not', 'nope', 'nah', 'never'];
const POLITE_EN = ['please', 'can i have', 'could i have', 'can i get', 'could i get', 'may i have', 'i d like', 'i would like', 'thanks', 'thank you'];
const FILLER_EN = ['hi', 'hello', 'hey', 'yes', 'no', 'please', 'thanks', 'thank', 'you', 'very', 'much', 'so', 'well', 'um', 'uh', 'oh', 'ah', 'ok', 'okay', 'sure', 'great', 'the', 'a', 'an', 'i', 'm', 'am', 'and', 'just', 'for', 'to', 'it', 'is', 's', 'would', 'like', 'd', 'can', 'could', 'have', 'get', 'me', 'really', 'lot', 'cheers', 'there', 'mate', 'sir', 'madam'];
type RuleDraft = Omit<UnderstandingRule, 'id' | 'canonical' | 'all' | 'fit' | 'explanation'>;
const rule = (id: string, fit: UnderstandingRule['fit'], canonical: string, all: string[][], explanation: string, extra: RuleDraft = {}): UnderstandingRule => ({ id, fit, canonical, all, explanation, ...extra });
const error = (input: string, all: string[][], none?: string[]): ErrorPattern => ({ rule: input, all, ...(none ? { none } : {}) });

interface Drink { fact: string; words: string[]; polite: string; plain: string; better: string; intent?: string; reply?: string }
const DRINKS_FR: Drink[] = [
  { fact: 'cafe', words: ['cafe', 'cafes', 'expresso', 'espresso', 'cafe creme', 'un creme'], polite: 'Un café, merci.', plain: 'Un café.', better: "Je voudrais un café, s'il vous plaît.", intent: 'coffee' },
  { fact: 'the', words: ['the', 'thes', 'the vert', 'the noir'], polite: 'Un thé, merci.', plain: 'Un thé.', better: "Je voudrais un thé, s'il vous plaît.", intent: 'tea' },
  { fact: 'chocolat', words: ['chocolat', 'chocolat chaud'], polite: "Un chocolat chaud, s'il vous plaît.", plain: 'Un chocolat chaud.', better: "Un café, s'il vous plaît.", reply: 'Un chocolat chaud, avec plaisir. → Un chocolate caliente, con gusto.' },
  { fact: 'eau', words: ['eau', 'de l eau', 'une eau', 'carafe d eau', 'eau minerale'], polite: "Une carafe d'eau, s'il vous plaît.", plain: "De l'eau.", better: "Un café, s'il vous plaît.", reply: "Une carafe d'eau, tout de suite. → Una jarra de agua, enseguida." },
  { fact: 'jus', words: ['jus', 'jus d orange', 'orange pressee'], polite: "Un jus d'orange, s'il vous plaît.", plain: "Un jus d'orange.", better: "Un café, s'il vous plaît.", reply: "Un jus d'orange pressé. → Un jugo de naranja exprimido." },
];
const DRINKS_EN: Drink[] = [
  { fact: 'coffee', words: ['coffee', 'coffees', 'latte', 'cappuccino', 'flat white', 'americano', 'espresso', 'mocha'], polite: 'Could I get a coffee, please?', plain: 'Coffee.', better: 'Can I have a coffee, please?', intent: 'coffee' },
  { fact: 'tea', words: ['tea', 'teas', 'cup of tea', 'english breakfast', 'green tea'], polite: 'Could I get a tea, please?', plain: 'Tea.', better: 'Can I have a tea, please?', intent: 'tea' },
  { fact: 'chocolate', words: ['hot chocolate', 'chocolate'], polite: 'A hot chocolate, please.', plain: 'Hot chocolate.', better: 'Can I have a coffee, please?', reply: 'A hot chocolate, lovely. → Un chocolate caliente, qué rico.' },
  { fact: 'water', words: ['water', 'glass of water', 'sparkling water', 'still water'], polite: 'A glass of water, please.', plain: 'Water.', better: 'Can I have a coffee, please?', reply: 'Water, coming up. → Agua, enseguida.' },
  { fact: 'juice', words: ['juice', 'orange juice', 'apple juice'], polite: 'An orange juice, please.', plain: 'Orange juice.', better: 'Can I have a coffee, please?', reply: 'An orange juice, fresh today. → Un jugo de naranja, fresco de hoy.' },
];
const DRINK_WORDS_FR = DRINKS_FR.flatMap(item => item.words);
const DRINK_WORDS_EN = DRINKS_EN.flatMap(item => item.words);
/**
 * Two rules per drink: polite (demonstrates the objective) and plain (understood, story continues,
 * the polite form is taught). Mentioning two different drinks matches two meanings and stays unresolved.
 */
const orderRules = (drinks: Drink[], factName: string, polite: string[], no: string[], language: 'fr' | 'en') => drinks.flatMap(drink => {
  const base: RuleDraft = { ...(drink.intent ? { intent: drink.intent } : { facts: { [factName]: drink.fact } }), ...(drink.reply ? { reply: drink.reply } : {}) };
  const extra = drink.intent ? '' : language === 'fr' ? " La forma que practicamos en esta escena es Un café, s'il vous plaît." : ' La forma que practicamos en esta escena es Can I have a coffee, please?';
  return [
    rule(`${drink.fact}-polite`, drink.intent ? 'target' : 'different', drink.polite, [drink.words, polite], `Se entendió tu pedido, dicho con cortesía y con tus propias palabras.${extra}`, { ...base, none: no, ...(drink.intent ? {} : { better: drink.better }) }),
    rule(`${drink.fact}-plain`, 'different', drink.plain, [drink.words], language === 'fr' ? "Se entendió tu pedido y la escena sigue. En un café se pide con s'il vous plaît o je voudrais." : 'Se entendió tu pedido y la escena sigue. En inglés suena más amable con please o Can I have…?', { ...base, none: no, better: drink.better }),
  ];
});

function variant(language: 'fr' | 'en', scenario: Scenario): LessonVariant {
  return {
    id: scenario.id, title: scenario.title, start: scenario.turns[0].id,
    exercises: scenario.turns.map((turn, index): TextExercise => ({
      kind: 'text', conversation: 'contextual-v1', objectiveId: liveObjectives[index]!, title: titles[index]!,
      scene: scenario.setup, speaker: scenario.partner, writtenRules: [],
      unknownExplanation: language === 'fr' ? unknownFr : unknownEn,
      unknownSpokenExplanation: 'Todavía no pude interpretar esa frase. Reformulala o mirá la ayuda.',
      ...turn,
      ...(natural[turn.id]?.understanding ? { understanding: natural[turn.id]!.understanding } : {}),
      ...(natural[turn.id]?.errorPatterns ? { errorPatterns: natural[turn.id]!.errorPatterns } : {}),
      lexicon: [...(language === 'fr' ? FILLER_FR : FILLER_EN), ...(natural[turn.id]?.lexicon ?? [])],
    })),
  };
}

const fr: Scenario[] = [
  {
    id: 'cafe-terrasse', title: 'Una terraza en París', partner: 'Lucien',
    setup: 'Te sentás en la terraza de un café en París. Lucien, el mesero, se acerca con una bandeja.',
    turns: [
      { id: 'cafe-open', prompt: 'Bonjour ! Une table pour vous ?', promptTranslation: '¡Hola! ¿Una mesa para usted?',
        teaching: "Oui, s'il vous plaît = sí, por favor. Pour une personne / pour deux personnes = para una / dos personas.",
        instruction: 'Aceptá la mesa con cortesía.', explanation: 'Aceptaste la mesa con una fórmula cortés.', correction: "Oui, s'il vous plaît.",
        accepted: ["Oui, s'il vous plaît.", "Bonjour, oui, s'il vous plaît.", 'Oui, pour une personne.', 'Oui, pour deux personnes.', 'Oui, merci.'],
        intents: [{ id: 'one-person', examples: ['Oui, pour une personne.'], facts: { guests: 'une' }, explanation: 'Pediste mesa para una persona.' }, { id: 'two-people', examples: ['Oui, pour deux personnes.'], facts: { guests: 'deux' }, reply: 'Pour deux, très bien. Par ici ! → Para dos, muy bien. ¡Por aquí!', explanation: 'Pediste mesa para dos: Lucien prepara dos lugares.' }],
        minorForms: [{ input: "Oui, sil vous plait.", better: "Oui, s'il vous plaît.", issue: 'spelling', explanation: "Se entiende. S'il lleva apóstrofo y plaît lleva acento circunflejo." }],
        clarifications: [{ inputs: ['Table.', 'Une table.'], reply: 'Une table… oui ? Pour vous ? → Una mesa… ¿sí? ¿Para usted?', explanation: 'Lucien entendió «mesa», pero no si la aceptás. Respondé: Oui, s’il vous plaît.' }],
        offContext: [{ inputs: ['Au revoir.'], explanation: 'Acabás de llegar y querés sentarte: aceptá la mesa.' }],
        writtenRules: [{ input: 'Bonjour, je suis une table.', issue: 'vocabulary', explanation: 'Je suis une table significa «soy una mesa». Para aceptar la mesa: Oui, s’il vous plaît.' }],
        next: 'cafe-order', reply: 'Très bien, installez-vous. → Muy bien, siéntese.' },
      { id: 'cafe-order', prompt: "Qu'est-ce que je vous sers ?", promptTranslation: '¿Qué le sirvo?',
        contextualPrompts: [
          { when: [{ fact: 'guests', value: 'deux' }], prompt: "Et pour vous deux, qu'est-ce que je vous sers ?", promptTranslation: 'Y para ustedes dos, ¿qué les sirvo?' },
          { when: [{ fact: 'guests', value: 'trois' }], prompt: "Et pour vous trois, qu'est-ce que je vous sers ?", promptTranslation: 'Y para ustedes tres, ¿qué les sirvo?' },
          { when: [{ fact: 'guests', value: 'quatre' }], prompt: "Et pour vous quatre, qu'est-ce que je vous sers ?", promptTranslation: 'Y para ustedes cuatro, ¿qué les sirvo?' },
          { when: [{ fact: 'seat', value: 'comptoir' }], prompt: "Au comptoir, très bien. Qu'est-ce que je vous sers ?", promptTranslation: 'En la barra, muy bien. ¿Qué le sirvo?' },
        ],
        teaching: "Un café / un thé, s'il vous plaît. Je voudrais = quisiera, más cortés.",
        instruction: 'Pedí una bebida.', explanation: 'Pediste tu bebida con cortesía.', correction: "Je voudrais un café, s'il vous plaît.",
        accepted: ["Un café, s'il vous plaît.", "Je voudrais un café, s'il vous plaît.", "Un thé, s'il vous plaît.", "Je voudrais un thé, s'il vous plaît."],
        intents: [
          { id: 'coffee', examples: ["Un café, s'il vous plaît.", "Je voudrais un café, s'il vous plaît."], facts: { drink: 'cafe' }, reply: 'Un café, parfait. → Un café, perfecto.', explanation: 'Pediste un café.' },
          { id: 'tea', examples: ["Un thé, s'il vous plaît.", "Je voudrais un thé, s'il vous plaît."], facts: { drink: 'the' }, reply: 'Un thé, très bien. → Un té, muy bien.', explanation: 'Pediste un té.' },
        ],
        minorForms: [
          { input: "Un cafe, s'il vous plaît.", better: "Un café, s'il vous plaît.", issue: 'spelling', explanation: 'Se entiende el pedido. Café lleva acento: é.', intent: 'coffee' },
          { input: "Je voudrais un the, s'il vous plaît.", better: "Je voudrais un thé, s'il vous plaît.", issue: 'spelling', explanation: 'Se entiende el pedido. Thé lleva acento: é.', intent: 'tea' },
        ],
        clarifications: [{ inputs: ['Oui.', 'Oui, merci.'], reply: 'Oui… mais quoi ? Un café, un thé ? → Sí… ¿pero qué? ¿Un café, un té?', explanation: 'Lucien te preguntó qué querés; un «sí» no le dice qué traer. Nombrá la bebida.' }],
        offContext: [{ inputs: ['Bonjour !'], explanation: 'Ya saludaste. Ahora Lucien espera tu pedido.' }],
        writtenRules: [
          { input: 'Je voudrais un canard.', issue: 'vocabulary', explanation: 'Un canard es un pato. Para beber: un café o un thé.' },
          { input: 'Je suis un café.', issue: 'vocabulary', explanation: 'Je suis un café significa «soy un café». Para pedir: Un café, s’il vous plaît.' },
        ],
        next: 'cafe-detail', reply: 'Tout de suite. → Enseguida.' },
      { id: 'cafe-detail', prompt: 'Avec du sucre ?', promptTranslation: '¿Con azúcar?',
        contextualPrompts: [
          { when: [{ fact: 'drink', value: 'cafe' }], prompt: 'Votre café, avec du lait ?', promptTranslation: 'Su café, ¿con leche?' },
          { when: [{ fact: 'drink', value: 'the' }], prompt: 'Votre thé, avec du citron ?', promptTranslation: 'Su té, ¿con limón?' },
          { when: [{ fact: 'drink', value: 'chocolat' }], prompt: 'Votre chocolat, avec de la chantilly ?', promptTranslation: 'Su chocolate, ¿con crema batida?' },
          { when: [{ fact: 'drink', value: 'eau' }], prompt: 'Votre eau, avec des glaçons ?', promptTranslation: 'Su agua, ¿con hielo?' },
          { when: [{ fact: 'drink', value: 'jus' }], prompt: 'Votre jus, avec des glaçons ?', promptTranslation: 'Su jugo, ¿con hielo?' },
        ],
        teaching: "Oui, s'il vous plaît = sí, por favor. Non, merci = no, gracias.",
        instruction: 'Aceptá o rechazá con cortesía.', explanation: 'Respondiste sí o no con cortesía.', correction: "Oui, s'il vous plaît. / Non, merci.",
        accepted: ["Oui, s'il vous plaît.", 'Non, merci.', 'Oui, merci.', 'Non, merci beaucoup.'],
        intents: [
          { id: 'yes', examples: ["Oui, s'il vous plaît.", 'Oui, merci.'], facts: { extra: 'oui' }, explanation: 'Aceptaste con cortesía.' },
          { id: 'no', examples: ['Non, merci.', 'Non, merci beaucoup.'], facts: { extra: 'non' }, explanation: 'Rechazaste con cortesía.' },
        ],
        minorForms: [{ input: 'Non, mersi.', better: 'Non, merci.', issue: 'spelling', explanation: 'Se entiende. Merci se escribe con c.', intent: 'no' }],
        offContext: [{ inputs: ['Au revoir.'], explanation: 'Todavía no te sirvieron: respondé la pregunta de Lucien.' }],
        writtenRules: [{ input: "Non, s'il vous plaît.", issue: 'vocabulary', explanation: 'Para rechazar se dice Non, merci. S’il vous plaît acompaña un «sí» o un pedido.' }],
        next: 'cafe-close', reply: "C'est noté. → Anotado." },
      { id: 'cafe-close', prompt: 'Et voilà ! Ça fait trois euros.', promptTranslation: '¡Listo! Son tres euros.',
        teaching: 'Merci = gracias. Bonne journée = que tenga un buen día. Voilà = aquí tiene.',
        instruction: 'Pagá y despedite con cortesía.', explanation: 'Cerraste la conversación con cortesía.', correction: 'Merci, bonne journée !',
        accepted: ['Merci !', 'Merci, bonne journée !', 'Voilà, merci !', 'Merci beaucoup !'],
        minorForms: [{ input: 'Mersi !', better: 'Merci !', issue: 'spelling', explanation: 'Se entiende. Merci se escribe con c.' }],
        offContext: [{ inputs: ['Bonjour !'], explanation: 'Ya estás terminando: agradecé o despedite.' }],
        writtenRules: [{ input: 'De rien !', issue: 'vocabulary', explanation: 'De rien significa «de nada»: responde a un gracias. Aquí te toca agradecer: Merci !' }],
        next: null, reply: 'Merci à vous ! → ¡Gracias a usted!' },
    ],
  },
  {
    id: 'metro-perdu', title: 'Perdido cerca del metro', partner: 'Amélie',
    setup: 'Saliste de una tienda y no encontrás el metro. Amélie, una vecina amable, se detiene a tu lado.',
    turns: [
      { id: 'metro-open', prompt: 'Bonjour ! Je peux vous aider ?', promptTranslation: '¡Hola! ¿Puedo ayudarle?',
        teaching: "Oui, s'il vous plaît. Je suis perdu / perdue = estoy perdido / perdida.",
        instruction: 'Aceptá la ayuda.', explanation: 'Aceptaste la ayuda con cortesía.', correction: "Oui, s'il vous plaît.",
        accepted: ["Oui, s'il vous plaît.", "Bonjour, oui, s'il vous plaît.", 'Oui, merci.', 'Oui, je suis perdu.', 'Oui, je suis perdue.', 'Oui, je cherche le métro.', 'Oui, je cherche la gare.'],
        intents: [
          { id: 'lost', examples: ['Oui, je suis perdu.', 'Oui, je suis perdue.'], facts: { state: 'perdu' }, reply: 'Pas de panique, je vais vous aider. → Tranquilo, te voy a ayudar.', explanation: 'Explicaste que estás perdido: Amélie te tranquiliza.' },
          { id: 'metro-now', examples: ['Oui, je cherche le métro.'], facts: { place: 'metro' }, next: 'metro-detail', completes: ['live-request'], reply: 'Le métro ? Je vous explique. → ¿El metro? Le explico.', explanation: 'Aceptaste la ayuda y ya dijiste qué buscás: Amélie no necesita preguntártelo.' },
          { id: 'gare-now', examples: ['Oui, je cherche la gare.'], facts: { place: 'gare' }, next: 'metro-detail', completes: ['live-request'], reply: 'La gare ? Je vous explique. → ¿La estación? Le explico.', explanation: 'Aceptaste la ayuda y ya dijiste qué buscás: Amélie no necesita preguntártelo.' },
        ],
        minorForms: [{ input: 'Oui, je suis perdi.', better: 'Oui, je suis perdu.', issue: 'spelling', explanation: 'Se entiende. Perdu termina en u.', intent: 'lost' }],
        offContext: [{ inputs: ['Au revoir.'], explanation: 'Estás perdido: aceptá la ayuda.' }],
        writtenRules: [{ input: 'Oui, je suis perdu le métro.', issue: 'structure', explanation: 'Esa frase mezcla dos ideas. Primero: Je suis perdu. Después vas a decir qué buscás.' }],
        next: 'metro-ask', reply: 'Bien sûr. → Claro.' },
      { id: 'metro-ask', asks: 'place', prompt: 'Vous cherchez quoi ?', promptTranslation: '¿Qué está buscando?',
        teaching: 'Je cherche le métro = busco el metro. Où est la gare ? = ¿Dónde está la estación de tren?',
        instruction: 'Decí qué buscás.', explanation: 'Dijiste qué lugar buscás.', correction: 'Je cherche le métro.',
        accepted: ['Je cherche le métro.', "Où est le métro, s'il vous plaît ?", 'Le métro, s’il vous plaît.', 'Je cherche la gare.', "Où est la gare, s'il vous plaît ?"],
        intents: [
          { id: 'metro', examples: ['Je cherche le métro.', "Où est le métro, s'il vous plaît ?", 'Le métro, s’il vous plaît.'], facts: { place: 'metro' }, explanation: 'Dijiste que buscás el metro.' },
          { id: 'station', examples: ['Je cherche la gare.', "Où est la gare, s'il vous plaît ?"], facts: { place: 'gare' }, explanation: 'Dijiste que buscás la estación de tren.' },
        ],
        minorForms: [
          { input: 'Je cherche le metro.', better: 'Je cherche le métro.', issue: 'spelling', explanation: 'Se entiende. Métro lleva acento: é.', intent: 'metro' },
          { input: 'Je cherche la métro.', better: 'Je cherche le métro.', issue: 'structure', explanation: 'Se entiende. Métro es masculino: le métro.', intent: 'metro' },
        ],
        clarifications: [{ inputs: ['Le métro ?', 'Métro.'], reply: 'Le métro ? Vous cherchez la station ? → ¿El metro? ¿Busca la estación?', explanation: 'Amélie te escuchó, pero quiere confirmar. Decí la frase completa: Je cherche le métro.' }],
        offContext: [{ inputs: ['Où sont les toilettes ?'], explanation: 'Buena pregunta para otro momento, pero en esta escena buscás el metro.' }],
        writtenRules: [{ input: 'Je suis le métro.', issue: 'vocabulary', explanation: 'Je suis le métro significa «soy el metro» (o «sigo al metro»). Para buscar: Je cherche le métro.' }],
        next: 'metro-detail', reply: "D'accord. → De acuerdo." },
      { id: 'metro-detail', prompt: "C'est tout près. D'accord ?", promptTranslation: 'Está muy cerca. ¿De acuerdo?',
        contextualPrompts: [
          { when: [{ fact: 'place', value: 'metro' }], prompt: "Le métro ? C'est tout droit, puis à gauche. D'accord ?", promptTranslation: '¿El metro? Es todo recto y luego a la izquierda. ¿De acuerdo?' },
          { when: [{ fact: 'place', value: 'gare' }], prompt: "La gare ? C'est à droite, puis tout droit. D'accord ?", promptTranslation: '¿La estación? Es a la derecha y luego todo recto. ¿De acuerdo?' },
        ],
        teaching: "D'accord = de acuerdo. C'est loin ? = ¿está lejos? Pardon ? = ¿perdón?, para pedir que repitan.",
        instruction: 'Confirmá que entendiste o preguntá si está lejos.', explanation: 'Confirmaste la indicación.', correction: "D'accord, merci.",
        accepted: ["D'accord, merci.", "D'accord.", "Oui, d'accord.", "C'est loin ?"],
        intents: [{ id: 'far', examples: ["C'est loin ?"], facts: { asked: 'loin' }, reply: 'Non, cinq minutes à pied. → No, cinco minutos a pie.', explanation: 'Preguntaste si está lejos: una pregunta muy útil.' }],
        minorForms: [{ input: "D'accorde, merci.", better: "D'accord, merci.", issue: 'spelling', explanation: "Se entiende. D'accord termina en d, sin e." }],
        clarifications: [{ inputs: ['Pardon ?', 'Comment ?'], reply: 'Je répète, plus lentement… → Repito, más despacio…', explanation: 'Pedir que repitan está perfecto. Amélie lo repite; después confirmá con D’accord.' }],
        writtenRules: [{ input: "D'accord, bonne nuit.", issue: 'vocabulary', explanation: 'Bonne nuit se dice al ir a dormir. Aquí basta con D’accord, merci.' }],
        next: 'metro-close', reply: 'Parfait. → Perfecto.' },
      { id: 'metro-close', prompt: 'Bonne journée !', promptTranslation: '¡Que tenga un buen día!',
        teaching: 'Merci, vous aussi ! = gracias, usted también. Merci beaucoup = muchas gracias.',
        instruction: 'Agradecé y despedite.', explanation: 'Te despediste con cortesía.', correction: 'Merci, vous aussi !',
        accepted: ['Merci, vous aussi !', 'Merci, bonne journée !', 'Merci beaucoup !', 'Merci !'],
        minorForms: [{ input: 'Merci, vous ausi !', better: 'Merci, vous aussi !', issue: 'spelling', explanation: 'Se entiende. Aussi lleva doble s.' }],
        writtenRules: [{ input: 'Bonne nuit !', issue: 'vocabulary', explanation: 'Bonne nuit se dice al ir a dormir. De día: Merci, bonne journée !' }],
        next: null, reply: 'Au revoir ! → ¡Adiós!' },
    ],
  },
  {
    id: 'boulangerie', title: 'La panadería del barrio', partner: 'Mathilde',
    setup: 'Es temprano. Entrás a una panadería que huele a pan recién horneado. Mathilde atiende detrás del mostrador.',
    turns: [
      { id: 'pain-open', prompt: 'Bonjour !', promptTranslation: '¡Buenos días!',
        teaching: 'Bonjour = buenos días. Bonjour, madame / monsieur = más formal.',
        instruction: 'Saludá al entrar.', explanation: 'Saludaste al entrar, como se hace en Francia.', correction: 'Bonjour, madame !',
        accepted: ['Bonjour !', 'Bonjour, madame !', 'Bonjour, monsieur !'],
        minorForms: [{ input: 'Bonjur !', better: 'Bonjour !', issue: 'spelling', explanation: 'Se entiende. Bonjour se escribe con ou.' }],
        offContext: [{ inputs: ['Au revoir !', 'Merci !'], explanation: 'Acabás de entrar: primero se saluda.' }],
        writtenRules: [{ input: 'Bonsoir !', issue: 'vocabulary', explanation: 'Bonsoir es para la tarde-noche; es temprano: Bonjour !' }, { input: 'Bonne nuit !', issue: 'vocabulary', explanation: 'Bonne nuit se dice al ir a dormir. Al entrar de día: Bonjour !' }],
        next: 'pain-order', reply: 'Bonjour ! Je vous écoute. → ¡Buenos días! La escucho.' },
      { id: 'pain-order', prompt: 'Qu’est-ce qu’il vous faut ?', promptTranslation: '¿Qué necesita?',
        teaching: "Une baguette, s'il vous plaît. Un croissant, s'il vous plaît. Je voudrais = quisiera.",
        instruction: 'Pedí pan o un croissant.', explanation: 'Pediste con cortesía.', correction: "Une baguette, s'il vous plaît.",
        accepted: ["Une baguette, s'il vous plaît.", "Je voudrais une baguette, s'il vous plaît.", "Un croissant, s'il vous plaît.", "Je voudrais un croissant, s'il vous plaît."],
        intents: [
          { id: 'baguette', examples: ["Une baguette, s'il vous plaît.", "Je voudrais une baguette, s'il vous plaît."], facts: { item: 'baguette' }, reply: 'Une baguette, voilà. → Una baguette, aquí tiene.', explanation: 'Pediste una baguette.' },
          { id: 'croissant', examples: ["Un croissant, s'il vous plaît.", "Je voudrais un croissant, s'il vous plaît."], facts: { item: 'croissant' }, reply: 'Un croissant, tout chaud. → Un croissant, bien calentito.', explanation: 'Pediste un croissant.' },
        ],
        minorForms: [
          { input: "Un baguette, s'il vous plaît.", better: "Une baguette, s'il vous plaît.", issue: 'structure', explanation: 'Se entiende. Baguette es femenino: une baguette.', intent: 'baguette' },
          { input: "Un crossant, s'il vous plaît.", better: "Un croissant, s'il vous plaît.", issue: 'spelling', explanation: 'Se entiende. Croissant lleva oi: crois-sant.', intent: 'croissant' },
        ],
        clarifications: [{ inputs: ['Du pain.', 'Pain.'], reply: 'Du pain… une baguette ? → Pan… ¿una baguette?', explanation: 'Mathilde vende muchos panes; nombrá cuál: Une baguette, s’il vous plaît.' }],
        writtenRules: [{ input: 'Je suis une baguette.', issue: 'vocabulary', explanation: 'Je suis une baguette significa «soy una baguette». Para pedir: Une baguette, s’il vous plaît.' }],
        next: 'pain-more', reply: 'Très bien. → Muy bien.' },
      { id: 'pain-more', prompt: 'Avec ceci ?', promptTranslation: '¿Algo más?',
        teaching: "C'est tout, merci = es todo, gracias. Oui, un croissant aussi = sí, un croissant también.",
        instruction: 'Decí si querés algo más.', explanation: 'Respondiste si querías algo más.', correction: "C'est tout, merci.",
        accepted: ["C'est tout, merci.", "Non, c'est tout.", "Non, merci, c'est tout.", 'Oui, un croissant aussi.'],
        intents: [
          { id: 'done', examples: ["C'est tout, merci.", "Non, c'est tout.", "Non, merci, c'est tout."], facts: { more: 'non' }, explanation: 'Dijiste que no querés nada más.' },
          { id: 'more', examples: ['Oui, un croissant aussi.'], facts: { more: 'croissant' }, reply: 'Avec plaisir, un croissant en plus. → Con gusto, un croissant más.', explanation: 'Agregaste un croissant.' },
        ],
        minorForms: [{ input: "C'est tous, merci.", better: "C'est tout, merci.", issue: 'spelling', explanation: 'Se entiende. Aquí es tout (todo), no tous.', intent: 'done' }],
        clarifications: [{ inputs: ['Ceci ?', 'Avec ceci ?'], reply: 'Je veux dire : autre chose ? → Quiero decir: ¿algo más?', explanation: 'Avec ceci ? es una forma de preguntar si querés algo más. Respondé: C’est tout, merci.' }],
        next: 'pain-close', reply: "D'accord. → De acuerdo." },
      { id: 'pain-close', prompt: 'Ça fait deux euros cinquante.', promptTranslation: 'Son dos euros con cincuenta.',
        teaching: 'Voilà = aquí tiene. Merci, bonne journée = gracias, que tenga buen día.',
        instruction: 'Pagá y despedite.', explanation: 'Pagaste y te despediste con cortesía.', correction: 'Voilà, merci ! Bonne journée !',
        accepted: ['Voilà, merci !', 'Merci, bonne journée !', 'Voilà, merci ! Bonne journée !', 'Merci !'],
        minorForms: [{ input: 'Voila, merci !', better: 'Voilà, merci !', issue: 'spelling', explanation: 'Se entiende. Voilà lleva acento grave: à.' }],
        writtenRules: [{ input: 'De rien !', issue: 'vocabulary', explanation: 'De rien responde a un gracias. Aquí agradecés vos: Voilà, merci !' }],
        next: null, reply: 'Merci, à demain ! → ¡Gracias, hasta mañana!' },
    ],
  },
];

const en: Scenario[] = [
  {
    id: 'coffee-shop', title: 'Un café en Londres', partner: 'Josh',
    setup: 'Entrás a una cafetería pequeña en Londres. Josh, el barista, te sonríe desde la máquina de café.',
    turns: [
      { id: 'coffee-open', prompt: 'Hi there! How are you today?', promptTranslation: '¡Hola! ¿Cómo estás hoy?',
        teaching: "I'm good, thanks = estoy bien, gracias. And you? = ¿y vos?",
        instruction: 'Respondé cómo estás.', explanation: 'Respondiste el saludo con naturalidad.', correction: "I'm good, thanks. And you?",
        accepted: ["I'm good, thanks.", 'Good, thank you.', "I'm fine, thank you.", "I'm good, thanks. And you?", 'Fine, thanks. And you?'],
        intents: [{ id: 'ask-back', examples: ["I'm good, thanks. And you?", 'Fine, thanks. And you?'], facts: { polite: 'yes' }, reply: "I'm great, thanks for asking! → ¡Genial, gracias por preguntar!", explanation: 'Preguntaste de vuelta: muy natural en inglés.' }],
        minorForms: [{ input: 'Im good, thanks.', better: "I'm good, thanks.", issue: 'spelling', explanation: "Se entiende. I'm lleva apóstrofo." }],
        offContext: [{ inputs: ['Goodbye!'], explanation: 'Recién llegás: respondé el saludo.' }],
        writtenRules: [{ input: 'I have fine.', issue: 'structure', explanation: 'En inglés se está bien con be, no con have: I am fine / I’m good.' }, { input: "I'm good, thanks you.", issue: 'structure', explanation: 'Se dice thanks o thank you, no thanks you.' }],
        next: 'coffee-order', reply: 'Glad to hear it! → ¡Me alegro!' },
      { id: 'coffee-order', prompt: 'What can I get you?', promptTranslation: '¿Qué te sirvo?',
        teaching: "A coffee, please. Can I have a tea, please? I'd like = quisiera.",
        instruction: 'Pedí una bebida.', explanation: 'Pediste con cortesía.', correction: 'Can I have a coffee, please?',
        accepted: ['A coffee, please.', 'Can I have a coffee, please?', "I'd like a coffee, please.", 'A tea, please.', 'Can I have a tea, please?', "I'd like a tea, please."],
        intents: [
          { id: 'coffee', examples: ['A coffee, please.', 'Can I have a coffee, please?', "I'd like a coffee, please."], facts: { drink: 'coffee' }, explanation: 'Pediste un café.' },
          { id: 'tea', examples: ['A tea, please.', 'Can I have a tea, please?', "I'd like a tea, please."], facts: { drink: 'tea' }, reply: 'A tea! Very British. → ¡Un té! Muy británico.', explanation: 'Pediste un té.' },
        ],
        minorForms: [
          { input: 'A coffe, please.', better: 'A coffee, please.', issue: 'spelling', explanation: 'Se entiende. Coffee lleva doble e.', intent: 'coffee' },
          { input: 'Give me a coffee.', better: 'Can I have a coffee, please?', issue: 'vocabulary', explanation: 'Es correcta, pero en inglés suena brusca. Con Can I have…, please? suena amable.', intent: 'coffee' },
        ],
        clarifications: [{ inputs: ['Yes.', 'Yes, please.'], reply: 'Sure! But what would you like? → ¡Claro! ¿Pero qué te gustaría?', explanation: 'Josh preguntó qué querés: un «sí» no le dice qué preparar. Nombrá la bebida.' }],
        writtenRules: [{ input: 'I am a coffee.', issue: 'vocabulary', explanation: 'I am a coffee significa «soy un café». Para pedir: A coffee, please.' }],
        next: 'coffee-place', reply: 'Coming right up. → Enseguida.' },
      { id: 'coffee-place', prompt: 'For here or to go?', promptTranslation: '¿Para tomar aquí o para llevar?',
        contextualPrompts: [
          { when: [{ fact: 'drink', value: 'tea' }], prompt: 'Your tea: for here or to go?', promptTranslation: 'Tu té: ¿para tomar aquí o para llevar?' },
          { when: [{ fact: 'drink', value: 'coffee' }], prompt: 'Your coffee: for here or to go?', promptTranslation: 'Tu café: ¿para tomar aquí o para llevar?' },
          { when: [{ fact: 'drink', value: 'chocolate' }], prompt: 'Your hot chocolate: for here or to go?', promptTranslation: 'Tu chocolate caliente: ¿para tomar aquí o para llevar?' },
          { when: [{ fact: 'drink', value: 'water' }], prompt: 'Your water: for here or to go?', promptTranslation: 'Tu agua: ¿para tomar aquí o para llevar?' },
          { when: [{ fact: 'drink', value: 'juice' }], prompt: 'Your orange juice: for here or to go?', promptTranslation: 'Tu jugo: ¿para tomar aquí o para llevar?' },
        ],
        teaching: 'For here, please = para tomar aquí. To go, please = para llevar (en Reino Unido también: takeaway).',
        instruction: 'Elegí dónde tomarlo.', explanation: 'Elegiste dónde tomar tu bebida.', correction: 'For here, please. / To go, please.',
        accepted: ['For here, please.', 'To go, please.', 'Takeaway, please.'],
        intents: [
          { id: 'here', examples: ['For here, please.'], facts: { place: 'here' }, explanation: 'Elegiste quedarte.' },
          { id: 'to-go', examples: ['To go, please.', 'Takeaway, please.'], facts: { place: 'to-go' }, explanation: 'Elegiste para llevar.' },
        ],
        minorForms: [{ input: 'Take away, please.', better: 'Takeaway, please.', issue: 'spelling', explanation: 'Se entiende. Takeaway se escribe junto.', intent: 'to-go' }],
        clarifications: [{ inputs: ['Yes.', 'Yes, please.'], reply: 'Ha, yes… but which one? → Ja, sí… ¿pero cuál de las dos?', explanation: 'La pregunta tiene dos opciones; un «sí» no elige ninguna.' }],
        writtenRules: [{ input: 'For go, please.', issue: 'structure', explanation: '«Para llevar» no se traduce palabra por palabra: se dice To go, please.' }],
        next: 'coffee-close', reply: 'Sure thing. → Claro.' },
      { id: 'coffee-close', prompt: 'Here you go. Enjoy!', promptTranslation: 'Aquí tenés. ¡Que lo disfrutes!',
        contextualPrompts: [{ when: [{ fact: 'place', value: 'to-go' }], prompt: 'Here you go, to go. Have a nice day!', promptTranslation: 'Aquí tenés, para llevar. ¡Que tengas un buen día!' }],
        teaching: 'Thank you! / Thanks, you too! = gracias, igualmente.',
        instruction: 'Agradecé.', explanation: 'Agradeciste con naturalidad.', correction: 'Thank you!',
        accepted: ['Thank you!', 'Thanks!', 'Thanks, you too!', 'Thank you very much!'],
        minorForms: [{ input: 'Tank you!', better: 'Thank you!', issue: 'spelling', explanation: 'Se entiende. Thank va con th; tank es un tanque.' }],
        writtenRules: [{ input: "You're welcome!", issue: 'vocabulary', explanation: "You're welcome significa «de nada»: responde a un gracias. Aquí agradecés: Thank you!" }],
        next: null, reply: 'Bye! → ¡Chao!' },
    ],
  },
  {
    id: 'hotel-checkin', title: 'Llegada al hotel', partner: 'Priya',
    setup: 'Son las ocho de la noche. Llegás con tu maleta a la recepción del Kingsley Hotel. Priya te atiende.',
    turns: [
      { id: 'hotel-open', prompt: 'Good evening! Welcome to the Kingsley Hotel.', promptTranslation: '¡Buenas noches! Bienvenido al Kingsley Hotel.',
        teaching: 'Good evening = buenas noches al llegar. Good night = buenas noches al despedirse o ir a dormir.',
        instruction: 'Saludá al llegar.', explanation: 'Saludaste al llegar por la noche.', correction: 'Good evening!',
        accepted: ['Good evening!', 'Good evening, thank you.', 'Hi, thank you.', 'Hello!'],
        minorForms: [{ input: 'Good evenning!', better: 'Good evening!', issue: 'spelling', explanation: 'Se entiende. Evening lleva una sola n en el medio.' }],
        offContext: [{ inputs: ['Goodbye!'], explanation: 'Acabás de llegar: saludá.' }],
        writtenRules: [{ input: 'Good night!', issue: 'vocabulary', explanation: 'Good night se dice al despedirse o ir a dormir. Al llegar de noche: Good evening!' }, { input: 'Good morning!', issue: 'vocabulary', explanation: 'Son las ocho de la noche: good morning es para la mañana. Al llegar de noche: Good evening!' }],
        next: 'hotel-booking', reply: 'Good evening! → ¡Buenas noches!' },
      { id: 'hotel-booking', prompt: 'Do you have a reservation?', promptTranslation: '¿Tiene una reserva?',
        teaching: "Yes, I have a reservation. Yes, I do. No, I don't = no.",
        instruction: 'Respondé si tenés reserva.', explanation: 'Respondiste sobre tu reserva.', correction: 'Yes, I have a reservation.',
        accepted: ['Yes, I have a reservation.', 'Yes, I do.', "No, I don't.", 'No, I don’t have a reservation.'],
        intents: [
          { id: 'booked', examples: ['Yes, I have a reservation.', 'Yes, I do.'], facts: { booking: 'yes' }, reply: 'Perfect, I have it here. → Perfecto, aquí la tengo.', explanation: 'Confirmaste tu reserva.' },
          { id: 'not-booked', examples: ["No, I don't.", 'No, I don’t have a reservation.'], facts: { booking: 'no' }, reply: 'No problem, we have rooms. → No hay problema, tenemos habitaciones.', explanation: 'Dijiste que no tenés reserva.' },
        ],
        minorForms: [{ input: 'Yes, I have reservation.', better: 'Yes, I have a reservation.', issue: 'structure', explanation: 'Se entiende. Falta el artículo: a reservation.', intent: 'booked' }],
        writtenRules: [{ input: 'Yes, I have a reserve.', issue: 'vocabulary', explanation: 'Reserve no es «reserva» de hotel: se dice reservation (o booking).' }],
        next: 'hotel-nights', reply: 'Great. → Genial.' },
      { id: 'hotel-nights', prompt: 'How many nights?', promptTranslation: '¿Cuántas noches?',
        contextualPrompts: [{ when: [{ fact: 'booking', value: 'no' }], prompt: 'No problem. How many nights would you like?', promptTranslation: 'No hay problema. ¿Cuántas noches querés?' }],
        teaching: 'One night = una noche. Two nights = dos noches (plural con s).',
        instruction: 'Decí cuántas noches.', explanation: 'Dijiste cuántas noches te quedás.', correction: 'Two nights, please.',
        accepted: ['Two nights, please.', 'Just one night.', 'One night, please.', 'Three nights, please.'],
        intents: [
          { id: 'one', examples: ['Just one night.', 'One night, please.'], facts: { nights: 'one' }, explanation: 'Te quedás una noche.' },
          { id: 'two', examples: ['Two nights, please.'], facts: { nights: 'two' }, explanation: 'Te quedás dos noches.' },
          { id: 'three', examples: ['Three nights, please.'], facts: { nights: 'three' }, explanation: 'Te quedás tres noches.' },
        ],
        minorForms: [{ input: 'Two night, please.', better: 'Two nights, please.', issue: 'structure', explanation: 'Se entiende. Con dos o más va el plural: nights.', intent: 'two' }],
        clarifications: [{ inputs: ['Two.', 'Two, please.'], reply: 'Two nights? Or two people? → ¿Dos noches? ¿O dos personas?', explanation: 'Un número solo puede ser noches o personas. Decí: Two nights, please.' }],
        offContext: [{ inputs: ['Two persons.', 'Two people.'], explanation: 'Priya pregunta por noches, no por personas.' }],
        next: 'hotel-close', reply: 'All set. → Todo listo.' },
      { id: 'hotel-close', prompt: "Here's your key. Room 305.", promptTranslation: 'Aquí está su llave. Habitación 305.',
        teaching: 'Thank you very much! Good night! = gracias, buenas noches (ahora sí, al irte a dormir).',
        instruction: 'Agradecé y despedite.', explanation: 'Te despediste con cortesía.', correction: 'Thank you! Good night!',
        accepted: ['Thank you very much!', 'Thank you! Good night!', 'Thanks! Good night!', 'Thank you!', 'Thanks!'],
        minorForms: [{ input: 'Tanks!', better: 'Thanks!', issue: 'spelling', explanation: 'Se entiende. Thanks lleva th; tanks son tanques.' }],
        writtenRules: [{ input: "You're welcome!", issue: 'vocabulary', explanation: "You're welcome responde a un gracias. Aquí agradecés vos: Thank you!" }],
        next: null, reply: 'Enjoy your stay! → ¡Que disfrute su estancia!' },
    ],
  },
  {
    id: 'street-directions', title: 'Perdido en la calle', partner: 'Tom',
    setup: 'Mirás el mapa del teléfono sin entender nada. Tom, un señor con un perro, se acerca.',
    turns: [
      { id: 'street-open', prompt: 'Hi! You look a bit lost. Can I help?', promptTranslation: '¡Hola! Parecés un poco perdido. ¿Puedo ayudarte?',
        teaching: "Yes, please = sí, por favor. I'm lost = estoy perdido.",
        instruction: 'Aceptá la ayuda.', explanation: 'Aceptaste la ayuda.', correction: "Yes, please. I'm lost.",
        accepted: ['Yes, please.', "Yes, please. I'm lost.", 'Hi! Yes, please.', "Yes, I'm lost."],
        intents: [{ id: 'lost', examples: ["Yes, please. I'm lost.", "Yes, I'm lost."], facts: { state: 'lost' }, reply: "Don't worry, it happens to everyone. → Tranquilo, nos pasa a todos.", explanation: 'Dijiste que estás perdido: Tom te tranquiliza.' }],
        minorForms: [{ input: 'Yes, please. I lost.', better: "Yes, please. I'm lost.", issue: 'structure', explanation: 'Se entiende. Estar perdido es be lost: I’m lost.', intent: 'lost' }],
        offContext: [{ inputs: ['Goodbye!'], explanation: 'Estás perdido: aceptá la ayuda.' }],
        writtenRules: [{ input: "Yes, I'm lose.", issue: 'vocabulary', explanation: 'Lose es perder (algo). Estar perdido es be lost: I’m lost.' }],
        next: 'street-ask', reply: 'Sure! → ¡Claro!' },
      { id: 'street-ask', prompt: 'Where do you want to go?', promptTranslation: '¿Adónde querés ir?',
        teaching: "I'm looking for the station = busco la estación. How do I get to the museum? = ¿Cómo llego al museo?",
        instruction: 'Decí adónde querés ir.', explanation: 'Dijiste adónde vas.', correction: "I'm looking for the station.",
        accepted: ["I'm looking for the station.", 'Where is the station?', 'How do I get to the station?', "I'm looking for the museum.", 'Where is the museum?', 'How do I get to the museum?'],
        intents: [
          { id: 'station', examples: ["I'm looking for the station.", 'Where is the station?', 'How do I get to the station?'], facts: { place: 'station' }, explanation: 'Dijiste que buscás la estación.' },
          { id: 'museum', examples: ["I'm looking for the museum.", 'Where is the museum?', 'How do I get to the museum?'], facts: { place: 'museum' }, explanation: 'Dijiste que buscás el museo.' },
        ],
        minorForms: [
          { input: 'Where is the estation?', better: 'Where is the station?', issue: 'spelling', explanation: 'Se entiende. Station empieza con s, sin e delante.', intent: 'station' },
          { input: 'I search the station.', better: "I'm looking for the station.", issue: 'vocabulary', explanation: 'Se entiende. Para «busco» se dice I’m looking for.', intent: 'station' },
          { input: 'Where is station?', better: 'Where is the station?', issue: 'structure', explanation: 'Se entiende. Falta el artículo: the station.', intent: 'station' },
        ],
        clarifications: [{ inputs: ['Station.', 'The station.'], reply: 'The station? The train station? → ¿La estación? ¿La de tren?', explanation: 'Tom entiende el lugar, pero confirma. Decí la frase completa.' }],
        writtenRules: [{ input: 'What is the station?', issue: 'vocabulary', explanation: 'What is…? pregunta qué es algo. Para saber dónde está: Where is the station?' }],
        next: 'street-detail', reply: 'Oh, easy. → Ah, fácil.' },
      { id: 'street-detail', prompt: "It's not far. OK?", promptTranslation: 'No está lejos. ¿Vale?',
        contextualPrompts: [
          { when: [{ fact: 'place', value: 'station' }], prompt: 'Go straight and turn left at the bank. OK?', promptTranslation: 'Seguí recto y doblá a la izquierda en el banco. ¿Vale?' },
          { when: [{ fact: 'place', value: 'museum' }], prompt: 'Go straight and turn right at the park. OK?', promptTranslation: 'Seguí recto y doblá a la derecha en el parque. ¿Vale?' },
        ],
        teaching: 'OK, thank you = vale, gracias. Is it far? = ¿está lejos? Sorry, can you repeat that? = perdón, ¿podés repetir?',
        instruction: 'Confirmá o preguntá si está lejos.', explanation: 'Confirmaste la indicación.', correction: 'OK, thank you.',
        accepted: ['OK, thank you.', 'Got it, thanks.', 'OK, thanks.', 'Is it far?'],
        intents: [{ id: 'far', examples: ['Is it far?'], facts: { asked: 'far' }, reply: "No, about five minutes. → No, unos cinco minutos.", explanation: 'Preguntaste si está lejos: muy útil.' }],
        clarifications: [{ inputs: ['Sorry, can you repeat that?', 'Sorry?', 'Can you repeat, please?'], reply: 'Sure, slowly this time… → Claro, más despacio esta vez…', explanation: 'Pedir que repitan está perfecto. Después confirmá con OK, thank you.' }],
        minorForms: [{ input: 'Ok, tank you.', better: 'OK, thank you.', issue: 'spelling', explanation: 'Se entiende. Thank va con th.' }],
        next: 'street-close', reply: 'Great. → Genial.' },
      { id: 'street-close', prompt: 'Have a good day!', promptTranslation: '¡Que tengas un buen día!',
        teaching: 'Thanks, you too! = gracias, igualmente. Bye! = ¡chao!',
        instruction: 'Agradecé y despedite.', explanation: 'Te despediste con naturalidad.', correction: 'Thanks, you too!',
        accepted: ['Thanks, you too!', 'Thank you, bye!', 'Thanks! Bye!', 'Thank you so much!'],
        minorForms: [{ input: 'Thanks, you to!', better: 'Thanks, you too!', issue: 'spelling', explanation: 'Se entiende. «También» es too, con doble o.' }],
        writtenRules: [{ input: 'Good night!', issue: 'vocabulary', explanation: 'Es de día: Good night es para la noche. Aquí: Thanks, you too!' }],
        next: null, reply: 'Bye! → ¡Chao!' },
    ],
  },
];


const PLACE_VERBS_FR = ['je cherche', 'ou est', 'ou se trouve', 'je ne trouve pas', 'je voudrais aller', 'je veux aller', 'je vais', 'aller au', 'aller a la', 'trouver', 's il vous plait'];
const PLACE_VERBS_EN = ['looking for', 'where is', 'where s', 'how do i get', 'i want to go', 'i need to go', 'i need to get', 'i need', 'i m going', 'i am going', 'take me', 'way to', 'find', 'get to', 'go to'];
const GOOD_EN = ['good', 'fine', 'great', 'well', 'not bad', 'ok', 'okay', 'alright', 'all right', 'excellent', 'wonderful', 'amazing', 'fantastic', 'pretty good', 'very good', 'doing well'];
const BAD_EN = ['not great', 'not good', 'not so good', 'not very good', 'not well', 'tired', 'so so', 'could be better', 'terrible', 'awful', 'pretty bad'];
const ITEMS_FR: Drink[] = [
  { fact: 'baguette', words: ['baguette', 'baguettes', 'une tradition'], polite: 'Une baguette, merci.', plain: 'Une baguette.', better: "Une baguette, s'il vous plaît.", intent: 'baguette' },
  { fact: 'croissant', words: ['croissant', 'croissants'], polite: 'Un croissant, merci.', plain: 'Un croissant.', better: "Un croissant, s'il vous plaît.", intent: 'croissant' },
  { fact: 'pain-au-chocolat', words: ['pain au chocolat', 'pains au chocolat', 'chocolatine'], polite: "Un pain au chocolat, s'il vous plaît.", plain: 'Un pain au chocolat.', better: "Une baguette, s'il vous plaît.", reply: 'Un pain au chocolat, tout chaud. → Un pain au chocolat, recién hecho.' },
];
const thanksFr = (canonical: string) => [
  rule('thanks', 'target', canonical, [['merci', 'voila', 'bonne journee', 'tenez']], 'Agradeciste con tus propias palabras: así se cierra con naturalidad.', { none: ['de rien'] }),
  rule('bye-only', 'different', 'Au revoir !', [['au revoir', 'salut', 'ciao', 'a bientot', 'bonne soiree']], 'Se entendió: te despediste y la escena termina. Cuando te atienden, agradecé también.', { none: ['merci', 'voila', 'de rien', 'bonne journee', 'tenez'], better: 'Merci, bonne journée !' }),
];
type Natural = Pick<TextExercise, 'understanding' | 'errorPatterns' | 'lexicon'>;
/** RML-002 natural replies per turn (reviewed); merged into the scenarios by `variant`. */
const natural: Record<string, Natural> = {
  'cafe-open': {
    understanding: [
      ...(([['une', ['une personne', '1 personne', 'pour une', 'pour moi', 'juste moi', 'seul', 'seule', 'un couvert'], 'Une table pour une personne, merci.', 'one-person'], ['deux', ['deux personnes', '2 personnes', 'pour deux', 'pour 2', 'nous sommes deux', 'on est deux', 'deux couverts'], "Une table pour deux, s'il vous plaît.", 'two-people'], ['trois', ['trois personnes', '3 personnes', 'pour trois', 'pour 3', 'nous sommes trois', 'on est trois'], "Une table pour trois, s'il vous plaît.", undefined], ['quatre', ['quatre personnes', '4 personnes', 'pour quatre', 'pour 4', 'nous sommes quatre', 'on est quatre'], "Une table pour quatre, s'il vous plaît.", undefined]] as const)
        .map(([count, words, canonical, intent]) => rule(`guests-${count}`, 'target', canonical, [[...words]], 'Aceptaste la mesa y dijiste para cuántos: Lucien lo recuerda.', { none: ['non', 'pas'], ...(intent ? { intent } : { facts: { guests: count }, reply: `Pour ${count}, très bien. Par ici ! → Para ${count === 'trois' ? 'tres' : 'cuatro'}, muy bien. ¡Por aquí!` }) }))),
      rule('accept-polite', 'target', 'Oui, merci beaucoup.', [[...YES_FR, 's il vous plait', 'table'], POLITE_FR], 'Aceptaste la mesa con cortesía, con tus propias palabras.', { none: [...NO_FR, 'personne', 'personnes', 'pour moi', 'pour deux', 'pour trois', 'pour quatre', 'seul', 'seule'] }),
      rule('accept-plain', 'different', 'Oui.', [YES_FR], "Se entendió: aceptaste la mesa y la escena sigue. Con s'il vous plaît suena más cortés.", { none: [...NO_FR, 'personne', 'personnes', 'pour moi', 'pour deux', 'pour trois', 'pour quatre', 'seul', 'seule'], better: "Oui, s'il vous plaît." }),
      rule('decline', 'different', 'Non, merci.', [['non', 'pas besoin', 'pas de table']], "Se entendió: no querés mesa, así que Lucien te ubica en la barra. Para aceptar una mesa se dice Oui, s'il vous plaît.", { none: YES_FR, facts: { seat: 'comptoir' }, reply: 'Pas de problème : au comptoir, alors. → No hay problema: en la barra, entonces.', better: "Oui, s'il vous plaît." }),
    ],
    errorPatterns: [error('Bonjour, je suis une table.', [['je suis'], ['table']])],
  },
  'cafe-order': {
    understanding: orderRules(DRINKS_FR, 'drink', POLITE_FR, ['non', 'pas', 'jamais'], 'fr'),
    errorPatterns: [error('Je voudrais un canard.', [['canard', 'canards']]), error('Je suis un café.', [['je suis'], DRINK_WORDS_FR])],
    lexicon: ['sucre', 'lait', 'sans', 'noir', 'grand', 'petit', 'prends', 'prendre', 'vais', 'veux'],
  },
  'cafe-detail': {
    understanding: [
      rule('yes-polite', 'target', 'Oui, merci beaucoup.', [[...YES_FR, 'avec'], POLITE_FR], 'Aceptaste con cortesía, con tus propias palabras.', { intent: 'yes', none: [...NO_FR, 'ca va', 'ca ira'] }),
      rule('yes-plain', 'different', 'Oui, un peu.', [[...YES_FR, 'avec', 'un peu']], "Se entendió: querés. Con s'il vous plaît suena más cortés.", { intent: 'yes', none: [...NO_FR, 'ca va', 'ca ira'], better: "Oui, s'il vous plaît." }),
      rule('no-polite', 'target', 'Non, merci, ça va.', [['non', 'sans', 'pas de', 'pas pour moi', 'ca va', 'ca ira'], ['merci', 'ca va', 'ca ira']], 'Rechazaste con cortesía, con tus propias palabras.', { intent: 'no', none: ['oui', 'ouais', 'volontiers', 'avec plaisir', 'bien sur', 's il vous plait'] }),
      rule('no-plain', 'different', 'Non.', [['non', 'sans', 'pas de', 'pas pour moi']], 'Se entendió: no querés. Con merci suena cortés: Non, merci.', { intent: 'no', none: ['oui', 'ouais', 'volontiers', 'avec plaisir', 'bien sur', 's il vous plait', 'merci'], better: 'Non, merci.' }),
    ],
    errorPatterns: [error("Non, s'il vous plaît.", [['non'], ['s il vous plait']], ['merci', 'oui'])],
    lexicon: ['sucre', 'lait', 'citron', 'glacons', 'chantilly', 'creme'],
  },
  'cafe-close': { understanding: thanksFr('Voilà, merci beaucoup !'), errorPatterns: [error('De rien !', [['de rien']])], lexicon: ['euros', 'trois', 'tenez', 'bonne', 'journee'] },
  'metro-open': {
    understanding: [
      rule('metro-now', 'target', "Oui, je cherche le métro, s'il vous plaît.", [['metro'], PLACE_VERBS_FR], 'Aceptaste la ayuda y ya dijiste qué buscás.', { intent: 'metro-now', none: ['gare', 'perdu le metro', 'je suis le metro'] }),
      rule('gare-now', 'target', "Oui, je cherche la gare, s'il vous plaît.", [['gare'], PLACE_VERBS_FR], 'Aceptaste la ayuda y ya dijiste qué buscás.', { intent: 'gare-now', none: ['metro'] }),
      rule('lost', 'target', 'Oui, je suis complètement perdu.', [['perdu', 'perdue', 'perdus']], 'Explicaste que estás perdido, con tus propias palabras.', { intent: 'lost', none: ['pas', 'metro', 'gare'] }),
      rule('accept-polite', 'target', 'Oui, merci beaucoup.', [[...YES_FR, 's il vous plait'], POLITE_FR], 'Aceptaste la ayuda con cortesía.', { none: [...NO_FR, 'perdu', 'perdue', 'metro', 'gare'] }),
      rule('accept-plain', 'different', 'Oui.', [YES_FR], "Se entendió: aceptás la ayuda. Con s'il vous plaît suena más cortés.", { none: [...NO_FR, 'perdu', 'perdue', 'metro', 'gare'], better: "Oui, s'il vous plaît." }),
      rule('decline', 'different', 'Non, merci.', [['non', 'non merci', 'ca va', 'pas besoin']], "Se entendió: rechazaste la ayuda, pero Amélie insiste con amabilidad. Para aceptarla: Oui, s'il vous plaît.", { none: [...YES_FR, 'perdu', 'perdue'], reply: "Vous êtes sûr ? Vous avez l'air un peu perdu… → ¿Seguro? Parece un poco perdido…", better: "Oui, s'il vous plaît." }),
    ],
    errorPatterns: [error('Oui, je suis perdu le métro.', [['perdu le metro', 'perdue le metro']])],
    lexicon: ['me', 'suis', 'completement'],
  },
  'metro-ask': {
    understanding: [
      rule('metro', 'target', "Où se trouve le métro, s'il vous plaît ?", [['metro', 'station de metro'], PLACE_VERBS_FR], 'Dijiste que buscás el metro, con tus propias palabras.', { intent: 'metro', none: ['gare', 'je suis le metro'] }),
      rule('gare', 'target', 'Je voudrais aller à la gare.', [['gare', 'station de train'], PLACE_VERBS_FR], 'Dijiste que buscás la estación de tren, con tus propias palabras.', { intent: 'station', none: ['metro'] }),
      rule('metro-word', 'clarify', 'Euh… le métro ?', [['metro']], 'Amélie entendió «métro», pero quiere confirmar. Decilo en una frase: Je cherche le métro.', { none: ['gare'], reply: 'Le métro ? Vous cherchez la station ? → ¿El metro? ¿Busca la estación?' }),
      rule('gare-word', 'clarify', 'Euh… la gare ?', [['gare', 'train']], 'Amélie entendió «gare», pero quiere confirmar. Decilo en una frase: Je cherche la gare.', { none: ['metro'], reply: 'La gare ? Pour prendre le train ? → ¿La estación? ¿Para tomar el tren?' }),
    ],
    errorPatterns: [error('Je suis le métro.', [['je suis le metro']])],
    lexicon: ['station', 'cherche', 'trouve', 'ne', 'au', 'a'],
  },
  'metro-detail': {
    understanding: [
      rule('far', 'target', "C'est loin d'ici ?", [['loin', 'combien de temps', 'a pied', 'combien de minutes']], 'Preguntaste si está lejos, con tus propias palabras.', { intent: 'far' }),
      rule('repeat', 'clarify', 'Pardon, vous pouvez répéter ?', [['pardon', 'repeter', 'repetez', 'pas compris', 'plus lentement', 'encore une fois', 'comment']], 'Pedir que repitan está perfecto. Amélie lo repite; después confirmá con D’accord, merci.', { reply: 'Je répète, plus lentement… → Repito, más despacio…' }),
      rule('ok', 'target', "D'accord, j'ai compris, merci !", [['d accord', 'ok', 'okay', 'compris', 'parfait', 'tres bien', 'merci', 'super', 'entendu', 'c est clair']], 'Confirmaste que entendiste, con tus propias palabras.', { none: ['pas compris', 'pardon', 'repeter', 'repetez', 'loin', 'bonne nuit', 'comment'] }),
    ],
    errorPatterns: [error("D'accord, bonne nuit.", [['bonne nuit']])],
    lexicon: ['droite', 'gauche', 'tout', 'droit', 'minutes', 'ici', 'ai', 'pouvez'],
  },
  'metro-close': {
    understanding: [
      rule('thanks', 'target', 'Merci, à vous aussi !', [['merci', 'vous aussi', 'a vous aussi', 'pareillement', 'vous de meme', 'bonne journee']], 'Agradeciste y devolviste el saludo, con tus propias palabras.', { none: ['bonne nuit'] }),
      rule('bye-only', 'different', 'Au revoir !', [['au revoir', 'salut', 'ciao', 'a bientot']], 'Se entendió la despedida. Agradecé también la ayuda: Merci, vous aussi !', { none: ['merci', 'vous aussi', 'bonne journee', 'bonne nuit'], better: 'Merci, vous aussi !' }),
    ],
    errorPatterns: [error('Bonne nuit !', [['bonne nuit']])],
  },
  'pain-open': {
    understanding: [
      rule('greet', 'target', 'Bonjour, comment allez-vous ?', [['bonjour']], 'Saludaste al entrar, con tus propias palabras.', { none: ['bonsoir', 'bonne nuit'] }),
      rule('informal', 'different', 'Salut !', [['salut', 'coucou', 'hello', 'hey']], 'Se entendió el saludo. Salut es para amigos; en una tienda se saluda con Bonjour, madame !', { none: ['bonjour', 'bonsoir', 'bonne nuit'], better: 'Bonjour, madame !' }),
    ],
    errorPatterns: [error('Bonsoir !', [['bonsoir']]), error('Bonne nuit !', [['bonne nuit']])],
  },
  'pain-order': {
    understanding: [
      ...orderRules(ITEMS_FR, 'item', POLITE_FR, ['non', 'pas', 'jamais'], 'fr'),
      rule('bread-word', 'clarify', 'Euh… un pain.', [['pain', 'du pain']], 'Mathilde vende muchos panes; nombrá cuál: Une baguette, s’il vous plaît.', { none: ['pain au chocolat', 'pains au chocolat', 'baguette', 'croissant'], reply: 'Du pain… une baguette ? → Pan… ¿una baguette?' }),
    ],
    errorPatterns: [error('Je suis une baguette.', [['je suis'], ['baguette', 'croissant', 'pain']])],
    lexicon: ['prends', 'prendre', 'vais', 'veux', 'deux'],
  },
  'pain-more': {
    understanding: [
      rule('done', 'target', 'Ce sera tout, merci.', [['c est tout', 'ca sera tout', 'ce sera tout', 'rien d autre', 'ca ira', 'c est bon', 'non merci']], 'Dijiste que no querés nada más, con tus propias palabras.', { intent: 'done', none: ['croissant', 'baguette', 'pain au chocolat', 'oui'] }),
      rule('done-plain', 'different', 'Non, rien.', [['non', 'rien']], "Se entendió: no querés nada más. Con c'est tout, merci suena natural y cortés.", { intent: 'done', none: ['croissant', 'baguette', 'pain au chocolat', 'oui', 'merci'], better: "C'est tout, merci." }),
      rule('more-croissant', 'target', "Et un croissant, s'il vous plaît.", [['croissant', 'croissants']], 'Agregaste un croissant, con tus propias palabras.', { intent: 'more', none: ['non', 'pas', 'rien', 'c est tout', 'baguette', 'pain au chocolat'] }),
      rule('more-pain-au-chocolat', 'target', "Et un pain au chocolat, s'il vous plaît.", [['pain au chocolat', 'chocolatine']], 'Agregaste un pain au chocolat.', { facts: { more: 'pain-au-chocolat' }, reply: 'Un pain au chocolat en plus. → Un pain au chocolat más.', none: ['non', 'pas', 'rien', 'c est tout', 'croissant', 'baguette'] }),
      rule('more-baguette', 'target', "Et une autre baguette, s'il vous plaît.", [['baguette', 'baguettes']], 'Agregaste otra baguette.', { facts: { more: 'baguette' }, reply: 'Une deuxième baguette, voilà. → Una segunda baguette, aquí tiene.', none: ['non', 'pas', 'rien', 'c est tout', 'croissant', 'pain au chocolat'] }),
    ],
    lexicon: ['autre', 'deuxieme', 'encore', 'aussi'],
  },
  'pain-close': { understanding: thanksFr('Tenez, merci beaucoup !'), errorPatterns: [error('De rien !', [['de rien']])], lexicon: ['euros', 'deux', 'cinquante', 'bonne', 'journee'] },
  'coffee-open': {
    understanding: [
      rule('good-polite', 'target', "I'm doing well, thank you.", [GOOD_EN, ['thanks', 'thank you', 'and you', 'how about you', 'what about you']], 'Respondiste cómo estás, con amabilidad y con tus propias palabras.', { none: [...BAD_EN, 'have fine', 'have good', 'thanks you'] }),
      rule('good-plain', 'different', 'Good.', [GOOD_EN], "Se entendió. Agregá thanks para sonar amable: I'm good, thanks.", { none: [...BAD_EN, 'have fine', 'have good', 'thanks you'], better: "I'm good, thanks." }),
      rule('not-great', 'target', 'Not great, to be honest.', [BAD_EN], 'Respondiste con sinceridad y se entendió perfecto: no todo tiene que ser «good».', { none: ['have fine'], facts: { mood: 'tired' }, reply: "Oh no! Then this one's on me. → ¡Uy! Entonces este corre por mi cuenta." }),
    ],
    errorPatterns: [error('I have fine.', [['have fine', 'have good', 'have well']]), error("I'm good, thanks you.", [['thanks you']])],
    lexicon: ['doing', 'today', 'how', 'about', 'what', 'be', 'honest', 'bit', 'pretty', 'are'],
  },
  'coffee-order': {
    understanding: orderRules(DRINKS_EN, 'drink', [...POLITE_EN, 'i ll have', 'i will have', 'i ll take'], ['don t', 'not'], 'en'),
    errorPatterns: [error('I am a coffee.', [['i am a', 'i m a', 'i am an', 'i m an'], DRINK_WORDS_EN])],
    lexicon: ['large', 'small', 'medium', 'with', 'milk', 'sugar', 'oat', 'one', 'cup', 'of', 'black', 'iced', 'ill', 'll', 'will', 'take', 'want', 'give'],
  },
  'coffee-place': {
    understanding: [
      rule('here', 'target', 'For here, thanks.', [['for here', 'here', 'stay', 'eat in', 'sit in', 'drink here', 'have it here']], 'Elegiste quedarte, con tus propias palabras.', { intent: 'here', none: ['to go', 'takeaway', 'take away', 'for go'] }),
      rule('to-go', 'target', 'To go, thanks.', [['to go', 'takeaway', 'take away', 'take it away', 'take it with me']], 'Elegiste para llevar, con tus propias palabras.', { intent: 'to-go', none: ['for here', 'for go', 'stay'] }),
    ],
    errorPatterns: [error('For go, please.', [['for go']])],
    lexicon: ['ll', 'with', 'in', 'eat', 'sit', 'drink', 'take', 'stay', 'go', 'here'],
  },
  'coffee-close': {
    understanding: [
      rule('thanks', 'target', 'Thanks a lot!', [['thank', 'thanks', 'cheers', 'you too', 'have a nice day', 'have a good day', 'much appreciated']], 'Agradeciste, con tus propias palabras.', { none: ['you re welcome', 'your welcome'] }),
      rule('bye-only', 'different', 'Bye!', [['bye', 'goodbye', 'see you', 'see ya']], 'Se entendió la despedida. Agradecé también: Thank you!', { none: ['thank', 'thanks', 'cheers', 'welcome', 'you too'], better: 'Thank you!' }),
    ],
    errorPatterns: [error("You're welcome!", [['you re welcome', 'your welcome']])],
    lexicon: ['nice', 'good', 'day', 'have', 'enjoy'],
  },
  'hotel-open': {
    understanding: [rule('greet', 'target', 'Hello, good evening!', [['good evening', 'evening', 'hello', 'hi', 'hey', 'thank you', 'thanks', 'thank']], 'Saludaste al llegar, con tus propias palabras.', { none: ['good night', 'goodnight', 'good morning', 'morning', 'goodbye', 'bye'] })],
    errorPatterns: [error('Good night!', [['good night', 'goodnight']]), error('Good morning!', [['good morning', 'morning']])],
  },
  'hotel-booking': {
    understanding: [
      rule('booked', 'target', 'Yes, I have a booking.', [['yes', 'yeah', 'yep', 'i do', 'i have a reservation', 'i have a booking', 'i booked', 'i ve got a reservation', 'i made a reservation']], 'Confirmaste tu reserva, con tus propias palabras.', { intent: 'booked', none: [...NO_EN, 'haven t', 'reserve'] }),
      rule('not-booked', 'target', "No, I don't have one.", [['no', 'not', 'don t', 'nope', 'haven t']], 'Dijiste que no tenés reserva, con tus propias palabras.', { intent: 'not-booked', none: ['yes', 'yeah', 'yep', 'reserve'] }),
    ],
    errorPatterns: [error('Yes, I have a reserve.', [['reserve']])],
    lexicon: ['under', 'name', 'my', 'reservation', 'booking', 'one', 'made', 'booked', 'online', 've', 'got', 'haven', 'do'],
  },
  'hotel-nights': {
    understanding: [
      ...(([['one', ['one night', '1 night', 'a night', 'just one', 'only one night', 'just tonight', 'only tonight'], 'One night, thanks.', 'one'], ['two', ['two nights', '2 nights', 'a couple of nights'], 'Two nights, thanks.', 'two'], ['three', ['three nights', '3 nights'], 'Three nights, thanks.', 'three'], ['four', ['four nights', '4 nights'], 'Four nights, thanks.', undefined], ['five', ['five nights', '5 nights'], 'Five nights, thanks.', undefined], ['seven', ['seven nights', '7 nights', 'a week', 'one week'], 'A week, thanks.', undefined]] as const)
        .map(([count, words, canonical, intent]) => rule(`nights-${count}`, 'target', canonical, [[...words]], 'Dijiste cuántas noches, con tus propias palabras: Priya lo anota.', { none: ['people', 'persons', 'person'], ...(intent ? { intent } : { facts: { nights: count } }) }))),
      rule('number-only', 'clarify', 'Three.', [['one', 'two', 'three', 'four', 'five', 'six', 'seven', '1', '2', '3', '4', '5', '6', '7']], 'Un número solo puede ser noches o personas. Decí, por ejemplo: Two nights, please.', { none: ['night', 'nights', 'week', 'people', 'persons', 'person'], reply: 'Sorry, nights or people? → Perdón, ¿noches o personas?' }),
    ],
    lexicon: ['couple', 'of', 'tonight', 'only', 'week', 'nights', 'night', 'six'],
  },
  'hotel-close': {
    understanding: [rule('thanks', 'target', 'Thanks a lot, good night!', [['thank', 'thanks', 'cheers', 'good night', 'goodnight', 'great', 'perfect', 'lovely']], 'Agradeciste y te despediste, con tus propias palabras.', { none: ['you re welcome', 'your welcome'] })],
    errorPatterns: [error("You're welcome!", [['you re welcome', 'your welcome']])],
    lexicon: ['key', 'room', 'night'],
  },
  'street-open': {
    understanding: [
      rule('lost', 'target', 'Yes, I am lost.', [['lost']], 'Dijiste que estás perdido, con tus propias palabras.', { intent: 'lost', none: ['lose', 'not lost', 'don t'] }),
      rule('accept', 'target', 'Yes, please, thank you.', [[...YES_EN, 'please']], 'Aceptaste la ayuda, con tus propias palabras.', { none: [...NO_EN, 'lost', 'lose'] }),
      rule('decline', 'different', "No, I'm fine.", [['no', 'no thanks', 'i m ok', 'i m fine', 'i am fine', 'i m okay', 'not really']], 'Se entendió: rechazaste la ayuda, pero Tom insiste con amabilidad. Para aceptarla: Yes, please.', { none: [...YES_EN, 'please', 'lost'], reply: 'Are you sure? Your map is upside down… → ¿Seguro? Tu mapa está al revés…', better: 'Yes, please.' }),
    ],
    errorPatterns: [error("Yes, I'm lose.", [['i m lose', 'i am lose', 'i lose']])],
    lexicon: ['bit', 'little', 'fine', 'really', 'help'],
  },
  'street-ask': {
    understanding: [
      rule('station', 'target', 'I need to get to the station.', [['station', 'train station', 'tube', 'underground'], PLACE_VERBS_EN], 'Dijiste que buscás la estación, con tus propias palabras.', { intent: 'station', none: ['museum', 'what is the station', 'what s the station'] }),
      rule('museum', 'target', 'I want to go to the museum.', [['museum', 'british museum'], PLACE_VERBS_EN], 'Dijiste que buscás el museo, con tus propias palabras.', { intent: 'museum', none: ['station', 'tube', 'underground'] }),
      rule('station-word', 'clarify', 'Um, the station?', [['station', 'tube', 'underground']], 'Tom entiende el lugar, pero confirma. Decilo en una frase: I’m looking for the station.', { none: ['museum'], reply: 'The station? The train station? → ¿La estación? ¿La de tren?' }),
      rule('museum-word', 'clarify', 'Um, the museum?', [['museum']], 'Tom entiende el lugar, pero confirma. Decilo en una frase: I’m looking for the museum.', { none: ['station', 'tube', 'underground'], reply: 'The museum? The British Museum? → ¿El museo? ¿El Museo Británico?' }),
    ],
    errorPatterns: [error('What is the station?', [['what is the station', 'what s the station']])],
    lexicon: ['want', 'need', 'go', 'going', 'looking', 'where', 'how', 'way', 'find', 'take', 'train', 'british', 'do'],
  },
  'street-detail': {
    understanding: [
      rule('far', 'target', 'How far is it?', [['far', 'how far', 'how long', 'walking distance']], 'Preguntaste si está lejos, con tus propias palabras.', { intent: 'far' }),
      rule('repeat', 'clarify', 'Sorry, could you say that again?', [['repeat', 'again', 'sorry', 'slowly', 'slower', 'didn t understand', 'don t understand', 'didn t get', 'pardon']], 'Pedir que repitan está perfecto. Después confirmá con OK, thank you.', { reply: 'Sure, slowly this time… → Claro, más despacio esta vez…' }),
      rule('ok', 'target', 'Got it, thank you!', [['ok', 'okay', 'got it', 'i understand', 'understood', 'thanks', 'thank you', 'perfect', 'great', 'alright', 'all right', 'cool', 'i see']], 'Confirmaste la indicación, con tus propias palabras.', { none: ['far', 'how long', 'repeat', 'again', 'sorry', 'slowly', 'didn t', 'don t', 'pardon'] }),
    ],
    lexicon: ['left', 'right', 'straight', 'bank', 'park', 'say', 'that', 'walking', 'distance', 'see'],
  },
  'street-close': {
    understanding: [
      rule('thanks', 'target', 'Thank you, you too!', [['thanks', 'thank', 'you too', 'cheers', 'same to you', 'have a good day', 'have a nice day']], 'Agradeciste y devolviste el saludo, con tus propias palabras.', { none: ['good night', 'goodnight'] }),
      rule('bye-only', 'different', 'Goodbye!', [['bye', 'goodbye', 'see you', 'see ya']], 'Se entendió la despedida. Agradecé también la ayuda: Thanks, you too!', { none: ['thank', 'thanks', 'cheers', 'you too', 'good night', 'goodnight'], better: 'Thanks, you too!' }),
    ],
    errorPatterns: [error('Good night!', [['good night', 'goodnight']])],
    lexicon: ['nice', 'good', 'day', 'same'],
  },
};

export const liveLessonFr: Lesson = validateLesson({ schemaVersion: 1, version: 2, id: 'live-fr', title: 'Roast Me Live · francés', language: 'fr', level: 'A1', objectives: liveObjectives, variants: fr.map(item => variant('fr', item)) });
export const liveLessonEn: Lesson = validateLesson({ schemaVersion: 1, version: 2, id: 'live-en', title: 'Roast Me Live · inglés', language: 'en', level: 'A1', objectives: liveObjectives, variants: en.map(item => variant('en', item)) });
export const liveLessonFor = (language: 'fr' | 'en') => language === 'en' ? liveLessonEn : liveLessonFr;
/** Coach-facing Spanish set-up line for each scenario (spoken before the partner's first line). */
export const liveSetup = (lesson: Lesson, variantId: string) => {
  const exercise = lesson.variants.find(item => item.id === variantId)?.exercises[0];
  return exercise?.scene ?? '';
};
