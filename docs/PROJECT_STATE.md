# Estado del proyecto

Actualizado: 2026-10-28 (America/Denver). Alcance actual: LV-002. LV-003 no iniciada.

## LV-002 — implementación y evidencia actual

**Implementación disponible; aceptación de interfaz pendiente.** Al empezar LV-002 ya existían node_modules y package-lock.json instalados fuera de la sesión previa. Se conservaron dependencias/lockfile y se verificó que Expo es 57.0.31, React/DOM 19.2.3, React Native 0.86.3, Web 0.21.4 y TS 6.0.3. El historial LV-001B siguiente describe una situación anterior, no la disponibilidad actual. Git sigue sin inicializar (`fatal: not a git repository`); se inspeccionaron los archivos existentes y se preservaron especificaciones y funcionalidades.

### Funcionalidad implementada

- Learning Engine puro: contratos TS de lección, variante, ejercicio de selección/texto, respuesta, evaluación, eventos y progreso; evaluación normalizada y determinista sin voz/IA/servicios.
- Paquete v1 `fr-a1-paris-cafe`, dos variantes: mañana/Lucie y mediodía/Samir. Diez nodos por variante, ocho interacciones educativas por cada recorrido; cinco de selección contextual y tres de escritura, con enseñanza antes de responder y alternativas correctas.
- Saludo → pedido café/té → sur place/à emporter → aceptar/rechazar azúcar → preguntar precio → comprender tres euros → agradecer → despedirse. Las ramas cambian confirmaciones/escenas/réplicas y se reúnen sin omitir objetivos. Precio ficticio identificado como parte de la historia.
- Validador: esquema, IDs, referencias, opciones, ciclos, nodos inalcanzables y todos los objetivos en orden por cada ruta. Las dos variantes mantienen las mismas ayudas/respuestas; selector sustituible por futuro Variety Engine. Alternancia simple y persistente por recorrido, sin fingir variedad contextual aleatoria.
- Feedback educativo de errores sin avance; aciertos requieren Continuar para leer la réplica. Contadores basados en eventos guardados, sin XP, nivel global o dominio CEFR inventado.
- Inicio y Explorar abren/continúan la misión; si la preferencia es inglés se informa que esta misión es francesa sin cambiar el perfil. Pantalla de misión con texto accesible, radio, controles de envío, feedback, resultado y reinicio confirmado.
- Repositorio de misión independiente sobre KeyValueStorage existente, web localStorage/nativo SQLite por resolución Metro. Persiste variante, intentos, decisiones, escena y feedback antes de actualizar UI. Valida por reproducción; errores no sobreescriben avance. Datos dañados se conservan hasta confirmar reinicio. Reiniciar reemplaza el último recorrido, sin borrar preferencias ni aparentar historial acumulado.
- Corrección del fallo de lint preexistente en hidratación de preferencias: estado inicial aplicado desde callbacks asíncronos, con cancelación al desmontar. No se desactivó la regla ni se cambió el comportamiento de preferencias.

### Evidencia ejecutada

| Comando/comprobación | Resultado real |
| --- | --- |
| Baseline `npm.cmd test` | 9/9 PASS antes de cambios |
| Baseline `npm.cmd run typecheck` | PASS |
| Baseline `npm.cmd run lint` | FAIL, react-hooks/set-state-in-effect en PreferencesProvider; corregido |
| Pruebas nuevas antes de implementar | Primero módulo ausente y luego funciones placeholder Not implemented; fallos observados antes de implementar evaluación/transiciones/repositorio |
| `npm.cmd test` | 23/23 PASS (9 preferencias + 14 aprendizaje/persistencia) |
| `npm.cmd run typecheck:core` | PASS |
| `npm.cmd run typecheck` | PASS, incluye rutas/UI/adaptadores |
| `npm.cmd run lint` | PASS, sin suprimir reglas |
| `npm.cmd run export:web` | PASS, bundle Metro y dist generados localmente; warning NO_COLOR/FORCE_COLOR, no error de compilación |
| `npm.cmd run check:expo` con red | FAIL, AggregateError EACCES al conectar |
| `$env:EXPO_OFFLINE='1'; npm.cmd run check:expo` | PASS: Dependencies are up to date; advierte que validación offline es menos fiable, no equivale a verificación remota |
| `npm.cmd --cache .npm-cache --fetch-retries=0 --fetch-timeout=15000 run check:doctor` | 19/21 checks; exit 1. Fallan esquema de app.json (fetch EACCES 34.110.201.56:443) y metadatos React Native Directory (unexpected server response). Warning: Could not fetch bundled native modules. No se presentan como problemas de esquema confirmados ni aprobación completa |
| `$env:EXPO_OFFLINE='1'; npm.cmd run web -- --host localhost --port 8083` | Servidor iniciado; Invoke-WebRequest http://localhost:8083 devolvió HTTP 200 y raíz HTML |
| `npm.cmd run test:web` con Chromium local 156.0.8078.4 | FAIL antes de cargar UI: Page.enable timeout; GPU process exited -1073741790, GPU process isn't usable. Se probó también sin aceleración GPU y falló igual. No captura ni aceptación visual |

Los 14 tests del aprendizaje cubren las 16 combinaciones variante/bebida/lugar/azúcar, ocho objetivos por ruta, preguntas escritas alternativas, acentos/apóstrofos, feedback sin avance, confirmación de aciertos, selector inyectable, contenido inválido, replay que rechaza finalización incoherente, cuota/datos dañados, preferencias preservadas, restauración de feedback/finalización entre repositorios y conflictos de escritores. Usan adaptador Storage simulado y memoria de prueba; no certifican SQLite real ni recarga del navegador.

Revisión independiente de código: ningún Critical; detectó Important de sobreescritura desde otra pestaña con avance antiguo. Se reprodujo mediante dos tests (21 PASS / 2 FAIL), se añadió instantánea esperada y serialización con Web Locks en web cuando existe, y luego la suite pasó 23/23. La UI muestra conflicto y exige releer antes de continuar. Repositorio requiere load antes de save. También se muestra la respuesta guardada en el feedback para entenderlo tras restaurar. El script de navegador no debe confundirse con cobertura visual aprobada: fue bloqueado antes de la navegación. Limitación explícita: sin Web Locks no hay garantía de atomicidad simultánea entre pestañas/procesos, aunque se detectan escrituras antiguas secuenciales; pendiente validación real multi pestaña.

Un intento inicial de arranque con `--offline --host localhost` fue rechazado por Expo porque esos flags son excluyentes; se corrigió usando EXPO_OFFLINE en el proceso y solo --host. No se cambió configuración global. Logs locales ignorados: `lv002-export.log`, `lv002-doctor.log`, `lv002-browser.log`, `lv002-browser-software.log`. La comprobación opcional de navegador crea perfiles nuevos en `.web-check/` y cierra sus procesos; no borra datos de usuario ni desactiva controles de seguridad.

### Archivos

Nuevos: `tasks/LV-002.md`, `docs/LV-002_PLAN.md`, `docs/LEARNING_ENGINE.md`, `docs/CONTENT_MODEL.md`, `docs/LV-002_MANUAL_TEST.md`; `src/domain/learning/models.ts`, `engine.ts`, `validation.ts`; `src/content/cafe.ts`; `src/storage/missionRepository.ts`; `src/features/learning/MissionProvider.tsx`, `MissionCard.tsx`, `MissionScreen.tsx`, `ExerciseView.tsx`; `app/explore.tsx`, `app/mission.tsx`; `tests/learning.test.cjs`; `scripts/check-web.mjs`.

Modificados: `app/index.tsx`, `app/_layout.tsx`, `src/features/preferences/PreferencesProvider.tsx`, `src/storage/contracts.ts`, `src/storage/browserStorage.ts`, `tsconfig.core.json`, `scripts/test.mjs`, `package.json` (solo script test:web), `.gitignore` (artefactos de navegador), `README.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT_STATE.md`. No se modificaron dependencias ni package-lock.json. Sin push, deploy, cuentas, servicios externos ni gasto. Sin LV-003 ni motores completos de humor/voz.

### Pendientes y límites

La evidencia permite afirmar que núcleo, tipos, lint y compilación web pasan; **no que la experiencia de interfaz esté aceptada en plataforma real**. Faltan prueba manual/automatizada de onboarding y misión completa, navegación Atrás, recarga, cuota real, confirmación de reinicio, teclado virtual, tamaño 320 px, lector de pantalla y Safari; Android/iOS tampoco ejecutados. No se generó captura. Faltan las dos comprobaciones remotas de Doctor cuando haya acceso permitido a sus APIs.

Contenido editorial revisado en implementación y validado estructuralmente; revisión docente externa pendiente. Ayudas visibles, expresiones admitidas finitas y reintentos ilimitados hasta límite técnico de eventos: no es evaluación de nivel independiente ni dominio A1 certificado. Solo conserva último recorrido. Migraciones de contenido/progreso posteriores todavía no existen; versiones incompatibles se muestran como error antes de un reinicio explícito.

Reproducción local y matriz de prueba con respuestas y fallos: `docs/LV-002_MANUAL_TEST.md`. Arranque: `npm.cmd run web` → Inicio → Explorar aventuras → Abrir aventura francesa → Comenzar aventura. Continuar retoma el registro guardado; reiniciar pide confirmación y cambia a la otra variante.

## Historial anterior: LV-001B

## LV-001B — aceptación técnica actual

**NO aceptada todavía.** Se diagnosticó el punto de fallo y se estabilizó la declaración de dependencias; no fue posible instalar ni ejecutar la interfaz con los permisos/red de esta sesión. La sección de LV-001 más abajo se conserva como historial; las referencias históricas al manifest con solo Expo y al bootstrap de varias instalaciones ya no describen los archivos actuales.

### Evidencia del bloqueo

Antes de modificar: se releyeron AGENTS, README, package.json, este estado, documento maestro y LV-001; se inspeccionaron rutas, formulario, proveedor, almacenamiento, tests y configuración. `git status --short` sigue fallando porque el directorio no es repositorio; no hay diff/historial Git que comparar. No se inicializó Git ni se cambiaron las especificaciones originales.

Reproducción inicial exacta:

```powershell
npm.cmd install --cache .npm-cache --loglevel=silly --timing --fetch-retries=0 --fetch-timeout=15000 *> lv001b-install.log
$installResult = $LASTEXITCODE
Get-Content lv001b-install.log -Tail 90
```

Salida: `npm http fetch GET https://registry.npmjs.org/expo attempt 1 failed with EACCES`. Ocurre en `fetch manifest`, antes de descargar/extractar paquetes o ejecutar scripts de dependencias. Stack: `D:\Software\node_modules\npm\node_modules\minipass-fetch\lib\index.js:130:14` → `_http_client` → `onSocketNT`. Esa ruta es código que reporta el error, **no un archivo cuya escritura esté denegada**.

- Node: 22.20.0; npm: 10.9.3; Windows_NT 10.0.26220. Identidad efectiva consultada con WindowsIdentity: `DESKTOP-DCM56L8\CodexSandboxOffline`.
- Registro efectivo: `https://registry.npmjs.org/`; proxy/https-proxy: `null`; offline: `false`; strict-ssl: `true`. No se imprimieron credenciales ni contenido de archivos de usuario.
- Caché por defecto: `C:\Users\jason\AppData\Local\npm-cache`; override para las instalaciones de esta tarea: `D:\Documents\Jason\LingoVerse\LingoVerse-Codex-Inicio\.npm-cache`. La opción local evita depender de escritura fuera del workspace. No se modificó configuración global.
- Configuración consultada: npm integrado `D:\Software\node_modules\npm\npmrc` contiene solo `prefix=${APPDATA}\npm`. No existen `.npmrc` del proyecto, `C:\Users\jason\.npmrc` ni `C:\Users\jason\AppData\Roaming\npm\etc\npmrc` en esta inspección. El prefix global no es destino de esta instalación local.
- ACL del proyecto: propietario jason; caché: propietario CodexSandboxOffline; entradas de modificación para usuarios autenticados y grupo CodexSandboxUsers. Prueba real desde Node: creación, escritura y lectura exitosas de `.npm-cache/lv001b-probe-2zJAn9/write-check.txt`. No se cambiaron ACLs ni se probó escritura fuera del workspace.
- DNS resolvió direcciones IPv4 e IPv6. HTTPS independiente de npm produjo `AggregateError [EACCES]`, con errores internos `syscall: connect`, `errno: -4092`, `port: 443`; ejemplos: `connect EACCES 104.16.6.34:443` y `connect EACCES 2606:4700::6810:922:443`. El mismo endpoint falla sin npm, por lo que caché/configuración de npm no explican esta denegación de socket.
- La primera sonda intentó además `os.userInfo()` y falló con `uv_os_get_passwd ENOMEM`; se retiró esa consulta no necesaria y se repitieron independientemente escritura/DNS/HTTPS. No se interpreta ese error como evidencia de falta real de RAM ni como causa de EACCES.

Conclusión delimitada: se confirma denegación de conexión desde el proceso bajo el contexto offline y red restringida declarado por esta sesión. No es un error demostrado de permisos de archivos del proyecto. La identidad offline y la política del entorno son evidencia del bloqueo en este contexto; sin repetir en terminal normal no puede descartarse que el anfitrión imponga también una política de red ni identificarse un componente concreto de firewall/seguridad. No se solicitó elevación, no se ejecutó como administrador, no se desactivó seguridad ni se intentó evadir la restricción.

### Correcciones y versiones

Se conservó SDK 57. El manifest anterior solo declaraba Expo y dejaba herramientas sin rangos hasta bootstrap. Ahora declara todas las dependencias requeridas con rangos de la [plantilla SDK 57](https://raw.githubusercontent.com/expo/expo/sdk-57/templates/expo-template-default/package.json) y [bundledNativeModules SDK 57](https://raw.githubusercontent.com/expo/expo/sdk-57/packages/expo/bundledNativeModules.json). La [tabla oficial](https://docs.expo.dev/versions/v57.0.0/) exige Node mínimo 22.13.x, satisfecho por el instalado.

| Dependencia | Declaración actual, NO instalación verificada |
| --- | --- |
| expo | ~57.0.31 |
| react / react-dom | 19.2.3 |
| react-native | 0.86.3 |
| react-native-web | ~0.21.0 |
| expo-router | ~57.0.29 |
| @expo/metro-runtime | ~57.0.17 |
| expo-constants / expo-linking | ~57.0.22 / ~57.0.13 |
| expo-sqlite / expo-status-bar | ~57.0.4 / ~57.0.1 |
| react-native-safe-area-context / react-native-screens | ~5.7.0 / ~4.26.0 |
| typescript / @types/react | ~6.0.3 / ~19.2.2 |
| eslint-config-expo / eslint | ~57.0.2 / ^9.22.0 |

ESLint se mantiene en major 9; el mínimo escogido admite el helper `defineConfig` usado por el archivo existente. Expo config declara peer ESLint >=8.10; la compatibilidad efectiva queda sin comprobar. No se instalaron paquetes opcionales de audio, animación, servicios o contenido. La rama oficial consultada es una referencia de versiones; solo una instalación y un lockfile exitosos fijarán las resoluciones exactas.

`scripts/setup.mjs` instala el manifiesto completo y ejecuta `npm run check:expo`; no elige SDK nuevo ni añade dependencias dinámicamente. Se agregaron `check:expo`, `check:doctor` y `diagnose:npm`. El diagnóstico crea únicamente archivos nuevos en caché local y consulta DNS/HTTPS; no elimina datos ni cambia configuración.

Tras el cambio se repitió la instalación detallada en `lv001b-install-final.log`: todos los 17 manifests solicitados devolvieron EACCES; el error final corresponde a `https://registry.npmjs.org/@expo%2fmetro-runtime`. Log nativo completo: `.npm-cache/_logs/2026-10-29T02_50_09_067Z-debug-0.log`. El inicial está en `.npm-cache/_logs/2026-10-29T02_48_29_105Z-debug-0.log`. No existen `node_modules` ni `package-lock.json`; no se fabricó lockfile ni se afirma instalación exitosa.

### Comprobaciones de LV-001B

| Comando | Código de salida / resultado |
| --- | --- |
| instalación detallada con caché local | 1, EACCES en connect al registro |
| `npm.cmd run diagnose:npm` | 1: escritura y DNS OK; HTTPS EACCES |
| `npm.cmd test` | 0, 9/9 PASS con TypeScript global 6.0.3 |
| `npm.cmd run typecheck:core` | 0, PASS |
| `npm.cmd run typecheck` | 2, FAIL: 107 diagnósticos; expo/tsconfig.base y React/Expo/tipos ausentes, con errores derivados de JSX, key e inferencia |
| `npm.cmd run lint` | 1, FAIL: eslint no instalado |
| `npm.cmd run check:expo` | 1, FAIL: MODULE_NOT_FOUND de node_modules/expo/bin/cli |
| `npm.cmd --cache .npm-cache --fetch-retries=0 --fetch-timeout=15000 run check:doctor` | 1, FAIL: EACCES al obtener https://registry.npmjs.org/expo-doctor; Doctor no llegó a ejecutarse |
| `npm.cmd run web` | 1, FAIL: CLI local ausente; no servidor activo |
| `npm.cmd run export:web` | 1, FAIL: CLI local ausente; no se llegó a evaluar compatibilidad del bundle |
| `node --check` de setup, diagnose-npm, test y eslint.config.js | 0 en cada archivo; solo comprobación sintáctica JS |

Las salidas se conservaron en `lv001b-tests.log`, `lv001b-core.log`, `lv001b-typecheck.log`, `lv001b-lint.log`, `lv001b-expo.log`, `lv001b-doctor.log`, `lv001b-web.log`, `lv001b-export.log` y `lv001b-diagnose.log`. Son artefactos locales ignorados por .gitignore, no pruebas aprobadas por su mera existencia. Los mensajes NativeCommandError de PowerShell envuelven stderr de npm; los códigos anteriores son los del proceso capturados antes de leer el log.

Web visual: **pendiente**, sin aplicación arrancada ni herramienta de navegador conectada disponible. No se aprobaron onboarding, ocho combinaciones, invitado, Inicio/Perfil, Atrás, borradores, estados vacíos/errores ni persistencia tras recargar en plataforma real. README incluye procedimiento manual y reproducción de fallos en un perfil de prueba separado. Android/iOS no ejecutados en LV-001B; no se reinterpreta la prueba de almacenamiento en memoria como prueba de SQLite o navegador.

### Archivos cambiados y continuación

Modificados: `package.json`, `scripts/setup.mjs`, `README.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT_STATE.md`. Creado: `scripts/diagnose-npm.mjs`. Artefactos adicionales: logs `lv001b-*.log` y sondas de caché. No se modificaron rutas, UI, dominios, contenido, tests ni documentos originales de especificación.

En PowerShell normal, sin administrador:

```powershell
Set-Location -LiteralPath 'D:\Documents\Jason\LingoVerse\LingoVerse-Codex-Inicio'
npm.cmd run diagnose:npm
if ($LASTEXITCODE -ne 0) { throw 'Revisar el diagnóstico de escritura/DNS/HTTPS antes de continuar.' }
npm.cmd --cache .npm-cache run setup
if ($LASTEXITCODE -ne 0) { throw 'La instalación/validación falló.' }
npm.cmd test
npm.cmd run typecheck:core
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run check:expo
npm.cmd --cache .npm-cache run check:doctor
npm.cmd run export:web
npm.cmd run web
```

Registrar y resolver cada fallo antes de aceptar. Si el diagnóstico funciona fuera del sandbox, completar instalación, conservar el lockfile, comprobar versiones reales con `npm.cmd ls --depth=0` y ejecutar todas las verificaciones. Si connect EACCES persiste fuera, conservar la evidencia y revisar con el responsable del anfitrión la política de red; no recomendar administrador, cambios globales de permisos ni desactivar controles. El simple cambio de caché no puede corregir connect EACCES. LV-002 permanece fuera de alcance hasta aceptar esta base.

## Historial de LV-001

## Resultado actual

Código de base preparado, **LV-001 todavía no cumple todos sus criterios de aceptación**: faltan instalación efectiva, compilación, lint/typecheck completos y ejecución de plataformas. No declarar esta entrega como aplicación probada. No se hicieron push, deploy, commits, cuentas, contrataciones ni gastos.

## Inspección previa

- Directorio inicial: AGENTS.md, COMENZAR_AQUI.md, docs/MASTER_PROMPT.md, tasks/LV-001.md; sin código ni Git (`git status --short`: fatal, no es repositorio).
- Se leyeron los cuatro documentos originales y se preservaron sin modificaciones.
- Windows/PowerShell, Node 22.20.0, npm 10.9.3, TypeScript global 6.0.3, Git disponible, Java 11.0.19.7.
- Android SDK presente en `%LOCALAPPDATA%/Android/Sdk` pero adb fuera de PATH. Invocado por ruta absoluta: no pudo iniciar daemon (`could not read ok from ADB Server`). AVDs listados: Pixel_5_API_30, Pixel_5_API_34, Pixel_C_API_30. No se inició ningún emulador ni se ejecutó la app.
- iOS: Windows sin Xcode/simulador. Sin ejecución en iPhone físico.

## Implementado en código

- Configuración Expo/Router/Web y TS estricto, con SDK 57 como objetivo, no instalado. Selección documentada por transición de Expo Go en las notas oficiales de SDK 58.
- Bootstrap `npm run setup`: Expo primero, resolución de paquetes con `expo install`, herramientas de desarrollo y comprobación de dependencias. El manifest inicial declara solo Expo para no inventar versiones compatibles; setup debe completarlo y generar lockfile antes de usar la app.
- Onboarding invitado inglés/francés, cuatro regiones, guardado y redirección después del éxito; perfil con cambios y confirmación; Inicio muestra preferencias auténticas y misiones pendientes.
- Tokens propios y componentes con safe areas, scroll, opciones accesibles, áreas táctiles y errores. Sin recursos externos.
- Modelo versionado y validado; idioma de aprendizaje, interfaz, entrenador y proveedor separados. Audio y humor explícito desactivados; no se crea consentimiento.
- Repositorio inyectable con adaptadores SQLite kv-store nativo y localStorage web diferido. No hay almacenamiento en memoria de producción ni simulación de sincronización.
- Estados de carga, lectura fallida con reintento, recuperación de JSON inválido y escritura fallida conservando borrador. Guardado concurrente bloqueado.

## Comandos y evidencia

| Comando | Resultado observado |
| --- | --- |
| `git status --short`, `rg --files`, `Get-ChildItem -Force` | Sin Git; se inspeccionó el inventario original |
| `node --version`, `npm.cmd --version`, `tsc.cmd --version` | 22.20.0 / 10.9.3 / 6.0.3 |
| `npm.cmd view expo version --fetch-retries=0 --fetch-timeout=15000` | EACCES al registro; no se obtuvo versión efectiva |
| `npm.cmd cache ls expo`, `npm.cmd view expo version --offline` | Referencias antiguas en caché; consulta offline ENOTCACHED, sin SDK utilizable |
| `npm.cmd --cache .npm-cache run setup` | Falló en npm install: EACCES a registry.npmjs.org/expo incluso usando caché escribible |
| `npm.cmd test` | 9/9 PASS; se observó primero RED por funciones no implementadas y después GREEN |
| Regresión de arrays como identificadores | Se observó 8/9 con `Missing expected exception`, corrección de tipos y después 9/9 PASS |
| `npm.cmd run typecheck:core` | PASS, núcleo y adaptador navegador bajo TypeScript estricto |
| `npm.cmd run typecheck` | FAIL: dependencias React/Expo ausentes, base expo/tsconfig.base no encontrada y errores derivados de JSX/tipos; no se certifica la UI |
| `npm.cmd run lint` | FAIL: eslint no instalado |
| `npm.cmd run web`, `npm.cmd run export:web` | FAIL: CLI Expo local ausente (MODULE_NOT_FOUND); no se generó web ni captura |
| `node --check scripts/setup.mjs`, `node --check scripts/test.mjs`, `node --check eslint.config.js` | PASS sintáctico; no sustituye lint |
| `adb.exe devices`, `emulator.exe -list-avds` | Falló daemon de ADB; AVDs listados, ninguna ejecución móvil |

El primer intento web encontró una CLI Expo global antigua (incompatible con Node moderno), con EPERM al escribir su estado; el intento de exportación indicó Expo ausente. Se corrigieron los scripts para invocar exclusivamente `node_modules/expo/bin/cli`. Los intentos finales fallan claramente por dependencia local ausente. No se modifica la instalación global.

`expo install --check` y Expo Doctor no pudieron verificarse por falta del SDK instalado; no se presentan como pruebas aprobadas. Las 9 pruebas usan adaptador en memoria de prueba y una implementación mínima de Storage, no navegador real ni SQLite. Cubren defaults, ocho combinaciones de selección, restauración entre repositorios, datos inválidos/versiones desconocidas, errores de lectura/escritura, resolución diferida y persistencia entre adaptadores web.

## Inventario de archivos creados

- Raíz: `.gitignore`, `package.json`, `app.json`, `tsconfig.json`, `tsconfig.core.json`, `expo-env.d.ts`, `eslint.config.js`, `README.md`.
- Rutas: `app/_layout.tsx`, `app/index.tsx`, `app/onboarding.tsx`, `app/profile.tsx`.
- UI/contenido: `src/components/ui.tsx`, `src/theme/tokens.ts`, `src/content/preferences.ts`.
- Preferencias: `src/domain/preferences.ts`, `src/features/preferences/PreferencesProvider.tsx`, `src/features/preferences/PreferencesForm.tsx`.
- Persistencia: `src/storage/contracts.ts`, `src/storage/preferencesRepository.ts`, `src/storage/browserStorage.ts`, `src/storage/deviceStorage.ts`, `src/storage/deviceStorage.web.ts`.
- Herramientas/pruebas: `scripts/setup.mjs`, `scripts/test.mjs`, `tests/preferences.test.cjs`.
- Documentación: `docs/LV-001_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/PROJECT_STATE.md`.
- Artefactos locales ignorados: `.test-build/` (TS compilado para tests), `.npm-cache/` (logs de instalación fallida). Sin package-lock porque la instalación no se completó.

## Bloqueos y continuación exacta de LV-001

1. Ejecutar `npm run setup` en un entorno con acceso permitido al registro npm. Revisar dependencias efectivas y conservar package-lock; no se solicitaron escalaciones que esta sesión prohíbe.
2. Ejecutar typecheck completo, lint, tests, expo install --check, Expo Doctor y export:web; corregir incompatibilidades reales antes de dar por terminada la tarea.
3. Abrir web y revisar onboarding, perfil, persistencia al recargar/reabrir, URLs directas, fallos de almacenamiento y datos corruptos; capturar móvil 320 px y escritorio. La lista manual completa está en README.
4. Ejecutar en Android/iOS real o emulador compatible y validar SQLite tras terminar/reabrir la app. Verificar accesibilidad con lector, teclado y fuente grande. No hay evidencia de compatibilidad probada en ninguna plataforma.
5. Revisar privacidad/clasificación por edades antes de una futura publicación; no hay cuentas ni consentimiento adulto que revisar en este flujo.

Siguiente tarea propuesta, solo después de aceptar LV-001: definir LV-002 para una primera experiencia educativa A1 acotada, contenido validado y contratos de dominio. No se creó ni implementó esa tarea.
