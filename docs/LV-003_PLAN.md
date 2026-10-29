# Plan de implementación LV-003

Especificación: tasks/LV-003.md y solicitud del usuario. Rama verificada limpia: feature/lv-003-variety-engine, base fc41286. Sin operaciones de escritura Git.

1. Motor puro en src/domain/variety: contratos en/fr, CEFR, candidatos/contexto, pesos, decisiones auditables, historial y RNG sembrable. Filtros duros antes de ponderar. Penalización gradual por frecuencia y recencia, nunca veto absoluto a repetir.
2. Historial v1: estadísticas LRU 256, últimos 64 eventos, 64 hechos de error, contadores saturados. Solo IDs/contexto educativo; no copiar respuestas libres ni datos personales al historial.
3. Adaptación Learning→Variety: selección de variante por objetivos de lección; registro de entrada en escenas e inferencia de errores exclusivamente mediante evaluación/replay del Learning Engine.
4. Repositorio: envoltorio v2 con progreso LV-002 intacto e historial v1 en la misma escritura; migración en memoria del registro v1, conservando IDs/feedback y sin inventar sesiones anteriores. Conflictos y locks existentes. Reanudación no selecciona ni cuenta otra aparición.
5. Cafetería: seis variantes, conservando las dos originales sin cambios y las mismas ayudas/aceptación/calificación/ramas. Introducciones y preguntas equivalentes; sin reordenar pasos dependientes.
6. Pruebas de restricciones, pesos, memoria, migración, error real, quota/conflictos, replay y todas las rutas; simulación determinista de 1000 sesiones con distribución/repeticiones/agotamiento. Verificar suite, TS, lint, exportación y documentar límites de plataforma.

Decisiones: registro combinado para evitar inconsistencias entre dos claves; la política en/fr es genérica, la misión disponible sigue siendo francesa. La alternancia legacy del Learning Engine se conserva como fallback de API y para restaurar; la UI usa la nueva selección persistida. Variante estable durante todo el recorrido. No hay IA, humor adulto ni alegación de contenido infinito.
