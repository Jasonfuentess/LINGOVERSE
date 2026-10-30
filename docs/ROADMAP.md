# Hoja de ruta — Visión V3

Dirección acordada en [PRODUCT_VISION.md](PRODUCT_VISION.md). Esta hoja ordena trabajo futuro; no acredita funcionalidades implementadas ni inicia una tarea de código. El estado y la evidencia de ejecución están en [PROJECT_STATE.md](PROJECT_STATE.md).

## Base actual

Existe la aventura escrita francesa de cafetería, con decisiones, ocho objetivos, variantes, progreso local, entrenadores regionales y Roast Me independiente. Existen referencias humorísticas compartidas y validación escrita acotada. Hay pruebas automatizadas y recorridos web verificados; teclado Android nativo y Safari/iOS siguen pendientes según el registro técnico.

Audio, reconocimiento oral, destinos navegables, aventura inglesa, diario, pasaporte y recompensas no se consideran implementados por figurar en la visión. Las cinco secciones describen la organización objetivo; no se interpreta que todas sus funciones estén disponibles hoy. Roast como estilo de aventuras compatibles es una extensión pendiente del modo independiente existente.

## Orden de implementación

| Prioridad | Entrega prevista | Evidencia necesaria para aceptarla |
| --- | --- | --- |
| 1 | Consolidar conversaciones, ampliar aventuras y mejorar presentación narrativa; validar progresivamente reproducción y entrada oral | Recorrido educativo completo, decisiones coherentes, fallback escrito funcional y pruebas reales de cada capacidad oral antes de anunciarla |
| 2 | Diario del Explorador V1 sobre la cafetería | Entrada scrapbook legible en móvil, generada de eventos reales y contenido editorial versionado; decisiones y aprendizaje verificables, con acceso a repaso |
| 3 | Pasaporte V1 | Sellos diferenciados de visita, aventura completada y habilidad demostrada; diario y pasaporte consistentes con el mismo progreso persistente |
| 4 | Recompensas ligeras | Recuerdos/logros vinculados a actividad educativa real; sin compra de respuestas, dominio o enseñanza esencial y sin incentivar repetición trivial desproporcionada |
| 5 | QA de beta | Recorridos documentados en Android y web móvil, más plataformas compatibles; teclado, audio disponible, consentimiento/revocación, accesibilidad y persistencia comprobados |

Cada fase se desglosará en tareas incrementales `tasks/LV-XXX.md` antes de implementar. Las verificaciones de cada entrega se realizan durante su desarrollo; QA de beta agrega la evaluación integrada, no posterga las pruebas hasta el final. No se fijan aquí proveedores de voz, fechas, una arquitectura nueva de progreso ni parámetros de economía virtual.

## Decisiones transversales

- Explorador de Idiomas organiza destinos y aventuras mediante navegación narrativa; París/francés A1 y Londres/inglés A1 son los destinos iniciales propuestos, sin mundo 3D obligatorio.
- Conservar Inicio, Explorar, Practicar, Trabajo y Perfil como organización del producto, con Modo Sin Pena destacado en Explorar y Roast Me con identidad independiente.
- Reutilizar Learning, Variety, Humor, contenido versionado y persistencia; cualquier evolución del progreso debe preservar partidas y evitar duplicar evaluación entre diario y pasaporte.
- La voz de reacciones adultas requiere el mismo consentimiento válido y revocable que el texto. No anunciar acentos, reconocimiento o calidad de pronunciación sin evidencia técnica.
- Estética moderna para jóvenes/adultos; diario con papel, mapas, postales y recortes, sin saturar móvil ni comprometer legibilidad o rendimiento.
- Economía virtual avanzada requiere evaluación posterior. Mamá de LATAM sigue en evaluación y no es requisito de beta.
- Presupuesto inicial $0. Servicios de pago, nube obligatoria o generación de texto mediante IA requieren justificación y aprobación.
