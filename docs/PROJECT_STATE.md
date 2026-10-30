# Estado del proyecto

## Dirección de producto V3 registrada

Se incorporó íntegramente la visión acordada por el usuario en [PRODUCT_VISION.md](PRODUCT_VISION.md). Se creó [ROADMAP.md](ROADMAP.md) con su secuencia: conversación → Diario V1 → Pasaporte V1 → recompensas ligeras → QA de beta. MASTER_PROMPT conserva su cuerpo V2 e indica la precedencia de V3 para decisiones de producto.

Esto registra dirección futura, no implementación ni validación técnica de audio, reconocimiento, destinos, Londres/inglés, diario, pasaporte, economía o cinco secciones plenamente funcionales. Roast Me independiente sigue disponible; su uso como estilo opcional en aventuras compatibles queda pendiente. Mamá de LATAM no es requisito de beta. Diario y pasaporte deben compartir progreso real; completar una misión no acredita dominio.

Cambio exclusivamente documental. Inspección de AGENTS, especificación maestra y estado; Git de lectura confirmó `feature/lv-004-humor-engine` y árbol limpio al comenzar esta actualización. Creados PRODUCT_VISION y ROADMAP; modificados MASTER_PROMPT y PROJECT_STATE. Validación: revisión de coherencia/enlaces locales y `git diff --check`; no se repitieron pruebas de aplicación porque no cambió código. Sin commits, push, merge, cambios de rama, dependencias ni despliegues.

## LV-004B-02 — teclado y humor contextual universal (2026-10-29)

Rama `feature/lv-004-humor-engine` comprobada con Git de lectura. Conservados los cambios previos. Sin cambios de rama, commit, push, merge, deploy, dependencias nuevas o Mamá de LATAM.

Teclado: `KeyboardScroll` incorpora ajuste iOS, resize Android explícito, taps handled, medición del grupo campo/Comprobar y desplazamiento mínimo sin animación ni cambio de foco. Web usa VisualViewport y el scroll real del contenedor; no añade doble compensación cuando la ventana ya se redujo ni trata zoom como teclado. Safe areas y scroll manual se conservan. La primera comprobación headless reveló que la prueba no emitía eventos de foco de ventana; se corrigió el harness y se verificó geometría real en Chrome. Se contempló también recomposición de contenido tras cambio de ancho y se retiraron los diagnósticos temporales del código de producción.

Humor: catálogo universal versionado, independiente de región, con Messi Goku y Bon Jovi en francés y thank you berry much en inglés. Cada referencia tiene dos interpretaciones originales por entrenador para error/reintento/recurrencia. Contexto exige idioma, ámbito, ejercicio, objetivo, respuesta escrita incorrecta y patrón completo. No hay coincidencia fonética/parcial, calificación nueva ni afirmaciones sobre pronunciación. La entrada inglesa se prueba en dominio; la aventura jugable sigue siendo francesa. Añadir referencias no requiere modificar Learning Engine ni pantallas.

Privacidad/persistencia: entrada transitoria vinculada a la acción educativa reconstruida; se persiste únicamente evidencia versionada de referencia/patrón/evento, snapshot y progreso. La entrada libre arbitraria sigue descartándose. Reanudar valida contexto y conserva reacción. Un nuevo intento limpia evidencia anterior. Consentimiento y revocación se mantienen, con fallback educativo seguro.

Auditoría editorial: doce líneas forzadas o imprecisas sustituidas por nuevas ediciones; las originales se retiran de selección pero siguen restaurando snapshots. Se evitó, entre otros casos, afirmar que reintentar implica escribir exactamente la misma respuesta. Biblioteca total: 318 registros, 306 activos y doce archivados. Ejemplos, arquitectura, fuentes técnicas y QA en [ROAST_WRITTEN.md](ROAST_WRITTEN.md).

### Validación ejecutada

| Comando/prueba | Resultado |
| --- | --- |
| `npm.cmd test` | 94/94, cero fallos |
| `npm.cmd run typecheck:core` | salida 0 |
| `npm.cmd run typecheck` | salida 0 |
| `npm.cmd run lint` | salida 0, sin avisos tras excluir artefactos `.web-check` |
| `npm.cmd run export:web` | salida 0, bundle en `dist` |
| `npm.cmd run test:web -- --roast --browser "C:/Program Files/Google/Chrome/Application/chrome.exe"` | salida 0 fuera del sandbox; Chrome 156 real, consentimientos, 320/390 px × 420 de alto, campo/botón visibles, foco, ausencia de overflow, patrones incorrectos, recarga y revocación |
| `npm.cmd run test:web -- --browser "C:/Program Files/Google/Chrome/Application/chrome.exe"` | salida 0 fuera del sandbox; regresión completa cafetería, perfil, ramas té/para llevar/azúcar, error, ocho pasos, reanudación y reinicio |
| Git `diff --check` | sin errores de whitespace |

Pruebas nuevas: detección FR/EN y falsos positivos, idioma/ámbito/objetivo/ejercicio/formato/resultado incorrectos, alternativas regionales mediante RNG, consentimiento/revocación, restauración y evidencia mínima, fallback, retirada editorial y geometría de viewport. Se conserva la suite de aciertos equivalentes, errores conocidos/desconocidos y compatibilidad anterior.

Incidencias resueltas de herramientas: Chrome dentro del sandbox falla GPU/CDP `Page.enable`; fuera funciona. El test legacy esperaba exclusivamente «¡Bien resuelto!» incluso al recuperar un error; se actualizó a la acción real de continuación. Los perfiles temporales de Chrome crearon scripts de extensiones dentro de `.web-check`, que ESLint intentaba analizar; se excluyó esa carpeta generada (ya ignorada por Git). No se silenciaron errores de código de aplicación.

Capturas revisadas: `.web-check/roast-reduced-viewport.png` (campo y Comprobar visibles) y `.web-check/roast-easter-egg.png` (burbuja Messi Goku, corrección y traducción). **Viewport reducido no equivale a teclado del sistema**. Android 11 emulator-5554/Expo Go 57.0.9 detectados; los intentos con Metro 8087/8088 y adb reverse terminaron en `java.io.IOException: Failed to download remote update`, antes de aprendizaje. Se detuvieron los servidores y se retiraron los reverse creados. No se aprobó teclado Android nativo ni iOS/Safari. QA detallado pendiente en ROAST_WRITTEN.md.

Archivos nuevos: `src/components/KeyboardScroll.tsx`, `src/components/keyboardGeometry.ts`, `src/content/humorReferences.ts`, `src/domain/humor/references.ts`, `tests/humor-references.test.cjs`, `tests/keyboard.test.cjs`, `tasks/LV-004B-02.md`. Modificados: `app.json`, UI compartida, ExerciseView, MissionProvider, modelos/contexto/selector de humor, biblioteca Roast, repositorio de misión, `scripts/check-web.mjs`, `eslint.config.js` y documentación. Learning Engine, contenido educativo versionado, dependencias y consentimientos no modificados por LV-004B-02.

## LV-004B-01 — respuestas escritas y explicación con personalidad (2026-10-29)

Implementado en `feature/lv-004-humor-engine`, comprobada por Git de lectura y conservando todo el trabajo previo. Sin commit, push, merge, deploy, cambio de rama, dependencias nuevas ni Mamá de LATAM.

Roast v3: cuatro pasos escritos (saludo, precio, agradecimiento, despedida) y cuatro decisiones de opción múltiple, ocho objetivos y seis variantes. Equivalencias completas enseñadas y aceptadas explícitamente; diagnósticos solo para errores editoriales conocidos. Validadores desacoplados en `domain/learning/written.ts`, activados por `writtenRules`; evaluación legacy intacta. Partidas v2 cargan su lección archivada; nuevos recorridos usan v3. Las respuestas arbitrarias nuevas se reemplazan por marcador vacío al registrar el evento; las conocidas se conservan como formas canónicas editoriales, manteniendo evaluación e intentos reproducibles. No se purga retroactivamente texto histórico v2 por compatibilidad.

Feedback de acierto escrito con explicación pedagógica regional completa en lugar de texto neutro más comentario; ejemplo correcto/traducción y respuesta del interlocutor visibles. Errores incluyen reacción diagnóstica, explicación y ejemplo en un único bloque, sin éxito falso. Diagnóstico desconocido no inventa una causa. Biblioteca Roast total 234 líneas, manteniendo IDs/textos originales; nuevas expresiones salvadoreñas consentidas y voces propias de México, Colombia y Argentina.

Validación final ejecutada: `npm.cmd test` **87/87**, cero fallos; `npm.cmd run typecheck:core`, `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run export:web`: salida 0, sin avisos lint, bundle en `dist`. La expectativa anterior de igualdad entre el paquete nuevo y cafetería falló al introducir v3; se actualizó para comprobar igualdad del archivo v2 y se añadieron pruebas de ambas versiones. Cobertura: equivalencias, puntuación/caso, rechazo de similitud insuficiente, diagnóstico conservador, privacidad del evento, replay, selección regional/variedad, contexto incompatible, consentimiento/revocación, explicación única y v2→nuevo recorrido v3. Suites anteriores siguen pasando.

`node scripts/simulate-roast.mjs`: 1000 recorridos completos, dos ejecuciones idénticas, semilla 40402; 11 504 reacciones (2876 por región), 195 IDs usados, cero incompatibilidades, 40 reanudaciones, 9 repeticiones consecutivas sobre 11 500 transiciones dentro de región. Diagnósticos escritos: 100 ortográficos, 76 vocabulario, 24 estructura y 44 desconocidos. Se comprueba ausencia de texto privado desconocido en los eventos y diagnóstico compatible con cada reacción. 115/11 476 repeticiones entre selecciones de la misma región/categoría; ese indicador mezcla ejercicios, por lo que no equivale a un mismo error exacto. Informe `LV-004B01_SIMULATION.json`; no prueba eficacia pedagógica o aceptación cultural.

Archivos creados: `src/domain/learning/written.ts`, `src/content/roastTeaching.ts`, `tests/roast-written.test.cjs`, `tasks/LV-004B-01.md`, `docs/ROAST_WRITTEN.md`, `docs/LV-004B01_SIMULATION.json`. Modificados: paquete Roast, modelos/evaluación/validación educativa (extensión opt-in), contexto/modelos/selección de humor, biblioteca Roast, proveedor/pantalla de misión, CoachReaction/CoachCharacter/EducationalFeedback, pruebas Roast/presentación, simulador y documentación. Sin cambios al contenido francés de cafetería ni a sus reglas legacy.

Pendientes: validación visual web/Android/iOS, revisión cultural y docente externa. No se afirma ejecución visual de esta entrega; Chromium había fallado por GPU/CDP. Guía manual detallada en [ROAST_WRITTEN.md](ROAST_WRITTEN.md), incluidos errores conocidos/desconocidos, revocación, almacenamiento y reanudación. Logs locales `lv004b01-tests.log`, `lv004b01-export.log`, `lv004b01-simulation.log`.

## LV-004B — Roast Me jugable (2026-10-29)

Comprobación final: `npm.cmd run typecheck:core`, `npm.cmd run typecheck`, `npm.cmd run lint` y `npm.cmd run export:web` aprobaron con salida 0; lint sin avisos y bundle web generado en `dist`. `git diff --check` sin errores. Se repitieron typecheck/lint/export tras agregar el reintento de revocación fallida.

Implementado sobre `feature/lv-004-humor-engine`, comprobada con Git de solo lectura. Se preservaron los cambios previos de LV-004A/UI. Sin commits, push, merge, cambios de rama/permisos, deploy, dependencias nuevas ni gasto. Mamá de LATAM permanece fuera de alcance.

Acceso: Explorar → Modo Sin Pena → Roast Me. Dos confirmaciones independientes para mayoría de edad y consentimiento explícito, desmarcadas por defecto. Reutiliza consentimiento v1 local; rechazar conserva el aprendizaje normal. Revocación desde Perfil o la misión oculta inmediatamente el contenido y bloquea acceso. Si falla guardar, sigue oculto en esta sesión y se ofrece relectura/reintento; no se promete revocación durable ante almacenamiento fallido. Cambios de otra pestaña/foco/app activa fuerzan comprobar ajustes.

Recorrido A1: reutiliza los ocho objetivos, seis variantes y ramas francesas de cafetería v2, con ID y almacenamiento Roast independientes. Learning Engine y contenido francés no modificados. Eventos, objetivos y memoria existente cubren progreso; no se creó un motor paralelo. Feedback unificado de UI-02: identidad, resultado, explicación/corrección y reacción en una sola burbuja.

96 líneas editoriales completas, regionales, todas clasificadas adultas. Categorías existentes cubren error inicial, reintento, recurrencia verificada, recuperación, acierto con sorpresa editorial, progreso/desafío, celebración y fallback. Sin recuerdos ni pronunciación inventados. Variety Engine conserva su algoritmo; Roast reduce el peso base de la última línea del mismo pool a 0,05 para aprovechar la memoria dentro de sesión.

Pruebas: `npm.cmd test` 82/82, cero fallos. Se comprobó bloqueo por defecto, consentimiento incompleto/inválido, separación de intensidad normal, cuatro regiones, hechos reales para recurrencia/recuperación, revocación frente a escritor obsoleto, snapshot tras recarga, fallback, render adulto solo con consentimiento, convivencia de partidas y fallo de escritura. Las suites existentes LV-003/LV-004A siguen pasando. Un primer fallo de pruebas reveló que faltaba incluir `src/content/roast.ts` en la compilación core; se corrigió. Se corrigieron también dos avisos lint por importación duplicada.

`node scripts/simulate-roast.mjs`: 1000 misiones completas, semilla 40402, dos ejecuciones idénticas; 11 504 reacciones, 2876 por región, 83/96 IDs utilizados, cero incompatibilidades contextuales y 40 reanudaciones comprobadas. 109 repeticiones consecutivas (sobre 11 500 transiciones dentro de región, 0,95 %); 387/11 476 repeticiones entre selecciones de igual región/categoría (3,37 %). Antes del ajuste de peso: 1253 y 2875 respectivamente, misma semilla. Categorías: 7748 aciertos, 2000 avances, 1000 celebraciones, 252 recuperaciones, 440 recurrencias, 44 errores iniciales y 20 reintentos. Informe `docs/LV-004B_SIMULATION.json`; no equivale a calidad cultural, pedagogía validada externamente o experiencia visual aprobada.

Archivos nuevos: `app/roast.tsx`, `src/content/roast.ts`, `src/content/roastHumor.ts`, `src/domain/humor/access.ts`, `tests/roast.test.cjs`, `scripts/simulate-roast.mjs`, `tasks/LV-004B.md`, `docs/ROAST_ME.md`, `docs/LV-004B_SIMULATION.json`. Modificados: Explorar, Humor Engine, repositorio de misión, proveedores de misión/ajustes, pantalla de misión, reacción y ajustes del entrenador, pruebas de presentación, configuración core y documentación de estado/humor. No se modificó el manifiesto de dependencias en LV-004B.

QA visual web/Android/iOS pendiente. No se afirma ejecución visual de Roast: el intento Chromium anterior falló en GPU/CDP antes de cargar la UI. Guía reproducible, incluidos 320 px, teclado, lector, consentimiento, dos pestañas, cuota, recarga y Android/SQLite, en [ROAST_ME.md](ROAST_ME.md). Revisión cultural/docente externa pendiente. Logs locales: `lv004b-tests.log`, `lv004b-export.log`, `lv004b-simulation.log`.

## LV-004A-UI-02 — feedback unificado (2026-10-29)

Incluye el trabajo de presentación UI-01 que estaba en curso: entrenador antes de continuar, avatares locales reutilizables, feedback de menor peso visual, botones secundarios y aviso de audio en Perfil. UI-02 integra enseñanza y comentario en una sola burbuja del entrenador; elimina la duplicación entre tarjeta educativa y reacción. Sin humor o sin reacción compatible se conserva exclusivamente el feedback tradicional. Estados de error/reintento/recuperación y celebración explícitos; explicación, corrección y respuesta francesa originales completas.

Git: rama `feature/lv-004-humor-engine` comprobada mediante lectura. Había cambios previos de LV-004A, incluidos archivos sin seguimiento; se conservaron. Git inicialmente rechazó la propiedad del directorio; se consultó con `git -c safe.directory=<ruta-del-proyecto>` solo por comando, sin modificar configuración ni permisos. No hubo fetch, switch, commit, push, merge, deploy, dependencias nuevas ni trabajo de LV-004B.

Creados: `src/features/learning/EducationalFeedback.tsx`, `src/features/humor/CoachCharacter.tsx`, `tests/mission-presentation.test.cjs`. Modificados por estas tareas UI: `src/components/ui.tsx`, `src/features/learning/ExerciseView.tsx`, `src/features/learning/MissionScreen.tsx`, `src/features/humor/CoachReaction.tsx`, `src/features/humor/HumorSettings.tsx` y documentación de diseño/estado. Motores, contenido, proveedores y repositorios no modificados por las tareas UI; sus cambios previos de LV-004A permanecen.

Validación UI-02: `npm.cmd test`: 75/75, cero fallos. Incluye renderizado del TSX real con primitivas host sustituidas: cuatro regiones, orden de enseñanza/comentario/continuación, enseñanza una sola vez, humor desactivado/no disponible/incompatible sin contenedor, error con corrección, reintento, recuperación, celebración, render repetido estable y acciones de guardado/finalización. La persistencia real sigue cubierta por las suites existentes. Estas pruebas no ejercitan layout ni lectores reales. Una expectativa antigua de UI-01 falló al cambiar el orden de identidad/enseñanza; se actualizó al contrato unificado y se repitió la suite completa.

Validación visual intentada durante UI-01 con `LV_BROWSER_PATH=C:/Program Files/Google/Chrome/Application/chrome.exe; npm.cmd run test:web`: Chrome falla con GPU no utilizable y `CDP timeout: Page.enable`; no llegó a validar la interfaz. La petición de reintento fuera del sandbox fue interrumpida antes de ejecución; no se considera aprobada ni ejecutada. Log local: `lv004a-ui-browser.log`. No se afirma aceptación visual, Safari, Android o iOS. Logs locales adicionales: `lv004a-ui-tests.log`, `lv004a-ui-export.log`.

Comprobaciones finales UI-02: `npm.cmd run typecheck:core`, `npm.cmd run typecheck`, `npm.cmd run lint` y `npm.cmd run export:web` completadas sin diagnósticos, exportación generada en `dist`, salida final 0. En UI-01 lint detectó inicialmente un componente auxiliar sin display name; se nombró y las ejecuciones posteriores pasan.

QA manual reproducible:

1. Ejecutar `npm.cmd run web`, abrir la URL indicada, elegir francés y una región. En Perfil probar humor activado/desactivado y suave/juguetón, y guardar la región con el formulario existente.
2. Entrar a «Un café en París». Acertar: comprobar una sola burbuja con identidad, resultado, explicación y comentario, seguida de Continuar. Sin humor: solo bloque educativo, sin avatar ni hueco. Repetir con Luz, Toño, Vale y Romi.
3. Fallar, volver a fallar y acertar: corrección completa, reintento disponible y recuperación identificada. Confirmar que un error no habilita continuar y que guardar deshabilita acciones. Completar las ocho interacciones y comprobar celebración y confirmación de reinicio/cancelación.
4. Recargar con feedback correcto/incorrecto y al completar: mismo comentario, progreso y corrección; no nuevo sorteo. Avanzar rápido y recargar, comprobando que no hay esperas ni scroll automático.
5. Revisar a 320/375 px y escritorio, zoom 200 %, texto largo, orientación horizontal, teclado/foco visible, VoiceOver/TalkBack, contraste y safe areas. No debe haber truncamiento ni scroll horizontal. Activar reduced motion: no hay animaciones añadidas.
6. Repetir en Safari iPhone y Android/iOS con Expo Go compatible usando `npm.cmd start`; Windows no dispone de simulador iOS. La exportación web no sustituye pruebas de dispositivos ni SQLite.


Actualizado: 2026-10-28 (America/Denver). Alcance actual: LV-004A implementada para revisión técnica; aceptación visual y móvil pendiente. LV-004B no iniciada.


## LV-004A — Humor Engine y entrenadores regionales

Rama comprobada mediante Git de solo lectura: `feature/lv-004-humor-engine`; árbol limpio al comenzar. No se hicieron cambios de rama, commits, push, merge, deploy ni cambios de permisos. Sin dependencias nuevas ni cambios de SDK.

Implementación real: motor TypeScript separado de React Native; 128 reacciones editoriales versionadas para Luz (es-SV), Toño (es-MX), Vale (es-CO) y Romi (es-AR). Ocho categorías, cuatro alternativas por categoría/región; intensidades suave/juguetona. Reutiliza selección ponderada, historial y RNG del Variety Engine. Contexto derivado de evaluaciones e intentos reales; recurrencia requiere tres errores comprobados y recuperación exige errores del ejercicio actual. No se inventan pronunciación ni recuerdos.

Integración: tarjeta regional después de la corrección original, progreso y cierre. Perfil ofrece activar/desactivar comentarios e intensidad. Preferencias separadas con consentimiento adulto por defecto desactivado, versión y revocación; no hay activación adulta en UI ni textos adultos. Roast Me/Mamá de LATAM no implementados.

Persistencia: envelope de misión v3 con snapshot de reacción y mismo historial acotado; lee progreso plano y envelopes v2/v3, conserva contenido francés v1/v2 y reanudación sin nuevo sorteo. Ajustes con comparación de escritura y locks disponibles; una ventana obsoleta no restaura consentimiento revocado. Correcciones de revisión: rechazo de región inconsistente en snapshots y conflicto de escritura de preferencias, ambos con regresiones primero fallidas y después aprobadas.

### Evidencia ejecutada

| Comando | Resultado real |
| --- | --- |
| `npm test` | 70/70 aprobadas, 0 fallos |
| `npm run typecheck:core` | salida 0 |
| `npm run typecheck` | salida 0 |
| `npm run lint` | salida 0, sin avisos |
| `npm run export:web` | salida 0; exporta `dist` |
| `npm run simulate:variety` | salida 0; 1000 sesiones, 52 repeticiones consecutivas, máximo 2, seis variantes utilizadas |
| `npm run simulate:humor` | salida 0; 1000 misiones, 11 600 reacciones, 678 repeticiones consecutivas (5,8453 %), 0 incompatibilidades contextuales |
| `npm run check:expo` | fallo de red: `AggregateError [EACCES]` en `internalConnectMultiple`; reintento con `EXPO_OFFLINE=1` salida 0, pero Expo advierte validación no fiable sin red |
| `npm run test:web` | fallo: `CDP timeout: Browser.getVersion`; no valida visualmente la interfaz |

Simulación reproducible semilla 404 ejecutada dos veces y comparada: 2900 reacciones por región; 82/128 IDs utilizados; 600 errores reales registrados. Memoria final: 136 entradas, 64 recientes, un hecho de error, 38 050 caracteres. Cobertura editorial limitada por escenario: errores repetidos del mismo ejercicio pasan a recurrencia; general no se necesita. No equivale a validación de calidad pedagógica o percepción del humor por usuarios.

Archivos nuevos: dominio `src/domain/humor/`, biblioteca `src/content/humor.ts`, ajustes/tarjeta/proveedor en `src/features/humor/`, repositorio de ajustes, serialización compartida, dos suites de pruebas, simulación y reporte, tarea y plan. Modificados: layout, Perfil, proveedor/pantalla de misión, repositorio de misión, manifiesto (script), configuración core, expectativa del envelope en prueba de integración, reporte de simulación de variedad y documentación.

Ver [HUMOR_ENGINE.md](HUMOR_ENGINE.md) para contratos, personalidades, algoritmo, persistencia, ejemplos, límites y pasos manuales. Pendientes: aceptación visual en navegador, ejecución Android/iOS/SQLite, revisión cultural externa y pruebas con usuarios. No se afirma funcionamiento visual o nativo verificado. Se detiene en LV-004A para revisión.

## LV-003B — ampliación de variedad conversacional

### Resultado y alcance

Se mantienen seis identidades y el grafo de ocho objetivos, con seis perfiles franceses v2 que cambian pedido, lugar, azúcar e importe formulado. Cada pareja difiere en cuatro intervenciones centrales en el recorrido equivalente documentado; las pruebas verifican al menos dos diferencias centrales para cada pareja en las ocho rutas de decisiones. Se mantienen café/té, sur place/à emporter y aceptar/rechazar azúcar. Las preguntas completas y todas las respuestas nuevas tienen traducción y ayuda antes de evaluar. Se sigue orientando a A1 comunicativo; no se afirma validación docente externa o percepción comprobada mediante estudio de usuarios.

| Perfil | Diferencia central de conversación | Importe ficticio |
| --- | --- | ---: |
| Lucie | Qu’est-ce que vous prenez ?; pedido con Je voudrais; lugar abierto | 3 € |
| Samir | Qu’est-ce que je vous sers ?; pedido breve y confirmación de tomar aquí | 2 € |
| Camille | Vous voulez un café ou un thé ?; confirmar si se queda en el café | 2 € |
| Alex | Un café ? Un thé ?; Je prends; Avec ou sans sucre y respuestas con/sin | 1 € |
| Noémie | Vous voulez boire un café ou un thé ?; Ici ou à emporter y Du sucre ? | 3 € |
| Hugo | Je vous prépare un café ou un thé ?; ofrecer mesa y Un peu de sucre ? | 3 € |

Los ejemplos completos de las seis conversaciones, con las mismas decisiones y traducciones, están en `docs/LV-003B_CONVERSATIONS.md`. Se generan con `npm.cmd run document:conversations`. El paso de comprensión vuelve a mostrar el importe como ejercicio escrito, no como audio ni turno oral adicional ficticio.

### Persistencia y compatibilidad

Paquete anterior congelado en `src/content/cafe.v1.ts`, hash semántico SHA256 `2c2159ab58ddf12eb7a369c95a695754117d4b73e339e1c9280a66211fbd05f3`, comprobado por prueba. Paquete nuevo `cafe.v2.ts` con version 2 y mismos IDs de variante. `cafe.ts` resuelve por contentVersion. Solo se amplía el contrato/validador para versiones positivas: evaluación y transiciones no se reescriben. El proveedor, pantalla y repositorio usan el contenido guardado al continuar, e inician v2 al confirmar otro recorrido. El mismo run no puede cambiar de versión.

Se prueban las seis variantes v1 en registros planos y envueltos, tanto feedback inicial como feedback de precio antiguo de tres euros; continúan exactamente en v1, incluida su calificación. Un reinicio posterior abre v2. No se escribe durante la lectura legacy. El historial sin profileId se enriquece en memoria sin sumar apariciones ni alterar sus bytes almacenados; el siguiente guardado conserva formato de envoltorio v2. Se mantienen claves/adaptadores, CAS/locks y preferencias. Los IDs de estadísticas nuevas incluyen versión; la memoria v1 no se atribuye a las nuevas conversaciones. Downgrade a un cliente antiguo no se promete.

### Selector por conversación

Nueva firma del grafo central francés (preguntas, opciones, respuestas, réplicas y ramas), excluyendo nombres, ambientación, traducciones españolas, IDs internos y saludos/despedidas. Huella técnica no criptográfica. profileId opcional compatible en candidatos/contexto de historial; se agrupa frecuencia/última sesión por perfil y ámbito/idioma/categoría, tomando la memoria más fuerte de ID/perfil sin doble penalización. Repasos y alternativas únicas siguen disponibles.

La revisión independiente no detectó Critical/Important demostrados. Se corrigieron dos observaciones de calidad con regresiones RED→GREEN: enseñanza de precio heredada se ajustó al importe actual y la firma dejó de depender de traducciones españolas/IDs de nodos. Ordenación determinista independiente de la configuración regional. Revisión por lectura, no certificación pedagógica ni ejecución de plataforma.

### Validaciones ejecutadas

| Comando | Resultado real |
| --- | --- |
| `npm.cmd test` | 53/53 PASS (43 anteriores conservados como regresiones v1/genéricas y 10 pruebas de perfiles/versionado) |
| `npm.cmd run typecheck:core` | PASS |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run lint` | PASS, sin advertencias |
| `npm.cmd run export:web` | PASS, bundle local generado |
| `npm.cmd run simulate:variety` | PASS, 1000 misiones completas; simulación completa repetida para exigir igualdad exacta |
| `npm.cmd run document:conversations` | PASS, seis conversaciones completas y cuatro diferencias centrales mínimas en la ruta documentada |
| `$env:EXPO_OFFLINE='1'; npm.cmd run check:expo` | PASS; advierte validación menos fiable en modo offline |
| `npm.cmd run test:web` con Chromium local | FAIL durante arranque gráfico/CDP, GPU process exited / GPU process isn't usable y conexión WebSocket terminada antes de navegar. No se acredita prueba visual |

Los tests nuevos se observaron en rojo antes de implementar. El cambio de contenido hizo fallar seis expectativas antiguas de ayudas/preguntas idénticas: esas pruebas se conservaron apuntando a v1, no se eliminaron ni se alteraron para aceptar silenciosamente nuevos textos. La prueba de esquema desconocido comprueba schemaVersion 2; contentVersion 2 ahora es legítima. V2 tiene pruebas propias de las 48 rutas y apoyo/importe/coherencia. No se instalaron dependencias.

Simulación semilla 903, informe en `docs/LV-003B_SIMULATION.json`: 1000 misiones, ocho objetivos por misión, seis secuencias francesas visibles y seis huellas. Distribución Lucie 164, Samir 162, Camille 162, Alex 173, Noémie 166, Hugo 173. Repeticiones consecutivas: ID 52, perfil 52, preguntas visibles 52; racha máxima 2; referencia uniforme 185. Todos los perfiles usados hasta sesión 9. Control adicional con seis IDs que comparten dos conversaciones: ponderación por perfil 291 repeticiones frente a 426 solo por ID. Un solo candidato sigue completando 1000 selecciones con 999 repeticiones. Historial final 66 entradas/64 recientes/un hecho con 100 errores realmente evaluados; registro 22450 caracteres. Datos simulados, no usuarios ni aprendizaje medido, y no una garantía para toda semilla.

### Archivos y pendientes

Nuevos: `src/content/cafe.v1.ts`, `src/content/cafe.v2.ts`, `src/domain/learning/conversation.ts`, `tests/conversation-profiles.test.cjs`, `scripts/document-conversations.mjs`, `tasks/LV-003B.md`, `docs/LV-003B_PLAN.md`, `docs/LV-003B_CONVERSATIONS.md`, `docs/LV-003B_SIMULATION.json`.

Modificados en esta tarea: `src/content/cafe.ts`, `src/domain/learning/models.ts`, `validation.ts`, `variety.ts`; `src/domain/variety/models.ts`, `history.ts`, `selection.ts`; `src/storage/missionRepository.ts`; proveedor/pantalla de misión; tres suites anteriores para usar contenido congelado; simulador y prueba web; package.json (solo script documental); README y documentación de arquitectura/contenido/motores/estado. Los cambios de LV-003/auditoría ya pendientes se preservaron.

Rama comprobada feature/lv-003-variety-engine. Solo Git de lectura; sin cambios de rama, staging, commit, merge, push o permisos, sin deploy y sin LV-004. package-lock.json y dependencias intactos. Logs locales `lv003b-*.log`, build/artefactos de navegador ignorados.

Para comprobar manualmente: abrir Inicio/Explorar → aventura; si existe recorrido antiguo, primero verificar que continúa igual y después confirmar Reiniciar para v2. Comparar pedido/lugar/azúcar/importe, probar todas las decisiones y las respuestas admitidas por la ayuda. Recargar en feedback y comprobar versión/variante/importe inalterados. Probar errores/cuota/dos pestañas, accesibilidad y móviles reales. La evidencia textual y las pruebas demuestran diferencias sustanciales de contenido; la aceptación visual, Safari, Android/iOS y revisión docente externa siguen pendientes.

## Historial anterior de LV-003

## Auditoría posterior LV-003 — preguntas repetidas

Solicitud: investigar dos pruebas del usuario con preguntas iguales. Rama verificada feature/lv-003-variety-engine. Los cambios sin confirmar de la implementación LV-003 ya existían y se preservaron; solo Git de lectura, sin cambios de rama, commit, merge, permisos o push.

Hallazgo: integración funcional, variedad editorial limitada. Hay seis IDs/personajes pero solo dos perfiles franceses: A = Lucie/Alex/Hugo, B = Samir/Camille/Noémie. Las mismas decisiones producen exactamente las mismas preguntas dentro de cada perfil. Entre perfiles cambian cinco intervenciones de ocho (solo dos son preguntas: pedido y azúcar). Opciones, respuestas válidas, ayudas, correcciones, réplicas, precio y objetivos son iguales en todos. Nombres y escenas en español sí cambian y llegan al objeto Exercise mostrado. El informe previo sobre seis variantes no demostraba seis conversaciones diferentes.

Se confirmó por lectura la cadena Comenzar/Confirmar reinicio → provider.start → repository.start → selectContent con historia → variante por ID → currentExercise → ExerciseView. Una misión completada solo sortea de nuevo al confirmar reinicio; abrir resultado no lo hace. Una interrumpida conserva variante/estado al cargar. Prueba con RNG fijo 0.1 y persistencia: primero Lucie, tras completar/cargar historial Samir, con pregunta distinta recibida por la interfaz. Prueba Alex→Hugo reproduce todos los prompts iguales con dos IDs diferentes; no es fallo de lookup/UI. No se conoce el historial real del navegador del usuario para identificar sus dos variantes.

En el estado específico después de un primer recorrido y partiendo de memoria vacía, los pesos permiten aproximadamente 3.41% de repetir ID y 42.05% de repetir el perfil de preguntas bajo un sorteo uniforme. El selector actual penaliza IDs, no familias de conversaciones equivalentes. No se cambió esa lógica porque funciona como fue diseñada; se documenta el límite y se proponen mejoras futuras, sin implementarlas.

Cambio de esta auditoría: nuevo `tests/variety-visible-content.test.cjs` con siete pruebas selector→repositorio→Exercise que consume la pantalla; nuevo `docs/LV-003_VISIBLE_VARIETY_AUDIT.md` con matriz exacta de textos y propuestas; actualización de este estado y enlace en VARIETY_ENGINE.md. Sin cambios de producción, contenido ni dependencias. Baseline 36/36; suite ampliada 43/43. Las pruebas no montan componentes ni un navegador: no equivalen a aceptación visual. La comprobación visual de plataforma sigue pendiente.

Resultados: `npm.cmd test` 43/43 PASS; `npm.cmd run typecheck:core`, `npm.cmd run typecheck`, `npm.cmd run lint` y `npm.cmd run export:web` comprobados en esta auditoría. Logs locales ignorados `lv003-audit-*.log`. El inventario y las diferencias exactas, incluidas todas las introducciones, están en LV-003_VISIBLE_VARIETY_AUDIT.md.

## LV-003 — Variety Engine implementado, revisión pendiente del usuario

### Git y preservación

El usuario preparó y actualizó main por fast-forward fuera de Codex y creó `feature/lv-003-variety-engine`. Al iniciar esta continuación se verificaron rama correcta, árbol limpio y HEAD `fc41286ecf3c96ebcb89be0cea10939a902a76ca`. Solo se ejecutó Git de lectura (status, branch --show-current, log, diff, diff --check), usando safe.directory por comando ante diferencia de propietario; sin cambios de configuración global. No fetch/switch/merge/add/commit/push ni cambios de permisos/ACL en esta continuación. No se modificaron dependencias ni package-lock.json. Los cambios quedan sin staging para revisión/commit manual del usuario.

### Implementación

- Variety Engine puro reutilizable en/fr: candidatos, contexto, CEFR, categoría, objetivos, prerrequisitos, región futura, consentimiento técnico, referencia opcional a error real, pesos, RNG sembrable y decisión explicable. Filtros duros antes del sorteo; frecuencia/recencia/relevancia/nivel ajustan pesos positivos, sin prohibir repasos.
- Historia v1 acotada a 256 estadísticas LRU, 64 apariciones recientes y 64 hechos de error, con frecuencia, última sesión/fecha y contexto educativo mínimo. Contadores acotados; no se añade texto libre ni datos personales al historial Variety.
- Adaptador Learning→Variety deriva apariciones de entrada en escenas y errores exclusivamente del replay/evaluación real. Reanudar no sortea ni agrega apariciones. No se deduce pronunciación, dominio léxico o errores desconocidos.
- Repositorio conserva clave de misión y progreso v1 dentro de envoltorio v2 con history v1, en una sola escritura con CAS/locks. Lectura de progreso legacy reconstruye únicamente su recorrido observable, con fechas desconocidas null; no escribe ni cambia variante/escena/eventos/feedback al cargar. No inventa sesiones antiguas ni toca preferencias LV-001. Primer guardado persiste la migración.
- UI usa selección ponderada al comenzar/reiniciar y restaura exactamente el estado al continuar. Se conserva confirmación de reinicio, ahora indicando que se guarda resumen agregado de variantes y errores mientras se reemplaza el recorrido.
- Seis variantes editoriales, preservando intactas las dos originales. Nuevas: pluie-camille, carnet-alex, balade-noemie y lecture-hugo. Todas comparten ayudas, respuestas, ocho objetivos/calificación y ramas café/té, lugar y azúcar. Sin barajar pasos dependientes ni introducir vocabulario evaluado nuevo.
- Preparados contratos para reacciones, entrenadores/errores contextuales y misiones profesionales. No implementados otros motores completos, IA generativa, voces, humor adulto ni LV-004.

### Pruebas y simulación reales

| Comando | Resultado |
| --- | --- |
| `npm.cmd test` | 36/36 PASS: 23 pruebas existentes + 13 nuevas de variedad/integración/validación |
| `npm.cmd run typecheck:core` | PASS |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run lint` | PASS sin errores/advertencias en validación final; se corrigieron dos advertencias intermedias de import duplicado |
| `npm.cmd run export:web` | PASS, bundle Metro generado localmente; sin publicación |
| `npm.cmd run simulate:variety` | PASS; 1000 misiones completas + 1000 selecciones de candidato único, simulación repetida para exigir igualdad exacta con semilla 903 |
| `$env:EXPO_OFFLINE='1'; npm.cmd run check:expo` | PASS: Dependencies are up to date; advertencia explícita de validación menos fiable offline |
| `npm.cmd --cache .npm-cache --fetch-retries=0 --fetch-timeout=15000 run check:doctor` | 19/21, exit 1: esquema Expo requiere API (connect EACCES 34.110.201.56:443) y React Native Directory devuelve respuesta remota inesperada; Could not fetch bundled native modules. No se declaran aprobadas esas dos comprobaciones |
| `npm.cmd run test:web` con Chromium local | FAIL antes de navegación: GPU process exited -1073741790, GPU process isn't usable y timeout Page.enable. No se obtuvo captura ni aceptación visual |
| Git `diff --check` (solo lectura) | PASS; avisos informativos LF→CRLF de configuración existente, sin errores de whitespace |

Las pruebas nuevas se observaron en rojo antes de implementar: módulo del motor ausente, integración/start/history aún inexistentes y dos pruebas de validación pública que fallaron antes de corregirlas. En revisión de código independiente no se identificaron Critical/Important demostrables; se corrigieron dos Minor mediante pruebas RED→GREEN: metadatos con etiquetas duplicadas/sin límite y fechas/identidades inválidas aceptadas temporalmente por funciones públicas.

Cobertura nueva: relevancia contextual, pesos 1:3 con 1000 muestras sembradas, frecuencia/recencia, repetición con biblioteca única/agotada/vacía, en/fr, CEFR/prerrequisitos, región/consentimiento, hechos reales frente a errores no registrados, límites/serialización, migración sin escritura, reanudación estable, conservación de errores tras reiniciar, cuota/conflictos atómicos y 48 rutas educativas (6 variantes × 8 combinaciones), con ayudas/opciones/aceptación idénticas.

Simulación de 1000 sesiones con semilla 903:

| Variante | Selecciones |
| --- | ---: |
| matin-lucie | 164 |
| midi-samir | 162 |
| pluie-camille | 162 |
| carnet-alex | 173 |
| balade-noemie | 166 |
| lecture-hugo | 173 |

52 repeticiones consecutivas entre 999 transiciones (5.21%), frente a 185 (18.52%) en referencia uniforme controlada; racha máxima 2. Las seis variantes se usaron antes o en la sesión 9. Una biblioteca de un candidato completa 1000 selecciones con 999 repeticiones, sin bloquearse; vacía devuelve no-eligible-content. Las 1000 misiones completan ocho objetivos y se restauran cada 25 sesiones. Se detectan exactamente 100 errores introducidos en prix, agrupados en un hecho real. Historial retenido: 66 estadísticas, 64 eventos, un hecho; registro de 21844 caracteres. Se repite la simulación completa y se comparan resultados para reproducibilidad. Informe exacto: `docs/LV-003_SIMULATION.json`.

Son datos de simulación, no usuarios ni aprendizaje medido. Las cifras son de esta semilla/biblioteca/política, no una garantía universal de distribución. El historial se poda y puede olvidar contenido antiguo; no representa frecuencia vitalicia. Hay seis variantes finitas, no contenido infinito. Las fechas legacy null no se presentan como fechas reales de apariciones.

### Archivos y límites

Nuevos: `src/domain/variety/models.ts`, `selection.ts`, `history.ts`; `src/domain/learning/variety.ts`; `tests/variety.test.cjs`, `tests/variety-integration.test.cjs`; `scripts/simulate-variety.mjs`; `tasks/LV-003.md`; `docs/LV-003_PLAN.md`, `docs/LV-003_SIMULATION.json`, `docs/VARIETY_ENGINE.md`.

Modificados: `src/storage/missionRepository.ts`, `src/features/learning/MissionProvider.tsx`, `src/features/learning/MissionScreen.tsx`, `src/content/cafe.ts`, `tests/learning.test.cjs`, `scripts/check-web.mjs`, `package.json` (solo script simulate:variety), `README.md`, `docs/ARCHITECTURE.md`, `docs/LEARNING_ENGINE.md`, `docs/CONTENT_MODEL.md`, `docs/LV-002_MANUAL_TEST.md`, `docs/PROJECT_STATE.md`. No hay staging ni commit; no push/deploy. Artefactos locales ignorados: `lv003-*.log`, `.test-build/`, `.web-check/`, `dist/`.

Limitaciones: aceptación visual heredada y nueva integración sin ejecución aprobada en navegador real; Android/iOS no ejecutados; dos verificaciones remotas pendientes; revisión docente externa pendiente. Sin Web Locks no se garantiza atomicidad entre pestañas que escriban simultáneamente. RNG sembrado no criptográfico, sin promesa de impredecibilidad; usa semilla de reloj/sesión en runtime. Historia por ámbito de misión; no hay agregador global entre misiones todavía. El formato actual lee LV-002, pero un cliente antiguo no entiende el envoltorio v2 ni los nuevos IDs: downgrade requiere gestionar backup/migración, no se promete compatibilidad inversa.

Validación manual vigente en `docs/VARIETY_ENGINE.md`: iniciar/reiniciar varios recorridos, permitir repeticiones ocasionales, comprobar variante/estado idénticos al recargar, migración de registro legacy, error real retenido, cuota y conflicto entre pestañas. No es necesario cambiar idioma preferido. Comando de arranque: `npm.cmd run web` → Inicio/Explorar → aventura de París. Mensaje recomendado para commit manual: `feat: implementar Variety Engine antirrepetición`.

## Historial anterior: LV-002

## LV-002 — implementación y evidencia actual

**Implementación disponible; aceptación de interfaz pendiente.** Al empezar LV-002 ya existían node_modules y package-lock.json instalados fuera de la sesión previa. Se conservaron dependencias/lockfile y se verificó que Expo es 57.0.31, React/DOM 19.2.3, React Native 0.86.3, Web 0.21.4 y TS 6.0.3. El historial LV-001B siguiente describe una situación anterior, no la disponibilidad actual. Git sigue sin inicializar (`fatal: not a git repository`); se inspeccionaron los archivos existentes y se preservaron especificaciones y funcionalidades.

### Funcionalidad implementada

- Learning Engine puro: contratos TS de lección, variante, ejercicio de selección/texto, respuesta, evaluación, eventos y progreso; evaluación normalizada y determinista sin voz/IA/servicios.
- Paquete v1 `fr-a1-paris-cafe`, dos variantes: mañana/Lucie y mediodía/Samir. Diez nodos por variante, ocho interacciones educativas por cada recorrido; cinco de selección contextual y tres de escritura, con enseñanza antes de responder y alternativas correctas.
- Saludo → pedido café/té → sur place/à emporter → aceptar/rechazar azúcar → preguntar precio → comprender tres euros → agradecer → despedirse. Las ramas cambian confirmaciones/escenas/réplicas y se reúnen sin omitir objetivos. Precio ficticio identificado como parte de la historia.
- Validador: esquema, IDs, referencias, opciones, ciclos, nodos inalcanzables y todos los objetivos en orden por cada ruta. Las dos variantes mantienen las mismas ayudas/respuestas; selector sustituible por futuro Variety Engine. Alternancia simple y persistente por recorrido, sin fingir variedad contextual aleatoria.
- Feedback educativo de errores sin avance; aciertos requieren Continuar para leer la réplica. Contadores basados en eventos guardados, sin XP, nivel global o dominio CEFR inventado.
- Inicio y Explorar abren/continúan la misión; si la preferencia es inglés se informa que esta misión es francesa sin cambiar el perfil. Pantalla de misión con texto accesible, radio, controles de envío, feedback, resultado y reinicio confirmado.
- Repositorio de misión independiente sobre KeyValueStorage existente, web localStorage/nativo SQLite por resolución Metro. Persiste variante, intentos, decisiones, escena y feedback antes de actualizar UI. Valida por reproducción; errores no sobreescriben avance. Datos dañados se conservan hasta confirmar reinicio. Reiniciar reemplaza el último recorrido, sin borrar preferencias ni aparentar historial acumulado.
- Corrección del fallo de lint preexistente en hidratación de preferencias: estado inicial aplicado desde callbacks asíncronos, con cancelación al desmontar. No se desactivó la regla ni se cambió el comportamiento de preferencias.

### Evidencia ejecutada

| Comando/comprobación | Resultado real |
| --- | --- |
| Baseline `npm.cmd test` | 9/9 PASS antes de cambios |
| Baseline `npm.cmd run typecheck` | PASS |
| Baseline `npm.cmd run lint` | FAIL, react-hooks/set-state-in-effect en PreferencesProvider; corregido |
| Pruebas nuevas antes de implementar | Primero módulo ausente y luego funciones placeholder Not implemented; fallos observados antes de implementar evaluación/transiciones/repositorio |
| `npm.cmd test` | 23/23 PASS (9 preferencias + 14 aprendizaje/persistencia) |
| `npm.cmd run typecheck:core` | PASS |
| `npm.cmd run typecheck` | PASS, incluye rutas/UI/adaptadores |
| `npm.cmd run lint` | PASS, sin suprimir reglas |
| `npm.cmd run export:web` | PASS, bundle Metro y dist generados localmente; warning NO_COLOR/FORCE_COLOR, no error de compilación |
| `npm.cmd run check:expo` con red | FAIL, AggregateError EACCES al conectar |
| `$env:EXPO_OFFLINE='1'; npm.cmd run check:expo` | PASS: Dependencies are up to date; advierte que validación offline es menos fiable, no equivale a verificación remota |
| `npm.cmd --cache .npm-cache --fetch-retries=0 --fetch-timeout=15000 run check:doctor` | 19/21 checks; exit 1. Fallan esquema de app.json (fetch EACCES 34.110.201.56:443) y metadatos React Native Directory (unexpected server response). Warning: Could not fetch bundled native modules. No se presentan como problemas de esquema confirmados ni aprobación completa |
| `$env:EXPO_OFFLINE='1'; npm.cmd run web -- --host localhost --port 8083` | Servidor iniciado; Invoke-WebRequest http://localhost:8083 devolvió HTTP 200 y raíz HTML |
| `npm.cmd run test:web` con Chromium local 156.0.8078.4 | FAIL antes de cargar UI: Page.enable timeout; GPU process exited -1073741790, GPU process isn't usable. Se probó también sin aceleración GPU y falló igual. No captura ni aceptación visual |

Los 14 tests del aprendizaje cubren las 16 combinaciones variante/bebida/lugar/azúcar, ocho objetivos por ruta, preguntas escritas alternativas, acentos/apóstrofos, feedback sin avance, confirmación de aciertos, selector inyectable, contenido inválido, replay que rechaza finalización incoherente, cuota/datos dañados, preferencias preservadas, restauración de feedback/finalización entre repositorios y conflictos de escritores. Usan adaptador Storage simulado y memoria de prueba; no certifican SQLite real ni recarga del navegador.

Revisión independiente de código: ningún Critical; detectó Important de sobreescritura desde otra pestaña con avance antiguo. Se reprodujo mediante dos tests (21 PASS / 2 FAIL), se añadió instantánea esperada y serialización con Web Locks en web cuando existe, y luego la suite pasó 23/23. La UI muestra conflicto y exige releer antes de continuar. Repositorio requiere load antes de save. También se muestra la respuesta guardada en el feedback para entenderlo tras restaurar. El script de navegador no debe confundirse con cobertura visual aprobada: fue bloqueado antes de la navegación. Limitación explícita: sin Web Locks no hay garantía de atomicidad simultánea entre pestañas/procesos, aunque se detectan escrituras antiguas secuenciales; pendiente validación real multi pestaña.

Un intento inicial de arranque con `--offline --host localhost` fue rechazado por Expo porque esos flags son excluyentes; se corrigió usando EXPO_OFFLINE en el proceso y solo --host. No se cambió configuración global. Logs locales ignorados: `lv002-export.log`, `lv002-doctor.log`, `lv002-browser.log`, `lv002-browser-software.log`. La comprobación opcional de navegador crea perfiles nuevos en `.web-check/` y cierra sus procesos; no borra datos de usuario ni desactiva controles de seguridad.

### Archivos

Nuevos: `tasks/LV-002.md`, `docs/LV-002_PLAN.md`, `docs/LEARNING_ENGINE.md`, `docs/CONTENT_MODEL.md`, `docs/LV-002_MANUAL_TEST.md`; `src/domain/learning/models.ts`, `engine.ts`, `validation.ts`; `src/content/cafe.ts`; `src/storage/missionRepository.ts`; `src/features/learning/MissionProvider.tsx`, `MissionCard.tsx`, `MissionScreen.tsx`, `ExerciseView.tsx`; `app/explore.tsx`, `app/mission.tsx`; `tests/learning.test.cjs`; `scripts/check-web.mjs`.

Modificados: `app/index.tsx`, `app/_layout.tsx`, `src/features/preferences/PreferencesProvider.tsx`, `src/storage/contracts.ts`, `src/storage/browserStorage.ts`, `tsconfig.core.json`, `scripts/test.mjs`, `package.json` (solo script test:web), `.gitignore` (artefactos de navegador), `README.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT_STATE.md`. No se modificaron dependencias ni package-lock.json. Sin push, deploy, cuentas, servicios externos ni gasto. Sin LV-003 ni motores completos de humor/voz.

### Pendientes y límites

La evidencia permite afirmar que núcleo, tipos, lint y compilación web pasan; **no que la experiencia de interfaz esté aceptada en plataforma real**. Faltan prueba manual/automatizada de onboarding y misión completa, navegación Atrás, recarga, cuota real, confirmación de reinicio, teclado virtual, tamaño 320 px, lector de pantalla y Safari; Android/iOS tampoco ejecutados. No se generó captura. Faltan las dos comprobaciones remotas de Doctor cuando haya acceso permitido a sus APIs.

Contenido editorial revisado en implementación y validado estructuralmente; revisión docente externa pendiente. Ayudas visibles, expresiones admitidas finitas y reintentos ilimitados hasta límite técnico de eventos: no es evaluación de nivel independiente ni dominio A1 certificado. Solo conserva último recorrido. Migraciones de contenido/progreso posteriores todavía no existen; versiones incompatibles se muestran como error antes de un reinicio explícito.

Reproducción local y matriz de prueba con respuestas y fallos: `docs/LV-002_MANUAL_TEST.md`. Arranque: `npm.cmd run web` → Inicio → Explorar aventuras → Abrir aventura francesa → Comenzar aventura. Continuar retoma el registro guardado; reiniciar pide confirmación y cambia a la otra variante.

## Historial anterior: LV-001B

## LV-001B — aceptación técnica actual

**NO aceptada todavía.** Se diagnosticó el punto de fallo y se estabilizó la declaración de dependencias; no fue posible instalar ni ejecutar la interfaz con los permisos/red de esta sesión. La sección de LV-001 más abajo se conserva como historial; las referencias históricas al manifest con solo Expo y al bootstrap de varias instalaciones ya no describen los archivos actuales.

### Evidencia del bloqueo

Antes de modificar: se releyeron AGENTS, README, package.json, este estado, documento maestro y LV-001; se inspeccionaron rutas, formulario, proveedor, almacenamiento, tests y configuración. `git status --short` sigue fallando porque el directorio no es repositorio; no hay diff/historial Git que comparar. No se inicializó Git ni se cambiaron las especificaciones originales.

Reproducción inicial exacta:

```powershell
npm.cmd install --cache .npm-cache --loglevel=silly --timing --fetch-retries=0 --fetch-timeout=15000 *> lv001b-install.log
$installResult = $LASTEXITCODE
Get-Content lv001b-install.log -Tail 90
```

Salida: `npm http fetch GET https://registry.npmjs.org/expo attempt 1 failed with EACCES`. Ocurre en `fetch manifest`, antes de descargar/extractar paquetes o ejecutar scripts de dependencias. Stack: `D:\Software\node_modules\npm\node_modules\minipass-fetch\lib\index.js:130:14` → `_http_client` → `onSocketNT`. Esa ruta es código que reporta el error, **no un archivo cuya escritura esté denegada**.

- Node: 22.20.0; npm: 10.9.3; Windows_NT 10.0.26220. Identidad efectiva consultada con WindowsIdentity: `DESKTOP-DCM56L8\CodexSandboxOffline`.
- Registro efectivo: `https://registry.npmjs.org/`; proxy/https-proxy: `null`; offline: `false`; strict-ssl: `true`. No se imprimieron credenciales ni contenido de archivos de usuario.
- Caché por defecto: `C:\Users\jason\AppData\Local\npm-cache`; override para las instalaciones de esta tarea: `D:\Documents\Jason\LingoVerse\LingoVerse-Codex-Inicio\.npm-cache`. La opción local evita depender de escritura fuera del workspace. No se modificó configuración global.
- Configuración consultada: npm integrado `D:\Software\node_modules\npm\npmrc` contiene solo `prefix=${APPDATA}\npm`. No existen `.npmrc` del proyecto, `C:\Users\jason\.npmrc` ni `C:\Users\jason\AppData\Roaming\npm\etc\npmrc` en esta inspección. El prefix global no es destino de esta instalación local.
- ACL del proyecto: propietario jason; caché: propietario CodexSandboxOffline; entradas de modificación para usuarios autenticados y grupo CodexSandboxUsers. Prueba real desde Node: creación, escritura y lectura exitosas de `.npm-cache/lv001b-probe-2zJAn9/write-check.txt`. No se cambiaron ACLs ni se probó escritura fuera del workspace.
- DNS resolvió direcciones IPv4 e IPv6. HTTPS independiente de npm produjo `AggregateError [EACCES]`, con errores internos `syscall: connect`, `errno: -4092`, `port: 443`; ejemplos: `connect EACCES 104.16.6.34:443` y `connect EACCES 2606:4700::6810:922:443`. El mismo endpoint falla sin npm, por lo que caché/configuración de npm no explican esta denegación de socket.
- La primera sonda intentó además `os.userInfo()` y falló con `uv_os_get_passwd ENOMEM`; se retiró esa consulta no necesaria y se repitieron independientemente escritura/DNS/HTTPS. No se interpreta ese error como evidencia de falta real de RAM ni como causa de EACCES.

Conclusión delimitada: se confirma denegación de conexión desde el proceso bajo el contexto offline y red restringida declarado por esta sesión. No es un error demostrado de permisos de archivos del proyecto. La identidad offline y la política del entorno son evidencia del bloqueo en este contexto; sin repetir en terminal normal no puede descartarse que el anfitrión imponga también una política de red ni identificarse un componente concreto de firewall/seguridad. No se solicitó elevación, no se ejecutó como administrador, no se desactivó seguridad ni se intentó evadir la restricción.

### Correcciones y versiones

Se conservó SDK 57. El manifest anterior solo declaraba Expo y dejaba herramientas sin rangos hasta bootstrap. Ahora declara todas las dependencias requeridas con rangos de la [plantilla SDK 57](https://raw.githubusercontent.com/expo/expo/sdk-57/templates/expo-template-default/package.json) y [bundledNativeModules SDK 57](https://raw.githubusercontent.com/expo/expo/sdk-57/packages/expo/bundledNativeModules.json). La [tabla oficial](https://docs.expo.dev/versions/v57.0.0/) exige Node mínimo 22.13.x, satisfecho por el instalado.

| Dependencia | Declaración actual, NO instalación verificada |
| --- | --- |
| expo | ~57.0.31 |
| react / react-dom | 19.2.3 |
| react-native | 0.86.3 |
| react-native-web | ~0.21.0 |
| expo-router | ~57.0.29 |
| @expo/metro-runtime | ~57.0.17 |
| expo-constants / expo-linking | ~57.0.22 / ~57.0.13 |
| expo-sqlite / expo-status-bar | ~57.0.4 / ~57.0.1 |
| react-native-safe-area-context / react-native-screens | ~5.7.0 / ~4.26.0 |
| typescript / @types/react | ~6.0.3 / ~19.2.2 |
| eslint-config-expo / eslint | ~57.0.2 / ^9.22.0 |

ESLint se mantiene en major 9; el mínimo escogido admite el helper `defineConfig` usado por el archivo existente. Expo config declara peer ESLint >=8.10; la compatibilidad efectiva queda sin comprobar. No se instalaron paquetes opcionales de audio, animación, servicios o contenido. La rama oficial consultada es una referencia de versiones; solo una instalación y un lockfile exitosos fijarán las resoluciones exactas.

`scripts/setup.mjs` instala el manifiesto completo y ejecuta `npm run check:expo`; no elige SDK nuevo ni añade dependencias dinámicamente. Se agregaron `check:expo`, `check:doctor` y `diagnose:npm`. El diagnóstico crea únicamente archivos nuevos en caché local y consulta DNS/HTTPS; no elimina datos ni cambia configuración.

Tras el cambio se repitió la instalación detallada en `lv001b-install-final.log`: todos los 17 manifests solicitados devolvieron EACCES; el error final corresponde a `https://registry.npmjs.org/@expo%2fmetro-runtime`. Log nativo completo: `.npm-cache/_logs/2026-10-29T02_50_09_067Z-debug-0.log`. El inicial está en `.npm-cache/_logs/2026-10-29T02_48_29_105Z-debug-0.log`. No existen `node_modules` ni `package-lock.json`; no se fabricó lockfile ni se afirma instalación exitosa.

### Comprobaciones de LV-001B

| Comando | Código de salida / resultado |
| --- | --- |
| instalación detallada con caché local | 1, EACCES en connect al registro |
| `npm.cmd run diagnose:npm` | 1: escritura y DNS OK; HTTPS EACCES |
| `npm.cmd test` | 0, 9/9 PASS con TypeScript global 6.0.3 |
| `npm.cmd run typecheck:core` | 0, PASS |
| `npm.cmd run typecheck` | 2, FAIL: 107 diagnósticos; expo/tsconfig.base y React/Expo/tipos ausentes, con errores derivados de JSX, key e inferencia |
| `npm.cmd run lint` | 1, FAIL: eslint no instalado |
| `npm.cmd run check:expo` | 1, FAIL: MODULE_NOT_FOUND de node_modules/expo/bin/cli |
| `npm.cmd --cache .npm-cache --fetch-retries=0 --fetch-timeout=15000 run check:doctor` | 1, FAIL: EACCES al obtener https://registry.npmjs.org/expo-doctor; Doctor no llegó a ejecutarse |
| `npm.cmd run web` | 1, FAIL: CLI local ausente; no servidor activo |
| `npm.cmd run export:web` | 1, FAIL: CLI local ausente; no se llegó a evaluar compatibilidad del bundle |
| `node --check` de setup, diagnose-npm, test y eslint.config.js | 0 en cada archivo; solo comprobación sintáctica JS |

Las salidas se conservaron en `lv001b-tests.log`, `lv001b-core.log`, `lv001b-typecheck.log`, `lv001b-lint.log`, `lv001b-expo.log`, `lv001b-doctor.log`, `lv001b-web.log`, `lv001b-export.log` y `lv001b-diagnose.log`. Son artefactos locales ignorados por .gitignore, no pruebas aprobadas por su mera existencia. Los mensajes NativeCommandError de PowerShell envuelven stderr de npm; los códigos anteriores son los del proceso capturados antes de leer el log.

Web visual: **pendiente**, sin aplicación arrancada ni herramienta de navegador conectada disponible. No se aprobaron onboarding, ocho combinaciones, invitado, Inicio/Perfil, Atrás, borradores, estados vacíos/errores ni persistencia tras recargar en plataforma real. README incluye procedimiento manual y reproducción de fallos en un perfil de prueba separado. Android/iOS no ejecutados en LV-001B; no se reinterpreta la prueba de almacenamiento en memoria como prueba de SQLite o navegador.

### Archivos cambiados y continuación

Modificados: `package.json`, `scripts/setup.mjs`, `README.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT_STATE.md`. Creado: `scripts/diagnose-npm.mjs`. Artefactos adicionales: logs `lv001b-*.log` y sondas de caché. No se modificaron rutas, UI, dominios, contenido, tests ni documentos originales de especificación.

En PowerShell normal, sin administrador:

```powershell
Set-Location -LiteralPath 'D:\Documents\Jason\LingoVerse\LingoVerse-Codex-Inicio'
npm.cmd run diagnose:npm
if ($LASTEXITCODE -ne 0) { throw 'Revisar el diagnóstico de escritura/DNS/HTTPS antes de continuar.' }
npm.cmd --cache .npm-cache run setup
if ($LASTEXITCODE -ne 0) { throw 'La instalación/validación falló.' }
npm.cmd test
npm.cmd run typecheck:core
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run check:expo
npm.cmd --cache .npm-cache run check:doctor
npm.cmd run export:web
npm.cmd run web
```

Registrar y resolver cada fallo antes de aceptar. Si el diagnóstico funciona fuera del sandbox, completar instalación, conservar el lockfile, comprobar versiones reales con `npm.cmd ls --depth=0` y ejecutar todas las verificaciones. Si connect EACCES persiste fuera, conservar la evidencia y revisar con el responsable del anfitrión la política de red; no recomendar administrador, cambios globales de permisos ni desactivar controles. El simple cambio de caché no puede corregir connect EACCES. LV-002 permanece fuera de alcance hasta aceptar esta base.

## Historial de LV-001

## Resultado actual

Código de base preparado, **LV-001 todavía no cumple todos sus criterios de aceptación**: faltan instalación efectiva, compilación, lint/typecheck completos y ejecución de plataformas. No declarar esta entrega como aplicación probada. No se hicieron push, deploy, commits, cuentas, contrataciones ni gastos.

## Inspección previa

- Directorio inicial: AGENTS.md, COMENZAR_AQUI.md, docs/MASTER_PROMPT.md, tasks/LV-001.md; sin código ni Git (`git status --short`: fatal, no es repositorio).
- Se leyeron los cuatro documentos originales y se preservaron sin modificaciones.
- Windows/PowerShell, Node 22.20.0, npm 10.9.3, TypeScript global 6.0.3, Git disponible, Java 11.0.19.7.
- Android SDK presente en `%LOCALAPPDATA%/Android/Sdk` pero adb fuera de PATH. Invocado por ruta absoluta: no pudo iniciar daemon (`could not read ok from ADB Server`). AVDs listados: Pixel_5_API_30, Pixel_5_API_34, Pixel_C_API_30. No se inició ningún emulador ni se ejecutó la app.
- iOS: Windows sin Xcode/simulador. Sin ejecución en iPhone físico.

## Implementado en código

- Configuración Expo/Router/Web y TS estricto, con SDK 57 como objetivo, no instalado. Selección documentada por transición de Expo Go en las notas oficiales de SDK 58.
- Bootstrap `npm run setup`: Expo primero, resolución de paquetes con `expo install`, herramientas de desarrollo y comprobación de dependencias. El manifest inicial declara solo Expo para no inventar versiones compatibles; setup debe completarlo y generar lockfile antes de usar la app.
- Onboarding invitado inglés/francés, cuatro regiones, guardado y redirección después del éxito; perfil con cambios y confirmación; Inicio muestra preferencias auténticas y misiones pendientes.
- Tokens propios y componentes con safe areas, scroll, opciones accesibles, áreas táctiles y errores. Sin recursos externos.
- Modelo versionado y validado; idioma de aprendizaje, interfaz, entrenador y proveedor separados. Audio y humor explícito desactivados; no se crea consentimiento.
- Repositorio inyectable con adaptadores SQLite kv-store nativo y localStorage web diferido. No hay almacenamiento en memoria de producción ni simulación de sincronización.
- Estados de carga, lectura fallida con reintento, recuperación de JSON inválido y escritura fallida conservando borrador. Guardado concurrente bloqueado.

## Comandos y evidencia

| Comando | Resultado observado |
| --- | --- |
| `git status --short`, `rg --files`, `Get-ChildItem -Force` | Sin Git; se inspeccionó el inventario original |
| `node --version`, `npm.cmd --version`, `tsc.cmd --version` | 22.20.0 / 10.9.3 / 6.0.3 |
| `npm.cmd view expo version --fetch-retries=0 --fetch-timeout=15000` | EACCES al registro; no se obtuvo versión efectiva |
| `npm.cmd cache ls expo`, `npm.cmd view expo version --offline` | Referencias antiguas en caché; consulta offline ENOTCACHED, sin SDK utilizable |
| `npm.cmd --cache .npm-cache run setup` | Falló en npm install: EACCES a registry.npmjs.org/expo incluso usando caché escribible |
| `npm.cmd test` | 9/9 PASS; se observó primero RED por funciones no implementadas y después GREEN |
| Regresión de arrays como identificadores | Se observó 8/9 con `Missing expected exception`, corrección de tipos y después 9/9 PASS |
| `npm.cmd run typecheck:core` | PASS, núcleo y adaptador navegador bajo TypeScript estricto |
| `npm.cmd run typecheck` | FAIL: dependencias React/Expo ausentes, base expo/tsconfig.base no encontrada y errores derivados de JSX/tipos; no se certifica la UI |
| `npm.cmd run lint` | FAIL: eslint no instalado |
| `npm.cmd run web`, `npm.cmd run export:web` | FAIL: CLI Expo local ausente (MODULE_NOT_FOUND); no se generó web ni captura |
| `node --check scripts/setup.mjs`, `node --check scripts/test.mjs`, `node --check eslint.config.js` | PASS sintáctico; no sustituye lint |
| `adb.exe devices`, `emulator.exe -list-avds` | Falló daemon de ADB; AVDs listados, ninguna ejecución móvil |

El primer intento web encontró una CLI Expo global antigua (incompatible con Node moderno), con EPERM al escribir su estado; el intento de exportación indicó Expo ausente. Se corrigieron los scripts para invocar exclusivamente `node_modules/expo/bin/cli`. Los intentos finales fallan claramente por dependencia local ausente. No se modifica la instalación global.

`expo install --check` y Expo Doctor no pudieron verificarse por falta del SDK instalado; no se presentan como pruebas aprobadas. Las 9 pruebas usan adaptador en memoria de prueba y una implementación mínima de Storage, no navegador real ni SQLite. Cubren defaults, ocho combinaciones de selección, restauración entre repositorios, datos inválidos/versiones desconocidas, errores de lectura/escritura, resolución diferida y persistencia entre adaptadores web.

## Inventario de archivos creados

- Raíz: `.gitignore`, `package.json`, `app.json`, `tsconfig.json`, `tsconfig.core.json`, `expo-env.d.ts`, `eslint.config.js`, `README.md`.
- Rutas: `app/_layout.tsx`, `app/index.tsx`, `app/onboarding.tsx`, `app/profile.tsx`.
- UI/contenido: `src/components/ui.tsx`, `src/theme/tokens.ts`, `src/content/preferences.ts`.
- Preferencias: `src/domain/preferences.ts`, `src/features/preferences/PreferencesProvider.tsx`, `src/features/preferences/PreferencesForm.tsx`.
- Persistencia: `src/storage/contracts.ts`, `src/storage/preferencesRepository.ts`, `src/storage/browserStorage.ts`, `src/storage/deviceStorage.ts`, `src/storage/deviceStorage.web.ts`.
- Herramientas/pruebas: `scripts/setup.mjs`, `scripts/test.mjs`, `tests/preferences.test.cjs`.
- Documentación: `docs/LV-001_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/PROJECT_STATE.md`.
- Artefactos locales ignorados: `.test-build/` (TS compilado para tests), `.npm-cache/` (logs de instalación fallida). Sin package-lock porque la instalación no se completó.

## Bloqueos y continuación exacta de LV-001

1. Ejecutar `npm run setup` en un entorno con acceso permitido al registro npm. Revisar dependencias efectivas y conservar package-lock; no se solicitaron escalaciones que esta sesión prohíbe.
2. Ejecutar typecheck completo, lint, tests, expo install --check, Expo Doctor y export:web; corregir incompatibilidades reales antes de dar por terminada la tarea.
3. Abrir web y revisar onboarding, perfil, persistencia al recargar/reabrir, URLs directas, fallos de almacenamiento y datos corruptos; capturar móvil 320 px y escritorio. La lista manual completa está en README.
4. Ejecutar en Android/iOS real o emulador compatible y validar SQLite tras terminar/reabrir la app. Verificar accesibilidad con lector, teclado y fuente grande. No hay evidencia de compatibilidad probada en ninguna plataforma.
5. Revisar privacidad/clasificación por edades antes de una futura publicación; no hay cuentas ni consentimiento adulto que revisar en este flujo.

Siguiente tarea propuesta, solo después de aceptar LV-001: definir LV-002 para una primera experiencia educativa A1 acotada, contenido validado y contratos de dominio. No se creó ni implementó esa tarea.
