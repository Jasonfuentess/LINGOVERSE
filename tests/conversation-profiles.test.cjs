const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { cafeLesson, cafeLessonV1, cafeLessonForProgress } = require('../.test-build/content/cafe.js');
const { conversationFingerprint, assertDistinctConversations } = require('../.test-build/domain/learning/conversation.js');
const { beginMission, currentExercise, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine.js');
const { MissionRepository } = require('../.test-build/storage/missionRepository.js');
const { emptyHistory, nextSession, noteAppearance } = require('../.test-build/domain/variety/history.js');
const { selectContent } = require('../.test-build/domain/variety/selection.js');
function memory() { const values = new Map(); return { values, getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } }; }
function route(lesson, variantId, bits = 0) {
  let progress = beginMission(lesson, 0, () => variantId);
  const exercises = [];
  while (progress.status !== 'completed') {
    const exercise = currentExercise(lesson, progress);
    exercises.push(exercise);
    const choices = exercise.kind === 'choice' ? exercise.choices.filter(item => item.correct) : [];
    const answer = exercise.kind === 'text' ? { kind: 'text', text: exercise.accepted[0] } : { kind: 'choice', choiceId: choices[((bits >> Math.max(0, exercises.length - 2)) & 1) % choices.length].id };
    progress = continueMission(lesson, submitAnswer(lesson, progress, answer));
  }
  return { progress, exercises };
}
test('v1 semantic content is frozen and new package retains the six identities as v2', () => {
  assert.equal(createHash('sha256').update(JSON.stringify(cafeLessonV1)).digest('hex'), '2c2159ab58ddf12eb7a369c95a695754117d4b73e339e1c9280a66211fbd05f3');
  // LV-007B: new runs use contextual v3; the six v2 identities stay archived.
  assert.equal(cafeLesson.version, 3);
  assert.equal(require('../.test-build/content/cafe').cafeLessonV2.version, 2);
  assert.deepEqual(cafeLesson.variants.map(item => item.id), cafeLessonV1.variants.map(item => item.id));
  assert.equal(new Set(cafeLesson.variants.map(conversationFingerprint)).size, 6);
  assertDistinctConversations(cafeLesson.variants);
});
test('each equivalent decision route has six distinct French conversations with at least two central differences', () => {
  for (let bits = 0; bits < 8; bits++) {
    const routes = cafeLesson.variants.map(variant => route(cafeLesson, variant.id, bits));
    for (const result of routes) {
      assert.deepEqual(result.progress.completedObjectives, cafeLesson.objectives);
      assert.equal(result.exercises.length, 8);
      for (const exercise of result.exercises) {
        assert.ok(exercise.promptTranslation.trim());
        assert.ok(exercise.teaching.includes(exercise.prompt), `Teaching must support ${exercise.prompt}`);
      }
    }
    for (let a = 0; a < routes.length; a++) for (let b = a + 1; b < routes.length; b++) {
      const central = routes[a].exercises.filter((exercise, index) => !['bonjour', 'depart'].includes(exercise.id) && exercise.prompt !== routes[b].exercises[index].prompt);
      assert.ok(central.length >= 2, `${cafeLesson.variants[a].id} / ${cafeLesson.variants[b].id}`);
    }
  }
});
test('duplicate conversations are detected despite changing NPC name and Spanish setting', () => {
  const duplicate = structuredClone(cafeLesson.variants[0]);
  duplicate.id = 'different-id'; duplicate.title = 'Otro título';
  duplicate.exercises.forEach(exercise => { exercise.speaker = 'Otra persona'; exercise.scene = 'Otra escena'; });
  assert.equal(conversationFingerprint(duplicate), conversationFingerprint(cafeLesson.variants[0]));
  assert.throws(() => assertDistinctConversations([cafeLesson.variants[0], duplicate]));
});
test('Spanish reply translations and renamed graph IDs do not create a different conversation profile', () => {
  const original = cafeLesson.variants[0];
  const duplicate = structuredClone(original);
  const rename = id => id === null ? null : `renamed-${id}`;
  duplicate.start = rename(duplicate.start);
  duplicate.exercises.forEach(exercise => {
    exercise.id = rename(exercise.id);
    if (exercise.kind === 'text') { exercise.next = rename(exercise.next); exercise.reply = `${exercise.reply.split('→')[0].trim()} → Otra traducción española`; }
    else exercise.choices.forEach(choice => { choice.next = rename(choice.next); choice.reply = `${choice.reply.split('→')[0].trim()} → Otra traducción española`; });
  });
  assert.equal(conversationFingerprint(duplicate), conversationFingerprint(original));
});
test('profile memory penalizes an unseen ID with the same conversation and permits occasional repeats', () => {
  const context = { category: 'mission-variant', language: 'fr', level: 'A1', scopeId: 'lesson', objectives: ['saluer'], session: 2, knownContent: [], tags: [] };
  const candidate = (id, profileId) => ({ id, profileId, language: 'fr', level: 'A1', category: 'mission-variant', objectives: ['saluer'], requires: [], tags: [], baseWeight: 1 });
  let history = nextSession(emptyHistory());
  history = noteAppearance(history, 'seen', { ...context, profileId: 'conversation-a' }, 10);
  const decision = selectContent([candidate('alias', 'conversation-a'), candidate('fresh', 'conversation-b')], context, history, () => 0.3);
  assert.equal(decision.candidateId, 'fresh');
  assert.ok(decision.weights[0].weight < decision.weights[1].weight);
  assert.equal(selectContent([candidate('alias', 'conversation-a')], context, history, () => 0).candidateId, 'alias');
});
test('plain and wrapped v1 progress resume with identical content and feedback, then restart on v2', async () => {
  const key = 'lingoverse.mission.fr-a1-paris-cafe.v1';
  for (const wrapped of [false, true]) for (const variant of cafeLessonV1.variants) for (const checkpoint of [0, 5]) {
    const storage = memory();
    const old = new MissionRepository(storage, cafeLessonV1);
    await old.load();
    let progress = beginMission(cafeLessonV1, 0, () => variant.id);
    for (let step = 0; step < checkpoint; step++) {
      const exercise = currentExercise(cafeLessonV1, progress);
      const answer = exercise.kind === 'text' ? { kind: 'text', text: exercise.accepted[0] } : { kind: 'choice', choiceId: exercise.choices.find(choice => choice.correct).id };
      progress = continueMission(cafeLessonV1, submitAnswer(cafeLessonV1, progress, answer));
    }
    progress = submitAnswer(cafeLessonV1, progress, { kind: 'choice', choiceId: checkpoint === 0 ? 'bonjour-simple' : 'trois' });
    await old.save(progress, 10);
    if (!wrapped) await storage.setItem(key, JSON.stringify(progress));
    const bytes = await storage.getItem(key);
    const repo = new MissionRepository(storage, cafeLesson, [cafeLessonV1]);
    const loaded = await repo.load();
    assert.deepEqual(loaded, progress);
    assert.equal(await storage.getItem(key), bytes);
    assert.strictEqual(cafeLessonForProgress(loaded), cafeLessonV1);
    assert.deepEqual(currentExercise(cafeLessonForProgress(loaded), loaded), currentExercise(cafeLessonV1, progress));
    if (checkpoint === 5) assert.equal(currentExercise(cafeLessonForProgress(loaded), loaded).choices.find(choice => choice.correct).id, 'trois');
    const continued = continueMission(cafeLessonForProgress(loaded), loaded);
    await repo.save(continued, 20);
    const reloaded = await new MissionRepository(storage, cafeLesson, [cafeLessonV1]).load();
    assert.deepEqual(reloaded, continued);
    assert.equal(reloaded.contentVersion, 1);
    const next = await repo.start(() => 0.8, 30);
    assert.equal(next.contentVersion, 3);
    assert.equal(next.run, progress.run + 1);
  }
});
test('version 2 prices, accepted answers and profile remain fixed after reload; no mid-run version swap', async () => {
  for (const variant of cafeLesson.variants) {
    const storage = memory();
    const repo = new MissionRepository(storage, cafeLesson, [cafeLessonV1]); await repo.load();
    let progress = beginMission(cafeLesson, 0, () => variant.id);
    for (let i = 0; i < 5; i++) {
      const exercise = currentExercise(cafeLesson, progress);
      const response = exercise.kind === 'choice' ? { kind: 'choice', choiceId: exercise.choices.find(item => item.correct).id } : { kind: 'text', text: exercise.accepted[0] };
      progress = continueMission(cafeLesson, submitAnswer(cafeLesson, progress, response));
    }
    await repo.save(progress, 1);
    const loaded = await new MissionRepository(storage, cafeLesson, [cafeLessonV1]).load();
    assert.equal(currentExercise(cafeLessonForProgress(loaded), loaded).prompt, currentExercise(cafeLesson, progress).prompt);
    assert.deepEqual(currentExercise(cafeLessonForProgress(loaded), loaded).choices, currentExercise(cafeLesson, progress).choices);
    await assert.rejects(repo.save(beginMission(cafeLessonV1, progress.run, () => variant.id)), /recorrido|historial|versión/);
  }
});
test('old history without profile metadata is enriched in memory without writing or inventing appearances', async () => {
  const storage = memory();
  const key = 'lingoverse.mission.fr-a1-paris-cafe.v1';
  const legacy = new MissionRepository(storage, cafeLessonV1); await legacy.load();
  await legacy.save(route(cafeLessonV1, 'carnet-alex').progress, 100);
  const envelope = JSON.parse(await storage.getItem(key));
  envelope.history.entries.forEach(entry => { delete entry.context.profileId; });
  await storage.setItem(key, JSON.stringify(envelope));
  const bytes = await storage.getItem(key);
  const current = new MissionRepository(storage, cafeLesson, [cafeLessonV1]);
  assert.deepEqual(await current.load(), envelope.progress);
  assert.equal(await storage.getItem(key), bytes);
  const history = current.getHistory();
  assert.equal(history.session, envelope.history.session);
  assert.deepEqual(history.entries.map(entry => entry.count), envelope.history.entries.map(entry => entry.count));
  assert.equal(history.entries.find(entry => entry.context.category === 'mission-variant').context.profileId, conversationFingerprint(cafeLessonV1.variants[3]));
});
test('all six new profiles and their versioned statistics survive a repository reload', async () => {
  for (let index = 0; index < 6; index++) {
    const storage = memory();
    const repository = new MissionRepository(storage, cafeLesson, [cafeLessonV1]); await repository.load();
    const progress = await repository.start(() => (index + 0.5) / 6, 100);
    assert.equal(progress.variantId, cafeLesson.variants[index].id);
    assert.equal(progress.contentVersion, 3);
    const fresh = new MissionRepository(storage, cafeLesson, [cafeLessonV1]);
    assert.deepEqual(await fresh.load(), progress);
    assert.deepEqual(fresh.getHistory(), repository.getHistory());
    const entry = fresh.getHistory().entries.find(entry => entry.context.category === 'mission-variant');
    assert.equal(entry.context.profileId, conversationFingerprint(cafeLesson.variants[index]));
    assert.ok(entry.id.includes(':v3:'), 'LV-007B: variety history is versioned with the contextual café');
  }
});
test('price comprehension accepts the declared amount and rejects the other taught numbers', () => {
  for (const variant of cafeLesson.variants) {
    const price = variant.exercises.find(exercise => exercise.id === 'prix');
    const payment = variant.exercises.find(exercise => exercise.id === 'paiement');
    assert.equal(price.reply, `${payment.prompt} → ${payment.promptTranslation}`);
    assert.equal(payment.choices.filter(choice => choice.correct).length, 1);
    const correct = payment.choices.find(choice => choice.correct);
    if (correct.id !== 'trois') assert.doesNotMatch(payment.teaching, /indica un total de tres euros/);
    assert.ok(payment.prompt.toLocaleLowerCase('fr').includes(correct.id));
    for (const choice of payment.choices) {
      assert.equal(choice.next, choice.correct ? 'merci' : null);
      if (!choice.correct) assert.notEqual(choice.id, correct.id);
    }
  }
});
