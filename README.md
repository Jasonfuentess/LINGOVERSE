# LingoVerse · LV-003B

Aplicación local con onboarding invitado, selección de idioma/entrenador, Perfil y una aventura guiada de francés A1 en una cafetería de París: ocho interacciones, decisiones ramificadas, respuestas escritas, correcciones, continuación y reinicio. Seis variantes editoriales con selección ponderada y memoria local de apariciones/errores reales. Sin cuentas, backend, audio ni consentimiento adulto.

**Estado LV-003B:** 53 tests, ambos typechecks, lint, export:web y simulación reproducible aprobados. Seis conversaciones francesas v2 con diferencias centrales en pedido, lugar, azúcar e importe; se comparan las ocho rutas. Sesiones antiguas continúan con v1 congelada y su calificación original. Para ver contenido nuevo en una misión existente hay que confirmar Reiniciar aventura. La aceptación visual sigue pendiente por fallo del navegador del entorno; Android/iOS no ejecutados. Sin cambios de dependencias/lockfile.

`npm.cmd run simulate:variety` reproduce el informe vigente en `docs/LV-003B_SIMULATION.json`: 1000 misiones, seis perfiles y seis secuencias francesas visibles, con 52 repeticiones consecutivas; un control de alias compartidos reduce repeticiones de perfil de 426 a 291. El informe LV-003 anterior se conserva como histórico. `npm.cmd run document:conversations` genera [seis ejemplos completos y sus diferencias](docs/LV-003B_CONVERSATIONS.md). El historial sigue acotado y se guarda junto al progreso. Variedad finita, repeticiones permitidas, sin IA. [Algoritmo, versiones y validación manual](docs/VARIETY_ENGINE.md).

Para probar la misión: `npm.cmd run web` → Inicio → Explorar aventuras → Un café en París → Comenzar aventura. También se puede abrir desde la tarjeta de Inicio; si elegiste inglés, la misión se identifica como francesa sin alterar tu preferencia. [Guía completa y respuestas de prueba](docs/LV-002_MANUAL_TEST.md).

## Preparar y ejecutar

Requiere Node 22.20.0 o una versión LTS admitida por Expo SDK 57, npm y acceso al registro npm. En PowerShell usar `npm.cmd` si la política de ejecución impide `npm`.

```sh
npm run setup
npm run web
```

Para una copia nueva, `npm ci` instala desde el lockfile existente. No hace falta reinstalar si ya tenés las dependencias. `setup` conserva su utilidad de instalación/validación usando la CLI local, pero necesita red. No actualiza el SDK automáticamente.

Versiones efectivas observadas en LV-002: Expo 57.0.31, React/DOM 19.2.3, React Native 0.86.3, Web 0.21.4 y TypeScript 6.0.3. No se cambiaron dependencias ni lockfile para esta misión. Una exportación web no certifica funcionamiento en móviles nativos.

Web: abrir la URL local que imprima Expo. No se necesita Supabase ni claves. Se usa localStorage del mismo origen; no hay sincronización entre navegadores, móvil y web. Navegación privada, permisos o cuotas pueden impedir guardar; la UI muestra el error y conserva el formulario para reintentar.

Móvil físico: `npm start`, misma red Wi-Fi y escanear el QR con una versión de Expo Go compatible con SDK 57. Comprobar la versión en [Expo Go](https://expo.dev/go); la app de las tiendas puede cambiar de SDK. No usar túneles o servicios de pago como requisito. Si no existe Expo Go compatible para tu dispositivo, se requiere un desarrollo nativo local compatible; no se ha verificado ese flujo aquí.

Android con SDK/emulador configurado: iniciar un AVD y ejecutar `npm run android`. En este equipo el SDK está en `%LOCALAPPDATA%/Android/Sdk`; `platform-tools` y `emulator` no están en PATH. ADB no consiguió iniciar su daemon en el entorno restringido. Java detectado: 11; no se validó un toolchain para compilar Android nativo.

iOS: dispositivo físico compatible con Expo Go o, en macOS con Xcode y simulador configurados, `npm run ios`. Windows no ejecuta simuladores iOS. No se realizaron builds EAS ni publicaciones.

## Comprobaciones

```sh
npm test
npm run typecheck:core
npm run typecheck
npm run lint
npm run check:expo
npm run check:doctor
npm run export:web
```

Las dos primeras funcionan sin Expo si existe `tsc` en PATH (aquí TypeScript global 6.0.3). Tras setup usan TypeScript local. Tests: Node test runner y compilación TS real del núcleo; no requieren red. Las restantes necesitan instalar primero las dependencias. Exportar web genera un artefacto local, no publica nada.

`check:doctor` usa `npm exec` para obtener Expo Doctor y necesita red si no está en caché. No forma parte de las pruebas offline ni se considera aprobado si falla la descarga.

## Reproducir el diagnóstico y continuar fuera del sandbox

En una terminal PowerShell **normal, sin administrador**, ejecutar:

```powershell
Set-Location -LiteralPath 'D:\Documents\Jason\LingoVerse\LingoVerse-Codex-Inicio'
npm.cmd run diagnose:npm
if ($LASTEXITCODE -ne 0) { throw 'DNS, escritura o HTTPS fallaron; revisar la salida antes de instalar.' }
npm.cmd --cache .npm-cache run setup
if ($LASTEXITCODE -ne 0) { throw 'La instalación o validación Expo falló; no continuar como si estuviera aprobada.' }
npm.cmd test
npm.cmd run typecheck:core
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run check:expo
npm.cmd --cache .npm-cache run check:doctor
npm.cmd run export:web
npm.cmd run web
```

Inspeccionar el código de salida de cada comprobación; un fallo no queda aprobado por ejecutar la siguiente. Abrir la URL impresa por Expo solo si el servidor inicia. `diagnose:npm` comprueba escritura/lectura en un subdirectorio nuevo de `.npm-cache`, resolución DNS y HTTPS, sin modificar configuración global ni controles de seguridad. Conserva los pequeños archivos de prueba; no borra datos existentes. Éxito de DNS/escritura no implica éxito de HTTPS.

Para reproducir exactamente la instalación detallada:

```powershell
npm.cmd install --cache .npm-cache --loglevel=silly --timing --fetch-retries=0 --fetch-timeout=15000 *> lv001b-install-local.log
$installResult = $LASTEXITCODE
Get-Content lv001b-install-local.log -Tail 80
Write-Output "Código de instalación: $installResult"
```

Si la conexión funciona en la terminal normal, se aísla el bloqueo al contexto restringido. Si también devuelve `connect EACCES` allí, no está resuelto: conservar el log y revisar la política de red del anfitrión con su responsable. No cambiar ACLs, desactivar seguridad, ejecutar como administrador ni limpiar cachés/archivos del usuario. Cambiar caché no resuelve un socket denegado. El componente exacto de seguridad del anfitrión no puede identificarse desde esta sesión.

Validación manual pendiente:

1. Con almacenamiento limpio, elegir cada idioma y las cuatro regiones; entrar como invitado.
2. Recargar/cerrar y volver a abrir; comprobar Inicio y Perfil.
3. Cambiar y guardar desde Perfil; volver a Inicio y reiniciar.
4. Bloquear localStorage o simular cuota excedida: mostrar error sin afirmar que se guardó.
5. Corromper `lingoverse.preferences.v1`: mostrar aviso y permitir nueva elección.
6. Probar URL directa `/profile`, teclado, lector de pantalla, texto grande y 320 px sin desbordes.
7. En móvil repetir cierre/reapertura para validar SQLite real. Una prueba en memoria no demuestra persistencia nativa.

Las comprobaciones visuales siguen **pendientes** en LV-002. Repetir la matriz de 2 idiomas × 4 regiones en un perfil de navegador dedicado. Probar Atrás del navegador/dispositivo y “Volver al inicio”, entrada directa a `/profile` sin onboarding y volver sin guardar. Para la aventura seguir LV-002_MANUAL_TEST. No hay que borrar datos de un navegador personal para probar un primer inicio.

Para datos corruptos usar solo ese perfil de prueba: DevTools → Application/Storage → clave `lingoverse.preferences.v1`, guardar `{` y recargar; esperar aviso y nuevo onboarding. Para fallo de escritura se puede instrumentar temporalmente desde la consola de ese perfil `Storage.prototype.setItem = function () { throw new DOMException('Prueba de cuota', 'QuotaExceededError'); }`, intentar guardar y comprobar error sin confirmación de éxito; recargar restaura el método. Para lectura denegada usar la configuración del navegador o instrumentación temporal equivalente de `getItem` antes de montar la app; esperar error y reintento. Registrar resultado real, consola y capturas, sin tratar esta guía como evidencia de ejecución.

Arquitectura y archivos: [ARCHITECTURE](docs/ARCHITECTURE.md). Motores: [LEARNING_ENGINE](docs/LEARNING_ENGINE.md), [VARIETY_ENGINE](docs/VARIETY_ENGINE.md). Contenido: [CONTENT_MODEL](docs/CONTENT_MODEL.md). Diseño: [DESIGN_SYSTEM](docs/DESIGN_SYSTEM.md). Resultados y bloqueos: [PROJECT_STATE](docs/PROJECT_STATE.md). LV-004 no iniciada.
