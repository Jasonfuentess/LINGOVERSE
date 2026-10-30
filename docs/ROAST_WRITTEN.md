# Respuestas escritas — LV-004B-01

## Ampliación LV-004B-02 — teclado y referencias compartidas

### Teclado por plataforma

La inspección encontró `Page` sin ajuste de teclado/viewport y `ScrollView` con la política predeterminada que consume el primer toque fuera del campo. Se añadió `KeyboardScroll`: iOS usa KeyboardAvoidingView con padding, Android declara `softwareKeyboardLayoutMode: resize`, y ambos mantienen un ScrollView con `keyboardShouldPersistTaps="handled"`. No se aplica simultáneamente inset automático y padding de teclado. SafeAreaView permanece exterior y no se añaden alturas fijas al formulario.

Campo y botón están agrupados. Al enfocar, mostrar teclado, cambiar el viewport o recomponerse el contenido se mide ese grupo y se desplaza únicamente la porción oculta, sin animación ni cambio de foco. No se fuerza desplazamiento en cada pulsación ni al llegar una reacción. En web VisualViewport aporta altura/offset; se añade solo el espacio realmente obstruido, sin sumar otro inset si el navegador ya redujo la ventana. El zoom no se trata como teclado. Si el grupo supera el espacio disponible, se prioriza su parte superior y se conserva scroll manual para llegar a la acción.

Referencias consultadas: [ScrollView y keyboardShouldPersistTaps](https://reactnative.dev/docs/scrollview), [KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview), [VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport). La implementación se contrastó también con los tipos/código de React Native instalados.

### Catálogo universal, evaluación y evidencia

`content/humorReferences.ts` separa: ID/versionado de referencia cultural, idioma/ámbito/objetivo/ejercicio, patrones escritos explícitos, corrección educativa y dos interpretaciones completas por entrenador. La detección en `domain/humor/references.ts` es única para todas las regiones. No se asigna un meme a un país ni se traducen mecánicamente las líneas entre regiones.

Catálogo inicial:

| Referencia | Entrada completa | Contexto obligatorio | Corrección |
| --- | --- | --- | --- |
| Messi + Goku | Messi Goku | FR, roast-cafe-fr-a1, merci, remercier | Merci beaucoup = muchas gracias |
| Bon Jovi | Bon Jovi | FR, roast-cafe-fr-a1, bonjour, saluer | Bonjour = hola / buenos días |
| Berry / very | Thank you berry much | EN, roast-english-a1, thanks, thank | Thank you very much = muchas gracias; berry = baya |

La referencia inglesa está disponible en catálogo y probada en dominio; no existe todavía una aventura inglesa jugable. No se anuncia como una capacidad ya accesible desde navegación.

Normalización específica: NFC, minúsculas, espacios, apóstrofos tipográficos y puntuación terminal. Se exige coincidencia de toda la entrada. `Messi Goku!` coincide; `hola Messi Goku`, `Messi Goku mi teléfono…`, `Messi-Goku`, `Messi Gokú` o usarlo en otro ejercicio no coinciden. Solo respuestas escritas incorrectas pueden producir evidencia. No hay coincidencia fonética, búsqueda parcial, IA ni modificación de calificación. Un easter egg es interpretación editorial de una entrada comprobada, no un diagnóstico lingüístico nuevo; la evaluación puede seguir siendo `unknown`.

El proveedor transmite la entrada escrita solo de forma transitoria al repositorio. Antes de detectar, este reconstruye la acción mediante el Learning Engine existente y comprueba que coincide con el progreso a guardar. Después descarta el texto y guarda únicamente `{version, referenceId, patternId, eventKey}` junto al snapshot, progreso e historial en la misma escritura. Reanudar valida contexto y evento sin volver a sortear. El siguiente intento/progreso limpia esa evidencia. No se añadió ningún campo al evento educativo ni se cambió Learning Engine.

Las reacciones de referencia reciben prioridad sobre el fallback únicamente cuando hay evidencia contextual válida. Variety Engine elige entre alternativas regionales; mantiene frecuencia, recencia y peso reducido de repetición. Consentimiento adulto sigue siendo obligatorio; revocar oculta la reacción. Si no coincide una referencia, continúa el diagnóstico o feedback genérico anterior. Añadir una referencia completa con interpretaciones al catálogo no requiere cambiar pantallas ni Learning Engine.

### Ejemplos reales de la misma referencia

- Luz: «¡PUTAAAA, MAJE! ¿Messi Goku? Juntaste al fútbol con Dragon Ball y nosotros solo queríamos agradecer. Va, mi perrito: merci beaucoup significa muchas gracias.»
- Toño: «¡Cabrón, Messi Goku! Ya armaste el equipo y falta agradecer el café. Es merci beaucoup: muchas gracias.»
- Vale: «Uy, parce, ¿Messi Goku? Ese partido me lo veo, pero primero agradezcamos la atención: merci beaucoup significa muchas gracias.»
- Romi: «Che, ¿Messi Goku? Con ese refuerzo ganamos todo, menos este agradecimiento. Merci beaucoup significa muchas gracias.»

La corrección y su traducción permanecen visibles incluso sin humor. Todas las líneas son editoriales completas; no interpolan datos personales o texto libre del estudiante.

### Auditoría editorial

Se revisaron las 234 líneas existentes y se sustituyeron doce entradas especialmente forzadas o imprecisas. Ejemplos: «la taza ya puede jubilarse» pasa a un cierre sobre café pedido/conversación completa; varias metáforas prolongadas de muebles, herramientas y novelas se reemplazan por comentarios sobre el intento. «La respuesta volvió por el mismo atajo» deja de insinuar que el estudiante repitió la misma respuesta: ahora dice que este intento tampoco salió. Una recurrencia sigue exigiendo errores registrados, sin afirmar identidad entre respuestas.

Las doce versiones originales se marcan retiradas de nueva selección y se conservan para restaurar snapshots. Sus revisiones tienen IDs nuevos. Biblioteca resultante: 318 registros, 306 seleccionables y 12 archivados. Incluye 72 reacciones de referencias (3 referencias × 4 regiones × 2 alternativas × 3 estados incorrectos). La calidad cultural sigue pendiente de revisión externa; el conteo describe cobertura, no una garantía de naturalidad.

### QA ejecutado y límites

- Chrome 156 real, headless fuera del sandbox: flujo Roast, consentimiento, vista reducida a 320/390 × 420, foco conservado, campo/botón visibles y sin overflow horizontal; Bon Jovi/Messi Goku incorrectos, snapshot tras recarga y ocultación al revocar. Capturas inspeccionadas en `.web-check/roast-reduced-viewport.png` y `.web-check/roast-easter-egg.png`.
- El viewport reducido de Chrome no emula un teclado real. La primera prueba no emitía foco de ventana en headless; se corrigió con Page.bringToFront y Emulation.setFocusEmulationEnabled. El test legacy también necesitaba aceptar el encabezado de recuperación de UI-02; ahora espera la acción real de continuar.
- Dentro del sandbox Chrome falló por GPU/CDP (Page.enable); fuera pudo cargar la aplicación y ejecutar las aserciones.
- Android 11: ADB detectó emulator-5554 y Expo Go 57.0.9. Se intentó cargar Metro en puertos 8087 y 8088, con reverse local, incluyendo servidor fuera del sandbox. Expo Go terminó con `java.io.IOException: Failed to download remote update`, sin llegar a la pantalla de aprendizaje. Los servidores se detuvieron y se retiraron únicamente esos reverse. **No se validó teclado Android nativo**, ni iOS/Safari.

Para repetir web: `npm.cmd run export:web`, después `npm.cmd run test:web -- --roast --browser "C:/Program Files/Google/Chrome/Application/chrome.exe"`. Para regresión del recorrido normal, omitir `--roast`. Se usa un perfil temporal propio, no el navegador personal.

QA pendiente en dispositivo: abrir un paso escrito, activar teclado, escribir varias líneas y comprobar con un solo toque; repetir error/reintento, rotación, texto ampliado, navegación con teclado externo y regreso a la app. Verificar que cerrar el teclado no salta al principio, que deslizar manualmente no provoca rebotes y que área segura/Comprobar siguen accesibles. En Safari probar barra de direcciones y teclado predictivo; en Android, resize del build nativo además de Expo Go. No certificarlo por el test de geometría o por la exportación.

## Contenido y compatibilidad

Roast v3 conserva los ocho objetivos y las ramas de bebida, lugar y azúcar. Cuatro pasos son escritos: saludo, precio, agradecimiento y despedida; pedido, lugar, azúcar e importe siguen siendo de opción múltiple. Las seis variantes se conservan. `roastLessonV2` mantiene el contenido anterior; proveedor, repositorio y pantalla seleccionan por versión. Una partida v2 reanuda con sus preguntas, respuestas y snapshot originales; un nuevo recorrido usa v3. La cafetería normal no cambia.

Equivalencias escritas editoriales: bonjour con madame/monsieur añade trato cortés; ça coûte combien y combien est-ce que ça coûte preguntan el mismo precio; je vous remercie y merci bien agradecen; au revoir et bonne journée combina despedida y deseo de buen día. Todas se enseñan antes de responder. Son alternativas acotadas, no un evaluador general de francés. Revisión docente externa pendiente.

## Validadores y privacidad

`domain/learning/written.ts` separa normalización, aceptación exacta y diagnóstico. Solo se activa cuando el ejercicio declara `writtenRules`; los ejercicios anteriores conservan su evaluación. NFC, mayúsculas, espacios, apóstrofos tipográficos, comas y signos terminales admiten variaciones triviales. No se eliminan acentos ni se unen letras separadas por puntuación interna. No hay distancia de edición, similitud semántica o IA para aprobar respuestas.

Reglas extensibles por ejercicio reconocen únicamente ejemplos escritos completos: `bonjor` → ortografía; `merci` en el saludo → vocabulario/intención; `combien ça` → estructura incompleta; `combien ca coute` → signos escritos de ça/coûte. Todo lo demás es `unknown`: no se afirma que sea una palabra equivocada, mala gramática o texto sin relación, pues no puede saberse fiablemente. Puede haber otras expresiones francesas válidas fuera del catálogo; el feedback lo reconoce y dirige a las ayudas del ejercicio guiado.

En los ejercicios nuevos se guarda la forma canónica aceptada, el ejemplo editorial reconocido o una cadena vacía para lo desconocido, más la clasificación derivada en el feedback. Nunca se interpola la entrada del estudiante en bromas. El replay reconstruye la misma evaluación y conserva el número de intentos sin guardar el texto arbitrario. La UI no presenta el ejemplo canónico como transcripción literal del usuario. El borrador solo permanece en memoria del campo mientras está montado. Las partidas v2 anteriores conservan su formato por compatibilidad, incluido su texto histórico; reiniciar sustituye sus eventos por el nuevo recorrido, conservando estadísticas mínimas. No se afirma una purga retroactiva de almacenamiento legado.

## Feedback y ejemplos reales

Los aciertos escritos usan líneas editoriales completas que ya explican el objetivo; sustituyen la explicación neutra en la burbuja. Se mantienen encabezado claro, ejemplo con traducción y respuesta del interlocutor. Errores: una sola sección de explicación reúne la reacción diagnóstica y la corrección pedagógica; no hay otra tarjeta ni reacción repetida al pie. El fallback sin humor muestra íntegramente la explicación educativa y corrección original. Los errores nunca usan encabezado de éxito.

- Saludo correcto con Luz: «¡Ahuevo, mi perrito! Bonjour saluda de día; con madame o monsieur también entrás con cortesía, sin patear la puerta del francés.» Ejemplo: «Bonjour ! → ¡Hola! / ¡Buenos días!».
- `bonjor`, Luz: «¡Puta, chichi, la cagaste! Aquí se nos torció la escritura, no todo el francés. Bonjour se escribe con ou: es un saludo de día.» Ejemplo correcto visible debajo.
- `merci` al entrar, Toño: «Esa expresión sirve para otra cosa, cabrón. Trajimos martillo para una tarea de destornillador. Merci significa gracias; para saludar al entrar se usa bonjour.»
- `combien ça`, Vale: «Parce, a esa pregunta le falta un pedazo del cuento. Esta formulación está incompleta: añadí coûte para preguntar cuánto cuesta.» Ejemplo: «Combien ça coûte ? → ¿Cuánto cuesta?».
- Despedida correcta, Romi: «¡Bien ahí! Au revoir despide y bonne journée desea un buen día. Cerraste la conversación sin temporada extra.»
- Texto desconocido: reacción genérica, sin diagnóstico inventado, seguida de «No podemos identificar con certeza la causa. Usá una de las expresiones enseñadas; otras formulaciones pueden quedar fuera de este ejercicio guiado.»

Las expresiones «¡Puta, maje!», «¡No hay pedo, maje!» y «¡Ahora sí, cerote, ya te salió!» están en líneas completas del catálogo con categorías apropiadas. No se ensamblan insultos aleatorios. Otras regiones conservan sus propias voces. Se reutiliza Variety Engine con peso positivo para repeticiones ocasionales y memoria acotada. Las líneas diagnósticas requieren el diagnóstico actual y las recurrentes requieren además el hecho de error existente. Snapshot incompatible con el diagnóstico no se restaura.

Consentimiento y revocación siguen el contrato LV-004B: adulto explícito y vigente para mostrar Roast; la ruta se cierra al revocar y el componente tiene fallback educativo. Se conservan los límites de persistencia fallida y sincronización entre ventanas documentados en ROAST_ME.md.

## QA manual

1. `npm.cmd run web`; Explorar → Modo Sin Pena → aceptar ambas confirmaciones. Reiniciar explícitamente si existe una partida v2 para probar v3.
2. Saludo: probar `BONJOUR, MADAME!`, `bonjor`, `merci` y texto inventado. Acierto, ortografía, vocabulario y desconocido deben diferenciarse sin atribuir una causa al último.
3. Precio: `Ça coûte combien ?` correcto; `combien ca coute` escrito incorrectamente; `combien ça` incompleto. Corregir y continuar. Comprobar ejemplo/traducción y encabezados.
4. Probar je vous remercie y au revoir et bonne journée. Completar ambas ramas bebida/lugar/azúcar sin cambios. Repetir cuatro entrenadores.
5. Recargar tras error reconocido/desconocido y acierto: misma evaluación/reacción, mismos intentos. En un perfil descartable inspeccionar almacenamiento: el texto desconocido no debe aparecer. Una partida v2 previa debe seguir reanudando.
6. Revocar dentro del recorrido y en otra pestaña; no debe quedar texto adulto visible. Confirmar fallback, reintento de escritura fallida y reaceptación explícita.
7. Android con `npm.cmd start`/Expo Go compatible; terminar/reabrir app para comprobar SQLite. Web 320 px, teclado, lector, zoom y texto largo. No hay validación visual certificada en esta tarea; el bloqueo Chromium/GPU/CDP anterior sigue documentado.

Automatización: `npm.cmd test`, ambos typechecks, lint, export:web y `node scripts/simulate-roast.mjs`. El reporte actual se escribe en `LV-004B01_SIMULATION.json`, conservando el reporte histórico LV-004B. La simulación se ejecuta dos veces y exige resultados idénticos con semilla 40402; no mide aprendizaje o aceptación cultural.
