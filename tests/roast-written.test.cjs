const { test } = require('node:test');
const assert = require('node:assert/strict');
const { roastLesson, roastLessonV2, roastLessonForProgress } = require('../.test-build/content/roast.js');
const { beginMission, currentExercise, evaluateAnswer, submitAnswer, restoreProgress } = require('../.test-build/domain/learning/engine.js');
const { validateWritten } = require('../.test-build/domain/learning/written.js');
const { humorContext } = require('../.test-build/domain/humor/context.js');
const { historyForProgress } = require('../.test-build/domain/learning/variety.js');
const { emptyHistory } = require('../.test-build/domain/variety/history.js');
const { selectReaction, restoreReaction } = require('../.test-build/domain/humor/engine.js');
const { roastLibrary } = require('../.test-build/content/roastHumor.js');
const { humorDefaults, grantAdultConsent, disableAdult } = require('../.test-build/domain/humor/preferences.js');
const { seededRandom } = require('../.test-build/domain/variety/selection.js');
const { MissionRepository } = require('../.test-build/storage/missionRepository.js');
const exercise = id => roastLesson.variants[0].exercises.find(e => e.id === id);
test('written equivalences are exact semantic alternatives with safe normalization', () => {
  for (const [id, input] of [['bonjour','  BONJOUR, MADAME ! '], ['prix','COMBIEN EST-CE QUE ÇA COÛTE ?'], ['prix','Ça coûte combien?'], ['merci','Je vous remercie.'], ['depart','Au revoir et bonne journée!']]) assert.equal(evaluateAnswer(exercise(id), { kind: 'text', text: input }).correct, true);
  for (const input of ['bonjour non', 'bon.jour', 'merci', 'bonjour@example.com']) assert.equal(validateWritten(exercise('bonjour'), input).correct, false);
});
test('known mistakes classify narrowly; unknown content is never attributed to invented causes', () => {
  for (const [id,input,issue] of [['bonjour','bonjor','spelling'], ['bonjour','merci','vocabulary'], ['prix','combien ça','structure'], ['bonjour','I live at sensitive-address','unknown']]) {
    const result = validateWritten(exercise(id), input); assert.equal(result.issue, issue); assert.equal(result.correct, false);
    if (issue === 'unknown') assert.equal(result.retained, '');
  }
});
test('private free text is absent from events and replay preserves evaluation and attempts', () => {
  const initial = beginMission(roastLesson);
  const p = submitAnswer(roastLesson, initial, { kind: 'text', text: 'private phone 555-1234 and address' });
  assert.ok(!JSON.stringify(p).includes('555-1234')); assert.equal(p.events.length, 1);
  assert.deepEqual(restoreProgress(roastLesson, JSON.parse(JSON.stringify(p))), p);
  const known = submitAnswer(roastLesson, p, { kind: 'text', text: 'BONJOR!' });
  assert.deepEqual(restoreProgress(roastLesson, known), known); assert.equal(known.feedback.writtenIssue, 'spelling');
});
test('all regional jokes require matching recorded diagnosis; revocation returns no roast', () => {
  const initial = beginMission(roastLesson); const p = submitAnswer(roastLesson, initial, { kind: 'text', text: 'bonjor' });
  const history = historyForProgress(roastLesson, emptyHistory(), null, p, 100);
  const context = humorContext(roastLesson, p, history);
  const prefs = grantAdultConsent(humorDefaults(), { adultConfirmed: true, explicitlyAgreed: true }, 1);
  for (const locale of ['es-SV','es-MX','es-CO','es-AR']) {
    const ids = new Set();
    for (let seed = 0; seed < 30; seed++) {
      const r = selectReaction(context, locale, prefs, history, seededRandom(seed), roastLibrary, 'roast');
      assert.equal(r.writtenIssue, 'spelling'); assert.equal(r.locale, locale); ids.add(r.id);
      assert.deepEqual(restoreReaction(r, context, history, roastLibrary), r);
      assert.equal(restoreReaction(r, { ...context, writtenIssue: 'unknown' }, history, roastLibrary), null);
    }
    assert.ok(ids.size > 1);
    assert.equal(selectReaction(context, locale, disableAdult(prefs), history, seededRandom(1), roastLibrary, 'roast'), null);
  }
});
test('v2 saved games remain on original content while new runs use v3', async () => {
  const prefs = grantAdultConsent(humorDefaults(), { adultConfirmed: true, explicitlyAgreed: true }, 1);
  const map = new Map([['lingoverse.humor-preferences.v1',JSON.stringify(prefs)]]);
  const storage = { getItem: async k => map.get(k) ?? null, setItem: async (k,v) => map.set(k,v) };
  const old = new MissionRepository(storage, roastLessonV2, [], 'roast'); await old.load();
  let p = await old.start(seededRandom(1),100); const e = currentExercise(roastLessonV2,p);
  p = submitAnswer(roastLessonV2,p,{kind:'choice',choiceId:e.choices.find(c=>c.correct).id});
  await old.save(p,101,{locale:'es-SV',preferences:prefs});
  const next = new MissionRepository(storage,roastLesson,[roastLessonV2],'roast');
  assert.deepEqual(await next.load(),p); assert.deepEqual(next.getReaction(),old.getReaction());
  assert.equal(roastLessonForProgress(p).version,2);
  assert.equal((await next.start(seededRandom(2),102)).contentVersion,3);
});
