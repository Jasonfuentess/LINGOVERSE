const { test } = require('node:test');
const assert = require('node:assert/strict');
const { selectContent, seededRandom } = require('../.test-build/domain/variety/selection.js');
const { emptyHistory, noteAppearance, recordError, validateHistory, nextSession, LIMITS } = require('../.test-build/domain/variety/history.js');
const context = (patch = {}) => ({ language: 'fr', level: 'A1', category: 'mission-variant', objectives: ['saluer'], knownContent: [], tags: ['cafe'], scopeId: 'lesson', session: 1, ...patch });
const candidate = (id, patch = {}) => ({ id, language: 'fr', level: 'A1', category: 'mission-variant', objectives: ['saluer'], requires: [], tags: ['cafe'], baseWeight: 1, ...patch });

test('filters language, CEFR, objectives, prerequisites, category, region and adult material before selection', () => {
  const invalid = [candidate('en', { language: 'en' }), candidate('advanced', { level: 'B1' }), candidate('other-objective', { objectives: ['prix'] }), candidate('unknown-word', { requires: ['unknown'] }), candidate('humor', { category: 'reaction' }), candidate('region', { coachLocale: 'es-MX' }), candidate('adult', { explicit: true })];
  const decision = selectContent([...invalid, candidate('valid')], context(), emptyHistory(), () => 0);
  assert.equal(decision.candidateId, 'valid');
  assert.equal(decision.excluded.length, invalid.length);
  assert.equal(selectContent([candidate('english', { language: 'en' })], context({ language: 'en' }), emptyHistory(), () => 0).candidateId, 'english');
});
test('frequency and recency reduce weights but allow spaced review and contextual relevance', () => {
  let history = nextSession(emptyHistory());
  for (let i = 0; i < 15; i++) history = noteAppearance(history, 'used', context(), 100);
  const decision = selectContent([candidate('used'), candidate('fresh'), candidate('less-relevant', { tags: [] })], context({ session: 2 }), history, () => 0.5);
  const weight = id => decision.weights.find(item => item.id === id).weight;
  assert.ok(weight('fresh') > weight('used') * 5);
  assert.ok(weight('fresh') > weight('less-relevant'));
  const later = selectContent([candidate('used')], context({ session: 20 }), history, () => 0.8);
  assert.ok(later.weights[0].weight > weight('used'));
  assert.equal(later.candidateId, 'used');
});
test('weighted draws honor relative base weights, seeds are deterministic and invalid RNG/weights are rejected', () => {
  const candidates = [candidate('one'), candidate('three', { baseWeight: 3 })];
  const run = () => { const rng = seededRandom(123); return Array.from({ length: 1000 }, () => selectContent(candidates, context(), emptyHistory(), rng).candidateId); };
  const sequence = run();
  assert.deepEqual(sequence, run());
  const count = sequence.filter(id => id === 'three').length;
  assert.ok(count > 680 && count < 820, String(count));
  for (const value of [-1, 1, NaN]) assert.throws(() => selectContent(candidates, context(), emptyHistory(), () => value));
  assert.throws(() => selectContent([candidate('bad', { baseWeight: -1 })], context(), emptyHistory(), () => 0));
  assert.throws(() => selectContent([candidate('same'), candidate('same')], context(), emptyHistory(), () => 0));
});
test('small and exhausted libraries repeat safely; empty or ineligible libraries return no candidate', () => {
  let history = emptyHistory();
  for (let i = 1; i <= 20; i++) {
    history = nextSession(history);
    const ctx = context({ session: i });
    assert.equal(selectContent([candidate('only')], ctx, history, () => 0).candidateId, 'only');
    history = noteAppearance(history, 'only', ctx, i);
  }
  assert.equal(selectContent([], context({ session: 21 }), history, () => 0).candidateId, null);
  assert.equal(selectContent([candidate('advanced', { level: 'C2' })], context({ session: 21 }), history, () => 0).candidateId, null);
});
test('error references require a matching recorded fact, scope, objective and language', () => {
  const target = candidate('remember', { errorRef: 'lesson:saluer' });
  assert.equal(selectContent([target], context(), emptyHistory(), () => 0).candidateId, null);
  let history = nextSession(emptyHistory());
  history = recordError(history, { id: 'lesson:saluer', scopeId: 'lesson', objectiveId: 'saluer', exerciseId: 'bonjour', variantId: 'morning', language: 'fr' }, 10);
  assert.equal(selectContent([target], context(), history, () => 0).candidateId, 'remember');
  assert.equal(selectContent([target], context({ scopeId: 'other' }), history, () => 0).candidateId, null);
  assert.equal(selectContent([candidate('remember-en', { language: 'en', errorRef: 'lesson:saluer' })], context({ language: 'en' }), history, () => 0).candidateId, null);
});
test('bounded history survives JSON roundtrip and rejects malformed/future data', () => {
  let history = emptyHistory();
  for (let i = 1; i <= 600; i++) {
    history = nextSession(history);
    history = noteAppearance(history, `id-${i}`, context({ session: i }), i);
    history = recordError(history, { id: `error-${i}`, scopeId: 'lesson', objectiveId: 'saluer', exerciseId: 'bonjour', variantId: 'morning', language: 'fr' }, i);
  }
  assert.equal(history.entries.length, LIMITS.entries);
  assert.equal(history.recent.length, LIMITS.recent);
  assert.equal(history.errors.length, LIMITS.errors);
  assert.deepEqual(validateHistory(JSON.parse(JSON.stringify(history))), history);
  for (const patch of [{ version: 2 }, { session: -1 }, { entries: [{ id: 'x', count: -1 }] }, { errors: [{ id: 'fake' }] }]) assert.throws(() => validateHistory({ ...history, ...patch }));
});
test('candidate metadata cannot duplicate tags to inflate contextual relevance', () => {
  assert.throws(() => selectContent([candidate('duplicate-tags', { tags: ['cafe', 'cafe'] })], context(), emptyHistory(), () => 0));
  assert.throws(() => selectContent([candidate('too-many-tags', { tags: Array.from({ length: 65 }, (_, i) => `tag-${i}`) })], context(), emptyHistory(), () => 0));
});
test('public history operations reject invalid dates and error identities immediately', () => {
  assert.throws(() => noteAppearance(emptyHistory(), 'valid-id', context(), -1));
  assert.throws(() => noteAppearance(emptyHistory(), 'valid-id', context(), NaN));
  assert.throws(() => recordError(emptyHistory(), { id: 'fake' }, 10));
});
