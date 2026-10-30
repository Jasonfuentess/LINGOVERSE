# LingoVerse — Visión de Producto V3

**Estado:** Dirección de producto acordada. Pendiente de implementación y validación técnica.

## 1. Concepto principal

LingoVerse es una experiencia de aprendizaje de inglés y francés basada en aventuras narrativas, conversaciones, exploración y progresión educativa.

La aplicación debe sentirse como una experiencia interactiva con personajes, no como una sucesión de cuestionarios.

**Principio central: aprender hablando, escuchando, tomando decisiones y viviendo historias.**

Público visual objetivo: jóvenes y adultos. Identidad moderna, atractiva, expresiva y de alta calidad, evitando una estética excesivamente infantil.

## 2. Experiencia conversacional

Las conversaciones son el núcleo de LingoVerse.

El usuario debe poder:

- Escuchar a personajes hablar en el idioma que aprende.
- Responder hablando cuando exista soporte técnico fiable.
- Escribir o seleccionar respuestas como alternativas accesibles.
- Recibir explicaciones educativas y reacciones del entrenador.
- Continuar una conversación según las decisiones tomadas.
- Reproducir nuevamente los diálogos.

La experiencia oral es una capacidad prioritaria pendiente de implementación. No presentar reconocimiento, calidad de pronunciación ni acentos regionales como capacidades verificadas hasta probarlas.

El diálogo escrito debe seguir siendo completamente funcional cuando el micrófono o la síntesis de voz no estén disponibles.

## 3. Explorador de Idiomas

Explorador de Idiomas será el concepto que conecte las experiencias de aprendizaje.

Cada idioma tendrá destinos, aventuras y objetivos educativos.

Destinos iniciales propuestos:

- Francés A1: París.
- Inglés A1: Londres.

Cada destino contendrá aventuras con personajes, situaciones, decisiones y expresiones útiles.

El usuario podrá elegir aventuras y regresar a ellas para practicar, sin depender de un mundo 3D ni de desplazamiento libre.

El mapa será una herramienta visual de navegación narrativa.

## 4. Entrenadores regionales y Roast Me

Conservar los cuatro entrenadores regionales de El Salvador, México, Colombia y Argentina.

Los entrenadores tendrán vocabulario, expresividad, personalidad y humor propios.

Las referencias humorísticas podrán ser internacionales: memes, fútbol, videojuegos, cine, anime y situaciones absurdas.

Una misma referencia podrá recibir interpretaciones editoriales distintas por entrenador.

Roast Me funcionará de dos maneras:

1. Como experiencia independiente dentro de Modo Sin Pena.
2. Como estilo opcional de las reacciones del entrenador durante aventuras compatibles.

Las reacciones deberán relacionarse con el contexto y con errores comprobables, nunca con fallos inventados.

El humor adulto será voluntario, desactivado por defecto y sujeto a consentimiento explícito y revocable.

La reproducción por voz de reacciones adultas seguirá estas mismas restricciones.

## 5. Diario del Explorador

El Diario del Explorador será el registro personal de las aventuras vividas.

**Dirección visual:** travel scrapbook premium, inspirado en cuadernos de viaje físicos.

Elementos característicos:

- Papel envejecido y kraft.
- Mapas.
- Postales.
- Estampillas.
- Boletos.
- Notas y recortes.
- Fotografías o ilustraciones de destinos.
- Composiciones editoriales y tipografía legible.

La interfaz debe adaptar esos elementos a pantallas móviles, evitando saturación y problemas de rendimiento.

Cada entrada podrá incluir:

- Destino y nombre de la aventura.
- Resumen narrativo de lo ocurrido.
- Decisiones relevantes registradas.
- Expresiones y habilidades practicadas.
- Nota contextual del entrenador.
- Recuerdos desbloqueados.
- Acceso a repasar lo aprendido.

El diario se construirá mediante contenido editorial versionado y eventos educativos reales.

No inventar experiencias ni almacenar indiscriminadamente respuestas escritas o grabaciones del usuario.

## 6. Pasaporte Lingo

El pasaporte representará destinos visitados y habilidades demostradas.

Los sellos podrán reflejar tres niveles:

- Visitado.
- Aventura completada.
- Habilidad demostrada mediante evaluación o repaso posterior.

Completar una misión no equivaldrá automáticamente a dominar sus contenidos.

El pasaporte y el diario deberán utilizar el mismo progreso compartido para evitar inconsistencias.

## 7. Recompensas

Sistema propuesto:

- XP por actividades educativas.
- Sellos por aventuras y dominio.
- LingoCoins como moneda virtual interna.
- Postales y coleccionables.
- Personalización opcional del perfil o pasaporte.

Las monedas no podrán comprar respuestas correctas, dominio CEFR ni acceso a enseñanza esencial.

Evitar recompensas desproporcionadas por repetir ejercicios fáciles, castigos por faltar días y monetización de tipo pay-to-win.

No incorporar economía virtual avanzada a la primera beta sin una evaluación posterior.

## 8. Modos existentes

Conservar cinco secciones principales:

**Inicio:** próxima aventura, progreso y accesos rápidos.

**Explorar:** destinos, historias y acceso destacado a Modo Sin Pena.

**Practicar:** vocabulario, repaso, dificultades y habilidades.

**Trabajo:** conversaciones profesionales y situaciones laborales.

**Perfil:** estadísticas, preferencias, pasaporte, diario y colección.

Roast Me conserva su identidad independiente.

Mamá de LATAM permanece como idea futura en evaluación, no como requisito de beta.

## 9. Arquitectura

Reutilizar los motores y contratos existentes siempre que sea posible:

- Learning Engine para ejercicios y evaluación.
- Variety Engine para variación y control de repeticiones.
- Humor Engine para reacciones editoriales.
- Persistencia local y contenido versionado.
- Sistema de progreso para habilidades y misiones.

Los componentes de conversación oral, diarios, destinos y recompensas deben integrarse sin duplicar la lógica de evaluación.

No introducir servicios de pago, nube obligatoria o generación de texto mediante IA sin justificación y aprobación.

## 10. Prioridades de implementación

**Primero: consolidar el aprendizaje conversacional.**

Ampliar aventuras jugables y mejorar la presentación narrativa. Implementar y validar progresivamente audio, reproducción y entrada oral cuando sea técnicamente viable.

**Segundo: Diario del Explorador V1.**

Crear una entrada funcional basada en la aventura de la cafetería, con estilo scrapbook, información real y acceso a repaso.

**Tercero: Pasaporte V1.**

Relacionar destinos, aventuras y habilidades con sellos y progreso persistente.

**Cuarto: recompensas ligeras.**

Incorporar recuerdos y logros útiles antes de construir una economía completa.

**Quinto: QA de beta.**

Probar recorridos reales en Android, web móvil y plataformas adicionales compatibles; teclado, audio, consentimiento, accesibilidad y persistencia.

## 11. Criterios de calidad

- Las aventuras deben sentirse como conversaciones, no formularios.
- Las correcciones deben ser educativas y contextuales.
- Las elecciones deben tener consecuencias coherentes cuando corresponda.
- El diseño debe ser atractivo, adulto y legible.
- Ninguna funcionalidad debe fingir capacidades de IA, audio o evaluación que no posee.
- La aplicación debe seguir siendo útil cuando el audio no esté disponible.
- El progreso existente debe conservarse mediante migraciones compatibles.
- Cada fase debe contar con pruebas, documentación y QA verificable.

**Identidad resumida:**

LingoVerse combina aventuras narrativas modernas, conversaciones, humor regional, un diario scrapbook de viajes y un pasaporte que celebra lo aprendido.

*Aprende conversando. Explora el mundo. Colecciona tus historias.*
