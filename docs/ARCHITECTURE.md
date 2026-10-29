# Arquitectura · LV-003B

## Extensión LV-003B

`cafe.ts` es el catálogo de contenido: versión anterior congelada en cafe.v1.ts y actual en cafe.v2.ts, con mismos IDs de variantes pero distintos contentVersion. Repositorio/proveedor/pantalla resuelven esa versión al continuar; iniciar otro recorrido usa siempre la actual. El Learning Engine solo amplía el contrato/validación de versión; sus reglas de evaluación/transición no cambian.

`learning/conversation.ts` calcula la firma del grafo central francés normalizado sin nombres/traducciones/IDs y la huella de perfil. El adaptador learning/variety adjunta profileId e IDs de estadísticas con versión. El motor genérico agrega memoria por perfil/ámbito/idioma/categoría; la estructura de historial v1 admite el campo opcional y se enriquece en memoria para datos anteriores. Persistencia atómica y control de conflictos conservados.

Las regresiones v1 se mantienen y v2 comprueba 48 rutas, diferencias centrales por pareja, importes consistentes y reanudación sin actualizar contenido a mitad del run. Fuentes, seis diálogos completos y métricas en LV-003B_CONVERSATIONS, LV-003B_SIMULATION y PROJECT_STATE.

## Extensión LV-003

Variety Engine puro en `src/domain/variety/`: filtros pedagógicos en/fr, pesos de relevancia/frecuencia/recencia/nivel, RNG inyectable e historial acotado. No conoce cafeterías ni UI. El adaptador `src/domain/learning/variety.ts` convierte lecciones en candidatos, extrae entradas de escena y hechos de error mediante replay del Learning Engine.

`MissionRepository` selecciona al iniciar; al reanudar solo restaura. Guarda progreso v1 e historial v1 en una envoltura v2 atómica bajo la clave original de misión; importa progreso plano de LV-002 en memoria sin escribirlo ni cambiar sus campos. Conserva locks/conflictos y no toca preferencias LV-001. Las fechas legacy desconocidas son null y no se inventan recorridos anteriores. Hay seis variantes; los dos IDs originales y su contenido permanecen estables. La confirmación de reinicio informa que se conserva memoria agregada.

Contratos, algoritmo, simulación, límites y prueba manual en VARIETY_ENGINE.md. El motor no cambia corrección de respuestas ni ordena al azar pasos dependientes. No hay otros motores completos ni servicios nuevos.

## Extensión LV-002

Se conservan los adaptadores, preferencias y tokens existentes. Se incorporan `/explore` y `/mission`, y una tarjeta de aventura en Inicio. `MissionProvider` en el layout comparte el progreso entre rutas y persiste cada acción antes de mostrar avance; no depende del idioma elegido para permitir probar explícitamente la única misión francesa.

`src/domain/learning/` contiene contratos, validación del grafo, evaluación determinista, transiciones y reproducción de eventos, sin React Native. `src/content/cafe.ts` es un paquete v1 de dos variantes con ocho objetivos y ramas editoriales. `src/storage/missionRepository.ts` reutiliza el contrato de LV-001 con clave independiente por misión. `src/features/learning/` reúne proveedor, tarjeta, pantalla y formulario de ejercicio. No se construyen motores completos de diálogo/variedad: el grafo editorial y `VariantSelector` son la extensión mínima necesaria.

La hidratación inicial de preferencias y misión aplica el estado desde callbacks de la promesa de almacenamiento y descarta resultados tras desmontar el efecto. Corrige el error previo de lint `react-hooks/set-state-in-effect` sin desactivar la regla. Reintentos explícitos siguen disponibles.

Pruebas Node ahora descubren todos los archivos `tests/*.test.cjs` y compilan también el contenido/repositorio de misión. `scripts/check-web.mjs` ofrece aceptación en Chromium local sin dependencias nuevas. La prueba real de navegador sigue bloqueada por el entorno, aunque typecheck, lint y exportación pasan. Detalles en LEARNING_ENGINE, CONTENT_MODEL y PROJECT_STATE.

## Base conservada de LV-001 (historial)

`app/` contiene tres rutas Expo Router: `/` Inicio, `/onboarding` y `/profile`. `_layout.tsx` instala proveedor de preferencias y safe areas. No hay tabs decorativas.

`src/components/ui.tsx`: Page con ScrollView y ancho máximo, tarjetas, botones, selección radio, carga y alertas. `src/theme/tokens.ts`: colores, tipografía y medidas. `src/content/preferences.ts`: IDs estables y etiquetas de selección; no contenido pedagógico.

`src/features/preferences/`: formulario reutilizado y proveedor de estado. Durante hidratación no redirige ni escribe defaults. Un fallo de lectura ofrece reintento. Un fallo de escritura conserva preferencias previas; el formulario mantiene el borrador. El estado solo cambia después de persistir. Un ref bloquea guardados simultáneos. No se simula éxito, progreso o sincronización.

`src/domain/preferences.ts`: modelo v1, defaults, validación y actualización inmutable; sin React ni dependencias nativas. `learningLanguage`, `interfaceLanguage`, `coachLocale` y `voiceProvider` son campos separados. Interfaz `es`, voz `none`, humor explícito `false`, invitado. No se guarda consentimiento adulto. No se crean motores vacíos: learning, dialogue, humor, variety, voice y progress se añadirán solo en tareas que implementen comportamiento real.

`src/storage/contracts.ts`: contrato KeyValueStorage. Repositorio independiente con clave `lingoverse.preferences.v1`. Ausencia significa primer uso. JSON dañado, campos inválidos o versión desconocida vuelven a onboarding con aviso; no se reemplaza el registro hasta guardar explícitamente la nueva selección. No hay migración histórica porque no hay formatos anteriores; una versión futura debe definirla antes de cambiar el esquema.

`deviceStorage.ts`: Expo SQLite kv-store nativo. `deviceStorage.web.ts`: Metro selecciona localStorage en web, sin importar SQLite. `browserStorage.ts` accede a window solo al leer/escribir, nunca al importar/renderizar; operaciones dentro de efectos/eventos. Acceso denegado y cuota se propagan. Navegador y nativo tienen almacenes separados.

`tests/` usa Node test runner contra módulos TypeScript compilados en `.test-build`; `tsconfig.core.json` permite verificar dominio/adaptador web sin dependencias Expo. No sustituye pruebas UI, SQLite real ni builds por plataforma.

No se incorpora Zustand porque no es necesario para este único estado pequeño; no hay audio, Reanimated, NativeWind, Supabase, .NET, SDK de analítica ni llamadas externas desde la aplicación. Instalación y herramientas de desarrollo sí requieren acceso al registro npm.

Objetivo SDK 57, justificado por la recomendación oficial de creación durante la transición a SDK 58: [Expo SDK 58](https://expo.dev/changelog/sdk-58). Persistencia basada en la API oficial [SQLite kv-store](https://docs.expo.dev/versions/latest/sdk/sqlite/). La compatibilidad efectiva requiere ejecutar setup, `expo install --check` y Expo Doctor: no fue posible certificarla en este entorno.

Actualización LV-001B: `package.json` declara ahora todas las dependencias necesarias basadas en la plantilla y módulos oficiales de la rama SDK 57, incluidas React Native 0.86.3 y TypeScript 6.0.3. `setup` realiza una instalación y valida con la CLI local sin actualizar el SDK ni mutar el manifiesto para escoger versiones. `check:expo` y `check:doctor` exponen las comprobaciones; `diagnose:npm` separa escritura local, DNS y conexión HTTPS. Los rangos declarados no sustituyen un lockfile ni una comprobación efectiva con dependencias instaladas.
