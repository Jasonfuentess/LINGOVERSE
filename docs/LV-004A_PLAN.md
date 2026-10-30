# LV-004A — plan de implementación

Rama verificada limpia feature/lv-004-humor-engine. Leer contratos/versión/persistencia antes de modificar. No escritura Git.

1. Tests primero: contexto extraído mediante evaluación real, categorías, cuatro regiones, biblioteca validada, fallback, RNG, consentimiento/revocación/defaults y almacenamiento.
2. Dominio humor puro: contratos, preferencias versionadas y política de compatibilidad. El adaptador Learning calcula intentos/errores/objetivos; Humor no modifica calificación. Categorías general/acierto/error/reintento/recuperación/recurrente/progreso/celebración.
3. Biblioteca v1 de textos completos, cuatro personalidades, varios textos por categoría/intensidad. Selección delegada a Variety, sin concatenar fragmentos ni inventar fechas/errores.
4. Guardar snapshot de reacción y frecuencia junto a misión en envoltorio v3, leyendo v1/v2 previos. Recargar conserva comentario; validar snapshot contra evento/catálogo, omitir reacción inválida sin romper progreso. Estado en memoria solo después de escritura exitosa.
5. Preferencias de humor en clave separada, conservando perfil existente. Proveedor con carga/error/reintento y guardado real; toggle amistoso en Perfil y componente accesible de entrenador bajo la corrección. Adulto preparado en dominio/persistencia, sin UI de activación ni textos adultos hasta LV-004B. Desactivación/revocación disponible.
6. Simular 1000 sesiones con cuatro regiones, errores y recuperación reales; medir contexto, distribución y repetición. Ejecutar suite completa, TS, lint, exportación y simulaciones existentes. Revisión de código y documentación final.
