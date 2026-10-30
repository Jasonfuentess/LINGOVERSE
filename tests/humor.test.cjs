const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cafeLesson } = require('../.test-build/content/cafe.js');
const { beginMission, currentExercise, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine.js');
const { historyForProgress } = require('../.test-build/domain/learning/variety.js');
const { emptyHistory } = require('../.test-build/domain/variety/history.js');
const { seededRandom } = require('../.test-build/domain/variety/selection.js');
const { humorContext } = require('../.test-build/domain/humor/context.js');
const { selectReaction, validateLibrary, restoreReaction } = require('../.test-build/domain/humor/engine.js');
const { humorDefaults, decodeHumorPreferences, grantAdultConsent, disableAdult } = require('../.test-build/domain/humor/preferences.js');
const { reactionLibrary, coaches } = require('../.test-build/content/humor.js');
const { HumorPreferencesRepository } = require('../.test-build/storage/humorPreferencesRepository.js');

const locales = ['es-SV', 'es-MX', 'es-CO', 'es-AR'];
function answer(state, correct) {
  const exercise = currentExercise(cafeLesson, state);
  return exercise.kind === 'text' ? { kind: 'text', text: correct ? exercise.accepted[0] : 'Respuesta incorrecta' } : { kind: 'choice', choiceId: exercise.choices.find(item => item.correct === correct).id };
}
function sample(wrongCount = 0, correct = false) {
  let state = beginMission(cafeLesson);
  for (let attempt = 0; attempt < wrongCount; attempt++) state = submitAnswer(cafeLesson, state, answer(state, false));
  if (correct || wrongCount === 0) state = submitAnswer(cafeLesson, state, answer(state, correct));
  return { state, history: historyForProgress(cafeLesson, emptyHistory(), null, state, 100) };
}
test('four editorial identities have distinct personalities, IDs and coverage across categories', () => {
  validateLibrary(reactionLibrary);
  assert.equal(new Set(coaches.map(coach => coach.personality)).size, 4);
  assert.equal(new Set(reactionLibrary.map(item => item.text)).size, reactionLibrary.length);
  for (const locale of locales) for (const category of ['general', 'correct', 'error', 'retry', 'recovery', 'recurring', 'progress', 'celebration']) {
    assert.ok(reactionLibrary.filter(item => item.locale === locale && item.category === category).length >= 3);
  }
});
test('real learning evidence differentiates error, retry, recovery and recurring difficulty', () => {
  for (const [wrong, correct, category] of [[0, false, 'error'], [2, false, 'retry'], [3, false, 'recurring'], [2, true, 'recovery'], [0, true, 'correct']]) {
    const { state, history } = sample(wrong, correct);
    const context = humorContext(cafeLesson, state, history);
    assert.equal(context.category, category);
    for (const locale of locales) {
      const picked = selectReaction(context, locale, humorDefaults(), history, seededRandom(10));
      assert.equal(picked.locale, locale);
      assert.equal(picked.category, category);
    }
  }
});
test('no matching recorded error means no invented recurring memory; empty library has safe text fallback', () => {
  const { state, history } = sample(3, false);
  const context = humorContext(cafeLesson, state, history);
  const withoutEvidence = { ...history, errors: [] };
  const reaction = selectReaction(context, 'es-SV', humorDefaults(), withoutEvidence, () => 0);
  assert.equal(reaction.category, 'general');
  const fallback = selectReaction(context, 'es-MX', humorDefaults(), history, () => 0, []);
  assert.equal(fallback.category, 'general');
  assert.ok(fallback.text.length > 10);
  assert.equal(selectReaction(null, 'es-AR', humorDefaults(), emptyHistory(), () => 0).category, 'general');
});
test('reaction selection is reproducible and varied with injectable RNG', () => {
  const { state, history } = sample(0, true);
  const context = humorContext(cafeLesson, state, history);
  const sequence = () => { const rng = seededRandom(123); return Array.from({ length: 50 }, () => selectReaction(context, 'es-CO', humorDefaults(), history, rng).id); };
  assert.deepEqual(sequence(), sequence());
  assert.ok(new Set(sequence()).size >= 3);
});
test('progress and final celebration require actual confirmed objectives', () => {
  let state = beginMission(cafeLesson);
  for (let step = 1; step <= 8; step++) {
    state = continueMission(cafeLesson, submitAnswer(cafeLesson, state, answer(state, true)));
    const history = historyForProgress(cafeLesson, emptyHistory(), null, state, 100);
    const context = humorContext(cafeLesson, state, history);
    if ([3, 6, 8].includes(step)) {
      assert.equal(context.category, step === 8 ? 'celebration' : 'progress');
      assert.equal(selectReaction(context, 'es-AR', humorDefaults(), history, () => 0).category, context.category);
    } else assert.equal(context, null);
  }
});
test('adult humor defaults off, requires both explicit assertions and versioned consent, and can be revoked', () => {
  const defaults = humorDefaults();
  assert.equal(defaults.adult.enabled, false);
  assert.equal(defaults.adult.consent, null);
  for (const input of [{ adultConfirmed: true, explicitlyAgreed: false }, { adultConfirmed: false, explicitlyAgreed: true }, {}]) assert.throws(() => grantAdultConsent(defaults, input, 100));
  const consented = grantAdultConsent(defaults, { adultConfirmed: true, explicitlyAgreed: true }, 100);
  assert.equal(consented.adult.enabled, true);
  assert.equal(consented.adult.consent.version, 1);
  assert.equal(disableAdult(consented).adult.consent, null);
  assert.throws(() => decodeHumorPreferences(JSON.stringify({ ...defaults, adult: { enabled: true, consent: null } })));
  assert.throws(() => decodeHumorPreferences(JSON.stringify({ ...defaults, version: 99 })));
});
test('humor preferences persist independently and disabling humor returns no reaction', async () => {
  const values = new Map([['lingoverse.preferences.v1', 'existing']]);
  const storage = { getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
  const repo = new HumorPreferencesRepository(storage);
  assert.deepEqual(await repo.load(), humorDefaults());
  const settings = { ...humorDefaults(), enabled: false };
  await repo.save(settings);
  assert.deepEqual(await new HumorPreferencesRepository(storage).load(), settings);
  assert.equal(values.get('lingoverse.preferences.v1'), 'existing');
  const { state, history } = sample(0, true);
  assert.equal(selectReaction(humorContext(cafeLesson, state, history), 'es-SV', settings, history, () => 0), null);
});
test('invalid catalog entries and forged snapshots are rejected or hidden without inventing context', () => {
  assert.throws(() => validateLibrary([...reactionLibrary, reactionLibrary[0]]));
  const { state, history } = sample(0, true);
  const context = humorContext(cafeLesson, state, history);
  const selected = selectReaction(context, 'es-SV', humorDefaults(), history, () => 0);
  assert.deepEqual(restoreReaction(selected, context, history), selected);
  assert.equal(restoreReaction({ ...selected, text: 'Invented private memory' }, context, history), null);
  assert.equal(restoreReaction({ ...selected, eventKey: 'other-event' }, context, history), null);
  assert.equal(restoreReaction({ ...selected, locale: 'es-MX' }, context, history), null);
});
test('recovery cannot claim an earlier mistake if the corresponding error evidence is absent', () => {
  const { state, history } = sample(2, true);
  const context = humorContext(cafeLesson, state, history);
  assert.equal(selectReaction(context, 'es-AR', humorDefaults(), { ...history, errors: [] }, () => 0).category, 'general');
});
test('adult editorial content remains excluded without both confirmations, even with a compatible category', () => {
  const { state, history } = sample(0, true);
  const context = humorContext(cafeLesson, state, history);
  const adult = { ...reactionLibrary.find(item => item.locale === 'es-SV' && item.category === 'correct'), id: 'synthetic-adult', mode: 'adult', explicit: true };
  assert.equal(selectReaction(context, 'es-SV', humorDefaults(), history, () => 0, [adult]).category, 'general');
  const consented = grantAdultConsent(humorDefaults(), { adultConfirmed: true, explicitlyAgreed: true }, 100);
  assert.equal(selectReaction(context, 'es-SV', consented, history, () => 0, [adult]).id, 'synthetic-adult');
  assert.equal(selectReaction(context, 'es-SV', disableAdult(consented), history, () => 0, [adult]).category, 'general');
});
test('versioned consent persists and quota failures propagate without overwriting saved preferences', async () => {
  const values = new Map();
  const storage = { getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
  const consented = grantAdultConsent(humorDefaults(), { adultConfirmed: true, explicitlyAgreed: true }, 100);
  const writer = new HumorPreferencesRepository(storage); await writer.load(); await writer.save(consented);
  assert.deepEqual(await new HumorPreferencesRepository(storage).load(), consented);
  const failed = new HumorPreferencesRepository({ getItem: storage.getItem, setItem: async () => { throw Error('quota'); } });
  await failed.load();
  await assert.rejects(failed.save(disableAdult(consented)), /quota/);
  assert.deepEqual(await new HumorPreferencesRepository(storage).load(), consented);
});
test('a stale preference writer cannot restore an adult consent revoked in another window', async () => {
  const values = new Map();
  const storage = { getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
  const initial = new HumorPreferencesRepository(storage); await initial.load();
  const consented = grantAdultConsent(humorDefaults(), { adultConfirmed: true, explicitlyAgreed: true }, 100);
  await initial.save(consented);
  const stale = new HumorPreferencesRepository(storage); await stale.load();
  await initial.save(disableAdult(consented));
  await assert.rejects(stale.save({ ...consented, intensity: 'gentle' }), /cambiaron|conflicto/i);
  assert.equal((await new HumorPreferencesRepository(storage).load()).adult.consent, null);
});
test('gentle intensity excludes playful texts while ordinary friendly humor permits both', () => {
  const { state, history } = sample(0, true);
  const context = humorContext(cafeLesson, state, history);
  assert.equal(selectReaction(context, 'es-SV', { ...humorDefaults(), intensity: 'gentle' }, history, () => 0.99).intensity, 'gentle');
  assert.equal(selectReaction(context, 'es-SV', humorDefaults(), history, () => 0.99).intensity, 'playful');
});
