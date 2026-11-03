# LV-007-UI-01 — Dirección visual y plan de implementación

## Auditoría inicial

Inspección de rutas y componentes actuales, recursos locales y documentación V3/LV-005/LV-006/LV-007A. Chrome headless falló antes de cargar la app: GPU no utilizable y timeout `Page.enable`; las observaciones iniciales son de código y arte local, no una auditoría visual aprobada en Chrome.

- Inicio antepone preferencias y botones equivalentes a la aventura: falta una acción principal y una composición evocadora.
- Explorar usa tres tarjetas de texto casi idénticas, sin representación visual de destinos ni navegación persistente.
- Café tiene arte pictórico mientras Londres/jardín usan primitivas geométricas; muchos NPC son iniciales. Falta coherencia.
- La conversación ya tiene pista progresiva, continuidad y respuesta verificada. Conservarlas. Elecciones, micrófono y controles tienen el mismo peso visual; las explicaciones largas empujan el diálogo.
- Perfil contiene afirmaciones estáticas de voz/humor que pueden contradecir las preferencias vigentes.
- Practicar y Trabajo todavía no tienen rutas. No simular herramientas ni misiones profesionales.

## Dirección seleccionada por implementación

Decisión creativa de Codex dentro de la libertad explícita del usuario: **Atlas nocturno**, viaje editorial para adultos. Alternativas consideradas: extender el scrapbook beige (menor evolución visual) o un mundo tipo mapa con desplazamiento (añade complejidad sin nuevas capacidades). Se elige composición editorial con destinos ilustrados y conversación clara, manteniendo React Native/Expo sin paquetes nuevos.

- Paleta: fondo porcelana frío `#F2F5F7`, tinta `#142B3D`, jade `#16655D`, jade claro `#E4F2EC`, ámbar `#F0C987`, blanco; azul nocturno para portadas, terracota para Roast Me. Texto educativo oscuro sobre superficies claras.
- Tipografía del sistema para cuerpo y controles; serif del sistema solo para titulares editoriales. Cuerpo 17/26, diálogo 21/30, display 38–48 con escalado. Sin descarga de fuentes.
- Componentes: masthead con marca brújula, navegación de cinco accesos reales, portada de aventura con imagen, etiquetas de idioma/nivel y progreso real; secciones con número editorial; selector de respuesta con indicador textual/forma además de color.
- Personajes: conservar nombres y retratos existentes; complementar NPC sin retrato con atlas pictórico original local cuando se genere correctamente. No fingir expresiones emocionales que el recurso no contiene.
- Escenarios: atlas original de café, Londres, jardín y Sena. Portada móvil200 px y escritorio420 px; escena de conversación120 px para no dificultar responder. El recorte cubre ambos ejes sin mostrar celdas vecinas. Texto narrativo conserva autoridad: arte ambiental no es mapa ni imagen exacta de cada evento.
- Estados: NPC con nombre/retrato/burbuja; reproducción indica estado real del controlador; preparación de respuesta con panel propio; micrófono activo y transcripción diferenciados; guardado se anuncia como guardado (no evaluación remota); acierto jade, error ámbar, incertidumbre azul con texto explícito; continuidad LV-007A preservada.
- Navegación: Inicio, Explorar, Practicar, Trabajo, Perfil. Practicar dirige a práctica/repaso reales de aventuras. Trabajo explica disponibilidad futura sin botones de misión falsos. Sin diario/pasaporte funcionales.
- Responsive: columna editorial de hasta 1080 px para inicio/explorar, conversación hasta 720 px; tarjetas se reorganizan por flex-wrap con ancho mínimo limitado por el contenedor; navegación de cinco columnas que permite texto escalado; safe areas y KeyboardScroll existentes.
- Accesibilidad: objetivos táctiles de 44–52 px mínimo; texto sin truncar; selected/checked/disabled; títulos semánticos, regiones vivas para estados, contraste revisable, foco visible web, sin auto reproducción ni auto envío de transcripciones.
- Animación: conservar entrada de turno 160 ms con soporte de movimiento reducido; estados pressed/focus sin animación ambiental continua, demoras ni bloqueo artificial.

## Plan de trabajo

1. Registrar baseline y validación manual reportada, preservar archivos existentes y claves. Ninguna operación Git de escritura.
2. Crear tokens, cabecera/navegación y componentes de portada/destino. Aplicar Inicio y Explorar. Añadir rutas Practicar/Trabajo honestas.
3. Dar coherencia a escenas/retratos y recomponer conversación, respuestas, ayudas, voz/micrófono y feedback sin tocar dominios. Verificar suite antes de continuar.
4. Refinar entrenador, Roast Me, Perfil y preferencias con el mismo sistema. Mantener consentimiento y revocación.
5. Ejecutar suite completa, ambos typechecks, lint y export; intentar Chrome con perfiles aislados. Capturas antes/después y viewports cuando sea posible. Documentar fallos del entorno sin declarar QA aprobado.
6. Actualizar estado/handoff y guía manual incluyendo progreso previo, reanudación, variantes, voz/micrófono, incertidumbre, consentimiento y tamaños.

No se añaden tests que reflejen solo estilos. La suite existente protege comportamiento educativo; las rutas/estados nuevos requieren verificación funcional, y las diferencias LV-007A del baseline quedan documentadas. Implementación autorizada directamente por el prompt completo: «Una vez definido, implementa el rediseño dentro del alcance acordado».
