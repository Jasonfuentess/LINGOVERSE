const { test } = require('node:test');
const assert = require('node:assert/strict');
const { RecognitionController, recognitionError } = require('../.test-build/domain/voice/recognition');
const { createWebRecognition } = require('../.test-build/domain/voice/recognitionWeb');
const { matchSpokenChoice } = require('../.test-build/domain/voice/choiceMatching');
const { cafeLesson } = require('../.test-build/content/cafe');
const { beginMission, currentExercise, submitAnswer, evaluateAnswer } = require('../.test-build/domain/learning/engine');

function mockDriver() {
  const sessions = [];
  const driver = {
    available: () => true,
    create: (language, events) => {
      const s = { language, events, started: 0, stopped: 0, aborted: 0,
        start() { s.started++; }, stop() { s.stopped++; }, abort() { s.aborted++; } };
      sessions.push(s); return s;
    },
  };
  return { driver, sessions };
}

test('mic permission is never requested until explicit start, and the French locale is passed to the driver', () => {
  const { driver, sessions } = mockDriver();
  const c = new RecognitionController(driver);
  assert.equal(c.available(), true);
  assert.equal(sessions.length, 0);
  assert.equal(c.start('fr-FR'), true);
  assert.equal(sessions[0].language, 'fr-FR');
  assert.equal(sessions[0].started, 1);
  assert.equal(c.snapshot().status, 'listening');
  c.dispose();
});

test('interim text is not final; explicit stop waits for browser completion and keeps confirmed transcription', () => {
  const { driver, sessions } = mockDriver();
  const c = new RecognitionController(driver);
  c.start('fr-FR');
  sessions[0].events.result('', 'Je voudrais');
  assert.equal(c.snapshot().finalText, '');
  assert.equal(c.snapshot().interimText, 'Je voudrais');
  c.stop();
  assert.equal(c.snapshot().status, 'stopping');
  sessions[0].events.result('Je voudrais un café', '');
  sessions[0].events.end();
  assert.equal(c.snapshot().status, 'idle');
  assert.equal(c.snapshot().finalText, 'Je voudrais un café');
  assert.equal(c.snapshot().error, null);
  assert.equal(sessions[0].stopped, 1);
  c.dispose();
});

test('navigation, hiding and canceling can discard the session; callbacks arriving afterwards are ignored', () => {
  const { driver, sessions } = mockDriver();
  const c = new RecognitionController(driver);
  c.start('fr-FR'); const old = sessions[0];
  c.cancel(); old.events.result('intrusion', ''); old.events.end();
  assert.equal(old.aborted, 1);
  assert.equal(c.snapshot().finalText, '');
  c.start('fr-FR'); old.events.error('network'); old.events.result('after cancellation', '');
  assert.equal(c.snapshot().status, 'listening');
  sessions[1].events.result('Bonjour', '');
  c.dispose(); sessions[1].events.result('stale', '');
  assert.equal(c.snapshot().finalText, 'Bonjour');
  assert.equal(sessions[1].aborted, 1);
});

test('denied permission, network errors, empty speech and missing browser keep keyboard fallback', () => {
  for (const code of ['not-allowed', 'service-not-allowed', 'network', 'audio-capture', 'language-not-supported']) {
    const { driver, sessions } = mockDriver();
    const c = new RecognitionController(driver);
    c.start('fr-FR'); sessions[0].events.error(code);
    assert.equal(c.snapshot().status, 'error');
    assert.ok(c.snapshot().error.includes('Podés') || c.snapshot().error.includes('Revisá'));
    c.dispose();
  }
  const { driver, sessions } = mockDriver();
  const c = new RecognitionController(driver);
  c.start('fr-FR'); sessions[0].events.end();
  assert.match(c.snapshot().error, /No se detectó/);
  c.dispose();
  const unsupported = new RecognitionController({ available: () => false, create: () => { throw Error('should never be created'); } });
  assert.equal(unsupported.start('fr-FR'), false);
  assert.equal(unsupported.snapshot().status, 'error');
  assert.match(recognitionError('aborted'), /interrumpió/);
});

test('start and stop exceptions never fabricate transcripts or leave recording active', () => {
  const c = new RecognitionController({ available: () => true, create: () => ({ start: () => { throw Error('blocked'); }, stop() {}, abort() {} }) });
  assert.equal(c.start('fr-FR'), false);
  assert.equal(c.snapshot().status, 'error');
  assert.equal(c.snapshot().finalText, '');
  c.dispose();
  const d = new RecognitionController({ available: () => true, create: () => ({ start() {}, stop() { throw Error('closed'); }, abort() {} }) });
  d.start('fr-FR'); d.stop(); assert.equal(d.snapshot().status, 'error'); d.dispose();
});

test('web adapter refuses insecure context or missing native browser recognition', () => {
  for (const browser of [undefined, { isSecureContext: false, webkitSpeechRecognition: class {} }, { isSecureContext: true }]) {
    const driver = createWebRecognition(() => browser);
    assert.equal(driver.available(), false);
  }
});

test('web adapter enables single-turn recognition and joins final and provisional browser results without recording bytes', () => {
  const recognizers = [];
  class FakeSpeechRecognition {
    start() { this.started = true; }
    stop() { this.stopped = true; }
    abort() { this.aborted = true; }
    constructor() { recognizers.push(this); }
  }
  const driver = createWebRecognition(() => ({ isSecureContext: true, webkitSpeechRecognition: FakeSpeechRecognition }));
  const c = new RecognitionController(driver);
  assert.equal(c.available(), true);
  c.start('fr-FR'); const engine = recognizers[0];
  assert.equal(engine.lang, 'fr-FR');
  assert.equal(engine.continuous, false);
  assert.equal(engine.interimResults, true);
  assert.equal(engine.maxAlternatives, 1);
  engine.onresult({ results: [ { isFinal: true, 0: { transcript: ' Bonjour ' } }, { isFinal: false, 0: { transcript: 'je voudrais' } } ] });
  assert.equal(c.snapshot().finalText, 'Bonjour');
  assert.equal(c.snapshot().interimText, 'je voudrais');
  engine.onresult({ results: [ { isFinal: true, 0: { transcript: 'Bonjour' } }, { isFinal: true, 0: { transcript: 'je voudrais un café' } } ] });
  engine.onend();
  assert.equal(c.snapshot().finalText, 'Bonjour je voudrais un café');
  assert.equal(c.snapshot().status, 'idle');
  c.dispose();
});

test('browser error mapping does not mistake recognition for pronunciation feedback', () => {
  class FakeRecognizer { start() {} stop() {} abort() {} }
  const c = new RecognitionController(createWebRecognition(() => ({ SpeechRecognition: FakeRecognizer, isSecureContext: true })));
  c.start('fr-FR');
  const capture = c.snapshot();
  assert.equal('pronunciation' in capture, false);
  assert.equal('score' in capture, false);
  c.dispose();
});

test('spoken choice matching uses only an exact, unique normalized visible choice; ambiguity and guesses remain manual', () => {
  for (const variant of cafeLesson.variants) for (const exercise of variant.exercises.filter(e => e.kind === 'choice')) {
    for (const option of exercise.choices) {
      const matches = exercise.choices.filter(o => o.label.toLowerCase() === option.label.toLowerCase());
      if (matches.length === 1) assert.equal(matchSpokenChoice(exercise, option.label.toUpperCase() + '!'), option.id);
    }
    assert.equal(matchSpokenChoice(exercise, 'un café'), null); // no fuzzy choice matching
    assert.equal(matchSpokenChoice(exercise, ''), null);
  }
  const v = cafeLesson.variants[0].exercises.find(e => e.kind === 'choice');
  const duplicated = { ...v, choices: [v.choices[0], { ...v.choices[0], id: 'duplicate' }] };
  assert.equal(matchSpokenChoice(duplicated, v.choices[0].label), null);
});

test('confirmed transcription enters existing educational answer validation and history, not a pronunciation grade', () => {
  const lesson = cafeLesson;
  const variant = lesson.variants[0];
  const choice = variant.exercises.find(e => e.kind === 'choice');
  const option = choice.choices.find(o => o.correct);
  const id = matchSpokenChoice(choice, option.label);
  assert.equal(id, option.id);
  const evaluation = evaluateAnswer(choice, { kind: 'choice', choiceId: id });
  assert.equal(evaluation.correct, true);
  const written = variant.exercises.find(e => e.kind === 'text');
  const utterance = written.accepted[0];
  const feedback = evaluateAnswer(written, { kind: 'text', text: utterance });
  assert.equal(feedback.correct, true);
  assert.equal('pronunciationScore' in feedback, false);
  let progress = beginMission(lesson, 0, () => variant.id);
  const first = currentExercise(lesson, progress);
  const firstAnswer = first.kind === 'choice' ? { kind: 'choice', choiceId: first.choices[0].id } : { kind: 'text', text: first.accepted[0] };
  progress = submitAnswer(lesson, progress, firstAnswer);
  assert.deepEqual(progress.events.at(-1).answer, firstAnswer);
});
