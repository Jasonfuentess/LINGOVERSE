# LV-006A — Lost in London · guía editorial y validación

## Versión vigente v4 — LV-007-LEARN-01

Nuevas partidas usan v4: el primer NPC ofrece ayuda y las opciones correctas saludan **y responden**: «Hello! Yes, please.» / «Hi! Yes, I need help.». Se admiten alternativas editoriales breves revisadas; los siguientes objetivos y rutas permanecen. La guía opcional prepara significado, audio normal/lento, partes, repetición y respuesta. Un breve contexto posterior permite reutilizar Yes, please sin otro objetivo de misión ni nota fonética.

El archivo `london.v3.ts` se archivó idéntico al original antes de corregir contenido; junto a v1/v2 se registra en repositorio/selector. Partidas anteriores siguen su versión y feedback originales; no se borran ni se migran. En el saludo antiguo se explica la versión conservada. Los apoyos usan ids distintos para saludo v4 y legado, sin mezclar checkpoints.

Diagnóstico/limitaciones y prueba con principiantes: [LV-007-LEARN-01-QA.md](LV-007-LEARN-01-QA.md). Lo siguiente describe etapas editoriales históricas.

**Fecha de desarrollo:** 2026-10-30 (fecha de solicitud y aceptación de LV-005B-02). Se conserva el estado inicial del ZIP LV-005B-02 con su historial francés.

## Objetivo pedagógico

La aventura está **diseñada para práctica guiada A1** de inglés; no es una prueba de nivel ni ha sido revisada por un docente independiente. Las traducciones y explicaciones están en español para introducir expresiones antes de usarlas. Nueve momentos obligatorios: saludar, decir que se es nuevo/visitante, pedir ayuda, preguntar dónde está un lugar, elegir una ruta, aclarar su ubicación, interpretar una indicación, agradecer y despedirse.

## Dos historias con consecuencias

| Variante | Inicio | Destino de ficción | Ruta A | Ruta B |
| --- | --- | --- | --- | --- |
| `station-arrival` | Llegada a King’s Cross y teléfono sin batería. Maya ayuda al viajero | Blue Door Hostel | Caminar; Nora, la librera; buzón rojo; recto e izquierda | Autobús; Ben, conductor; parada; número cinco |
| `riverside-rain` | Lluvia junto al South Bank. Ollie guarda su guitarra | Lantern Theatre | Río; Asha y paraguas amarillo; puente y derecha | Mercado cubierto; Leo y letrero verde; pasar el letrero e izquierda |

Los destinos y detalles de la ruta son ficticios; **no son indicaciones reales de navegación en Londres**. Los nombres de personajes y localizaciones no se usan para fingir que dos argumentos idénticos son diferentes: las preguntas, las personas, las respuestas y la forma de llegar son distintas. Cada una de las 2 variantes tiene dos caminos distintos con 9 ejercicios visitados (13 nodos alcanzables por variante). El selector Variety Engine existente decide la variante al iniciar un recorrido y la fija en el progreso; **no promete alternancia garantizada** en cada reinicio.

Los textos aceptados son **alternativas editoriales finitas**, no interpretación libre: ej. `I'm new here`/`I am new here` y `Where is…?`/`Where's…?`. Las elecciones de ruta tienen dos formas de expresar cada camino, asociadas al mismo destino de rama. Los errores de gramática conocidos ofrecen feedback contextual (p. ej. `I new here` necesita `am`); entradas erróneas arbitrarias no se guardan como texto en la lección inglesa (reglas escritas de validación).

## Arquitectura y persistencia

- `Lesson.language` y `validateLesson` ahora aceptan `fr | en` sin cambiar `schemaVersion: 1` ni el formato de `MissionProgress`.
- ID inglés `en-a1-london-lost`, `contentVersion: 1`; clave local por lección: `lingoverse.mission.en-a1-london-lost.v1`, **distinta de** `lingoverse.mission.fr-a1-paris-cafe.v1`. Francés v1 y v2 siguen resolviéndose por versión.
- `MissionProvider(language='en')` selecciona un contexto de estado independiente y reutiliza `MissionRepository`; el proveedor francés y el de Roast conservan su propio contexto. **Ninguna migración de las partidas francesas**.
- `MissionScreen`, `ConversationMessage`, `SpeechInput`, `VoiceToolbar`, `ExerciseView`, `CoachReaction` y revisión reciben el idioma del contenido y aplican la configuración `en-GB`/`fr-FR`. El Learning Engine usa los mismos `evaluateAnswer`, `submitAnswer`, `continueMission`, `restoreProgress`.
- La conversación se proyecta desde eventos guardados y solo muestra nodos recorridos; no se serializa una segunda línea temporal. Los textos libres erróneos en inglés se reducen a evidencia editorial conservable, evitando guardar información privada arbitraria.
- Presentación: reaprovecha la jerarquía visual, conversación y ayuda progresiva; la cabecera londinense es arte **local no descargado**, elaborado con formas RN (silueta, torre, autobús), y nuevos retratos tipográficos. Los personajes franceses y entrenadores existentes se conservan.
- No se incorporaron nuevos paquetes o servicios de pago. STT web depende de permiso y API del navegador; puede procesar audio externamente. No se almacena la grabación, y una transcripción **no es** una evaluación de pronunciación.

## Checklist para QA manual de Chrome (pendiente de la nueva entrega)

1. En Windows/Chrome real `npm run web`, elegir inglés en perfil y entrar a **Explorar → Lost in London**. Comprobar la cabecera londinense distinta de París.
2. Comenzar: escuchar al NPC con voz inglesa cuando haya voz compatible; silenciar, detener y repetir; comprobar fallback si no hay voz.
3. Saludar con `Hello!` o `Hi!`, responder `I'm new here.` o `I'm visiting London.`, solicitar ayuda y preguntar dónde está el destino enseñado.
4. Activar micrófono, aceptar permiso voluntariamente, dictar una frase inglesa y revisar/editar el resultado. `Usar esta transcripción` solo transfiere texto; `Comprobar respuesta` evalúa. Probar opción de selección por coincidencia exacta; nunca se debe autoseleccionar con frase ambigua.
5. Elegir un camino, avanzar hasta su NPC, seguir sus indicaciones y terminar los 9 objetivos. Comprobar que el resumen refleja solo las escenas visitadas.
6. Reiniciar e intentar el otro camino; comprobar cambios reales de personaje, instrucciones y llegada. Repetir hasta observar también la otra historia; el motor ponderado no garantiza que cambie inmediatamente.
7. Contestar `I new here.` y una dirección equivocada, revisar explicaciones, usar pista y después responder correctamente.
8. Recargar en mitad de una ruta, salir a francés, continuar París y regresar a Londres; **ambos avances deben mantenerse independientes**. Verificar también reinicio independiente.
9. Denegar permiso o simular micrófono no disponible, cancelar dictado, cambiar de pantalla y escribir por teclado sin impedimentos.
10. Probar 320/390 px y tamaño de letra, lector de pantalla, contraste, errores de almacenamiento y permiso, y si es posible otros navegadores. No asumir Safari, iOS o Android nativos.

### Pruebas automatizadas ejecutadas

`npm test` **135/135 OK**; `npm run typecheck:core` **OK**; `npm run typecheck` **OK**; `npm run lint` **OK**; `npm run export:web` **OK**. Estas pruebas no usan micrófono real ni confirman que el dispositivo tenga una voz `en-GB`. El ensayo de Chromium de este entorno fue **no aprobado por política de red** (`127.0.0.1 is blocked`), sin acceso a la página local; no prueba un bug de la aplicación. **QA manual de LV-006A no ejecutado en el Chrome del usuario.** La versión anterior, LV-005B-02, sí cuenta con la confirmación manual 9/9 dada por el usuario el 30/oct/2026, solo en Chrome escritorio.

## Pendientes

QA de audio inglés/permiso/reconocimiento nativos en dispositivo real; aceptación visual/UX de estudiantes, revisión A1 por docente, lectores de pantalla, pruebas de dispositivos móviles y navegadores sin Web Speech API. La primera versión contiene alternativas finitas; ampliar solo con equivalencias verificadas, no un evaluador semántico imaginario. No introducir Diario/Pasaporte en esta tarea.
