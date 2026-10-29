# LINGOVERSE — PROMPT MAESTRO DE DESARROLLO V2

## ROL Y OBJETIVO

Actúa como un equipo senior de arquitectura de software, desarrollo móvil, UX/UI, diseño de videojuegos, enseñanza de idiomas, ingeniería de audio y QA.

Desarrollaremos una aplicación móvil gratuita para aprender inglés y francés mediante aventuras, conversaciones, simulaciones, juegos, humor latinoamericano y aprendizaje profesional.

**Nombre provisional:** LingoVerse.

El objetivo es construir una aplicación publicable, entretenida, educativa y escalable, con un presupuesto inicial de infraestructura de $0.

La aplicación NO debe sentirse como una colección repetitiva de tarjetas y preguntas.

**PRINCIPIO FUNDAMENTAL: CADA SESIÓN DEBE TENER LA POSIBILIDAD DE SENTIRSE DIFERENTE.**

La variedad debe estar presente en conversaciones, ejercicios, escenarios, entrenadores, bromas y recompensas.

Aceptamos que algunas respuestas se repitan ocasionalmente. No pretendemos una cantidad matemáticamente infinita de contenido, sino una experiencia amplia, natural, impredecible y ampliable.

---

# 1. PLATAFORMAS Y STACK

Desarrollar una aplicación MOBILE-FIRST con soporte para:

- Android nativo.
- iOS nativo.
- Web móvil, especialmente Safari en iPhone.

Tecnologías:

- React Native.
- Expo.
- TypeScript estricto.
- Expo Router.
- React Native Web.
- NativeWind, previa verificación de compatibilidad.
- React Native Reanimated.
- Zustand.
- Expo Audio.
- Expo SQLite para almacenamiento nativo.
- Adaptador de almacenamiento persistente web.
- Supabase Auth y PostgreSQL como integración posterior.
- EAS Build.
- Exportación web para Cloudflare Pages.
- Pruebas unitarias y E2E compatibles con las plataformas.

Usar versiones estables y compatibles.

No incluir servicios de pago obligatorios.

No implementar todavía un servidor .NET.

Mantener una arquitectura preparada para incorporar ASP.NET Core o servicios de IA posteriormente.

La aplicación debe funcionar localmente sin configurar Supabase.

---

# 2. ARQUITECTURA

Separar la aplicación en motores independientes.

## Learning Engine

Gestiona:

- Vocabulario.
- Gramática.
- Ejercicios.
- Evaluaciones.
- Progresión CEFR.
- Repetición espaciada.
- Habilidades.
- Repasos.
- Dificultad adaptativa.

## Dialogue Engine

Gestiona:

- Conversaciones ramificadas.
- Personajes.
- Escenarios.
- Objetivos.
- Decisiones.
- Consecuencias.
- Variantes de conversaciones.
- Historial narrativo.

## Humor Engine

Gestiona:

- Reacciones humorísticas.
- Bromas.
- Insultos coloquiales consentidos.
- Personalidades.
- Memoria contextual.
- Reacciones dinámicas.
- Variaciones de humor.

## Variety Engine

**Este motor es fundamental y obligatorio.**

Será responsable de evitar que la experiencia resulte monótona.

Debe funcionar tanto para el contenido educativo como para las conversaciones y los entrenadores.

## Voice Engine

Gestiona:

- Reproducción de audio.
- Voces regionales.
- Pronunciación educativa.
- Disponibilidad.
- Proveedores intercambiables.
- Recursos de audio.
- Fallback a texto.

## Progress Engine

Gestiona:

- Progreso.
- XP.
- Rachas flexibles.
- Logros.
- Misiones.
- Estadísticas.
- Frases legendarias.
- Memoria de dificultades.

Separar los motores de los componentes React Native.

Mantener modelos y contratos TypeScript claros.

---

# 3. VARIETY ENGINE — SISTEMA ANTIRREPETICIÓN

Este requisito tiene prioridad alta.

No quiero que un usuario entre a estudiar diez días y siempre encuentre las mismas respuestas, bromas y situaciones.

Construir un motor que seleccione contenido considerando el contexto actual y las interacciones anteriores.

## Requisitos

### A. Historial de contenido

Registrar identificadores de:

- Reacciones utilizadas.
- Ejercicios presentados.
- Conversaciones completadas.
- Variantes de diálogos.
- Chistes mostrados.
- Errores frecuentes.
- Personajes utilizados.
- Misiones completadas.

### B. Selección ponderada

No utilizar simplemente un `Math.random()` que seleccione entre cinco frases.

Implementar selección ponderada que considere:

- Relevancia contextual.
- Frecuencia de aparición.
- Recencia.
- Personalidad.
- Categoría de reacción.
- Nivel del usuario.
- Tipo de error.
- Número de intentos.
- Dificultad.
- Progreso previo.

Priorizar contenido relevante poco utilizado.

Permitir repeticiones cuando sean apropiadas.

### C. Composición de respuestas

Las reacciones pueden combinar elementos editoriales compatibles:

- Introducción.
- Sorpresa.
- Burla contextual.
- Referencia a errores anteriores.
- Reacción emocional.
- Corrección educativa.
- Desafío de reintento.

Ejemplo:

Contexto:
El usuario falla por quinta vez una palabra francesa que también falló ayer.

Resultado posible:

"¡NOOOO, MAJE! JAJAJA. ¿OTRA VEZ HEUREUX? 💀 ¡Si ayer casi nos declarás la guerra con Francia por esa mierda! Va, repetilo, pero ahora despacio."

En otra sesión podría responder:

"¡PUTAAA, CEROTE! ¿TODAVÍA ESTAMOS PELEANDO CON HEUREUX? JAJAJA. Esa palabra ya te tiene de hijo. Va, vamos por partes."

No utilizar combinaciones incoherentes ni insertar variables de manera que destruyan la naturalidad de la frase.

### D. Memoria humorística

Permitir bromas recurrentes basadas en errores reales.

Ejemplo:

Día 1:
"¿QUÉ PUTAS DIJISTE, MAJE?"

Día 3:
"¡NOOO, REGRESÓ TU ENEMIGO! ¿Te acordás de heureux?"

Día 6, cuando finalmente mejora:
"¡AL FIN, CEROTE! JAJAJA. ¡SE ACABÓ LA GUERRA CON FRANCIA!"

El usuario debe sentir que el entrenador recuerda su progreso.

### E. Variedad educativa

También deben variar:

- Orden de ejercicios.
- Vocabulario en contexto.
- Escenarios.
- Interlocutores.
- Tipos de preguntas.
- Conversaciones.
- Ejemplos.
- Desafíos.

Sin comprometer la progresión pedagógica ni introducir contenidos que todavía no se han enseñado.

Las repeticiones necesarias para aprender deben mantenerse. Evitar la monotonía no significa eliminar la repetición espaciada.

### F. Expansión del contenido

Preparar una arquitectura que permita agregar paquetes de contenido mediante JSON versionado u otro formato validado.

No requerir modificar el código de las pantallas cada vez que agreguemos bromas, escenarios o conversaciones.

Crear validadores de contenido, identificadores estables y soporte para versiones.

El sistema debe funcionar inicialmente sin IA generativa.

Documentar que una biblioteca finita y reglas combinatorias ofrecen variedad amplia, pero no contenido literalmente infinito.

---

# 4. IDENTIDAD VISUAL

Crear una aplicación con identidad original, moderna, memorable y entretenida.

No copiar Duolingo.

Tienes libertad creativa para escoger:

- Paleta.
- Tipografías.
- Componentes.
- Ilustraciones.
- Estilo de personajes.
- Animaciones.
- Transiciones.
- Recompensas.

Debe transmitir calidad de aplicación premium, pero permanecer gratuita.

Evitar apariencia excesivamente infantil.

Priorizar una experiencia móvil fluida y responsive.

Incluir estados de carga, error, vacío y accesibilidad.

No utilizar recursos sin licencias apropiadas.

---

# 5. NAVEGACIÓN

Crear cinco secciones principales:

**Inicio:** misión recomendada, idioma, nivel, progreso y repasos.

**Explorar:** aventuras, historias, escenarios y capítulos.

**Practicar:** ejercicios, vocabulario, gramática y laboratorio de errores.

**Trabajo:** aprendizaje especializado, situaciones laborales y entrevistas.

**Perfil:** estadísticas, logros, entrenadores, preferencias y Frases Legendarias.

Modo Sin Pena debe ser fácilmente accesible desde Inicio o Explorar.

---

# 6. IDIOMAS

Idiomas de aprendizaje:

- Inglés.
- Francés.

Idioma principal de interfaz:

- Español.

Preparar internacionalización de la interfaz.

La organización pedagógica seguirá como referencia los niveles CEFR A1–C2.

Solamente desarrollar contenido inicial A1 en la primera implementación.

No afirmar que existen cursos completos de niveles todavía no desarrollados.

Separar claramente:

- `learningLanguage`
- `interfaceLanguage`
- `coachLocale`
- `voiceProvider`

---

# 7. AVENTURAS INTERACTIVAS

El aprendizaje debe sentirse como participar en una historia.

Ejemplo francés A1:

El usuario llega a París y entra en una cafetería.

Debe aprender a:

- Saludar.
- Pedir comida.
- Comprender preguntas.
- Responder.
- Agradecer.
- Despedirse.

Las respuestas cambian aspectos de la conversación.

Implementar distintas variantes de los diálogos, respetando los objetivos educativos.

Un usuario que repite una misión puede encontrar preguntas o intervenciones diferentes.

Crear personajes con personalidades reconocibles.

Registrar vocabulario aprendido para reutilizarlo en sesiones posteriores.

Evitar largas secuencias de preguntas de opción múltiple sin contexto.

---

# 8. MODO PROFESIONAL

Crear una sección para aprender el idioma necesario en diferentes profesiones.

Categorías previstas:

- IT Support.
- Customer Service.
- Healthcare.
- Hospitality.
- Sales.
- Construction.
- Office & Business.
- Job Interviews.

Implementar inicialmente una misión corta de IT Support.

Simular conversaciones con clientes y problemas técnicos.

Permitir varias maneras correctas de resolver una conversación cuando corresponda.

No utilizar siempre un único diálogo fijo.

Las explicaciones deben enseñar vocabulario útil y expresiones naturales del trabajo.

---

# 9. MODO SIN PENA

Crear una sección especial con:

- Roast Me.
- Mamá de LATAM.
- Batalla de Acentos.
- Frases Legendarias.
- Discusiones.
- Coqueteo.
- Situaciones Incómodas.

Las experiencias deben utilizar los mismos motores de aprendizaje, diálogo y variedad.

No duplicar lógica educativa por cada modalidad.

Las conversaciones de discusión y coqueteo también deben tener ramificaciones, diferentes personalidades y respuestas variadas.

Preparar modelos para estas modalidades, implementando inicialmente solo un subconjunto funcional.

---

# 10. ROAST ME — SIN FILTRO

Crear entrenadores con humor agresivo, sarcasmo, insultos amistosos y expresiones coloquiales.

Ejemplo salvadoreño:

"¡Y ESA MIERDAAAAA! JAJAJA. ¿QUÉ PUTAS DIJISTE, MAJE? JAJAJA. No jodás, pero va, dale, volvé a intentarlo."

Ejemplo cuando acierta:

"¡PUTAAAA, MAJE! ¡AL FIN TE SALIÓ! Aunque siento que fue pura guasa, cerote. A ver, otra vez."

Ejemplo contextual:

"¡EY, CEROTE! ¿TE ACORDÁS DE HEUREUX? JAJAJA. ¡LA VEZ PASADA CASI NOS DECLARÁS LA GUERRA EN FRANCIA! Veamos si hoy te sale."

No quiero una lista pequeña de respuestas que se repita continuamente.

Crear una biblioteca extensible con:

- Bromas generales.
- Reacciones a errores.
- Reacciones a aciertos.
- Celebraciones.
- Frustraciones.
- Chistes contextuales.
- Referencias a errores anteriores.
- Desafíos.
- Frases legendarias.

Cada reacción debe contar con metadatos para que Variety Engine seleccione la más apropiada.

El humor puede ser vulgar, pero debe ser voluntario y no utilizar amenazas reales ni ataques discriminatorios o basados en características personales sensibles.

Siempre debe existir una corrección educativa cuando sea necesaria.

No inventar errores de pronunciación que no se hayan podido evaluar de forma fiable.

---

# 11. MAMÁ DE LATAM

Crear un personaje humorístico inspirado en los memes de mamás latinoamericanas.

Debe tener:

- Regaños exagerados.
- Sarcasmo.
- Cariño.
- Dramaticidad.
- Celebraciones.
- Bromas recurrentes.
- Memoria de errores.

Ejemplo:

"¡AY, MIJO! ¡SI ESA PALABRA TE LA EXPLIQUÉ AYER! ¡MIRÁ QUE YO NO TE CRIÉ PARA QUE UN FRANCÉS TE HUMILLE EN UNA PANADERÍA!"

Cuando acierta:

"¡AY, MI AMOR, QUÉ INTELIGENTE ME SALIÓ ESTE CIPOTE! JAJAJA. Pero repetilo, no vaya a ser pura chiripa."

La personalidad debe ser diferente de Roast Me.

No limitarse a cambiar palabras dentro de los mismos insultos.

---

# 12. ENTRENADORES REGIONALES

Países iniciales:

- El Salvador (`es-SV`).
- México (`es-MX`).
- Colombia (`es-CO`).
- Argentina (`es-AR`).

Los cuatro deben tener textos regionalizados desde la primera versión.

Cada uno debe contar con expresiones, humor y personalidad propios.

**IMPORTANTE SOBRE VOCES:**

Solo habilitar inicialmente infraestructura de voz de entrenadores para El Salvador.

Los demás tendrán sus textos completos, con posibilidad de agregar audio posteriormente.

No exigir grabaciones de amigos.

No clonar voces humanas.

No simular audio inexistente.

Los entrenadores deben funcionar correctamente sin audio.

La pronunciación de las lecciones de inglés y francés debe utilizar voces educativas apropiadas para esos idiomas, independientemente del país del entrenador.

---

# 13. VOICE ENGINE

Diseñar una capa intercambiable que admita:

- Audio estático.
- Voz sintética previamente generada.
- Futuros proveedores de audio.
- Futuras grabaciones humanas autorizadas.
- Fallback a texto.

Crear un manifiesto de audios con identificador, personaje, región, categoría, archivo, licencia y estado.

Preparar un adaptador para voces salvadoreñas, sin depender de claves externas durante el uso normal.

No incorporar generación de voz en tiempo real mediante APIs de pago.

Permitir asociar audio a reacciones completas.

Cuando una reacción dinámica no tenga audio compatible, mostrarla en texto.

No unir arbitrariamente fragmentos de audio si el resultado suena antinatural.

Diseñar el sistema de forma que pueda recibir nuevas voces sin modificar Learning Engine ni Humor Engine.

No presentar una voz como disponible hasta que exista un recurso reproducible.

---

# 14. PRONUNCIACIÓN

Crear la infraestructura para ejercicios orales.

Usar reproducción de pronunciación correcta en inglés y francés cuando exista soporte.

Diseñar contratos para futuros sistemas de reconocimiento y análisis de voz.

No confundir transcripción con precisión fonética.

No asignar puntuaciones inventadas.

Si el reconocimiento no está disponible, ofrecer ejercicios alternativos.

Solicitar permiso de micrófono solamente cuando se utilice.

No guardar grabaciones privadas por defecto.

---

# 15. FRASES LEGENDARIAS

Permitir coleccionar las mejores reacciones de los entrenadores.

Cada frase debe registrar:

- ID.
- Texto.
- Personaje.
- País.
- Categoría.
- Fecha.
- Audio opcional.
- Contexto general.

Permitir guardar favoritas, consultarlas y preparar tarjetas compartibles.

La colección debe ser persistente.

No compartir información privada del usuario.

---

# 16. BATALLA DE ACENTOS

Preparar un modo donde dos entrenadores participen en una práctica.

Ejemplo:

Entrenador salvadoreño contra entrenador argentino.

Ambos pueden:

- Proponer desafíos.
- Reaccionar.
- Bromear entre sí.
- Comentar aciertos.
- Hacer referencias a errores.

El motor debe escoger comentarios variados para ambos.

La primera versión podrá ejecutarse por texto.

No requerir audio de Argentina, México o Colombia.

---

# 17. GAMIFICACIÓN

Crear:

- XP.
- Logros.
- Rachas flexibles.
- Misiones.
- Desbloqueos.
- Recompensas.
- Progreso por habilidad.
- Repetición espaciada.

La aplicación debe demostrar progreso educativo.

No limitar la motivación a una racha diaria.

Evitar castigos excesivos cuando alguien deja de estudiar.

Crear evaluaciones iniciales y posteriores para comparar habilidades cuando exista contenido suficiente.

---

# 18. CONSENTIMIENTO Y PRIVACIDAD

Los modos con groserías explícitas deben ser opcionales y estar desactivados inicialmente.

Mostrar aviso claro sobre:

- Lenguaje vulgar.
- Insultos humorísticos.
- Sarcasmo agresivo.
- Carácter voluntario.
- Posibilidad de desactivar el contenido.

Solicitar confirmación de mayoría de edad y consentimiento explícito.

Versionar y registrar el consentimiento cuando exista persistencia adecuada.

No asumir que la aceptación elimina toda responsabilidad legal.

Documentar una revisión pendiente de privacidad y clasificación por edades para tiendas.

No almacenar audio de usuarios sin permiso específico.

Permitir gestionar y eliminar datos personales cuando existan cuentas.

---

# 19. ALMACENAMIENTO Y CUENTAS

Permitir acceso como invitado.

Guardar localmente:

- Idioma.
- Entrenador.
- Preferencias.
- Progreso.
- Errores.
- Repasos.
- Frases legendarias.
- Consentimientos cuando corresponda.

Utilizar repositorios y adaptadores intercambiables.

Preparar modelos y migraciones futuras para Supabase PostgreSQL con RLS.

No exigir Supabase para el prototipo.

No implementar sincronización ficticia.

---

# 20. PRIMERA ENTREGA JUGABLE

Desarrollar un vertical slice funcional que incluya:

1. Proyecto Expo configurado.
2. Navegación móvil.
3. Sistema visual original.
4. Onboarding.
5. Selección de inglés y francés.
6. Selección de entrenador regional.
7. Modo invitado.
8. Inicio funcional.
9. Una misión francesa A1 con al menos ocho interacciones.
10. Una misión inglesa A1 con al menos ocho interacciones.
11. Una misión profesional breve de IT Support.
12. Un ejercicio funcional de Roast Me.
13. Un ejercicio funcional de Mamá de LATAM.
14. Biblioteca inicial de reacciones para cuatro regiones.
15. Variety Engine funcional.
16. Reacciones contextuales y registro de las utilizadas.
17. Memoria local de errores.
18. Consentimiento para modo adulto.
19. Colección persistente de Frases Legendarias.
20. Voice Engine preparado para audio salvadoreño.
21. Manejo de audio ausente.
22. Progreso persistente.
23. Compatibilidad web básica.
24. Pruebas automatizadas.

Priorizar profundidad funcional sobre cantidad de pantallas.

No implementar menús decorativos que aparenten tener funciones inexistentes.

---

# 21. PRUEBAS ESPECIALES DE VARIEDAD

Crear pruebas automatizadas para el Variety Engine.

Verificar que:

- Las reacciones correspondan al contexto.
- El entrenador conserve su personalidad.
- La selección priorice frases poco utilizadas cuando existan alternativas relevantes.
- No exista una secuencia fija predecible de comentarios.
- Las conversaciones puedan variar sin romper sus objetivos.
- Se mantenga el progreso educativo.
- Las bromas recurrentes se basen en hechos registrados.
- Se permitan repeticiones ocasionales.
- El sistema funcione con bibliotecas pequeñas.
- El historial persista adecuadamente.
- Ninguna reacción mencione errores no detectados.
- Las plantillas no produzcan texto incoherente.
- Un país sin audio continúe funcionando mediante texto.

Utilizar una fuente de aleatoriedad inyectable o semillas controladas para que las pruebas sean reproducibles.

Crear también una simulación automatizada de muchas sesiones para medir la distribución de reacciones y detectar repeticiones excesivas.

Documentar los resultados y las limitaciones reales.

---

# 22. DOCUMENTACIÓN

Crear:

- `README.md`
- `AGENTS.md`
- `docs/PRODUCT_VISION.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/LEARNING_ENGINE.md`
- `docs/DIALOGUE_ENGINE.md`
- `docs/HUMOR_ENGINE.md`
- `docs/VARIETY_ENGINE.md`
- `docs/VOICE_SYSTEM.md`
- `docs/CONTENT_MODEL.md`
- `docs/PRIVACY_AND_CONSENT.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_STATE.md`

Documentar cómo agregar:

- Nuevos entrenadores.
- Nuevos países.
- Nuevas voces.
- Nuevas bromas.
- Nuevos escenarios.
- Nuevos idiomas.
- Nuevas profesiones.

Incluir instrucciones de ejecución Android, iOS cuando sea viable y web.

---

# 23. FORMA DE TRABAJO

Trabajar incrementalmente.

Primero inspeccionar el entorno y verificar versiones compatibles.

Después:

1. Crear la arquitectura.
2. Crear el diseño visual.
3. Implementar la navegación.
4. Construir Learning Engine.
5. Construir Dialogue Engine.
6. Construir Variety Engine.
7. Construir Humor Engine.
8. Implementar personajes regionales.
9. Integrar progresión y persistencia.
10. Incorporar infraestructura de audio.
11. Ejecutar pruebas.
12. Documentar resultados.

Si el alcance completo no cabe razonablemente en una sola ejecución, priorizar la primera misión jugable y los motores necesarios, dejando documentación precisa del trabajo pendiente.

No gastar dinero.

No publicar en producción sin autorización.

No afirmar que una funcionalidad está terminada sin comprobarla.

---

# 24. CRITERIO FINAL DE ÉXITO

Quiero abrir la aplicación en un celular y sentir que estoy jugando algo entretenido mientras aprendo francés o inglés.

Quiero que los personajes tengan personalidad.

Quiero que sus bromas parezcan naturales.

Quiero que recuerden mis errores.

Quiero que las conversaciones evolucionen.

Quiero que repetir una lección no sea exactamente repetir la misma experiencia.

Quiero que existan numerosas respuestas posibles y que podamos agregar muchas más posteriormente.

No me importa si ocasionalmente vuelve a aparecer un chiste, una conversación o una reacción.

**Lo que NO quiero es que el usuario pueda predecir todo lo que ocurrirá después de estudiar unos cuantos días.**

La aplicación debe combinar aprendizaje real, variedad, humor, diseño excelente y progreso demostrable.

No construyas solamente un prototipo visual. Construye los fundamentos funcionales de un producto móvil real, modular y preparado para su lanzamiento público.

**Prioridad máxima: una experiencia educativa genuinamente divertida, no monótona y sostenible con un presupuesto inicial de $0.**