import type { ChoiceExercise, ChoiceOption, Exercise, Lesson, LessonVariant, TextExercise } from '../domain/learning/models';

const option = (id: string, label: string, correct: boolean, next: string | null, explanation: string, reply = ''): ChoiceOption => ({ id, label, correct, next, explanation, reply });
const choice = (base: Omit<ChoiceExercise, 'kind'>): ChoiceExercise => ({ ...base, kind: 'choice' });
const written = (base: Omit<TextExercise, 'kind'>): TextExercise => ({ ...base, kind: 'text' });

function variant(id: string, speaker: string, second: boolean): LessonVariant {
  const exercises: Exercise[] = [
    choice({
      id: 'bonjour', objectiveId: 'saluer', title: 'Entrás al café', speaker,
      scene: second ? 'Es mediodía. Cerca de una ventana, Samir acomoda una taza. Te acercás al mostrador.' : 'Una mañana en París. Lucie termina de ordenar el mostrador y te recibe con una sonrisa.',
      prompt: second ? 'Bonjour !' : 'Bonjour, bienvenue !', promptTranslation: second ? '¡Hola! (saludo de día)' : '¡Hola, bienvenido/a!',
      teaching: 'Bonjour = hola / buenos días. Bonjour, madame = buenos días, señora; bonjour, monsieur = buenos días, señor. Merci = gracias. Au revoir = adiós. Para saludar de día en una tienda, usá bonjour.',
      instruction: 'Saludá de día al entrar.', explanation: 'Bonjour es un saludo cortés de día, apropiado al entrar en un café.', correction: 'Bonjour !',
      choices: [option('bonjour-simple', 'Bonjour !', true, 'commande', 'Saludaste con cortesía.'), option('merci-saludo', 'Merci !', false, null, 'Merci agradece algo; todavía estás saludando.'), option('adios-saludo', 'Au revoir !', false, null, 'Au revoir sirve para despedirse, no para entrar.')],
    }),
    choice({
      id: 'commande', objectiveId: 'commander', title: 'Tu primera decisión', speaker,
      scene: 'Mirás el pequeño menú. Podés elegir café o té; ambas decisiones continúan la historia.',
      prompt: second ? 'Un café ou un thé ?' : 'Vous désirez ?', promptTranslation: second ? '¿Un café o un té?' : '¿Qué desea?',
      teaching: "Un café = un café. Un thé = un té. Je voudrais = quisiera. S’il vous plaît = por favor (trato de usted). Podés decir: Je voudrais un café, s’il vous plaît, o Je voudrais un thé, s’il vous plaît. Merci significa gracias, pero por sí solo no hace un pedido.",
      instruction: 'Elegí qué querés pedir. Las dos bebidas son válidas.', explanation: 'Je voudrais permite pedir algo con cortesía.', correction: 'Je voudrais un café, s’il vous plaît.',
      choices: [option('cafe', 'Je voudrais un café, s’il vous plaît.', true, 'lieu-cafe', 'Pediste un café de manera cortés.', 'Un café, très bien. → Un café, muy bien.'), option('the', 'Je voudrais un thé, s’il vous plaît.', true, 'lieu-the', 'Pediste un té de manera cortés.', 'Un thé, très bien. → Un té, muy bien.'), option('merci-pedido', 'Merci.', false, null, 'Agradecer no indica qué bebida querés pedir.')],
    }),
    ...(['cafe', 'the'] as const).map(drink => choice({
      id: `lieu-${drink}`, objectiveId: 'choisir-lieu', title: '¿Te quedás o seguís camino?', speaker,
      scene: drink === 'cafe' ? 'Tu café ya está pedido. Falta decidir si buscás una mesa o lo llevás.' : 'Tu té ya está pedido. Falta decidir si buscás una mesa o lo llevás.',
      prompt: 'Sur place ou à emporter ?', promptTranslation: '¿Para tomar aquí o para llevar?',
      teaching: 'Sur place = aquí, en el local. À emporter = para llevar. Sur place, s’il vous plaît = aquí, por favor. À emporter, s’il vous plaît = para llevar, por favor. Elegir el lugar cambia dónde continúa la escena.',
      instruction: 'Decidí dónde vas a tomar tu bebida.', explanation: 'Ambas expresiones responden a la pregunta sobre el lugar.', correction: 'Sur place, s’il vous plaît. / À emporter, s’il vous plaît.',
      choices: [option('sur-place', 'Sur place, s’il vous plaît.', true, 'sucre-place', 'Elegiste tomar tu bebida en el café.', 'Sur place. → Aquí, en el local.'), option('emporter', 'À emporter, s’il vous plaît.', true, 'sucre-emporter', 'Elegiste llevar tu bebida.', 'À emporter. → Para llevar.'), option('bonjour-lieu', 'Bonjour.', false, null, 'Bonjour saluda; no responde dónde vas a tomar la bebida.')],
    })),
    ...(['place', 'emporter'] as const).map(place => choice({
      id: `sucre-${place}`, objectiveId: 'repondre', title: 'Una pregunta sencilla', speaker,
      scene: place === 'place' ? 'Te señalan una mesa junto a la ventana. Antes de sentarte, te ofrecen azúcar.' : 'Preparan un vaso para llevar. Antes de entregártelo, te ofrecen azúcar.',
      prompt: second ? 'Vous voulez du sucre ?' : 'Avec du sucre ?', promptTranslation: second ? '¿Quiere azúcar?' : '¿Con azúcar?',
      teaching: 'Du sucre = azúcar. Oui = sí. Non = no. Oui, s’il vous plaît = sí, por favor. Non, merci = no, gracias. Podés aceptar o rechazar el azúcar con cortesía.',
      instruction: 'Respondé si querés azúcar. Ambas decisiones son correctas.', explanation: 'Oui acepta y non rechaza; la cortesía sirve en ambos casos.', correction: 'Oui, s’il vous plaît. / Non, merci.',
      choices: [option('oui-sucre', 'Oui, s’il vous plaît.', true, 'prix', 'Aceptaste el azúcar con cortesía.', 'Avec du sucre. → Con azúcar.'), option('non-sucre', 'Non, merci.', true, 'prix', 'Rechazaste el azúcar con cortesía.', 'Sans sucre. → Sin azúcar.'), option('adios-sucre', 'Au revoir.', false, null, 'Despedirte todavía no responde si querés azúcar.')],
    })),
    written({
      id: 'prix', objectiveId: 'demander-prix', title: 'Preguntá el precio', speaker,
      scene: second ? 'La bebida está lista. Querés confirmar cuánto vas a pagar.' : 'Antes de sacar la billetera, necesitás saber cuánto cuesta tu bebida.',
      prompt: 'Votre boisson est prête.', promptTranslation: 'Su bebida está lista.',
      teaching: 'C’est combien ? = ¿Cuánto es? Combien ça coûte ? = ¿Cuánto cuesta? Son dos maneras de preguntar el precio. Conservá los acentos en ça y coûte; no evaluamos pronunciación.',
      instruction: 'Escribí una de las dos preguntas para saber el precio.', explanation: 'Las dos preguntas enseñadas piden el precio de forma natural.', correction: 'C’est combien ? / Combien ça coûte ?',
      accepted: ["C'est combien ?", 'Combien ça coûte ?'], next: 'paiement', reply: 'Ça fait trois euros. → Son tres euros.',
    }),
    choice({
      id: 'paiement', objectiveId: 'comprendre-prix', title: 'Entendé la respuesta', speaker,
      scene: 'El precio es parte de esta historia educativa, no una referencia a precios reales en París.',
      prompt: 'Ça fait trois euros.', promptTranslation: 'Son tres euros.',
      teaching: 'Un = uno. Deux = dos. Trois = tres. Un euro, deux euros, trois euros. Ça fait trois euros indica un total de tres euros.',
      instruction: 'Confirmá en francés cuánto tenés que pagar.', explanation: 'Trois significa tres; entendiste el importe de la conversación.', correction: 'Trois euros.',
      choices: [option('deux', 'Deux euros.', false, null, 'Deux significa dos. La respuesta escrita dice trois: tres.'), option('trois', 'Trois euros.', true, 'merci', 'Identificaste tres euros.', 'Merci. → Gracias.'), option('un', 'Un euro.', false, null, 'Un significa uno; el total indicado es trois euros.')],
    }),
    written({
      id: 'merci', objectiveId: 'remercier', title: 'Un pequeño agradecimiento', speaker,
      scene: 'Pagás el importe indicado y recibís tu bebida. Ahora agradecé la atención.',
      prompt: second ? 'Voilà !' : 'Voilà votre boisson.', promptTranslation: second ? '¡Aquí tiene!' : 'Aquí tiene su bebida.',
      teaching: 'Merci = gracias. Merci beaucoup = muchas gracias. Ambas sirven para agradecer la atención.',
      instruction: 'Escribí un agradecimiento en francés.', explanation: 'Agradeciste usando una expresión apropiada.', correction: 'Merci. / Merci beaucoup.',
      accepted: ['Merci.', 'Merci beaucoup.'], next: 'depart', reply: 'Avec plaisir ! → ¡Con gusto!',
    }),
    written({
      id: 'depart', objectiveId: 'saluer-depart', title: 'Hasta la próxima', speaker,
      scene: 'Ya tenés tu bebida y terminaste la compra. Cerrá la conversación con una despedida.',
      prompt: second ? 'Bonne journée !' : 'Au revoir !', promptTranslation: second ? '¡Que tenga un buen día!' : '¡Adiós!',
      teaching: 'Au revoir = adiós / hasta luego. Bonne journée = que tenga un buen día. Podés usar cualquiera de las dos para despedirte de día.',
      instruction: 'Despedite en francés para terminar la aventura.', explanation: 'Cerraste la conversación con una despedida cortés.', correction: 'Au revoir. / Bonne journée.',
      accepted: ['Au revoir.', 'Bonne journée.'], next: null, reply: 'À bientôt ! → ¡Hasta pronto!',
    }),
  ];
  return { id, title: second ? 'Mediodía con Samir' : 'Una mañana con Lucie', start: 'bonjour', exercises };
}

export const cafeLesson: Lesson = {
  schemaVersion: 1, version: 1, id: 'fr-a1-paris-cafe', language: 'fr', level: 'A1', title: 'Un café en París',
  objectives: ['saluer', 'commander', 'choisir-lieu', 'repondre', 'demander-prix', 'comprendre-prix', 'remercier', 'saluer-depart'],
  variants: [variant('matin-lucie', 'Lucie', false), variant('midi-samir', 'Samir', true),
    editorialVariant('pluie-camille', 'Camille', 'Una pausa con Camille', 'Afuera llueve. Entrás al café y dejás el paraguas junto a la puerta.', true, 'Elegís tu bebida mientras esperás que pase la lluvia.'),
    editorialVariant('carnet-alex', 'Alex', 'El cuaderno de Alex', 'Entrás con tu cuaderno de viaje. Alex deja espacio en el mostrador para atenderte.', false, 'Anotaste café y té en tu cuaderno; ahora podés pedir cualquiera.'),
    editorialVariant('balade-noemie', 'Noémie', 'Un paseo con Noémie', 'Hacés una pausa durante tu paseo por París. Noémie te recibe al entrar.', true, 'Antes de seguir el paseo, decidís qué bebida pedir.'),
    editorialVariant('lecture-hugo', 'Hugo', 'Un libro con Hugo', 'Llevás un libro bajo el brazo. Hugo termina de acomodar dos tazas y se acerca.', false, 'Tu libro puede esperar: es momento de pedir café o té.'),
  ],
};

function editorialVariant(id: string, speaker: string, title: string, scene: string, second: boolean, orderScene: string): LessonVariant {
  const result = variant(id, speaker, second);
  result.title = title;
  result.exercises = result.exercises.map(exercise => {
    if (exercise.id === 'bonjour') return { ...exercise, scene };
    if (exercise.id === 'commande') return { ...exercise, scene: orderScene };
    if (exercise.id === 'merci') return { ...exercise, scene: `Recibís tu bebida. ${speaker} espera tu respuesta antes de atender a la siguiente persona.` };
    return exercise;
  });
  return result;
}
