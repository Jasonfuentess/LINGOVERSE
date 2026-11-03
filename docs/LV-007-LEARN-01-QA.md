# LV-007-LEARN-01 — Entrega, evidencia y QA para principiantes

## Resultado y límites

Implementada preparación para principiantes en **dos escenas existentes**: saludo de «Un café en París» y aceptación de ayuda al entrar a «Lost in London». Se conserva la identidad LV-007-UI-01 que el usuario considera positiva. No se añaden aventuras, Roast Me Live, LV-007B, APIs de pago, paquetes, cambios Git ni despliegue.

La guía es enseñanza y preparación voluntaria; **no certifica pronunciación ni nivel CEFR**. La transcripción es un borrador revisable. Sin voz instalada/compatible no se puede garantizar aprender pronunciación escuchando: la app lo explica, permite revisar las voces y continuar por texto. No se hizo estudio con principiantes reales ni QA acústico/nativo en esta sesión.

Diagnóstico y contratos: [LV-007-LEARN-01-DESIGN.md](LV-007-LEARN-01-DESIGN.md).

## Protección y diferencia histórica de pruebas

- Fuente única: `D:\Documents\Jason\LingoVerse\LingoVerse Main\LingoVerse-Codex-Inicio`; lectura/escritura legítimas comprobadas mediante respaldo. Sin `.git`; no se ejecutaron comandos Git.
- Respaldo `.backups/LV-007-LEARN-01-20261031-010218/source.zip` y `manifest.json`:177 archivos, cada entrada comprobada por SHA-256. No incluye node_modules, partidas de Chrome ni grabaciones. La comparación final de fuentes originales no detectó archivos eliminados.
- Baseline **166/166**. `scripts/test.mjs` compila y descubre todos los `.test.cjs` del directorio tests, sin filtros que oculten casos. Handoff histórico enumera5 pruebas en `tests/lv007a-continuity.test.cjs` ausente y3 pruebas LV-007A no presentes en `mission-presentation.test.cjs`; también faltan `tasks/LV-007A.md` y `docs/LV-007A-CONVERSATION-FLOW.md`.
- La diferencia es compatible con174−8=166. No se dispone de los ocho cuerpos originales: **no se reconstruyeron ni se declararon recuperados**. El código de continuidad y audio de respuestas verificadas permanece.
- Suite actual **181/181**, que corresponde a166 existentes +15 nuevas:10 de dominio/repositorio/reconocimiento,3 de presentación y2 del componente real de transcripción. Coincidir en algún momento con174 durante el trabajo no significó recuperar la suite histórica.
- Las **10/10 pruebas de LV-006B en Chrome** siguen registradas como reportadas por el usuario. La valoración positiva de la identidad UI tampoco implica que Codex ejecutara aquel checklist.

## Cambios pedagógicos y de UX

1. **Preparación guiada:** escuchar el modelo, significado en español, fragmentos editoriales, frase completa y respuesta al NPC. Botones de avance explícitos; no se marca un audio como escuchado por pulsar Siguiente. La repetición sin grabar es válida. Luego se propone una situación relacionada con feedback visible, sin XP ni otra aventura, y se permite continuar aunque se omita la transferencia.
2. **Autonomía:** desde la misma aventura se elige «Empiezo desde cero» o «Ya tengo bases · A1 orientativo». El modo puede alternarse independientemente. Quien ya conoce la expresión puede responder directamente; quien completó la preparación no debe repetir todos los pasos, pero puede volver a escuchar/practicar.
3. **Persistencia separada:** `lingoverse.learning-support.v1` guarda orientación, modo y checkpoint por idioma/expresión. No guarda nota, audio ni transcripción. No toca claves de misión, preferencias anteriores ni consentimiento. Lecturas corruptas no se reemplazan automáticamente; si falla la ayuda se conserva la aventura y se ofrecen ayudas habituales/reintento.
4. **Londres v4:** «Hello! Do you need help?» / «Hi there! Need some help?» se contestan con «Hello! Yes, please.» o «Hi! Yes, I need help.». Se aceptan alternativas editoriales breves «Yes, please.», «Yes, I need help.» y otras dos equivalentes explícitas. Formato trivial se normaliza; ambigüedades entre opciones no se adivinan. Café conserva saludo diurno Bonjour coherente en todas sus variantes.
5. **Versiones guardadas:** archivo `london.v3.ts` idéntico al London original del respaldo, SHA-256 `C09BE6AAFD59D5BA9F4426260558E2BEE3A667ADD8BFEF10975C912479D9A96F`. Repositorio conserva v1/v2/v3; nueva partida usa v4. Una partida vieja **mantiene su diálogo antiguo**, con aviso al inicio; la guía usa un id separado para ese saludo. No se migra ni reinicia automáticamente. Francés, rendez-vous y Roast no cambian su contenido.
6. **Voz lenta:** rate0.65 solicitado al mismo controlador y adaptadores; normal0.9. Se conserva idioma, cola, cancelación, silencio y consentimiento. Cada motor/voz puede limitar el efecto. Aislar partes puede cambiar su sonido respecto de la frase: siempre se ofrece el modelo completo después.
7. **Responder:** en la escena guiada la acción principal es «Responder al personaje». Micrófono y controles de respuesta aparecen después de preparar o al elegir autonomía. Reiniciar es acción textual discreta, con la confirmación original intacta. La transcripción editable se integra con el mismo control de teclado/scroll del borrador escrito.

## Reconocimiento: qué se diferencia realmente

| Situación | Tratamiento |
|---|---|
| Texto reconocido compatible con respuesta válida y evidencia suficiente | «El texto coincide…», siempre con revisión y confirmación; no es puntuación fonética |
| Texto corresponde a una opción incorrecta o error conocido | Se explica que **el texto transcrito** no responde; se permite corregir lo que Chrome entendió antes de usarlo |
| Texto fuera del repertorio, confianza baja/ausente o inválida | Incertidumbre; no diagnóstico de pronunciación ni rechazo educativo automático |
| Sin frase/final, reconocimiento inexistente o servicio fallido | Mensaje específico y teclado/opciones disponibles |
| Permiso denegado | Aviso de permisos, sin crear intento de aprendizaje |
| Idioma **configurado** incompatible | Se descarta el resultado como respuesta y se ofrece reintentar/escribir |
| El usuario realmente habló otro idioma | No se afirma detección fiable: se muestra el idioma solicitado y se pide revisar el texto |

Confianza del navegador no es evidencia fonética ni probabilidad calibrada de corrección educativa. El umbral0.7 es una precaución de UX para señalar incertidumbre, no un estándar de pronunciación. Ausencia de confianza y valores0/no finitos/fuera de rango se tratan como evidencia insuficiente. No se muestra porcentaje de «calidad oral».

Flujo: **capturar → revisar/editar → Confirmar y usar texto revisado → elegir enviar al personaje**. Captura, error de permisos, texto incierto y edición no llaman al envío de respuesta. Confirmar solo prepara el borrador o selecciona una opción inequívoca. Al pulsar luego Responder/Comprobar, el motor evalúa el texto/opción que la persona decidió enviar; una equivocación confirmada sigue teniendo corrección educativa. No se evalúa el audio.

El navegador puede enviar la voz a su servicio; LingoVerse no guarda grabaciones. Se mantiene opt-in separado para voces del navegador con red. La velocidad lenta no añade proveedor ni costes. Referencia primaria: [Web Speech API](https://webaudio.github.io/web-speech-api/), secciones de confianza de reconocimiento y rate de síntesis.

## Pruebas ejecutadas

| Comando | Resultado |
|---|---|
| `npm.cmd test` baseline | 166/166 PASS |
| Tests nuevos antes de implementación | Fallos observados de coherencia, rate, guía, revisión y alternativas; logs `lv007-learn01-*-red.log` |
| `npm.cmd test` final | 181/181 PASS |
| `npm.cmd run typecheck:core` | PASS |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run lint` | PASS, sin advertencias |
| `npm.cmd run export:web` | PASS; dist local, sin deploy |
| `node --check scripts/check-premium.mjs` | PASS sintáctico |
| `node scripts/check-premium.mjs --beginner --browser 'C:/Program Files/Google/Chrome/Application/chrome.exe'` | FAIL antes de cargar: GPU no utilizable y timeout CDP `Page.enable` |

Regresiones: progresión explícita y sin nota; modelos francés/inglés aceptados; transferencia y explicación visibles; autonomía sin preparación obligatoria; almacenamiento concurrente por idioma; cuota/corrupción; preservación de misiones y replay v3; cuatro rutas v4 completas; alternativas y ambigüedad; velocidad al driver; error de idioma/permisos/silencio; incertidumbre. El componente **real SpeechInput** se ejercita con callbacks/controlador reales y primitivas/driver de prueba: no usa transcripción como envío y exige confirmar el texto editado. No demuestra comportamiento físico de Chrome, teclado móvil o micrófono.

Incidencias corregidas: tres tests fijaban versión3 y ahora verifican versión4 además del archivo v3; lint detectó una actualización síncrona dentro del efecto de carga y un import sin uso; la revisión independiente detectó feedback de transferencia que desaparecía al guardar, corregido con regresión. La primera prueba focalizada tras typecheck usó `.test-build` anterior porque typecheck no emite: se volvió a ejecutar mediante `npm test`, que sí recompila.

No hay capturas nuevas porque Chrome no llegó a cargar. Perfiles bajo `.web-check/beginner-learning` y logs no equivalen a QA. Evidencia local: `lv007-learn01-baseline-tests.log`, `lv007-learn01-tests.log`, `lv007-learn01-core.log`, `lv007-learn01-types.log`, `lv007-learn01-lint.log`, `lv007-learn01-export.log`, `lv007-learn01-browser.log` y logs de ciclos de pruebas. Revisión independiente de código finalizada, sin defectos bloqueantes. Audio real, novatos reales, Safari, Android/iOS y accesibilidad con lector real siguen pendientes.

## Guía manual — alguien que nunca pronunció francés

Abrir en PowerShell:

```powershell
Set-Location -LiteralPath 'D:\Documents\Jason\LingoVerse\LingoVerse Main\LingoVerse-Codex-Inicio'
npm.cmd run web
```

Usar la URL/puerto de Expo. Para probar desde cero sin tocar partidas personales, usar un perfil de Chrome separado; mantener el mismo origen/perfil al comprobar persistencia. No borrar localStorage. Anotar PASS/FAIL/NO EJECUTADO, voz disponible, ancho, variante y observación; grabación de voz del estudiante no es necesaria.

| # | Acción | Resultado esperado |
|---|---|---|
| 1 | Entrar como invitado, francés, abrir café y elegir «Empiezo desde cero» | Ayuda guiada activa por defecto o elegible; declara que no evalúa nivel |
| 2 | Comenzar y leer/escuchar al NPC | Personaje y estilo aprobados conservados. Antes de elegir respuesta aparece «Escuchá el modelo», sin obligación de hablar |
| 3 | Activar audio para practicar; escuchar Bonjour y repetir más despacio | Voz francesa compatible, sin voz española sustituta. Lento perceptible si el motor lo admite. Si falta voz, aviso honesto y acceso a revisar voces; registrar oral como NO EJECUTADO |
| 4 | Ver significado | Comprende que Bonjour saluda de día al entrar; puede explicar el significado en español, sin memorizar fonética inventada |
| 5 | Practicar por partes y volver a la palabra completa | Escucha bon/jour en francés, nota de límites del sonido aislado y modelo completo posterior |
| 6 | Repetir sin grabar, tantas veces como quiera; pulsar Estoy listo | No aparece puntuación ni afirmación de pronunciación correcta. Se habilitan respuesta y micrófono opcional |
| 7 | Elegir Bonjour y responder al personaje | Avanza solo por envío explícito; feedback educativo, no nota fonética |
| 8 | Contestar situación de otra tienda; probar primero despedida y luego saludo | Ayuda contextual sin penalización de misión ni XP; explicación del saludo correcto queda visible; Continuar sigue disponible |
| 9 | En una partida de prueba aún en saludo, hablar y observar lo que Chrome transcribe | Revisar antes de usar. Si escucha otra cosa, corregir o repetir; no hay intento educativo nuevo, error acumulado ni roast por la captura |
| 10 | Editar texto y confirmar; todavía no pulsar Responder | Solo cambia borrador/selección. Después responder explícitamente. Si no coincide con opción conocida, explicar sin inventar pronunciación y permitir corrección/selección manual |
| 11 | Denegar permiso, guardar silencio y cancelar/reintentar | Mensajes diferenciados; opciones/teclado disponibles. Registrar sin atribuir fallo al francés del estudiante |
| 12 | Revisar idioma visible de reconocimiento y probar escribir una transcripción incorrecta | Francés usa fr-FR y Londres en-GB. No afirmar que detecta automáticamente idioma hablado. Una transcripción mala no produce nota fonética |
| 13 | Salir/recargar a mitad de preparación; alternar francés e inglés | Checkpoint y modo del idioma restaurados, progreso de aventuras independiente; el paso guardado no implica dominio |
| 14 | Abrir Londres en perfil de prueba nuevo y escuchar pregunta/oferta | Modelo «Hello! Yes, please.» responde a «Do you need help?». Practicar ambas partes, comprender y responder; «Yes, please.» revisado también válido. No se rechaza por mayúsculas/puntuación trivial |
| 15 | Elegir Ya tengo bases o responder a mi ritmo; volver a guiado | Puede evitar todos los pasos; alternar no reinicia ni elimina recorrido. Francés conserva su preferencia separada |
| 16 | Abrir una partida inglesa v1/v2/v3 existente | Conserva versión, feedback e historial originales; aviso en saludo. Reiniciar solo si el usuario lo decide y confirma, preferiblemente en perfil de prueba para ver v4 |
| 17 | Recorrer café/Londres/rendez-vous y Roast Me con preferencias previas | Reanudación y continuidad LV-007A intactas. Sin guía nueva en rendez-vous/Roast; consentimiento adulto y revocación se conservan; Live no aparece |
| 18 | Probar320/390/1280 px, fuente ampliada, teclado/Tab/lector/movimiento reducido | Controles táctiles, foco y etiquetas claros, textos largos completos; respuesta/transcripción alcanzables con teclado. Reinicio discreto y confirmado |

Para validar el criterio educativo, pedir al principiante que intente la expresión **después de escuchar y practicar**, y que use el mismo saludo en otra situación. Registrar qué ayuda necesitó y qué entendió el navegador. No inferir mejora fonética, certificación o porcentaje de éxito de una única transcripción.

Verificador preparado: después de `npm.cmd test` y `npm.cmd run export:web`, ejecutar el comando Chrome de la tabla. `--beginner` recorre preparación/checkpoints por idioma con recargas, toma capturas en los tres anchos y luego ejecuta recorridos educativos. Usa perfil aislado; no simula audio físico ni autoriza consentimiento adulto. Sigue pendiente de ejecución efectiva fuera del fallo de arranque actual.

## Archivos

Nuevos: `tasks/LV-007-LEARN-01.md`, diseño y esta guía; `src/content/beginner.ts`, `src/content/london.v3.ts`; `src/domain/learning/support.ts`, `src/domain/voice/transcriptReview.ts`; `src/storage/learningSupportRepository.ts`; `src/features/learning/LearningSupportProvider.tsx`, `BeginnerPreparation.tsx`; `tests/beginner-learning.test.cjs`, `beginner-presentation.test.cjs`, `transcript-confirmation.test.cjs`.

Modificados: `app/_layout.tsx`; `src/content/london.ts`; `src/domain/learning/models.ts`, `validation.ts`; `src/domain/voice/browser.ts`, `choiceMatching.ts`, `playback.ts`, `recognition.ts`, `recognitionWeb.ts`; `src/features/learning/ExerciseView.tsx`, `MissionProvider.tsx`, `MissionScreen.tsx`; `src/features/voice/SpeechInput.tsx`, `systemSpeech.ts`, `VoiceControls.tsx`; `tsconfig.core.json`; `scripts/check-premium.mjs`; tres tests existentes de versión/conservación: `london.test.cjs`, `london-review.test.cjs`, `rendezvous.test.cjs`; documentos PRODUCT_VISION, ROADMAP, PROJECT_STATE, HANDOFF_TO_CODEX, SPEECH_RECOGNITION, LONDON_ADVENTURE y DESIGN_SYSTEM.

No cambian arte, tokens/paleta, contenido francés/rendez-vous/Roast, motor de evaluación ni esquema/claves de misión. Sin dependencias nuevas. `.backups`, `.test-build`, dist, perfiles y logs son artefactos locales.

## Pendientes

Validación manual con principiante y correcciones de hallazgos; QA real de voces/micrófono/teclado/nativo; evaluación docente externa de los apoyos. No extender automáticamente guía a todas las escenas sin contenido revisado. Recuperar ocho tests históricos solo con originales autorizados o escribir futuras regresiones identificadas como nuevas.

**LV-007B** conserva conversaciones dinámicas/reacciones naturales como próximo trabajo por especificar después de validar esto. **Roast Me Live** está registrado en PRODUCT_VISION/ROADMAP: extremo regional grosero, cómico, con voz/risas reales, variedad, consentimiento fuerte propio, revocación inmediata y enseñanza al final; primero por turnos, evaluar luego baja latencia. No implementado aquí; depende de reconocimiento fiable/revisable y QA con principiantes.
