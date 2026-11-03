# LV-007-LEARN-01 — Diagnóstico, diseño y plan

## Evidencia inicial y protección

Workspace confirmado y autorizado, sin `.git`. Respaldo `.backups/LV-007-LEARN-01-20261031-010218/source.zip`:177 archivos verificados individualmente por SHA-256 contra manifest.json. Incluye fuentes, arte, pruebas, documentos y configuración; no node_modules, perfiles privados ni partidas de navegador. No se utiliza la carpeta antigua.

Baseline real166/166 PASS. El runner descubre todos los archivos `tests/*.test.cjs`; no filtra ocho casos. Handoff describe cinco casos de un archivo ausente `lv007a-continuity.test.cjs` y tres casos no presentes en `mission-presentation.test.cjs`, además de dos documentos ausentes. Esto explica numéricamente174−8=166, pero no permite reconstruir sus aserciones originales ni afirmar que existan. Código de continuidad/modelos verificados presente. Nuevas regresiones se contarán como nuevas, nunca como recuperación histórica ficticia.

## Diagnóstico pedagógico

- Primer turno exige elegir/responder antes de enseñar pronunciación; traducción y enseñanza están ocultas para proteger recuerdo, aunque un principiante todavía no tiene nada que recordar.
- Londres v3: pregunta inicial «Do you need help?» con opciones solo Hello/Hi. Se requiere una respuesta completa que acepte ayuda. Café: Bonjour corresponde correctamente al saludo diurno en todas sus variantes.
- TTS fija rate0.9; no existe control lento para estudiar una expresión. Las voces pueden faltar y están apagadas por defecto.
- STT ya ofrece edición y no mide pronunciación, pero no conserva evidencia de confianza/idioma configurado, no distingue revisión del texto de evaluación y no prepara expresiones. La opción conocida incorrecta puede pasar al borrador; nunca debe transformarse en error educativo automáticamente.
- El reinicio conserva confirmación, pero usa un botón con demasiado peso cerca del flujo de lectura.

## Decisiones de implementación

Se considera extender todas las escenas (demasiado contenido para esta tarea) o una preparación transversal solo visual (no enseña expresión concreta). Se elige un módulo finito y tipado en dos escenas existentes: café/bonjour y Londres/greet. No se añade otra aventura ni se modifica el esquema de misiones.

1. **Ayuda por idioma**, repositorio separado `lingoverse.learning-support.v1`. Desde cero/pre-A1 es orientación elegida por la persona, no evaluación. A1 orientativo permite autonomía. Modelo preparado para niveles posteriores; solo pre-A1/A1 se ofrecen, sin cursos superiores ficticios. Modo guiado/autónomo puede cambiar sin reiniciar la misión. Checkpoints por expresión guardan preparación realizada, nunca dominio ni calidad oral.
2. **Guía**: escuchar modelo en su idioma, significado, partes editoriales, frase completa/repetición voluntaria y respuesta al NPC. Cada paso avanza por decisión explícita, no finge haber escuchado ni pronunciado. Si falta voz, se explica y se permite leer/seguir; no se puede garantizar enseñanza oral sin una voz instalada. Transferencia breve a situación relacionada tras acierto, sin XP ni otro recorrido. Quien conoce la expresión puede saltar preparación o volver a practicar.
3. **Voz lenta**: solicitud opcional de velocidad al controlador/adaptadores, valor acotado; rate normal0.9, lento0.65. Misma selección de idioma, cola, cancelación, opt-in de red y consentimiento adulto. El motor puede limitar la velocidad; no se promete pronunciación idéntica al aislar palabras.
4. **STT**: estados de permiso/no reconocimiento/idioma configurado incompatible y evidencia incierta. La confianza del navegador es solo una pista de reconocimiento: no se muestra como nota ni se usa para aprobar automáticamente. Sin confianza se mantiene incertidumbre. Comprobar coincidencia del texto con el catálogo no identifica sonidos. Idioma configurado se verifica; no se inventa detección del idioma realmente hablado.
5. **Revisión previa**: transcript válido, texto correspondiente a respuesta incorrecta, texto fuera del catálogo o evidencia incierta se presentan antes de usarlo. Confirmación explícita de texto revisado y posterior respuesta al personaje. Ninguna transcripción produce eventos/errores/humor por sí sola. Teclado/opciones siempre presentes.
6. **Contenido**: archivar Londres v3 y crear v4 para las opciones iniciales coherentes. Mantener ids, número de objetivos, alternativas y archivos v1/v2/v3 para replay. Partidas guardadas continúan su versión; nuevos recorridos usan v4. Francés y rendez-vous no se alteran.
7. **UX**: mismo arte/tokens/diálogo de LV-007-UI-01; guía dentro del turno, sin formulario extra. Ayuda/micrófono accesibles, límites de transcripción y privacidad existentes. Reinicio pasa a acción textual discreta conservando confirmación.

## Plan y contratos

- Escribir y ejecutar primero tests de `advancePreparation`, `beginnerPhrase`, `inspectTranscript`, repositorio de ayuda, rate y compatibilidad Londres v3/v4. Comprobar fallos reales antes de implementación.
- `src/domain/learning/support.ts`: estado versionado, pasos y validación. `src/content/beginner.ts`: dos expresiones, partes y transferencia con ids estables. `src/storage/learningSupportRepository.ts`: actualizaciones serializadas que conservan el otro idioma y nunca escriben misiones.
- `src/domain/voice/transcriptReview.ts`: inspección pura, sin puntuación ni persistencia; ampliar recognitionWeb/recognition con metadatos opcionales y errores diferenciados. Añadir rate opcional a SpeechRequest/SpeechDriver y ambos adaptadores.
- `LearningSupportProvider`, selector de nivel/modo y `BeginnerPreparation` integrados desde MissionScreen/ExerciseView; los tests antiguos sin props de ayuda conservan su contrato autónomo.
- Archivar v3 desde la copia actual y actualizar registro de contenido/repo inglés; probar replay y recorridos anteriores/nuevos.
- Ejecutar tests de componentes con primitivas sustituidas para progresión y separación entre STT y envío; suite completa, types/lint/export y navegador real si es posible.
- Actualizar visión/roadmap con Roast Me Live futuro, diagnóstico, resultados reales y guía para principiantes. Sin aprobar visual/audio por compilar.

Fuente técnica primaria consultada: [Web Speech API](https://webaudio.github.io/web-speech-api/), apartados SpeechRecognitionAlternative y SpeechSynthesisUtterance. Confianza corresponde al reconocimiento; rate depende de la voz/motor. No se implementan las APIs experimentales de reconocimiento local ni descargas de paquetes de idiomas.
