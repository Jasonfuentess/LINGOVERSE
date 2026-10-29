const { test } = require('node:test');
const assert = require('node:assert/strict');
// Preserve the audit as regression evidence for archived v1, not current v2.
const { cafeLesson } = require('../.test-build/content/cafe.v1.js');
const { currentExercise, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine.js');
const { lessonCandidates, lessonContext } = require('../.test-build/domain/learning/variety.js');
const { selectContent } = require('../.test-build/domain/variety/selection.js');
const { MissionRepository } = require('../.test-build/storage/missionRepository.js');

function memory() {
  const values = new Map();
  return { values, getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
}
async function setup(storage = memory()) {
  const repository = new MissionRepository(storage, cafeLesson);
  await repository.load();
  return { repository, storage };
}
function advance(progress) {
  const exercise = currentExercise(cafeLesson, progress);
  const answer = exercise.kind === 'choice' ? { kind: 'choice', choiceId: exercise.choices.find(item => item.correct).id } : { kind: 'text', text: exercise.accepted[0] };
  return continueMission(cafeLesson, submitAnswer(cafeLesson, progress, answer));
}
function trace(initial) {
  let progress = initial;
  const exercises = [];
  while (progress.status !== 'completed') {
    // This is the actual Exercise object MissionScreen passes to ExerciseView.
    // No new display adapter or production selection logic is introduced for the audit.
    exercises.push(currentExercise(cafeLesson, progress));
    progress = advance(progress);
  }
  return { progress, exercises };
}
const fixtures = [
  ['matin-lucie', 'Lucie', 'Bonjour, bienvenue !', 'Una mañana en París. Lucie termina de ordenar el mostrador y te recibe con una sonrisa.'],
  ['midi-samir', 'Samir', 'Bonjour !', 'Es mediodía. Cerca de una ventana, Samir acomoda una taza. Te acercás al mostrador.'],
  ['pluie-camille', 'Camille', 'Bonjour !', 'Afuera llueve. Entrás al café y dejás el paraguas junto a la puerta.'],
  ['carnet-alex', 'Alex', 'Bonjour, bienvenue !', 'Entrás con tu cuaderno de viaje. Alex deja espacio en el mostrador para atenderte.'],
  ['balade-noemie', 'Noémie', 'Bonjour !', 'Hacés una pausa durante tu paseo por París. Noémie te recibe al entrar.'],
  ['lecture-hugo', 'Hugo', 'Bonjour, bienvenue !', 'Llevás un libro bajo el brazo. Hugo termina de acomodar dos tazas y se acerca.'],
];

test('selector -> repository -> Exercise UI contract exposes every one of the six real variants', async () => {
  for (let index = 0; index < fixtures.length; index++) {
    const { repository } = await setup();
    let draws = 0;
    const progress = await repository.start(() => { draws++; return (index + 0.5) / fixtures.length; }, 1000);
    const [id, speaker, prompt, scene] = fixtures[index];
    assert.equal(draws, 1, 'starting must draw through the selector');
    assert.equal(progress.variantId, id);
    const exercise = currentExercise(cafeLesson, progress);
    assert.equal(exercise.speaker, speaker);
    assert.equal(exercise.prompt, prompt);
    assert.equal(exercise.scene, scene);
    assert.strictEqual(exercise, cafeLesson.variants[index].exercises[0]);
    assert.ok(trace(progress).exercises.every(item => item.speaker === speaker));
  }
});

test('restarting a completed mission selects again and sends the new scene to the UI contract', async () => {
  const { repository } = await setup();
  const initial = await repository.start(() => 0, 1000);
  const complete = trace(initial).progress;
  await repository.save(complete, 2000);
  let draws = 0;
  const restarted = await repository.start(() => { draws++; return 0.99; }, 3000);
  assert.equal(draws, 1);
  assert.equal(complete.variantId, 'matin-lucie');
  assert.equal(restarted.variantId, 'lecture-hugo');
  assert.equal(restarted.run, complete.run + 1);
  assert.equal(restarted.nodeId, 'bonjour');
  assert.equal(restarted.completedObjectives.length, 0);
  assert.equal(repository.getHistory().session, 2);
  assert.equal(currentExercise(cafeLesson, restarted).speaker, 'Hugo');
});

test('interrupted mission resumes identical scene and feedback without modifying persisted history', async () => {
  const { repository, storage } = await setup();
  let progress = await repository.start(() => 0.99, 1000);
  for (let step = 0; step < 4; step++) progress = advance(progress);
  progress = submitAnswer(cafeLesson, progress, { kind: 'text', text: 'Merci.' });
  await repository.save(progress, 2000);
  const bytes = [...storage.values.entries()];
  const history = repository.getHistory();
  const resumed = new MissionRepository(storage, cafeLesson);
  const restored = await resumed.load();
  assert.deepEqual(restored, progress);
  assert.deepEqual(currentExercise(cafeLesson, restored), currentExercise(cafeLesson, progress));
  assert.deepEqual(resumed.getHistory(), history);
  assert.deepEqual([...storage.values.entries()], bytes);
  assert.equal(restored.variantId, 'lecture-hugo');
  assert.equal(restored.nodeId, 'prix');
  assert.equal(restored.feedback.correct, false);
});

test('persisted history changes selection and actual questions for the same RNG draw', async () => {
  const { repository, storage } = await setup();
  const first = await repository.start(() => 0.1, 1000);
  await repository.save(trace(first).progress, 2000);
  const resumed = new MissionRepository(storage, cafeLesson);
  await resumed.load();
  const decision = selectContent(lessonCandidates(cafeLesson), lessonContext(cafeLesson, 2), resumed.getHistory(), () => 0.1);
  assert.ok(decision.weights[0].weight < decision.weights[1].weight);
  const next = await resumed.start(() => 0.1, 3000);
  assert.equal(first.variantId, 'matin-lucie');
  assert.equal(next.variantId, 'midi-samir');
  assert.equal(trace(first).exercises[1].prompt, 'Vous désirez ?');
  assert.equal(trace(next).exercises[1].prompt, 'Un café ou un thé ?');
});

test('six real variants contain only two French prompt profiles and identical answers', async () => {
  const routes = [];
  for (let index = 0; index < fixtures.length; index++) {
    const { repository } = await setup();
    const progress = await repository.start(() => (index + 0.5) / fixtures.length, 1000);
    routes.push(trace(progress).exercises);
  }
  const signatures = routes.map(exercises => JSON.stringify(exercises.map(item => item.prompt)));
  assert.equal(new Set(signatures).size, 2);
  assert.deepEqual(signatures.map((signature, index) => signature === signatures[0] ? index : null).filter(index => index !== null), [0, 3, 5]);
  for (const route of routes) route.forEach((exercise, index) => {
    const original = routes[0][index];
    assert.equal(exercise.teaching, original.teaching);
    assert.equal(exercise.instruction, original.instruction);
    assert.equal(exercise.correction, original.correction);
    assert.equal(exercise.explanation, original.explanation);
    assert.deepEqual(exercise.kind === 'choice' ? exercise.choices : exercise.accepted, original.kind === 'choice' ? original.choices : original.accepted);
  });
  assert.equal(routes[0].filter((exercise, index) => exercise.prompt !== routes[1][index].prompt).length, 5);
});

test('two completed sessions can have different variant IDs but identical French prompts and responses', async () => {
  const { repository } = await setup();
  const first = await repository.start(() => 0.58, 1000);
  const firstRoute = trace(first);
  await repository.save(firstRoute.progress, 2000);
  const second = await repository.start(() => 0.99, 3000);
  const secondRoute = trace(second);
  assert.equal(first.variantId, 'carnet-alex');
  assert.equal(second.variantId, 'lecture-hugo');
  assert.notEqual(firstRoute.exercises[0].scene, secondRoute.exercises[0].scene);
  assert.deepEqual(firstRoute.exercises.map(item => item.prompt), secondRoute.exercises.map(item => item.prompt));
  assert.equal(firstRoute.exercises.filter((exercise, index) => exercise.scene !== secondRoute.exercises[index].scene).length, 3);
});

test('a legitimate weighted restart can repeat the same variant while creating a new run', async () => {
  const { repository } = await setup();
  const first = await repository.start(() => 0, 1000);
  await repository.save(trace(first).progress, 2000);
  const second = await repository.start(() => 0, 3000);
  assert.equal(second.variantId, first.variantId);
  assert.equal(second.run, 1);
  assert.equal(repository.getHistory().session, 2);
  assert.equal(second.nodeId, 'bonjour');
});
