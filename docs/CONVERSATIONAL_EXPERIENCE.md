# LV-005A — Conversational Adventure Experience

## LV-005A-UI-01 — actualización inmersiva (2026-10-30)

Diseño aprobado por delegación: escena panorámica compacta con arte original local,
seis retratos NPC y cuatro entrenadores. `components/AdventureArt.tsx` separa atlas,
escenario y entrada por opacidad (160 ms, sin bloquear interacción, omitida con
movimiento reducido). Los tres JPEG suman 529126 bytes; procedencia y prompts en
`assets/adventure/README.md`. No hay dependencias nuevas ni recursos remotos.

`Conversation` integra retrato y voz escrita; `ExerciseView` presenta respuestas
táctiles de una línea cuando caben, sin subtítulos repetitivos. La ayuda ofrece
primero intención (instrucción existente), después traducción y enseñanza completa
por petición explícita. Antes del primer intento no se revela automáticamente la
traducción; tras intentarlo permanece la explicación completa. No cambia evaluación,
equivalencias, dificultad ni contenido versionado. Selección/texto tras un error se
restauran desde la respuesta guardada; el siguiente nodo inicia un borrador nuevo.

Historial debajo del turno actual para no desplazar la respuesta; sigue siendo
revisable, derivado y sin turnos futuros. `ChapterReview` muestra tres expresiones
verificadas de pedido/precio/despedida y los ocho objetivos practicados. Usa la rama
y el equivalente escrito del recorrido; no atribuye dominio CEFR. Volver a Explorar
y reinicio confirmado siguen disponibles. Sin nuevos datos persistidos.

QA: 102/102 pruebas, ambos typechecks, lint y export web aprobados. La nueva prueba
de ocultamiento falló antes del cambio (100/101) y pasó después. Otra comprueba
repaso de la rama real y equivalente escrito. Chrome 156 recorrió selección,
escritura, pistas graduales, error/recarga/reintento, historial sin duplicados,
finalización/reanudación/reinicio. Sin overflow en 320/390/1280; foco y botón
accesibles en viewport 320×420. Roast independiente y estilo de aventura pasaron
consentimiento, snapshot y revocación con progreso conservado. Sin errores runtime.

Comparativas locales: `.web-check/ui01-before/conversation-{320,390,1280}.png` y
`.web-check/conversation-{320,390,1280}.png`; las variantes se seleccionan por el
motor, por lo que la comparación es de composición, no del mismo personaje.
También `conversation-retry.png`, `conversation-completed.png`,
`conversation-keyboard-viewport.png` y capturas Roast. Son capturas del viewport,
no una exportación de todo el scroll. Logs `lv005a-ui01-*.log`, ignorados por Git.

Chrome falló GPU/CDP dentro del sandbox; funcionó en ejecución autorizada fuera.
Revisión independiente detectó y corrigió pérdida de gap en Roast al envolver el
ejercicio. Lint detectó acceso a ref durante render: el valor Animated ahora se
inicializa de forma estable mediante useState. Sin reglas desactivadas.

Android: ADB no inició dentro del sandbox; fuera respondió con lista vacía de
dispositivos. No se ejecutó la app nativa. Pendientes teclado Android/iOS real,
Safari, TalkBack/VoiceOver, fuente ampliada y revisión docente/artística con humanos.
Viewport reducido no acredita teclado del sistema. Tampoco se afirma validación
de entusiasmo, retención o ganas de jugar otra misión sin pruebas con usuarios.

Las secciones siguientes documentan la entrega anterior LV-005A; sus referencias
a avatar de inicial, traducción automática y ausencia de animación son históricas.

## Experiencia implementada

Un café en París presenta una escena local de cafetería, identidad del interlocutor,
su intervención francesa y traducción, ayuda desplegable y respuesta del estudiante.
Al verificar un acierto, las opciones dejan lugar a la respuesta y a la réplica del
NPC. El entrenador integra resultado, enseñanza y humor antes de Continuar. Los
errores conservan corrección completa y reintento. No se adelanta el siguiente nodo.

La escena usa tinta, verde y coral de LingoVerse, arcos de ventana dibujados con
primitivas y avatar de inicial. Es un fallback gráfico original, no una ilustración
definitiva ni un personaje animado. No hay imágenes remotas ni recursos comerciales.
El estilo scrapbook del diario no se modifica.

«Revisar conversación anterior» recupera los turnos completados sin desplazamiento
automático. Se cierra al recargar, pero su contenido se reconstruye idéntico.
Se conservan café/té, local/para llevar, azúcar, seis variantes y ocho objetivos.
Los reintentos se resumen por cantidad y enseñanza: no se repiten respuestas
arbitrarias ni comentarios adultos históricos. Cada respuesta escrita correcta se
representa con su equivalente editorial aceptado, sin cambiar la evaluación.
La última reacción sigue siendo el snapshot guardado por Humor Engine.

## Arquitectura y compatibilidad

- Learning Engine continúa evaluando y avanzando. Su código y contenido francés
  versionado no cambian. El grafo existente es la única autoridad narrativa.
- `domain/conversation/presentation.ts` proyecta eventos validados usando el replay
  existente; produce turnos con IDs estables y hechos verificables. No persiste
  otra conversación, no sortea variantes ni produce historias nuevas.
- `Conversation.tsx` contiene escena, mensaje e historial. `ExerciseView` activa
  esa presentación en la aventura; Roast independiente mantiene su flujo.
- `CoachReaction.separateReply` muestra la réplica francesa como intervención del
  NPC, sin repetirla dentro del coach; explicación y corrección permanecen completas.
- Progreso/envelope permanecen compatibles, sin migrar ni borrar partidas.
- `AdventureFact` expone objetivo practicado, opción verificada y misión completada,
  con IDs de contenido/variante. Son hechos derivados, no un nuevo motor de progreso,
  eventos publicados ni evidencia de dominio. Diario y Pasaporte siguen pendientes.
- `Intervention.audio` y `VoiceCapabilities` son contratos de extensión únicamente.
  Ambas capacidades devuelven `unavailable`; no hay reproducción, micrófono,
  síntesis, reconocimiento, evaluación oral ni botones que los simulen.

## Roast opcional en la cafetería

La preferencia local opcional `adventureRoast` amplía ajustes v1 sin invalidar
registros antiguos; ausente equivale a desactivada. Solo se ofrece activar el estilo
con consentimiento adulto vigente, obtenido en el acceso existente a Roast Me.
Consentir Roast independiente o cambiar intensidad no activa el estilo de aventura.
El humor de aventura también respeta el interruptor general de comentarios.

El repositorio utiliza la biblioteca regional Roast y Variety Engine existentes,
comprueba consentimiento persistido al seleccionar y antes de guardar, y conserva
el snapshot al reanudar. Revocar oculta inmediatamente el comentario adulto y
restablece enseñanza segura sin bloquear el aprendizaje normal; reinicia el estilo
a desactivado. Un fallo de persistencia mantiene el ocultamiento en la sesión y
muestra error y reintento. No se promete revocación durable si falla guardar.

El cambio se aplica a próximas reacciones: no vuelve a sortear la actual. Las
referencias universales y validadores escritos específicos de Roast independiente
se conservan. No se amplía el catálogo ni se atribuyen diagnósticos nuevos a cafetería.

## Validación reproducible

Base: rama `feature/lv-005a-conversational-adventures`, commit `b657790`, árbol limpio;
94/94 pruebas, ambos typechecks y lint aprobados. `.web-check/**` ya estaba excluido
en ESLint; no fue necesario cambiar configuración ni desactivar reglas.
Git ignora `.web-check`, `.expo`, `dist`, `.test-build`, `.npm-cache` y logs;
no había artefactos de esas carpetas bajo seguimiento.

Resultado final: **100/100 pruebas**, ambos typechecks, lint y export:web aprobados.
Pruebas nuevas: replay de ambas versiones, seis variantes × ocho combinaciones de
ramas, orden y unicidad, ausencia de turnos futuros, recuperación, privacidad del
historial, equivalentes escritos, hechos educativos, consentimiento, opt-in separado,
cuatro regiones, fallback, escritor obsoleto y snapshot tras recarga. El render con
primitivas host no acredita layout nativo.

```text
npm test
npm run typecheck:core
npm run typecheck
npm run lint
npm run export:web
node scripts/check-web.mjs --browser "C:/Program Files/Google/Chrome/Application/chrome.exe"
node scripts/check-web.mjs --roast --browser "C:/Program Files/Google/Chrome/Application/chrome.exe"
```

Chrome 156 cargó la aplicación y pasó el recorrido completo, error/recuperación,
recargas, finalización y reinicio; historial sin duplicados al reabrir, sin overflow
a 320/390/1280 px y campo/botón visibles con foco a 320×420. Roast independiente
pasó Bon Jovi/Messi Goku, reanudación y revocación. La última ejecución también
activó el estilo Roast en cafetería, verificó su snapshot al recargar y revocó sin
perder progreso. Ambos recorridos terminaron con salida 0 y sin excepciones runtime.
El script usa perfiles temporales
aislados y sirve `dist`. Primer intento sandbox: fallo GPU/CDP antes de cargar;
reintento autorizado: aplicación cargada y comprobada.

Capturas locales ignoradas en `.web-check`: `conversation-320.png`,
`conversation-390.png`, `conversation-1280.png`, `conversation-keyboard-viewport.png`
y las de Roast. Se inspeccionaron capturas móviles, escritorio y viewport reducido.
Logs: `lv005a-tests.log`, `lv005a-export.log`, `lv005a-browser.log`,
`lv005a-roast-browser.log`. No se incorporan perfiles de navegador a Git.

## QA manual móvil pendiente

1. Ejecutar `npm run web`; abrir en Safari/iOS y Chrome Android a 320–390 px.
   Entrar a cafetería, desplegar ayuda, comprobar traducciones; elegir café o té,
   local o llevar y ambas respuestas de azúcar en recorridos distintos.
2. Fallar, reintentar y acertar. Revisar corrección íntegra, una sola enseñanza,
   coach antes de Continuar, réplica del NPC una vez y ningún turno futuro.
3. En precio/agradecimiento/despedida, abrir teclado real, escribir, rotar y comprobar
   campo y Comprobar accesibles. Revisar foco, scroll de feedback largo y teclado externo.
4. Recargar tras error, acierto y finalización. Abrir historial: cada turno una vez,
   misma variante/reacción y decisiones conservadas. Cancelar reinicio.
5. Probar cuatro entrenadores y humor apagado. Consentir Roast, activar su estilo en
   cafetería, recargar y revocar: ocultamiento adulto y progreso intacto. Revisar
   fallo de almacenamiento y ajustes cambiados desde otra pestaña.
6. Probar TalkBack/VoiceOver, zoom 200 %, fuente ampliada, paisaje y safe areas.
   Sin animaciones añadidas; reduced motion no requiere un flujo alternativo.

Viewport reducido no prueba teclado del sistema. Android emulator-5554 estaba
disponible: se intentó Expo Go con Metro 8087 y 8088/adb reverse. El primero mostró
«Something went wrong»/`UnexpectedServerError`; el reintento autorizado quedó en
carga antes de verificar la misión (`lv005a-android.png`). No se declara validado
teclado ni layout Android de LV-005A. Servidores y reverse temporales detenidos.
Safari/iOS, lectores, dispositivos físicos y revisión estética/cultural externa pendientes.
