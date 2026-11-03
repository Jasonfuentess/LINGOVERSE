import type { CoachLocale } from '../domain/preferences';
import type { EditorialReaction, HumorCategory } from '../domain/humor/models';
import { roastTeaching } from './roastTeaching';
import { humorReferences, referenceReactions } from './humorReferences';

// Whole editorial lines, never assembled from interchangeable insult fragments.
const texts: Record<CoachLocale, Record<HumorCategory, string[]>> = {
  'es-SV': {
    general: ['Va, maje, aquí la broma lleva filo, pero la ayuda no se esconde.', 'Sin pena, cerote: el francés se practica, no se adivina por decreto.', 'La pista está servida, maje; no la dejés enfriar.'],
    error: ['¡Puta, maje! Esa respuesta agarró otro bus. Mirá la corrección antes de subirte otra vez.', 'No jodás, cerote, el pedido se nos fue de paseo. La ayuda sí sabe dónde queda la mesa.', 'Va, esa frase cayó en la taza equivocada. Leé la pista y rescatamos el café.'],
    retry: ['Otra vuelta, maje. No me repitás el desvío como si fuera ruta turística.', 'Ese botón ya te conoce, cerote. Cambiá la respuesta, que paciencia sí hay.', 'Va de nuevo: la corrección no es decoración de cafetería.'],
    recurring: ['Este objetivo ya tiene varios errores registrados, maje. La pista va a pedir alquiler de tanto acompañarnos.', 'No jodás, este punto ya nos hizo dar varias vueltas. Vamos palabra por palabra.', 'El historial sí tiene estos tropiezos, cerote; no es chisme mío. Revisemos la ayuda.'],
    recovery: ['¡Puta, maje, ahora sí! Usaste la corrección y sacaste la frase del tráfico.', '¡Cabal, cerote! Esta vez corregiste el desvío; ya puede descansar la pista.', 'Ese ajuste sí sirvió, maje. El error quedó atrás en este paso.'],
    correct: ['¡Puta, maje, cabal! Esa respuesta llegó con el pedido completo.', '¡Bien, cerote! Ni hubo que mandar a buscar la frase al mercado.', 'Te salió, maje. Voy guardando el sermón para otro intento.'],
    progress: ['Otro tramo confirmado, maje. Falta conversación: no te vayás con la taza todavía.', 'Ya avanzaste, cerote. Ahora otra escena, que el café no era el examen entero.', 'Va, más pasos completos. La siguiente pista ya está esperando su turno.'],
    celebration: ['¡Puta, maje, recorrido completo! Ocho interacciones, no un diploma caído del cielo.', '¡Cabal, cerote! Cerraste la conversación; la taza ya puede jubilarse.', 'Terminaste, maje. Hoy hubo práctica de verdad y el regaño se quedó sin turno.'],
  },
  'es-MX': {
    general: ['A ver, cabrón: aquí se afila la frase, no se presume el diccionario.', 'Pásale al taller del francés; hay carrilla y también instrucciones.', 'La pista está puesta. No hace falta repararla con cinta canela.'],
    error: ['No manches, esa pieza no entra en este pedido. Revisa la corrección antes de sacar el martillo.', 'Chingado, el francés agarró la salida equivocada. La ayuda trae el mapa.', 'Esa frase quedó chueca, pero no vamos a tirar todo el mueble. Mira el ajuste.'],
    retry: ['Otra vez al banco de trabajo. Leer la pista sale más barato que adivinar.', 'No le aprietes igual, cabrón: cambia la respuesta y revisamos el encaje.', 'Ya dimos otra vuelta. La corrección no venía de adorno en la caja.'],
    recurring: ['Este objetivo ya acumula varios errores registrados. Hasta el martillo pide que leamos el manual.', 'Aquí hay tropiezos repetidos, cabrón. Vamos a ajustar una pieza por vez.', 'Este punto ya volvió al taller varias veces. La pista merece una revisión con calma.'],
    recovery: ['¡Ahora sí, cabrón! Usaste la corrección y la pieza dejó de bailar.', 'Ese ajuste sí quedó. El intento anterior ya tiene reparación, sin cinta milagrosa.', '¡Órale! Corregiste el paso; guardamos el martillo y seguimos.'],
    correct: ['¡Órale, cabrón! Quedó a la medida y sin piezas sobrantes.', 'No manches, esa respuesta entró derechita. El manual puede respirar.', 'Bien resuelto. Ya estaba preparando la caja de herramientas y ni hizo falta.'],
    progress: ['Otro tramo confirmado. Falta camino, no te me vayas a cobrar la obra todavía.', 'La conversación ya tiene más piezas. Ahora viene otro ajuste, sin prisas.', 'Ya avanzaste, cabrón. El siguiente reto no se instala solo.'],
    celebration: ['¡A huevo, recorrido completo! Ocho interacciones; el título de experto todavía no viene en la caja.', 'Cerraste la conversación, cabrón. Herramientas guardadas y práctica hecha.', '¡Órale, terminaste! Esta chamba sí llegó hasta la despedida.'],
  },
  'es-CO': {
    general: ['Parce, aquí hay recocha y pista escrita. No dejemos que el afán escriba el pedido.', 'Vamos sin afán: la corrección no cobra por segunda lectura.', 'Qué vaina tan seria ese francés; le bajamos el drama y miramos la ayuda.'],
    error: ['Uy, parce, esa respuesta se fue a otro capítulo. La corrección cuenta cómo volver.', 'Qué vaina, el pedido salió con trama distinta. Miremos la pista antes del desenlace.', 'Esa frase armó tremendo enredo. Tranqui, la ayuda trae el hilo.'],
    retry: ['Otra vuelta al cuento, parce. Pero esta vez leamos la pista, que no es publicidad.', 'No joda, la respuesta volvió por el mismo atajo. Cambiemos de camino con la ayuda.', 'Va otro intento. El afán ya participó y no nos resolvió la escena.'],
    recurring: ['Este objetivo ya tiene varios errores registrados, parce. La vaina pide pausa, no más velocidad.', 'Este enredo sí aparece varias veces en el historial. Vamos a desatarlo con la pista.', 'Hay tropiezos repetidos aquí. Hasta el narrador está pidiendo que revisemos la ayuda.'],
    recovery: ['¡Eso, parce! Corregiste el paso y le quitaste el nudo al cuento.', 'Ahora sí, qué nota. La ayuda hizo su trabajo y el enredo perdió protagonismo.', 'Esa revisión funcionó. El error ya tiene su giro de trama resuelto.'],
    correct: ['¡Uy, qué nota! Esa respuesta llegó sin novela de veinte capítulos.', 'Bacano, parce. El pedido quedó claro; el drama se quedó sin libreto.', 'Bien resuelto. Yo listo para narrar el enredo y vos cerrando la escena de una.'],
    progress: ['Otro tramo del cuento confirmado, parce. Falta capítulo, no guardemos el libro.', 'Ya hay más conversación resuelta. El siguiente reto viene sin afán, pero viene.', 'Seguimos, que el café todavía tiene historia y la pista sigue de turno.'],
    celebration: ['¡Qué nota, parce, terminaste! Ocho interacciones; nada de vender ahora un diploma de francés.', 'Cerraste este cuento de práctica. Hasta el enredo se quedó sin capítulo.', 'Recorrido completo, qué berraca vuelta. Hubo ayuda, práctica y despedida.'],
  },
  'es-AR': {
    general: ['Che, acá hay bardo consentido y ayuda escrita. La solemnidad espera afuera.', 'Dale, probá con la pista. El francés no necesita una conferencia de prensa.', 'Bajemos un cambio: el diccionario no te está tomando declaración.'],
    error: ['La puta madre, esa respuesta se fue de gira. Mirá la corrección y traela al café.', 'Che, la frase agarró cualquier bondi. La ayuda marca dónde bajar.', 'Ese pedido terminó en otra película. Revisá la pista antes de escribir la secuela.'],
    retry: ['Dale otra vez, pero no le demos al mismo desvío categoría de tradición.', 'Otra vuelta, che. La corrección está ahí, no es escenografía.', 'No jodamos, el botón ya hizo su parte. Ahora miremos la palabra que falta.'],
    recurring: ['Este objetivo ya suma varios errores registrados. El desvío está pidiendo nombre de avenida.', 'Che, este punto se repite en el historial. Bajemos un cambio y usemos la pista.', 'Hay varios tropiezos acá, no una maldición francesa. Vamos por partes.'],
    recovery: ['¡Ahora sí, carajo! Corregiste el paso y la frase encontró la puerta.', 'Bien ahí: usaste la ayuda. Se suspende la asamblea extraordinaria del error.', 'Ese cambio funcionó, che. El intento anterior ya tiene arreglo.'],
    correct: ['¡Bien ahí, carajo! La frase entró y ni pidió permiso para hacer drama.', 'Mirá vos, respuesta correcta. Me dejaste el comentario solemne sin estrenar.', 'Bárbaro, che. El pedido quedó claro sin convocar a todo el café.'],
    progress: ['Otro tramo confirmado. No levantemos la copa todavía, que falta conversación.', 'Dale, ya hay más camino hecho. Viene otro reto; el francés no se toma recreo eterno.', 'Seguimos, che. El siguiente paso también trae pista, no una emboscada.'],
    celebration: ['¡Terminaste, carajo! Ocho interacciones; no salgamos a imprimir un doctorado.', 'Recorrido cerrado, che. Aplauso breve, café imaginario y práctica real.', 'Bárbaro, llegaste a la despedida. La solemnidad puede volver a su casa.'],
  },
};
export const roastLibrary: EditorialReaction[] = Object.entries(texts).flatMap(([locale, categories]) => Object.entries(categories).flatMap(([category, lines]) => lines.map((text, index) => ({
  version: 1, id: `roast-v1:${locale}:${category}:${index + 1}`, locale: locale as CoachLocale, category: category as HumorCategory, mode: 'roast', intensity: 'playful', explicit: true, text,
}))));

const writtenLines = {
  'es-SV': {
    spelling: ['¡Puta, chichi, la cagaste! Aquí se nos torció la escritura, no todo el francés.', '¡No hay pedo, maje! Hay un detalle escrito que arreglar; el diccionario todavía no ha llamado a la policía.'],
    vocabulary: ['¡Puta, maje! Esa expresión hace otro mandado; aquí necesitamos la que corresponde a esta escena.', 'Maje, esa palabra sí existe, pero entró a trabajar al turno equivocado.'],
    structure: ['¡No hay pedo, maje! A esa pregunta le falta una pieza; no se cayó toda la cafetería.', 'Cerote, esa frase salió antes de terminar de vestirse. Completémosla con la ayuda.'],
  },
  'es-MX': {
    spelling: ['No manches, la escritura dejó un tornillo suelto. Vamos a ajustarlo.', 'Chingado, las letras se movieron del plano. La corrección trae las medidas.'],
    vocabulary: ['Esa expresión sirve para otra cosa, cabrón. Trajimos martillo para una tarea de destornillador.', 'No manches, esa palabra llegó al mostrador de otro trámite.'],
    structure: ['La pregunta salió sin una pieza, cabrón. Así no termina de armarse.', 'No manches, falta completar la estructura; todavía no guardes las herramientas.'],
  },
  'es-CO': {
    spelling: ['Uy, parce, la escritura se enredó en una curva. Vamos a desenredarla.', 'Qué vaina, hay un detalle de letras que corregir; no hace falta reescribir todo el cuento.'],
    vocabulary: ['Parce, esa expresión cuenta otro capítulo. Aquí toca una intención distinta.', 'No joda, esa palabra se metió en una escena que no era la suya.'],
    structure: ['Parce, a esa pregunta le falta un pedazo del cuento.', 'Qué vaina, la frase salió antes del desenlace. Completemos la pregunta.'],
  },
  'es-AR': {
    spelling: ['Che, las letras hicieron su propio recorrido. Ordenemos la escritura.', 'La puta madre, un detalle escrito nos cambió el guion. Lo corregimos sin convocar una asamblea.'],
    vocabulary: ['Che, esa expresión labura de otra cosa. Acá la contratamos para el puesto equivocado.', 'Esa palabra entró en otra película, carajo. Revisemos qué necesitamos decir.'],
    structure: ['Che, la pregunta salió incompleta. Le falta una pieza, no una temporada entera.', 'No jodamos, la frase cortó antes del final. Terminemos de armarla.'],
  },
};
for (const [locale, issues] of Object.entries(writtenLines)) for (const [issue, lines] of Object.entries(issues)) for (const category of ['error', 'retry', 'recurring'] as const) {
  lines.forEach((text, index) => roastLibrary.push({ version: 1, id: `roast-written-v1:${locale}:${category}:${issue}:${index}`, locale: locale as CoachLocale, category, mode: 'roast', intensity: 'playful', explicit: true, writtenIssue: issue as 'spelling' | 'vocabulary' | 'structure', text }));
}
roastLibrary.push(
  { version: 1, id: 'roast-written-v1:sv:correct', locale: 'es-SV', category: 'correct', mode: 'roast', intensity: 'playful', explicit: true, text: '¡Ahuevo, mi perrito! La expresión encaja; veamos qué estás diciendo con ella.' },
  { version: 1, id: 'roast-written-v1:sv:recovery', locale: 'es-SV', category: 'recovery', mode: 'roast', intensity: 'playful', explicit: true, text: '¡Ahora sí, cerote, ya te salió! Esta corrección sí puso la frase en su sitio.' },
);
roastLibrary.push(...roastTeaching);
roastLibrary.push(...referenceReactions);

// Editorial revision: retain old IDs for saved snapshots, select only the new editions.
const revisions: Record<string, string> = {
  'roast-v1:es-SV:retry:1': 'Va otra vez, maje. Leamos la ayuda antes de darle al botón; tampoco hay premio por contestar a la carrera.',
  'roast-v1:es-SV:recurring:1': 'Este objetivo ya nos ha costado varios intentos, maje. Hagamos una pausa y probemos con el ejemplo a la vista.',
  'roast-v1:es-SV:celebration:2': '¡Cabal, cerote! Llegaste hasta la despedida. Ahora sí: café pedido y conversación completa.',
  'roast-v1:es-MX:error:3': 'No manches, esta respuesta todavía no encaja. La corrección está aquí; no hace falta empezar toda la aventura otra vez.',
  'roast-v1:es-MX:correct:3': '¡Bien, cabrón! Esta sí quedó. Ahora leamos qué significa, que también veníamos a aprender.',
  'roast-v1:es-MX:progress:1': 'Ya llevas otro tramo, cabrón. Falta terminar la conversación; no te me vayas a media frase.',
  'roast-v1:es-CO:retry:2': 'No joda, parce, este intento tampoco salió. Miremos la ayuda con calma antes del siguiente.',
  'roast-v1:es-CO:correct:3': '¡Qué nota, parce! Esta respuesta sí encaja. Dejame disfrutar el acierto antes de pasar al siguiente reto.',
  'roast-v1:es-CO:celebration:3': '¡Terminaste, parce! Hubo intentos, ayuda y una conversación completa. Eso sí merece celebrar.',
  'roast-v1:es-AR:retry:1': 'Dale otra vez, che. Leamos la ayuda primero; apretar el botón más fuerte no cambia el francés.',
  'roast-v1:es-AR:recurring:1': 'Este objetivo ya sumó varios errores, che. No hace falta resolverlo a las corridas; probemos con el ejemplo.',
  'roast-v1:es-AR:general:3': 'Bajemos un cambio, che. Podés leer la ayuda todas las veces que haga falta; acá nadie te está cronometrando.',
};
for (const [id, text] of Object.entries(revisions)) {
  const original = roastLibrary.find(item => item.id === id);
  if (!original) throw Error(`Falta la reacción editorial ${id}`);
  original.retired = true;
  roastLibrary.push({ ...original, id: `${id}:revision2`, text, retired: false });
}

// Reuse existing lines whose actual text fits London; no new jokes or copied engine.
const englishCompatible = new Set([
  'es-SV:general:1','es-SV:general:3','es-SV:error:1','es-SV:retry:1:revision2','es-SV:retry:2','es-SV:recurring:2','es-SV:recurring:3','es-SV:recovery:1','es-SV:recovery:2','es-SV:recovery:3','es-SV:correct:2','es-SV:correct:3','es-SV:progress:3','es-SV:celebration:3',
  'es-MX:general:1','es-MX:general:3','es-MX:error:3:revision2','es-MX:retry:1','es-MX:retry:2','es-MX:retry:3','es-MX:recurring:1','es-MX:recurring:2','es-MX:recurring:3','es-MX:recovery:1','es-MX:recovery:2','es-MX:recovery:3','es-MX:correct:1','es-MX:correct:2','es-MX:correct:3:revision2','es-MX:progress:1:revision2','es-MX:progress:2','es-MX:progress:3','es-MX:celebration:2','es-MX:celebration:3',
  'es-CO:general:2','es-CO:error:1','es-CO:error:3','es-CO:retry:1','es-CO:retry:2:revision2','es-CO:retry:3','es-CO:recurring:1','es-CO:recurring:2','es-CO:recurring:3','es-CO:recovery:1','es-CO:recovery:2','es-CO:recovery:3','es-CO:correct:1','es-CO:correct:3:revision2','es-CO:progress:1','es-CO:celebration:3:revision2',
  'es-AR:general:1','es-AR:general:3:revision2','es-AR:error:2','es-AR:retry:2','es-AR:retry:3','es-AR:recurring:1:revision2','es-AR:recurring:2','es-AR:recovery:1','es-AR:recovery:2','es-AR:recovery:3','es-AR:correct:1','es-AR:correct:2','es-AR:progress:1','es-AR:progress:3','es-AR:celebration:3',
].map(id=>`roast-v1:${id}`));
for(const item of roastLibrary) {
  const reference=item.referenceId?humorReferences.find(source=>source.id===item.referenceId):null;
  item.learningLanguages=reference?[reference.language==='en'?'en':'fr']:englishCompatible.has(item.id)?['fr','en']:['fr'];
}
