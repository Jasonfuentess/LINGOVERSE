# LV-006A-REV-01 — Auditoría pedagógica y audio (31-oct-2026)

**Estado:** correcciones implementadas en una copia del proyecto aportado; **QA manual en el Chrome del usuario pendiente**. Versión nueva de Londres **v3**; v1 y v2 se conservan para reanudar eventos almacenados sin reevaluar su pasado. No se ha modificado la ruta Windows del usuario, ni se han ejecutado commit, push, checkout, reset, merge o deploy.

## Evidencia de partida y diagnóstico

- QA anterior reportado por el usuario: LV-005B-02 **9/9 puntos en Chrome**; LV-006A original **11/12 puntos ejecutados** con incidencias: acento de entrenador/ejemplos, respuestas pedagógicamente débiles y réplicas poco naturales. El cambio entre Londres y París (punto 10) sigue **pendiente**, no aprobado.
- El código v2 anterior `src/content/london.ts` tenía aceptaciones finitas. En `help` el NPC pregunta **«What do you need?»**, pero se aceptaban *Can you help me?* y *Could you help me?* y **no** «I need help». En `introduce`, «Are you new here?» admitía «I'm new here» pero no la confirmación «Yes, I'm new here»; la normalización de comas/espacios ya estaba presente.
- El ejemplo inglés del feedback v2 ya llamaba `SpeechButton(..., language='en-GB')`, pero las explicaciones del entrenador incluían expresiones inglesas leídas por `CoachSpeech` con **una sola voz española regional**, produciendo potenciales lecturas de inglés con fonética española. El sistema **no** selecciona francés para un texto declarado inglés: el selector filtra por familia lingüística. El timbre real depende del SO y no se ha vuelto a escuchar en Chrome después de esta entrega.
- Los mensajes desconocidos se guardaban de manera segura sin copiar el texto bruto, pero el feedback de desconocimiento no distinguía suficientemente **no reconocido** de **gramaticalmente incorrecto**.

## Auditoría escena por escena (todas las variantes)

| Escena / objetivo | Hallazgo | Corrección v3 |
|---|---|---|
| `greet` / saludar | En King’s Cross se preguntaba «Are you lost?» y el saludo del estudiante recibía un genérico «Welcome». En South Bank «Nice to meet you» era demasiado formal/inverosímil por la lluvia. | King’s Cross: «Do you need help?» y oferta de ayuda; South Bank: comentario natural sobre la lluvia. El saludo sigue siendo un primer turno. |
| `introduce` / presentarse | «Yes, I'm new here» se rechazaba; no había diagnóstico útil para negación contradictoria. | Se aceptan afirmaciones, «Yes, I am», «I'm visiting London» y variaciones ortográficas. Se explica el error de omitir *am*; «No, I am not new here» se reconoce como contradicción **de la situación**, no como mala gramática. |
| `help` / solicitar ayuda | «What do you need?» rechazaba «I need help». Se confundían petición y respuesta directa. | Acepta «I need help», «I need help, please», «I need directions» y peticiones corteses. Describe el matiz de cortesía. Rechaza negaciones explícitas que contradicen la situación. |
| `where` / preguntar por destino | El NPC preguntaba «Do you need directions?» aunque la acción era formular una pregunta de ubicación. | Ahora pregunta «Where do you need to go?». El alumno puede nombrar el destino, decir que lo busca o pedir dónde queda. La diferencia *what/where* continúa documentada. |
| `choose-path` / decisión real | Opciones ya generaban rutas distintas y personajes distintos. | Se conserva la bifurcación, manteniendo cuatro opciones válidas y una que rechaza el objetivo. |
| `confirm-a` / confirmar ubicación | Preguntas cerca de un punto de referencia resultaban algo repetitivas, pero coherentes como práctica inicial A1. | Se conserva estructura A1 y se añade texto hablado español claro para el entrenador; revisión presencial con aprendices queda pendiente. |
| `confirm-b` / confirmar dirección | En mercado «Is it near here?» producía una indicación para la que no se había preguntado explícitamente. | Se sustituye por «How do I get to the theatre?»; Leo indica el camino. Ben permanece en la parada y menciona el número de autobús. |
| `direction-a/b` / comprender instrucciones | Dos paráfrasis y una dirección contradictoria ya estaban presentes. | Se conservan ambas opciones equivalentes, la equivocación detectada y la respuesta contextual, evitando expansión indiscriminada. |
| `thanks-a/b` / agradecer | El NPC decía «You found it!» cuando el estudiante ya había llegado, incluso si el guía seguía en la parada/mercado. | El agradecimiento ocurre **antes de irse**; «Now you know the way!» y «You're welcome». |
| `bye-a/b` / despedirse | Aparecía el guía hablando desde el destino sin transición. | La despedida precede al recorrido final y el desenlace se narra después; NPC desea buena experiencia. |

### Progresión A1 resultante

El escenario y el personaje introducen el problema; saludo y presentación establecen contacto; una necesidad de ayuda recibe respuesta; el destino se expresa con vocabulario anticipado; el estudiante elige ruta; otro personaje da indicaciones breves; se interpreta la dirección, se agradece y se despide. Las pistas siguen desplegándose por elección (`Necesito una pista` → `Ver traducción y expresiones`), y la traducción no se revela antes de intentar o solicitar ayuda.

**Límite reconocido:** los ejercicios de texto usan un conjunto editorial finito; el motor no comprende cualquier oración natural. Una expresión no contemplada muestra **«Aún no podemos verificarla»** y propone reformular sin declarar que hay una falta inexistente. Las reglas de errores conocidos sí dan explicaciones puntuales. La aceptación conserva distinciones semánticas: «I don't need help» no se trata como sinónimo de «I need help».

## Arquitectura, datos y audio

- `src/content/london.v2.ts` conserva el material v2 para eventos previamente guardados; `src/content/london.v1.ts` permanece. La nueva lección usa `version: 3` con el mismo `id`, objetivos y nodos, pero diálogos y aceptación revisados. `MissionProvider` incorpora v1/v2 como archivos históricos y `londonLessonForProgress` escoge la versión guardada. No hay migración automática. Reiniciar la misión requiere confirmación; la nueva sesión usa v3.
- `TextExercise` tiene tres metadatos **opcionales** de v3: `acceptedFeedback` (explicación por formulación revisada), `unknownExplanation` y `spokenExplanation`/`unknownSpokenExplanation` (copia exclusivamente española para TTS). `WrittenRule` y `ChoiceOption` aceptan `spokenExplanation`. Validaciones comprueban que un feedback editorial aluda a una expresión realmente aceptada; no se usan LLMs, fuzzy matching ni librerías nuevas.
- `validateWritten` mantiene coincidencia exacta normalizada y sanitización/retención del input; `evaluateAnswer` propaga la explicación hablada opcional. No cambia el resultado ni la serialización de eventos anteriores: los campos opcionales se omiten en las versiones antiguas, probado con restauración v1/v2.
- `EducationalFeedback` y `CoachReaction` siguen mostrando al estudiante la explicación didáctica completa; **para hablar** prefieren una paráfrasis en español sin incrustar frases inglesas, y el botón «Escuchar el ejemplo en inglés» sintetiza la primera frase de corrección con `en-GB`. En francés sigue `fr-FR`. El entrenador usa el `coachLocale` en español, con fallback *solo entre voces españolas* cuando falta el acento regional; no hay garantía de pronunciación natural sin prueba real.
- El TTS nunca puntúa pronunciación. Si no hay voz compatible, conserva el texto y muestra el estado correspondiente. El micrófono web permanece opcional y puede usar servicio del navegador; no hay grabaciones guardadas por LingoVerse.

## Validaciones ejecutadas

| Comando / evidencia | Resultado en esta copia |
|---|---|
| `npm test` | **152/152 aprobadas** (140 anteriores y 12 nuevas); pruebas de las dos respuestas reportadas, contradicciones, incertidumbre, audio segmentado por control, persistencia v2, regresión francesa, rutas, privacidad y no filtración. |
| `npm run typecheck:core` | Aprobado (exit 0) |
| `npm run typecheck` | Aprobado (exit 0) |
| `npm run lint` | Aprobado (exit 0) |
| `npm run export:web` | Aprobado (exit 0), exportación local `dist` |
| `node scripts/check-web.mjs --browser /tmp/lingoverse-chromium` | **No aprobado**: el Chromium del entorno mostró `127.0.0.1 is blocked`; no llegó a cargar la app. |
| Chrome real con micrófono / voces instaladas tras v3 | **Pendiente**; no equiparar el simulador TSX con escucha real. |
| Android / iOS | **No verificados** |

### QA manual del usuario en Chrome — comprobar v3, no la sesión histórica

1. Instalar cambios tras respaldar/comparar archivos. Abrir Londres y comprobar qué versión conserva tu sesión. **No reinicies una partida en curso sin querer reemplazarla.** Para ver las correcciones editoriales v3, concluir el recorrido antiguo y luego reiniciar con confirmación.
2. En South Bank, Ollie pregunta «Are you new here?». Probar «Yes, I'm new here» y después, en una nueva vuelta, «yes , I'm new here». Ambas deben avanzar. Repetir en King’s Cross cuando corresponda.
3. Cuando Ollie dice «What do you need?», probar «I need help» y «I need help, please» en intentos/recorridos distintos. Ambas deben avanzar; la primera tiene una sugerencia de cortesía, **no** una corrección gramatical.
4. Probar «I don't need help» (error por contexto) y «Can you helps me?» (error gramatical detectado). Probar una formulación no contemplada; debe indicar incertidumbre, no que el inglés necesariamente esté mal.
5. Activar audio y revisar «Voces del dispositivo». Escuchar la voz inglesa del NPC (selección `en-GB` o fallback **inglés**), el ejemplo en inglés y la explicación hablada del entrenador en **español**. Anotar las voces efectivamente seleccionadas y si el acento sigue sonando impropio. Si no hay voz inglesa, debe mostrar la limitación sin usar francés.
6. Completar las dos historias y ambas rutas cuando el motor las presente; comprobar pregunta/réplica, progresión, pistas, traducciones ocultas inicialmente, cambios de escena, finalización y reanudación.
7. Completar el punto 10 pendiente de LV-006A: visitar París, comprobar avance/voz francesa y volver a Londres sin interferencias.
8. Denegar micrófono y comprobar fallback escrito, escritura por teclado, corrección de transcripción y cancelación sin envío accidental.

La etiqueta «aprobada» no se asigna a esta revisión hasta recibir el resultado del QA manual. La aceptación docente externa de A1 y el acento real continúan abiertos.
