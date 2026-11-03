# Hoja de ruta — Visión V3

## Secuencia actual acordada (31-oct-2026)

**Prioridad vigente: LV-007-LEARN-02**, rescate surgido de QA real no aprobado de LEARN-01. Enseñar y construir respuestas en las tres aventuras antes de evaluar, tres modos por idioma, aproximaciones curadas con audio original, recuperación sin depender del micrófono y evidencia de ayuda sin dominio ficticio. Validar con principiante, voz/ralentización o grupos alternativos, Roast consentido y disposición/accesibilidad móvil antes de LV-007B/Live. Implementación193/193, aceptación manual pendiente; detalles en PROJECT_STATE y guía QA de LEARN-02. La secuencia siguiente conserva antecedentes de LEARN-01.

1. **LV-007-LEARN-01:** preparar a principiantes absolutos antes de responder en una escena existente de francés y otra de inglés; modo guiado/autónomo y ayuda por idioma, reconocimiento revisable, coherencia pregunta/respuesta y conservación del diseño LV-007-UI-01. Validar con alguien que desconoce la pronunciación, sin notas fonéticas ni nivel CEFR certificado.
2. **LV-007B:** conversaciones dinámicas y reacciones naturales, pendiente de especificación y autorización después de validar esta base. No se implementa por figurar aquí.
3. **Roast Me Live — futuro:** conversación oral adulta inicialmente por turnos; personalidad regional provocadora con puteadas auténticas, exageración, sarcasmo, memes y variedad editorial. Intensidades y consentimiento específico para contenido fuerte; no suavizar el extremo a frases motivacionales con humor leve. Reacciones habladas, risas y enseñanza por voz con recursos reales; corrección y nueva práctica al terminar el roast. Basarlo solo en errores suficientemente fiables, nunca en una transcripción dudosa. Reducción de intensidad, desactivación y revocación inmediatas; experiencia normal separada. Excluir características sensibles, amenazas y humillación personal ajena a la práctica. Evaluar continuidad/baja latencia después, sin compromiso técnico aún. Ver requisito completo en [PRODUCT_VISION.md](PRODUCT_VISION.md).

Prerequisitos de Live: QA de STT con principiantes y separación de incertidumbre/errores educativos; voz y cancelación verificadas; contenido regional y variedad editorial; consentimiento propio y revocación de texto/audio; evaluación técnica y de privacidad antes de proponer proveedores o costes. **No desarrollar Live en LV-007-LEARN-01 ni añadir nuevas aventuras.**

Los apartados siguientes conservan la planificación V3 anterior; su «base actual» es histórica. Consultar PROJECT_STATE para capacidades y pruebas presentes.

Dirección acordada en [PRODUCT_VISION.md](PRODUCT_VISION.md). Esta hoja ordena trabajo futuro; no acredita funcionalidades implementadas ni inicia una tarea de código. El estado y la evidencia de ejecución están en [PROJECT_STATE.md](PROJECT_STATE.md).

## Base actual

Actualización LV-005A (2026-10-30): cafetería con presentación conversacional,
historial de intervenciones verificadas, escena local y Roast opcional consentido
implementados. 100/100 pruebas, typechecks, lint y export aprobados; recorridos Chrome
desktop/móvil verificados. Android se intentó pero no cargó la misión; teclado nativo
y Safari/iOS pendientes. Contratos de voz y hechos educativos solo preparados, sin
audio, diario ni pasaporte. Detalle en [CONVERSATIONAL_EXPERIENCE.md](CONVERSATIONAL_EXPERIENCE.md).

Existe la aventura escrita francesa de cafetería, con decisiones, ocho objetivos, variantes, progreso local, entrenadores regionales y Roast Me independiente. Existen referencias humorísticas compartidas y validación escrita acotada. Hay pruebas automatizadas y recorridos web verificados; teclado Android nativo y Safari/iOS siguen pendientes según el registro técnico.

Audio, reconocimiento oral, destinos navegables, aventura inglesa, diario, pasaporte y recompensas no se consideran implementados por figurar en la visión. Las cinco secciones describen la organización objetivo; no se interpreta que todas sus funciones estén disponibles hoy. Roast como estilo está disponible en la cafetería con consentimiento y opt-in separado; otras aventuras requieren compatibilidad editorial y técnica explícita.

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
