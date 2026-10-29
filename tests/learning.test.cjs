const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cafeLesson } = require('../.test-build/content/cafe.v1.js');
const { validateLesson } = require('../.test-build/domain/learning/validation.js');
const { beginMission, submitAnswer, continueMission, currentExercise, restoreProgress, evaluateAnswer } = require('../.test-build/domain/learning/engine.js');
const { MissionRepository } = require('../.test-build/storage/missionRepository.js');
const { createBrowserStorage } = require('../.test-build/storage/browserStorage.js');

function answer(exercise, choiceIndex = 0) {
  if (exercise.kind === 'text') return { kind: 'text', text: exercise.accepted[0] };
  const correct = exercise.choices.filter(item => item.correct);
  return { kind: 'choice', choiceId: correct[choiceIndex % correct.length].id };
}
function advance(state, index = 0) {
  const submitted = submitAnswer(cafeLesson, state, answer(currentExercise(cafeLesson, state), index));
  assert.equal(submitted.feedback.correct, true);
  return continueMission(cafeLesson, submitted);
}
function memory() {
  const values = new Map();
  return { values, getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
}

test('content validates and variants teach the same eight objectives', () => {
  assert.equal(validateLesson(cafeLesson), cafeLesson);
  assert.equal(cafeLesson.objectives.length, 8);
  assert.ok(cafeLesson.variants.length >= 2);
  for (const exercise of cafeLesson.variants[0].exercises) {
    const other = cafeLesson.variants[1].exercises.find(item => item.id === exercise.id);
    assert.equal(other.teaching, exercise.teaching);
    assert.equal(other.objectiveId, exercise.objectiveId);
    if (exercise.kind === 'text') assert.deepEqual(other.accepted, exercise.accepted);
    else assert.deepEqual(other.choices.map(item => item.label), exercise.choices.map(item => item.label));
  }
});
test('all beverage, location and sugar branches complete eight educational interactions', () => {
  for (let variant = 0; variant < 2; variant++) for (let beverage = 0; beverage < 2; beverage++) for (let location = 0; location < 2; location++) for (let sugar = 0; sugar < 2; sugar++) {
    let state = beginMission(cafeLesson, variant);
    state = advance(state);
    state = advance(state, beverage);
    assert.match(state.nodeId, beverage === 0 ? /cafe/ : /the/);
    state = advance(state, location);
    assert.match(state.nodeId, location === 0 ? /place/ : /emporter/);
    state = advance(state, sugar);
    while (state.status !== 'completed') state = advance(state);
    assert.equal(state.events.filter(event => event.type === 'answer').length, 8);
    assert.equal(state.completedObjectives.length, 8);
    assert.equal(state.feedback, null);
    assert.throws(() => submitAnswer(cafeLesson, state, { kind: 'text', text: 'Merci' }));
  }
});
test('text evaluation accepts taught alternatives, case, punctuation and apostrophes without dropping accents', () => {
  const variant = cafeLesson.variants[0];
  const price = variant.exercises.find(item => item.id === 'prix');
  for (const text of ["C’est combien ?", " c'est combien?!  ", 'Combien ça coûte ?']) {
    assert.equal(evaluateAnswer(price, { kind: 'text', text }).correct, true);
  }
  assert.equal(evaluateAnswer(price, { kind: 'text', text: 'Combien ca coute' }).correct, false);
  assert.equal(evaluateAnswer(price, { kind: 'text', text: '' }).correct, false);
  assert.equal(evaluateAnswer(price, { kind: 'choice', choiceId: 'prix' }).correct, false);
});
test('wrong answers provide educational correction, persist feedback and do not advance', () => {
  const initial = beginMission(cafeLesson);
  const exercise = currentExercise(cafeLesson, initial);
  const wrong = exercise.choices.find(item => !item.correct);
  const state = submitAnswer(cafeLesson, initial, { kind: 'choice', choiceId: wrong.id });
  assert.equal(state.feedback.correct, false);
  assert.ok(state.feedback.explanation.length > 10);
  assert.ok(state.feedback.correction.length > 0);
  assert.equal(state.nodeId, initial.nodeId);
  assert.equal(state.completedObjectives.length, 0);
  assert.throws(() => continueMission(cafeLesson, state));
  assert.deepEqual(restoreProgress(cafeLesson, JSON.parse(JSON.stringify(state))), state);
  assert.equal(submitAnswer(cafeLesson, state, answer(exercise)).feedback.correct, true);
});
test('correct feedback must be acknowledged; repeated submission cannot skip a scene', () => {
  const initial = beginMission(cafeLesson);
  const state = submitAnswer(cafeLesson, initial, answer(currentExercise(cafeLesson, initial)));
  assert.equal(state.nodeId, initial.nodeId);
  assert.throws(() => submitAnswer(cafeLesson, state, answer(currentExercise(cafeLesson, state))));
  const next = continueMission(cafeLesson, state);
  assert.notEqual(next.nodeId, state.nodeId);
  assert.throws(() => continueMission(cafeLesson, next));
});
test('restart alternates editorial variants and supports an injected selector', () => {
  const first = beginMission(cafeLesson, 0);
  const second = beginMission(cafeLesson, 1);
  assert.notEqual(first.variantId, second.variantId);
  assert.notEqual(currentExercise(cafeLesson, first).scene, currentExercise(cafeLesson, second).scene);
  assert.equal(beginMission(cafeLesson, cafeLesson.variants.length).variantId, first.variantId);
  assert.equal(beginMission(cafeLesson, 1, () => cafeLesson.variants[0].id).variantId, first.variantId);
  assert.throws(() => beginMission(cafeLesson, 0, () => 'missing'));
});
test('content rejects broken references, duplicate IDs, cycles and routes missing objectives', () => {
  for (const mutate of [
    lesson => { lesson.schemaVersion = 2; },
    lesson => { lesson.variants[0].exercises[0].choices[0].next = 'missing'; },
    lesson => { lesson.variants[0].exercises[1].id = 'bonjour'; },
    lesson => { lesson.variants[0].exercises[0].choices[0].next = 'bonjour'; },
    lesson => { lesson.variants[0].exercises[0].choices[0].next = null; },
    lesson => { lesson.variants[0].exercises[0].teaching = ''; },
    lesson => { lesson.variants[0].exercises[0].choices.forEach(item => { item.correct = false; }); },
  ]) {
    const copy = structuredClone(cafeLesson);
    mutate(copy);
    assert.throws(() => validateLesson(copy));
  }
});
test('persisted progress is replayed, rejects forged completion and future versions', () => {
  const state = advance(beginMission(cafeLesson));
  assert.deepEqual(restoreProgress(cafeLesson, structuredClone(state)), state);
  for (const change of [{ status: 'completed' }, { version: 2 }, { variantId: 'missing' }, { nodeId: 'depart' }, { completedObjectives: cafeLesson.objectives }, { events: [{ type: 'continue' }] }]) {
    assert.throws(() => restoreProgress(cafeLesson, { ...state, ...change }));
  }
});
test('browser adapter restores partial feedback and completed mission between repository instances', async () => {
  const data = new Map();
  const browser = { getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); } };
  const makeRepo = () => new MissionRepository(createBrowserStorage(() => browser), cafeLesson);
  const writer = makeRepo();
  assert.equal(await writer.load(), null);
  let state = beginMission(cafeLesson);
  state = submitAnswer(cafeLesson, state, answer(currentExercise(cafeLesson, state)));
  await writer.save(state);
  assert.deepEqual(await makeRepo().load(), state);
  state = continueMission(cafeLesson, state);
  while (state.status !== 'completed') state = advance(state);
  await writer.save(state);
  assert.deepEqual(await makeRepo().load(), state);
  const restarted = beginMission(cafeLesson, state.run + 1);
  await writer.save(restarted);
  assert.deepEqual(await makeRepo().load(), restarted);
});
test('corruption is reported without overwriting data; quota failures preserve previous progress', async () => {
  const storage = memory();
  await storage.setItem('lingoverse.preferences.v1', 'existing preferences');
  const repo = new MissionRepository(storage, cafeLesson);
  await repo.load();
  const initial = beginMission(cafeLesson);
  await repo.save(initial);
  const before = [...storage.values.entries()];
  const failing = new MissionRepository({ getItem: storage.getItem, setItem: async () => { throw Error('quota'); } }, cafeLesson);
  await failing.load();
  await assert.rejects(failing.save(advance(initial)), /quota/);
  assert.deepEqual([...storage.values.entries()], before);
  const key = before.find(([key]) => key.startsWith('lingoverse.mission.'))[0];
  storage.values.set(key, '{broken');
  await assert.rejects(repo.load());
  assert.equal(storage.values.get(key), '{broken');
  assert.equal(storage.values.get('lingoverse.preferences.v1'), 'existing preferences');
});
test('all taught written alternatives complete their scene and unknown choices cannot advance', () => {
  for (const variant of cafeLesson.variants) for (const exercise of variant.exercises) {
    if (exercise.kind === 'text') for (const text of exercise.accepted) assert.equal(evaluateAnswer(exercise, { kind: 'text', text }).correct, true);
    else {
      const result = evaluateAnswer(exercise, { kind: 'choice', choiceId: 'unknown' });
      assert.equal(result.correct, false);
      assert.equal(result.next, null);
    }
  }
});
test('a wrong attempt after resuming the price question cannot mark the mission completed', () => {
  let state = beginMission(cafeLesson);
  for (let step = 0; step < 4; step++) state = advance(state);
  assert.equal(state.nodeId, 'prix');
  state = restoreProgress(cafeLesson, JSON.parse(JSON.stringify(state)));
  const wrong = submitAnswer(cafeLesson, state, { kind: 'text', text: 'Merci.' });
  assert.equal(wrong.status, 'active');
  assert.equal(wrong.completedObjectives.length, 4);
  assert.equal(wrong.nodeId, 'prix');
});
test('a stale writer cannot overwrite progress saved by another window', async () => {
  const storage = memory();
  const first = new MissionRepository(storage, cafeLesson);
  const stale = new MissionRepository(storage, cafeLesson);
  await first.load(); await stale.load();
  const initial = beginMission(cafeLesson);
  await first.save(advance(initial));
  await assert.rejects(stale.save(initial), /cambió|conflicto/i);
  assert.equal((await first.load()).completedObjectives.length, 1);
});
test('simultaneous repository writers detect a conflict rather than both replacing the record', async () => {
  const storage = memory();
  const first = new MissionRepository(storage, cafeLesson);
  const second = new MissionRepository(storage, cafeLesson);
  await first.load(); await second.load();
  const results = await Promise.allSettled([first.save(beginMission(cafeLesson)), second.save(beginMission(cafeLesson, 1))]);
  assert.equal(results.filter(item => item.status === 'fulfilled').length, 1);
  assert.equal(results.filter(item => item.status === 'rejected').length, 1);
});
