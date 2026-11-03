# Investigación de compatibilidad de reconocimiento de voz — LV-005B-02

## LEARN-02: práctica y recuperación

El panel de preparación permite practicar hablando sin enviar, editar texto y confirmar manualmente la expresión intentada. Estas acciones son locales, sin nota ni nuevo intento educativo. Para avanzar hay un modelo original aceptado disponible desde el principio: preparar borrador y luego responder explícitamente. Un desconocido escrito no crea nuevos errores confirmados ni roast de aventura.

Las guías aproximadas para hispanohablantes nunca se envían a síntesis como pronunciación, reconocimiento como modelo ni evaluación. Originales y grupos revisados mantienen idioma francés/inglés; coach español. Ritmo lento solicitado y fallback de grupos cuando suena igual, sin afirmar diferencia perceptiva no medida. Chrome no cargó; QA físico/acústico pendiente. Ver [informe completo y fuentes](LV-007-LEARN-02-QA.md).

## Actualización LV-007-LEARN-01 (31-oct-2026)

El reconocedor conserva idioma configurado y evidencia opcional de confianza; distingue incertidumbre, ausencia de frase, permisos, servicio/soporte e idioma configurado incompatible. **No detecta con certeza el idioma realmente hablado ni evalúa fonética.** Confianza baja/ausente/incorrecta no genera una mala nota. La revisión previa clasifica texto reconocido válido, texto correspondiente a respuesta incorrecta y texto no verificable, siempre separándolo de calidad oral.

Captura → edición → **Confirmar y usar texto revisado** solo prepara un borrador/opción; enviar al personaje requiere otra acción explícita. Ni capturar ni revisar/editar genera eventos de la misión. Alternativas exactas editoriales se admiten sin aproximación semántica ni adivinación entre opciones. Persisten los avisos del servicio de reconocimiento del navegador y el teclado/opciones como alternativa.

Voz lenta rate0.65 disponible para preparación; su efecto depende del motor instalado. La guía y checkpoints por idioma guardan preparación elegida, nunca audios o dominio. Ver [diagnóstico](LV-007-LEARN-01-DESIGN.md) y [pruebas/QA manual](LV-007-LEARN-01-QA.md). Chrome falló antes de cargar en esta sesión; las pruebas de controlador/componentes no acreditan micrófono físico ni nativo.

Los apartados siguientes conservan la investigación original.

**Alcance comprobado en código:** arquitectura y pruebas automatizadas de transcripción para navegador compatible, no prueba auditiva con micrófono físico. Revisión de documentación pública 2026-10-30.

## Opciones evaluadas

| Alternativa | Compatibilidad / restricciones | Privacidad y costos | Decisión |
| --- | --- | --- | --- |
| **Web Speech API** (`SpeechRecognition` y prefijo `webkitSpeechRecognition`) | API web no universal, Chrome la expone en algunos entornos; requiere origen seguro, autorización de micrófono y disponibilidad del servicio/idioma. Ni Chrome ni una exportación aseguran funcionamiento en todos los equipos. | Sin suscripción ni API key de LingoVerse; **Chrome puede enviar audio a servidores del servicio de reconocimiento** y requerir Internet. Su tratamiento de audio depende del navegador. | **Implementada web con disponibilidad detectada en runtime**, opt-in por pulsación, aviso previo y fallback escrito. |
| Reconocimiento web `processLocally`, `available()` e `install()` | API experimental; requiere disponibilidad/paquetes locales de idioma, compatibilidad y Permissions-Policy. No se presupone disponible para francés en el Chrome del usuario. | Audio local cuando se configura y funciona efectivamente; instalación de paquetes. | Diferida hasta mediciones reales y diseño de modo estrictamente local que no degrade la compatibilidad. |
| `expo-speech-recognition@^57.0.0` | Biblioteca abierta para Expo SDK 57 con plugin de permisos, puente a `SFSpeechRecognizer` (iOS), `SpeechRecognizer` (Android) y web. **Expo Go no incluye el módulo nativo**; necesita build de desarrollo (`expo run:*`/prebuild) y QA en dispositivos. | Paquete sin costo de licencia anunciado; los motores OS pueden utilizar servicios remotos y las condiciones/idiomas varían por dispositivo. | **No instalada**: sin build nativo ni pruebas, no se puede afirmar compatibilidad real. |
| Grabar con Expo Audio y procesar en un servicio STT propio | Implica pipeline adicional, transcodificación, seguridad, proveedor/modelo, almacenamiento temporal, permisos y validaciones por plataforma. | Posibles costos externos, carga de operación y privacidad de grabaciones. | Rechazada para este incremento y presupuesto $0. |

Fuentes de verificación externa:

- MDN: [Using the Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- MDN: [SpeechRecognition: limitaciones y procesamiento remoto en Chrome](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- MDN: [`processLocally` experimental](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally)
- MDN: [`available()` experimental y paquetes locales](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static)
- Proyecto `expo-speech-recognition`: [repositorio y versiones compatibles](https://github.com/jamsch/expo-speech-recognition), [npm](https://www.npmjs.com/package/expo-speech-recognition)

## Implementación y límites reales

- `RecognitionController` conserva solo texto final/provisional transitorio en memoria del componente. No hay `MediaRecorder`, `Blob`, subida de audio desde código de LingoVerse, archivo de audio ni tabla nueva.
- El navegador sí puede administrar/grabar/transmitir audio según su implementación; **no prometer ni publicitar privacidad absoluta**. La aplicación solo explica el límite antes del botón.
- El navegador solicita el permiso cuando llama a `.start()`; LingoVerse no intenta obtener permisos en el montaje. Si no existe API o no hay contexto seguro, no aparece el control; la escritura sigue íntegra.
- Se muestran estados `listening`, `stopping`, `idle`, `error`; se cancelan sesiones al navegar, desmontar, ocultar ventana o arrancar una reproducción de personaje. Se invalidan callbacks atrasados mediante token.
- No se almacena el texto provisional. Tras usar una transcripción, la respuesta sigue el proceso normal de la misión. El texto de ejercicios escritos puede almacenarse según los mecanismos existentes del motor educativo (incluida su retención/reglas); no afirmar que nunca se almacena texto de voz **después de enviarlo como respuesta**.
- No se usa reconocimiento para determinar entonación, velocidad, acento, exactitud fonética ni dominio CEFR. La calidad de la transcripción no equivale a una métrica de pronunciación.
- No se garantiza disponibilidad por idioma/país ni uso sin conexión. Idioma activo del diálogo actual: francés `fr-FR`; no existe aventura inglesa jugable.

## QA manual de micrófono pendiente (Chrome de escritorio)

1. En una rama/copia de trabajo segura con este código, ejecutar `npm run web`; entrar a «Un café en París» sobre `localhost` (HTTPS para un host remoto). Verificar que «Hablar en francés» esté visible solo si el navegador lo soporta. La voz de Camille/Luz fue verificada por el usuario en una etapa previa, **no implica STT verificado**.
2. Pulsar «Escuchar a ...» y luego «Hablar en francés». Comprobar que TTS se detenga, la solicitud real de permiso se origine solo tras pulsar y que el estado diga «Escuchando».
3. Dictar «Bonjour», esperar resultado final o pulsar «Terminar grabación», corregir la transcripción y usarla. Para opción, exigir coincidencia con una etiqueta; comprobar que una frase distinta no seleccione una respuesta incorrecta automáticamente. Comprobar la respuesta mediante el botón ordinario.
4. Probar paso escrito con una frase aceptada; dictar, editar y pulsar «Usar esta transcripción»; comprobar feedback del motor. Repetir con una respuesta incorrecta: debe dar explicación/corrección, no puntuación de pronunciación.
5. Probar permiso denegado, micrófono desconectado, sin Internet/servicio de reconocimiento, texto largo (>400), ruido y silencio. Debe permanecer la opción escrita y no registrar falsas respuestas.
6. Cancelar a mitad de habla, cambiar de escena, navegar a Explorar, ocultar pestaña, escuchar al personaje mientras habla; comprobar que no quede captura en curso ni surja una transcripción antigua al volver.
7. Probar zoom/viewport 320–390 px y teclado real; comprobar scrolling, legibilidad, lector de pantalla. Export web y tests unitarios no sustituyen estos pasos.

## Evidencia de esta entrega

- Pruebas Node con recognizer simulado, **no micro real**: 10 casos añadidos en `tests/speech-input.test.cjs`; suite total 124/124.
- `npm run typecheck:core`: OK; `npm run typecheck`: OK; `npm run lint`: OK; `npm run export:web`: OK.
- Chromium headless disponible en el contenedor, pero política local prohibió abrir `127.0.0.1` y el script QA terminó con error. No hay recorrido web aceptado para LV-005B-02 ni prueba de captura de audio real. Realizar QA en Chrome del usuario antes de marcar entrega final.
