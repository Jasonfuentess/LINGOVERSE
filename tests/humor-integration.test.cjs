const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cafeLesson, cafeLessonV1 } = require('../.test-build/content/cafe.js');
const { beginMission, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine.js');
const { MissionRepository } = require('../.test-build/storage/missionRepository.js');
const { humorDefaults } = require('../.test-build/domain/humor/preferences.js');
function memory() { const values = new Map(); return { values, getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } }; }
const request = locale => ({ locale, preferences: humorDefaults(), random: () => 0 });
test('regional reaction and learning correction persist atomically and resume exactly', async () => {
  const storage = memory();
  const repo = new MissionRepository(storage, cafeLesson, [cafeLessonV1]); await repo.load();
  let progress = await repo.start(() => 0, 100);
  progress = submitAnswer(cafeLesson, progress, { kind: 'choice', choiceId: 'merci-saludo' });
  const correction = structuredClone(progress.feedback);
  await repo.save(progress, 200, request('es-SV'));
  assert.equal(repo.getReaction().locale, 'es-SV');
  assert.equal(repo.getReaction().category, 'error');
  const savedReaction = repo.getReaction();
  const savedBytes = [...storage.values.entries()];
  const fresh = new MissionRepository(storage, cafeLesson, [cafeLessonV1]);
  assert.deepEqual(await fresh.load(), progress);
  assert.deepEqual(fresh.getReaction(), savedReaction);
  assert.deepEqual(progress.feedback, correction);
  assert.deepEqual([...storage.values.entries()], savedBytes);
  assert.ok(fresh.getHistory().entries.some(entry => entry.context.category === 'reaction'));
});
test('legacy content and envelope migrate without inventing retrospective reactions', async () => {
  for (const lesson of [cafeLessonV1, cafeLesson]) {
    const storage = memory();
    const repo = new MissionRepository(storage, cafeLesson, [cafeLessonV1]); await repo.load();
    let progress = beginMission(lesson);
    progress = submitAnswer(lesson, progress, { kind: 'choice', choiceId: 'bonjour-simple' });
    await repo.save(progress, 100);
    const key = 'lingoverse.mission.fr-a1-paris-cafe.v1';
    const legacy = JSON.parse(await storage.getItem(key)); legacy.version = 2; delete legacy.reaction;
    await storage.setItem(key, JSON.stringify(legacy));
    const bytes = await storage.getItem(key);
    const current = new MissionRepository(storage, cafeLesson, [cafeLessonV1]);
    assert.deepEqual(await current.load(), progress);
    assert.equal(current.getReaction(), null);
    assert.equal(await storage.getItem(key), bytes);
    progress = continueMission(lesson, progress); await current.save(progress, 200, request('es-MX'));
    assert.equal(progress.contentVersion, lesson.version);
    assert.equal(current.getReaction(), null);
  }
});
test('failed write cannot advance the reaction history or chosen snapshot', async () => {
  const storage = memory();
  const repo = new MissionRepository(storage, cafeLesson); await repo.load();
  const progress = await repo.start(() => 0, 10);
  const failed = new MissionRepository({ getItem: storage.getItem, setItem: async () => { throw Error('quota'); } }, cafeLesson); await failed.load();
  const before = failed.getHistory();
  const next = submitAnswer(cafeLesson, progress, { kind: 'choice', choiceId: 'bonjour-simple' });
  await assert.rejects(failed.save(next, 20, request('es-AR')), /quota/);
  assert.deepEqual(failed.getHistory(), before);
  assert.equal(failed.getReaction(), null);
});
test('malformed humor snapshot is hidden without resetting or changing valid educational progress', async () => {
  const storage = memory(); const repo = new MissionRepository(storage, cafeLesson); await repo.load();
  let progress = await repo.start(() => 0, 10);
  progress = submitAnswer(cafeLesson, progress, { kind: 'choice', choiceId: 'bonjour-simple' });
  await repo.save(progress, 20, request('es-CO'));
  const key = 'lingoverse.mission.fr-a1-paris-cafe.v1';
  const envelope = JSON.parse(await storage.getItem(key)); envelope.reaction.text = 'Invented memory';
  await storage.setItem(key, JSON.stringify(envelope));
  const restored = new MissionRepository(storage, cafeLesson);
  assert.deepEqual(await restored.load(), progress);
  assert.equal(restored.getReaction(), null);
});
