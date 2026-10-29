# LV-002 — plan y decisiones

Especificación: tasks/LV-002.md y solicitud del usuario. Implementación directa sobre base existente, sin repositorio Git. No se modifican SDK, lockfile ni diseño general.

1. Pruebas primero: evaluación de selección/texto, alternativas, errores, ramas, ocho objetivos por ruta, validación de contenido y progreso, restauración y fallos de almacenamiento.
2. Dominio puro `src/domain/learning/`: modelos de lección/ejercicios/respuestas/evaluación/progreso, validador del grafo, evaluación determinista y eventos reproducibles. Una transición correcta se confirma con Continuar después de leer feedback; el error mantiene la escena.
3. Contenido `src/content/cafe.ts`: lección v1, dos variantes editoriales con mismos objetivos/expresiones enseñadas, ocho interacciones por recorrido y decisiones café/té, sur place/à emporter y azúcar.
4. Repositorio `src/storage/missionRepository.ts`: reusa KeyValueStorage; guarda historial de eventos validado por reproducción, variante y número de intento. Datos inválidos no se sobreescriben automáticamente. Selector de variante inyectable, alternancia por defecto; reiniciar pide confirmación porque descarta recorrido actual.
5. Estado compartido y UI `src/features/learning/`, `app/explore.tsx`, `app/mission.tsx`; integrar tarjeta real en Inicio. Disponible explícitamente en francés incluso si preferencia es inglés, sin cambiarla. Sin progreso global/CEFR inferido ni XP inventado.
6. Comprobar suite completa, TS, lint, Expo y exportación/servidor web. Documentar prueba manual, contenido y límites.

Revisión deliberada: JSON corrupto/futuro, doble pulsación, salida durante feedback, cuotas, respuestas vacías/desconocidas, acentos, grafos con ciclos/rutas que omiten objetivos, finalización solo tras despedirse y reinicio sin tocar preferencias. No existe evaluación fonética. Dos variantes finitas no son variedad infinita ni selección aleatoria contextual.
