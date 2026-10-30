# Roast Me — LV-004B

## Flujo y alcance

Explorar → Modo Sin Pena → Conocer Roast Me → información de humor intenso → dos casillas sin marcar (mayoría de edad y aceptación explícita) → guardar consentimiento → comenzar/reanudar. Rechazar vuelve a Explorar, con aprendizaje normal disponible. Perfil y la propia aventura permiten revocar. Solo hay acceso funcional a Roast Me: no se implementaron Mamá de LATAM ni botones para modos inexistentes.

El paquete `roast-cafe-fr-a1`, versión educativa 2, reutiliza por referencia las seis variantes francesas v2 de cafetería, sus ocho objetivos y sus ramas café/té, aquí/para llevar y azúcar. No se cambian respuestas, textos pedagógicos ni evaluaciones. No es una misión francesa nueva ni un nuevo nivel certificado: es otro contexto de acompañamiento para practicar el mismo contenido versionado. Traducciones, enseñanza y ayudas siguen visibles. No hay evaluación de pronunciación o audio.

## Consentimiento y revocación

Se reutiliza `HumorPreferences` v1 y `grantAdultConsent`: `adult.enabled`, consentimiento versión 1, `adultConfirmed`, `explicitlyAgreed` y fecha de aceptación. No se almacena fecha de nacimiento. Ninguna confirmación individual basta. El acceso valida el objeto completo; cambiar la intensidad o habilitar/deshabilitar humor amistoso no habilita Roast Me. Su habilitación es independiente del interruptor amistoso.

La activación se muestra solo tras guardar. La revocación oculta el contenido inmediatamente antes de escribir y desmonta la misión adulta. Si falla la escritura, se mantiene oculto durante esta sesión incluso al releer; se informa que se debe reintentar antes de cerrar. No se promete revocación durable si el dispositivo rechaza la escritura. Una nueva aceptación explícita guardada permite volver a acceder. Progreso y snapshot permanecen almacenados localmente: revocar no elimina la partida, pero bloquea su exposición. Volver a consentir permite reanudar.

Se refrescan ajustes al recibir cambios de localStorage de otra ventana, al volver al foco en web y al reactivar la app nativa. Durante la lectura o si falla, se bloquea el modo. El repositorio comprueba el consentimiento persistido antes de preparar y antes de escribir una acción adulta, impidiendo continuar con un ajuste local obsoleto tras una revocación ya guardada. No hay transacción única entre dos claves distintas ni garantía de atomicidad entre procesos nativos; Web Locks y comparación de escrituras conservan sus límites anteriores. El consentimiento es una declaración del usuario, no verificación externa de edad.

## Motores y presentación

`roastLesson` usa Learning Engine y grafo de diálogo existentes. `MissionProvider` admite una instancia Roast con el mismo contrato y un `MissionRepository` separado. No existe un Progress Engine independiente en este repositorio: se reutilizan eventos y objetivos completados de `MissionProgress`.

Persistencia atómica de progreso, historia y snapshot en envelope v3, clave `lingoverse.mission.roast-cafe-fr-a1.v1`. La clave de cafetería original y sus lectores v1/v2/v3 no cambian. Recargar restaura el texto por ID/version/evento y no vuelve a sortear. Snapshot incompatible: fallback educativo, sin perder progreso. Lectura/escritura fallidas no aparentan avance.

Humor Engine recibe modo explícito `roast` solo en el repositorio adulto. Biblioteca separada `roastHumor.ts`: 96 líneas completas, cuatro regiones × ocho categorías × tres alternativas. Todas se marcan explícitas conservadoramente, aunque algunas no incluyan groserías. No se concatenan fragmentos. La selección normal no admite líneas Roast. Región, nivel A1, idioma, categoría, intentos y errores se verifican antes de delegar al Variety Engine.

Mapeo editorial: `error` = errores iniciales; `retry` = reintento; `recurring` = errores repetidos y bromas recurrentes con evidencia; `recovery` = acierto después de error; `correct` = acierto con sorpresa editorial, sin afirmar suerte ni historial falso; `progress` = avance confirmado y próximo desafío; `celebration` = ocho objetivos completos; `general` = fallback. La recurrencia requiere tres errores registrados del mismo objetivo y ámbito; recuperación exige errores del ejercicio actual. No se inventan recuerdos, rasgos personales ni pronunciación.

Variety Engine conserva pesos de frecuencia y recencia entre sesiones. Para Roast se reduce a 0,05 el peso base de la última línea del mismo pool contextual presente en las 64 apariciones recientes, cuando hay alternativas; no se duplica su algoritmo. El peso sigue positivo y una biblioteca de un solo candidato sigue funcionando. Se permiten repeticiones, no se garantiza contenido infinito. La memoria de progreso anterior es la de los recorridos Roast guardados, no dominio supuesto del idioma.

El bloque unificado de UI-02 contiene identidad, resultado, explicación/corrección completas y comentario. Continuar queda después; reintentar y confirmar reinicio mantienen sus funciones. Si faltan preferencias/snapshot compatible se usa feedback educativo sin contenedor adulto. La ruta entera es inaccesible sin consentimiento válido.

## Ejemplos reales

| Entrenador | Reacción editorial incluida |
| --- | --- |
| Luz, El Salvador | «¡Puta, maje! Esa respuesta agarró otro bus. Mirá la corrección antes de subirte otra vez.» |
| Toño, México | «¡Ahora sí, cabrón! Usaste la corrección y la pieza dejó de bailar.» |
| Vale, Colombia | «No joda, la respuesta volvió por el mismo atajo. Cambiemos de camino con la ayuda.» |
| Romi, Argentina | «¡Terminaste, carajo! Ocho interacciones; no salgamos a imprimir un doctorado.» |

Son voces editoriales individuales, no representaciones de toda una región. Falta revisión cultural/docente externa y prueba de percepción con adultos voluntarios.

## QA manual web y Android

1. Ejecutar `npm.cmd run web`. En un perfil de prueba, abrir directamente `/roast`: sin completar onboarding debe redirigir. Después seleccionar francés y región; Explorar ofrece el acceso a Modo Sin Pena.
2. Sin consentimiento, comprobar que no se expone lenguaje vulgar ni misión. Marcar cada casilla por separado: entrar sigue deshabilitado. Rechazar vuelve al aprendizaje normal. Cambiar intensidad amistosa no activa el modo.
3. Aceptar ambas y entrar. Probar acierto, error, segundo error, tercer error y recuperación: una burbuja con corrección intacta y reacción contextual antes de continuar. Repetir con las cuatro regiones.
4. Recargar con feedback visible y al finalizar: mismos progreso y texto. Completar ocho pasos, confirmar/cancelar reinicio y verificar que la cafetería normal mantiene su partida.
5. Revocar dentro de la aventura y desde Perfil: ocultación inmediata, acceso bloqueado. Repetir con dos pestañas. Denegar escritura en perfil descartable: la revocación queda oculta en la sesión y se explica el fallo durable; reintentar al recuperar almacenamiento. Nunca usar datos personales para pruebas de corrupción/cuota.
6. A 320 px y escritorio, teclado, zoom 200 %, lector, texto largo y orientación: sin cortes, scroll horizontal ni foco perdido. No se introducen animaciones ni scroll automático. Comprobar reduced motion y safe areas.
7. Android: `npm.cmd start` y abrir en Expo Go compatible con SDK 57, o `npm.cmd run android` con entorno local configurado. Terminar/reabrir app y comprobar SQLite, consentimiento y snapshot. Safari/iOS requieren dispositivo compatible; Windows no proporciona simulador iOS.

Las pruebas de renderizado usan primitivas sustituidas y no certifican layout real. No se ha aprobado visualmente Roast Me en navegador o dispositivos. El intento Chromium anterior terminó por GPU/CDP antes de cargar la interfaz.

## Reproducción técnica

`npm.cmd test`, `npm.cmd run typecheck:core`, `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run export:web`; simulación: `node scripts/simulate-roast.mjs`. Esta última compila núcleo, completa 1000 recorridos, comprueba relevancia y 40 reanudaciones, y repite la simulación exigiendo resultados idénticos con semilla 40402. Informe detallado en `LV-004B_SIMULATION.json`; resultados efectivos en `PROJECT_STATE.md`.
