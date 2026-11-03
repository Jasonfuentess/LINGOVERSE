const { test } = require('node:test');
const assert = require('node:assert/strict');
const { roastLesson, roastLessonV2 } = require('../.test-build/content/roast.js');
const { roastLibrary } = require('../.test-build/content/roastHumor.js');
const { cafeLesson, cafeLessonV2 } = require('../.test-build/content/cafe.js');
const { MissionRepository } = require('../.test-build/storage/missionRepository.js');
const { humorDefaults, grantAdultConsent, disableAdult } = require('../.test-build/domain/humor/preferences.js');
const { canRoast } = require('../.test-build/domain/humor/access.js');
const { selectReaction, validateLibrary } = require('../.test-build/domain/humor/engine.js');
const { humorContext } = require('../.test-build/domain/humor/context.js');
const { emptyHistory } = require('../.test-build/domain/variety/history.js');
const { seededRandom } = require('../.test-build/domain/variety/selection.js');
const { currentExercise, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine.js');
const key = 'lingoverse.humor-preferences.v1';
const consent = () => grantAdultConsent(humorDefaults(), { adultConfirmed: true, explicitlyAgreed: true }, 100);
function fixture(settings = humorDefaults()) {
  const values = new Map([[key, JSON.stringify(settings)]]);
  const storage = { getItem: async k => values.get(k) ?? null, setItem: async (k, v) => { values.set(k, v); } };
  return { values, storage, repo: new MissionRepository(storage, roastLesson, [], 'roast') };
}
const answerFor = e => e.kind === 'choice' ? { kind: 'choice', choiceId: e.choices.find(c => c.correct).id } : { kind: 'text', text: e.accepted[0] };

test('Roast defaults deny access; both confirmations mandatory; normal intensity cannot activate it', async () => {
  for (const confirm of [{}, { adultConfirmed: true }, { explicitlyAgreed: true }]) assert.throws(() => grantAdultConsent(humorDefaults(), confirm, 1));
  assert.equal(canRoast(humorDefaults()), false);
  assert.equal(canRoast({ ...humorDefaults(), intensity: 'playful' }), false);
  assert.equal(canRoast({ ...consent(), adult: { enabled: true, consent: { version: 2 } } }), false);
  const { repo } = fixture(); await repo.load(); await assert.rejects(repo.start(), /consentimiento/);
});
test('roast package reuses all eight objectives and French branches without modifying normal content', () => {
  assert.notEqual(roastLesson.id, cafeLesson.id);
  // Roast stays pinned to the café v2 package; LV-007B café v3 does not change it.
  assert.deepEqual(roastLessonV2.variants, cafeLessonV2.variants);
  assert.ok([roastLessonV2, roastLesson].every(l => l.variants.every(v => v.exercises.every(e => e.conversation === undefined))));
  assert.equal(roastLesson.objectives.length, 8);
  validateLibrary(roastLibrary); assert.ok(roastLibrary.length >= 96);
});
test('all regions select only consented roast lines and friendly mode never selects roast', () => {
  for (const locale of ['es-SV', 'es-MX', 'es-CO', 'es-AR']) {
    const select = (prefs, mode) => selectReaction(null, locale, prefs, emptyHistory(), seededRandom(44), roastLibrary, mode);
    assert.equal(select(humorDefaults(), 'roast'), null);
    const r = select(consent(), 'roast'); assert.equal(r.locale, locale); assert.equal(r.mode, 'roast');
    assert.equal(select({ ...consent(), enabled: false, intensity: 'gentle' }, 'roast').mode, 'roast');
    assert.equal(select(consent(), 'friendly').explicit, false);
    assert.equal(select(disableAdult(consent()), 'roast'), null);
  }
});
test('recorded errors drive error/retry/recurring/recovery; forged memory cannot select recurring line', async () => {
  const { repo } = fixture(consent()); await repo.load(); let p = await repo.start(seededRandom(3), 100);
  const request = { locale: 'es-SV', preferences: consent(), random: seededRandom(7) };
  for (const category of ['error', 'retry', 'recurring']) {
    p = submitAnswer(roastLesson, p, { kind: 'choice', choiceId: 'invalid' });
    await repo.save(p, 101 + p.events.length, request); assert.equal(repo.getReaction().category, category);
  }
  const ctx = humorContext(roastLesson, p, repo.getHistory());
  const forged = selectReaction(ctx, 'es-SV', consent(), emptyHistory(), seededRandom(4), roastLibrary, 'roast');
  assert.equal(forged.category, 'general');
  p = submitAnswer(roastLesson, p, answerFor(currentExercise(roastLesson, p)));
  await repo.save(p, 110, request); assert.equal(repo.getReaction().category, 'recovery');
});
test('reload preserves exact snapshot, progress and history; revocation blocks stale writer and hides restored roast', async () => {
  const { repo, storage, values } = fixture(consent()); await repo.load(); let p = await repo.start(seededRandom(1), 100);
  p = submitAnswer(roastLesson, p, answerFor(currentExercise(roastLesson, p)));
  await repo.save(p, 101, { locale: 'es-MX', preferences: consent() });
  const restored = new MissionRepository(storage, roastLesson, [], 'roast');
  assert.deepEqual(await restored.load(), p); assert.deepEqual(restored.getReaction(), repo.getReaction()); assert.deepEqual(restored.getHistory(), repo.getHistory());
  values.set(key, JSON.stringify(disableAdult(consent())));
  await assert.rejects(repo.save(continueMission(roastLesson, p), 102, { locale: 'es-MX', preferences: consent() }), /consentimiento/);
  assert.deepEqual(await restored.load(), p); assert.equal(restored.getReaction(), null);
});
test('roast and normal games coexist; completion celebrates; failed writes preserve prior state', async () => {
  const { repo, storage } = fixture(consent()); await repo.load(); let p = await repo.start(seededRandom(8), 100);
  const normal = new MissionRepository(storage, cafeLesson); await normal.load(); const normalState = await normal.start(seededRandom(2), 101);
  const request = { locale: 'es-AR', preferences: consent() };
  while (p.status !== 'completed') {
    p = submitAnswer(roastLesson, p, answerFor(currentExercise(roastLesson, p))); await repo.save(p, 102 + p.events.length, request);
    p = continueMission(roastLesson, p); await repo.save(p, 102 + p.events.length, request);
  }
  assert.equal(p.completedObjectives.length, 8); assert.equal(repo.getReaction().category, 'celebration');
  assert.deepEqual(await normal.load(), normalState);
  const before = repo.getReaction(); storage.setItem = async () => { throw Error('quota'); };
  await assert.rejects(repo.start(seededRandom(6), 999), /quota/); assert.deepEqual(repo.getReaction(), before);
});
