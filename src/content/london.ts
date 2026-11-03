import type { ChoiceExercise, ChoiceOption, Exercise, Lesson, LessonVariant, TextExercise } from '../domain/learning/models';
import { londonLessonV1 } from './london.v1';
import { londonLessonV2 } from './london.v2';
import { londonLesson as londonLessonV3 } from './london.v3';
export { londonLesson as londonLessonV3 } from './london.v3';
export { londonLessonV1 } from './london.v1';
export { londonLessonV2 } from './london.v2';

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
const option = (id: string, label: string, correct: boolean, next: string | null, explanation: string, reply = ''): ChoiceOption => ({ id, label, correct, next, explanation, reply, spokenExplanation: correct ? 'Esta respuesta mantiene la conversación y ayuda a seguir avanzando.' : 'Esta opción no corresponde a lo que se necesita en esta escena. Leé la explicación y volvé a intentarlo.' });
const choice = (data: Omit<ChoiceExercise, 'kind'>): ChoiceExercise => ({ kind: 'choice', ...data });
const text = (data: Omit<TextExercise, 'kind'>): TextExercise => ({
  kind: 'text', writtenRules: [],
  unknownExplanation: 'No puedo confirmar esta formulación con las expresiones verificadas. Eso no significa que tu inglés sea incorrecto; podés reformularla o usar la ayuda.',
  unknownSpokenExplanation: 'No puedo confirmar la respuesta con seguridad. Podés reformularla o revisar la ayuda escrita.',
  ...data,
});

const stories: Story[] = [
  {
    id: 'station-arrival', title: 'The last train · King’s Cross', guide: 'Maya',
    opening: 'Acabás de llegar a Londres con una pequeña maleta. Las puertas de la estación se cierran detrás de vos y buscás tu alojamiento.',
    greeting: 'Hello! Do you need help?', destination: 'the Blue Door Hostel', destinationEs: 'el hostal de la puerta azul',
    reason: 'Tenés una reserva en un hostal imaginario, pero tu teléfono se quedó sin batería.',
    firstReply: 'Hi! I can help you. → ¡Hola! Puedo ayudarte.', helpReply: 'Of course! → ¡Claro!',
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
    firstReply: 'Hello! It is raining a lot. → ¡Hola! Está lloviendo mucho.', helpReply: 'Sure! The rain is getting stronger. → ¡Claro! Está lloviendo más fuerte.',
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
        question: 'Which way is the theatre?', questionAlternatives: ['Where is the theatre?', 'How do I get to the theatre?'],
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
      promptTranslation: '¡Hola! ¿Necesitás ayuda?',
      teaching: 'Hello / Hi = hola. Do you need help? / Need some help? = ¿Necesitás ayuda? Yes, please = sí, por favor. Yes, I need help = sí, necesito ayuda. Saludá y aceptá la ayuda que necesitás. Si ya saludaste, también se aceptan Yes, please. y Yes, I need help.',
      instruction: 'Saludá y aceptá la ayuda de la persona que se acerca.', explanation: 'Saludaste y aceptaste la oferta de ayuda.', correction: 'Hello! Yes, please. / Hi! Yes, I need help.',
      choices: [{ ...option('hello', 'Hello! Yes, please.', true, 'introduce', 'Aceptaste la oferta con cortesía.', story.firstReply), spokenAlternatives: ['Yes, please.', 'Yes, I need help, please.'] }, { ...option('hi', 'Hi! Yes, I need help.', true, 'introduce', 'Confirmaste que necesitás ayuda.', story.firstReply), spokenAlternatives: ['Yes, I need help.', 'Hi, yes, please.'] }, option('goodbye-early', 'Goodbye!', false, null, 'Goodbye sirve para despedirse; acabás de llegar y necesitás ayuda.')],
    }),
    text({ ...base('introduce', 'introduce'), title: 'Un viajero nuevo',
      scene: `Alguien te pregunta si conocés la zona. ${story.reason}`, prompt: 'Are you new here?', promptTranslation: '¿Sos nuevo/a por aquí?',
      teaching: "I'm = I am = yo soy/estoy. New here = nuevo aquí. Visiting London = visitando Londres. También podés comenzar con Yes para contestar afirmativamente.",
      instruction: 'Contá con una frase sencilla que sos nuevo o estás de visita.', explanation: 'Te presentaste como alguien nuevo en la zona o de visita.',
      correction: "I'm new here. / Yes, I'm new here. / I'm visiting London.",
      accepted: ["I'm new here.", 'I am new here.', "I'm visiting London.", 'I am visiting London.', "Yes, I'm new here.", 'Yes, I am new here.', "Yes, I'm visiting London.", 'Yes, I am visiting London.', "I'm new to London.", 'Yes, I am.'],
      acceptedFeedback: [
        { input: "Yes, I'm new here.", explanation: 'Muy bien: confirmaste que sos nuevo por aquí y agregaste una presentación sencilla.', spokenExplanation: 'Muy bien. Confirmaste que sos nuevo por aquí y te presentaste de forma natural.' },
        { input: 'Yes, I am.', explanation: 'Es una respuesta breve y válida a una pregunta que empieza con Are you. Para practicar más, podés contar que sos nuevo en la zona.', spokenExplanation: 'Respuesta breve y válida. También podés agregar información sobre tu visita.' },
      ],
      spokenExplanation: 'Respondiste de manera natural que sos nuevo en la zona o que estás de visita.',
      unknownExplanation: 'No puedo confirmar si esa frase responde a la pregunta. No significa que esté mal escrita; probá reformular que sos nuevo o que estás de visita.',
      unknownSpokenExplanation: 'No puedo confirmar esta respuesta. Podés reformularla o usar una expresión de la ayuda.',
      writtenRules: [
        { input: 'I new here.', issue: 'structure', explanation: 'Con I necesitamos am: I am new here. También sirve I’m new here.', spokenExplanation: 'En esta frase falta el verbo ser o estar. Revisá el ejemplo escrito y escuchalo en inglés.' },
        { input: 'No, I am not new here.', issue: 'vocabulary', explanation: 'La oración está bien formada, pero contradice la situación: acabás de llegar y estás practicando cómo decir que sos nuevo.', spokenExplanation: 'La frase está bien formada, pero contradice lo que pasa en la historia.' },
      ],
      next: 'help', reply: story.id === 'station-arrival' ? "No problem. I'm Maya. → No hay problema. Soy Maya." : "I'm Ollie. Welcome! → Soy Ollie. ¡Bienvenido!",
    }),
    text({ ...base('ask-help', 'help'), title: 'Una pregunta educada',
      scene: 'Estás con alguien dispuesto a escucharte. Pedir ayuda con cortesía abre la conversación.', prompt: 'What do you need?', promptTranslation: '¿Qué necesitás?',
      teaching: 'I need help = necesito ayuda. Please = por favor. También podés pedir ayuda con Can you help me, please? o Could you help me, please? La primera responde directamente; las preguntas piden un favor.',
      instruction: 'Decí qué necesitás o pedí ayuda educadamente.', explanation: 'Comunicaste que necesitás ayuda y mantuviste la conversación.',
      correction: 'I need help. / I need help, please. / Can you help me, please?',
      accepted: ['I need help.', 'I need help, please.', 'Yes, I need help.', 'Yes, please.', 'I need directions.', 'I need directions, please.', 'Can you help me, please?', 'Can you help me?', 'Could you help me, please?', 'Could you help me?', 'Excuse me, can you help me?'],
      acceptedFeedback: [
        { input: 'I need help.', explanation: 'Correcto: respondiste directamente qué necesitás. Es una expresión válida; agregar please puede hacerla más cortés.', spokenExplanation: 'Correcto. Expresaste claramente que necesitás ayuda. Podés añadir por favor para sonar más amable.' },
        { input: 'I need help, please.', explanation: 'Correcto: pediste ayuda de forma directa y cortés.', spokenExplanation: 'Muy bien. Pediste ayuda de forma clara y cortés.' },
        { input: 'Yes, please.', explanation: 'Está bien en esta situación: aceptás la oferta de ayuda. Para contestar con más detalle podés explicar qué necesitás.', spokenExplanation: 'Correcto. Aceptaste la oferta de ayuda con cortesía.' },
      ],
      spokenExplanation: 'Comunicaste que necesitás ayuda. Ahora podés explicar adónde querés ir.',
      unknownExplanation: 'No puedo determinar si esta frase comunica qué necesitás. No es necesariamente un error de inglés. Reformulá tu necesidad o usá una expresión de ayuda.',
      unknownSpokenExplanation: 'No puedo verificar esta formulación. Reformulá qué necesitás o elegí otra expresión de la ayuda.',
      writtenRules: [
        { input: 'Can you helps me?', issue: 'structure', explanation: 'Después de can usamos help, sin s: Can you help me?', spokenExplanation: 'Después de un verbo modal se usa la forma básica del verbo, sin esa terminación.' },
        { input: "I don't need help.", issue: 'vocabulary', explanation: 'La frase significa que NO necesitás ayuda. En esta escena acabás de pedirla; la respuesta contradice el objetivo.', spokenExplanation: 'Esta frase dice que no necesitás ayuda, pero en la historia sí la necesitás.' },
        { input: 'I need no help.', issue: 'vocabulary', explanation: 'Esta frase rechaza la ayuda; el personaje te preguntó qué necesitás para encontrar tu destino.', spokenExplanation: 'Esta respuesta rechaza la ayuda y no coincide con la situación de la historia.' },
      ], next: 'where', reply: story.helpReply,
    }),
    text({ ...base('ask-where', 'where'), title: 'El destino que buscás',
      scene: `Necesitás llegar a ${story.destinationEs}. Ya sabés cómo pedir ayuda.`, prompt: 'Where do you need to go?', promptTranslation: '¿Adónde necesitás ir?' ,
      teaching: `Where is…? = ¿Dónde está…? Where's = forma corta de Where is. I need to go to… = necesito ir a… ${story.destination} es un lugar ficticio. Podés comenzar con Excuse me para ser cortés.`,
      instruction: `Preguntá dónde está ${story.destination}.`, explanation: 'Preguntaste dónde está un lugar concreto, usando Where is o Where’s.',
      correction: `Where is ${story.destination}?`,
      accepted: [`Where is ${story.destination}?`, `Where's ${story.destination}?`, `Excuse me, where is ${story.destination}?`, `Can you tell me where ${story.destination} is?`, `I need to go to ${story.destination}.`, `I'm looking for ${story.destination}.`, ...(story.id === 'riverside-rain' ? ['Where is the theatre?', 'Excuse me, where is the theatre?', 'Where can I find the theatre?', 'I need to go to the theatre.', "I'm looking for the theatre."] : ['Where is the hostel?', 'Excuse me, where is the hostel?', 'I need to go to the hostel.', "I'm looking for the hostel."])],
      spokenExplanation: 'Expresaste el lugar que buscás o preguntaste correctamente por su ubicación.',
      unknownExplanation: 'No puedo verificar que hayas indicado o preguntado por el destino en esta escena. No voy a inventar un error de gramática: probá decir el lugar que buscás.',
      unknownSpokenExplanation: 'No puedo verificar esta respuesta con seguridad. Decí cuál es tu destino o preguntá dónde queda.', 
      writtenRules: [
        { input: `Where ${story.destination}?`, issue: 'structure', explanation: 'En una pregunta de ubicación necesitás is: Where is…? / Where’s…?', spokenExplanation: 'En esta pregunta falta el verbo ser o estar. Escuchá el ejemplo inglés para practicar la forma correcta.' },
        ...[ `What is ${story.destination}?`, ...(story.id === 'riverside-rain' ? ['What is the theatre?', 'What is the theater?'] : ['What is the hostel?']) ].map(input => ({ input, issue: 'vocabulary' as const, explanation: 'What is…? pregunta qué es algo. Para saber dónde está un lugar, preguntá Where is…? (¿Dónde está…?).', spokenExplanation: 'Preguntaste qué es el lugar, pero querés saber dónde queda. Usá la palabra para preguntar por una ubicación.' })),
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
      spokenExplanation: 'Pediste una aclaración relevante a la persona que conoce el camino.',
      teaching: `Preguntá para confirmar lo que necesitás saber. ${route.id === 'b' && story.id === 'riverside-rain' ? 'Which way = ¿por dónde?; outside = afuera.' : 'Near = cerca; where = dónde; is it…? = ¿está…?'} Podés preguntar: ${[route.question, ...route.questionAlternatives].join(' / ')}`, 
      instruction: 'Hacé una pregunta breve para comprobar por dónde ir.', explanation: route.questionExplanation,
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
      scene: `Antes de irte, ${route.person} te recuerda la dirección. Le agradecés la ayuda.`, prompt: 'Now you know the way!', promptTranslation: '¡Ahora ya sabés el camino!',
      teaching: 'Thank you = gracias; thanks = gracias (más informal); thank you very much = muchas gracias. Cualquiera sirve para agradecer.',
      spokenExplanation: 'Agradeciste la ayuda de una manera natural y cortés.',
      instruction: 'Agradecé a quien te ayudó.', explanation: 'Agradeciste la ayuda en inglés de forma natural.', correction: 'Thank you! / Thanks!',
      accepted: ['Thank you!', 'Thanks!', 'Thank you very much!', 'Thanks a lot!'],
      writtenRules: [{ input: 'Thanks you.', issue: 'structure', explanation: 'No se mezclan Thanks y Thank you: elegí una de las dos expresiones.', spokenExplanation: 'Se mezclaron dos formas de agradecer. Elegí una de las expresiones del ejemplo.' }], next: `bye-${route.id}`,
      reply: 'You are welcome! → ¡De nada!',
    }));
    exercises.push(text({ ...base('goodbye', `bye-${route.id}`), title: 'Destino encontrado', speaker: route.person,
      scene: `Te despedís de ${route.person} y seguís las indicaciones. ${route.finalScene}`, prompt: 'Have a good time!', promptTranslation: '¡Que la pases bien!',
      teaching: 'Goodbye = adiós; bye = chao; see you = nos vemos. Para cerrar una conversación podés usar cualquiera de estas expresiones.',
      spokenExplanation: 'Terminaste la conversación de manera amable.',
      instruction: 'Despedite y cerrá el capítulo.', explanation: 'Terminaste la conversación con una despedida natural.', correction: 'Goodbye! / Bye! / See you!',
      accepted: ['Goodbye!', 'Bye!', 'See you!', 'See you later!'],
      writtenRules: [{ input: 'By.', issue: 'spelling', explanation: 'Para despedirte se escribe bye; by se usa para otras ideas, como «por» o «junto a».', spokenExplanation: 'Para despedirte se usa una palabra distinta. Revisá el ejemplo escrito y escuchalo en inglés.' }], next: null, reply: route.goodbyeReply,
    }));
  }
  return { id: story.id, title: story.title, start: 'greet', exercises };
}

export const londonLesson: Lesson = {
  schemaVersion: 1, version: 4, id: 'en-a1-london-lost', language: 'en', level: 'A1', title: 'Lost in London',
  objectives: ['greet', 'introduce', 'ask-help', 'ask-where', 'choose-route', 'clarify', 'understand-directions', 'thank', 'goodbye'],
  variants: stories.map(createVariant),
};

export function londonLessonForProgress(progress: import('../domain/learning/models').MissionProgress | null): Lesson {
  if (!progress) return londonLesson;
  if (progress.lessonId !== londonLesson.id) throw Error('Versión de aventura inglesa no admitida');
  if (progress.contentVersion === londonLessonV1.version) return londonLessonV1;
  if (progress.contentVersion === londonLessonV2.version) return londonLessonV2;
  if (progress.contentVersion === londonLessonV3.version) return londonLessonV3;
  if (progress.contentVersion === londonLesson.version) return londonLesson;
  throw Error('Versión de aventura inglesa no admitida');
}
