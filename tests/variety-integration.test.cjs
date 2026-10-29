const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cafeLesson } = require('../.test-build/content/cafe.v1.js');
const { beginMission, submitAnswer, continueMission, currentExercise } = require('../.test-build/domain/learning/engine.js');
const { MissionRepository } = require('../.test-build/storage/missionRepository.js');
const { seededRandom } = require('../.test-build/domain/variety/selection.js');
const { validateLesson } = require('../.test-build/domain/learning/validation.js');
function memory() { const values = new Map(); return { values, getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } }; }
const key = 'lingoverse.mission.fr-a1-paris-cafe.v1';
test('legacy progress migrates in memory without changing variant, state, feedback or stored bytes', async () => {
  const storage = memory();
  let legacy = beginMission(cafeLesson, 0);
  legacy = submitAnswer(cafeLesson, legacy, { kind: 'choice', choiceId: 'merci-saludo' });
  await storage.setItem(key, JSON.stringify(legacy));
  const before = await storage.getItem(key);
  const repo = new MissionRepository(storage, cafeLesson);
  assert.deepEqual(await repo.load(), legacy);
  assert.equal(await storage.getItem(key), before);
  assert.equal(repo.getHistory().errors.length, 1);
  assert.equal(repo.getHistory().errors[0].exerciseId, 'bonjour');
  assert.equal(repo.getHistory().entries.find(item => item.id.endsWith(':matin-lucie')).count, 1);
  legacy = submitAnswer(cafeLesson, legacy, { kind: 'choice', choiceId: 'bonjour-simple' });
  await repo.save(legacy);
  assert.equal(JSON.parse(await storage.getItem(key)).version, 2);
  const fresh = new MissionRepository(storage, cafeLesson);
  assert.deepEqual(await fresh.load(), legacy);
  assert.deepEqual(fresh.getHistory(), repo.getHistory());
});
test('selection persists across reload without counting more appearances or drawing again', async () => {
  const storage = memory();
  const repo = new MissionRepository(storage, cafeLesson);
  await repo.load();
  const progress = await repo.start(seededRandom(91), 1000);
  const history = repo.getHistory();
  assert.equal(history.session, 1);
  assert.equal(history.errors.length, 0);
  const fresh = new MissionRepository(storage, cafeLesson);
  assert.deepEqual(await fresh.load(), progress);
  assert.deepEqual(fresh.getHistory(), history);
  await repo.save(submitAnswer(cafeLesson, progress, { kind: 'choice', choiceId: 'merci-saludo' }));
  assert.equal(repo.getHistory().errors.length, 1);
  await repo.start(seededRandom(45), 2000);
  assert.equal(repo.getHistory().session, 2);
  assert.equal(repo.getHistory().errors[0].count, 1);
});
test('all six editorial variants keep all branches and eight learning objectives unchanged', () => {
  assert.equal(cafeLesson.variants.length, 6);
  validateLesson(cafeLesson);
  for (const variant of cafeLesson.variants) for (let path = 0; path < 8; path++) {
    let progress = beginMission(cafeLesson, 0, () => variant.id);
    let step = 0;
    while (progress.status !== 'completed') {
      const exercise = currentExercise(cafeLesson, progress);
      const reference = cafeLesson.variants[0].exercises.find(item => item.id === exercise.id);
      assert.equal(exercise.teaching, reference.teaching);
      if (exercise.kind === 'text') assert.deepEqual(exercise.accepted, reference.accepted);
      else assert.deepEqual(exercise.choices, reference.choices);
      const correct = exercise.kind === 'choice' ? exercise.choices.filter(item => item.correct) : [];
      const index = (path >> Math.max(0, step - 1)) & 1;
      const answer = exercise.kind === 'text' ? { kind: 'text', text: exercise.accepted[path % exercise.accepted.length] } : { kind: 'choice', choiceId: correct[index % correct.length].id };
      progress = continueMission(cafeLesson, submitAnswer(cafeLesson, progress, answer));
      step++;
    }
    assert.equal(step, 8);
    assert.deepEqual(progress.completedObjectives, cafeLesson.objectives);
  }
});
test('quota failure and stale writers leave both history and progress untouched', async () => {
  const storage = memory();
  const repo = new MissionRepository(storage, cafeLesson);
  await repo.load();
  await repo.start(() => 0, 100);
  const stale = new MissionRepository(storage, cafeLesson); await stale.load();
  await repo.start(() => 0.8, 200);
  const before = await storage.getItem(key);
  await assert.rejects(stale.start(() => 0, 300), /cambió/);
  assert.equal(await storage.getItem(key), before);
  const failed = new MissionRepository({ getItem: storage.getItem, setItem: async () => { throw Error('quota'); } }, cafeLesson);
  await failed.load();
  const history = failed.getHistory();
  await assert.rejects(failed.start(() => 0, 400), /quota/);
  assert.deepEqual(failed.getHistory(), history);
  assert.equal(await storage.getItem(key), before);
});
test('unknown envelope or history version is reported without overwriting data', async () => {
  const storage = memory();
  for (const raw of [JSON.stringify({ version: 3 }), JSON.stringify({ version: 2, progress: beginMission(cafeLesson), history: { version: 2 } })]) {
    await storage.setItem(key, raw);
    await assert.rejects(new MissionRepository(storage, cafeLesson).load());
    assert.equal(await storage.getItem(key), raw);
  }
});
