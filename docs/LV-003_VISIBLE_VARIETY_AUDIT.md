# Auditoría LV-003 — variedad visible en la aventura

## Conclusión

El selector está integrado y puede seleccionar cualquiera de las seis variantes. El historial altera los pesos y la selección; iniciar/reiniciar sortea y reanudar restaura. No se identificó un defecto que fuerce siempre la primera variante ni se modificó lógica de producción.

La limitación está en el contenido: **seis IDs/personajes, pero solo dos perfiles de intervenciones en francés y las mismas respuestas/ayudas**. Dos recorridos con personajes distintos pueden presentar exactamente todas las preguntas iguales. El informe anterior midió diversidad de IDs, no seis conversaciones lingüísticamente diferentes. La observación del usuario es compatible con esta implementación; no tenemos su historial/dispositivo para determinar qué dos IDs vio efectivamente.

## Inventario exacto de las seis variantes

| ID | Título mostrado | Personaje | Perfil francés |
| --- | --- | --- | --- |
| matin-lucie | Una mañana con Lucie | Lucie | A |
| midi-samir | Mediodía con Samir | Samir | B |
| pluie-camille | Una pausa con Camille | Camille | B |
| carnet-alex | El cuaderno de Alex | Alex | A |
| balade-noemie | Un paseo con Noémie | Noémie | B |
| lecture-hugo | Un libro con Hugo | Hugo | A |

El título de variante aparece encima del ejercicio. El personaje aparece en cada intervención y en su feedback. Los títulos de ejercicios (Entrás al café, Tu primera decisión, etc.) no cambian entre variantes.

Intervenciones y traducciones por paso, manteniendo las mismas decisiones del usuario:

| Paso | Perfil A | Perfil B |
| --- | --- | --- |
| 1 · saludo | Bonjour, bienvenue ! — ¡Hola, bienvenido/a! | Bonjour ! — ¡Hola! (saludo de día) |
| 2 · pedido | Vous désirez ? — ¿Qué desea? | Un café ou un thé ? — ¿Un café o un té? |
| 3 · lugar | Sur place ou à emporter ? — ¿Para tomar aquí o para llevar? | Igual |
| 4 · azúcar | Avec du sucre ? — ¿Con azúcar? | Vous voulez du sucre ? — ¿Quiere azúcar? |
| 5 · preguntar precio | Votre boisson est prête. — Su bebida está lista. | Igual |
| 6 · comprender precio | Ça fait trois euros. — Son tres euros. | Igual |
| 7 · agradecimiento | Voilà votre boisson. — Aquí tiene su bebida. | Voilà ! — ¡Aquí tiene! |
| 8 · despedida | Au revoir ! — ¡Adiós! | Bonne journée ! — ¡Que tenga un buen día! |

Cambian cinco de ocho intervenciones entre A y B, pero solo dos de esos cambios son preguntas: pedido y azúcar. El saludo, agradecimiento y despedida son las otras tres diferencias. Dentro de A o dentro de B, ninguna intervención francesa cambia. Las dos ramas de azúcar tienen la misma diferencia de perfil; no son dos pasos adicionales.

Texto exacto de introducción por variante:

- **Lucie:** Una mañana en París. Lucie termina de ordenar el mostrador y te recibe con una sonrisa.
- **Samir:** Es mediodía. Cerca de una ventana, Samir acomoda una taza. Te acercás al mostrador.
- **Camille:** Afuera llueve. Entrás al café y dejás el paraguas junto a la puerta.
- **Alex:** Entrás con tu cuaderno de viaje. Alex deja espacio en el mostrador para atenderte.
- **Noémie:** Hacés una pausa durante tu paseo por París. Noémie te recibe al entrar.
- **Hugo:** Llevás un libro bajo el brazo. Hugo termina de acomodar dos tazas y se acerca.

Otras escenas en español:

| Escena | Lucie / Samir | Camille | Alex | Noémie | Hugo |
| --- | --- | --- | --- | --- | --- |
| Pedido | Mirás el pequeño menú. Podés elegir café o té; ambas decisiones continúan la historia. | Elegís tu bebida mientras esperás que pase la lluvia. | Anotaste café y té en tu cuaderno; ahora podés pedir cualquiera. | Antes de seguir el paseo, decidís qué bebida pedir. | Tu libro puede esperar: es momento de pedir café o té. |
| Precio | Lucie: Antes de sacar la billetera, necesitás saber cuánto cuesta tu bebida. Samir: La bebida está lista. Querés confirmar cuánto vas a pagar. | Igual a Samir | Igual a Lucie | Igual a Samir | Igual a Lucie |
| Agradecimiento | Pagás el importe indicado y recibís tu bebida. Ahora agradecé la atención. | Recibís tu bebida. Camille espera tu respuesta antes de atender a la siguiente persona. | La misma frase con Alex | La misma frase con Noémie | La misma frase con Hugo |

Las escenas de lugar, azúcar, pago y despedida no varían por personaje. Las ramas sí cambian por decisiones: lugar reconoce café/té; servicio cambia mesa junto a ventana o vaso para llevar; aceptar/rechazar azúcar muestra Avec du sucre / Sans sucre. Esto funciona igual en las seis variantes. Tomar las mismas decisiones repite esas mismas escenas.

### Lo que no varía

- Las opciones de selección, su orden, calificación, explicaciones específicas y réplicas son idénticas.
- Las respuestas escritas aceptadas son siempre C’est combien ? / Combien ça coûte ?, Merci / Merci beaucoup, Au revoir / Bonne journée.
- Las ayudas, instrucciones, explicaciones generales, correcciones y réplicas del personaje son iguales para cada nodo equivalente.
- Siempre se recorren los mismos ocho objetivos en el mismo orden y el precio es siempre tres euros.

Por ello hay cambios de texto visibles y no solo metadatos; predominan nombre/ambientación y dos pequeñas reformulaciones de preguntas. **La variedad de conversación y de decisiones educativas es baja.** Esta valoración proviene del contenido y de los campos que renderiza la interfaz, no de una nueva prueba visual/estudio de usuarios.

## Trazabilidad de integración

1. Comenzar aventura llama a `state.start()`; Confirmar reinicio usa la misma acción.
2. `MissionProvider.start` invoca `repository.start()`.
3. `MissionRepository.start` llama a `selectContent(lessonCandidates, lessonContext, history, RNG)`, busca la variante por el ID devuelto, inicia ese ID y guarda el resultado.
4. El proveedor actualiza progress solo tras el guardado exitoso.
5. `MissionScreen` obtiene el título por progress.variantId y pasa `currentExercise(cafeLesson, progress)` a ExerciseView. No fuerza variants[0].
6. ExerciseView muestra los campos del objeto recibido: título, escena, personaje, prompt, traducción, ayuda y opciones. La key incluye run y nodeId: un reinicio crea otra instancia del formulario.

Abrir una misión completada muestra su resultado, sin nuevo sorteo. Para otro recorrido hay que confirmar Reiniciar aventura. Una misión interrumpida usa repository.load: conserva variante, escena, eventos, feedback e historial; recargar no equivale a comenzar otra sesión.

### Influencia real del historial

Prueba reproducible usando siempre RNG=0.1: desde memoria vacía se elige Lucie; tras completar y guardar ese recorrido, un repositorio recién cargado con ese historial elige Samir con el mismo RNG. La pregunta entregada al formulario cambia de Vous désirez ? a Un café ou un thé ?. No depende de cambiar la semilla para obtener esa diferencia.

La selección permite repetir. En el caso concreto de un historial inicialmente vacío y una primera misión completada, el candidato usado tiene peso relativo `1 / sqrt(2) × 1/4 ≈ 0.176777` frente a 1 de cada nuevo candidato (se cancela el factor común de relevancia). Bajo un sorteo uniforme, la próxima sesión tiene aproximadamente **3.41%** de repetir el ID y **42.05%** de repetir el perfil francés: puede elegir el mismo ID o cualquiera de los otros dos del mismo perfil. Son probabilidades de ese estado específico, no tasas observadas del usuario ni garantías para cualquier historial.

No hay equivalencia conversacional/familia A-B en el contrato actual del selector. Penaliza el ID usado, pero considera Alex y Hugo alternativas nuevas aunque sus preguntas sean iguales a las de Lucie. Esta es una limitación de granularidad editorial/antirrepetición, no una desconexión del selector.

## Pruebas de esta auditoría

Nuevo archivo `tests/variety-visible-content.test.cjs`, siete pruebas reproducibles:

1. Fuerza cada uno de los seis intervalos de selección y comprueba una llamada al RNG, ID, personaje, prompt e introducción exactos del objeto Exercise que recibe la pantalla.
2. Completa una misión y reinicia seleccionando otra variante: nuevo run/sesión, nodo inicial y personaje correcto.
3. Reanuda un recorrido interrumpido con feedback incorrecto y verifica igualdad de estado, contenido, historial y bytes almacenados.
4. Mantiene RNG fijo y demuestra que el historial persistido cambia tanto el ID como la pregunta entregada a la interfaz.
5. Cuenta exactamente dos perfiles franceses, cinco intervenciones distintas entre perfiles y respuestas/ayudas idénticas.
6. Reproduce dos sesiones Alex→Hugo: IDs distintos, tres escenas en español distintas, todas las intervenciones francesas iguales.
7. Comprueba que repetir el mismo ID es una decisión ponderada válida y crea un nuevo recorrido, no una falsa reanudación.

Alcance: selector → repositorio real → Learning Engine → objeto Exercise utilizado por MissionScreen/ExerciseView, con Storage en memoria de prueba. La conexión de callbacks/componentes se inspeccionó en los archivos reales. No se montó React Native ni se ejecutó un navegador real en esta auditoría; estas pruebas no sustituyen aceptación visual ni prueban el historial concreto del dispositivo del usuario.

Baseline: 36/36. Resultado con pruebas añadidas: 43/43. Se ejecutaron también ambos typechecks, lint y export:web; resultados efectivos registrados en PROJECT_STATE. No se modificaron algoritmos, pesos, contenido, UI, dependencias ni persistencia.

## Propuestas futuras, sin implementar

1. Definir perfiles de conversación con diferencias observables, además de IDs de personaje. Medir repeticiones por firma de preguntas y decisiones, no solo por ID. Penalización gradual por familia, con repetición permitida; no resolverlo prohibiendo repetir todo.
2. Autorizar y validar alternativas por objetivo: pedido abierto frente a confirmación de café/té; confirmar y corregir un pedido usando expresiones enseñadas; precios de uno/dos/tres euros ya incluidos en la ayuda. Si cambia un precio, prompt y respuesta correcta deben permanecer ligados en un contenido versionado y persistido, sin recalificar una escena al reanudar.
3. Crear microhistorias A1 que alteren intervenciones y consecuencias reales (confirmar bebida/lugar, aceptar/rechazar una propuesta), con enseñanza previa y respuestas alternativas coherentes. Mantener las ocho interacciones, ramas y prerrequisitos; no barajar pasos dependientes.
4. Congelar las variantes antiguas para progreso existente; agregar nuevos IDs/versiones y pruebas de todas las rutas, vocabulario enseñado, equivalencia de objetivos y persistencia. Registrar métricas de diversidad de conversación separadas de diversidad de personajes.
