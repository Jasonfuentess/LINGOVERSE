# RML-002 — Learning Modes, Natural Conversation & Comedy Overhaul

**Estado:** implementado y verificado técnicamente (03-nov-2026). **La mejora editorial del humor queda pendiente de aprobación del usuario sobre conversaciones reales**: las pruebas automatizadas no la aprueban.

## 1. Interpretación de respuestas

**Orden de evaluación** (`src/domain/learning/interpretation.ts`):
1. Listas exactas revisadas (LV-007B).
2. Error revisado dentro de una frase más larga (`errorPatterns`).
3. Reglas de comprensión (`understanding`).
4. Si nada aplica: `unrecognized`.

| Situación | Resultado | Qué pasa |
| --- | --- | --- |
| Respuesta exacta o regla `target` | `valid` | Sigue la historia y cuenta como la forma practicada. |
| Coherente, pero no es la forma practicada («Oui», «Non, merci», «Je veux un café») | `understood` | Sigue la historia, se enseña la forma practicada y **no** se acredita como dominio. |
| Ambigua («two», «métro» a secas) | `ambiguous` | El personaje repregunta dentro de la escena. |
| Error revisado («je suis une table pour deux») | `incorrect` | Mismo diagnóstico que el error exacto. Es el único caso que permite roast. |
| No interpretable con suficiente confianza | `unrecognized` | Aclaración sin burla y sin error inventado. |

**Garantías** (`src/domain/learning/understanding.ts`):
- Se comparan palabras completas, sin tildes ni mayúsculas.
- Solo se interpreta una respuesta si **todas** sus palabras pertenecen al vocabulario revisado del turno. Si aparece una palabra desconocida, se pide aclaración.
- La negación se controla con grupos `none`: «non, merci» nunca puede cumplir una regla afirmativa.
- Si dos reglas con significados distintos coinciden («un café et un thé»), no se adivina.
- **Privacidad y reproducción:** el texto libre no se guarda. Se guarda la forma canónica de la regla, y la validación comprueba que cada forma canónica vuelve a su misma regla, de modo que el historial se reproduce de forma idéntica.
- **Alcance:** solo las lecciones Live usan estas reglas. Las aventuras no cambian.
- **Datos que se conservan:** número de personas, mesa o barra, bebida, noches (de 1 a una semana), destino dicho antes de que se pregunte (el metro no vuelve a preguntarlo), estado de ánimo, reserva.

## 2. Modalidades y canal

- **Con ayuda:** antes de responder se muestra:
  - qué dijo el personaje y qué significa;
  - el objetivo y la frase para practicar, con audio y Pronunciation Coach;
  - el vocabulario.
  - La respuesta se registra como `assisted`.
- **Con libertad:** no se muestra el modelo. Tras una respuesta no interpretable tampoco aparece en la corrección; queda en «¿Qué digo? Ver ayuda». Usar la ayuda o las pistas registra la respuesta como `assisted`.
- **Hablando:** micrófono → transcripción editable → envío explícito. El evento guarda `channel: 'spoken'`.
- **Escribiendo:** campo de texto y pistas de vocabulario y ortografía. El evento guarda `channel: 'written'`, que no cuenta como práctica oral.
- El teclado sigue disponible en ambos modos («Prefiero escribir esta vez»).
- El resumen final separa:
  - forma practicada / entendida de otra forma / con ayuda;
  - respuestas habladas / escritas.
  - Aclara que el dictado no evalúa pronunciación.

## 3. Reinicio y navegación

- **«↺ Reiniciar práctica»** está en la barra superior, sin necesidad de desplazarse. Pide confirmación y avisa si se borran mensajes.
  - **Reiniciar esta escena:** misma escena, primer turno, nueva ejecución. Los mensajes se borran.
  - **Reiniciar y elegir modalidad:** vuelve a la selección. Al empezar se usa la escena limpia, nunca la conversación anterior.
  - **Se conservan:** entrenador, idioma, modalidad, consentimiento e intensidad, voces y aventuras.
- **Inicio:** queda un solo acceso, Roast Me Live. Roast Me clásico (consentimiento y modo aventura) sigue disponible en Explorar y desde «Activar humor adulto» en Live. No se borró ningún dato.

## 4. Humor

**Catálogo** (`src/content/liveHumor.ts`):
- Reescrito con 448 líneas, 112 por entrenador.
- Para cada error revisado hay:
  - nivel 0: chiste limpio;
  - nivel 1: picante;
  - nivel 2: sin pena;
  - nivel 3: sin misericordia, con lenguaje fuerte claramente distinguible.
- **Tipos nuevos o ampliados:** situacional (sin error, ligado a la escena), callbacks a datos y doble sentido en cinco escenas, con albures contextuales de Toño.
- **Identidad de cada entrenador:**
  - **Luz:** ritmo corrido sin pausas, voseo, referencias salvadoreñas (pupusas, Masferrer, La Libertad, Soyapango), «guasa» y «casaca».
  - **Toño:** carrilla y referencias mexicanas (mole, tianguis, Periférico).
  - **Vale:** paisa con «usted», tinto, boleta y dar papaya.
  - **Romi:** ironía seca rioplatense.

**Reglas que valida el sistema:**
- Ningún contenido adulto en el nivel 0.
- Ninguna mención del micrófono fuera de una respuesta hablada.
- Sin comparaciones genéricas del tipo «más perdido que».
- Sin risas escritas en el texto que se lee en voz alta.
- Las bromas situacionales necesitan escena o dato.

**Cuándo hay humor** (`decideKind`):
- Si la respuesta es correcta, puede haber humor, pero racionado: nunca después de dos bromas seguidas, y menos probable justo después de una.
- Se mantienen las aclaraciones sin burla y el roast solo ante un error real.
- La intensidad elegida se nota: roast, celebración, doble sentido y bromas situacionales prefieren el nivel permitido más alto.

## 5. Pruebas

**`tests/roast-live-modes.test.cjs` (22):** cubren los 24 casos obligatorios.
- Los casos 12+13, 14+15 y 20+21 van agrupados de a dos.
- El caso 24 (móvil) se prueba con la pantalla compacta en el harness y con 320/390 px en Chrome.

**`tests/roast-live.test.cjs`:** se actualizaron 3 pruebas por cambios pedidos.
1. «Nunca dos bromas seguidas» pasa a «nunca tres, y en respuestas correctas predomina lo normal».
2. Los identificadores de línea pasan a `live-v2`.
3. La pantalla ahora pide elegir modalidad.
- El harness de pantalla pasó a `tests/live-screen-harness.cjs`.

**Mutaciones detectadas (6/6):**
- ignorar la negación;
- aceptar palabras desconocidas;
- líneas de micrófono tras escribir;
- humor en todas las respuestas correctas;
- revelar el modelo en modo libre;
- contenido adulto sin consentimiento.

**`scripts/check-live.mjs` en Chrome real:**
- Las tres escenas francesas.
- Inicio con un solo acceso; modo libre sin modelo; respuesta escrita desconocida sin culpar al micrófono.
- Corrección limpia; consentimiento y «Sin misericordia» con roast fuerte sobre el error real.
- Respuesta natural con memoria; ayuda a pedido.
- Reinicio con confirmación que conserva el consentimiento; revocación; recarga sin texto libre.
- Sin desbordamiento a 320, 390 y 1280 px.

## 6. Limitaciones reales

- Sigue siendo **comprensión dentro de escenas revisadas**: frases con vocabulario fuera del turno piden aclaración honesta. No es una conversación ilimitada.
- Una sesión guardada de RML-001 (contenido v1) no se puede reanudar: la pantalla lo avisa y se empieza una nueva. Las aventuras no se ven afectadas.
- El humor y los albures fueron escritos por IA. Necesitan revisión de hablantes nativos de El Salvador, México, Colombia (Medellín) y Argentina.
- **Sin cambios de voz:**
  - la risa sigue siendo solo visual;
  - el acento depende del dispositivo.
- **Sin probar:** las escenas en inglés en Chrome (solo con pruebas unitarias), el micrófono físico, Android, iOS y Safari.

## 7. QA manual

Ejecutá `npm.cmd run web` y abrí http://localhost:8081.

1. **Con ayuda:** elegí Con ayuda + Hablando.
   - Antes de responder, ¿entendés qué te dijeron, qué significa, qué frase practicar y cómo suena?
   - Respondé con el micrófono, editá y enviá.
2. **Con libertad:** reiniciá eligiendo Con libertad.
   - Respondé con variantes: «Oui», «Oui, merci», «Une table pour deux, s'il vous plaît», «Non, merci».
   - ¿La escena sigue con sentido? ¿Recuerda «pour deux» o «au comptoir»?
   - En inglés probá «I have no reservation», «for 3 nights», «a week».
3. **Reinicio:** durante una conversación pulsá «Reiniciar práctica».
   - ¿Pide confirmación? ¿Vuelve al primer turno sin los mensajes?
   - ¿Se conservan el entrenador y el consentimiento?
   - Probá también «Reiniciar y elegir modalidad».
4. **Inicio:** ¿hay un solo acceso claro a Roast Me Live?
5. **Roast fuerte:** con consentimiento y «Sin misericordia», cometé errores reales («Je voudrais un canard», «je suis une table pour deux», «For go, please»).
   - ¿Es fuerte, contextual y gracioso? ¿Llega la enseñanza?
   - Escribí algo sin sentido: debe pedir aclaración sin insultar y sin hablar del micrófono.
6. **Doble sentido:** activalo y pedí una baguette, un café con leche, «avec ceci ?» o la llave del hotel.
   - ¿Los albures de Toño tienen juego verbal? ¿Desaparecen al desactivarlo?
7. **Entrenadores:** repetí el mismo error con Luz, Toño, Vale y Romi.
   - ¿Suenan a personas distintas y naturales de su región?
   - ¿Luz evita empezar todo con «maje»?
8. **Voz y escritura:** completá una escena dictando y otra escribiendo.
   - ¿El resumen separa las respuestas habladas de las escritas?
   - ¿Aclara que no se evalúa la pronunciación?
