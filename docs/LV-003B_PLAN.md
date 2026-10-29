# LV-003B — decisiones y plan

Base: cambios LV-003/auditoría sin confirmar preservados en rama solicitada. Especificación tasks/LV-003B.md.

1. Congelar el paquete actual en cafe.v1.ts y registrar hash semántico; conservar sus pruebas/auditoría como regresiones históricas.
2. Publicar cafe.ts v2 con los mismos seis IDs, ocho objetivos y grafo. Diferenciar pedido (je voudrais/je prends/pedido breve), lugar (pregunta abierta/confirmación/mesa), azúcar (sí/no o con/sin) y precio ficticio uno/dos/tres. Ayudas y traducciones antes de cada respuesta.
3. Permitir versiones enteras positivas en el contrato de lección. Resolver la versión guardada en repositorio, proveedor y pantalla; empezar un recorrido nuevo siempre usa v2, continuar nunca cambia v1 a v2.
4. Huella de conversación derivada de intervenciones educativas centrales y respuestas/ramas, sin nombres/ambientación/saludos/despedidas. Historial agrega profileId opcional compatible; enriquecer estadísticas antiguas en memoria a partir de catálogo congelado. IDs de contenido v2 incluyen versión para no mezclar estadísticas con v1.
5. Penalizar frecuencia/recencia agregadas de un perfil en el mismo ámbito/idioma/categoría. Repetir permitido, una alternativa sigue operativa.
6. Pruebas de 48 rutas, diferencias por pareja, equivalencia de objetivos, seis huellas, migración/reanudación v1 plana/envelope, estabilidad v2, rollback/conflictos y alias con mismo perfil. Simulación 1000 sesiones, comparando IDs/huellas y comprobando diálogos reales completos.
7. Revisar cambios, ejecutar validaciones y documentar textos, métricas, limitaciones y prueba manual. No afirmar prueba visual/validación docente independiente sin evidencia.
