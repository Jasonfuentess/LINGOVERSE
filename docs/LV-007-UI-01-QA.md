# LV-007-UI-01 — Entrega y guía de validación

## Estado

Rediseño implementado; **aceptación visual y funcional manual pendiente**. Fuente única: `D:\Documents\Jason\LingoVerse\LingoVerse Main\LingoVerse-Codex-Inicio`. Sin uso de la carpeta antigua, sin borrado de archivos y sin operaciones Git de escritura ni publicación. LV-007B no implementada.

La validación previa **10/10 de LV-006B en Chrome fue reportada por el usuario**. No corresponde a ejecución de Codex ni valida este rediseño. El baseline real de esta copia fue **166/166**, frente a 174 históricas; faltan 8 pruebas LV-007A documentadas y dos documentos, aunque el código de continuidad/audio está presente. Ver `PROJECT_STATE.md`.

## Qué cambió

- Inicio: portada de aventura priorizada según idioma y avance francés activo; progreso auténtico, destinos ilustrados y acceso a Roast Me. La portada se divide en imagen/contenido en escritorio y se apila en móvil.
- Explorar: colección responsive de las tres aventuras, portadas con idioma/A1 y estado real, acceso diferenciado a Modo Sin Pena.
- Conversación: escenario pictórico compacto de 120 px, NPC con retrato de 72 px y nombre, burbujas legibles, selección marcada, respuesta escrita, ayudas y controles diferenciados. Continúa el puente del último intercambio y audio de modelos verificados de LV-007A.
- Estados: reproducción real en jade, micrófono activo cálido, transcripción lista en verde; guardado anunciado; acierto jade, reintento ámbar e incertidumbre azul con «Aún no podemos verificarla». No se añadió una espera ni evaluación simulada.
- Entrenadores: identidad regional conservada, retratos de mayor tamaño y feedback integrado. Perfil incorpora selector de entrenadores con retratos y controles reales de voz, eliminando afirmaciones estáticas que podían contradecir ajustes actuales.
- Practicar: acceso a práctica y resúmenes de aventuras existentes. Trabajo: pantalla explícita de disponibilidad futura; no simula misiones profesionales. Navegación persistente de cinco secciones en pantallas principales; dentro de la aventura se conserva volver a Explorar, sin competir con el teclado.
- Roast Me: presentación propia en vino/terracota, entrenadores y entrada con consentimiento existente. No se modificaron controles de consentimiento/revocación ni modelos guardados.
- Arte: cuatro ambientes consistentes y trece retratos NPC adicionales en dos atlas locales originales. No se sustituyen ni eliminan recursos anteriores. Sin dependencias nuevas, servicios ni cambios en contenido o motores educativos.

## Comprobaciones de Codex

| Comando | Resultado |
|---|---|
| `npm.cmd test` antes del rediseño | 166/166 PASS |
| `npm.cmd test` tras primera fase | 166/166 PASS |
| `npm.cmd test` final | 166/166 PASS |
| `npm.cmd run typecheck:core` | PASS |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run lint` | PASS, sin advertencias |
| `npm.cmd run export:web` | PASS, exportación local en `dist/` |
| `node --check scripts/check-premium.mjs` | PASS sintáctico |
| `node scripts/check-web.mjs --browser 'C:/Program Files/Google/Chrome/Application/chrome.exe'` | FAIL antes de cargar: GPU no utilizable y timeout CDP `Page.enable` |
| Verificador premium, antes/después, con render GPU en el proceso de Chrome | FAIL antes de cargar: timeout CDP `Page.enable`; no acredita recorridos, layout ni audio |

Incidencias de implementación corregidas: nombre de entrenador potencialmente ausente en TypeScript; dos imports sin uso; acentos dañados en texto nuevo y claves de retratos; recorte del atlas que podía mostrar una celda vecina en móvil; salto de línea literal. Una ejecución dio 165/166 porque una comprobación existente exige que Explorar declare explícitamente la tarjeta rendez-vous; se conservó esa declaración y se limitó el contenedor responsive a composición visual. Suite final 166/166 sin modificar tests existentes.

Revisión independiente de código realizada y hallazgos corregidos. Esta revisión no equivale a probar layout. Logs locales `lv007-ui01-baseline-*.log`, `lv007-ui01-phase1-*.log`, `lv007-ui01-final-*.log`, `lv007-ui01-before-browser.log` y `lv007-ui01-after-browser.log`. No hay capturas reales antes/después: Chrome no llegó a cargar el producto; las carpetas `.web-check/premium-before` y `premium-after` pueden contener perfiles de prueba, no evidencia de aprobación. Android, iOS, Safari, lector de pantalla, voz física y micrófono real pendientes.

## Cómo abrir la aplicación

En PowerShell normal, desde la fuente definitiva:

```powershell
Set-Location -LiteralPath 'D:\Documents\Jason\LingoVerse\LingoVerse Main\LingoVerse-Codex-Inicio'
npm.cmd run web
```

Abrí la dirección local indicada por Expo. Para comprobar reanudación usá el mismo origen/puerto y el perfil de Chrome donde guardaste el progreso: localStorage se separa por origen. Para pruebas que impliquen reinicio o consentimiento, preferí un perfil de prueba separado. No hace falta borrar almacenamiento ni partidas.

## Checklist manual del rediseño

Registrar cada fila como PASS/FAIL/NO EJECUTADO, incluyendo ancho, aventura/variante, comportamiento esperado/observado y captura si hay defecto. Repetir controles de layout a **320, 390 y 1280 px** en DevTools, con altura aproximada 844–900 px y zoom 100%; luego repetir los puntos críticos a 200% o con fuente ampliada.

| # | Acción | Resultado esperado |
|---|---|---|
| 1 | Abrir Inicio con el progreso existente | Portada ilustrada, textos legibles, datos reales y botón para abrir/continuar/revisar. No cambia ni reinicia partidas. |
| 2 | Revisar Inicio/Explorar en 320/390/1280 px | Sin scroll horizontal, atlas sin escenas vecinas, nombres/botones completos. Destinos en columnas cuando hay espacio. Portada en dos columnas en escritorio. |
| 3 | Navegar Inicio → Explorar → Practicar → Trabajo → Perfil y usar Atrás | Cinco accesos reales y selección visible. Trabajo declara falta de misiones. Practicar abre aventuras reales, sin inventar estadísticas. |
| 4 | Entrar al café, Londres y rendez-vous | Se conserva cada progreso por separado; idioma, NPC y fondo corresponden. Los personajes nuevos tienen retratos, incluidos Inès, Émile y Zoé cuando aparezcan. |
| 5 | Continuar un turno ya empezado | Escenario compacto; diálogo, retrato y respuesta accesibles sin un fondo desproporcionado. No aparecen personajes o respuestas de una rama futura. |
| 6 | Antes de responder, pedir pista; abrir/cerrar traducción y expresiones | Ayuda progresiva; no revela traducción completa al primer render. Los botones conservan estado expandido. |
| 7 | Elegir una respuesta, enviar un error conocido y después acertar | Selección reconocible sin depender solo del color. Corrección educativa completa, reintento ámbar y acierto jade. El feedback largo no queda recortado. |
| 8 | En un turno escrito, enviar texto fuera del catálogo | Incertidumbre explícita «Aún no podemos verificarla», sin fingir diagnóstico o comprensión ilimitada. Reintento sigue disponible. |
| 9 | Escribir con teclado virtual; cambiar a ancho320 y ventana baja | Campo enfocado y acción alcanzables mediante scroll. No se pierde el texto. No se fuerza desplazamiento mientras se lee una explicación. |
| 10 | Activar audio y reproducir NPC, modelo verificado y entrenador | Francés/inglés según aventura y español para entrenador; estado de reproducción visible; repetir/detener/silenciar funcionan. Ausencia de voz se comunica y permite seguir por texto. Ninguna reproducción automática. |
| 11 | Activar micrófono, hablar, terminar, editar y usar transcripción | Estado activo visible; transcripción revisable antes de comprobar. No se envía sola ni se atribuye puntuación de pronunciación. Denegar/cancelar mantiene teclado/opciones. Probar también reproducción mientras escucha. |
| 12 | Acertar y continuar; salir/recargar a mitad del recorrido | Puente LV-007A solo del último intercambio completado. Reanudación exacta; modelo de respuesta audible solo si verificado, nunca un intento incorrecto privado. |
| 13 | Completar las tres aventuras en perfil de prueba | 8/8 café, 9/9 Londres, 10/10 rendez-vous; resumen con expresiones de la ruta vivida. Recarga conserva final. Cancelar reinicio conserva progreso; confirmar afecta solo esa aventura. |
| 14 | En Perfil elegir cada entrenador y guardar; volver a aventura | Luz/Toño/Vale/Romi y región correctos; cambios efectivos tras guardar; contenido educativo intacto. Controles de voz reflejan ajustes reales. |
| 15 | Abrir Roast Me con consentimiento desactivado | Dos casillas sin marcar y entrada bloqueada. Rechazar vuelve a Explorar sin activar humor adulto. La presentación intensa no implica consentimiento. |
| 16 | Solo si querés probar modo adulto, aceptar ambas casillas en perfil de prueba; después revocar | Entra tras guardado real. Humor regional y explicación visibles, voz opt-in. Revocar sale del modo y detiene acceso adulto; recargar no reactiva consentimiento. |
| 17 | Navegar con Tab/Shift+Tab/Enter/Espacio y lector de pantalla | Foco perceptible, nombres y estados seleccionados/expandidos/disabled anunciados; retratos decorativos no duplican el nombre. No hay controles inaccesibles por icono solo. |
| 18 | Activar movimiento reducido y fuente ampliada | Contenido visible, sin demora ni entrada animada obligatoria; navegación y correcciones se pueden leer completas, sin solaparse. |

Las voces y el reconocimiento dependen del navegador/dispositivo. Anotar voces disponibles, permiso concedido/denegado y si fue necesaria conexión; no confundir transcripción con evaluación acústica.

## Capturas y verificador preparado

Guardar capturas reales de Inicio, Explorar, primer diálogo, respuesta, error, incertidumbre, acierto, transcripción, Roast Me y Perfil en los tres anchos. Se conserva el código viejo de `scripts/check-web.mjs`; sus expectativas de textos son históricas. Para el rediseño usar el nuevo verificador:

```powershell
npm.cmd test
npm.cmd run export:web
node scripts/check-premium.mjs --browser 'C:/Program Files/Google/Chrome/Application/chrome.exe'
```

Usa servidor efímero y perfil aislado en `.web-check/premium-after`, prueba recorridos con respuestas editoriales reales y reanudación/cancelación de reinicio, y toma capturas si Chrome carga. No activa micrófono ni concede consentimiento adulto, no toca el perfil de Chrome del usuario y no acredita audio físico. `--in-process-gpu` fue una variante de renderizado local ensayada sin desactivar sandbox; también falló en este entorno. La opción `--before` es útil únicamente con una exportación previa conservada; la exportación actual ya es la rediseñada.

## Archivos y recursos

**Nuevos:** `tasks/LV-007-UI-01.md`, esta guía, `docs/LV-007-UI-01-DESIGN.md`, `src/components/Editorial.tsx`, `src/components/Navigation.tsx`, `app/practice.tsx`, `app/work.tsx`, `scripts/check-premium.mjs`, `assets/adventure/atlas-ui01.jpg`, `assets/adventure/characters-ui01.jpg`.

**Modificados:** `app/index.tsx`, `app/explore.tsx`, `app/profile.tsx`, `app/roast.tsx`; `src/theme/tokens.ts`, `src/components/ui.tsx`, `src/components/AdventureArt.tsx`; `src/features/learning/MissionCard.tsx`, `Conversation.tsx`, `ExerciseView.tsx`, `EducationalFeedback.tsx`; `src/features/humor/CoachCharacter.tsx`, `CoachReaction.tsx`; `src/features/preferences/PreferencesForm.tsx`; `src/features/voice/VoiceControls.tsx`, `SpeechInput.tsx`; `docs/PROJECT_STATE.md`, `docs/HANDOFF_TO_CODEX.md`, `docs/DESIGN_SYSTEM.md`, `docs/LV-006B-ADVENTURE-AND-QA.md`, `tasks/LV-006B.md`, `assets/adventure/README.md`.

Sin cambios en dependencias, contenido versionado, repositorios, claves, motores, reconocimiento, controladores de voz, archivos de pruebas ni rutas existentes. `dist/`, logs y perfiles son artefactos locales de comprobación.

## Siguiente paso

Validar este checklist y corregir hallazgos de layout/audio/teclado antes de considerar aceptado LV-007-UI-01. Definir con el usuario recuperación segura de Git por separado. Mantener LV-007B, diario/pasaporte, nuevas aventuras y sistemas profesionales fuera de implementación hasta nueva instrucción.
