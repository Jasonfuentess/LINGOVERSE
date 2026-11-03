import type { ChoiceExercise, ChoiceOption, Lesson, LessonVariant, TextExercise } from '../domain/learning/models';
import { validateLesson } from '../domain/learning/validation';

/** LV-006B v1: two original Paris meetings. No AI, paid services, or approximate grading.
 * Locations are narrative waypoints, not walking directions or a real-world navigation guide. */
type Route = {
  id: 'a' | 'b'; label: string; alternative: string; reply: string;
  guide: string; setting: string; guidePrompt: string; guideTranslation: string;
  confirm: string[]; clarifyReply: string;
  direction: string; directionEs: string; directionHelp: string;
  correctDirection: string[]; incorrectDirection: string; directionExplanation: string;
  arrival: string; endA: string; endB: string;
};
type Story = {
  id: string; title: string; introduction: string; contact: string; friend: string;
  place: string; meetingPoint: string; wrongPlace: string; meetingPointEs: string;
  personPrompt: string; identifyPrompt: string; identifyTranslation: string;
  invitation: string; clue: string; nearTranslation: string;
  askAccepted: string[]; askIncorrect: string;
  routePrompt: string; routeTranslation: string; paths: [Route, Route];
};
const choice = (base: Omit<ChoiceExercise, 'kind'>): ChoiceExercise => ({ kind: 'choice', ...base });
const text = (base: Omit<TextExercise, 'kind'>): TextExercise => ({
  kind: 'text', writtenRules: [],
  unknownExplanation: 'No puedo comprobar esta formulación con las equivalencias revisadas. No significa que tu francés sea incorrecto. Podés reformular o consultar las pistas.',
  unknownSpokenExplanation: 'No puedo confirmar esa expresión con seguridad. Podés reformularla o consultar la ayuda escrita.',
  spokenExplanation: 'La respuesta es válida en esta situación. Podés usar también las expresiones enseñadas.',
  ...base,
});
const opt = (id: string, label: string, correct: boolean, next: string | null, explanation: string, reply = ''): ChoiceOption => ({
  id, label, correct, next: correct ? next : null, explanation, reply: correct ? reply : '',
  spokenExplanation: correct ? 'Comprendiste la situación y la conversación puede continuar.' : 'Esta respuesta no coincide con la información que dio el personaje.',
});
const stories: Story[] = [
  {
    id: 'jardin-bleu', title: 'Un message au jardin · Luxembourg',
    introduction: 'Llegás al Jardín de Luxemburgo para encontrarte con Inès, tu amiga. El teléfono se queda sin batería justo después de recibir su último mensaje. Aún recordás que mencionó una fuente.',
    contact: 'Juliette', friend: 'Inès', place: 'la fontaine', meetingPoint: 'la fontaine Médicis', wrongPlace: 'la gare', meetingPointEs: 'la fuente Médicis',
    personPrompt: 'Bonjour ! Bienvenue au jardin !',
    identifyPrompt: 'Votre amie attend près de la fontaine Médicis. Vous cherchez quel endroit ?',
    identifyTranslation: 'Tu amiga espera cerca de la fuente Médicis. ¿Qué lugar buscás?',
    invitation: 'Oui, j’ai rendez-vous ici.',
    clue: 'La fontaine est tout près. Ce n’est pas loin.', nearTranslation: 'La fuente está muy cerca. No queda lejos.',
    askAccepted: ['Où est la fontaine ?', 'Où est la fontaine, s’il vous plaît ?', 'La fontaine, c’est où ?', 'Excusez-moi, où est la fontaine ?', 'Où est la fontaine Médicis ?'],
    askIncorrect: 'Où est la gare ?',
    routePrompt: 'Deux chemins : sous les arbres ou près des fleurs. Vous préférez lequel ?', routeTranslation: 'Hay dos caminos: bajo los árboles o junto a las flores. ¿Cuál preferís?',
    paths: [
      {
        id: 'a', label: 'Sous les arbres, s’il vous plaît.', alternative: 'Je préfère les arbres.',
        reply: 'D’accord ! Suivez le sentier des arbres. Adrien travaille près du banc vert. → ¡De acuerdo! Seguí el sendero de los árboles. Adrien trabaja cerca del banco verde.',
        guide: 'Adrien', setting: 'Entrás bajo los árboles. Adrien, un jardinero tranquilo, está regando unas plantas al lado de un banco verde.',
        guidePrompt: 'Bonjour ! Vous cherchez la fontaine ? Elle est après le banc vert.', guideTranslation: '¡Hola! ¿Buscás la fuente? Está después del banco verde.',
        confirm: ['Je vais tout droit ?', 'Tout droit ?', 'Je dois aller tout droit ?', 'Je continue tout droit ?'],
        clarifyReply: 'Oui. Allez tout droit, puis tournez à gauche au banc vert. → Sí. Seguí recto y girá a la izquierda en el banco verde.',
        direction: 'Allez tout droit, puis tournez à gauche au banc vert.', directionEs: 'Seguí recto y luego girá a la izquierda en el banco verde.',
        directionHelp: 'Tout droit = recto. À gauche = a la izquierda. À droite = a la derecha.',
        correctDirection: ['Tout droit, puis à gauche.', 'Je vais tout droit, puis à gauche.'],
        incorrectDirection: 'Tout droit, puis à droite.', directionExplanation: 'Adrien dijo à gauche (izquierda), no à droite (derecha).',
        arrival: 'Seguís el banco verde, girás a la izquierda y encontrás a Inès junto al agua de la fuente. Ella te hace una seña sonriente.',
        endA: 'Super ! On regarde les dessins près de la fontaine. → ¡Genial! Miremos los dibujos junto a la fuente.',
        endB: 'Bonne idée ! On fait une petite promenade. → ¡Buena idea! Demos un pequeño paseo.',
      },
      {
        id: 'b', label: 'Près des fleurs, s’il vous plaît.', alternative: 'Je préfère les fleurs.',
        reply: 'Très bien ! Prenez le chemin des fleurs. Nadia est près du petit portail. → ¡Muy bien! Tomá el camino de las flores. Nadia está cerca del portón pequeño.',
        guide: 'Nadia', setting: 'El camino huele a flores. Nadia, una fotógrafa entusiasta, prepara una foto al lado de un portón pequeño.',
        guidePrompt: 'Salut ! La fontaine est après le petit portail.', guideTranslation: '¡Hola! La fuente está después del portón pequeño.',
        confirm: ['Je tourne à droite ?', 'À droite ?', 'Je dois tourner à droite ?', 'C’est à droite ?'],
        clarifyReply: 'Oui. Passez le portail, puis tournez à droite. → Sí. Pasá el portón y girá a la derecha.',
        direction: 'Passez le portail, puis tournez à droite.', directionEs: 'Pasá el portón y luego girá a la derecha.',
        directionHelp: 'Passez = pasá. Portail = portón. Tournez à droite = girá a la derecha.',
        correctDirection: ['Je passe le portail, puis à droite.', 'Le portail, puis à droite.'],
        incorrectDirection: 'Le portail, puis à gauche.', directionExplanation: 'Nadia indicó à droite (derecha), no à gauche (izquierda).',
        arrival: 'Pasás el portón y doblás a la derecha. Inès está esperando cerca de la fuente y sostiene un pequeño cuaderno de dibujos.',
        endA: 'Avec plaisir ! Viens voir mon carnet de dessins. → ¡Con gusto! Vení a ver mi cuaderno de dibujos.',
        endB: 'Oui ! On peut marcher dans le jardin. → ¡Sí! Podemos caminar por el jardín.',
      },
    ],
  },
  {
    id: 'quai-des-cartes', title: 'La carte postale · La Seine',
    introduction: 'A la orilla del Sena quedaste en encontrarte con Émile para intercambiar postales. El último mensaje dice «près du kiosque vert», pero hay varios puestos y el ruido del río dificulta orientarte.',
    contact: 'Margot', friend: 'Émile', place: 'le kiosque vert', meetingPoint: 'le kiosque vert', wrongPlace: 'la station de métro', meetingPointEs: 'el quiosco verde',
    personPrompt: 'Bonsoir ! Bienvenue sur les quais !',
    identifyPrompt: 'Votre ami est près du kiosque vert. Quel endroit cherchez-vous ?',
    identifyTranslation: 'Tu amigo está cerca del quiosco verde. ¿Qué lugar buscás?',
    invitation: 'Oui, j’ai rendez-vous ici.',
    clue: 'Le kiosque n’est pas loin. Il est près du pont.', nearTranslation: 'El quiosco no está lejos. Está cerca del puente.',
    askAccepted: ['Où est le kiosque vert ?', 'Où est le kiosque, s’il vous plaît ?', 'Le kiosque, c’est où ?', 'Excusez-moi, où est le kiosque ?', 'Où se trouve le kiosque vert ?'],
    askIncorrect: 'Où est la station de métro ?',
    routePrompt: 'Vous pouvez passer près du pont ou par les bouquinistes. Quel chemin choisissez-vous ?', routeTranslation: 'Podés ir junto al puente o por los puestos de libros. ¿Qué camino elegís?',
    paths: [
      {
        id: 'a', label: 'Près du pont, s’il vous plaît.', alternative: 'Je préfère le pont.',
        reply: 'Parfait ! Allez vers le pont. Hugo attend près de la rambarde. → ¡Perfecto! Andá hacia el puente. Hugo está cerca de la baranda.',
        guide: 'Hugo', setting: 'Se escucha el agua bajo el puente. Hugo, un músico alegre, guarda su violín junto a la baranda.',
        guidePrompt: 'Bonsoir ! Le kiosque vert est après le pont.', guideTranslation: '¡Buenas noches! El quiosco verde está después del puente.',
        confirm: ['Je vais tout droit ?', 'Tout droit ?', 'Je continue tout droit ?', 'Je dois aller tout droit ?'],
        clarifyReply: 'Oui. Allez tout droit, puis tournez à droite après le pont. → Sí. Seguí recto y doblá a la derecha después del puente.',
        direction: 'Allez tout droit, puis tournez à droite après le pont.', directionEs: 'Seguí recto y girá a la derecha después del puente.',
        directionHelp: 'Après = después de. Pont = puente. À droite = derecha.',
        correctDirection: ['Tout droit, puis à droite.', 'Je vais tout droit, puis à droite.'],
        incorrectDirection: 'Tout droit, puis à gauche.', directionExplanation: 'Hugo dijo à droite (derecha); à gauche sería la dirección equivocada.',
        arrival: 'Pasás el puente siguiendo la baranda y reconocés el quiosco verde. Émile te espera con dos postales bajo el brazo.',
        endA: 'Très bien ! Regardons les cartes postales. → ¡Muy bien! Veamos las postales.',
        endB: 'Bonne idée ! Marchons près de la Seine. → ¡Buena idea! Caminemos junto al Sena.',
      },
      {
        id: 'b', label: 'Par les bouquinistes, s’il vous plaît.', alternative: 'Je préfère les livres.',
        reply: 'Bonne idée ! Suivez les livres. Zoé vend des cartes près du panneau bleu. → ¡Buena idea! Seguí los libros. Zoé vende tarjetas cerca del letrero azul.',
        guide: 'Zoé', setting: 'Hay dibujos y libros antiguos en los puestos. Zoé, una vendedora muy conversadora, ordena postales junto a un letrero azul.',
        guidePrompt: 'Bonjour ! Le kiosque est après le panneau bleu.', guideTranslation: '¡Hola! El quiosco está después del letrero azul.',
        confirm: ['Je tourne à gauche ?', 'À gauche ?', 'Je dois tourner à gauche ?', 'C’est à gauche ?'],
        clarifyReply: 'Oui. Passez le panneau bleu, puis tournez à gauche. → Sí. Pasá el letrero azul y girá a la izquierda.',
        direction: 'Passez le panneau bleu, puis tournez à gauche.', directionEs: 'Pasá el letrero azul y girá a la izquierda.',
        directionHelp: 'Panneau = letrero. Tournez à gauche = girá a la izquierda.',
        correctDirection: ['Le panneau bleu, puis à gauche.', 'Je passe le panneau, puis à gauche.'],
        incorrectDirection: 'Le panneau bleu, puis à droite.', directionExplanation: 'Zoé indicó à gauche (izquierda), no à droite (derecha).',
        arrival: 'Dejás atrás el letrero azul, doblás a la izquierda y encontrás a Émile junto al quiosco verde. Te muestra una postal ilustrada.',
        endA: 'Super ! Voici mes nouvelles cartes postales. → ¡Genial! Acá están mis nuevas postales.',
        endB: 'Avec plaisir ! On se promène au bord de l’eau. → ¡Con gusto! Caminemos junto al agua.',
      },
    ],
  },
];
const objectives = ['saluer', 'confirmer-rendezvous', 'reconnaitre-lieu', 'demander-direction', 'comprendre-distance', 'choisir-chemin', 'verifier-indication', 'suivre-indications', 'retrouver-ami', 'decider-activite'];
const variantFor = (story: Story): LessonVariant => {
  const common: (ChoiceExercise | TextExercise)[] = [
    choice({ id: 'greet', objectiveId: 'saluer', title: 'Primera conversación', scene: story.introduction, speaker: story.contact,
      prompt: story.personPrompt, promptTranslation: story.id === 'jardin-bleu' ? '¡Hola! ¡Bienvenido al jardín!' : '¡Buenas noches! ¡Bienvenido a la ribera!', teaching: 'Bonjour = hola; bonsoir = buenas tardes/noches. Respondé con un saludo.', instruction: 'Saludá a la persona.', explanation: 'Un saludo inicia la conversación.', correction: 'Bonjour !',
      choices: [opt('greeting', story.id === 'jardin-bleu' ? 'Bonjour !' : 'Bonsoir !', true, 'confirm', 'Elegiste un saludo apropiado para la escena.', story.id === 'jardin-bleu' ? 'Bonjour ! Je vous écoute. → ¡Hola! Te escucho.' : 'Bonsoir ! Je vous écoute. → ¡Buenas noches! Te escucho.'), opt('polite-greeting', story.id === 'jardin-bleu' ? 'Bonjour, excusez-moi.' : 'Bonsoir, excusez-moi.', true, 'confirm', 'El saludo con excusez-moi es una forma cortés de iniciar la conversación.', 'Je vous écoute. → Te escucho.'), opt('silence', 'Je ne parle pas.', false, null, 'No responde al saludo. Podés comenzar con Bonjour o Bonsoir.')] }),
    text({ id: 'confirm', objectiveId: 'confirmer-rendezvous', title: 'Confirmar el encuentro', scene: 'Tu teléfono está sin batería. Necesitás explicar por qué estás aquí.', speaker: story.contact,
      prompt: 'Vous avez rendez-vous ici ?', promptTranslation: '¿Tenés una cita/encuentro aquí?', teaching: "Rendez-vous = encuentro/cita. J'ai rendez-vous ici = tengo una cita aquí. Podés añadir avec un ami / une amie.", instruction: 'Confirmá que quedaste en encontrarte con alguien.', explanation: 'Confirmaste el encuentro usando una expresión frecuente.', correction: "Oui, j'ai rendez-vous ici.",
      accepted: ["Oui, j'ai rendez-vous ici.", "Oui, j'ai rendez-vous.", story.id === 'jardin-bleu' ? "Oui, j'attends une amie." : "Oui, j'attends un ami.", "J'ai rendez-vous ici.", story.id === 'jardin-bleu' ? "Oui, je cherche une amie." : "Oui, je cherche un ami."],
      writtenRules: [{ input: "Non, je n'ai pas rendez-vous.", issue: 'vocabulary', explanation: 'Non niega el encuentro; en esta historia sí tenés una cita.', spokenExplanation: 'Esa frase niega el encuentro; en esta historia sí tenés una cita.' }, { input: 'Je rendez-vous ici.', issue: 'structure', explanation: "Falta el verbo avoir: se dice j'ai rendez-vous.", spokenExplanation: 'En esta expresión se usa el verbo tener antes de cita.' }],
      acceptedFeedback: [{input:story.id === 'jardin-bleu' ? "Oui, j'attends une amie." : "Oui, j'attends un ami.",explanation:'También es correcto decir que estás esperando a la persona con quien quedaste.',spokenExplanation:'Decir que esperás a alguien es una respuesta válida.'}],
      next: 'identify', reply: 'Très bien. Je peux vous aider. → Muy bien. Puedo ayudarte.' }),
    choice({ id: 'identify', objectiveId: 'reconnaitre-lieu', title: 'Leer la pista', scene: 'Recordás el mensaje antes de que se apagara el teléfono.', speaker: story.contact,
      prompt: story.id === 'jardin-bleu' ? story.identifyPrompt : story.identifyPrompt.replace('Votre amie', 'Votre ami'), promptTranslation: story.identifyTranslation, teaching: `${story.meetingPoint} = ${story.meetingPointEs}. Buscá ese lugar, no otro.`, instruction: 'Identificá el lugar mencionado.', explanation: 'Reconociste el lugar donde te esperan.', correction: story.meetingPoint,
      choices: [opt('meeting-point', story.meetingPoint.charAt(0).toUpperCase()+story.meetingPoint.slice(1)+'.', true, 'ask', 'Identificaste el lugar correcto del mensaje.', 'Oui, exactement ! → Sí, exactamente.'), opt('wrong-place', story.wrongPlace.charAt(0).toUpperCase()+story.wrongPlace.slice(1)+'.', false, null, `No: la pista menciona ${story.meetingPoint}, no ${story.wrongPlace}.`)] }),
    text({ id: 'ask', objectiveId: 'demander-direction', title: 'Pedir una dirección', scene: 'La persona te mira con atención. Es tu oportunidad de pedir indicaciones.', speaker: story.contact,
      prompt: 'Je connais bien cet endroit. Dites-moi.', promptTranslation: 'Conozco bien este lugar. Decime.', teaching: `Où est… ? = ¿Dónde está…? S'il vous plaît = por favor. Por ejemplo: ${story.askAccepted[1]}.`, instruction: `Preguntá dónde está ${story.meetingPointEs}.`, explanation: 'Où pregunta por un lugar. Agregar s’il vous plaît hace la pregunta más cortés.', correction: story.askAccepted[1]!,
      accepted: story.askAccepted, acceptedFeedback: [{input: story.askAccepted[0]!,explanation:'La pregunta es correcta. Añadir s’il vous plaît puede hacerla más cortés.',spokenExplanation:'La pregunta es correcta; podés añadir por favor para sonar más cortés.'}],
      writtenRules: [{input:story.askIncorrect,issue:'vocabulary',explanation:`Tu pregunta se refiere a ${story.wrongPlace}, pero buscás ${story.meetingPoint}.`,spokenExplanation:'Esa pregunta menciona otro lugar. Revisá la pista de tu destino.'}, {input:'Où est le Paris ?',issue:'structure',explanation:'Para preguntar por el lugar, usá el nombre del destino con su artículo correcto.',spokenExplanation:'Revisá el nombre del lugar y su artículo.'}],
      next: 'distance', reply: 'Bien sûr ! → ¡Claro!' }),
    choice({ id: 'distance', objectiveId: 'comprendre-distance', title: '¿Está lejos?', scene: 'La persona señala una referencia cercana.', speaker: story.contact,
      prompt: story.clue, promptTranslation: story.nearTranslation, teaching:'Tout près = muy cerca; pas loin = no lejos; loin = lejos. Ambas pistas significan que podés llegar caminando.', instruction:'Respondé según la distancia indicada.', explanation:'Entendiste que el destino está cerca.', correction:'C’est près.',
      choices:[opt('near', 'C’est près.', true, 'route', 'Correcto: près es cerca. Pas loin también significa que no queda lejos.', 'Oui, c’est près. → Sí, está cerca.'),opt('not-far','Ce n’est pas loin.',true,'route','Correcto: pas loin significa que no está lejos.','Exactement ! → ¡Exactamente!'),opt('far','C’est très loin.',false,null,'Très loin significa muy lejos; el personaje dijo que el lugar está cerca.')] }),
    choice({ id:'route', objectiveId:'choisir-chemin', title:'Elegir cómo llegar', scene:'Tenés dos caminos posibles; cada uno te llevará a pedir ayuda a una persona distinta.', speaker:story.contact,
      prompt: story.routePrompt, promptTranslation: story.routeTranslation, teaching:'Je préfère = prefiero. S’il vous plaît = por favor. Las dos rutas son válidas y cambian lo que ocurre después.', instruction:'Elegí el camino que prefieras.', explanation:'Una decisión cambia quién te ayuda y las indicaciones que recibirás.', correction:story.paths[0].label,
      choices:story.paths.flatMap(route => [opt(`route-${route.id}`,route.label,true,`clarify-${route.id}`,`Elegiste el camino ${route.id === 'a'?'primero':'alternativo'}.`,route.reply), opt(`route-${route.id}-alt`,route.alternative,true,`clarify-${route.id}`,'Esta variante expresa la misma preferencia.',route.reply)]) }),
  ];
  for(const route of story.paths) {
    common.push(text({ id:`clarify-${route.id}`,objectiveId:'verifier-indication',title:'Aclarar la ruta',scene:route.setting,speaker:route.guide,
      prompt:route.guidePrompt,promptTranslation:route.guideTranslation,
      teaching:`Confirmar con una pregunta corta es natural: ${route.confirm[0]}. Tout droit = recto; gauche = izquierda; droite = derecha.`,instruction:'Pedí confirmación del primer movimiento.',explanation:'Verificaste una indicación antes de avanzar. Una pregunta breve también puede ser cortés.',correction:route.confirm[0]!,accepted:route.confirm,next:`follow-${route.id}`,reply:route.clarifyReply,
      writtenRules:[{input:route.id==='a'?'Je tourne à droite ?':'Je vais en arrière ?',issue:'vocabulary',explanation:'Esa pregunta no confirma el movimiento señalado en este recorrido. Revisá la indicación.',spokenExplanation:'Tu pregunta describe otro movimiento. Revisá la ruta.'}] }));
    common.push(choice({id:`follow-${route.id}`,objectiveId:'suivre-indications',title:'Seguir las indicaciones',scene:'Escuchás la instrucción una vez más. Ahora elegí qué camino seguir.',speaker:route.guide,
      prompt:route.direction,promptTranslation:route.directionEs,teaching:route.directionHelp,instruction:'Identificá los pasos correctos.',explanation:'Reconociste las direcciones y llegaste a la referencia indicada.',correction:route.correctDirection[0]!,choices:[...route.correctDirection.map((label,index)=>opt(`direction-${route.id}-${index}`,label,true,`meet-${route.id}`,'Seguiste la dirección correcta.',`Voilà, bon chemin ! → ¡Muy bien, buen camino!`)),opt(`wrong-${route.id}`,route.incorrectDirection,false,null,route.directionExplanation)]}));
    common.push(text({id:`meet-${route.id}`,objectiveId:'retrouver-ami',title:'Por fin, el encuentro',scene:route.arrival,speaker:story.friend,
      prompt:'Ah, te voilà ! Ça va ?',promptTranslation:'¡Ah, acá estás! ¿Cómo estás?',teaching:'Ça va ? = ¿Cómo estás? Oui, ça va = sí, estoy bien. Merci = gracias. Responder brevemente es natural.',instruction:'Saludá y respondé cómo estás.',explanation:'Una respuesta sencilla y amable sirve para reunirse con una amistad.',correction:'Oui, ça va, merci !',accepted:['Oui, ça va, merci !','Ça va, merci.','Oui, je vais bien, merci.','Je vais bien, merci.','Très bien, merci !','Salut ! Ça va !'],next:`plan-${route.id}`,reply: story.id === 'jardin-bleu' ? 'Super ! Je suis contente de te voir. → ¡Genial! Me alegra verte.' : 'Super ! Je suis content de te voir. → ¡Genial! Me alegra verte.'}));
    common.push(choice({id:`plan-${route.id}`,objectiveId:'decider-activite',title:'El siguiente capítulo',scene:'Ya no necesitás indicaciones. Ahora pueden decidir qué hacer juntos.',speaker:story.friend,
      prompt:'On fait quoi maintenant ?',promptTranslation:'¿Qué hacemos ahora?',teaching:'On regarde = miramos. On se promène = damos un paseo. Bonne idée = buena idea. Elegí una opción que tenga sentido.',instruction:'Elegí una actividad para cerrar el encuentro.',explanation:'Elegiste una actividad y terminaste la conversación de forma natural.',correction:'Bonne idée !',
      choices:[opt(`draw-${route.id}`,story.id === 'jardin-bleu' ? 'On regarde les dessins ?' : 'On regarde les cartes postales ?',true,null,'Propusiste mirar dibujos o postales; una pregunta sencilla y natural.',route.endA),opt(`walk-${route.id}`,'On se promène ?',true,null,'Propusiste caminar; una pregunta sencilla y natural.',route.endB),opt(`goodbye-${route.id}`,'Je cherche la gare.',false,null,'Esa frase no propone una actividad y no encaja con la situación.')] }));
  }
  return {id:story.id,title:story.title,start:'greet',exercises:common};
};
export const rendezvousLesson: Lesson = validateLesson({
  schemaVersion:1,version:1,id:'fr-a1-paris-rendezvous',title:'Un rendez-vous à Paris',language:'fr',level:'A1',objectives,variants:stories.map(variantFor),
});
export function rendezvousLessonForProgress(progress: import('../domain/learning/models').MissionProgress | null) {
  if (progress && (progress.lessonId !== rendezvousLesson.id || progress.contentVersion !== 1)) throw Error('Versión de encuentro desconocida');
  return rendezvousLesson;
}
