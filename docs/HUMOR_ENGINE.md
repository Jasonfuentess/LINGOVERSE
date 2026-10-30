# Humor Engine — LV-004A

LV-004B-02 añade referencias culturales compartidas FR/EN y contexto explícito de entrada escrita, con interpretaciones independientes para las cuatro regiones. Detección única, selección mediante Variety Engine y evidencia mínima versionada para reanudación; no modifica evaluación. Doce revisiones editoriales conservan las líneas antiguas solo para snapshots. Ver [ROAST_WRITTEN.md](ROAST_WRITTEN.md) y PROJECT_STATE para arquitectura, ejemplos y pruebas actuales.

## LV-004B-01 — feedback escrito contextual

Roast v3 incorpora diagnóstico escrito editorial (`spelling`, `vocabulary`, `structure`, `unknown`) derivado de validación exacta, sin similitud semántica ni IA. Las reacciones pueden restringirse por ejercicio/diagnóstico; la selección y restauración rechazan contextos incompatibles. Las explicaciones de acierto escritas son líneas pedagógicas regionales completas, identificadas como `educational`, que sustituyen la explicación neutra en la única burbuja. Errores conservan siempre explicación y ejemplo, incluso sin broma. Biblioteca total Roast: 234 líneas; 72 diagnósticas, 64 explicaciones pedagógicas y dos nuevas líneas salvadoreñas se suman a las 96 originales. Los IDs originales conservan su texto para reanudar snapshots anteriores.

Ver [ROAST_WRITTEN.md](ROAST_WRITTEN.md) para equivalencias, ejemplos, privacidad, compatibilidad v2/v3, límites y QA. Se guardan solo formas canónicas/casos editoriales o un marcador vacío para respuestas escritas desconocidas en v3. No se repite texto libre en bromas. Consentimiento y revocación se conservan.

Implementación local por texto, sin servicios, audio, dependencias nuevas ni generación automática. El contenido pedagógico francés v1/v2 y su evaluación permanecen intactos.

## Ampliación LV-004B — Roast Me

Roast Me está implementado con acceso desde Explorar → Modo Sin Pena, consentimiento doble y revocable y progreso independiente. Ver [ROAST_ME.md](ROAST_ME.md) para flujo, arquitectura, ejemplos y QA. Las secciones siguientes describen la base histórica LV-004A; su ausencia de activación adulta ha sido sustituida únicamente en el acceso específico Roast.

Biblioteca separada de 96 líneas completas para cuatro entrenadores. `selectReaction` recibe modo explícito, exige consentimiento adulto para Roast y conserva el modo amistoso como valor predeterminado. Reutiliza filtros contextuales y Variety Engine. Para reducir repetición dentro de sesión, la última línea del pool contextual recibe peso base 0,05 cuando hay alternativas; no se elimina la posibilidad de repetición. `restoreReaction` admite la biblioteca del modo para restaurar snapshots sin sorteo.

El repositorio conserva envelope v3, verifica consentimiento persistido antes de escribir acciones adultas y usa clave separada. La UI filtra de nuevo el consentimiento antes de mostrar cualquier reacción Roast. Revocar oculta inmediatamente, incluso si guardar falla; cambios externos y regreso al foco fuerzan relectura. No se implementa Mamá de LATAM.

Validación: 82 pruebas aprobadas, incluidos acceso, dos confirmaciones, separación amistosa, selección regional, evidencia de errores, restauración, revocación, fallback y convivencia con cafetería. Simulación semilla 40402 repetida dos veces con resultados idénticos: 1000 recorridos completos, 11 504 reacciones, 2876 por región, 83 IDs, 109 repeticiones consecutivas, 387 repeticiones entre 11 476 comparaciones del mismo contexto regional/categoría, cero incompatibilidades y 40 reanudaciones verificadas. General se comprueba en tests, pero no se necesita en el recorrido completo. No son mediciones de eficacia educativa ni aceptación visual.

## Personalidades y biblioteca

128 textos editoriales versionados: cuatro regiones × ocho categorías × cuatro alternativas. Cada grupo contiene dos alternativas suaves y dos juguetonas; la intensidad juguetona admite ambas. No son sustituciones de palabras en una plantilla.

| Región | Entrenador | Personalidad | Ejemplo real de acierto |
| --- | --- | --- | --- |
| es-SV | Luz | Voseo, complicidad cotidiana, pequeñas victorias | «¡Cabal! Esa respuesta encaja con la conversación.» |
| es-MX | Toño | Ingenio práctico de taller y paciencia | «Esa frase quedó alineada; no hubo que sacarle la cinta métrica.» |
| es-CO | Vale | Narración cálida y ritmo sin afán | «Bacano, ese paso quedó resuelto con sentido.» |
| es-AR | Romi | Voseo e ironía rioplatense suave | «Che, ese paso quedó resuelto; la solemnidad puede quedarse afuera.» |

Categorías: general, acierto, error, reintento, recuperación tras error, dificultad recurrente, progreso y celebración. La biblioteca es editorial inicial, no representa a todas las personas de una región; queda pendiente revisión cultural externa.

## Contratos y contexto verificable

`src/domain/humor/models.ts` separa entrenador, región, preferencias, modalidad, intensidad, contexto y reacción guardada. `learningLanguage`, `interfaceLanguage` y `coachLocale` son independientes. IDs `humor-v1:<región>:<categoría>:<índice>`, versión editorial 1.

`context.ts` obtiene los intentos de los eventos reales y vuelve a evaluarlos con Learning Engine. Primer fallo: error; siguientes: reintento; a partir de tres errores registrados del mismo ejercicio/objetivo: recurrente. Un acierto después de errores del ejercicio actual produce recuperación. Los pasos confirmados 3 y 6 producen progreso; la misión completada produce celebración. No se deducen fallos de pronunciación ni rasgos personales.

La selección exige hechos coincidentes para recuperación y recurrencia (ámbito, idioma, objetivo, referencia y conteo). Sin contenido específico compatible utiliza categoría general o presentación neutral del entrenador. La corrección educativa conserva su texto y aparece antes del comentario.

## Selección y memoria

`engine.ts` valida la biblioteca, filtra región/categoría/intensidad/consentimiento y convierte las alternativas en candidatos del Variety Engine existente. Delega frecuencia, recencia, pesos y RNG a `selectContent`; no copia el algoritmo. El RNG es inyectable. Los pesos permiten repetir; cuatro alternativas por categoría no proporcionan contenido infinito.

Cada reacción mostrada cuenta como aparición `reaction` en el historial existente. Se conservan sus límites: 256 entradas, 64 apariciones recientes y 64 hechos de error. No se guardan nombres, audio ni respuestas libres adicionales. El evento se identifica por versión, ejecución, eventos, estado y nodo.

El repositorio de misión escribe atómicamente progreso, historial y snapshot de reacción en envelope **v3**, en la clave anterior. Lee progreso plano antiguo y envelopes v2/v3, con contenido francés v1/v2. Reanudar no sortea de nuevo. Un snapshot incompatible se oculta sin destruir el progreso. Cambiar de región/intensidad puede ocultar el comentario anterior; la siguiente acción selecciona uno compatible.

Preferencias en `lingoverse.humor-preferences.v1`, independientes del perfil original: humor amistoso activado, intensidad juguetona y adulto desactivado sin consentimiento. Lectura/validación estrictas; escritura con comparación del valor leído, serialización y Web Locks cuando el adaptador los ofrece. Una ventana obsoleta no puede sobrescribir silenciosamente una revocación. Sin Web Locks no se garantiza atomicidad entre procesos independientes; sí se detectan registros ya cambiados al comprobarlos.

El consentimiento preparado requiere dos confirmaciones explícitas (mayoría de edad y aceptación), versión 1 y fecha válida; revocar borra el consentimiento y desactiva adulto. **No hay botón de activación adulta ni textos adultos en LV-004A.** Roast Me y Mamá de LATAM son contratos reservados, excluidos de la selección. Perfil permite desactivar comentarios, elegir intensidad y revocar un consentimiento que existiera en almacenamiento. Un fallo de lectura deja la enseñanza disponible sin comentarios; un fallo de escritura mantiene el ajuste anterior y ofrece relectura.

## Evidencia ejecutada — 2026-10-28

- `npm test`: 70/70, cero fallos. Incluye identidad regional, categoría, RNG, variedad, referencias a errores, recuperación, celebración, intensidad, defaults, consentimiento, revocación entre escritores, cuota, snapshots, progreso antiguo y convivencia con LV-003.
- `npm run typecheck:core`, `npm run typecheck`, `npm run lint`: salida 0.
- `npm run export:web`: salida 0, exportación a `dist`.
- `npm run simulate:variety`: 1000 sesiones; informe existente regenerado con el nuevo envelope.
- `npm run simulate:humor`: 1000 misiones completas, semilla 404, dos ejecuciones comparadas para reproducibilidad; detalle por ID en `LV-004A_SIMULATION.json`.
- `npm run check:expo`: falla por red con `AggregateError [EACCES]` en `internalConnectMultiple`. En PowerShell: `$env:EXPO_OFFLINE='1'; npm run check:expo; Remove-Item Env:EXPO_OFFLINE` devuelve salida 0 y «Dependencies are up to date», con advertencia de validación no fiable en modo offline. No se certifica validación remota. No se ejecutó Expo Doctor remoto.
- `npm run test:web`: falla `CDP timeout: Browser.getVersion`. **No hay aceptación visual aprobada**, ni Android/iOS ejecutados.

Simulación de humor: 11 600 reacciones; 2900 por región; 82/128 IDs utilizados; 678 repeticiones consecutivas (5,8453 %), cero incompatibilidades de relevancia. Categorías: 7800 aciertos, 2000 progreso, 1000 celebración, 598 recurrencia, 200 recuperación, un primer error y un reintento. Hay tres fallos de saludo cada cinco sesiones, 600 errores comprobados acumulados. Por eso el caso pasa pronto a recurrencia y la cobertura de error/reintento es baja; las pruebas unitarias cubren cada categoría/región separadamente. La categoría general no se necesita en este recorrido completo. Al final: 136 entradas, 64 recientes, un hecho de error, registro de 38 050 caracteres. Estas métricas describen un escenario sintético, no calidad percibida ni eficacia educativa.

## Revisión manual pendiente

1. `npm run web`; crear invitado con francés y elegir una región. En Perfil comprobar personalidad, intensidad y desactivación; guardar y recargar.
2. Abrir «Un café en París». Responder correctamente y comprobar comentario regional después de la corrección. Repetir con las cuatro regiones.
3. En una misión nueva equivocarse una vez, volver a fallar, luego acertar: comprobar error/reintento/recuperación. Acumular tres errores reales del mismo ejercicio para recurrencia; no debe recordar errores inexistentes.
4. Avanzar hasta pasos 3/6 y finalizar las ocho interacciones. Comprobar progreso y celebración, manteniendo ramas café/té, aquí/para llevar y azúcar.
5. Recargar con comentario visible: mismo texto y progreso. Reiniciar: nueva selección posible. Reabrir un registro v1/v2 conservado: misma misión, evaluación y rama.
6. Desactivar humor: no mostrar comentarios, correcciones intactas. Con intensidad suave no mostrar textos juguetones. Cambiar región: ocultar comentario de otra región y seleccionar la nueva en la siguiente acción.
7. Dos ventanas: guardar ajustes en una y tratar de guardarlos desde la otra; debe pedir releer. Probar almacenamiento denegado/cuota: no aparentar guardado exitoso. Confirmar accesibilidad con lector, foco, pantalla estrecha y texto ampliado.
8. Móvil: `npm start` con Expo Go compatible con SDK 57; `npm run android` con emulador local configurado; iOS requiere dispositivo compatible o macOS/Xcode para simulador. No se certificaron aquí ejecución nativa, SQLite real ni comportamiento visual.

Pendientes: aceptación visual y móvil, revisión lingüística/cultural externa, evaluación de calidad de las reacciones con usuarios. No se implementaron audio, modos adultos completos, IA externa ni LV-004B.
