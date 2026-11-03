# LV-007-LEARN-02 — Diagnóstico y plan

## Evidencia antes de editar

Workspace definitivo autorizado, sin `.git`. Baseline181/181 PASS. Respaldo `.backups/LV-007-LEARN-02-20261031-020719/source.zip`,190 archivos verificados por SHA-256 contra manifest. No se utiliza la copia antigua. Validación manual LEARN-01 **no aprobada**, según prueba real del usuario.

## Causa

LEARN-01 excluye rendez-vous y los ejercicios escritos; solo prepara café/bonjour y Londres/greet. La preparación no se aplica a la pregunta reportada ni a las siguientes expresiones nuevas. Ocultar enseñanza hasta fallar tiene sentido para recuperación de memoria, no para primer contacto. Además hay cuatro fases para un saludo, sin construcción guiada, preferencias que ofrecen dos experiencias en lugar de tres y sin evidencia de ayuda en eventos. Bonjour dividido en bon/jour puede sonar mal aislado.

Londres actual v4 ya responde a Do you need help con aceptación de ayuda; v1/v2/v3 guardadas mantienen Hello/Hi. No es necesario mutar contenido antiguo ni crear v5 para esconder esa diferencia. Auditoría de primeras escenas de las tres aventuras se hará contra prompts, alternativas y respuestas reales.

El repositorio de humor ya admite Roast en ambos idiomas, pero MissionScreen y CoachReaction lo restringen en UI a francés. Parte del catálogo menciona café/francés u ocho pasos: no es adecuado habilitarlo indiscriminadamente en Londres. Reutilizar motor y seleccionar explícitamente reacciones existentes compatibles.

## Solución escogida

Extender otra lista de dos escenas dejaría el mismo problema. Se elige preparación transversal de cada turno a partir de **respuestas editoriales ya aceptadas**, con apoyos curados para expresiones frecuentes. No se genera significado ni pronunciación por sustitución de letras; fuera de la tabla fiable se ofrece intención/vocabulario original y audio de frase completa. Sin aventura adicional ni comprensión abierta.

- Tres modos derivados de preferencias compatibles: guided/pre-a1=Desde cero; guided/a1=A1; independent=Autónomo. Conservar clave y datos anteriores por idioma. Desde cero muestra significado del NPC, respuesta, traducción/propósito y aproximación disponible; A1 muestra orientación breve y ayudas opcionales; autónomo intenta primero y puede abrir los mismos apoyos.
- Panel compacto dentro del turno: modelo con audio, fragmentos/vocabulario y práctica oral/construcción bajo divulgación progresiva. Ninguna espera, nota fonética o recorrido obligatorio de diez pantallas. Vía «Preparar esta respuesta con ayuda» disponible desde el principio; después el usuario envía explícitamente. Construcción por segmentos ordenados opcional.
- Modelo validado contra exercise.accepted/choices, respetando rutas, ids y versión. En decisiones varias respuestas correctas permanecen seleccionables; el modelo no decide ni avanza automáticamente. Ayuda vista marca ese intento como asistido aunque se cierre; la práctica por micrófono no genera eventos.
- Evidencia opcional en eventos de respuesta: assisted/independent; ausencia antigua=sin registro, nunca independencia inferida. Replay conserva eventos antiguos, nueva evidencia se valida. Resumen deriva objetivos completados con ayuda/sin modelo, sin certificación ni dominio. Incertidumbre escrita no se cuenta como error confirmado ni habilita burlas; errores técnicos no son respuestas.
- Pronunciación aproximada: catálogo manual original/traducción/IPA/fuentes/aproximación/notas, con revisión editorial independiente por IA contrastada con diccionarios; no afirmar revisión docente humana ni audio verificado. El original siempre principal. «zh», nasales y sonidos ingleses se explican; no transliteración automática. Audio usa solo original y chunks revisados, jamás aproximación española. Bonjour se practica completo.
- Ritmo lento: conservar petición0.65 pero no prometer efecto acústico. Escuchar segmentos revisados es alternativa explícita si la voz suena igual. Verificar callbacks/rate y tratar de medir en Chrome real; si no carga, documentar bloqueo y prueba perceptiva pendiente.
- Roast: acceso visible y consentido consistente en inglés/francés; antes de consentimiento abre acceso existente. Solo reacciones preexistentes explícitamente compatibles en Londres, sin copiar motor ni agregar chistes. Ninguna reacción ante transcripción incierta/solo práctica o error no confirmado. Revocación conserva efecto inmediato.

## Plan de implementación y verificación

1. Escribir tests que reproduzcan falta de guía en rendez-vous/confirm, tres modos, recuperación, catálogo aproximado y seguridad de audio, evidencia/replay e incertidumbre/consentimiento.
2. Añadir `content/pronunciation.ts`, `content/rescue.ts` y `features/learning/LearningRescue.tsx`; conservar componentes anteriores para compatibilidad y corregir segmentación de Bonjour. Integrar sin alterar arte/paleta.
3. Extender eventos y replay con evidencia opcional, provider y resumen; añadir pruebas de partidas antiguas y guardado nuevo. Ajustar contadores solo para errores confirmados nuevos sin reescribir pasado.
4. Integrar práctica oral local, confirmación manual del modelo, respuesta guiada y construcción. Prompts/traducciones/modelos visibles desde cero antes de errores. Preferencias por idioma compatibles.
5. Reparar accesos Roast y elegibilidad lingüística de catálogo existente; mantener consentimiento y exclusión de incertidumbre. Verificar ambos idiomas, todas las regiones.
6. Ejecutar suite, types core/general, lint, export y Chrome si es posible; revisar contenido y código independientemente. Actualizar diagnóstico, auditoría, evidencia, fuentes y QA manual. Probar disposición320/390/1280, lector/teclado/voz real si el entorno permite; no inventar aceptación.
