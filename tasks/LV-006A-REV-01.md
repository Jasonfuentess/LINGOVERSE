# LV-006A-REV-01 — Auditoría pedagógica, respuestas naturales y voces correctas

**Alcance:** corregir los casos reportados por el usuario en Lost in London, sin añadir nuevas aventuras ni API remota. Conservar eventos de v1/v2.

- [x] Revisar el modelo de contenido/evaluación, escenas, voz y persistencia.
- [x] Aceptar «I need help» y «Yes, I’m new here» con puntuación flexible y diagnósticos precisos.
- [x] Mantener límites explícitos para frases desconocidas y rechazo de contradicciones.
- [x] Corregir secuencia narrativa para que saludo, necesidad, destino y despedida tengan sentido.
- [x] Separar la explicación hablada española de los ejemplos en inglés; conservar francés.
- [x] Congelar Londres v2 y estrenar v3 sin invalidar avances.
- [x] Ejecutar tests, typechecks, lint y export web.
- [ ] QA de voz, micrófono y acento real en Chrome del usuario; no verificado.
- [ ] Revisar cambio de idiomas Londres ↔ París pendiente de LV-006A.

Evidencia y detalles en `docs/LV-006A-REV-01-AUDIT.md`.
