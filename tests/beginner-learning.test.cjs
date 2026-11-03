const { test } = require('node:test');
const assert = require('node:assert/strict');
const { londonLesson, londonLessonForProgress } = require('../.test-build/content/london');
const { cafeLesson } = require('../.test-build/content/cafe');
const { beginMission, currentExercise, submitAnswer, continueMission, restoreProgress } = require('../.test-build/domain/learning/engine');
const { VoiceController } = require('../.test-build/domain/voice/playback');

test('LEARN: London initial options greet AND answer the offer of help', () => {
  for (const variant of londonLesson.variants) {
    const first = variant.exercises.find(e => e.id === 'greet');
    assert.match(first.prompt, /help/i);
    const correct = first.choices.filter(c => c.correct);
    assert.equal(correct.length, 2);
    for (const choice of correct) assert.match(choice.label, /yes.*please|yes.*need help/i);
  }
});

test('LEARN: slow playback reaches the actual speech driver and is bounded', async () => {
  const calls = [];
  const controller = new VoiceController({ voices: async () => [{ identifier: 'fr', language: 'fr-FR', name: 'FR' }], stop: async () => {}, speak: (...args) => calls.push(args) }, () => () => {});
  controller.configure({ scope: 'test', muted: false, adultAllowed: false });
  await controller.refresh();
  await controller.play({ id: 'slow', text: 'Bonjour !', language: 'fr-FR', rate: 0.65 });
  assert.equal(calls[0][3], 0.65);
  await controller.play({ id: 'invalid', text: 'Bonjour !', language: 'fr-FR', rate: -2 });
  assert.equal(calls.length, 1, 'invalid rate is never sent to driver');
  await controller.stop();
});

test('LEARN: preparation is explicit, finite and cannot certify speaking or advance the mission', () => {
  const { advancePreparation } = require('../.test-build/domain/learning/support');
  let step = 'listen';
  for (const expected of ['meaning', 'parts', 'rehearse', 'respond']) {
    step = advancePreparation(step);
    assert.equal(step, expected);
  }
  assert.equal(advancePreparation('respond'), 'respond');
  assert.equal(advancePreparation('done'), 'done');
});

test('LEARN: French and English practice models are real accepted replies, with related transfer', () => {
  const { beginnerPhrase } = require('../.test-build/content/beginner');
  for (const [lesson, language] of [[cafeLesson, 'fr'], [londonLesson, 'en']]) for (const variant of lesson.variants) {
    const exercise = variant.exercises[0];
    const phrase = beginnerPhrase(language, 'cafe', exercise);
    assert.ok(phrase);
    assert.ok(exercise.choices.some(c => c.correct && c.label === phrase.text));
    assert.ok(phrase.parts.length >= 1);
    assert.ok(phrase.meaning.length > 0);
    assert.ok(phrase.transfer.choices.some(c => c.correct));
    assert.equal(beginnerPhrase(language, 'cafe', variant.exercises[1]), null);
  }
  assert.equal(beginnerPhrase('fr', 'rendezvous', cafeLesson.variants[0].exercises[0]), null);
});

test('LEARN: per-language support survives reload and concurrent updates without touching mission records', async () => {
  const { LearningSupportRepository } = require('../.test-build/storage/learningSupportRepository');
  const data = new Map([['lingoverse.mission.fr-a1-paris-cafe.v1', 'untouched']]);
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
  const a = new LearningSupportRepository(storage), b = new LearningSupportRepository(storage);
  assert.equal((await a.load()).languages.fr.stage, 'pre-a1');
  await Promise.all([a.change('fr', { checkpoint: { id: 'fr-greeting', step: 'parts' } }), b.change('en', { stage: 'a1', mode: 'independent' })]);
  const saved = await new LearningSupportRepository(storage).load();
  assert.equal(saved.languages.fr.checkpoints['fr-greeting'], 'parts');
  assert.equal(saved.languages.en.stage, 'a1');
  assert.equal(saved.languages.en.mode, 'independent');
  assert.equal(saved.languages.fr.mode, 'guided');
  assert.equal(data.get('lingoverse.mission.fr-a1-paris-cafe.v1'), 'untouched');
  assert.equal(data.size, 2);
});

test('LEARN: corrupt support and failed writes never overwrite progress or claim a successful checkpoint', async () => {
  const { LearningSupportRepository } = require('../.test-build/storage/learningSupportRepository');
  const corrupted = new LearningSupportRepository({ getItem: async () => '{broken', setItem: async () => assert.fail('must not overwrite') });
  await assert.rejects(corrupted.load());
  await assert.rejects(corrupted.change('fr', { mode: 'independent' }));
  const blocked = new LearningSupportRepository({ getItem: async () => null, setItem: async () => { throw Error('quota'); } });
  await assert.rejects(blocked.change('fr', { checkpoint: { id: 'fr-greeting', step: 'done' } }), /quota/);
  await assert.rejects(blocked.change('en', { checkpoint: { id: 'fr-greeting', step: 'respond' } }), /expresión|idioma/i);
});

test('LEARN: transcript review distinguishes text correctness, uncertain recognition and wrong configured language without writing an attempt', () => {
  const { inspectTranscript } = require('../.test-build/domain/voice/transcriptReview');
  const exercise = cafeLesson.variants[0].exercises[0];
  const before = beginMission(cafeLesson);
  const evidence = { confidence: 0.9, language: 'fr-FR' };
  assert.equal(inspectTranscript(exercise, '  BONJOUR!! ', 'fr-FR', evidence).kind, 'valid');
  assert.equal(inspectTranscript(exercise, 'Merci !', 'fr-FR', evidence).kind, 'incorrect');
  assert.equal(inspectTranscript(exercise, 'Bonsoir', 'fr-FR', evidence).kind, 'uncertain');
  assert.equal(inspectTranscript(exercise, 'Bonjour', 'fr-FR', { confidence: 0.2 }).kind, 'uncertain');
  assert.equal(inspectTranscript(exercise, 'Bonjour', 'fr-FR', {}).kind, 'uncertain');
  assert.equal(inspectTranscript(exercise, '', 'fr-FR', evidence).kind, 'no-recognition');
  assert.equal(inspectTranscript(exercise, 'Bonjour', 'fr-FR', { ...evidence, language: 'en-GB' }).kind, 'wrong-language');
  assert.deepEqual(before, beginMission(cafeLesson));
  assert.equal('score' in inspectTranscript(exercise, 'Bonjour', 'fr-FR', evidence), false);
});

test('LEARN: archived London v3 replays identically, new v4 completes all existing routes', async () => {
  const { londonLessonV1, londonLessonV2, londonLessonV3 } = require('../.test-build/content/london');
  const { MissionRepository } = require('../.test-build/storage/missionRepository');
  assert.equal(londonLessonV3.version, 3);
  assert.equal(londonLesson.version, 4);
  let old = beginMission(londonLessonV3);
  old = submitAnswer(londonLessonV3, old, { kind: 'choice', choiceId: 'hello' });
  assert.equal(londonLessonForProgress(old), londonLessonV3);
  assert.deepEqual(restoreProgress(londonLessonV3, JSON.parse(JSON.stringify(old))), old);
  const data = new Map([['lingoverse.mission.en-a1-london-lost.v1', JSON.stringify(old)]]);
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
  const repository = new MissionRepository(storage, londonLesson, [londonLessonV1, londonLessonV2, londonLessonV3]);
  assert.deepEqual(await repository.load(), old);
  old = continueMission(londonLessonV3, old);
  await repository.save(old);
  assert.deepEqual(await new MissionRepository(storage, londonLesson, [londonLessonV1, londonLessonV2, londonLessonV3]).load(), old);
  for (const variant of londonLesson.variants) for (const route of ['a', 'b']) {
    let state = beginMission(londonLesson, 0, () => variant.id);
    while (state.status === 'active') {
      const ex = currentExercise(londonLesson, state);
      const answer = ex.kind === 'text' ? { kind: 'text', text: ex.accepted[0] } : { kind: 'choice', choiceId: (ex.choices.find(c => c.id === `route-${route}`) ?? ex.choices.find(c => c.correct)).id };
      state = continueMission(londonLesson, submitAnswer(londonLesson, state, answer));
    }
    assert.equal(state.completedObjectives.length, 9);
  }
});

test('LEARN: recognition carries uncertainty and detects configured language mismatch before accepting text', () => {
  const { RecognitionController } = require('../.test-build/domain/voice/recognition');
  const { createWebRecognition } = require('../.test-build/domain/voice/recognitionWeb');
  let browser;
  class Recognizer { constructor() { browser = this; } start() {} stop() {} abort() {} }
  const c = new RecognitionController(createWebRecognition(() => ({ isSecureContext: true, SpeechRecognition: Recognizer })));
  c.start('fr-FR');
  browser.onresult({ results: [{ isFinal: true, 0: { transcript: 'Bonjour', confidence: 0.2 } }] });
  browser.onend();
  assert.equal(c.snapshot().problem, 'uncertain');
  assert.equal(c.snapshot().evidence.confidence, 0.2);
  c.start('fr-FR'); browser.lang = 'en-GB';
  browser.onresult({ results: [{ isFinal: true, 0: { transcript: 'hello', confidence: 0.9 } }] });
  assert.equal(c.snapshot().problem, 'language');
  assert.equal(c.snapshot().finalText, '');
  c.start('fr-FR'); browser.onerror({ error: 'not-allowed' });
  assert.equal(c.snapshot().problem, 'permission');
  c.start('fr-FR'); browser.onend();
  assert.equal(c.snapshot().problem, 'empty');
  c.dispose();
});

test('LEARN: natural brief acceptances match explicit alternatives; ambiguous transcripts are never guessed', () => {
  const { matchSpokenChoice } = require('../.test-build/domain/voice/choiceMatching');
  const { validateLesson } = require('../.test-build/domain/learning/validation');
  for (const variant of londonLesson.variants) {
    const first=variant.exercises[0];
    assert.equal(matchSpokenChoice(first,' YES, PLEASE!! '),'hello');
    assert.equal(matchSpokenChoice(first,'Yes I need help.'),'hi');
    assert.equal(matchSpokenChoice(first,'No, thank you.'),null);
    assert.equal(matchSpokenChoice(first,'some help'),null);
    const ambiguous={...first, choices:[first.choices[0],{...first.choices[1],spokenAlternatives:['Yes, please.']}]};
    assert.equal(matchSpokenChoice(ambiguous,'Yes, please.'),null);
  }
  const invalid=JSON.parse(JSON.stringify(londonLesson));
  invalid.variants[0].exercises[0].choices[0].spokenAlternatives=[null];
  assert.throws(()=>validateLesson(invalid),/contenido inválido/);
});
