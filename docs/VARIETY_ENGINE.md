# Variety Engine · LV-003

## LV-003B — comportamiento vigente

El contenido actual de cafetería es **v2**, con seis conversaciones francesas diferenciadas. [Diálogos completos y tabla de diferencias](LV-003B_CONVERSATIONS.md), [métricas reproducibles](LV-003B_SIMULATION.json). El hallazgo de dos perfiles de la auditoría siguiente corresponde al contenido v1, que permanece congelado para reanudar sesiones antiguas.

Los candidatos ahora incluyen profileId derivado de una huella de la conversación central. La firma recorre el grafo de intervenciones/respuestas y destinos reales, omitiendo identidad/ambientación, traducciones españolas de las réplicas, IDs internos y saludo/despedida. Normaliza Unicode, mayúsculas, espacios y puntuación; ordena opciones de manera determinista. Cambiar solo el nombre, la traducción o los IDs no crea un perfil nuevo. La huella FNV-1a es un identificador técnico no criptográfico; no demuestra equivalencia semántica universal. Las pruebas comparan además firmas completas y prompts reales en las ocho rutas, no solo hashes.

La frecuencia efectiva de un candidato es el máximo de su frecuencia por ID y la suma de frecuencias del mismo perfil en el mismo ámbito/idioma/categoría. La última sesión efectiva es la más reciente de ID/perfil. Se aplican a esos valores las mismas penalizaciones graduales documentadas abajo; no se multiplican penalizaciones para castigar dos veces. Así, un alias no utilizado de una conversación reciente deja de parecer contenido nuevo. Una alternativa única y las repeticiones ocasionales siguen permitidas.

profileId es opcional y compatible en el contexto del historial v1. Los registros previos se enriquecen en memoria desde el catálogo de contenido conocido, sin inventar apariciones ni cambiar contadores/fechas. El envoltorio persistido sigue v2 con progreso v1 e historial v1. Los IDs de estadísticas de contenido v2 incluyen `:v2:`; los de contenido v1 conservan su formato, para no atribuir uso antiguo a conversaciones nuevas.

`cafe.v1.ts` conserva íntegro el paquete anterior (hash semántico verificado por test). `cafe.v2.ts` publica los mismos seis IDs bajo contentVersion 2. El repositorio, el proveedor y la pantalla resuelven la lección según contentVersion persistida: un recorrido antiguo continúa con sus textos, ayudas, importe y calificación de v1; solo Comenzar/Reiniciar abre v2. No se permite cambiar de versión a mitad del mismo run. La clave de almacenamiento, las preferencias y el control de conflictos se conservan.

Resultados con semilla 903: 1000 misiones v2 completas; seis perfiles y seis secuencias visibles francesas; 52 repeticiones consecutivas por ID, por perfil y por secuencia visible (5.21%). La igualdad de esos contadores se debe a que ahora los seis IDs representan seis conversaciones diferentes, no a inferir perfil a partir de ID. Distribución por ID 164/162/162/173/166/173; racha máxima 2; referencia uniforme 185 repeticiones. En un control adicional con seis IDs y dos perfiles v1 compartidos, la selección por perfil reduce repeticiones conversacionales de 426 a 291 por 999 transiciones. Son resultados de esta semilla/biblioteca, no garantías universales.

Validación LV-003B: 53 tests, ambos typechecks, lint, export:web y simulate:variety aprobados. document:conversations genera seis ejemplos completos con las mismas decisiones y mide cuatro diferencias centrales por pareja en esa ruta. Chromium volvió a fallar durante el arranque gráfico/CDP antes de cargar la aplicación; no hay aceptación visual ni ejecución nativa. Ver PROJECT_STATE.

Para probar las conversaciones nuevas, confirmar **Reiniciar aventura** si ya había una sesión. Continuar o recargar una sesión v1 debe mostrar precisamente la conversación antigua. No se exige que dos reinicios siempre escojan personajes diferentes. No hay contenido nuevo sin traducción/ayuda previa ni clasificación CEFR certificada por un tercero.

## Referencia histórica de LV-003 (contenido v1)

Auditoría posterior de variedad visible: [LV-003_VISIBLE_VARIETY_AUDIT.md](LV-003_VISIBLE_VARIETY_AUDIT.md). Las seis variantes producen solo dos perfiles de intervenciones francesas; opciones y respuestas son iguales. El selector penaliza IDs, no perfiles equivalentes. Esta limitación explica preguntas iguales aun con distinto personaje. Se añadieron pruebas del contenido recibido por la pantalla y se conservó la lógica original. La diversidad de IDs de la simulación no debe interpretarse como seis conversaciones distintas.

## Alcance y arquitectura

Motor TypeScript puro en `src/domain/variety/`, sin React Native, dependencias de la cafetería, red, IA, reloj interno ni servicios. `models.ts` define candidatos con IDs estables, contexto, categoría, objetivos, idioma en/fr, CEFR A1–C2, prerrequisitos, región opcional, referencia opcional a error registrado, clasificación de contenido, historial, pesos, RNG y decisión explicable. No existen todavía un Humor Engine completo, voces, misiones profesionales o consentimiento adulto.

`selection.ts` recibe candidatos, contexto, historial, RNG y política. Devuelve ID elegido o `no-eligible-content`, pesos de elegibles, motivos de exclusión y muestra aleatoria. No inventa una alternativa si ninguna es segura. IDs, metadatos, pesos y salida RNG se validan. Etiquetas únicas, máximo 64; prerrequisitos hasta 256. El material explícito requiere allowExplicit exactamente true; la cafetería fija false. Ese flag es una restricción técnica, no un flujo ni registro de consentimiento.

## Algoritmo

Antes de sortear se excluyen candidatos con idioma/categoría distintos, nivel superior, objetivos incompletos, prerrequisitos no disponibles, región incompatible, contenido explícito no habilitado o referencia a un error no registrado en el mismo idioma/ámbito/objetivo.

Los candidatos restantes reciben:

```text
peso = pesoBase × frecuencia × recencia × relevancia × ajusteNivel
frecuencia = 1 / (1 + aparicionesRetenidas)^0.5
recencia = max(0.08, min(1, sesionesDesdeÚltima / 4))
relevancia = 1 + 0.5 × etiquetasContextualesCoincidentes
ajusteNivel = 1 / (1 + distanciaDeNivelHaciaAbajo)
```

Un candidato nuevo tiene frecuencia/recencia 1. Peso base positivo, hasta 100. La recencia usa sesiones, no días; se conserva una fecha para auditoría cuando se conoce. La distancia de nivel evita que un repaso inferior domine alternativas del nivel actual; los objetivos y prerrequisitos siempre mandan. Para la cafetería, todas las variantes cubren los mismos ocho objetivos, enseñan las expresiones dentro del recorrido y no exigen vocabulario previo inferido.

Se suma el peso válido y se toma una muestra acumulada con RNG en [0,1). Las penalizaciones son graduales: repetir siempre tiene probabilidad positiva. No se elimina contenido por haberse usado ya; una biblioteca de un candidato sigue funcionando indefinidamente hasta el límite técnico del contador de sesiones. Esto permite repaso; no constituye un plan completo de repetición espaciada.

El RNG es inyectable. `seededRandom` implementa Mulberry32 para pruebas y simulación reproducibles. La integración usa una semilla del reloj y contador de sesión, sin Math.random ni requisitos de criptografía/dependencias. No es un RNG de seguridad ni promete impredecibilidad absoluta. Reanudar no llama al selector: restaura el ID persistido.

## Memoria y persistencia

`history.ts` mantiene historial v1 con estadísticas LRU de hasta 256 IDs, los últimos 64 eventos de presentación y 64 hechos agregados de error. Cada estadística contiene frecuencia, última sesión/fecha y contexto educativo mínimo (categoría, idioma, CEFR, objetivos, ámbito y variante). Los contadores se saturan en 1 000 000 000; al alcanzar ese límite de sesiones se informa error en vez de desbordar. Podar elimina memoria antigua deliberadamente: no es frecuencia vitalicia exacta.

No se añaden respuestas libres, nombres personales, ubicaciones reales ni audio al historial de Variety. El progreso de Learning conserva sus eventos de respuesta como antes; Variety solo extrae IDs y hechos mínimos. Los errores se registran exclusivamente al reproducir respuestas y obtener incorrecto del evaluador real, no por inferencia de pronunciación. Las funciones públicas validan identidades y fechas. Los futuros entrenadores/reacciones pueden usar errorRef, región, categoría y objetivos; deben conservar esta evidencia y el consentimiento exigible antes de añadir textos.

`src/domain/learning/variety.ts` adapta una lección al motor genérico. Iniciar registra selección y entrada de escena; continuar registra la siguiente escena; reintentar una pregunta no suma otra presentación de la escena; una respuesta incorrecta sí incrementa su hecho de error. Cargar/reanudar no crea sesiones/apariciones adicionales. Son entradas comprometidas para presentación tras guardar, no telemetría que demuestre que una persona leyó el texto. Una sesión equivale a un nuevo recorrido, no a cada apertura de la aplicación.

`MissionRepository` reutiliza los adaptadores existentes y escribe atómicamente progreso e historial en UN JSON de envoltorio v2 bajo la clave existente `lingoverse.mission.fr-a1-paris-cafe.v1` (el sufijo de clave se conserva por compatibilidad de ubicación). Dentro, progress sigue siendo MissionProgress v1 y history VarietyHistory v1. La escritura conserva CAS y Web Locks existentes; memoria solo cambia tras éxito. Sin Web Locks, no se garantiza atomicidad entre pestañas que escriban simultáneamente, aunque se detectan escritores antiguos secuenciales.

Legacy LV-002: al leer un documento plano de progreso v1 se reconstruye en memoria únicamente su recorrido retenido mediante replay. Se conserva ID de variante, run, escena, eventos y feedback exactamente. No se escriben bytes durante esa lectura. Primera acción guardada escribe el envoltorio v2. No se inventan las apariciones de recorridos anteriores: se importa una sola sesión observable y las fechas desconocidas son null. Los datos de preferencias LV-001 no se tocan.

Versiones desconocidas/datos inválidos se muestran como error sin sobreescritura automática; el reinicio requiere la confirmación existente. Reiniciar un registro válido conserva estadísticas agregadas y errores mínimos, reemplazando solo el recorrido activo. El aviso de reinicio explica esto. Un registro dañado que no puede recuperarse se reemplaza solo tras esa confirmación; puede perderse su memoria irrecuperable. La envoltura tiene límite de un millón de caracteres. No hay migración de regreso a una app LV-002 antigua: conservar backup si se pretende hacer downgrade.

## Contenido integrado

Seis variantes de cafetería: matin-lucie, midi-samir, pluie-camille, carnet-alex, balade-noemie y lecture-hugo. Las dos originales permanecen intactas; las cuatro nuevas cambian situaciones, personaje y combinaciones de preguntas equivalentes ya enseñadas/traducidas. Ayudas, respuestas aceptadas, opciones, correcciones y ramas siguen iguales. No se barajan los pasos dependientes: las ocho interacciones conservan orden pedagógico. Café/té, aquí/para llevar y azúcar siguen cubiertos en las 48 rutas de prueba (6 × 8 decisiones).

Se sustituye la alternancia de la UI por selección ponderada; la API legacy alternateVariant se conserva como fallback y para herramientas. No hay selección dinámica a mitad de un recorrido ni cambios inesperados de corrección. Repetir una variante es legítimo, incluso después de reiniciar. Hay contenido finito; no seis cursos nuevos ni contenido infinito. Revisión docente externa y aceptación visual completa siguen pendientes.

## Simulación ejecutada

Reproducir: `npm.cmd run simulate:variety`. No descarga herramientas. Compila el núcleo, usa repositorios sobre memoria de prueba y completa 1000 misiones con ocho interacciones; inserta un error real en la pregunta del precio cada décima misión, restaura el repositorio cada 25 sesiones y repite toda la simulación para exigir resultados idénticos. También ejecuta 1000 selecciones con biblioteca de un candidato y prueba una biblioteca vacía.

Resultados con semilla 903, guardados en `docs/LV-003_SIMULATION.json`:

| Variante | Apariciones |
| --- | ---: |
| matin-lucie | 164 |
| midi-samir | 162 |
| pluie-camille | 162 |
| carnet-alex | 173 |
| balade-noemie | 166 |
| lecture-hugo | 173 |

- 52 repeticiones consecutivas sobre 999 transiciones: 5.21%; mayor racha 2.
- Referencia uniforme independiente con igual semilla: 185 repeticiones, 18.52%. Es una comparación controlada de esta semilla, no una garantía estadística para cualquier biblioteca/usuario.
- Se usaron las seis variantes en las primeras 9 sesiones. Después de agotarlas la selección continúa permitiendo repasos, sin bloquear la aventura.
- Un solo candidato: 1000 selecciones válidas y 999 repeticiones; biblioteca vacía devuelve no-eligible-content.
- Historial final: 66 estadísticas, 64 eventos recientes, 1 hecho con 100 errores realmente evaluados en prix. Registro conjunto: 21844 caracteres.

Estas son sesiones simuladas, no observaciones de personas, pruebas de aprendizaje o mediciones del navegador/SQLite real.

## Validación y pasos manuales

Ejecutar `npm.cmd test`, ambos typechecks, lint, export:web y simulate:variety. Las pruebas cubren selección/contexto/RNG, historia acotada, errores reales, migración, conflictos/cuota, reanudación y las ocho interacciones por todas las ramas. Consultar PROJECT_STATE para resultados efectivos y comprobaciones remotas bloqueadas.

1. `npm.cmd run web` y abrir la aventura desde Inicio/Explorar. Completar o reiniciar varias veces, anotando personajes/escenas. Se favorece variedad pero puede repetirse una variante; no exigir una secuencia fija.
2. Antes de recargar, anotar personaje, escena, respuesta enviada y feedback. Recargar/reabrir debe conservarlos sin nuevo sorteo. La selección solo cambia al confirmar un nuevo recorrido.
3. Con un perfil de prueba que tenga progreso plano v1 de LV-002, abrir la misión: debe reanudar igual sin escribir al cargar; una acción guardada genera envoltura v2. No editar/borrar datos personales de un perfil habitual.
4. Fallar un ejercicio, corregirlo y confirmar un reinicio: el contador del nuevo recorrido se reinicia, pero el resumen agregado conserva el hecho detectado; ningún acierto nuevo se convierte en error de pronunciación.
5. Comprobar fallos de almacenamiento y dos pestañas como en LV-002_MANUAL_TEST: error sin avance ficticio, conflicto exige releer y un fallo no actualiza solo una mitad del estado.
6. Revisar móvil, teclado y lector; Android/iOS y aceptación visual completa siguen sin evidencia de ejecución. El intento Chromium local falló antes de navegar con GPU process isn't usable / Page.enable timeout; no hay captura aprobada.
