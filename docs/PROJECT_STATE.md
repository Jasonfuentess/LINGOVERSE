# RML-002 — Learning Modes, Natural Conversation & Comedy Overhaul (03-nov-2026)

**Estado:** implementado y verificado técnicamente. **La mejora editorial del humor NO está aprobada:** depende de que el usuario apruebe conversaciones reales. Sin cambios de TTS. Sin operaciones Git.

**Línea base:** RML-001 con 242/242 (verificado de nuevo antes de empezar).

**Implementado:**
- Modalidad **Con ayuda / Con libertad** y respuesta **Hablando / Escribiendo**, guardadas aparte (`lingoverse.live-preferences.v1`).
- Comprensión de respuestas naturales: reglas revisadas y deterministas por turno, con vocabulario cerrado, polaridad, cantidades, lugares y errores dentro de frases largas. No hay IA ni similitud.
- Resultado nuevo `understood`: la escena sigue y se enseña la forma practicada, sin acreditarla como dominio.
- Canal `spoken`/`written` en el evento: lo escrito no cuenta como práctica oral, y nunca se culpa al micrófono de una respuesta tecleada.
- **Reiniciar práctica** con confirmación: misma escena desde el primer turno, o vuelta a la selección de modalidad.
- Inicio con un solo acceso (Roast Me Live). Roast Me clásico sigue en Explorar y en los ajustes de humor.
- Humor reescrito: 448 líneas (112 por entrenador). Incluye reacciones por error y nivel, humor situacional, callbacks, albures contextuales y control de frecuencia, que reemplaza la prohibición absoluta.
- Contenido Live en versión 2: una sesión guardada de la versión 1 no se reanuda, y la pantalla lo dice.

**Archivos:**
- Nuevos: `src/domain/learning/understanding.ts`, `src/storage/livePreferencesRepository.ts`, `tests/roast-live-modes.test.cjs`, `tests/live-screen-harness.cjs`, `docs/RML-002-LIVE-MODES.md`, `tasks/RML-002.md`.
- Modificados: `src/domain/learning/{models,engine,interpretation,validation}.ts`, `src/content/{live,liveHumor}.ts`, `src/domain/humor/live.ts`, `src/domain/live/session.ts`, `src/features/live/LiveScreen.tsx`, `app/index.tsx`, `src/components/Editorial.tsx`, `tsconfig.core.json`, `tests/roast-live.test.cjs`, `scripts/check-live.mjs`.

**Verificación:**
- 264/264 (242 + 22 nuevas); 3 pruebas de RML-001 actualizadas por cambios pedidos, documentados en el archivo.
- Ambos typechecks, lint y export web.
- 6/6 mutaciones detectadas.
- Chrome: `check-live` PASS en las 3 escenas francesas, más `check-premium` ×3 y `check-conversation` PASS.
- No se iniciaron ni cerraron servidores.

Detalle y QA manual: [RML-002-LIVE-MODES.md](RML-002-LIVE-MODES.md).

# RML-001 — Roast Me Live: Conversational Humor & Voice Foundation (03-nov-2026)

**Estado:** implementado; pruebas y recorridos en Chrome real headless aprobados. **La aprobación de naturalidad de voz y humor depende de la QA auditiva y editorial del usuario** (pendiente), igual que el micrófono físico y Android/iOS/Safari.

**Línea base verificada antes de empezar:** 226/226. El trabajo previo está en el commit `a002ca3` del usuario. Sin operaciones Git.

**Implementado:**
- Ruta `/live` y acceso destacado en Inicio.
- 6 escenas FR/EN sobre los contratos LV-007B.
- Capa de humor Live: tipo de respuesta + línea contextual, variedad reproducible, sin repetir en la sesión.
- 157 líneas editoriales distintas para Luz, Toño, Vale y Romi, en 4 niveles (limpio, picante, sin pena, sin misericordia) más doble sentido opcional.
- Conversación reconstruida desde los eventos: revocar limpia el pasado y el texto libre no se guarda.
- `VoiceController.playSequence` (sin superposición; cancelación total al detener, navegar o revocar) y `voiceId` del mismo idioma.
- Selección de voz por región y «masculina probable» por nombre, con prueba y elección persistida.
- Preferencias `live` opcionales y retrocompatibles en el humor; revocar las reinicia.

**Archivos:**
- Nuevos: `app/live.tsx`, `src/features/live/LiveScreen.tsx`, `src/content/{live,liveHumor}.ts`, `src/domain/humor/live.ts`, `src/domain/live/session.ts`, `src/domain/voice/coachVoices.ts`, `src/storage/liveVoiceRepository.ts`, `tests/roast-live.test.cjs`, `scripts/check-live.mjs`, `docs/RML-001-ROAST-ME-LIVE.md`, `tasks/RML-001.md`.
- Modificados: `src/domain/voice/playback.ts`, `src/domain/humor/{models,preferences}.ts`, `src/components/Editorial.tsx`, `app/index.tsx`, `tsconfig.core.json`.

**Verificación:** 242/242 (226 + 16), ambos typechecks, lint, export web; Chrome: `check-premium` ×3, `check-conversation` y `check-live` PASS. Logs `rml-*.log`. No se iniciaron ni cerraron servidores de desarrollo.

**Limitaciones principales:** sin risa audible (solo visual); acento y género dependen de las voces del dispositivo (sin dato de género en la plataforma); las explicaciones no se leen en voz alta; la comprensión se limita a frases revisadas; el humor regional requiere revisión de hablantes nativos. Detalle y QA manual: [RML-001-ROAST-ME-LIVE.md](RML-001-ROAST-ME-LIVE.md).

# LV-009-LEARN-04 — Lesson Practice & Pronunciation Coverage (02-nov-2026)

**Estado: APROBADA.** Validación manual 9/9 reportada por el usuario (no ejecutada por Claude); la guía archivada tiene 9 pasos. Sigue pendiente la revisión docente de las 34 guías nuevas.

**Problemas encontrados:**
- `LearningRescue` repetía todo el bloque de audio del modelo y el vocabulario al abrir «Practicar, construir y ver vocabulario» (origen confirmado).
- La guía relacionada y las guías de una sola unidad también duplicaban reproductores, y en A1 se repetía la instrucción.
- Faltaban guías para el modelo de muchos turnos de selección (incluidos los precios con *liaison*) y para decisiones igualmente válidas.
- Las opciones no se podían escuchar.

**Solución:**
- 34 guías nuevas (69 en total) y tres consejos de sonido.
- Nuevo `ChoiceListening` neutral: escuchar cada opción y, si hay guía, ver significado y pronunciación. No revela la correcta, no envía y no selecciona.
- `PronunciationCoach` compacto para ayudas secundarias.
- Desplegable consolidado «Practicar y construir mi respuesta».
- Sin cambios en motores, evaluación, contenido de misiones, persistencia, voz, LV-007B ni Roast.

**Cobertura del modelo de los turnos de selección:** Café 8/13 → 13/13, Londres 1/7 → 7/7, Rendez-vous 2/15 → 15/15. Todas las decisiones válidas distintas tienen al menos una frase guiada.

**Archivos:**
- Nuevos: `src/features/learning/ChoiceListening.tsx`, `tests/lesson-practice.test.cjs`, `docs/LV-009-LEARN-04-PRACTICE.md`, `tasks/LV-009-LEARN-04.md`.
- Modificados: `src/content/pronunciation.ts`, `src/features/learning/{PronunciationCoach,LearningRescue,ExerciseView}.tsx`, `scripts/check-premium.mjs`, `tests/{pronunciation-coach,text-node-regression}.test.cjs`.
- Respaldo en `.backups/LV-009-LEARN-04-20261102-225029` (tomado después de añadir las guías al catálogo; el estado anterior de `pronunciation.ts` está en `.backups/LV-007B-20261102-214248`).

**Verificación:** 226/226, ambos typechecks, lint, export web, `check-premium` ×3 y `check-conversation` PASS. Logs `lv009l4-*.log`. Sin Git.

Detalle, guías y QA manual: [LV-009-LEARN-04-PRACTICE.md](LV-009-LEARN-04-PRACTICE.md).

# Corrección LearningRescue.tsx:43 — nodo de texto vacío en un View (02-nov-2026)

Solicitada como «corrección adicional de LV-009-LEARN-04» antes de recibir la especificación de esa etapa. Forma parte de su reporte (ver arriba).

**Causa (reproducida):** `{practiceText&&<View…>}`. `practiceText` es una cadena que vale `''` al abrir «Practicar hablando sin enviar», y `'' && x` devuelve `''`. Ese nodo de texto vacío queda como hijo directo de un `View`. React Native Web, en desarrollo (`npm run web`), emite `Unexpected text node: . A text node cannot be a child of a <View>.`; el mensaje parece truncado porque el texto está vacío. En Android/iOS el mismo patrón cierra la app.

Segundo caso real del mismo tipo: `EducationalFeedback` `{submittedText && …}` en Roast independiente, tras una respuesta no reconocida (se guarda `''` por privacidad).

No era `build &&` (booleano).

**Por qué no se detectó antes:** las pruebas de UI simulaban `react-native` con componentes falsos, y `check-premium` usa la exportación de producción, donde esa comprobación está desactivada.

**Corrección:** condiciones booleanas explícitas en ambos casos y, por la misma regla, en los demás condicionales con cadenas (`PronunciationCoach`, `BeginnerPreparation`, `ExerciseView`, `Editorial`, `SpeechInput`, `PreferencesForm`). No se silencian errores ni se quita contenido.

**Evidencia:**
- `tests/text-node-regression.test.cjs` (3 casos, con el `View` **real** de react-native-web en modo desarrollo): falla antes de corregir y pasa después. Barre todas las ayudas, abriendo y cerrando, en los 3 modos y en todos los turnos de las tres aventuras, sin envíos.
- Chrome real contra un servidor de desarrollo propio: antes, 1 error por aventura al abrir la práctica; después, 0. El borrador y el progreso guardado se conservan en ambos casos.

**Verificación:** 218/218, ambos typechecks, lint, export, `check-premium` ×3 y `check-conversation` PASS. Logs `lv009-fix-*.log`. Respaldo en `.backups/LV-009-LEARN-04-FIX-20261102-223005`. Sin Git.

# LV-007B — Contextual Conversation Engine (02-nov-2026)

**Estado:** implementado; pruebas automatizadas y recorridos en Chrome real headless aprobados. **Pendiente:** QA manual del usuario, incluidos audio y micrófono.

**Línea base verificada antes de cambiar:** 204/204.

**Qué se hizo:**
- Intérprete local y determinista de frases editoriales con seis resultados: válida, válida con error menor, ambigua, incorrecta, no reconocida y fuera de contexto.
- Memoria derivada de los eventos, sin persistencia nueva.
- Prompts contextuales.
- Validación estática: ninguna ruta vuelve a preguntar un hecho confirmado y todas cumplen los objetivos.
- Contenido nuevo:
  - Londres v5: el destino dicho en «What do you need?» se recuerda y no se repregunta.
  - Café v3: la camarera recuerda bebida, lugar y azúcar.
  - Rendez-vous v2: se corrige que el contacto revelara el lugar antes de preguntarlo; el lugar dicho temprano se recuerda.
- Londres v4, Café v2 y Rendez-vous v1 se archivaron con datos idénticos (verificado) y siguen siendo reanudables.
- Roast Me quedó fijado a café v2, sin cambios.

**Archivos:**
- Nuevos: `src/domain/learning/interpretation.ts`, `src/domain/conversation/memory.ts`, `src/content/london.v4.ts`, `src/content/rendezvous.v1.ts`, `tests/contextual-conversation.test.cjs`, `scripts/check-conversation.mjs`, `docs/LV-007B-CONTEXTUAL-CONVERSATION.md`, `tasks/LV-007B.md`.
- Modificados: `src/domain/learning/{models,engine,validation}.ts`, `src/domain/conversation/presentation.ts`, `src/content/{london,cafe,rendezvous,roast}.ts`, `src/features/learning/{MissionProvider,MissionScreen,EducationalFeedback}.tsx`, `src/features/humor/CoachReaction.tsx`.
- Pruebas anteriores con expectativas de versión actualizadas (sin debilitarlas; ver documento): beginner-learning, conversation-profiles, conversational, london-review, london, rendezvous, roast.

**Respaldo** verificado (196 archivos, SHA-256) en `.backups/LV-007B-20261102-214248`.

**Verificación:** 215/215 (204 + 11 nuevas; 736 conversaciones completas recorridas), ambos typechecks, lint, export web, `check-premium.mjs` normal/`--beginner`/`--rescue` y `check-conversation.mjs` PASS. Logs `lv007b-*.log`. Sin operaciones Git.

Detalle, escenarios, QA manual y limitaciones: [LV-007B-CONTEXTUAL-CONVERSATION.md](LV-007B-CONTEXTUAL-CONVERSATION.md).

# LV-008-LEARN-03 — Pronunciation Coach (02-nov-2026)

**Estado: APROBADA.** **Validación confirmada por el usuario:** 9/9 pruebas manuales en Chrome. Cubren audio, pronunciación, micrófono, ayudas y experiencia móvil. Las ejecutó el usuario, no Claude. La guía archivada tiene 10 pasos; no se atribuye una correspondencia paso a paso. No volver a implementar ni probar esta etapa.

**Sigue pendiente** (fuera de lo validado): revisión docente humana de las 35 guías, más Android/iOS/Safari, lector de pantalla y texto ampliado.

Estado técnico previo a la validación: implementación con pruebas automatizadas y recorridos en Chrome real headless aprobados. Línea base reportada por el usuario: 11/11 pruebas manuales educativas en Chrome (no ejecutadas por Claude). Línea base verificada: 193/193.

**Qué se hizo:**
- Contrato tipado de guías con id, locale, propósito, unidades con significado, consejos de sonido reutilizables, metadatos de revisión y `usedIn`.
- Revisión de las 11 guías: `h` → `j` en inglés y encadenamiento «ü namí», además de las consonantes mudas omitidas.
- 24 guías nuevas: ahora el modelo preferido de **todos** los turnos de respuesta escrita de las tres aventuras tiene guía; antes, 1 de 13.
- Componente `PronunciationCoach` con divulgación progresiva: aproximación visible en Desde cero y bajo demanda en A1/Autónomo; partes con audio normal y lento; sonidos difíciles; «Volver a la conversación».
- Se reutilizan `StudyAudio`, `SpeechButton` y `VoiceController`.
- Sin cambios en evaluación, contenido de misiones, persistencia ni reconocimiento de voz.

**Defecto encontrado y corregido en Chrome:** desbordamiento horizontal a 320 px en los botones de audio lento por fragmento.

**Archivos:**
- Nuevos: `src/features/learning/PronunciationCoach.tsx`, `tests/pronunciation-coach.test.cjs`, `docs/LV-008-LEARN-03-PRONUNCIATION.md`, `tasks/LV-008-LEARN-03.md`.
- Modificados: `src/content/pronunciation.ts`, `src/content/rescue.ts`, `src/features/learning/LearningRescue.tsx`, `src/features/voice/VoiceControls.tsx` (solo textos de `StudyAudio` sin segmentos), `scripts/check-premium.mjs`.
- Respaldo verificado (192 archivos, SHA-256) en `.backups/LV-008-LEARN-03-20261102-200849`.

**Verificación:** 204/204 (193 anteriores + 11 nuevas), ambos typechecks, lint, export web y `check-premium.mjs` normal/`--beginner`/`--rescue` PASS. Logs `lv008-learn03-*.log`. Detalle, revisión editorial y QA manual en [LV-008-LEARN-03-PRONUNCIATION.md](LV-008-LEARN-03-PRONUNCIATION.md).

# LV-008-FIX-01 — Recuperación y versión local de prueba (02-nov-2026)

**Estado:** diagnóstico completado. App ejecutable y recorrida en **Chrome 156 real (headless, por CDP)** por primera vez desde UI-01. Esta vez no hubo bloqueo GPU/CDP. Falta la validación manual del usuario con audio y micrófono físicos.

**Diagnóstico:** la carpeta definitiva contiene la versión más avanzada (LV-007-LEARN-02). Sigue **sin `.git`**: no se ejecutó ninguna operación Git y no se consultó la carpeta antigua. Las dependencias ya estaban instaladas y no se agregó ni cambió ninguna. Línea base sin cambios: **193/193** pruebas, ambos typechecks, lint y export web PASS.

**Recorridos en Chrome real:** `check-premium.mjs` normal/`--beginner`/`--rescue` PASS. Cubren onboarding, las tres aventuras completas, reanudación tras recargar, cancelación de reinicio, preparación guiada por fases (persistida por idioma), guía «ui, zhé rãdevú isí», rescate sin envío, navegación de cinco pestañas, consentimiento Roast deshabilitado sin casillas y ausencia de desbordamiento en 320/390/1280. Un recorrido ad hoc adicional confirmó que el cambio francés→inglés→francés conserva preferencias y progreso. No hubo errores de ejecución ni de consola. Ninguno de estos recorridos reproduce audio ni usa micrófono real.

**Defecto corregido:** en un teléfono de 390×844, la primera pantalla de un turno no mostraba la frase del personaje (el encabezado estaba en y≈790). «Volver a Explorar» ahora comparte fila con los controles de audio, y el acceso «Configurar estilo Roast Me (adultos)» sin consentimiento pasa debajo de la conversación **solo durante un turno activo** (en la portada y el cierre sigue arriba). El encabezado queda en y≈668 y la frase y la traducción son visibles sin desplazarse. Consentimiento, estilo activo y revocación no cambian. Se añadió la aserción correspondiente a `check-premium.mjs`.

**Archivos:** `src/features/learning/MissionScreen.tsx`, `src/features/voice/VoiceControls.tsx` (prop opcional `leading`), `scripts/check-premium.mjs`. Respaldo previo en `.backups/LV-008-FIX-01-20261102-194001/source.zip` con `SHA256SUMS` (verificado). Logs `lv008-fix01-*.log`.

**Verificación final:** 193/193, typecheck:core, typecheck, lint, export:web y los tres modos de `check-premium.mjs` PASS.

**Pendiente / limitaciones:** `scripts/check-web.mjs` (verificador anterior a UI-01) busca textos que ya no existen («Hacelo tuyo.»). Está obsoleto y no indica un fallo de la app; usar `check-premium.mjs`. Las ocho pruebas históricas de LV-007A siguen ausentes (`tests/lv007a-continuity.test.cjs` y 3 casos de `mission-presentation`). El código que verificaban existe; recuperarlas requiere una fuente autorizada. Falta QA de audio/micrófono reales, Android/iOS/Safari y revisión docente de las guías de pronunciación.

# LV-007-LEARN-02 — Enseñar antes de evaluar (31-oct-2026)

**Estado:** rescate implementado; **validación manual con principiante real NO aprobada todavía**. El usuario reportó el fallo de LEARN-01 en rendez-vous/confirm. Se preserva UI-01 y no se confunde aceptación visual positiva con aceptación pedagógica.

Diagnóstico: LEARN-01 excluía rendez-vous y texto, preparando solo dos saludos. Ahora todos los turnos de las tres aventuras tienen recuperación con modelos editoriales ya aceptados, significado/propósito, vocabulario y escucha antes de fallar. Desde cero muestra apoyo anticipado; A1 y Autónomo ofrecen ayuda opcional. Preferencias por idioma y checkpoints previos conservados. Construcción opcional, práctica oral local y confirmación manual del modelo no envían ni califican; preparar llena borrador/opción y Responder sigue explícito. No hay dependencia del reconocimiento para continuar.

Catálogo de **11 guías aproximadas** original/traducción/grafía/IPA/notas/fuentes, con revisión editorial independiente por IA basada en diccionarios; no revisión docente humana/acústica. Incluye S’il vous plaît → sil vu plé y Oui, j’ai rendez-vous ici → ui, zhé rãdevú isí. TTS y evaluación usan únicamente originales; no hay transliteración automática ni nota fonética. Bonjour y S’il vous plaît se escuchan completos; grupos revisados y fallback «Si suena igual» para voces sin ralentización clara. No se afirma que rate0.65 cambie perceptiblemente el audio de esta plataforma.

Evidencia opcional assisted/independent en nuevos eventos, validada por replay y guardado. Resumen separa ayuda, resolución sin modelo y ausencia de registro antiguo, nunca dominio. Incertidumbre escrita excluida de nuevos errores confirmados y de Roast en aventuras. Acceso Roast comprensible en inglés/francés, consentimiento/activación separados, subconjunto regional existente compatible con Londres; sin memes nuevos, motor duplicado ni Live. El Roast independiente conserva referencias textuales previas en su contexto propio, sin atribuir fonética.

**Protección/pruebas:** respaldo190 archivos verificado por SHA-256 `.backups/LV-007-LEARN-02-20261031-020719`; cero originales ausentes y quince archivos protegidos idénticos, incluyendo todos los contenidos de misión/versiones, arte/tokens y dependencias. Baseline181/181 → **193/193 (12 nuevos)**. Typechecks core/general, lint sin advertencias y export web PASS. Revisión independiente y regresiones de cambio de modo A1 y selección del modelo preferido corregidas. Chrome falla antes de cargar por GPU/timeout CDP; sin capturas, escucha real, lector/móvil ni QA nativo.

Diagnóstico/plan: [LV-007-LEARN-02-DESIGN.md](LV-007-LEARN-02-DESIGN.md). Auditoría bilingüe, fuentes, archivos/resultados/limitaciones y **18 pasos manuales**: [LV-007-LEARN-02-QA.md](LV-007-LEARN-02-QA.md). Verificador `scripts/check-premium.mjs --rescue`; logs `lv007-learn02-*.log`. Contenidos de misión idénticos: Londres nuevo sigue v4, antiguas v1/v2/v3 continúan sin reinterpretación. Sin Git/commit/push/merge/deploy, carpeta antigua, nuevas aventuras, IA abierta, servicios o Live.

Prioridad siguiente: prueba real del aprendizaje y perceptiva de audio, disposición/accesibilidad y revisión docente de guías. LV-007B/Live requieren trabajo posterior. Evidencia histórica debajo, incluidas10/10 LV-006B reportadas por el usuario y las ocho pruebas históricas ausentes que no se declararon recuperadas.

# LV-007-LEARN-01 — Preparación para principiantes implementada (31-oct-2026)

**Estado:** implementación y verificación automatizada finalizadas; **validación con principiante real y audio/micrófono físico pendientes**. Se conserva la identidad visual LV-007-UI-01 valorada positivamente por el usuario; esa valoración no se registra como ejecución de su checklist por Codex.

Guía en dos escenas existentes (café/bonjour y Londres/greet): modelo, significado, partes, repetición completa, respuesta y transferencia breve opcional. Selección de ayuda desde cero/pre-A1 o con bases/A1 orientativo, modo guiado/autónomo y checkpoint por idioma, guardados aparte en `lingoverse.learning-support.v1`. No implica nivel medido, nota fonética ni progreso de misión por escuchar o avanzar preparación. Audio lento solicitado al mismo motor, sujeto a voz/dispositivo. Captura, incertidumbre, permisos y edición de transcripción no envían respuestas: confirmar prepara borrador/opción, enviar sigue siendo explícito.

Londres v4 corrige respuesta a oferta de ayuda y agrega alternativas exactas. Archivo v3 conservado byte por byte desde la copia actual y registrado junto a v1/v2; partidas viejas conservan contenido/feedback. Café, rendez-vous, Roast, arte/paleta, claves y esquema de misiones intactos. Reinicio sigue confirmado, ahora discreto. Sin dependencias nuevas, Git, commits, push, merge, deploy ni uso de la carpeta antigua.

**Protección/evidencia:** respaldo de177 archivos verificado por SHA-256 en `.backups/LV-007-LEARN-01-20261031-010218`. Baseline166/166; final **181/181 (15 nuevas)**, ambos typechecks PASS, lint PASS sin advertencias, export web PASS. Las ocho pruebas históricas ausentes siguen ausentes: el nuevo total no supone recuperación de174. Se contrastó el runner y las referencias originales; ver diagnóstico. Revisión independiente de código y corrección probada de feedback de transferencia. Chrome falló antes de cargar por GPU/timeout CDP; sin capturas ni QA nativo, físico o con estudiantes reales.

Diagnóstico/plan: [LV-007-LEARN-01-DESIGN.md](LV-007-LEARN-01-DESIGN.md). Cambios, archivos, comandos, resultados, límites del reconocimiento y **18 pasos manuales**: [LV-007-LEARN-01-QA.md](LV-007-LEARN-01-QA.md). Logs `lv007-learn01-*.log`; verificador ampliado `scripts/check-premium.mjs --beginner` pendiente de ejecución efectiva en Chrome. Las10/10 de LV-006B continúan como validación reportada por el usuario.

Roast Me Live queda **solo como requisito futuro** en PRODUCT_VISION/ROADMAP: humor adulto extremo regional auténtico, voz/risas reales, variedad, enseñanza al final, consentimiento fuerte específico y revocación inmediata. No se implementó Live ni LV-007B; priorizar QA de principiantes y fiabilidad/revisión del reconocimiento antes de esas fases.

Los apartados siguientes conservan evidencia histórica.

# LV-007-UI-01 — Rediseño implementado; aceptación visual pendiente (31-oct-2026)

Implementados Inicio, Explorar, composición de aventura, retratos NPC, entrenadores, estados de voz/micrófono/feedback, navegación de cinco secciones, Practicar con accesos a aventuras y Trabajo con disponibilidad futura explícita. Perfil usa controles reales de voz y selección visual de entrenador; Roast Me conserva consentimiento/revocación con presentación propia. Paleta tinta/jade/ámbar y dos atlas originales locales. Se preservan contenidos, motores, persistencia y continuidad LV-007A; no hay cambios de dependencias ni implementación de LV-007B.

**Evidencia:** 166/166 tests PASS tras corregir una comprobación de composición; ambos typechecks, lint sin advertencias y exportación web PASS. Revisión independiente de código y correcciones realizadas. Chrome no llegó a cargar: error GPU/timeout CDP `Page.enable` en intentos antes/después. **No hay capturas reales ni validación visual/voz/micrófono de esta entrega**, ni QA Android/iOS/Safari. No confundir imágenes generadas con capturas del producto.

Especificación y auditoría: [LV-007-UI-01-DESIGN.md](LV-007-UI-01-DESIGN.md). Archivos, pruebas, errores corregidos, recursos/licencias y **guía manual de18 pasos**: [LV-007-UI-01-QA.md](LV-007-UI-01-QA.md). Verificador preparado `scripts/check-premium.mjs`, pendiente de ejecución efectiva en Chrome normal. Validar el rediseño antes de iniciar LV-007B. Git sigue sin inicializar, sin commits/push/merge/deploy ni uso de la copia antigua.

# Verificación local y fuente principal (31-oct-2026)

- Fuente definitiva confirmada por el usuario: `D:\Documents\Jason\LingoVerse\LingoVerse Main\LingoVerse-Codex-Inicio`. Acceso de lectura y escritura autorizado en esta sesión. La carpeta anterior no se consultó ni se utilizó para copiar archivos.
- **Validación reportada por el usuario:** completó personalmente **10/10 pruebas manuales de LV-006B en Chrome**. No son pruebas ejecutadas por Codex. El checklist archivado tiene 11 puntos; no se atribuye una correspondencia individual ni aceptación de otras plataformas o de LV-007A.
- Verificación de Codex sobre esta copia, antes del rediseño: `npm.cmd test` **166/166 PASS**; `npm.cmd run typecheck:core`, `npm.cmd run typecheck`, `npm.cmd run lint` y `npm.cmd run export:web` **PASS**. Logs locales: `lv007-ui01-baseline-{tests,types,lint,export}.log`; exportación local en `dist/`, sin publicación.
- Discrepancia frente al registro histórico de 174 tests: faltan `tests/lv007a-continuity.test.cjs` (5 casos documentados) y los 3 casos LV-007A descritos para `tests/mission-presentation.test.cjs`. También faltan `tasks/LV-007A.md` y `docs/LV-007A-CONVERSATION-FLOW.md`. El código de `ConversationBridge`, `latestConversationBeat` y reproducción del modelo verificado sí está presente. No se sustituyeron archivos para resolver esta diferencia.
- Se comprobó la presencia de contenido histórico de café v1/v2, Londres v1/v2 y la aventura rendez-vous. Se conserva la implementación existente de LV-006B y LV-007A.
- `git status --short` devuelve «not a git repository». No se ejecutó init, clone, reset, merge, commit, push ni ninguna operación Git de escritura. La recuperación de control de versiones queda por definir con el usuario.
- **LV-007-UI-01:** inicialmente no estaba su tarea/prompt; el usuario proporcionó el alcance completo durante esta sesión y autorizó definir el sistema visual e implementarlo. Ver entrega actual arriba. LV-007B queda fuera de alcance.

Los apartados siguientes conservan los resultados históricos de las entregas anteriores; la verificación local y confirmación manual de arriba prevalecen donde difieren.

# LV-006B — Segunda aventura de francés «Un rendez-vous à Paris» (31-oct-2026)

**Corte actual:** implementada sobre **copia del proyecto completo LV-007A** previamente entregado. Línea base `npm test`: **160/160** antes de cambios. Resultado final: **174/174** (14 nuevas), `npm run typecheck:core` OK, `npm run typecheck` OK, `npm run lint` OK sin advertencias, `npm run export:web` OK. **QA manual de LV-006B en Chrome pendiente**. Intento de Chromium automatizado **no aprobado** debido al bloqueo del entorno a `127.0.0.1` antes de cargar la app. El usuario aceptó LV-006A-REV-01 en Chrome previamente, pero **no** ha validado LV-007A ni LV-006B manualmente. Android/iOS nativos tampoco verificados.

**Implementación:** nueva lección francesa A1 `fr-a1-paris-rendezvous` **v1**, totalmente separada de `fr-a1-paris-cafe` y de `en-a1-london-lost`, con dos historias («Un message au jardin» y «La carte postale»), dos bifurcaciones genuinas por historia y diez objetivos en cada recorrido. Árboles → Adrien / flores → Nadia en Jardín de Luxemburgo; puente → Hugo / bouquinistes → Zoé junto al Sena. Cambian interlocutores, escenas, instrucciones, recorrido y cierre. Los finales reutilizan las expresiones aprendidas. Las reglas escritas locales usan alternativas semánticas editadas, diagnósticos específicos de errores conocidos y estado **unknown** para texto que no puede confirmarse. No hay evaluación ilimitada de lenguaje natural ni de pronunciación.

**Arquitectura:** nueva ruta Expo `/rendezvous`; contexto React `RendezvousContext` y `MissionRepository` independientes de café/Londres; almacenamiento `lingoverse.mission.fr-a1-paris-rendezvous.v1` sin migraciones de los otros registros. `MissionScreen`, `CafeScene`, `ChapterReview`, `CoachReaction` y `ExerciseView` reciben un identificador de aventura opcional con defaults compatibles. La reacción del entrenador usa el estado de **esta** misión, no el del café. Voz NPC/modelo y micrófono existentes con `fr-FR`, entrenador en español regional y teclado de reserva. Arte original local por primitivas RN con jardín/río (ningún material licenciado externo), nombres y retratos propios sin tocar los activos aprobados. Sin paquetes, APIs de pago, cambios Git, nuevos modelos de persistencia ni mecánicas de recompensa.

**Pruebas añadidas:** once casos de contenido, rutas, equivalencias, negativos, correcciones, aislamiento/reanudación, voces y no filtración; tres de render TSX de voz/coach/repaso. Pasan todas junto a las 160 previas. **No** se ejecutó QA real con micrófono ni reproducción física de voces. Consultar [LV-006B-ADVENTURE-AND-QA.md](LV-006B-ADVENTURE-AND-QA.md), [LV-006B.md](../tasks/LV-006B.md) y [HANDOFF_TO_CODEX.md](HANDOFF_TO_CODEX.md).

---

# LV-007A — Continuidad entre escenas (31-oct-2026)

**Estado:** implementación incremental finalizada y validada automáticamente (**160/160 tests**, ambos typechecks, ESLint y exportación web aprobados). **QA manual de LV-007A en Chrome pendiente.** El usuario confirmó que la corrección anterior **LV-006A-REV-01 funciona** en su Chrome tras incorporar `london.v1.ts`; no se atribuye ese resultado a la nueva interfaz ni se inventan nuevos tests manuales. Android/iOS nativos siguen sin verificar.

El último intercambio completado (modelo de respuesta verificada y última intervención NPC o pregunta anterior) aparece antes del nuevo turno para preservar continuidad. Opcionalmente puede escucharse en el idioma original. Las respuestas **correctas** ya verificadas permiten «Escuchar el modelo de tu respuesta» en el idioma de la aventura, sin evaluación fonética, ni voz automática. El puente deriva de los eventos ya confirmados, nunca del grafo futuro; no cambia contenido, versiones, repositorios ni estructura de progreso. Francia/París, Londres v1/v2/v3, micrófono, fallback escrito y humor permanecen intactos. No hay nuevas dependencias. Ver [LV-007A-CONVERSATION-FLOW.md](LV-007A-CONVERSATION-FLOW.md) y [HANDOFF_TO_CODEX.md](HANDOFF_TO_CODEX.md).

---

# LV-006A-REV-01 — Corrección pedagógica y audio (31-oct-2026)

**Estado actual:** implementación corregida de Londres **v3** con aceptación automática **152/152 pruebas**, typecheck core/general, ESLint y export web aprobados. **QA manual de esta revisión todavía no realizado.** El intento de Chromium automatizado no cargó la aplicación por bloqueo del entorno a `127.0.0.1`. El QA anterior de LV-006A tuvo 11/12 pasos ejecutados con defectos; punto 10 (alternar francés/inglés) pendiente. LV-005B-02 sí fue validada por el usuario con 9/9 pasos manuales en Chrome anteriormente.

Corregidas las respuestas válidas previamente rechazadas «I need help» y «Yes, I'm new here» (incluida «yes , I'm new here»); equivalencias editoriales nuevas y rechazo de negaciones contradictorias. El mensaje desconocido ahora indica incertidumbre en vez de inventar una falta. Narrativa revisada (preguntar por destino y despedirse antes de llegar). Feedback hablado del entrenador en español sin ejemplos ingleses mezclados en el TTS; ejemplos separados con `en-GB` y francés `fr-FR`. No hay nuevas dependencias ni capacidades de pronunciación.

`src/content/london.v2.ts` archiva v2 sin modificar sus ejercicios y `src/content/london.v1.ts` permanece; el proveedor permite reanudar v1/v2 y nuevas partidas inician v3 **solo tras confirmar reinicio**. Sin cambio de clave de progreso; sin migración automática. Todo se realizó sobre la copia del ZIP, sin modificar directamente la ruta Windows ni ejecutar operaciones Git de escritura. Ver diagnóstico, inventario de escenas, comandos/resultados y checklist en [LV-006A-REV-01-AUDIT.md](LV-006A-REV-01-AUDIT.md). **No atribuir al usuario aceptación posterior de voz/acento todavía pendiente.**

---

## LV-006A-02 — corrección incremental tras hallazgos de Chrome (30-oct-2026)

El usuario informó **11/12 puntos de prueba manual ejecutados** para *Lost in London*; **pendiente el punto 10** de cambio inglés ↔ francés. No se debe interpretar la ejecución como aceptación total: capturas muestran ejemplos con etiqueta «en francés» en Londres, feedback genérico para «What is the Theatre?», conversaciones confusas y mezcla de traducción. El usuario percibió acento incorrecto al escuchar al entrenador/ejemplos.

**Corrección de código:** en audio de ejemplos se emplea idioma del ejercicio (`en-GB` / `fr-FR`); las burbujas separan texto original y traducción; las frases del entrenador español siguen usando `coachLocale` (la calidad de voz nativa sigue sin verificarse). Se creó contenido London **v2** con correcciones pedagógicas *what/where* y escenas de Ben/Leo más coherentes. La **v1 se archiva exactamente en `src/content/london.v1.ts` y sigue reanudable sin pérdida**, con registro por versión en el mismo repositorio; los cambios de contenido v2 solo se muestran al empezar una partida nueva/reiniciar voluntariamente. París no se modifica.

**Automatizado ejecutado:** `npm test` **140/140 OK** (5 pruebas adicionales tras 135), `npm run typecheck:core` **OK**, `npm run typecheck` **OK**, `npm run lint` **OK**, `npm run export:web` **OK**. Los tests de voz son simulados. **No** se probó micrófono/acentos reales tras el parche ni Android/iOS. El QA del usuario anterior sigue siendo evidencia de LV-006A v1, no de aceptación de v2. Ver `docs/LV-006A-02-QA-FIXES.md` y `docs/HANDOFF_TO_CODEX.md`.

---

# Estado del proyecto

## LV-006A — primera aventura inglesa «Lost in London» (2026-10-30)

**Estado:** Implementación incremental y pruebas automatizadas aprobadas; **QA manual Chrome de la nueva aventura pendiente**. La entrega se realizó sobre la copia adjunta de LV-005B-02, sin modificar la carpeta Windows del usuario ni ejecutar operaciones Git de escritura. `feature/lv-005a-conversational-adventures` se observó mediante `git status` (solo lectura); el árbol ya contenía muchas modificaciones y archivos sin seguimiento, preservados.

**Confirmación de LV-005B-02:** El usuario reportó explícitamente **9/9 pruebas manuales aprobadas en Chrome de escritorio** el 30/oct/2026: inicio, voces de personajes, permiso/micrófono, transcripción editable, evaluación de respuesta hablada, error educativo, fallback escrito, cancelaciones y progreso/diseño. Se conserva también su evidencia anterior **124/124 tests automatizados** y ambos typechecks, lint y exportación web aprobados. **No** implica reconocimiento Android/iOS, evaluación de pronunciación ni QA manual inglés.

Se añadió la lección **`en-a1-london-lost` v1** con dos relatos ingleses A1 originales y nueve objetivos por recorrido. `station-arrival` (Maya, King’s Cross, Blue Door Hostel ficticio) bifurca entre Nora a pie y Ben en autobús; `riverside-rain` (Ollie, South Bank, Lantern Theatre ficticio) bifurca entre Asha junto al río y Leo en el mercado. Las elecciones cambian escenarios, PNJ, indicaciones y conclusión. Trece nodos alcanzables por variante, nueve visitados en cada ruta, con respuestas escritas alternativas y opciones equivalentes; los errores conocidos muestran enseñanza contextual. No se afirma comprensión libre ilimitada.

La adaptación a `en | fr` es de dominio y props de componentes compartidos, no condicionales ingleses en Learning Engine. Se reutilizan evaluación, historial/eventos, Variety Engine, controladores TTS/STT y fallback escrito. El entrenador usa el contexto del idioma activo para no filtrar reacciones francesas ni Roast a Londres. Voz NPC y micrófono solicitan `en-GB`, la transcripción sigue siendo editable y no califica pronunciación. Página `/london`, tarjetas en Inicio/Explorar, escena de Londres dibujada con RN, retratos tipográficos y repaso de escenas realmente visitadas. Progreso local por lección/versiones separado de París; las versiones francesas no se modificaron. Sin nuevas dependencias, API de pago, despliegue ni cambios Git de escritura.

**Validación nueva:** `npm test` **135/135**, con 11 pruebas nuevas de Londres (9 en `tests/london.test.cjs` y 2 de integración TSX) además de los 124 iniciales; `npm run typecheck:core` **OK**; `npm run typecheck` **OK**; `npm run lint` **OK**; `npm run export:web` **OK**. Se intentó `node scripts/check-web.mjs --browser /tmp/lingoverse-chromium`: **no aprobado** por restricción externa del contenedor `127.0.0.1 is blocked`; navegador nunca cargó la app. **No se ha realizado** QA manual real para esta misión de inglés ni pruebas de micrófono/TTS inglés en dispositivo. Consultar [LONDON_ADVENTURE.md](LONDON_ADVENTURE.md) y [HANDOFF_TO_CODEX.md](HANDOFF_TO_CODEX.md).

---


## LV-005B-02 — reconocimiento de voz web incremental (registro histórico anterior a las 9 pruebas manuales)

> **Actualización posterior:** el usuario confirmó **9/9 pruebas manuales de LV-005B-02 en Chrome escritorio**. Las frases «pendiente de QA» de este apartado reflejan el momento anterior a su confirmación; el corte vigente está en LV-006A al inicio.

**Estado:** código implementado y compilado, **pendiente de validación manual con micrófono real**. Esta ejecución trabajó sobre la copia del ZIP enviado; no escribió en `D:\Documents\Jason\LingoVerse\LingoVerse-Codex-Inicio`. Rama leída `feature/lv-005a-conversational-adventures`; no se hicieron commit, push, merge, checkout, reset ni deploy. Se preservaron los 109 cambios/modificaciones/sin seguimiento presentes al extraer el ZIP (revisar `git status` antes de integrar en Windows).

**Línea base comprobada del ZIP:** 114/114 pruebas, sin editar proyectos anteriores. LV-005B-01 ya incluía controlador de cola TTS, proveedor compartido, adaptadores web/nativos, controles reproducir/repetir/detener y `expo-speech ~57.0.3`. El usuario había confirmado manualmente en Chrome la voz de Camille en francés y Luz en español. Los documentos de estado anteriores se habían quedado en LV-005A-UI-01; las frases históricas «sin voz» no describen el código actual.

**Se agregó LV-005B-02:** reconocimiento `SpeechRecognition`/`webkitSpeechRecognition` en navegadores compatibles, en contexto seguro, solo por pulsación explícita. Audio de personaje se detiene al empezar dictado y la reproducción nueva cancela dictado. Captura una frase francesa `fr-FR`, presenta texto final revisable/editable y lo traslada al borrador escrito o a una opción visible de coincidencia única; se evalúa únicamente con el botón ordinario del Learning Engine. Se conservan interfaz, entrenadores, humor, consentimiento, variante de contenido, persistencia y comportamiento sin micrófono. El navegador puede enviar audio a servidores externos; mensaje visible antes de hablar. No se guardan grabaciones por código de LingoVerse y no se evalúa pronunciación.

**Validaciones en esta copia:** 10 pruebas nuevas, **124/124 tests Node OK**; `npm run typecheck:core`, `npm run typecheck`, ESLint (CLI local), `npm run export:web` OK. Web bundle local creado; ninguna publicación. `npm run lint` puede fallar por permisos del shim `.bin` después de descomprimir el ZIP en Linux, no por reglas; ejecutar el binario JS local o restaurar permisos de ejecución. El script de recorrido Chromium fue intentado pero **NO aprobado**: una política del entorno bloquea `127.0.0.1` en el navegador. Sin micrófono físico en pruebas, sin aprobación Chrome real de STT, Android/iOS o Safari. Se corrigió además la espera prematura de `document.body` en el script de QA; ese ajuste no solventa la restricción de red del navegador. Ver [SPEECH_RECOGNITION.md](SPEECH_RECOGNITION.md) y [HANDOFF_TO_CODEX.md](HANDOFF_TO_CODEX.md).

**Dependencias nuevas:** ninguna. `expo-speech-recognition@^57` se investigó como alternativa nativa, pero no se incorporó: necesita plugin, permisos, build de desarrollo y pruebas reales; Expo Go no lo incorpora. No hubo cambios a package manifests en LV-005B-02 (los del ZIP ya tenían modificaciones anteriores). Próximo paso: QA manual en Chrome de escritorio con permiso/micrófono real, error/red y uso de la transcripción en opciones y respuesta escrita; después decidir si conviene fase nativa separada.

## LV-005A-UI-01 — presentación inmersiva (2026-10-30)

Implementado en la rama existente `feature/lv-005a-conversational-adventures`,
árbol limpio al inicio. Sin cambiar rama ni realizar commit/push/merge/deploy.
Diseño aprobado por delegación; documento y plan bajo `docs/superpowers/`.

Escenario original local, seis NPC y cuatro entrenadores ilustrados; conversación
compacta, respuestas integradas, ayuda en dos niveles, traducción sin revelación
automática antes de intentar, borrador recuperado tras error, historial revisable
debajo del turno y cierre con tres expresiones reales de la rama. Animación breve
de opacidad con movimiento reducido. Se conservaron motores, versiones, progreso,
consentimiento, repositorios, contratos de voz y Roast independiente.

Validación: `npm.cmd test` 102/102; `npm.cmd run typecheck:core`, `npm.cmd run
typecheck`, `npm.cmd run lint`, `npm.cmd run export:web` aprobados. Chrome 156 normal
y `--roast`: recorridos completos, pistas, corrección, reanudación, finalización,
historial, consentimiento/revocación, 320/390/1280 y viewport reducido. Capturas y
logs locales en `.web-check` y `lv005a-ui01-*.log`. `git diff --check` limpio.

Incidencias corregidas: prueba RED de traducción automática; import de tipo React;
lint de ref durante render; revisión independiente detectó espaciado perdido en
Roast y se restauró. GPU/CDP bloqueado en sandbox, QA Chrome completado fuera con
autorización. ADB fuera del sandbox lista cero dispositivos: sin QA Android real.

Archivos nuevos: `assets/adventure/{cafe,portraits,coaches}.jpg` y README;
`src/components/AdventureArt.tsx`, `src/features/learning/ChapterReview.tsx`, tarea,
diseño y plan. Modificados: UI/KeyboardScroll, Conversation, ExerciseView,
MissionScreen, CoachCharacter, pruebas de presentación, script QA y documentación.

Pendientes: arte final con expresiones/climas, revisión docente/cultural y usuarios
reales; Android/iOS/teclado real/Safari/lectores/fuente grande. No se afirma eficacia
pedagógica ni atractivo validados. Detalle en `CONVERSATIONAL_EXPERIENCE.md`.

## LV-005A — aventura conversacional (2026-10-30)

Rama verificada `feature/lv-005a-conversational-adventures`, base `b657790`, limpia
al iniciar. Humor Engine, Roast, correcciones de teclado y documentos V3 presentes.
Base repetida: 94/94 tests, ambos typechecks y lint aprobados. ESLint ya excluía
`.web-check/**`; Git ignora perfiles, builds y logs, sin artefactos bajo seguimiento.

Implementados escena gráfica local, NPC/estudiante diferenciados, ayuda desplegable,
feedback unificado y conversación anterior derivada de eventos, sin otra persistencia
ni turnos adelantados. Se preservan seis variantes, ocho objetivos, ramas y versiones
anteriores. Roast independiente conservado y estilo de cafetería opcional agregado,
desactivado por defecto, con consentimiento, snapshot persistido y revocación inmediata.
Contratos de voz y hechos educativos preparados; sin voz, diario, pasaporte o recompensas.

Ver [CONVERSATIONAL_EXPERIENCE.md](CONVERSATIONAL_EXPERIENCE.md) para arquitectura,
QA reproducible y límites. Resultado: **100/100 tests**, typecheck:core, typecheck,
lint y export:web aprobados. Chrome 156: recorrido completo, error/recuperación,
reanudación, historial sin duplicados, finalización, reinicio, 320/390/1280 px sin
overflow y campo/botón con foco en viewport reducido. Capturas inspeccionadas.
Roast web conserva referencias y revocación; también se verificó activar su estilo
en cafetería, conservar snapshot tras recarga y revocar manteniendo progreso.
Ambos recorridos web terminaron con salida 0 y sin excepciones runtime.
El primer Chrome falló GPU/CDP dentro
del sandbox; reintento autorizado fuera del sandbox pasó.

Android intentado en emulator-5554 con Expo Go y Metro 8087/8088: error de carga y
posterior espera indefinida antes de verificar la misión. No se valida teclado nativo.
Safari/iOS, lectores y dispositivos físicos pendientes. Servidores/reverse retirados.

Archivos nuevos: `domain/conversation/presentation.ts`, `features/learning/Conversation.tsx`,
`tests/conversational.test.cjs`, `tasks/LV-005A.md`, `docs/CONVERSATIONAL_EXPERIENCE.md`.
Modificados: MissionScreen, ExerciseView, CoachReaction, modelos/preferencias de humor,
MissionRepository, pruebas de presentación, script web y documentación. Sin cambios
al Learning Engine, contenido francés, dependencias ni operaciones Git de escritura.
Los apartados anteriores conservan su carácter histórico; Roast como estilo deja
de estar pendiente para esta aventura compatible.

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
