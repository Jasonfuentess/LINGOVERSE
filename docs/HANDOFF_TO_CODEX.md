# Transferencia actual — LV-007-LEARN-02 (31-oct-2026)

Leer tarea, diseño y QA de LEARN-02 antes de historia inferior. Fuente definitiva LingoVerse Main; sin `.git`, no recuperar Git ni usar copia antigua sin autorización. Respaldo190 archivos SHA-verificado en `.backups/LV-007-LEARN-02-20261031-020719`. No borrar ni reiniciar progreso. UI aprobada se conserva.

LEARN-01 falló manualmente según el usuario: preparaba dos saludos y excluía rendez-vous/texto. Ahora `LearningRescue` prepara cada turno de las tres aventuras a partir de respuestas editoriales aceptadas, permite modelo visible antes del error desde cero, otros modos A1/Autónomo, construcción y práctica local sin envío. Modelos/voz no dependen de reconocer bien el micrófono. `Preparar esta respuesta con ayuda` solo llena borrador; Responder envía. La aproximación nunca se usa como voz/modelo STT/evaluación.

11 guías aproximadas revisadas editorialmente por IA contra diccionarios en `content/pronunciation.ts`, fuentes/IPA/notas incluidas, no humanamente ni acústicamente certificadas. Usar solo segmentos revisados; no volver a dividir Bonjour en bon/jour ni S’il vous plaît en partes incompletas. Fallback de escucha por grupos si el motor no ralentiza. Mantener limitación de voces y permisos explícita.

Eventos nuevos pueden incluir support assisted/independent; replay conserva y valida, ausencia vieja queda sin registro. No inferir dominio ni independencia de datos antiguos. Ignorar incertidumbre como nuevo error confirmado/roast de aventura. Roast inglés/francés visible, opt-in adulto y activación explícita; mismo motor con subconjunto de texto existente compatible por idioma. Live no existe. Los contenidos y todas sus versiones siguen idénticos al respaldo (Londres actual v4 y archivos v1/v2/v3), sin migraciones narrativas.

**193/193 tests**, types core/general, lint sin advertencias y export PASS. Chrome GPU/timeout CDP antes de cargar: no captura ni audio perceptivo/móvil/nativo ni aceptación de principiante. Revisión de código y lingüística editoriales realizadas; dos defectos de revisión corregidos con regresiones. Ejecutar guía manual de18 puntos en `docs/LV-007-LEARN-02-QA.md`; `scripts/check-premium.mjs --rescue` preparado para perfil aislado y capturas320/390/1280 si Chrome funciona. No afirmar éxito educativo solo por suite verde.

Pendiente: usuario/estudiante real y voz, rate perceptivo/fallback, accesibilidad/teclado móvil, revisión docente y ampliar catálogo solo con evidencia. No iniciar nuevas aventuras, LV-007B o Live sin nueva instrucción. Sin Git/commit/push/merge/deploy. Historial debajo.

# Transferencia actual — LV-007-LEARN-01 (31-oct-2026)

Leer `tasks/LV-007-LEARN-01.md`, `docs/LV-007-LEARN-01-DESIGN.md`, `docs/LV-007-LEARN-01-QA.md` y encabezado actual de PROJECT_STATE. Fuente única sigue siendo `D:\Documents\Jason\LingoVerse\LingoVerse Main\LingoVerse-Codex-Inicio`, con respaldo verificado de177 archivos en `.backups/LV-007-LEARN-01-20261031-010218`; sin `.git`, no inicializar ni recuperar Git ni copiar del proyecto anterior sin autorización.

**Implementado:** guía voluntaria de principiantes solo en café/bonjour y Londres/greet; orientación pre-A1/A1 por elección y modo por idioma, checkpoints separados de misiones, modelo normal/lento, preparación por partes y transferencia. La identidad UI anterior se conserva y el usuario la considera positiva. No confundir esa valoración con QA de Codex. STT conserva evidencia de incertidumbre y configuración de idioma; revisión/edición/confirmación solo preparan borrador y requieren envío explícito. No hay detección fiable del idioma hablado ni evaluación fonética. Reconocimiento no disponible/permisos/silencio mantienen alternativas.

Londres nuevo usa **v4**, con saludo + aceptación real de ayuda y alternativas editoriales exactas; **v3 archivada idéntica** al original, importada en selector/repositorio junto a v1/v2. No sustituir una partida v3 por v4: conservar replay y feedback; nuevo contenido solo en partida nueva. Idioma/guía se guardan en `lingoverse.learning-support.v1`, sin sobrescribir preferencias antiguas, misión o consentimiento. Si la ayuda está dañada no borrarla automáticamente; continuar con ayudas habituales y reintento.

**Pruebas:** baseline166/166 → **181/181 (15 nuevas)**; core/general typecheck, lint sin advertencias y export PASS. Ocho casos históricos de LV-007A no se recuperaron ni cuentan como cobertura existente; diagnóstico en documentos nuevos. Chrome falla antes de cargar por GPU y timeout `Page.enable`: sin capturas, QA auditivo, estudiante real ni nativo. `scripts/check-premium.mjs --beginner` está preparado para guías con recargas y recorridos completos cuando Chrome funcione. Consultar checklist manual de18 pasos antes de declarar aceptación.

**No hacer:** nuevas aventuras, LV-007B o Roast Me Live sin nueva instrucción; no Git/commit/push/merge/deploy. Live solo registrado en visión/roadmap con intensidad extrema regional, consentimiento específico, voz/risas reales y corrección final; enseñar a principiantes y evitar penalizar transcripción incierta sigue primero. Las10/10 LV-006B son validación reportada por el usuario.

Los apartados siguientes son transferencias históricas; la entrega actual anterior prevalece.

# Actualización local confirmada (31-oct-2026)

**Entrega actual LV-007-UI-01:** rediseño implementado, pendiente de aceptación visual del usuario. Leer `tasks/LV-007-UI-01.md`, `docs/LV-007-UI-01-DESIGN.md` y `docs/LV-007-UI-01-QA.md`. Inicio/Explorar con portadas, aventura compacta y NPC pictóricos, estados de interacción/feedback, entrenadores, Perfil/voz y Roast Me refinados; cinco accesos con Practicar real y Trabajo sin misión ficticia. Dos atlas locales originales; motores/contenidos/claves y dependencias intactos. Tests166/166, tipos/lint/export PASS; Chrome bloqueado antes de cargar, sin capturas ni aceptación visual. Guía manual de18 pasos y verificador `scripts/check-premium.mjs` preparados. No iniciar LV-007B hasta validar esta fase.

Fuente principal: `D:\Documents\Jason\LingoVerse\LingoVerse Main\LingoVerse-Codex-Inicio`; no utilizar la carpeta antigua ni copiar desde ella sin autorización. El usuario reportó **10/10 pruebas manuales de LV-006B en Chrome aprobadas**, ejecutadas por él, no por Codex. No extenderlo a LV-007A o plataformas nativas.

En esta copia: **166/166 tests**, typecheck core/general, lint y export web aprobados. Faltan el archivo de tests específico de LV-007A, sus tres casos de presentación y dos documentos referenciados; su código de continuidad/audio sí existe. Consultar el nuevo encabezado de `PROJECT_STATE.md`. Git no reconoce un repositorio aquí: no inicializar, recuperar ni modificar Git sin acordar el procedimiento. Sin commits, push, merge o deploy. LV-007B no autorizado; el alcance completo LV-007-UI-01 fue proporcionado y ejecutado durante esta sesión.

El contenido que sigue es el registro histórico de transferencia.

# Transferencia actual a Codex — LV-006B (31-oct-2026)

> **Trabajar desde el árbol actualizado LV-006B**, no desde ZIP de LV-006A o LV-007A sin sus parches. Esta sección prevalece sobre instrucciones históricas debajo. El directorio Windows del usuario no estuvo montado aquí; se trabajó sobre una copia extraída de `LingoVerse-LV-007A-Proyecto-Actualizado.zip`. No se inspeccionó ni modificó su Git local, no hubo commit, push, merge, reset, checkout ni deploy. **No sobrescribir nuevos cambios del usuario** sin compararlos.

## Estado y evidencia real

- Baseline con LV-007A: `npm test` **160/160 PASS**. La aceptación manual de LV-007A no se ha reportado.
- LV-006B nueva: `npm test` **174/174 PASS**, 14 nuevas; `npm run typecheck:core` OK; `npm run typecheck` OK; `npm run lint` OK (0 errores/advertencias); `npm run export:web` OK.
- Chromium: `node scripts/check-web.mjs --browser /tmp/lingoverse-chromium` **NO aprobado**, navegador mostró `127.0.0.1 is blocked` antes de cargar LingoVerse. No presentar como QA real ni como defecto comprobado de la app.
- Confirmación previa del usuario: LV-005B-02 (9/9 pasos Chrome) y LV-006A-REV-01 funciona después de reparar archivo `london.v1.ts`. Android/iOS nativos, nueva aventura francesa, pronunciación real, STT y voces de LV-006B sin QA físico.

## Funcionalidad implementada

`fr-a1-paris-rendezvous` v1, idioma francés A1. Dos variantes seleccionables por Variety Engine, dos rutas por variante, diez objetivos cada una. Jardín de Luxemburgo: Juliette ayuda a localizar a Inès junto a la fuente; árbol/banco verde con Adrien vs flores/portón con Nadia. Sena: Margot orienta hacia Émile junto al quiosco verde; puente/Hugo vs bouquinistes/Zoé. Cada ruta tiene diez escenas secuenciales verificadas y final con actividad seleccionable. Pistas progresivas y traducción desplegable (no anticipada), feedback educativo con corrección solo para errores realmente catalogados y equivalente natural reconocido; incertidumbre honesta para entradas fuera del catálogo. Nodos futuros no se muestran. Se reutilizan TTS `fr-FR`, STT web `fr-FR` con revisión antes de responder, escritura alternativa y coach español.

## Archivos nuevos (LV-006B)

- `src/content/rendezvous.ts`: historia original, personajes, 2 variantes/4 rutas, diez objetivos, reglas de escritura verificadas, ID/versiones.
- `app/rendezvous.tsx`: navegación independiente.
- `tests/rendezvous.test.cjs`: 11 regresiones de contenido, respuestas, ramas, reanudación, aislamiento, voz y compatibilidad.
- `tests/rendezvous-presentation.test.cjs`: 3 pruebas del render real TSX con adaptadores simulados; **no** sintetizan audio físico.
- `tasks/LV-006B.md`: tarea implementada y límites.
- `docs/LV-006B-ADVENTURE-AND-QA.md`: secuencia CEFR A1, inventario de diálogos y checklist manual.

## Archivos modificados (LV-006B)

- `app/_layout.tsx`: tercera instancia del proveedor de misión con contexto propio.
- `app/index.tsx`, `app/explore.tsx`: tarjeta de aventura de francés sin rediseño.
- `src/features/learning/MissionProvider.tsx`: repo/contexto `rendezvous`, selector sin romper `useMission()` anterior. La clave local nueva es `lingoverse.mission.fr-a1-paris-rendezvous.v1`.
- `src/features/learning/MissionScreen.tsx`: misión genérica con `adventure='rendezvous'`, textos adaptados, repaso y aislamiento.
- `src/features/learning/MissionCard.tsx`: `RendezvousMissionCard` con progreso propio.
- `src/features/learning/Conversation.tsx`, `src/components/AdventureArt.tsx`: arte narrativo original para jardín y Sena (primitivas RN); retratos tipográficos para personajes nuevos.
- `src/features/learning/ChapterReview.tsx`: objetivos/expresiones correctas al cerrar el rendez-vous, no etiquetas del café.
- `src/features/learning/ExerciseView.tsx`, `src/features/humor/CoachReaction.tsx`: pasar el identificador de la aventura al entrenador evitando filtración de reacción del café. No altera comportamiento anterior por parámetro por defecto.
- `tsconfig.core.json`: compilación/validación del contenido nuevo.
- `docs/PROJECT_STATE.md`, `docs/HANDOFF_TO_CODEX.md`: estado y transferencia actualizados.

## Decisiones y límites

- No cambiaron `cafe.ts`, `cafe.v1.ts`, `cafe.v2.ts`, `london.ts`, `london.v1.ts`, `london.v2.ts`, `roast.ts`, `package.json`, `package-lock.json`, motor de evaluación ni schema de progreso. Ver regresiones de versiones históricas en `npm test`.
- Progreso y versiones: misión **nueva** v1, no modificación de la cafetería; no migraciones. Si se publica una corrección editorial después de tener progreso guardado de v1, crear **v2 archivando v1** y suministrar repositorio con ambas versiones: el replay exige que se mantenga el contenido original.
- El reconocedor no entiende todo el francés; normaliza puntuación y capitalización, conserva distinciones de acentos y usa equivalencias exactas editadas. La entrada desconocida no implica error gramatical. No afirmar evaluación acústica ni capacidad en móviles nativos.
- Los escenarios ilustrados con primitives React Native son originales y locales; no contienen recursos de terceros, CDN ni imagen generada de terceros. Al comienzo no se ha verificado estética o voces en navegador real.
- Expo Router detecta `app/rendezvous.tsx`; `MissionProvider` mantiene tres contextos (café, Londres y rendez-vous). Si se agregan más aventuras, considerar un registro generalizado **después** de validar esta etapa, sin refactor de momento.
- No hay dependencia nueva, APIs de pago, nuevas recompensas, cambios en humor adulto, Diario, Pasaporte ni cambios de rama.

## Acciones exactas para Codex

1. **No repetir implementación**. Leer `AGENTS.md`, `docs/PRODUCT_VISION.md`, `docs/ROADMAP.md`, este documento y `docs/LV-006B-ADVENTURE-AND-QA.md`. Comparar el ZIP incremental con el árbol local real y conservar archivos posteriores del usuario. Confirmar por `git status --short` (solo lectura), si existe Git; nunca checkout/reset/commit/push sin autorización.
2. Comprobar `src/content/rendezvous.ts`, `app/rendezvous.tsx`, el `RendezvousContext` y la tarjeta. Verificar que los archivos `london.v1.ts`, `london.v2.ts` y `cafe.v1.ts` **continúan presentes**; la entrega incremental tiene lista cerrada de todos los cambios nuevos para evitar referencias perdidas.
3. Ejecutar `npm test`, `npm run typecheck:core`, `npm run typecheck`, `npm run lint`, `npm run export:web`. En el árbol entregado la referencia es **174 pruebas**, no asumir que será idéntica tras cambios del usuario.
4. **Pedir al usuario la prueba manual** en Chrome: primera y segunda variante (no garantizada en reinicio inmediato), rutas A/B, voces francesas y español del coach, micrófono/transcripción, teclado/denegación, alternativas válidas, errores reales, persistencia/reanudación y aislamiento de Café/Londres. Consultar checklist detallado. No marcar QA como aprobado hasta confirmación.
5. Si el estudiante encuentra expresiones francesas correctas rechazadas, documentar ejemplos precisos, agregar equivalencias y pruebas de contraejemplos. Si existen eventos v1 guardados, versionar como v2 y archivar v1, **no** mutar silenciosamente su definición.
6. Priorizar calidad pedagógica de diálogos y variantes y accesibilidad antes de nuevas aventuras/recompensas. Mantener audio sin reproducción automática y no calificar pronunciación.

---

# TRANSFERENCIA MÁS RECIENTE — LV-007A (31-oct-2026)

**Codex: LEER ESTE APARTADO ANTES DE LOS REGISTROS HISTÓRICOS.** No reiniciar proyecto. Revisar `AGENTS.md`, `docs/MASTER_PROMPT.md`, `docs/PRODUCT_VISION.md`, `docs/ROADMAP.md`, `docs/PROJECT_STATE.md`, `docs/LV-007A-CONVERSATION-FLOW.md`, `tasks/LV-007A.md` y después las tareas anteriores.

## Estado y evidencia

- El usuario confirmó que **LV-006A-REV-01 funciona en Chrome** después del arreglo del archivo faltante `src/content/london.v1.ts`; previamente en esa revisión hubo **152/152 tests**, typechecks, lint y export web aprobados. No asumir que la respuesta breve del usuario es evidencia de prueba nativa o auditoría pedagógica externa.
- **LV-007A implementada:** continuidad visible del **último** intercambio completado y audio opcional del modelo de respuesta correcta en su idioma. **160/160 pruebas automatizadas** OK; `npm run typecheck:core`, `npm run typecheck`, `npm run lint`, `npm run export:web` OK. **QA real de LV-007A en Chrome sigue pendiente**. No existe evidencia nueva de Android/iOS/Safari ni de calidad acústica.
- Se trabajó desde el ZIP de proyecto completo LV-006A-REV-01 en copia aislada; no se escribió directamente en la ruta Windows. Ninguna operación Git de escritura, sin dependencias nuevas ni pagos.

## Cambios reales

- `src/domain/conversation/presentation.ts`: nuevo tipo `ConversationBeat` y función pura `latestConversationBeat` que usa exclusivamente el último `ConversationTurn` ya completado, su pregunta y su respuesta verificada, más réplica NPC opcional. No explora nodos futuros ni añade datos persistidos.
- `src/features/learning/Conversation.tsx`: tarjeta `ConversationBridge` accesible con continuidad y reproducción opcional NPC; `ConversationMessage.verifiedExample` agrega TTS de modelo editorial cuando el mensaje es del estudiante y está marcado verificado; historial verificado habilita audio de modelo.
- `src/features/learning/MissionScreen.tsx`: muestra `ConversationBridge` en progreso activo, no en Roast ni en inicio/completado; deriva la última información de `conversationPresentation` y distingue `en-GB`/`fr-FR`.
- `src/features/learning/ExerciseView.tsx`: habilita reproducción del texto editorial de una respuesta verificada **solo después del acierto**, nunca de un intento fallido o respuesta privada arbitraria.
- `tests/lv007a-continuity.test.cjs` (**nuevo**): 5 regresiones de ausencia de futuro, primer turno, ruta, v1/v2/v3/francés, reanudación, privacidad y manejo de ausencia de réplica NPC.
- `tests/mission-presentation.test.cjs`: 3 pruebas nuevas de render del puente con idioma, ausencia de traducción hablada accidental, modelo del alumno y fallback francés.
- `tasks/LV-007A.md` y `docs/LV-007A-CONVERSATION-FLOW.md` (**nuevos**); `docs/PROJECT_STATE.md` y este archivo actualizados.
- **Sin modificación:** `src/content/london.ts`, `london.v1.ts`, `london.v2.ts`, `src/content/cafe.ts`, `MissionProvider`, motores Learning/Variety/Humor, repositorios de progreso, contratos de micrófono, manifests npm.

## QA que sigue

En Chrome: primer turno sin puente; después del primer turno verificar continuidad entre mensajes y reproducción correcta del último NPC; al acertar reproducir respuesta editorial en inglés/francés; tras error no narrar intento incorrecto; salir y reanudar, alternar París/Londres, silenciar y probar teclado/micrófono. Ver checklist completo en `docs/LV-007A-CONVERSATION-FLOW.md`. No proclamar aceptación hasta resultados del usuario.

## Instrucciones para retomar

1. Comparar archivos incrementales con los locales del usuario; no borrar ni sobrescribir otras modificaciones sin revisar. En la base completa son necesarios `src/content/london.v1.ts` y `london.v2.ts`; están presentes en la entrega de proyecto completo. El paquete LV-007A de cambios solo cambia archivos propios y **no** elimina versiones anteriores.
2. Ejecutar `npm test` y esperar **160** pruebas en esta base, más los cinco comandos de validación documentados. No implementar nuevo registro de conversación ni persistencia paralela.
3. Solicitar QA manual y documentar resultados reales. Si aparecen problemas, corregir manteniendo la proyección pura y preservando las partidas v1/v2/v3.
4. No hacer commit, push, merge, checkout, reset ni deploy sin autorización. No introducir IA de pago, Diario, Pasaporte o nuevos personajes bajo este alcance.

---

# Codex — Transferencia prioritaria LV-006A-REV-01 (31-oct-2026)

**Primero leer:** `AGENTS.md`, `docs/MASTER_PROMPT.md`, `docs/PRODUCT_VISION.md`, `docs/ROADMAP.md`, `docs/PROJECT_STATE.md`, `docs/LV-006A-REV-01-AUDIT.md` y `tasks/LV-006A-REV-01.md`. **No reiniciar el proyecto.** Esta sección prevalece sobre los bloques históricos siguientes.

## Estado real y decisión de entrega

- Trabajo basado en el ZIP corregido LV-006A-02 adjunto al hilo y extraído en el contenedor; no se escribió en `D:\Documents\Jason\LingoVerse\LingoVerse-Codex-Inicio`. Git tenía numerosos archivos modificados/sin seguimiento antes de comenzar; no se ejecutó commit, checkout, reset, merge, push o deploy.
- Estado histórico: LV-005B-02 **124/124 automatizadas y 9/9 manuales Chrome** (declaradas por usuario); LV-006A-02 **140/140 automatizadas** y QA manual de la aventura original **11/12 pasos ejecutados con incidencias**. Prueba de intercambio Londres-París pendiente.
- Estado nuevo: **Londres v3** con catálogo A1 revisado y audio de feedback por idioma. **152/152 pruebas automatizadas** aprobadas (12 nuevas), los dos typechecks, lint y exportación web aprobados. No se probó en el Chrome real del usuario tras v3, ni acento real, Android ni iOS.

## Archivo de contenido y compatibilidad

- `src/content/london.ts` ahora publica `londonLesson.version === 3`; conserva las dos historias, 9 objetivos y decisiones reales. Añade respuestas válidas `I need help` y `Yes, I'm new here` (y variaciones razonables); rechaza explícitamente negaciones contradictorias sin hacer fuzzy matching. Edita progresión saludo → necesidad → destino → ruta → indicaciones → agradecimiento → despedida. `docs/LV-006A-REV-01-AUDIT.md` detalla el inventario pedagógico por escena.
- **NUEVO** `src/content/london.v2.ts` copia el contenido editorial anterior v2, con el export renombrado, para asegurar que los eventos v2 viejos siguen siendo reproducibles. `london.v1.ts` permanece intacta. `MissionProvider` ofrece ambos archivos históricos; `londonLessonForProgress` selecciona según `contentVersion`. No cambiar versiones guardadas, reescribir eventos ni eliminar los archivos históricos. El usuario debe confirmar reinicio para iniciar v3.
- **NUEVO** `tests/london-review.test.cjs`: 9 tests de equivalencias, contradicciones, incertidumbre, secuencia, persistencia v2, selección estricta de voz y progresión completa. `tests/mission-presentation.test.cjs` tiene 3 pruebas adicionales de idioma en ejemplo/entrenador/francés.
- `src/domain/learning/models.ts`, `written.ts`, `engine.ts`, `validation.ts` incorporan metadatos opcionales de feedback verificado `acceptedFeedback` y `spokenExplanation`, explicaciones de desconocido, y copia hablada específica para reglas u opciones. **Los ejercicios históricos sin metadata no incorporan campos en los eventos**, lo que conserva el replay. Reglas normalizadas siguen siendo finitas y deterministas.
- `src/features/learning/EducationalFeedback.tsx` muestra «Aún no podemos verificarla» para respuestas desconocidas y entrega texto español-only a `CoachSpeech` cuando existe, pero da un botón distinto para el ejemplo en `en-GB` (francés `fr-FR`). `src/features/humor/CoachReaction.tsx` respeta el texto hablado opcional. La voz del entrenador depende de `coachLocale` y voces del navegador; no se ha demostrado acústicamente la calidad del acento.

## Archivos propios de esta revisión

**Nuevo:** `src/content/london.v2.ts`, `tests/london-review.test.cjs`, `tasks/LV-006A-REV-01.md`, `docs/LV-006A-REV-01-AUDIT.md`.

**Modificados:** `src/content/london.ts`, `src/domain/learning/models.ts`, `src/domain/learning/written.ts`, `src/domain/learning/engine.ts`, `src/domain/learning/validation.ts`, `src/features/learning/EducationalFeedback.tsx`, `src/features/humor/CoachReaction.tsx`, `src/features/learning/MissionProvider.tsx`, `tests/london.test.cjs`, `tests/mission-presentation.test.cjs`, `docs/PROJECT_STATE.md`, `docs/HANDOFF_TO_CODEX.md`.

**Dependencias:** ninguna nueva; sin IA remota, API de pago ni permisos adicionales. Micrófono web y transcripción editable existentes preservados, sin evaluación de pronunciación.

## Validación ejecutada y pendiente

- `npm test` — **152/152 OK**; incluye v1/v2 reanudadas y v3 nueva, francés, voice metadata, situaciones contradictorias y unknown, rutas completas. `npm run typecheck:core` — OK. `npm run typecheck` — OK. `npm run lint` — OK. `npm run export:web` — OK.
- Intento real `node scripts/check-web.mjs --browser /tmp/lingoverse-chromium`: **NO aprobado** por bloqueo de acceso `127.0.0.1 is blocked` impuesto por el navegador del entorno; no cargó la aplicación. Las pruebas de TSX simulan controles de voz para verificar argumentos como `en-GB` pero **no** pueden confirmar acento, duración de audio ni voz de Chrome. No se declara que el usuario haya validado v3.
- QA necesario: dos casos reportados, respuestas incorrectas reales, respuesta natural alternativa, voz inglesa de Ollie, ejemplo inglés, voz española del entrenador, continuidad de las dos historias, no filtración, micrófono opcional, progreso, y cambio Londres–París. Leer checklist completo en `docs/LV-006A-REV-01-AUDIT.md`.
- Android/iOS aún no verificados. Conservar feedback de usuario antes de cerrar REV-01. No iniciar nuevas aventuras, Diario/Pasaporte ni optimizaciones de humor bajo esta tarea.

## Cómo retomar sin repetir trabajo

1. Descomprimir cambios incrementales sobre una copia de seguridad y comparar cada archivo con los locales del usuario. **No sobrescribir cambios posteriores del usuario**. Ejecutar `git status --short` solamente para inspeccionar.
2. Confirmar que `londonLesson.version === 3`, que existen `london.v1.ts` y `london.v2.ts` y que el proveedor recibe ambos archivos. Correr las cinco verificaciones arriba; esperar **152** tests en esta base.
3. Completar QA manual en Chrome con el usuario. En una sesión v1/v2 histórica los cambios de v3 **no** aparecen hasta confirmar reinicio; informar claramente esa transición.
4. Si aparece otro rechazo válido, añadir equivalencia verificada, contraste negativo y explicación contextual **en una v4** si v3 ya tiene eventos guardados, sin modificar silenciosamente v3; antes de editar el motor, considerar replay de respuestas históricas.

---

# LingoVerse — adenda prioritaria LV-006A-02 (30-oct-2026)

**LEER PRIMERO:** el usuario hizo 11/12 pasos manuales de Londres v1 en Chrome y observó errores educativos/de audio. Falta punto 10 (cambiar entre idiomas); la aventura **no** está aceptada completamente. El código corregido se entrega en copia ZIP, sin escritura en el repositorio Windows, sin `commit`, `checkout`, `merge`, `push`, `reset` ni `deploy`. Las nuevas pruebas se ejecutaron sobre una copia local.

### Qué quedó corregido

- `src/features/learning/EducationalFeedback.tsx`: recibe idioma real `fr|en`, lee correcciones y ejemplos con `fr-FR` o `en-GB`; elimina el texto fijo «ejemplo en francés» dentro de Londres y lee una sola de varias alternativas separadas por `/`. El coach narrativo español continúa con `coachLocale` configurado, no con inglés; timbre real pendiente de QA.
- `src/features/humor/CoachReaction.tsx`: transmite idioma tanto en fallback como en feedback con reacción, evitando hardcodes de audio.
- `src/features/learning/Conversation.tsx`: muestra y reproduce separadamente la frase inglesa y su traducción española de diálogos guardados con «→»; no cambia eventos ni textos persistidos.
- `src/content/london.ts`: **v2**, respuesta específica para «What is the Theatre?» (*what* ≠ *where*) y más alternativas válidas de ubicación; conversaciones de Ben y Leo replanteadas para que el aprendiz pregunte algo pertinente y obtenga una réplica coherente. Mantiene 2 variantes, 2 rutas/variante, 9 objetivos por ruta.
- `src/content/london.v1.ts` (**nuevo**): archivo histórico de contenido v1. `src/features/learning/MissionProvider.tsx` lo registra como legacy; `londonLessonForProgress` lee v1/v2. **No migrar v1 a v2 automáticamente:** la restauración por replay verifica cada explicación. La partida v1 sigue con sus diálogos anteriores hasta que el usuario confirme una partida nueva.
- `tests/london.test.cjs`, `tests/mission-presentation.test.cjs`: +5 pruebas de reglas corregidas, coherencia, recuperación legacy, separación bilingüe y enrutamiento TTS por locale.
- Documentos: `docs/PROJECT_STATE.md`, `docs/HANDOFF_TO_CODEX.md`, `docs/LV-006A-02-QA-FIXES.md` (**nuevo**) para reproducibilidad.

### Estado validado y pendientes

`npm test`: **140/140 PASS**; ambos typechecks, ESLint y Expo export web: **PASS**. **Chrome físico post-parche, acento y cambio inglés/francés: PENDIENTES.** Tests TTS en JSX usan mocks, no voces reales. No nuevas APIs ni dependencias ni builds nativas. Leer `docs/LV-006A-02-QA-FIXES.md` para casos manuales específicos.

Al retomar: 1) revisar estado Git **solo lectura**, 2) comparar ZIP incremental, 3) ejecutar checks, 4) confirmar audio inglés de ejemplo y voz regional del coach, 5) finalizar la partida v1 previa y **solo con autorización** reiniciar para ver la v2, 6) completar intercambio París↔Londres, 7) registrar evidencia física. No rehacer voz, Francia, motores ni interfaz aprobada. No declarar pronuciación calificada: se evalúa transcripción.

---

# LingoVerse — Transferencia a Codex tras LV-006A

> **Corte actual prioritario (2026-10-30):** esta sección reemplaza las instrucciones pendientes del corte histórico LV-005B-02 conservado debajo. Trabajar desde los archivos de la entrega **LV-006A**, no desde un ZIP antiguo. No reconstruir el proyecto.

## 1. Estado verificado y límites

- **Rama leída, sin alteración:** `feature/lv-005a-conversational-adventures`. Fuente: copia del ZIP actualizado de LV-005B-02 adjunto al hilo, no el repositorio Windows montado. No se ejecutó checkout, reset, merge, commit, push, deploy ni cambios destructivos de Git. Preservar los numerosos cambios anteriores y archivos no rastreados al integrar.
- **LV-005B-02 aceptada por el usuario:** **124/124 tests automatizados**; **9/9 pruebas manuales confirmadas en Chrome de escritorio**, el 30/oct/2026: aventura, voces de personajes, permiso/micrófono, transcripción, envío/evaluación, error educativo, escritura alternativa, cancelaciones y progreso/diseño. La prueba física **no** la ejecutó este agente; procede de la confirmación del usuario. **No extrapolar** a reconocimiento nativo, iOS, Android, Safari ni evaluación fonética.
- **LV-006A implementada:** aventura **Lost in London** `en-a1-london-lost` v1, inglés A1, nueve interacciones por recorrido, dos historias con decisiones reales y personajes/caminos/desenlaces distintos. Se reutilizó el motor de contenido, selección ponderada, evaluación, proyección de historia, TTS y STT web. La transcripción es texto; no se evalúa pronunciación.
- **Validación de código LV-006A:** `npm test` **135/135** (124 anteriores + 11 casos), `npm run typecheck:core` **OK**, `npm run typecheck` **OK**, `npm run lint` **OK**, `npm run export:web` **OK**. El intento `node scripts/check-web.mjs --browser /tmp/lingoverse-chromium` **no aprobó** por bloqueo de red del contenedor (`127.0.0.1 is blocked` antes de cargar app). No atribuir el bloqueo a un fallo verificado de LingoVerse.
- **LV-006A QA manual:** **pendiente** en el Chrome del usuario, con voces `en-GB`, permisos, reconocimiento inglés real, diseño y navegación. Android/iOS nativos siguen sin verificación; Web Speech API no es universal.

## 2. Implementación real de LV-006A

- **Historia 1:** `station-arrival` en torno a King’s Cross. Maya ofrece ayuda para llegar al Blue Door Hostel (ficticio); elegir caminar lleva a Nora y al buzón rojo, elegir autobús lleva a Ben y a la ruta cinco.
- **Historia 2:** `riverside-rain` junto al South Bank. Ollie ayuda a buscar el Lantern Theatre (ficticio); elegir la ribera lleva a Asha, puente y derecha; el mercado lleva a Leo, letrero verde e izquierda.
- **Nueve objetivos comunes** en ambas: saludar, presentarse, pedir ayuda, preguntar por el destino, elegir un camino, aclarar ubicación, entender instrucciones, agradecer y despedirse. Cada variante contiene 13 nodos alcanzables; cada recorrido visita nueve. Las elecciones válidas admiten formulaciones alternativas; el evaluador solo acepta equivalencias editoriales, no respuestas semánticas arbitrarias.
- **Reanudación:** `MissionRepository` ya persiste por `lesson.id` y `contentVersion`; Londres guarda en `lingoverse.mission.en-a1-london-lost.v1` sin tocar `lingoverse.mission.fr-a1-paris-cafe.v1` ni el archivo francés v1/v2. Historial de intervenciones derivado de eventos; diálogos de ramas futuras no se exhiben. Las reglas escritas de Londres no retienen arbitrariamente texto personal de errores.
- **Voz:** `<SpeechButton>` y `<SpeechInput>` reciben `en-GB` en Londres y `fr-FR` en París. Las voces dependen del dispositivo; el micrófono web solicita permiso al pulsar, puede procesar audio externamente, conserva edición y teclado. No se añadió reconocimiento nativo.
- **UI:** tarjeta de Londres en Inicio y Explorar, ruta `/london`, escenario de skyline londinense con primitivas RN (sin imágenes pagadas), seis nuevos retratos tipográficos, pistas progresivas, feedback contextual, revisión de camino y cierre. Estética de París/entrenadores/Roast conservada.

## 3. Archivos nuevos / modificados **por LV-006A**

**Nuevos:**

- `src/content/london.ts` — contenido, ramas y respuestas.
- `app/london.tsx` — ruta de navegación.
- `tests/london.test.cjs` — nueve pruebas automatizadas de la nueva entrega.
- `tasks/LV-006A.md` — alcance y criterios.
- `docs/LONDON_ADVENTURE.md` — diseño narrativo y QA manual.

**Modificados:**

- `app/index.tsx`, `app/explore.tsx`, `app/_layout.tsx` — descubrimiento, navegación y proveedores de las dos aventuras.
- `src/domain/learning/models.ts`, `src/domain/learning/validation.ts`, `tsconfig.core.json` — idioma `fr | en` admitido, compilación del contenido inglés.
- `src/features/learning/MissionProvider.tsx`, `MissionScreen.tsx`, `MissionCard.tsx`, `ExerciseView.tsx`, `Conversation.tsx`, `ChapterReview.tsx` — experiencia multi-aventura, rutas narrativas, reanudación y repaso.
- `src/components/AdventureArt.tsx` — identidad visual londinense sin modificar el recurso visual francés.
- `src/features/humor/CoachReaction.tsx` — selecciona el estado de la misión del idioma activo; impide que Londres use una reacción francesa o Roast previo.
- `src/features/voice/SpeechInput.tsx`, `VoiceControls.tsx` — `en-GB` en lugar de francés fijo; control de transcripción existente preservado.
- `tests/mission-presentation.test.cjs` — +2 pruebas de integración: voz `en-GB`/`fr-FR`, campo y ocultación de traducción; aislamiento del entrenador/estilo Roast entre francés e inglés.
- `docs/PROJECT_STATE.md`, `docs/HANDOFF_TO_CODEX.md` — estado y transferencia.

El resto de ficheros modificados o sin seguimiento del árbol son **preexistentes** de versiones anteriores: no borrarlos, no inferir su pertenencia a LV-006A. `package.json`, `package-lock.json`, sistemas nativos, repositorios de progreso y motor `evaluateAnswer` **no** cambiaron por LV-006A.

## 4. Decisiones técnicas, dependencias y privacidad

- **Sin paquetes incorporados:** se reutilizan las dependencias existentes de Expo SDK 57, React Native/React Native Web y `expo-speech` existente; no servicios de pago, API keys ni datos remotos nuevos.
- En el dominio se amplió exclusivamente `Lesson.language` y la validación a `fr | en`; **no** se codificaron reglas inglesas en componentes del Learning Engine ni se versionó otra vez francés.
- En estado/UI se suministra un proveedor inglés contextual paralelo al francés con la misma clase `MissionProvider` y repositorios separados; Roast sigue asociado al proveedor francés, sin extender humor adulto a Londres. `CoachReaction` consulta el contexto correspondiente al idioma en vez de obtener por defecto el francés.
- La equivalencia de voz en respuestas de selección es **exacta y no ambigua**, conforme a LV-005B-02. En texto hay varias frases válidas predefinidas; **no** se afirma revisión de acento ni calidad fonética.
- El navegador puede enviar audio a su proveedor para STT y puede no tener voz británica local. LingoVerse no almacena grabaciones; reintentos erróneos en la lección inglesa se reducen a texto editorial o vacío, no a transcripciones arbitrarias en el progreso guardado.

## 5. Problemas conocidos y QA pendiente

1. **Primera acción del usuario:** descomprimir de forma segura/comparar el ZIP de LV-006A en su copia Windows, sin borrar archivos nuevos/franceses; ejecutar `npm run web` en Chrome y completar el checklist de [LONDON_ADVENTURE.md](LONDON_ADVENTURE.md).
2. **Probar dos historias y las dos rutas por historia**, respuestas con texto y voz, traducción/pistas, feedback de error, finalización, reanudación, reinicio e intercambio francés/inglés. El Variety Engine ponderado **no garantiza** cambiar de variante en cada reinicio.
3. **Comprobar de verdad** en Chrome que el navegador dispone de voz `en-GB` o fallback, permiso de micrófono, transcripción editable inglesa, cancelación, red y modo escrito sin micrófono. El harness de pruebas no puede sustituir esta comprobación física.
4. QA accesibilidad 320/390 px, teclado real, lectores, ajustes de voz, almacenamiento fallido y navegadores sin API. Android/iOS nativos y Safari quedan pendientes.
5. Revisión editorial por docente competente y usuarios A1; 13 nodos por variante y equivalencias finitas **no** significan comprensión libre, adaptatividad IA o curso completo de inglés.
6. Documentos anteriores de visión, roadmap, versión francesa o checklist de micrófono contienen afirmaciones históricas de que inglés/voz están pendientes. Usar la **sección LV-006A de PROJECT_STATE**, código y esta transferencia como corte actual. No borrar evidencia histórica.

## 6. Cómo debe continuar Codex

- Inspeccionar primero `AGENTS.md`, `docs/PRODUCT_VISION.md`, `docs/ROADMAP.md`, `docs/PROJECT_STATE.md`, `docs/CONVERSATIONAL_EXPERIENCE.md`, `docs/LONDON_ADVENTURE.md`, `tasks/LV-006A.md` y esta transferencia. Revisar `git status --short --branch` **solo lectura**.
- Verificar que existen los archivos/estados descritos. No repetir LV-005B-02 ni crear otra lección de Londres. Ejecutar las cinco validaciones y comparar con **135/135**. Consultar la prueba `tests/london.test.cjs` para recorrer rutas y equivalencias.
- Recoger QA manual real (en especial micrófono inglés) y **registrar solo resultados observados**. Corregir los bugs encontrados incrementalmente sin perder las partidas francesas. Mantener `contentVersion: 1` estable para el inglés publicado; si se requiere cambio incompatible en nodos, archivar v1 y crear v2 siguiendo el patrón del café.
- No implementar Diario, Pasaporte, backend, sincronización, memes nuevos ni SDKs nativos bajo LV-006A. No cambiar de rama ni hacer commit, push, merge, reset ni deploy sin autorización explícita.

---

## Archivo histórico de la transferencia de LV-005B-02 (conservado para trazabilidad)

# LingoVerse — Transferencia a Codex después de LV-005B-02

**Corte de trabajo:** copia extraída del archivo de continuidad proporcionado el 2026-10-30. **Rama presente en el ZIP:** `feature/lv-005a-conversational-adventures`. **Ruta del usuario en Windows:** `D:\Documents\Jason\LingoVerse\LingoVerse-Codex-Inicio` (no fue montada ni modificada por este asistente). **Estado histórico de esta sección:** antes de la aceptación manual reportada por el usuario. Ver el bloque LV-006A al inicio; LV-005B-02 ya tiene 9/9 pruebas manuales confirmadas en Chrome de escritorio.

## 1. Estado real inicial y final

La inspección previa a editar confirmó **109 entradas** modificadas/sin seguimiento en `git status --porcelain` dentro del ZIP; entre ellas `assets/`, `src/domain/voice/`, `src/features/voice/`, LV-005A-UI-01 y LV-005B-01. No confundir el estado Git con una rama limpia ni considerar inexistente el código no agregado al índice. No se realizaron cambios de rama, commits, push, merges, resets ni despliegues.

Línea base del ZIP: **114/114 pruebas** aprobadas; Expo `~57.0.31`, RN 0.86.3, React 19.2.3, TS 6.0.3, React Native Web, persistencia local. El usuario confirmó previamente en **Chrome** que Camille podía hablar francés y Luz español. Esa constatación aplica a **TTS de LV-005B-01**, no a STT ni reconocimiento en Android/iOS.

Resultado de esta intervención: **124/124 pruebas automatizadas**, ambos typechecks, ESLint y exportación web aprobados. Código de micrófono web en el ZIP actualizado, con transcripción editable y entrega por el flujo habitual de evaluación. Sin nueva dependencia ni cambios a `package.json`, `package-lock.json` o `app.json` propios de LV-005B-02.

## 2. Funcionalidad que debes preservar

- **LV-001:** base Expo/React Native/Web, rutas, preferencias, persistencia local, tests.
- **LV-002:** aventura francesa A1 «Un café en París» de ocho interacciones, ramas y progreso recuperable.
- **LV-003:** Variety Engine, versiones/variantes, memoria local de exposición educativa.
- **LV-004:** Humor Engine, cuatro entrenadores regionales, Roast Me consentido y su uso opcional en cafetería.
- **LV-005A:** presentación conversacional derivada de eventos, historia previa y réplicas de NPC; mismo Learning Engine.
- **LV-005A-UI-01:** arte local, personajes, escena compacta, pistas progresivas, repaso y animación existente.
- **LV-005B-01:** TTS real con `expo-speech`, voces del sistema, selección local/regional, opt-in de voz web remota, silenciar/detener/repetir, cancelación según contexto; verificar el comportamiento actual del árbol, no reinterpretar el checklist anterior como ausencia de código.
- **LV-005B-02 (nueva):** SpeechRecognition web condicional `fr-FR`, micrófono activado únicamente tras gesto, aviso de procesamiento externo, resultados provisionales/finales, editor de transcripción, correspondencia de opción **exacta y no ambigua**, transferencia a campo escrito, respuesta evaluada solo al pulsar «Comprobar respuesta», cancelación al salir/ocultar/cambiar a TTS.

No hay puntuación de pronunciación, captura nativa garantizada, almacenamiento de audio, IA de generación dinámica, backend, diario ni pasaporte implementados por esta tarea.

## 3. Archivos creados y modificados en LV-005B-02

**Archivos nuevos:**

- `src/domain/voice/recognition.ts` — contratos y controlador puro; invalidación de callbacks tardíos, errores y estados.
- `src/domain/voice/recognitionWeb.ts` — adaptador Web Speech API, sin librería externa.
- `src/domain/voice/choiceMatching.ts` — cotejo exacto/unívoco con normalizador de Learning Engine.
- `src/features/voice/recognitionDriver.ts` — fallback no operativo en nativo (no solicita permisos ni promete STT).
- `src/features/voice/recognitionDriver.web.ts` — adaptador de navegador con detección segura.
- `src/features/voice/SpeechInput.tsx` — botón de dictado, privacidad, estados, transcripción editable.
- `tests/speech-input.test.cjs` — 10 casos nuevos de reconocimiento simulado, cancelación, matching e integración al evaluador.
- `tasks/LV-005B-02.md` — alcance y criterios.
- `docs/SPEECH_RECOGNITION.md` — investigación, límites, fuentes y QA manual.
- `docs/HANDOFF_TO_CODEX.md` — esta transferencia.

**Archivos modificados por esta tarea:**

- `src/features/learning/ExerciseView.tsx` — integra SpeechInput en el turno actual, sin cambiar el mecanismo de envío/evaluación.
- `tests/mission-presentation.test.cjs` — mock de SpeechInput en el harness SSR/React Native; no afecta producción.
- `scripts/check-web.mjs` — `waitFor()` tolera que `document.body` aún no exista cuando se inicia la navegación; no soluciona bloqueos de red del navegador de QA.
- `docs/PROJECT_STATE.md` — registra estado real, pruebas y pendientes.

**No alterados en esta tarea:** Learning Engine, contenido versionado, progreso y repositorios, Humor Engine, Roast Me, arte/personajes, preferencia de voz y su controlador TTS, configuración nativa y dependencias. Muchos de ellos ya estaban modificados en el ZIP original: preservarlos.

## 4. Decisiones técnicas / dependencias

- **Web Speech API del navegador**: menor superficie y costo $0 inicial; no necesita nuevo paquete ni credenciales. Disponibilidad detectada durante ejecución. HTTPS/localhost y permisos del navegador, no basta Metro export.
- **No activar `expo-speech-recognition` todavía**: la familia compatible `@^57` requiere plugin/prebuild y una dev build nativa; Expo Go no contiene su módulo. La disponibilidad/privacidad de motores nativos y permisos debe verificarse por sistema operativo y dispositivo.
- **Privacidad:** el navegador puede mandar audio a su servicio remoto. LingoVerse no graba/guarda audio. Transcripciones transitorias permanecen en memoria; al pulsar «Comprobar respuesta», la respuesta textual sigue la persistencia y privacidad ya previstas en el motor educativo.
- **Motor existente:** transcripción ≠ pronunciación. Solo `LearnerAnswer {kind:'text'}` o `LearnerAnswer {kind:'choice'}`. No crear nueva tabla/score ni cambiar el replay.
- **Sin pago ni servicio propio:** no se agregó ningún paquete; `package.json` y lockfile permanecen como el ZIP de origen.

Detalles y referencias técnicas: [SPEECH_RECOGNITION.md](SPEECH_RECOGNITION.md).

## 5. Validación ejecutada (no inferir más)

| Ejecución | Resultado |
| --- | --- |
| `npm test` antes de editar | **114/114**, OK |
| `npm test` final | **124/124**, OK; +10 casos |
| `npm run typecheck:core` | OK |
| `npm run typecheck` | OK |
| `npm run lint` | OK; en extracción Linux fue necesario devolver permiso de ejecución al shim de ESLint del ZIP, bajo `node_modules` ignorado |
| `npm run export:web` | OK, Metro exporta `dist` |
| `node scripts/check-web.mjs --browser /tmp/lingoverse-chromium` | **No aprobado**; Chromium abrió página de bloqueo corporativo para `127.0.0.1`, fuera de control de la app |
| Micrófono físico Chrome/Firefox/Safari | **No probado**; no deducir funcionamiento del test unitario con fake recognizer |
| Android/iOS nativos (dispositivo/simulador) | **No probado**, adaptador deshabilitado |

Las pruebas Node simulan APIs de reconocimiento y comprueban límites, estados, privacidad estructural y ruta de respuestas; no hablan por micrófono. Exportar web comprueba bundling, no permisos ni disponibilidad de servicio STT. El usuario había probado audio TTS de LV-005B-01 antes de esta entrega; no reutilizar como evidencia de STT.

## 6. Problemas y limitaciones conocidos

- `SpeechRecognition` no es universal ni confiable en cada navegador/región/idioma: el control no aparece si falta API o contexto seguro; texto y opciones continúan.
- Chrome u otro navegador pueden enviar audio remotamente, incluso sin suscripción propia de LingoVerse. No declarar offline ni retención cero del proveedor.
- Una transcripción imperfecta en una pregunta de selección no implica seleccionar una opción cercana; el usuario debe corregir hasta obtener match único o elegir manualmente.
- Sin puntuación fonética, detección de acento ni evaluación prosódica.
- `fr-FR` es idioma de esta aventura; no existe inglés jugable aún. `processLocally` web experimental no se utiliza.
- Permisos denegados, captura de audio deshabilitada, servicio remoto inalcanzable o falta de micrófono pueden impedir la operación; se conserva fallback escrito.
- El QA Chromium local no pudo cargar `127.0.0.1` por política del contenedor; no atribuirlo a fallo confirmado de Expo o React Native.
- Los documentos más antiguos (`ROADMAP`, `CONVERSATIONAL_EXPERIENCE`, checklists LV-005B-01) contienen narraciones históricas de «sin voz» y líneas base anteriores. Usar **esta sección de PROJECT_STATE**, el código y las nuevas pruebas como corte actual.

## 7. Pendientes priorizados

1. **QA físico Chrome con micrófono** en Windows del usuario: permisos, frase francesa real, transcripción/editado/usar/Comprobar en `text` y `choice`, errores, repetición y cancelación. Completar el checklist de `docs/SPEECH_RECOGNITION.md` y registrar browser/OS/idioma/evidencia (sin grabar audio privado).
2. QA accesibilidad, 320/390 px con teclado real, temporización de botones, permisos, cierre/retorno de pestaña; red denegada y navegadores sin API.
3. Solo después de aceptar web, evaluar tarea nativa **LV-005B-03** con `expo-speech-recognition@^57`, dev builds (no Expo Go), plugin de permisos y QA real de Android/iOS. No asumir que versión y compatibilidad documental bastan.
4. Revisar y consolidar documentos históricos que afirman que la síntesis no existe; NO borrar la evidencia de pasos anteriores ni archivos del usuario.
5. Volver al roadmap de producto una vez validada voz: Diario V1 basado en eventos, Pasaporte V1 y contenido adicional **en tareas separadas**.

## 8. Instrucciones operativas inequívocas para Codex

1. **NO REINICIAR NI REGENERAR** el repositorio. Empezar por `AGENTS.md`, `docs/MASTER_PROMPT.md`, `docs/PRODUCT_VISION.md`, `docs/ROADMAP.md`, `docs/PROJECT_STATE.md`, `docs/CONVERSATIONAL_EXPERIENCE.md`, `tasks/LV-005A.md`, `tasks/LV-005B-01.md`, `tasks/LV-005B-02.md`, `docs/SPEECH_RECOGNITION.md` y este documento.
2. Verificar `git status --short --branch` **solo lectura**. Hay trabajo anterior sin registrar; conservar *todos* los cambios y archivos nuevos, incluidos assets y módulos voice, al integrar los archivos de la copia actualizada. No `checkout`, `reset`, `clean`, merge, commit, push ni deploy sin autorización expresa del usuario.
3. Confirmar que los 10 archivos nuevos de LV-005B-02 y las cuatro modificaciones de integración están presentes. **No rehacer** LV-005B-01, no sustituir `VoiceController`, no duplicar `onAnswer`, no cambiar las versiones de contenido ni las tablas de progreso.
4. Ejecutar `npm test`, `npm run typecheck:core`, `npm run typecheck`, `npm run lint`, `npm run export:web`. Comparar con **124/124**; anotar nuevos fallos sin ocultarlos ni atribuir automatizaciones a micrófono real.
5. Si el usuario puede probar micrófono en Chrome, indicarle los pasos de `docs/SPEECH_RECOGNITION.md`; no calificar LV-005B-02 como producción en móvil hasta obtener evidencia. Resolver problemas encontrados incrementalmente y actualizar el estado sin inventar resultados.
6. Separar reconocimiento de voz (STT) de texto a voz (TTS) y de evaluación fonética. Conservar fallback de escritura, indicaciones de privacidad y acciones voluntarias.
7. Continuar **solo** la siguiente tarea aprobada; documentar archivos afectados, pruebas y QA real. No contratar APIs ni agregar SDKs nativos sin justificar compatibilidad, permisos, privacidad, build de desarrollo y plan de pruebas.

**Entrega de este asistente:** proyecto actualizado en un ZIP separado que **omite `.git`, `node_modules`, cachés, builds y logs**. El repositorio Windows original no se alteró y la integración de la copia debe realizarla el usuario, resguardando primero su árbol original.
