# AGENTS.md — LingoVerse

## Objetivo
LingoVerse es una aplicación móvil/web para aprender inglés y francés mediante aventuras interactivas, enseñanza real y humor latinoamericano consentido. El documento rector es `docs/MASTER_PROMPT.md`.

## Forma de trabajo
- Trabajar en tareas incrementales `tasks/LV-XXX.md`; no intentar implementar todo el producto en una única ejecución.
- Leer `docs/MASTER_PROMPT.md` y el documento de tarea antes de modificar código.
- Cada funcionalidad debe representar un comportamiento real, no una demo visual que simule progreso, voz, evaluación o sincronización.
- Mantener un registro actualizado en `docs/PROJECT_STATE.md` de avances, pruebas ejecutadas, errores y trabajo pendiente.
- Antes de tocar un repositorio existente, inspeccionar estructura, estado de Git y cambios del usuario; preservar trabajo preexistente.
- No hacer push, deploy, publicar en tiendas, contratar servicios ni gastar dinero sin autorización explícita.
- No introducir secretos ni dependencias de credenciales; la app inicial debe funcionar sin Supabase y sin servidor .NET.
- Todos los componentes UI deben ser accesibles, mobile-first y respetar límites del dispositivo.
- Mantener separación entre UI y dominios (learning, dialogue, humor, variety, voice, progress).
- Elegir paquetes estables y compatibles con la versión de Expo usada. NativeWind es opcional y requiere verificación explícita; no forzar paquetes RC.
- Para web, usar un adaptador de persistencia independiente de SQLite nativo.
- Lenguaje explícito/humor agresivo siempre opt-in, desactivado de inicio; no crear consentimiento falso.
- No inventar datos pedagógicos, resultados de pronunciación, audios o capacidades que no existan.
- Identificadores de contenido estables, modelos tipados y pruebas reproducibles.
- Al finalizar cada tarea, informar archivos creados/modificados, comandos ejecutados, resultados y limitaciones pendientes.

## Prioridades de calidad
1. Funcionalidad demostrable y correcta.
2. Progresión educativa real y contenido validado.
3. Arquitectura extensible sin sobreingeniería.
4. Experiencia de usuario original, fluida y agradable.
5. Privacidad y consentimiento.

## Primera tarea
Implementar únicamente `tasks/LV-001.md`.
