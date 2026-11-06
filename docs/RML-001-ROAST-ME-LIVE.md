# RML-001 — Roast Me Live: Conversational Humor & Voice Foundation

> Registro histórico. RML-002 cambió varias reglas descritas aquí: comprensión de respuestas naturales, humor en respuestas correctas, catálogo reescrito, modalidades, reinicio y acceso único en Inicio. Ver [RML-002-LIVE-MODES.md](RML-002-LIVE-MODES.md).

**Estado:** implementado; 242/242 pruebas y recorridos en Chrome real (headless) aprobados (03-nov-2026). **Pendiente y decisivo:** escucha humana de voces, ritmo y naturalidad del humor; micrófono físico; revisión editorial y cultural por personas de cada región.

Roast Me Live **no es una IA de charla libre**. Son escenas y frases revisadas, con un intérprete determinista. La pantalla lo dice explícitamente.

## 1. Reutilizado (sin duplicar)

| Necesidad | Componente existente |
| --- | --- |
| Escenas, intenciones, errores menores, aclaraciones, fuera de contexto, memoria de hechos, validación sin repreguntas | Contratos LV-007B (`interpretAnswer`, `conversationMemory`, `validateLesson`) |
| Turnos, persistencia y reanudación | `beginMission` / `submitAnswer` / `continueMission` y `MissionRepository` (clave `lingoverse.mission.live-{fr,en}.v1`) |
| Rotación de escenas | Variety Engine (vía `MissionRepository.start`) |
| Micrófono, transcripción editable, revisión | `SpeechInput` e `inspectTranscript` |
| Voz | `VoiceController` (único dueño de la cola), `VoiceProvider` (detiene al navegar o revocar) |
| Consentimiento y revocación | Preferencias de humor y `/roast` |
| Ayuda de pronunciación | `PronunciationCoach` y catálogo existente |

## 2. Implementado

- **Ruta `/live` y acceso destacado en Inicio** (`LiveInvitation`), sin quitar aventuras.
- **6 escenas** (`src/content/live.ts`), con 4 turnos cada una:
  - Francés: terraza, metro, panadería.
  - Inglés: cafetería, hotel, calle.
  - Cada turno tiene intenciones con hechos, errores menores, errores reales con explicación, aclaraciones y fuera de contexto.
  - Errores elegidos por ser típicos de hispanohablantes: *je suis une table*, *un canard*, *I have fine*, *for go*, *good night* al llegar, *estation*, *reserve*…
- **Capa de humor Live** (`src/domain/humor/live.ts`), extensión mínima del motor:
  - Decide el tipo de respuesta: `normal`, `light`, `roast`, `double`, `celebration`, `teach`, `clarify`, `callback`.
  - Elige la línea más específica (error real > turno > hecho > general).
  - Prefiere líneas no usadas en la sesión y es reproducible por semilla.
- **Reglas del tipo de respuesta:**
  - No reconocida o ambigua → aclaración: nunca culpa al estudiante y el micrófono se menciona de forma neutral.
  - Fuera de contexto → broma ligera o enseñanza.
  - Error real → roast (con consentimiento) o enseñanza, siempre con explicación y modelo.
  - Error menor → broma ligera o enseñanza de la forma mejor.
  - Correcta → normal; celebración solo al recuperarse o terminar; a veces un callback a un hecho recordado.
  - Nunca dos bromas seguidas en respuestas correctas, y nunca roast sin un error real.
- **Sesión** (`src/domain/live/session.ts`):
  - La conversación completa se reconstruye desde los eventos guardados.
  - Revocar el consentimiento vuelve a mostrar todas las líneas pasadas en versión limpia.
  - El texto libre no reconocido se guarda vacío.
- **Pantalla** (`src/features/live/LiveScreen.tsx`):
  - Barra compacta durante la sesión, con los ajustes a un toque (entrenador, idioma, humor, voz).
  - Escena, interlocutor, estudiante y entrenador (risa visual + texto + enseñanza + modelo).
  - Micrófono con transcripción editable, alternativa escrita y envío **siempre explícito**.
  - Ayuda «¿Qué digo?» con modelo y Pronunciation Coach.
  - Estados «Hablando…», «Procesando…», «Tu turno» y «Listo para seguir», con Detener y Repetir.
- **Audio:**
  - `VoiceController.playSequence`: segmentos consecutivos con un único token. Detener, silenciar, revocar o navegar cancela toda la secuencia, y un callback tardío no inicia el segmento siguiente.
  - `voiceId`: voz preferida solo si es del idioma pedido.
  - El español va con la voz del entrenador; las frases entre «» y el modelo, con la voz francesa o inglesa.

## 3. Contenido por entrenador (`src/content/liveHumor.ts`, 157 líneas)

Las líneas se escribieron completas para cada entrenador; ninguna se arma intercambiando una palabra regional. Una prueba compara todas las líneas de entrenadores distintos sin sus marcadores regionales y verifica que ninguna coincida. Cada entrenador tiene líneas de los ocho tipos, incluidos roasts contextuales para cada error revisado (pato, «soy una mesa», «soy un café», «de nada» al pagar, «buenas noches» de día o al llegar al hotel, *for go*, *I have fine*).

- **Luz (SV):** voseo, *maje*, *cerote*, *puchica*, *vergón*, *a la gran puta*, *hijueputa*; cambio rápido de broma a enseñanza; referencia al Chavo.
- **Toño (MX):** carrilla, *güey*, *no mames*, *chale*, *pinche*, *cabrón*, *a huevo*; albures solo en las líneas de doble sentido; referencia a Goku.
- **Vale (CO, variedad paisa):** *parce*, *mijo*, *pues*, *qué chimba*, *gonorrea*, *berraquera*, *hijueputa*; referencias al Metrocable y a tandas de penales.
- **Romi (AR):** voseo rioplatense, *boludo*, *la puta madre*, *qué carajo*, *posta*, *chamuyo*; «che» con moderación; referencia al penal de Messi contra Islandia.

**Niveles:**

| Nivel | Nombre | Disponible |
| --- | --- | --- |
| 0 | Limpio | Siempre; también sin consentimiento |
| 1 | Picante | Con consentimiento adulto |
| 2 | Sin pena | Con consentimiento adulto |
| 3 | Sin misericordia | Con consentimiento adulto |
| — | Doble sentido | Requiere nivel ≥ 2, consentimiento y activación explícita, y solo en escenas con gancho («avec du lait ?», la baguette) |

La validación rechaza:
- palabras adultas en el nivel 0;
- risas escritas en el texto hablado;
- líneas repetidas;
- frases «» que no citen una entrada revisada.

## 4. Selección de voz

- **Qué expone la plataforma:** solo nombre, idioma y si la voz es local o de red. **No hay dato de género.**
- **Orden de preferencia** (`src/domain/voice/coachVoices.ts`):
  1. La voz elegida por el usuario.
  2. Región exacta del entrenador.
  3. Español latinoamericano.
  4. España.
  - Dentro de cada grupo, **masculina probable** según una tabla documentada de nombres (Raúl, Jorge, Pablo, Rodrigo, Tomás, Gonzalo…). No se usan voces de red sin el permiso existente.
- **Interfaz:** se muestra «masculina probable (por el nombre)», «femenina probable» o «género desconocido», con un botón «Probar» por voz. La elección se guarda en `lingoverse.live-voices.v1` (solo identificadores).
- **Avisos honestos:** «No hay voz de El Salvador…; se usa Raúl (es-MX)», «No podemos confirmar si es masculina», «la voz sintética no garantiza el acento».
- **No se usa:** ni tono ni velocidad para imitar acentos.

## 5. Limitaciones reales

- **Risa:** no hay carcajada audible. La risa es visual («JAJAJAJA» con etiqueta accesible «se ríe»). Con los recursos actuales no hay un audio de risa con licencia verificable, y una risa sintetizada sonaría robótica. Queda para una etapa de voz.
- **Voz:** el acento y el género dependen de las voces del dispositivo. En Chrome de Windows suele haber es-MX y es-ES (Raúl y Pablo son masculinas). Una voz es-SV, es-CO o es-AR suele requerir voces de red (Edge «Natural») o voces del sistema.
- **Explicaciones:** se leen en pantalla; solo se reproducen la línea del entrenador y el modelo. Leer las explicaciones en voz alta mezclaría palabras extranjeras con voz española.
- **Comprensión:** solo cubre frases revisadas. Otras formulaciones válidas reciben una aclaración honesta.
- **Callbacks:** se refieren a hechos de la escena actual, no a sesiones anteriores.
- **Expresión emocional:** el sintetizador no actúa emociones. Puede sonar plano aunque el texto sea expresivo.
- **Revisión:** el humor regional fue escrito y revisado editorialmente por IA. Requiere revisión de hablantes nativos de cada región.
- **Plataformas:** pendientes las pruebas en Android, iOS y Safari.

## 6. Pruebas

- **`tests/roast-live.test.cjs` (16):**
  - Escenas y objetivos; flujo de turnos; contexto y callbacks; aclaraciones y desconocidas; correcciones.
  - Humor contextual y diferenciación por entrenador; variedad y reproducibilidad; validación del catálogo.
  - Consentimiento e intensidad; doble sentido; segmentos de voz por idioma; selección y persistencia de voz.
  - Audio en secuencia: revocación, navegación, voz faltante, error del sintetizador, voz de otro idioma ignorada.
  - Persistencia sin texto libre; Pronunciation Coach.
  - Pantalla real con react-native-web: dictado editable que no envía solo, envío explícito, audio en secuencia, borrador conservado tras un error, ayuda y sin nodos de texto inválidos.
- **Mutaciones detectadas:** desbloquear intensidad sin consentimiento, dos bromas seguidas y repetir líneas usadas.
- **`scripts/check-live.mjs` en Chrome real:**
  - Acceso desde Inicio; modo amistoso sin groserías.
  - Consentimiento desde `/roast` → «Sin pena» vuelve a mostrar el roast contextual del error real.
  - La ayuda llena el borrador sin enviar; la revocación limpia la conversación; la recarga reanuda.
  - Sin desbordamiento a 320, 390 y 1280 px.

## 7. QA manual (Chrome de escritorio, con audio y micrófono)

`npm.cmd run web` → http://localhost:8081.

1. En Inicio, abrí «Roast Me Live». Elegí un entrenador y el idioma.
2. Abrí «Voz de …» y probá las voces. ¿Hay alguna masculina? ¿Qué acento tiene? Anotá cuál elegís.
3. «Empezar conversación»: la escena se oye en español y la línea del personaje, en francés o inglés. ¿El ritmo es fluido o con pausas raras?
4. Respondé con el micrófono, editá la transcripción y enviá. Comprobá que nada se envía solo.
5. Sin consentimiento, cometé un error de la escena (por ejemplo, «Je voudrais un canard.» en la terraza): no deben aparecer groserías.
6. Activá el humor adulto en Roast Me y luego «Sin pena» o «Sin misericordia». Repetí el error. ¿La broma es graciosa, natural y regional para ese entrenador? ¿La enseñanza llega después?
7. Activá «Picardía y doble sentido» y pedí una baguette o un café con leche. ¿El doble sentido es oportuno o forzado?
8. Respondé bien varias veces: ¿se siente como conversación o como chiste constante?
9. Durante la reproducción pulsá «Detener», cambiá de pantalla y revocá el consentimiento: el audio debe cortarse y las líneas adultas desaparecer.
10. Repetí con los cuatro entrenadores y en inglés.
11. En un teléfono o en una ventana de 320–390 px, verificá que el micrófono y «Enviar» estén accesibles.

## 8. Próxima etapa sugerida

Una etapa de voz (RML-002) para evaluar voces regionales de mejor calidad y una risa audible con licencia verificable. El objetivo es menor latencia, sin APIs de pago obligatorias, y ajustar el contenido con la retroalimentación auditiva y editorial del usuario.
