# LV-006B — Un rendez-vous à Paris: diseño narrativo y guía de aceptación

## Experiencia y propósito A1

**Misión:** llegar a encontrarse con una amistad cuando un mensaje o una pista no bastan para encontrarla. La ayuda de personajes diferentes permite pedir direcciones, confirmar un movimiento y comprender instrucciones sencillas. **No** es una prueba de pronunciación: el micrófono produce una transcripción editable y el motor local evalúa expresiones revisadas.

La secuencia de diez objetivos, en orden en las cuatro rutas, es:

| Momento | Qué ocurre | Qué se enseña |
|---|---|---|
| 1. Saludo | Un desconocido te saluda junto al jardín o al río | `Bonjour` / `Bonsoir`, iniciar conversación |
| 2. Confirmación | Explicás por qué estás allí | `J'ai rendez-vous`, `j'attends une amie / un ami` |
| 3. Reconocimiento | Recordás la pista del lugar | `fontaine` o `kiosque`, artículos y contexto |
| 4. Preguntar | Pedís dónde queda el punto de encuentro | `Où est… ?`, `s'il vous plaît` |
| 5. Distancia | Interpretás si el lugar está cerca | `près`, `pas loin`, `loin` |
| 6. Elección | Elegís por dónde caminar | `Je préfère…`, preferencias y consecuencias |
| 7. Aclaración | Un segundo personaje confirma un movimiento | `tout droit`, `à gauche`, `à droite` |
| 8. Comprensión | Identificás dirección correcta tras escucharla | interpretar indicaciones, contraste de direcciones |
| 9. Encuentro | Por fin saludás a tu amistad | `Ça va ?` y respuesta natural |
| 10. Transferencia | Proponés mirar dibujos/postales o pasear | `On regarde…?`, `On se promène ?` |

La traducción completa no aparece antes de solicitar ayuda o intentar responder en modo conversacional; hay pista inicial e información extra desplegable y posteriores correcciones. La pregunta de distancia coincide con las respuestas de distancia; la concordancia `un ami/une amie` depende del personaje de cada historia.

## Relatos y consecuencias

**`jardin-bleu`**. El teléfono se queda sin batería en el Jardín de Luxemburgo. Juliette ayuda a encontrar a Inès en la fuente Médicis. Árboles → Adrien y banco verde, recto/izquierda; flores → Nadia y pequeño portón, derecha. Las escenas y las instrucciones cambian; Inès recibe al estudiante y decide una actividad.

**`quai-des-cartes`**. Quedaste con Émile para intercambiar postales junto al Sena. Margot conoce el quiosco verde. Puente → Hugo y recto/derecha; bouquinistes → Zoé, letrero azul/izquierda. A1 explicado en contexto y con llegadas distintas. El quiosco y las posiciones relativas son puntos narrativos, **no indicaciones verificadas para un mapa de París**.

## Evaluación semántica honesta

- Ejemplos equivalentes: `Oui, j'ai rendez-vous.` / `Oui, j'ai rendez-vous ici.`, `Où est la fontaine ?` / `La fontaine, c'est où ?`, variantes corteses con `s'il vous plaît`.
- Puntuación, espacios, mayúsculas y apóstrofos tipográficos se normalizan; los acentos significativos no se eliminan de forma indiscriminada.
- Se rechazan contradicciones verificadas (p. ej. negar una cita que sí existe), lugares no mencionados y direcciones equivocadas. Se explica específicamente la corrección editorial.
- Expresiones no presentes en el repertorio se catalogan como **desconocidas**, no como “mal francés”. Se ofrece reformulación con ayuda. No hay comprensión semántica ilimitada ni modelo de IA externa.
- Las respuestas escritas desconocidas no se conservan en el historial persistido; la conversación muestra expresiones verificadas. Las decisiones solo proyectan el camino ya completado.

## Validación reportada por el usuario (31-oct-2026)

El usuario confirmó haber completado personalmente **10/10 pruebas manuales de LV-006B en Chrome** sobre la copia avanzada. Se registra como validación reportada por el usuario, no como ejecución de Codex. El checklist histórico siguiente contiene 11 puntos; no se infiere una equivalencia individual con sus 10 pruebas. No se extiende este resultado a LV-007A ni a Android/iOS/Safari.

Verificación automatizada local posterior de Codex: **166/166 PASS**, ambos typechecks, lint y exportación web aprobados. La diferencia con las 174 pruebas históricas está registrada en `PROJECT_STATE.md`.

## Checklist histórico de QA en Chrome

1. Incorporar la copia incremental al proyecto Windows **tras respaldo y comparación**, sin borrar archivos o modificaciones posteriores, y ejecutar `npm run web`.
2. Entrar en **Explorar → Un rendez-vous à Paris**; comprobar que Café y Londres siguen visibles y navegables.
3. Abrir el recorrido: ¿Jardín de Luxemburgo o Sena? Tomar nota de la variante. Escuchar al primer personaje: debe sonar en **francés**, no con voz española o inglesa.
4. Responder `Oui, j'ai rendez-vous.` y otra alternativa válida. Deben aceptarse puntuación, mayúsculas y apóstrofo tipográfico. Al intentar texto desconocido, comprobar aviso de incertidumbre sin error inventado.
5. Pedir pista, ver traducción solo al abrir ayuda; comprobar enseñanza progresiva. Denegar micrófono o cancelar grabación: la escritura debe seguir disponible. Probar transcripción, edición y envío.
6. Escuchar el ejemplo francés después de una respuesta verificada; escuchar al entrenador: debe dar las explicaciones en **español** regional. Inspeccionar si alguna voz incompatible se selecciona por error.
7. Elegir la primera ruta; seguir a Adrien/Hugo, escuchar y contestar las indicaciones. Probar una dirección contraria: debe rechazarse con explicación específica. Completar el encuentro y revisar el resumen con vocabulario del rendez-vous (no café).
8. Salir a mitad de una nueva partida, cerrar y recargar Chrome; comprobar reanudación exacta en el mismo objetivo y misma rama.
9. Iniciar otra partida **solo después de confirmar el reinicio** para explorar otra ruta y, eventualmente, la otra variante. La selección editorial ponderada no garantiza que la otra variante salga en el primer reinicio; no manipular claves de almacenamiento.
10. Pasar a **Un café en París**, revisar que mantiene su progreso; pasar a **Lost in London**, comprobar voces en inglés y avance independiente. Volver al rendez-vous. Verificar que las reacciones del entrenador no procedan del café.
11. Revisar presentación en escritorio y viewport estrecho de Chrome, botones accesibles y ausencia de futuras réplicas o personajes de ruta no elegida.

Anotar capturas/errores concretos y voz disponible antes de declarar aceptación. Android/iOS nativos no se probaron; la capacidad STT de esos sistemas **no** está confirmada. El reconocimiento web de Chrome puede depender de servicios del navegador y no significa privacidad sin conexión.

## Resultado de esta sesión

- Suite automatizada **174/174**, dos typechecks, ESLint y exportación web: **OK**.
- QA automatizado Chromium: **bloqueado por política externa** (`127.0.0.1 is blocked` antes de cargar). No comprobó audio ni layout real.
- No se implementaron Diario, Pasaporte, recompensas, IA remota, servicios de pago, humor nuevo ni cambios Git de escritura.
