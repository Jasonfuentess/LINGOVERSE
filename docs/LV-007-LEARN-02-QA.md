# LV-007-LEARN-02 — Rescate del aprendizaje inicial

## Estado y diagnóstico

**Implementación terminada; aceptación con principiante real pendiente.** La prueba manual de LEARN-01 fue reportada como no aprobada por el usuario. No se reinterpretan sus10/10 de LV-006B como aceptación de la enseñanza inicial ni se declara QA nativo/acústico.

LEARN-01 no resolvía el caso porque `beginnerPhrase` excluía rendez-vous y respuestas escritas: solo cubría dos saludos. «Vous avez rendez-vous ici ?» quedaba fuera y la ayuda completa podía llegar después del error. Cuatro fases de saludo tampoco enseñaban a construir una frase posterior. Faltaba distinguir ayuda en el avance, A1 tenía la misma autonomía que el modo independiente y bon/jour aislados no conservaban bien el sonido de Bonjour.

La solución usa modelos de respuesta **ya aceptados por cada ejercicio**, antes de fallar, en todos los turnos de las tres aventuras. No genera respuestas abiertas ni fonética desde letras. Se conserva la identidad UI aprobada.

## Protección

Fuente única: `D:\Documents\Jason\LingoVerse\LingoVerse Main\LingoVerse-Codex-Inicio`. Sin Git; ningún comando Git ejecutado. Respaldo previo `.backups/LV-007-LEARN-02-20261031-020719/source.zip` y manifest, **190 archivos verificados individualmente por SHA-256**. Comparación final: cero originales ausentes; quince archivos protegidos idénticos, incluidos todos los contenidos de misión y sus archivos históricos, arte, tokens, dependencias y continuidad narrativa.

No se consultó la carpeta antigua, no se borró progreso ni se añadieron aventuras, servicios, paquetes, IA remota o Live. Los checkpoints anteriores de ayuda se conservan aunque el panel nuevo ya no obliga a recorrer sus cuatro fases.

## Solución

- **Desde cero / Pre-A1:** traducción del NPC y modelo de respuesta disponibles antes del intento; significado/propósito y guía aproximada cuando existe una entrada revisada; audio completo y acceso a vocabulario, grupos, construcción y práctica oral. La preparación ocupa un panel del turno, no diez pantallas.
- **Principiante / A1:** orientación breve y preparación opcional. **Autónomo:** primero responder, ayudas bajo demanda. Las preferencias siguen guardándose por idioma en la clave anterior. Cerrar la ayuda no borra que fue usada; pasar por A1 y volver a Autónomo tampoco transforma el intento en independiente.
- **Recuperación inmediata:** «Preparar esta respuesta con ayuda» llena texto/opción de un modelo aceptado. No envía, no reinicia y no requiere fallos previos. Después se pulsa «Responder al personaje» y, tras feedback, «Continuar conversación». Construir por grupos ordenados es opcional y usa el original editorial; las decisiones con varias rutas conservan todas sus opciones.
- **Practicar hablando sin enviar:** zona local independiente. Reconocimiento, edición y confirmación solo actualizan texto en pantalla. «Confirmar: intentaba decir el modelo» permite reconocer manualmente la intención aunque Chrome haya entendido otra cosa; no es prueba de pronunciación ni evento educativo. La respuesta guiada sigue disponible sin micrófono.
- **Pronunciación asistida:**11 entradas curadas, original como referencia principal, traducción, aproximación legible, notas de sonidos y controles de audio del idioma original. Cuando no hay guía revisada no se fabrica una: se mantiene modelo, propósito, vocabulario existente y audio. Expresiones corteses contenidas en el modelo, como S’il vous plaît, también pueden mostrarse como apoyo contextual.
- **Ritmo lento:** se solicita0.65 al adaptador y se etiqueta «según voz». «Si suena igual: escuchar por grupos» ofrece inmediatamente segmentos revisados, sin prometer diferencia perceptiva no comprobada. Bonjour y S’il vous plaît se escuchan completos; una frase como Oui, j’ai rendez-vous ici se divide en Oui / j’ai rendez-vous / ici, sin sílabas artificiales.
- **Divulgación compacta:** «Audio lento y grupos» reúne opciones de reproducción; «Practicar, construir y ver vocabulario» abre los controles adicionales. La respuesta por micrófono se despliega aparte y muestra el aviso de privacidad antes de iniciar captura. Al comenzar la aventura se cierra el selector de modos para dar prioridad al personaje.
- **Progreso:** eventos nuevos incluyen evidencia opcional assisted/independent; replay la valida y conserva. El resumen distingue objetivos completados con ayuda, sin modelo adicional y sin registro antiguo. No equivale a dominio, fonética ni certificación. Un fallo de micrófono no envía respuestas; texto escrito no verificable no añade nuevos errores confirmados ni contexto de burla de aventura.

## Auditoría de las aventuras

| Aventura / primeras interacciones | Hallazgo y tratamiento |
|---|---|
| Café v1/v2: saludo, pedido, lugar/azúcar | Saludo diurno Bonjour coherente; modelos de bebida y elección del lugar responden a las preguntas de cada variante. Ahora se muestran antes del intento desde cero, con vocabulario existente. Se elimina la segmentación bon/jour del apoyo anterior. |
| Rendez-vous v1: saludo, confirmar, identificar, preguntar | La confirmación ya admitía Oui, j’ai rendez-vous ici, pero LEARN-01 nunca la enseñaba anticipadamente. Ahora aparece desde el inicio de ese turno con significado, aproximación, tres grupos y construcción. Se conservan equivalentes de espera/encuentro, género según personaje, lugar correcto y rutas. |
| Londres v4: oferta de ayuda, presentación, necesidad | El código actual ya ofrece Hello! Yes, please / Hi! Yes, I need help y alternativas breves. Se enseña cada expresión antes de producirla; no se sustituye la pregunta por una plantilla. |
| Londres v1/v2/v3 guardados | Mantienen Hello/Hi del contenido antiguo y su feedback. El reporte del usuario es compatible con una partida/bundle anterior, pero no se inspeccionó su Chrome para afirmarlo. El aviso existente identifica el recorrido antiguo; una partida nueva usa v4. No se reinicia ni reescribe una partida para ocultar la diferencia. |

**Versionado:** ningún contenido de misión cambia en esta tarea; los hashes de café, rendez-vous y Londres v1/v2/v3/v4 siguen idénticos. El nuevo paquete de apoyo es LEARN-02 y no altera lo aceptado por evaluación. La evidencia de ayuda es una extensión opcional de eventos que el lector actual reproduce; la ausencia antigua permanece sin registro. La app anterior a LEARN-02 no conoce esos metadatos nuevos: no usar un binario antiguo para reescribir partidas anotadas.

Los tests recorren todos los ejercicios/variantes de las tres aventuras y Londres v3: cada modelo y cada alternativa de recuperación es válido en su contenido original. Negaciones/lugares erróneos continúan sin aceptarse y el texto aproximado español no se transforma en una respuesta francesa válida.

## Revisión de las guías aproximadas

Revisión editorial por IA contrastada con diccionarios y revisión independiente del catálogo guardado; **no se afirma revisión docente humana ni validación acústica**. Las transcripciones de frases largas son composición editorial a partir de palabras/sonidos documentados, no transcripción de una grabación publicada de esa frase. No hay algoritmo de transliteración.

| Original | Traducción | Aproximación |
|---|---|---|
| Bonjour | Hola / buenos días | bõzhúr |
| S’il vous plaît | Por favor | sil vu plé |
| Oui, j’ai rendez-vous ici | Sí, tengo una cita/encuentro aquí | ui, zhé rãdevú isí |
| Oui, j’attends une amie | Sí, estoy esperando a una amiga | ui, zhatã ün amí |
| Où est la fontaine ? | ¿Dónde está la fuente? | u e la fõtén |
| Hello | Hola | helóu |
| Yes, please | Sí, por favor | iés, plíiz |
| Hello! Yes, please | Hola, sí, por favor | helóu; iés, plíiz |
| I’m new here | Soy nuevo/a por aquí | aim niú híe(r) |
| I need help, please | Necesito ayuda, por favor | ai níid help, plíiz |
| Can you help me, please? | ¿Podés ayudarme, por favor? | ken iú help mi, plíiz |

Las notas visibles explican zh como sh con vibración, nasales sin añadir n, r francesa posterior, ü como i con labios de u, h inglesa aspirada suave, z inglesa sonora, vocales largas y variación británica/estadounidense. Una grafía española no representa con precisión todos esos sonidos. La voz y el original prevalecen; nunca se envía la aproximación a TTS, al reconocimiento como modelo, a evaluación ni a progreso. Si el estudiante escribe esa aproximación, se trata como texto que no coincide, no como medición oral.

Fuentes principales: [Larousse Bonjour](https://www.larousse.fr/dictionnaires/college/bonjour/4938), [rendez-vous](https://www.larousse.fr/dictionnaires/college/rendez-vous/34451), [fontaine](https://www.larousse.fr/dictionnaires/college/fontaine/16868), [oui](https://www.larousse.fr/dictionnaires/college/oui/28916), [ami](https://www.larousse.fr/dictionnaires/college/ami/1410), [un/une](https://www.larousse.fr/dictionnaires/college/un/41301), [attendre](https://www.larousse.fr/dictionnaires/french-english/attendre/6209); [Collins S’il vous plaît](https://www.collinsdictionary.com/dictionary/english/sil-vous-plait); [Cambridge Hello](https://dictionary.cambridge.org/pronunciation/english/hello), [new](https://dictionary.cambridge.org/pronunciation/english/new), [here](https://dictionary.cambridge.org/pronunciation/english/here), [please](https://dictionary.cambridge.org/pronunciation/english/please), [help](https://dictionary.cambridge.org/pronunciation/english/help); [BBC: forma débil de can](https://downloads.bbc.co.uk/learningenglish/towardsadvanced/unit_16/bbc_tims_pron_wkshp_can.pdf). Cada entrada conserva sus enlaces e IPA en `src/content/pronunciation.ts`; no se descargaron audios ni se necesitan esos sitios al jugar.

## Roast Me dentro de aventuras

El motor/repositorio ya admitían Roast en inglés; la pantalla y CoachReaction lo ocultaban por condición de idioma francés. Se corrige el acceso en ambos idiomas. Sin consentimiento se ofrece «Configurar estilo Roast Me (adultos)», que abre el acceso existente con casillas sin marcar. Tras aceptar y volver a la aventura todavía se debe activar el estilo: consentimiento no equivale a activación automática. Con consentimiento aparece activar/desactivar y revocar, mostrando estado real también si el humor general estaba apagado.

Londres usa un subconjunto explícito de frases regionales **ya existentes** que no dicen café/francés/ocho interacciones. Se añade elegibilidad por idioma al mismo motor; las referencias editoriales previas conservan sus propios idioma y contexto. No hay chistes/memes nuevos ni motor duplicado. La práctica local no produce reacción; en aventuras una respuesta escrita incierta no produce contexto Roast ni nuevos errores confirmados. El modo Roast independiente conserva su manejo previo de referencias textuales explícitas, sin atribuirlas a pronunciación ni ampliar memes en esta etapa. Voz adulta y revocación siguen las restricciones anteriores. No hay Roast Me Live, conversación continua ni evaluación fonética.

## Resultados reales

| Comprobación | Resultado |
|---|---|
| Baseline `npm.cmd test` |181/181 PASS |
| Suite final `npm.cmd test` |193/193 PASS:12 casos nuevos, no recuperación ficticia de tests históricos |
| `npm.cmd run typecheck:core` |PASS |
| `npm.cmd run typecheck` |PASS |
| `npm.cmd run lint` |PASS, sin advertencias |
| `npm.cmd run export:web` |PASS; dist local, sin deploy |
| `node --check scripts/check-premium.mjs` |PASS sintáctico |
| Chrome `node scripts/check-premium.mjs --rescue --browser 'C:/Program Files/Google/Chrome/Application/chrome.exe'` |FAIL antes de cargar: GPU no utilizable y timeout CDP Page.enable |

Se observaron fallos antes de implementar guía, evidencia, modos, acceso de catálogo inglés y consistencia del modelo preferido. La revisión de código detectó la pérdida de marca de ayuda al alternar Autónomo→A1→Autónomo y el modelo preferido ignorado; ambos corregidos con regresiones. Se mantuvieron los tests de referencias anteriores reparando su metadato de idioma, sin eliminar aserciones para ocultar regresiones.

Pruebas nuevas: modelo temprano en rendez-vous y modelos aceptados en todos los turnos/variantes, tres modos, catálogo curado y rechazo de grafía aproximada como respuesta francesa, evidencia antigua/nueva y guardado real, incertidumbre sin error/roast, Roast inglés consentido en cuatro regiones, UI de preparación/recuperación, transición A1 y fallback lento por grupos con idioma correcto. Render/controles sustituidos no son prueba de layout ni audio real.

Logs locales `lv007-learn02-*.log`, incluyendo tests/core/types/lint/export/browser y fallos de regresión. No hay capturas nuevas: Chrome no cargó el producto. **No se escuchó la voz ni se verificó acústicamente que rate0.65 ralentice esta plataforma.** Se inspeccionó el contrato real de adaptadores (Web Speech y expo-speech) y se probó la solicitud de velocidad más el fallback a originales segmentados. La prueba perceptiva es obligatoria antes de aprobar pronunciación asistida. Android/iOS/Safari, lector real y disposición móvil siguen pendientes.

## QA manual obligatorio

```powershell
Set-Location -LiteralPath 'D:\Documents\Jason\LingoVerse\LingoVerse Main\LingoVerse-Codex-Inicio'
npm.cmd run web
```

Abrir el origen/puerto de Expo. Para experimentar sin sustituir partidas personales, usar un perfil de Chrome de prueba separado. Mantener origen y perfil al comprobar persistencia. Registrar PASS/FAIL/NO EJECUTADO, variante, voces/permiso, ancho y observaciones del principiante; no hace falta grabar su voz.

| # | Recorrido | Resultado esperado |
|---|---|---|
|1| Francés, Desde cero; abrir rendez-vous y llegar a «Vous avez rendez-vous ici ?» | Pregunta traducida y modelo Oui, j’ai rendez-vous ici antes de fallar; significado visible. Sin búsqueda por ensayo/error. |
|2| Leer la aproximación y sus notas; escuchar normalmente | Original principal, ui/zhé/nasal/r explicados y voz francesa. Si no hay voz, aviso y opción de continuar; no aprobar pronunciación oral. |
|3| Comparar normal/lento, misma frase/voz/volumen; si suena igual, pulsar fallback | Registrar percepción real. Poder oír Oui / j’ai rendez-vous / ici en francés y frase completa; no asumir que un número diferente prueba ralentización. |
|4| Practicar sin grabar y construir por grupos | Puede repetir libremente y armar la respuesta sin nota. En Bonjour y S’il vous plaît no se fuerzan divisiones artificiales. |
|5| Abrir práctica oral sin enviar; provocar silencio, denegar o decir algo que Chrome transcribe mal | Mensaje técnico/posible fallo del micrófono, sin avance ni errores lingüísticos nuevos. Texto editable/reintento disponibles. |
|6| Confirmar manualmente que intentaba decir el modelo | Solo actualiza práctica en pantalla; no se envía, no se aprueba fonética ni se produce roast. |
|7| Preparar respuesta con ayuda y luego Responder al personaje | Preparar solo llena borrador/opción. Enviar evalúa original aceptado, feedback educativo y Continuar accesible. No depende del micrófono. |
|8| Repetir con café: saludo, pedido y lugar | Modelos tempranos responden a sus preguntas. S’il vous plaît ofrece guía sil vu plé cuando aparece como apoyo del modelo; audio siempre francés. |
|9| Inglés Desde cero, partida nueva | Oferta de ayuda con respuestas completas coherentes; modelo, significado y ayudas de Hello/Yes please, presentación y petición de ayuda antes del intento. Voz inglesa. |
|10| Revisar explicaciones del entrenador y audio de diálogos | Explicación española con voz española; frase francesa/inglesa con voz de ese idioma, sin sustitución cruzada. |
|11| A1 y Autónomo, intentar antes de abrir ayuda | A1 da orientación breve y modelos opcionales; Autónomo no anticipa el modelo. Abrir ayuda conserva posibilidad de escribir/seleccionar y usar recuperación. |
|12| Alternar Autónomo→A1→Autónomo en el mismo turno | La ayuda vista no se borra de la evidencia del próximo envío. Cambiar modo no borra el borrador ni reinicia aventura. |
|13| Cambiar modo en francés, abrir inglés, recargar | Preferencias independientes y persistentes por idioma. No certificación CEFR. |
|14| Completar un objetivo con modelo y otro autónomo sin ayuda; terminar recorrido | Resumen diferencia ayuda/sin modelo adicional y ausencia antigua; no lo llama dominio. Los desconocidos no suman errores confirmados. |
|15| Reanudar partidas de las tres aventuras y Londres v1/v2/v3/v4 | Versión, rama, feedback y puente LV-007A se conservan. Partida antigua mantiene contenido; solo reiniciar confirmado elige versión nueva. |
|16| Roast sin consentimiento desde ambas aventuras/idiomas | Acceso comprensible, no activado. Las casillas del acceso adulto deben seguir desmarcadas. Rechazar conserva aprendizaje normal. |
|17| Si se desea, consentir en perfil de prueba y volver a activar estilo de aventura | Reacciones regionales reales en inglés/francés, correcciones completas. Inglés sin referencias incorrectas a café/francés/ocho pasos. No roast por práctica oral o incertidumbre. Desactivar/revocar funciona y detiene voz adulta. |
|18| Probar320/390/1280 px, fuente200%, teclado, Tab/Enter/Espacio, lector y movimiento reducido | Personaje y respuesta legibles, grupos/botones alcanzables, foco visible, estados anunciados, sin scroll horizontal ni recortes. Reiniciar discreto y confirmado. |

Criterio de aceptación: una persona que no conocía la expresión puede explicar qué le preguntan, escuchar cómo responder, practicarla y continuar con ayuda aunque el reconocimiento falle. Registrar su experiencia real; el193/193 no demuestra por sí solo ese resultado. Conservar como pendiente cualquier plataforma o condición no ejecutada.

Verificador preparado: `npm.cmd test`, `npm.cmd run export:web` y el comando Chrome de la tabla con `--rescue`. Perfil aislado bajo `.web-check/rescue-learning`; comprueba que preparar modelos no añade eventos, captura confirmación del rendez-vous antes de respuesta y recorre las tres aventuras en320/390/1280 cuando Chrome carga. No simula consentimiento adulto ni audio físico.

## Archivos y próximos pasos

Nuevos: `tasks/LV-007-LEARN-02.md`, diseño y esta guía; `src/content/pronunciation.ts`, `rescue.ts`; `src/domain/learning/evidence.ts`; `src/features/learning/LearningRescue.tsx`; `tests/learning-rescue.test.cjs`, `study-audio.test.cjs`.

Modificados: soporte de tres modos, modelos/eventos/replay de aprendizaje, historial de errores, contexto/elegibilidad de humor y catálogo existente por idioma; ExerciseView/MissionProvider/MissionScreen/BeginnerPreparation; SpeechInput/VoiceControls; helper beginner y sus tests; tests de presentación; tsconfig.core, verificador web; PROJECT_STATE/HANDOFF/PRODUCT_VISION/ROADMAP y documentación de voz/diseño. No cambian arte, tokens, dependencias ni contenidos de misión versionados.

Inventario exacto de modificaciones: `src/content/beginner.ts`, `src/content/roastHumor.ts`; `src/domain/humor/context.ts`, `engine.ts`, `models.ts`; `src/domain/learning/engine.ts`, `models.ts`, `support.ts`, `variety.ts`; `src/features/humor/CoachReaction.tsx`; `src/features/learning/BeginnerPreparation.tsx`, `ExerciseView.tsx`, `MissionProvider.tsx`, `MissionScreen.tsx`; `src/features/voice/SpeechInput.tsx`, `VoiceControls.tsx`; `src/storage/missionRepository.ts`; `tests/beginner-learning.test.cjs`, `tests/beginner-presentation.test.cjs`; `scripts/check-premium.mjs`, `tsconfig.core.json`; `docs/DESIGN_SYSTEM.md`, `HANDOFF_TO_CODEX.md`, `PRODUCT_VISION.md`, `PROJECT_STATE.md`, `ROADMAP.md`, `SPEECH_RECOGNITION.md`.

Siguiente paso: ejecutar el recorrido con principiantes, revisar pronunciación/segmentos con docente humano y validar voces, velocidad perceptiva, accesibilidad y móvil. Ampliar catálogo solo tras revisión, sin transliteración improvisada. LV-007B y Roast Me Live siguen fuera de esta tarea; Live exige otra especificación/validación. No hay operaciones Git ni publicación.
