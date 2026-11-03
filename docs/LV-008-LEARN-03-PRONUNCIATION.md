# LV-008-LEARN-03 — Pronunciation Coach

**Estado:** implementado y verificado automáticamente y en Chrome real headless (02-nov-2026). **Pendiente:** escucha humana del audio normal, lento y por fragmentos; revisión docente humana de las 35 guías; Android/iOS/Safari.

## 1. Diagnóstico inicial

| Módulo | Existía | Faltaba |
| --- | --- | --- |
| `content/pronunciation.ts` | 11 guías con aproximación, IPA, notas y fuentes | Identificador estable, locale, propósito, significado por segmento, consejos tipados y reutilizables, metadatos de revisión, relación con ejercicios |
| `content/rescue.ts` | Plan de rescate por turno, con modelo aceptado | Solo 1 de los 13 turnos de respuesta escrita de las tres aventuras tenía guía para su modelo preferido |
| `LearningRescue.tsx` | Panel «Escuchá · Comprendé · Prepará», construir, práctica oral sin envío | La guía mostraba todas las notas a la vez; segmentos sin significado; los grupos de escucha estaban duplicados en dos lugares |
| `StudyAudio` / `SpeechButton` / `VoiceController` | Una sola cola de voz, cancelación, silenciamiento, velocidad 0.5–1.2, rechazo de voces de otro idioma | Nada: se reutilizan sin cambios de comportamiento |
| `BeginnerPreparation.tsx` | Preparación por fases (LEARN-01) | Sin uso en las pantallas de misión actuales; no se tocó |

No se creó un segundo motor de voz ni un segundo sistema de preparación. El Coach vive dentro del rescate existente.

## 2. Arquitectura

- **Datos:** `src/content/pronunciation.ts`. `PronunciationGuide` incluye `id`, `language`, `locale`, `original`, `translation`, `purpose`, `approximate`, `ipa`, `units[]` (texto, significado y aproximación opcional), `tips[]` (`SoundTip` de un catálogo tipado), `focus[]`, `caveat?`, `review`, `sources`, `usedIn` (`lessonId/exerciseId`). `segments` y `notes` se **derivan** para los consumidores anteriores.
- **Audio:** se usa TTS del dispositivo, siempre con `original` o el texto de una unidad en `locale`. No hay archivos grabados. Las aproximaciones nunca se sintetizan.
- **Búsqueda:** `pronunciationFor` (expresión exacta, normalizada); `containsPhrase` y `guidesWithin` (fragmentos por palabras completas, para mostrar «Otra expresión útil»).
- **UI:** `src/features/learning/PronunciationCoach.tsx`, reutilizable. No recibe ninguna función de respuesta, así que no puede enviar, calificar ni grabar.
- **Persistencia:** ninguna nueva. El Coach no escribe en el progreso, el historial ni las preferencias. Las partidas guardadas antes de esta etapa reciben las guías al recargar, sin migración. No cambian contenido, versiones de misión, respuestas aceptadas ni el motor de evaluación.

## 3. Comportamiento por modo

| Modo | Antes de equivocarse | «¿Cómo se pronuncia?» |
| --- | --- | --- |
| Desde cero | Panel abierto: modelo, significado, propósito, aproximación y audio | Disponible sin error previo; abre las partes y los sonidos |
| A1 | Solo «Aprender cómo responder»; no revela el modelo | La aproximación aparece únicamente al pedirla |
| Autónomo | Igual que A1 | Igual; consultarlo marca el objetivo como «con ayuda», nunca como error |

Cambiar de modo vuelve a montar solo la ayuda. El borrador escrito y el progreso se conservan (probado en unidad y en Chrome).

## 4. Convenciones de la guía aproximada

- **Tildes:** marcan la sílaba fuerte cuando la lectura española la pondría en otro lugar. En francés coinciden con la fuerza al final del grupo. Ejemplo: «isí»; sin tilde, un hispanohablante diría «ÍSI».
- **Francés:** ã õ ẽ son vocales nasales (sin n), zh = /ʒ/, sh = /ʃ/, ü = /y/.
- **Inglés:** j = h suave (solo aire). th = /θ/. Para /ð/ se escribe «d», con un consejo que la compara con la d de «nada». ii = /iː/. (r) = r que muchas voces británicas casi no pronuncian.
- Las aproximaciones evitan depender de un acento español concreto. Por ejemplo, se escribe «th» y no «z», porque la z solo suena /θ/ en España.

## 5. Revisión editorial

**Método:** revisión asistida por IA (Claude) contra transcripciones IPA estándar. Las URLs de `sources` son referencias para la revisión docente; en esta sesión no se abrieron una por una. Todas las guías llevan `review.status = 'ai-editorial'` con esa nota. **No equivale a revisión docente humana.**

### Guías existentes revisadas (11)

| Guía | Cambio | Motivo |
| --- | --- | --- |
| Hello! · Hello! Yes, please. · I'm new here. · I need help, please. · Can you help me, please? | `h` → `j` («jelóu», «jelp», «jíe(r)») | Un hispanohablante lee la `h` como muda: la guía enseñaba «elóu». |
| Oui, j'attends une amie. | «ün amí» → «ü namí»; se añade que la d de attends es muda | La escritura anterior separaba un encadenamiento obligatorio /y.n‿a.mi/. |
| S'il vous plaît | Se añaden la t muda de plaît y la v francesa | Omisiones. La aproximación «sil vu plé» se conserva. |
| Où est la fontaine ? | Se añade que la s y la t de est son mudas | Omisión. |
| Oui, j'ai rendez-vous ici. | Se añade que la z y la s de rendez-vous son mudas | La aproximación «ui, zhé rãdevú isí» se confirmó correcta y se conserva. |
| Bonjour !, Yes, please. | Sin cambios de aproximación | Correctas. |

### Guías nuevas (24)

Cubren el **modelo preferido de todos los turnos de respuesta escrita** de las tres aventuras, además de los saludos iniciales y los pedidos de la cafetería.

- **Francés (15):** Bonsoir ! · Je voudrais un café, s’il vous plaît. · Un café, s’il vous plaît. · Je prends un café, s’il vous plaît. · Sur place, s’il vous plaît. · Oui, s’il vous plaît. · C'est combien ? · Merci. · Au revoir. · Où est la fontaine, s’il vous plaît ? · Où est le kiosque, s’il vous plaît ? · Je vais tout droit ? · Je tourne à droite ? · Je tourne à gauche ? · Oui, ça va, merci !
- **Inglés (9):** I need help. · Where is the Blue Door Hostel? · Where is the Lantern Theatre? · Is it near? · Is it near the bridge? · Is this the bus to the hostel? · Which way is the theatre? · Thank you! · Goodbye!

**Puntos lingüísticos destacados:**
- droite /dʁwat/ frente a droit /dʁwa/: la t final distingue «derecha» de «recto».
- Encadenamiento en «tourne à».
- Dos nasales distintas en «combien».
- th con voz frente a th sin voz en «the Lantern Theatre».
- Duración vocálica en need/please (sheep/ship).
- **Un** se presenta como ẽ, indicando que también existe /œ̃/.

### Sin guía por decisión editorial

Los turnos de **opción múltiple** que no son saludos ni pedidos no tienen guía de frase completa: números con enlace, rutas e indicaciones. Ejemplos: «Trois euros.», «Le panneau bleu, puis à gauche.». El Coach muestra entonces el audio original, indica honestamente que no hay guía revisada y, si existe, ofrece la guía de un fragmento («Otra expresión útil»). Ampliarlos queda para una revisión docente.

## 6. Audio lento

`SLOW_RATE = 0.65` se pasa al `VoiceController` existente (rango aceptado 0.5–1.2). La prueba verifica que llega al driver. **No se ha verificado de oído que la diferencia sea perceptible** con cada voz. Por eso la vía principal es la escucha por partes: cada unidad tiene un botón normal y uno lento.

## 7. Accesibilidad

- Todos los controles tienen etiquetas descriptivas: «Escuchar «j'ai rendez-vous» más despacio», «¿Cómo se pronuncia …?» con estado `expanded`, «Volver a la conversación».
- Los controles son de texto, sin depender de iconos, y tienen altura mínima de 44 px.
- Los encabezados tienen rol `header`.
- Sin voz compatible, los botones quedan deshabilitados con un mensaje; no se sustituye nunca por otro idioma.
- Sin animaciones nuevas.
- Sin desbordamiento horizontal a 320 y 390 px (Chrome real). Al encontrarse un desbordamiento a 320 px en los botones lentos, se corrigió.
- Texto ampliado y lector de pantalla: **pendientes de prueba manual**.

## 8. Pruebas

`tests/pronunciation-coach.test.cjs` (11 casos):
- integridad del catálogo;
- asociación correcta con ejercicios e idioma;
- cobertura de turnos escritos y saludos;
- aproximaciones nunca aceptadas como respuesta ni elección hablada;
- búsqueda por palabras completas;
- Coach en Desde cero (audio en el locale correcto, normal y lento, nunca la aproximación);
- A1 y Autónomo bajo demanda, inglés sin sustituto de voz, frase sin guía;
- `VoiceController` (velocidad, cancelación, callbacks obsoletos, silencio);
- exploración exhaustiva de controles sin envío en los tres modos;
- conservación del borrador al abrir/cerrar y al cambiar de modo;
- persistencia sin datos del Coach.

Se probaron dos mutaciones (revelar en A1 y rellenar el borrador desde un botón de práctica): ambas las detectan las pruebas. `scripts/check-premium.mjs --rescue` abre el Coach en Chrome real, comprueba que el borrador y el progreso guardado no cambian y captura 320/390/1280.

## 9. QA manual pendiente (Chrome de escritorio)

`npm.cmd run web` → http://localhost:8081. Activá el audio en la barra superior.

1. **Francés desde cero:** Perfil → Francés. Explorar → «Comenzar el encuentro». Respondé el saludo. En «¿Tenés una cita…?» comprobá el modelo, el significado, «Sirve para» y «ui, zhé rãdevú isí» **antes** de responder.
2. Pulsá «¿Cómo se pronuncia?». Escuchá cada parte normal y lenta. ¿Las partes suenan en francés? ¿La versión lenta se nota más despacio? Anotá la voz usada.
3. Leé los sonidos difíciles. ¿Son comprensibles y breves?
4. Escribí parte de la respuesta, abrí y cerrá «¿Cómo se pronuncia?». El texto debe seguir ahí y nada debe enviarse.
5. «Practicar hablando sin enviar» con micrófono: decí la frase mal a propósito. No debe aparecer ninguna nota de pronunciación ni error de la aventura.
6. **Inglés desde cero:** Lost in London. En «Where is…?» escuchá «the Lantern Theatre» por partes. ¿Voz inglesa? ¿Se distinguen las dos th?
7. **A1:** cambiá el modo a Principiante/A1. El modelo y la guía no deben aparecer hasta pedir ayuda. Respondé primero sin ayuda.
8. **Autónomo:** confirmá que no aparece ayuda no pedida y que «Aprender cómo responder» sigue disponible.
9. Cafetería: en «C'est combien ?» comprobá la guía «se kõbiẽ» y escuchá «combien ?» lento.
10. Teléfono o ventana de 320–390 px: ningún control oculto ni cortado.

## 10. Limitaciones

- Revisión editorial por IA; falta revisión docente humana y escucha real.
- La velocidad lenta depende de la voz del dispositivo.
- Las voces inglesas pueden ser estadounidenses aunque la guía sea británica (se avisa en cada guía inglesa).
- Turnos de opción múltiple sin guía completa (sección 5).
- No hay evaluación fonética: el reconocimiento de voz no se modificó.
