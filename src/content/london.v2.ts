import type { ChoiceExercise, ChoiceOption, Exercise, Lesson, LessonVariant, TextExercise } from '../domain/learning/models';

/** LV-006A · Original, finite A1 stories. Every visited path teaches nine objectives.
 * Locations with invented names are fictional; directions are cues inside the story, not maps. */
type Route = {
  id: 'a' | 'b'; label: string; labelAlternative: string; explanation: string; reply: string;
  person: string; setting: string; prompt: string; translation: string;
  question: string; questionAlternatives: string[]; questionExplanation: string; questionReply: string;
  directionPrompt: string; directionTranslation: string; directionTeaching: string;
  directions: [string, string]; wrongDirection: string; wrongExplanation: string;
  finalScene: string; goodbyeReply: string;
};
type Story = {
  id: string; title: string; opening: string; guide: string; greeting: string;
  destination: string; destinationEs: string; reason: string;
  firstReply: string; helpReply: string; whereReply: string;
  decisionPrompt: string; decisionTranslation: string; decisionTeaching: string;
  routes: [Route, Route];
};
const option = (id: string, label: string, correct: boolean, next: string | null, explanation: string, reply = ''): ChoiceOption => ({ id, label, correct, next, explanation, reply });
const choice = (data: Omit<ChoiceExercise, 'kind'>): ChoiceExercise => ({ kind: 'choice', ...data });
const text = (data: Omit<TextExercise, 'kind'>): TextExercise => ({ kind: 'text', writtenRules: [], ...data });

const stories: Story[] = [
  {
    id: 'station-arrival', title: 'The last train · King’s Cross', guide: 'Maya',
    opening: 'Acabás de llegar a Londres con una pequeña maleta. Las puertas de la estación se cierran detrás de vos y buscás tu alojamiento.',
    greeting: 'Hello! Are you lost?', destination: 'the Blue Door Hostel', destinationEs: 'el hostal de la puerta azul',
    reason: 'Tenés una reserva en un hostal imaginario, pero tu teléfono se quedó sin batería.',
    firstReply: 'Welcome to London! → ¡Bienvenido a Londres!', helpReply: 'Of course! → ¡Claro!',
    whereReply: 'The Blue Door Hostel? Yes, I know it. → ¿El hostal de la puerta azul? Sí, lo conozco.',
    decisionPrompt: 'You can walk or take a bus. What would you like?',
    decisionTranslation: 'Podés caminar o tomar un autobús. ¿Qué preferís?',
    decisionTeaching: 'Walk = caminar; bus = autobús. I’d like to walk = quisiera caminar. Can I take the bus? = ¿Puedo tomar el autobús? Ambas decisiones tienen su propia escena y guía.',
    routes: [
      {
        id: 'a', label: "I'd like to walk, please.", labelAlternative: 'I want to walk, please.',
        explanation: 'Elegiste ir a pie; ahora seguís un recorrido por calles pequeñas.',
        reply: 'Go to the little bookshop. Nora can show you the way. → Andá a la pequeña librería. Nora puede indicarte el camino.',
        person: 'Nora', setting: 'Entrás a una pequeña librería. Nora guarda un libro y te señala una postal roja junto a la ventana.',
        prompt: 'Hi! The hostel is near here.', translation: '¡Hola! El hostal está cerca de aquí.',
        question: 'Is it near?', questionAlternatives: ['Is it close?', 'Is the hostel near?', 'Is the hostel close?'],
        questionExplanation: 'Near y close pueden preguntar si el destino está cerca.',
        questionReply: 'Yes. Go straight, then turn left at the red post box. → Sí. Seguí recto y girá a la izquierda en el buzón rojo.',
        directionPrompt: 'Go straight, then turn left at the red post box.', directionTranslation: 'Seguí recto y luego girá a la izquierda en el buzón rojo.',
        directionTeaching: 'Go straight = seguí recto; turn left = girá a la izquierda. Red post box = buzón rojo. La opción derecha sería otra dirección.',
        directions: ['Go straight, then left.', 'Straight ahead, then left.'], wrongDirection: 'Go straight, then right.',
        wrongExplanation: 'Right significa derecha; Nora dijo left, izquierda.',
        finalScene: 'Ves el buzón rojo, girás a la izquierda y aparece la puerta azul del hostal.',
        goodbyeReply: 'Enjoy your stay! → ¡Disfrutá tu estancia!',
      },
      {
        id: 'b', label: 'Can I take the bus?', labelAlternative: "I'd like to take the bus.",
        explanation: 'Elegiste el autobús; conocés a otro personaje y necesitás reconocer su número.',
        reply: 'Yes! Ben is at the bus stop. Ask him. → ¡Sí! Ben está en la parada. Preguntale.',
        person: 'Ben', setting: 'En la parada iluminada, Ben, el conductor, consulta un horario. Un autobús rojo se acerca.',
        prompt: 'Hello! Are you going to the hostel?', translation: '¡Hola! ¿Vas al hostal?',
        question: 'Is this the bus to the hostel?', questionAlternatives: ['Does this bus go to the hostel?', 'Can I take this bus to the hostel?'],
        questionExplanation: 'Preguntaste si este autobús te lleva al hostal. Is this the bus to…? sirve para confirmar el destino.',
        questionReply: 'Take bus number five. It goes to the hostel. → Tomá el autobús número cinco. Va al hostal.',
        directionPrompt: 'Take bus number five.', directionTranslation: 'Tomá el autobús número cinco.',
        directionTeaching: 'Bus = autobús; number five = número cinco. Two = dos. Tenés que identificar el número de la ruta.',
        directions: ['Bus number five.', 'Number five.'], wrongDirection: 'Bus number two.',
        wrongExplanation: 'Two significa dos, pero Ben dijo five: cinco.',
        finalScene: 'Subís al autobús número cinco. Ben señala la parada que queda frente al hostal.',
        goodbyeReply: 'Have a good evening! → ¡Que tengas una buena tarde!',
      },
    ],
  },
  {
    id: 'riverside-rain', title: 'The rainy river · South Bank', guide: 'Ollie',
    opening: 'Empieza a llover junto al río. Un músico callejero guarda su guitarra y vos buscás un pequeño teatro donde te espera una amiga.',
    greeting: 'Hi there! Need some help?', destination: 'the Lantern Theatre', destinationEs: 'el Teatro de la Linterna',
    reason: 'La entrada para un espectáculo está en tu bolsillo; el teatro es ficticio y queda cerca del río.',
    firstReply: 'Nice to meet you! → ¡Mucho gusto!', helpReply: 'Sure! The rain is getting stronger. → ¡Claro! Está lloviendo más fuerte.',
    whereReply: 'Ah, the Lantern Theatre! It is not far. → ¡Ah, el Teatro de la Linterna! No está lejos.',
    decisionPrompt: 'You can go by the river or through the market. Which way?',
    decisionTranslation: 'Podés ir junto al río o atravesar el mercado. ¿Por dónde querés ir?',
    decisionTeaching: 'By the river = junto al río; through the market = por el mercado. Which way? = ¿Por dónde? Dos caminos válidos que llevan a escenas distintas.',
    routes: [
      {
        id: 'a', label: "I'd like to go by the river.", labelAlternative: 'By the river, please.',
        explanation: 'Elegiste el camino del río: otro personaje te ayuda bajo un paraguas.',
        reply: 'Follow the river. Asha has a big yellow umbrella. → Seguí el río. Asha lleva un paraguas amarillo grande.',
        person: 'Asha', setting: 'Asha comparte su paraguas amarillo junto a la baranda del río. A lo lejos brilla una pequeña luz.',
        prompt: 'Hello! The theatre is near the bridge.', translation: '¡Hola! El teatro está cerca del puente.',
        question: 'Is it near the bridge?', questionAlternatives: ['Is the theatre near the bridge?', 'Is it close to the bridge?'],
        questionExplanation: 'Near the bridge = cerca del puente; confirmaste la ubicación con una pregunta sencilla.',
        questionReply: 'Yes! Walk to the bridge, then turn right. → ¡Sí! Caminá hasta el puente y girá a la derecha.',
        directionPrompt: 'Walk to the bridge, then turn right.', directionTranslation: 'Caminá hasta el puente y luego girá a la derecha.',
        directionTeaching: 'Bridge = puente; turn right = girá a la derecha. Left significa izquierda.',
        directions: ['Go to the bridge, then right.', 'Walk to the bridge, then turn right.'], wrongDirection: 'Go to the bridge, then left.',
        wrongExplanation: 'Asha dijo right (derecha), no left (izquierda).',
        finalScene: 'Llegás al puente, doblás a la derecha y ves una linterna encendida sobre la entrada del teatro.',
        goodbyeReply: 'Enjoy the show! → ¡Disfrutá el espectáculo!',
      },
      {
        id: 'b', label: 'Through the market, please.', labelAlternative: "I'd like to go through the market.",
        explanation: 'Elegiste el mercado cubierto: la historia continúa entre puestos y luces.',
        reply: 'Good idea! Leo is near the green sign. → ¡Buena idea! Leo está cerca del letrero verde.',
        person: 'Leo', setting: 'Te refugiás bajo el techo del mercado. Leo, el vendedor, cierra un puesto de flores junto a un letrero verde.',
        prompt: 'Good evening! The theatre is just outside the market.', translation: '¡Buenas noches! El teatro está justo afuera del mercado.',
        question: 'Which way is the theatre?', questionAlternatives: ['Where is the theatre?', 'Is it near here?'],
        questionExplanation: 'Which way…? pide la dirección; Where…? pregunta dónde está. Leo te ayuda a encontrar la salida correcta.',
        questionReply: 'Go past the green sign and turn left. → Pasá el letrero verde y girá a la izquierda.',
        directionPrompt: 'Go past the green sign and turn left.', directionTranslation: 'Pasá el letrero verde y girá a la izquierda.',
        directionTeaching: 'Go past = pasá de largo; green sign = letrero verde; left = izquierda. Right = derecha.',
        directions: ['Past the sign, then left.', 'Go past the green sign and turn left.'], wrongDirection: 'Past the sign, then right.',
        wrongExplanation: 'Leo dijo left (izquierda); right (derecha) no coincide con la indicación.',
        finalScene: 'Seguís el letrero verde, doblás a la izquierda y encontrás la linterna del teatro. Tu amiga te saluda desde la entrada.',
        goodbyeReply: 'Have fun tonight! → ¡Divertite esta noche!',
      },
    ],
  },
];

function createVariant(story: Story): LessonVariant {
  const base = (objectiveId: string, id: string) => ({ id, objectiveId, title: '', speaker: story.guide, scene: story.opening, prompt: '', promptTranslation: '', teaching: '', instruction: '', explanation: '', correction: '' });
  const exercises: Exercise[] = [
    choice({ ...base('greet', 'greet'), title: 'Un rostro amable', prompt: story.greeting,
      promptTranslation: story.id === 'station-arrival' ? '¡Hola! ¿Te perdiste?' : '¡Hola! ¿Necesitás ayuda?',
      teaching: 'Hello = hola; Hi = hola (informal). Good morning = buenos días, solo por la mañana. Para saludar a alguien que te ofrece ayuda, Hello o Hi son naturales.',
      instruction: 'Saludá a la persona que se acerca.', explanation: 'Saludaste de forma amable.', correction: 'Hello! / Hi!',
      choices: [option('hello', 'Hello!', true, 'introduce', 'Hello es un saludo útil y cortés.', story.firstReply), option('hi', 'Hi!', true, 'introduce', 'Hi es un saludo breve y natural.', story.firstReply), option('goodbye-early', 'Goodbye!', false, null, 'Goodbye sirve para despedirse; acabás de llegar.')],
    }),
    text({ ...base('introduce', 'introduce'), title: 'Un viajero nuevo',
      scene: `Alguien te pregunta si conocés la zona. ${story.reason}`, prompt: 'Are you new here?', promptTranslation: '¿Sos nuevo/a por aquí?',
      teaching: "I'm = I am = yo soy/estoy. New here = nuevo aquí. Visiting London = visitando Londres. Podés decir I'm new here o I'm visiting London.",
      instruction: 'Contá con una frase sencilla que sos nuevo o estás de visita.', explanation: 'Te presentaste como alguien nuevo en la zona o de visita.',
      correction: "I'm new here. / I'm visiting London.", accepted: ["I'm new here.", 'I am new here.', "I'm visiting London.", 'I am visiting London.'],
      writtenRules: [{ input: 'I new here.', issue: 'structure', explanation: 'Con I necesitamos am: I am new here. También sirve I’m new here.' }],
      next: 'help', reply: story.id === 'station-arrival' ? "No problem. I'm Maya. → No hay problema. Soy Maya." : "I'm Ollie. Welcome! → Soy Ollie. ¡Bienvenido!",
    }),
    text({ ...base('ask-help', 'help'), title: 'Una pregunta educada',
      scene: 'Estás con alguien dispuesto a escucharte. Pedir ayuda con cortesía abre la conversación.', prompt: 'What do you need?', promptTranslation: '¿Qué necesitás?',
      teaching: 'Can you help me, please? = ¿Me podés ayudar, por favor? Excuse me = disculpe. Could you help me? es otra manera educada de pedir ayuda.',
      instruction: 'Pedí ayuda de manera cortés.', explanation: 'Pediste ayuda con una pregunta educada.',
      correction: 'Can you help me, please? / Could you help me, please?',
      accepted: ['Can you help me, please?', 'Can you help me?', 'Could you help me, please?', 'Excuse me, can you help me?'],
      writtenRules: [{ input: 'Can you helps me?', issue: 'structure', explanation: 'Después de can usamos help, sin s: Can you help me?' }], next: 'where', reply: story.helpReply,
    }),
    text({ ...base('ask-where', 'where'), title: 'El destino que buscás',
      scene: `Necesitás llegar a ${story.destinationEs}. Ya sabés cómo pedir ayuda.`, prompt: 'Do you need directions?', promptTranslation: '¿Necesitás indicaciones?' ,
      teaching: `Where is…? = ¿Dónde está…? Where's = forma corta de Where is. ${story.destination} es el nombre del lugar ficticio. Podés empezar con Excuse me para ser más cortés.`,
      instruction: `Preguntá dónde está ${story.destination}.`, explanation: 'Preguntaste dónde está un lugar concreto, usando Where is o Where’s.',
      correction: `Where is ${story.destination}?`,
      accepted: [`Where is ${story.destination}?`, `Where's ${story.destination}?`, `Excuse me, where is ${story.destination}?`, `Can you tell me where ${story.destination} is?`, ...(story.id === 'riverside-rain' ? ['Where is the theatre?', 'Excuse me, where is the theatre?', 'Where can I find the theatre?'] : ['Where is the hostel?', 'Excuse me, where is the hostel?'])],
      writtenRules: [
        { input: `Where ${story.destination}?`, issue: 'structure', explanation: 'En una pregunta de ubicación necesitás is: Where is…? / Where’s…?' },
        ...[ `What is ${story.destination}?`, ...(story.id === 'riverside-rain' ? ['What is the theatre?', 'What is the theater?'] : ['What is the hostel?']) ].map(input => ({ input, issue: 'vocabulary' as const, explanation: 'What is…? pregunta qué es algo. Para saber dónde está un lugar, preguntá Where is…? (¿Dónde está…?).' })),
      ],
      next: 'choose-path', reply: story.whereReply,
    }),
    choice({ ...base('choose-route', 'choose-path'), title: 'Dos caminos posibles', scene: 'Ahora decidís cómo seguir. Tu decisión cambia la ruta, el personaje y las indicaciones.',
      prompt: story.decisionPrompt, promptTranslation: story.decisionTranslation,
      teaching: story.decisionTeaching + ` También podés elegir: ${story.routes.map(route => route.labelAlternative).join(' / ')}`,
      instruction: 'Elegí uno de los dos caminos; los dos son válidos.', explanation: 'Elegiste una ruta posible.', correction: story.routes.map(route => route.label).join(' / '),
      choices: [...story.routes.flatMap(route => [option(`route-${route.id}`, route.label, true, `confirm-${route.id}`, route.explanation, route.reply), option(`route-${route.id}-alt`, route.labelAlternative, true, `confirm-${route.id}`, route.explanation, route.reply)]), option('ignore-directions', 'I do not need directions.', false, null, 'Esta frase rechaza la ayuda; la meta de esta escena es elegir uno de los caminos ofrecidos.')],
    }),
  ];
  for (const route of story.routes) {
    exercises.push(text({ ...base('clarify', `confirm-${route.id}`), title: 'Aclarar el camino', speaker: route.person, scene: route.setting,
      prompt: route.prompt, promptTranslation: route.translation,
      teaching: `Preguntá para confirmar lo que necesitás saber. ${route.id === 'b' && story.id === 'riverside-rain' ? 'Which way = ¿por dónde?; outside = afuera.' : 'Near = cerca; where = dónde; is it…? = ¿está…?'} Podés preguntar: ${[route.question, ...route.questionAlternatives].join(' / ')}`, 
      instruction: 'Hacé una pregunta corta para confirmar la ubicación.', explanation: route.questionExplanation,
      correction: [route.question, ...route.questionAlternatives].join(' / '),
      accepted: [route.question, ...route.questionAlternatives], next: `direction-${route.id}`, reply: route.questionReply,
    }));
    exercises.push(choice({ ...base('understand-directions', `direction-${route.id}`), title: 'Seguir las indicaciones', speaker: route.person,
      scene: 'Prestá atención a la dirección o el número. No necesitás memorizar más de un dato por vez.',
      prompt: route.directionPrompt, promptTranslation: route.directionTranslation,
      teaching: `${route.directionTeaching} Dos maneras de confirmar lo mismo: ${route.directions.join(' / ')}`,
      instruction: 'Confirmá lo que te indicó el personaje.', explanation: 'Interpretaste la dirección que realmente dio el personaje.', correction: route.directions.join(' / '),
      choices: [option('direction-a', route.directions[0], true, `thanks-${route.id}`, 'Reconociste correctamente la indicación.', 'That is right! → ¡Exactamente!'),
        option('direction-b', route.directions[1], true, `thanks-${route.id}`, 'Expresaste la misma indicación con otras palabras.', 'Perfect! → ¡Perfecto!'),
        option('wrong-direction', route.wrongDirection, false, null, route.wrongExplanation)],
    }));
    exercises.push(text({ ...base('thank', `thanks-${route.id}`), title: 'Un gesto amable', speaker: route.person,
      scene: route.finalScene, prompt: 'Here you are. You found it!', promptTranslation: 'Aquí está. ¡Lo encontraste!',
      teaching: 'Thank you = gracias; thanks = gracias (más informal); thank you very much = muchas gracias. Cualquiera sirve para agradecer.',
      instruction: 'Agradecé a quien te ayudó.', explanation: 'Agradeciste la ayuda en inglés de forma natural.', correction: 'Thank you! / Thanks!',
      accepted: ['Thank you!', 'Thanks!', 'Thank you very much!', 'Thanks a lot!'],
      writtenRules: [{ input: 'Thanks you.', issue: 'structure', explanation: 'No se mezclan Thanks y Thank you: elegí una de las dos expresiones.' }], next: `bye-${route.id}`,
      reply: 'You are welcome! → ¡De nada!',
    }));
    exercises.push(text({ ...base('goodbye', `bye-${route.id}`), title: 'Destino encontrado', speaker: route.person,
      scene: route.finalScene, prompt: 'Have a nice day!', promptTranslation: '¡Que tengas un buen día!',
      teaching: 'Goodbye = adiós; bye = chao; see you = nos vemos. Para cerrar una conversación podés usar cualquiera de estas expresiones.',
      instruction: 'Despedite y cerrá el capítulo.', explanation: 'Terminaste la conversación con una despedida natural.', correction: 'Goodbye! / Bye! / See you!',
      accepted: ['Goodbye!', 'Bye!', 'See you!', 'See you later!'],
      writtenRules: [{ input: 'By.', issue: 'spelling', explanation: 'Para despedirte se escribe bye; by se usa para otras ideas, como «por» o «junto a».' }], next: null, reply: route.goodbyeReply,
    }));
  }
  return { id: story.id, title: story.title, start: 'greet', exercises };
}

export const londonLessonV2: Lesson = {
  schemaVersion: 1, version: 2, id: 'en-a1-london-lost', language: 'en', level: 'A1', title: 'Lost in London',
  objectives: ['greet', 'introduce', 'ask-help', 'ask-where', 'choose-route', 'clarify', 'understand-directions', 'thank', 'goodbye'],
  variants: stories.map(createVariant),
};

