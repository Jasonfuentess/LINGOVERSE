# LV-009-LEARN-04 — Lesson Practice & Pronunciation Coverage

**Estado:** implementado; pruebas automatizadas y Chrome real headless aprobados (02-nov-2026). **Pendiente:** escucha humana del audio normal y lento de las guías nuevas, micrófono físico y revisión docente.

## 1. Problemas encontrados

1. **Duplicación con origen confirmado** (`LearningRescue`): al abrir «Practicar, construir y ver vocabulario», el desglose volvía a renderizar `StudyAudio` para el único «segmento», que era la misma frase cuando no había guía. Así «Activar audio para practicar», «Escuchar el modelo», «Audio lento» y el aviso de voz aparecían dos veces. Además, el vocabulario (`exercise.teaching`) se mostraba allí y otra vez en «Necesito una pista → Ver traducción y expresiones».
2. **Más duplicaciones:**
   - La guía relacionada usaba otro `StudyAudio` completo, con un segundo aviso de voz.
   - En guías de una sola unidad (Bonjour, Trois euros), «Por partes» repetía el reproductor de la frase completa.
   - En A1, la instrucción aparecía arriba y otra vez en la pista.
3. **Cobertura:** en los turnos de selección faltaba la guía del modelo en 5/13 (Café), 6/7 (Londres) y 13/15 (Rendez-vous), incluidos los tres precios con enlace obligatorio (*trois‿euros*, *deux‿euros*, *un‿euro*). Las decisiones igualmente válidas (té, para llevar, sin azúcar, autobús, mercado, flores, libreros) no tenían ayuda.
4. **Opciones:** solo se podía escuchar el modelo. Las opciones no tenían audio individual ni significado.

Diferencias de función que se respetan:
- La **línea del personaje** ya se escucha en la burbuja del NPC.
- El **modelo** se muestra en el panel «Escuchá · Comprendé · Prepará», que en A1 y Autónomo está cerrado hasta que se pide.
- Las **opciones** se presentan en un panel neutral.

## 2. Solución

- **Datos:** 34 guías nuevas en el catálogo existente (`src/content/pronunciation.ts`), 69 en total. Se agregan tres consejos de sonido: `fr-liaison`, `fr-eu` y `en-v`. Cubren el modelo de **todos** los turnos de selección y al menos una frase de **cada decisión válida distinta**. Mismo contrato, sin generación automática y con revisión `ai-editorial`.
- **`ChoiceListening.tsx`** (nuevo), dentro de «Escuchar las opciones», en los turnos de selección de las aventuras:
  - Escucha cada opción en el idioma de la aventura (`SpeechButton`).
  - Si hay guía, «Significado y pronunciación» abre la traducción y un `PronunciationCoach` compacto (normal, lento, desglose y sonidos). Si no la hay, lo dice.
  - Es neutral: respeta el orden en pantalla y no marca la opción correcta, así que no revela nada en A1 ni en Autónomo.
  - No recibe ninguna función de respuesta: no selecciona ni envía.
  - Abrir un significado cuenta como ayuda (evidencia honesta); escuchar no.
- **`PronunciationCoach`:**
  - Nueva prop `compact` (por defecto en la guía relacionada) que usa solo los botones normal y lento, sin repetir los avisos de silencio y de voz.
  - En guías de una unidad, «Por partes» ya no repite el reproductor.
- **`LearningRescue`:** se elimina el bloque duplicado. El desplegable pasa a «Practicar y construir mi respuesta» (construir, práctica oral sin envío, otras respuestas válidas). El vocabulario queda solo en «Necesito una pista».
- **`ExerciseView`:** integra `ChoiceListening` y deja de repetir la instrucción en A1.
- **Sin cambios:** motores, evaluación, contenido de misiones, versiones, persistencia, voz, reconocimiento, Roast y LV-007B.

## 3. Cobertura antes → después (versiones actuales)

| Aventura | Modelo de cada turno de selección con guía | Decisiones válidas distintas con guía | Todas las opciones con guía |
| --- | --- | --- | --- |
| Café v3 | 8/13 → **13/13** | todas | 21/39 → **39/39** |
| Londres v5 | 1/7 → **7/7** | todas | 2/25 → **10/25** |
| Rendez-vous v2 | 2/15 → **15/15** | todas | 2/45 → **23/45** |

Las opciones restantes sin guía son de dos tipos:
- Variantes de redacción de una decisión que ya tiene una frase guiada («I want to walk, please.», «Je préfère les arbres.»).
- Opciones incorrectas cuyo contenido no hace falta enseñar como modelo («I do not need directions.», «La gare.»).

Todas se pueden escuchar, y el panel indica «Sin guía revisada».

## 4. Guías nuevas (revisión editorial por IA; pendiente revisión docente)

- **Francés:**
  - **Café:** thé ×3, «Oui, sur place», «À emporter», «Non, à emporter», «Avec du sucre», «Sans sucre, merci.», «Non, merci.».
  - **Precios con *liaison*:** «Trois euros.» → *truá zöró*, «Deux euros.» → *dö zöró*, «Un euro.» → *ẽ nöró*.
  - **Rendez-vous:** «La fontaine Médicis.», «Le kiosque vert.», «C’est près.», «Sous les arbres» (*sous/sur*), «Près des fleurs», «Près du pont», «Par les bouquinistes», «Tout droit, puis à gauche/droite» (contraste *droit/droite*), «Je passe le portail…», «Le panneau bleu…», «On regarde les dessins / les cartes postales ?», «On se promène ?».
- **Inglés:** «I'd like to walk, please.» (*l* muda), «Can I take the bus?», «I'd like to go by the river.», «Through the market, please.» (dos *th*), «Go straight, then left.» (sin «e» de apoyo), «Go to the bridge, then right.», «Bus number five.» (*v*), «Past the sign, then left.» (*g* muda).

## 5. Pruebas

- **`tests/lesson-practice.test.cjs` (7):**
  - Cobertura de modelos y decisiones, y precios con *liaison*.
  - Audio de opciones en el idioma correcto, significado, audio lento y opción sin guía.
  - Neutralidad sin revelación en los tres modos, con el orden de las opciones conservado.
  - Ningún envío ni cambio de selección.
  - Borrador conservado y cambio de modo.
  - Ausencia de duplicados con todas las ayudas abiertas: un solo reproductor del modelo, un aviso de voz y el vocabulario una vez.
  - Compatibilidad con las 7 versiones archivadas y ausencia de persistencia.
- **`tests/text-node-regression.test.cjs`:**
  - +1 caso que barre el panel de opciones y cada significado de todos los turnos de selección con el `View` real de react-native-web.
  - El barrido de `LearningRescue` ahora también pulsa los `Pressable` (antes solo los `Button`).
- **Mutaciones detectadas:** duplicar reproductores en guías de una unidad y ordenar primero la opción correcta.
- **Pruebas anteriores ajustadas:**
  - Total del catálogo 35 → 69.
  - Un ejemplo de modelo «sin guía» que ahora la tiene; se conserva la comprobación del orden de fragmentos.
  - Etiqueta renombrada en la prueba de regresión.
- **Chrome (`check-premium.mjs --rescue`):**
  - En el precio del café: guía del enlace, todas las ayudas y el panel de opciones abiertos.
  - Un solo «Escuchar el modelo».
  - Sin desbordamiento a 320/390/1280 px.
  - Sin escrituras de progreso.

## 6. QA manual (Chrome)

`npm.cmd run web` → http://localhost:8081, con el audio activado.

1. **Desde cero, café:** llegá a «Ça fait … euros». El panel muestra el precio con su aproximación (por ejemplo, *truá zöró*). En «¿Cómo se pronuncia?» leé el enlace y escuchá normal y lento: ¿se oye la z del enlace?
2. «Escuchar las opciones»: escuchá las tres. ¿Suenan en francés? Abrí «Significado y pronunciación» de una opción incorrecta: no debe parecer la respuesta correcta ni seleccionarse.
3. «Practicar y construir mi respuesta»: debe haber **un solo** «Escuchar el modelo» en pantalla y el vocabulario no debe repetirse.
4. **A1:** cambiá el modo. Antes de pedir ayuda no debe verse el modelo. «Escuchar las opciones» no debe marcar ninguna como correcta.
5. **Londres, elección de camino:** abrí las opciones y escuchá «I'd like to walk, please.» (¿se omite la l?) y «Through the market, please.».
6. **Rendez-vous, «Tout droit, puis à droite/gauche»:** compará *droit* y *droite* en la guía y en el audio.
7. Escribí un borrador en un turno de texto, abrí y cerrá todas las ayudas, y comprobá que el texto sigue ahí.
8. **Micrófono:** «Practicar hablando sin enviar»: nada se envía y no aparece ninguna nota de pronunciación.
9. Repetí los pasos 1–3 en una ventana de 320–390 px de ancho.

## 7. Limitaciones

- Revisión editorial por IA; falta revisión docente humana de las 34 guías nuevas.
- La velocidad lenta depende de la voz del dispositivo. No se comprobó de oído.
- Algunas variantes de redacción y opciones incorrectas no tienen guía completa (sección 3).
- Las traducciones de las opciones existen solo donde hay guía; no se inventan traducciones.
- Android, iOS y Safari, lector de pantalla y texto ampliado siguen pendientes.
