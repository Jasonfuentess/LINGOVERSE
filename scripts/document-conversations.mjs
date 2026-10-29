import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const build = spawnSync(process.platform === 'win32' ? 'tsc.cmd' : 'tsc', ['-p', 'tsconfig.core.json'], { stdio: 'inherit', shell: process.platform === 'win32' });
if (build.status !== 0) process.exit(build.status ?? 1);
const require = createRequire(import.meta.url);
const { cafeLesson } = require('../.test-build/content/cafe.js');
const { beginMission, currentExercise, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine.js');
const { conversationFingerprint } = require('../.test-build/domain/learning/conversation.js');
const lines = [
  '# LV-003B — Seis conversaciones francesas A1', '',
  'Contenido v2. Se conservan seis identidades, ocho objetivos y todas las ramas. Los seis ejemplos completos usan las mismas decisiones: café, sur place y aceptar azúcar. Así, las diferencias no dependen de elegir otra ruta. Cada frase nueva tiene traducción y ayuda antes de responder. Los importes son ficticios.', '',
  'El paso 6 vuelve a mostrar el importe para comprobar comprensión escrita; no representa una segunda intervención oral obligatoria del personaje. No hay audio.', '',
];
const routes = [];
for (const variant of cafeLesson.variants) {
  let state = beginMission(cafeLesson, 0, () => variant.id);
  const route = [];
  lines.push(`## ${variant.title} — ${variant.id}`, '', `Huella: \`${conversationFingerprint(variant)}\`.`, '');
  while (state.status !== 'completed') {
    const exercise = currentExercise(cafeLesson, state);
    route.push(exercise);
    const answer = exercise.kind === 'text' ? { kind: 'text', text: exercise.accepted[0] } : { kind: 'choice', choiceId: exercise.choices.find(option => option.correct).id };
    const text = answer.kind === 'text' ? answer.text : exercise.choices.find(option => option.id === answer.choiceId).label;
    state = submitAnswer(cafeLesson, state, answer);
    lines.push(`${route.length}. **${exercise.title}${exercise.id === 'paiement' ? ' (comprensión escrita)' : ''}**`, '',
      `   ${exercise.speaker}: «${exercise.prompt}» — ${exercise.promptTranslation}`, '', `   Estudiante: «${text}»`, '');
    if (state.feedback.reply) lines.push(`   Respuesta del personaje: ${state.feedback.reply}`, '');
    state = continueMission(cafeLesson, state);
  }
  routes.push(route);
}
let minimum = Infinity;
for (let a = 0; a < routes.length; a++) for (let b = a + 1; b < routes.length; b++) {
  minimum = Math.min(minimum, routes[a].filter((exercise, index) => !['bonjour', 'depart'].includes(exercise.id) && exercise.prompt !== routes[b][index].prompt).length);
}
lines.push('## Diferencias y apoyo pedagógico', '',
  `En la ruta equivalente anterior, cada pareja difiere en al menos **${minimum} intervenciones centrales**, sin contar saludo ni despedida. Cambian pedido, lugar, azúcar e importe formulado. Los tests repiten la comparación en las ocho rutas.`, '',
  '| Perfil | Pedido | Lugar | Azúcar | Importe ficticio |', '| --- | --- | --- | --- | --- |');
for (const variant of cafeLesson.variants) {
  const find = id => variant.exercises.find(exercise => exercise.id === id);
  lines.push(`| ${variant.exercises[0].speaker} | ${find('commande').prompt} | ${find('lieu-cafe').prompt} | ${find('sucre-place').prompt} | ${find('paiement').prompt} |`);
}
lines.push('',
  'Las respuestas de pedido se adaptan: Je voudrais…, Je prends… o nombrar directamente la bebida. Las confirmaciones de lugar admiten Oui, sur place / Non, à emporter; las preguntas abiertas admiten Sur place / À emporter. Alex pregunta Avec ou sans sucre y admite Avec du sucre / Sans sucre; los otros admiten Oui / Non.', '',
  'Cada pregunta incluye promptTranslation y teaching con la frase completa, su significado y respuestas útiles. Se enseñan ici/sur place/à emporter, une table/rester, je prends/je voudrais, avec/sans/un peu de sucre y un/deux/trois euros. No se supone dominio previo. Las expresiones de servicio se enseñan como bloques comunicativos, sin exigir analizar sus conjugaciones.', '',
  'El importe coincide entre la respuesta al precio, el texto de comprensión, la opción correcta y la ayuda. V1 permanece congelada con tres euros; un reinicio explícito inicia v2. Estos ejemplos y tests acreditan diferencias de contenido y coherencia técnica, no un estudio de percepción ni una certificación docente externa.', '',
  'Reproducir este documento: npm.cmd run document:conversations.', '');
writeFileSync('docs/LV-003B_CONVERSATIONS.md', lines.join('\n'));
console.log(`Documentadas ${routes.length} conversaciones; mínimo ${minimum} diferencias centrales en la ruta equivalente.`);
