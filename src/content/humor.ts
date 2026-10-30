import type { CoachLocale } from '../domain/preferences';
import type { Coach, EditorialReaction, HumorCategory } from '../domain/humor/models';
export const coaches: Coach[] = [
  { id: 'coach-luz-sv', locale: 'es-SV', name: 'Luz', personality: 'Cómplice de barrio, voseo y humor de pequeñas victorias; compara obstáculos con mandados cotidianos.', introduction: 'Va, aquí practicamos sin pena y sin andar inventando errores.' },
  { id: 'coach-tono-mx', locale: 'es-MX', name: 'Toño', personality: 'Ingenio de taller, paciencia y soluciones prácticas; celebra el proceso con humor directo.', introduction: 'Va que va. Una cosa a la vez y con espacio para equivocarse.' },
  { id: 'coach-vale-co', locale: 'es-CO', name: 'Vale', personality: 'Narradora cálida, ritmo tranquilo y complicidad; transforma la práctica en pequeñas historias.', introduction: 'Vamos con calma, parce. La corrección está para ayudar.' },
  { id: 'coach-romi-ar', locale: 'es-AR', name: 'Romi', personality: 'Ironía rioplatense suave y voseo; baja la solemnidad sin burlarse de la persona.', introduction: 'Dale, probemos. Acá las respuestas se revisan, no se juzga a nadie.' },
];
type RegionalTexts = Record<HumorCategory, string[]>;
const texts: Record<CoachLocale, RegionalTexts> = {
  'es-SV': {
    general: ['Va, mirá la ayuda con calma. Aquí no hay carrera.', 'Podés probar a tu ritmo; yo acompaño la práctica.', 'El francés puede esperar un ratito mientras ordenamos la idea.', 'Sin pena: este espacio también es para ensayar.'],
    correct: ['¡Cabal! Esa respuesta encaja con la conversación.', 'Qué chivo: resolviste este paso con la expresión adecuada.', 'Va, ese pedido pasó el mostrador sin hacer fila de nuevo.', '¡Bien ahí! La frase encontró su lugar, como vuelto en bolsillo pequeño.'],
    error: ['Va, esta respuesta no encaja todavía. Mirá la corrección y probá de nuevo.', 'La frase se nos fue por otra calle; la ayuda marca el regreso.', 'Nada de drama: este intento pide un pequeño ajuste.', 'Todavía no sale este paso, pero la pista no cobra por volverla a leer.'],
    retry: ['Otro intento, con calma. Podés usar la expresión que muestra la ayuda.', 'Va de nuevo: cambiemos la respuesta, no el ánimo.', 'Ya estamos dándole otra vuelta; esta vez revisá la palabra clave.', 'La pregunta sigue aquí, bien tranquila. Tomate tu tiempo para responder.'],
    recovery: ['¡Cabal, ahora sí! Corregiste la respuesta después del tropiezo.', 'Qué chivo: el reintento terminó en una respuesta correcta.', 'Va, encontraste la vuelta. La corrección sí hizo su mandado.', 'Esta vez encajó. Ese ajuste merece una sonrisa, aunque sea pequeña.'],
    recurring: ['Este objetivo ya sumó varios errores registrados; vamos por partes, sin pena.', 'Va, este punto está dando trabajo de verdad. La ayuda sigue disponible.', 'Ya hay varios tropiezos en este objetivo; no hace falta resolverlo a la carrera.', 'Este objetivo nos está haciendo dar vueltas. Revisemos la pista antes del siguiente intento.'],
    progress: ['Ya confirmaste más pasos. Vamos construyendo la conversación de a poquito.', 'Qué chivo ver el avance guardado. Todavía queda camino, sin prisa.', 'Otro tramo resuelto; el recorrido va tomando forma.', 'Va, ya llevás parte de la aventura en la bolsa. Seguimos paso a paso.'],
    celebration: ['¡Qué chivo! Completaste este recorrido de la aventura.', 'Va, misión cerrada. Hubo práctica de principio a fin.', '¡Cabal! Terminaste los pasos de esta conversación guiada.', 'Aventura completada; la celebración va por el recorrido, no por un diploma inventado.'],
  },
  'es-MX': {
    general: ['Va que va: tienes la ayuda a mano y puedes ir a tu ritmo.', 'Aquí se vale ensayar antes de soltar la frase.', 'Sin prisas; la respuesta no se va a escapar del cuaderno.', 'Hagamos espacio para practicar, sin convertirlo en examen sorpresa.'],
    correct: ['¡Órale, quedó! Esa respuesta corresponde a la situación.', 'Bien resuelto. La expresión tiene justo la pieza que necesitaba.', 'Esa frase quedó alineada; no hubo que sacarle la cinta métrica.', 'Va que va, este paso ya tiene respuesta correcta.'],
    error: ['Esta no corresponde todavía. La corrección muestra cómo ajustarla.', 'Aguas con la expresión: revisa la ayuda y vuelve a intentar.', 'La respuesta tomó un desvío; podemos revisarla sin hacer un drama.', 'La respuesta necesita ajuste, como puerta que roza: poquito a poco.'],
    retry: ['Vamos con otro intento. Esta vez apóyate en la expresión enseñada.', 'Puedes volver a probar; el botón no lleva contador de paciencia.', 'Una vuelta más, pero revisando la pista antes de arrancar.', 'No hay prisa: cambia la respuesta y veamos cómo queda.'],
    recovery: ['¡Ahora sí quedó! Corregiste el error y resolviste el paso.', 'Ese ajuste funcionó. Buen uso de la corrección.', 'La revisión encontró la pieza que faltaba; respuesta correcta.', '¡Órale! El tropiezo terminó en un acierto, sin necesidad de drama.'],
    recurring: ['Este objetivo acumula varios errores reales; conviene revisarlo por partes.', 'Ya hay varios intentos incorrectos en este objetivo. La pista es un buen punto de apoyo.', 'Este punto se está atorando; bajemos el ritmo antes de volver a probar.', 'Hay trabajo repetido con este objetivo. Vamos a ajustar una cosa a la vez.'],
    progress: ['Ya confirmaste otra parte del recorrido. El avance está tomando forma.', 'Buen tramo de práctica; lo resuelto quedó guardado.', 'Va que va: más pasos completados, sin brincarnos la explicación.', 'La conversación ya tiene más piezas en su lugar. Seguimos.'],
    celebration: ['¡Órale! Completaste la aventura guiada.', 'Recorrido terminado. Hubo práctica, decisiones y cierre de conversación.', 'Misión completada; ahora sí toca reconocer el trabajo del recorrido.', 'Listo el trayecto. Sin certificado imaginario, pero con práctica real.'],
  },
  'es-CO': {
    general: ['Vamos con calma, parce. La ayuda sigue a tu lado.', 'Este espacio es para practicar, no para correr.', 'Una frase a la vez; la historia puede esperar.', 'Tranqui: primero miramos la pista y después seguimos el cuento.'],
    correct: ['¡Qué nota! Esa respuesta sí corresponde a la escena.', 'Muy bien: encontraste una expresión adecuada para conversar.', 'Bacano, ese paso quedó resuelto con sentido.', 'La frase llegó a buen puerto; seguimos con la historia.'],
    error: ['Esta respuesta aún no corresponde. Miremos la corrección sin afán.', 'Parce, aquí hay una pista útil para ajustar la expresión.', 'La idea tomó otro camino; podemos volver al punto de la pregunta.', 'Todavía no encaja, pero no hace falta regañar al cuaderno.'],
    retry: ['Vamos de nuevo, usando la ayuda como apoyo.', 'Otro intento, sin afán. Revisemos qué está pidiendo la escena.', 'La pregunta sigue esperando, muy tranquila. Tú puedes tomarte ese tiempo.', 'Una vuelta más al cuento, esta vez mirando la expresión clave.'],
    recovery: ['¡Qué nota! Ajustaste la respuesta y ahora sí corresponde.', 'El reintento salió bien; la corrección ayudó a encontrar el camino.', 'Bacano: el error se convirtió en una respuesta resuelta.', 'Ahora la frase sí encontró su lugar en la historia.'],
    recurring: ['Este objetivo ya registra varios errores; podemos revisarlo con más calma.', 'Hay una dificultad repetida en este objetivo, no un defecto de quien aprende.', 'Este punto vuelve a costar trabajo. La ayuda está para acompañar ese proceso.', 'Tenemos varios tropiezos registrados aquí; retomemos la pista, sin afán.'],
    progress: ['Ya confirmaste más pasos de la historia. Vamos avanzando.', 'Qué bueno: otra parte del recorrido quedó guardada.', 'La conversación ya tiene un tramo más resuelto.', 'Paso a paso va saliendo el cuento; seguimos sin correr.'],
    celebration: ['¡Qué nota! Terminaste esta aventura guiada.', 'Recorrido completo, parce. La historia llegó a su cierre.', 'Bacano: completaste los pasos y cerraste la conversación.', 'Se acabó este capítulo de práctica. El trabajo del recorrido sí cuenta.'],
  },
  'es-AR': {
    general: ['Dale, mirá la ayuda y probá a tu ritmo.', 'Acá hay lugar para ensayar, sin ponerse solemnes.', 'La frase puede esperar; no tiene un tren que alcanzar.', 'Bajemos un cambio: primero la pista, después la respuesta.'],
    correct: ['¡Bien ahí! Esa respuesta va con la escena.', 'Bárbaro: elegiste una expresión que corresponde.', 'La frase entró sin empujar. Respuesta correcta.', 'Che, ese paso quedó resuelto; la solemnidad puede quedarse afuera.'],
    error: ['Todavía no corresponde. Mirá la corrección y probá otra vez.', 'Esta respuesta tomó un desvío; la ayuda marca por dónde volver.', 'No encaja aún, pero tampoco hace falta convocar una asamblea.', 'La frase pide un ajuste, no un juicio sobre quien la escribió.'],
    retry: ['Dale de nuevo, con la expresión enseñada a la vista.', 'Otro intento. La pregunta no se ofende si leés la pista.', 'Probá una vez más, pero sin acelerar por compromiso.', 'Volvemos a la respuesta; el drama se toma un descanso.'],
    recovery: ['¡Ahora sí! Corregiste la respuesta y resolviste el paso.', 'Ese cambio funcionó. Buen uso del reintento.', 'Bárbaro: el error ya tiene una respuesta correcta después.', 'La frase encontró la puerta. El reintento hizo su trabajo.'],
    recurring: ['Este objetivo ya tiene varios errores registrados; conviene ir por partes.', 'Che, acá hay una dificultad repetida. Miremos la ayuda sin apurarnos.', 'Este punto insiste en complicarse. No hace falta tratarlo como una final.', 'Ya hubo varios tropiezos en este objetivo; cambiemos la estrategia con la pista.'],
    progress: ['Ya confirmaste más pasos del recorrido. Seguimos.', 'Otro tramo quedó resuelto y guardado; nada de avanzar de mentira.', 'La conversación viene tomando forma, de a poco.', 'Bien, hay más camino hecho. Sin correr la última parte.'],
    celebration: ['¡Bárbaro! Completaste esta aventura guiada.', 'Recorrido cerrado. Ya podés soltar un poco la solemnidad.', 'Dale, misión completada: llegaste al final de la conversación.', 'Terminaste este capítulo de práctica. Aplauso corto, merecido y sin diploma ficticio.'],
  },
};
export const reactionLibrary: EditorialReaction[] = Object.entries(texts).flatMap(([locale, categories]) => Object.entries(categories).flatMap(([category, entries]) => entries.map((text, index) => ({
  version: 1, id: `humor-v1:${locale}:${category}:${index + 1}`, locale: locale as CoachLocale, category: category as HumorCategory, mode: 'friendly', intensity: index < 2 ? 'gentle' : 'playful', explicit: false, text,
}))));
