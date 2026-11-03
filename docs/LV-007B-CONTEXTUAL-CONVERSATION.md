# LV-007B — Contextual Conversation Engine

**Estado:** implementado; pruebas automatizadas y recorridos en Chrome real headless aprobados (02-nov-2026). **Pendiente:** QA manual del usuario, incluidos audio y micrófono.

No es un chatbot. Es un intérprete **local y determinista** de frases editoriales revisadas. Todo lo que queda fuera de las intenciones cubiertas se declara «no reconocido», sin inventar una falta.

## 1. Qué existía y qué faltaba

| Existía (se conserva) | Limitación real |
| --- | --- |
| Motor reconstruido desde eventos y validado por repetición (`restoreProgress`) | Una respuesta escrita solo tenía un `next` y una `reply`, sin consecuencias por intención |
| Ramas reales por decisión (Nora/Ben, árboles/flores…) | Ninguna memoria de hechos: «Votre boisson est prête» aunque pediste té para llevar |
| Equivalencias exactas, reglas de error conocidas y estado «no verificable» | Sin categorías para error menor válido, respuesta ambigua o respuesta fuera de contexto |
| Puente de continuidad LV-007A (último intercambio) | Se volvía a preguntar lo que el estudiante ya había dicho (destino en Londres) y Juliette/Margot daban la respuesta antes de preguntarla |

## 2. Arquitectura

Todo es opcional, gracias a `conversation: 'contextual-v1'` por ejercicio. El contenido archivado se evalúa **exactamente** igual que antes.

- **`domain/learning/models.ts`**: nuevos contratos `TextIntent`, `MinorForm`, `Clarification`, `OffContext`, `ContextualPrompt`, `asks`, `facts` y `acceptedFacts`. `Evaluation` incorpora `outcome` (`valid`, `valid-minor`, `ambiguous`, `incorrect`, `unrecognized`, `off-context`), `facts`, `factStatus`, `completes` y `minorIssue`.
- **`domain/learning/interpretation.ts`**: comparación exacta tras normalizar puntuación, mayúsculas y apóstrofos, en este orden: intención, aceptada, error menor, aclaración, fuera de contexto, error conocido, no reconocida. Las respuestas ambiguas y fuera de contexto llevan `writtenIssue: 'unknown'`, así que no son errores confirmados, no activan Roast y la transcripción de voz las marca como «incierta».
- **`domain/learning/engine.ts`**: usa el intérprete solo en ejercicios contextuales. Guarda únicamente frases editoriales; el texto libre se guarda vacío. `continueMission` suma los objetivos `completes`, es decir, los demostrados por adelantado.
- **`domain/learning/validation.ts`**: valida los contratos, que cada entrada tenga una sola interpretación y que los ejemplos de intención estén en `accepted`. Recorre todas las rutas, incluidas las abiertas por intenciones, para comprobar que cumplen todos los objetivos en orden y que **ningún turno con `asks` pregunte un hecho ya confirmado**. Contenido incoherente no carga.
- **`domain/conversation/memory.ts`**: memoria derivada de los eventos validados, sin persistencia nueva. Un hecho confirmado nunca vuelve a «ambiguo». El prompt contextual usa la memoria al inicio del turno, así que no cambia a mitad del turno.
- **Presentación e interfaz:**
  - El historial muestra la pregunta tal como se dijo.
  - Una respuesta con error menor aparece con su forma mejorada.
  - El feedback usa títulos humanos («¡Se entendió!», «Necesita una aclaración», «No encaja en este momento») y «Una forma más precisa».
  - Sin paneles técnicos ni etiquetas de intención.

## 3. Contenido y versiones

Las versiones anteriores se archivan con datos idénticos (comprobado por comparación JSON) y siguen siendo reanudables. Solo las partidas nuevas usan la versión contextual.

| Aventura | Nueva | Archivadas |
| --- | --- | --- |
| Lost in London | v5 | v1–v4 (`london.v4.ts` nuevo archivo) |
| Un café en París | v3 | v1, v2 |
| Un rendez-vous à Paris | v2 | v1 (`rendezvous.v1.ts` nuevo archivo) |

Roast Me queda **fijado a café v2**, sin cambios de contenido.

## 4. Escenarios implementados

**Lost in London**
- «What do you need?» → «I'm looking for the hostel.», «Could you help me find the theatre?», «Where is the hostel?»… Maya u Ollie reaccionan al destino, **saltan «Where do you need to go?»** y el objetivo «ask-where» queda demostrado.
- Errores menores que no impiden entender («I looking for the hostel.», «hostal», «I need go to…», «Where is hostel?») permiten continuar, con la forma precisa.
- «The hostel.» a secas abre una aclaración en la historia. Si luego se llega a «where», Maya dice «You said the hostel, right? Ask me where it is.».
- Fuera de contexto: «I'm looking for the station.» (ya estás en King's Cross), el destino de la otra historia, despedirse en mitad de la ayuda.
- La ruta elegida (caminar/autobús, río/mercado) queda en memoria. Ya cambiaba personaje e indicaciones.
- «I'm visiting London.» → «Welcome to London! I'm Maya.».
- Errores menores frecuentes: «Tank you!», «Good bye!», «Im new here.».

**Un café en París**
- Memoria de bebida, lugar y azúcar en los 6 perfiles: «Votre thé à emporter est prêt.», «Voilà votre café, sans sucre.».
- «Merci, bonne journée.» agradece y se despide a la vez; la escena se cierra («Merci, à vous aussi ! Au revoir !») y se cumplen ambos objetivos.
- «Ça coûte combien ?» se acepta.
- Errores menores: «Cest combien ?», «coute», «Ca», «Combien ?», «Mersi.», «Aurevoir.».
- Fuera de contexto: agradecer o despedirse antes de pagar o de recibir la bebida.

**Un rendez-vous à Paris**
- Se corrige la incoherencia de v1: el contacto ya no dice dónde espera tu amistad para luego preguntarlo. Ahora pregunta «Votre amie vous attend où ? Rappelez-vous son message.».
- «J'ai rendez-vous à la fontaine.» confirma el lugar, salta la pregunta del lugar y el contacto no repite «Je connais bien cet endroit».
- «Oui, j'attends une amie.» → «Vous attendez une amie ? Très bien…».
- «La fontaine.» → «La fontaine ? Vous avez rendez-vous là-bas ?». Después: «Vous avez parlé de la fontaine… où, exactement ?».
- Errores menores: «je ai», «jai», «rendevous», «Ou est…» (acento), «ca va» (cedilla).
- Error real que cambia el significado: «Je vais tout droite ?» (droite = derecha).

## 5. Pruebas

- **`tests/contextual-conversation.test.cjs` (11 casos):** intenciones y salto sin repregunta; rechazo de significados distintos, palabras clave y texto libre; ambigüedad y confirmación; memoria que no se degrada; errores menores frente a errores confirmados; Roast; memoria del café en 6 perfiles × 8 combinaciones; consecuencias; recorrido exhaustivo de **736 conversaciones completas** (Londres 192, Café 480, Rendez-vous 64) sin repreguntas, con todos los objetivos y repetición idéntica; el validador rechaza contenido que repregunta o es ambiguo; persistencia, reanudación y reinicio; compatibilidad de partidas v4/v2/v1; transcripción de voz; rescate y Pronunciation Coach en todos los turnos; variedad distinta y versionada; evidencia de ayuda e independencia.
- **Mutaciones comprobadas:** contar «fuera de contexto» como error y degradar hechos confirmados. Las pruebas detectan ambas.
- **Pruebas anteriores actualizadas** (sin debilitarlas): 9 expectativas de versión fijadas (4→5, 2→3, 1→2, `:v2:`→`:v3:`), cada una con la comprobación añadida de que la versión anterior sigue archivada. `conversational.test` ahora compara con la pregunta contextual mostrada y `roast.test` con café v2, al que Roast queda fijado.
- **Chrome real:** `scripts/check-conversation.mjs --browser <chrome>` (aclaración en la historia, borrador conservado, destino recordado, reanudación tras recargar, memoria del café, error menor en francés) y `check-premium.mjs` en sus tres modos.

## 6. QA manual (Chrome)

`npm.cmd run web` → http://localhost:8081. Si tenés una partida a medias, terminala primero: las partidas guardadas siguen en su versión anterior. Las funciones nuevas aparecen al empezar o reiniciar una aventura.

1. **Londres:** inglés, «Comenzar Lost in London». En «What do you need?» escribí `The hostel.` (o `The theatre.`). Maya u Ollie deben preguntarte dentro de la historia, y tu texto debe seguir en el campo.
2. Escribí `I'm looking for the hostel.`. El personaje menciona el destino y el turno siguiente es elegir camino, **sin** «Where do you need to go?».
3. Recargá la página: debés seguir en la elección de camino.
4. Reiniciá y en «What do you need?» respondé `I need help.`. Ahora sí debe aparecer «Where do you need to go?».
5. Probá `I looking for the hostel.`: debe aparecer «¡Se entendió!» con la forma más precisa, y la historia continúa.
6. Probá `I'm looking for the station.`: debe aparecer «No encaja en este momento», sin avanzar.
7. **Café:** elegí té y para llevar. El precio debe empezar con «Votre thé à emporter est prêt.». Al recibirlo, el texto debe mencionar el azúcar elegido. Respondé `Merci, bonne journée.`: la aventura termina con la respuesta de la camarera.
8. **Rendez-vous:** en «Vous avez rendez-vous ici ?» respondé `J'ai rendez-vous à la fontaine.` (o `au kiosque.`). No te deben preguntar qué lugar buscás.
9. Reiniciá y respondé `La fontaine.`: aclaración en francés. Luego `Oui, j'ai rendez-vous.`: la pregunta siguiente reconoce que mencionaste la fuente.
10. **Micrófono:** decí «I'm looking for the hostel» en el turno de ayuda. La transcripción editable se trata igual que el texto, y nada se envía solo.
11. Comprobá que el Pronunciation Coach, el modo Desde cero / A1 / Autónomo y Roast (con consentimiento) siguen igual.

## 7. Limitaciones

- La comprensión cubre **solo frases editoriales revisadas**. Otras formulaciones válidas quedan «no reconocidas», con mensaje honesto. No hay comprensión semántica general.
- Las partidas guardadas en versiones anteriores no reciben las funciones nuevas hasta reiniciar. Es una decisión deliberada para no reescribir progreso.
- Tras una aclaración, responder solo «Yes, please.» no confirma el hecho. El turno siguiente lo reconoce como mencionado y pide confirmarlo.
- Las reacciones de humor de «progreso» se disparan en los momentos 3 y 6. Si un salto de turno pasa de 2 a 4 objetivos, la reacción del momento 3 no aparece. No afecta al aprendizaje.
- Roast Me independiente no recibe la memoria contextual (sigue en café v2).
- Los textos franceses e ingleses nuevos tienen revisión editorial por IA; falta revisión docente humana.
- Audio, micrófono físico y Android/iOS/Safari quedan pendientes de QA manual.
