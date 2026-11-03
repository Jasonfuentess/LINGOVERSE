const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { londonLesson, londonLessonV1, londonLessonV2, londonLessonForProgress } = require('../.test-build/content/london');
const { cafeLesson, cafeLessonV1 } = require('../.test-build/content/cafe');
const { validateLesson } = require('../.test-build/domain/learning/validation');
const { assertDistinctConversations, conversationFingerprint } = require('../.test-build/domain/learning/conversation');
const { beginMission, currentExercise, evaluateAnswer, submitAnswer, continueMission, restoreProgress } = require('../.test-build/domain/learning/engine');
const { conversationPresentation } = require('../.test-build/domain/conversation/presentation');
const { matchSpokenChoice } = require('../.test-build/domain/voice/choiceMatching');
const { RecognitionController } = require('../.test-build/domain/voice/recognition');
const { MissionRepository } = require('../.test-build/storage/missionRepository');

function answerFor(exercise, route = 'a', alternate = false) {
  return exercise.kind === 'text' ? { kind: 'text', text: exercise.accepted[alternate ? 1 : 0] } :
    { kind: 'choice', choiceId: (exercise.id === 'choose-path' ? exercise.choices.find(o => o.id === `route-${route}${alternate ? '-alt' : ''}`) : exercise.choices.filter(o => o.correct)[alternate ? 1 : 0]).id };
}
function finish(lesson, variant, route, alternate = false) {
  let state = beginMission(lesson, 0, () => variant.id);
  const history = [];
  while (state.status === 'active') {
    const exercise = currentExercise(lesson, state);
    const answer = answerFor(exercise, route, alternate);
    state = submitAnswer(lesson, state, answer);
    assert.equal(state.feedback.correct, true, `${variant.id} ${route} ${exercise.id}`);
    state = continueMission(lesson, state);
    history.push(exercise.id);
  }
  return { state, history };
}

test('A1 English package has 9 ordered educational objectives, two distinctive valid stories, no dead routes', () => {
  assert.equal(validateLesson(londonLesson), londonLesson);
  assert.equal(londonLesson.language, 'en');
  assert.equal(londonLesson.objectives.length, 9);
  assert.equal(londonLesson.variants.length, 2);
  assert.doesNotThrow(() => assertDistinctConversations(londonLesson.variants));
  assert.notEqual(conversationFingerprint(londonLesson.variants[0]), conversationFingerprint(londonLesson.variants[1]));
  assert.ok(londonLesson.variants.some(v => v.exercises.some(e => e.speaker === 'Nora')));
  assert.ok(londonLesson.variants.some(v => v.exercises.some(e => e.speaker === 'Asha')));
  assert.ok(londonLesson.variants.every(v => v.exercises.filter(e => e.id === 'choose-path')[0].choices.filter(o => o.correct).length === 4));
});

test('all British adventures branch to distinct real scenes and reach exactly nine objectives in either route', () => {
  for (const variant of londonLesson.variants) {
    for (const alternate of [false, true]) {
      const a = finish(londonLesson, variant, 'a', alternate);
      const b = finish(londonLesson, variant, 'b', alternate);
      assert.equal(a.state.completedObjectives.length, 9);
      assert.deepEqual(a.state.completedObjectives, londonLesson.objectives);
      assert.deepEqual(b.state.completedObjectives, londonLesson.objectives);
      assert.ok(a.history.includes('direction-a') && !a.history.includes('direction-b'));
      assert.ok(b.history.includes('direction-b') && !b.history.includes('direction-a'));
      assert.notDeepEqual(a.history, b.history);
      assert.equal(a.state.status, 'completed');
      assert.equal(b.state.status, 'completed');
    }
  }
});

test('authored alternative answers pass through the same educational evaluator, including choices and spoken selection', () => {
  for (const variant of londonLesson.variants) for (const exercise of variant.exercises) {
    if (exercise.kind === 'text') {
      assert.ok(exercise.accepted.length >= 2, `${exercise.id} needs alternatives`);
      for (const accepted of exercise.accepted) {
        const result = evaluateAnswer(exercise, { kind: 'text', text: accepted.toUpperCase() });
        assert.equal(result.correct, true, `${variant.id} ${exercise.id}: ${accepted}`);
        assert.equal('pronunciationScore' in result, false);
      }
    } else {
      assert.ok(exercise.choices.filter(o => o.correct).length >= 2, `${exercise.id} needs alternatives`);
      for (const option of exercise.choices) {
        const id = matchSpokenChoice(exercise, option.label);
        assert.equal(id, option.id, `${variant.id} ${exercise.id}: ${option.label}`);
        assert.equal(evaluateAnswer(exercise, { kind: 'choice', choiceId: id }).correct, option.correct);
      }
      assert.equal(matchSpokenChoice(exercise, 'probably left'), null, 'no fuzzy transcription guessing');
    }
  }
});

test('known written mistakes teach a specific correction; unknown input is not copied into saved answers', () => {
  const variant = londonLesson.variants[0];
  for (const [id, input, pattern] of [['introduce', 'I new here.', /am/], ['help', 'Can you helps me?', /can/i], ['where', 'Where the Blue Door Hostel?', /is/], ['thanks-a', 'Thanks you.', /Thank/], ['bye-a', 'By.', /bye/]]) {
    const exercise = variant.exercises.find(e => e.id === id);
    const result = evaluateAnswer(exercise, { kind: 'text', text: input });
    assert.equal(result.correct, false);
    assert.match(result.explanation, pattern);
  }
  let state = beginMission(londonLesson, 0, () => variant.id);
  state = continueMission(londonLesson, submitAnswer(londonLesson, state, answerFor(currentExercise(londonLesson, state))));
  state = submitAnswer(londonLesson, state, { kind: 'text', text: 'private@example.com' });
  assert.equal(state.feedback.correct, false);
  assert.equal(JSON.stringify(state).includes('private@example.com'), false);
});

test('only the visited London branch appears in event-derived history, never future prompts or raw rejected input', () => {
  for (const variant of londonLesson.variants) {
    let p = beginMission(londonLesson, 0, () => variant.id);
    assert.deepEqual(conversationPresentation(londonLesson, p).history, []);
    while (p.status === 'active') {
      const e = currentExercise(londonLesson, p);
      if (e.id === 'help') {
        p = submitAnswer(londonLesson, p, { kind: 'text', text: 'secret-private-data' });
        assert.equal(conversationPresentation(londonLesson, p).history.length, p.completedObjectives.length);
        assert.ok(!JSON.stringify(conversationPresentation(londonLesson, p)).includes('secret-private-data'));
      }
      p = submitAnswer(londonLesson, p, answerFor(e, 'b'));
      assert.equal(conversationPresentation(londonLesson, p).history.length, p.completedObjectives.length);
      p = continueMission(londonLesson, p);
      const view = conversationPresentation(londonLesson, p);
      assert.equal(view.history.length, p.completedObjectives.length);
      assert.ok(!JSON.stringify(view).includes('secret-private-data'));
      assert.equal(JSON.stringify(view).includes('Asha'), false, 'station does not project riverside people when on another story');
      assert.deepEqual(view, conversationPresentation(londonLesson, restoreProgress(londonLesson, JSON.parse(JSON.stringify(p)))));
    }
    assert.equal(conversationPresentation(londonLesson, p).facts.filter(f => f.type === 'mission-completed').length, 1);
  }
});

test('English and legacy French remain valid and independently versioned', () => {
  for (const lesson of [londonLesson, cafeLesson, cafeLessonV1]) validateLesson(lesson);
  const french = beginMission(cafeLesson);
  const english = beginMission(londonLesson);
  assert.notEqual(french.lessonId, english.lessonId);
  assert.equal(londonLessonForProgress(english), londonLesson);
  assert.throws(() => londonLessonForProgress(french), /Versión/);
  assert.deepEqual(restoreProgress(cafeLesson, french), french);
});

test('two repositories persist their own stories, reload separately, and restore the chosen English branch', async () => {
  const data = new Map();
  const storage = { getItem: async key => data.get(key) ?? null, setItem: async (key, value) => { data.set(key, value); } };
  const english = new MissionRepository(storage, londonLesson);
  const french = new MissionRepository(storage, cafeLesson, [cafeLessonV1]);
  await english.load(); await french.load();
  let ep = await english.start(() => 0.17, 100);
  let fp = await french.start(() => 0.17, 100);
  for (let n = 0; n < 5; n++) { const ex = currentExercise(londonLesson, ep); ep = continueMission(londonLesson, submitAnswer(londonLesson, ep, answerFor(ex, 'b'))); await english.save(ep, 101 + n); }
  fp = continueMission(cafeLesson, submitAnswer(cafeLesson, fp, answerFor(currentExercise(cafeLesson, fp))));
  await french.save(fp, 107);
  assert.equal(data.size, 2);
  const restoredEn = new MissionRepository(storage, londonLesson);
  const restoredFr = new MissionRepository(storage, cafeLesson, [cafeLessonV1]);
  assert.deepEqual(await restoredEn.load(), ep);
  assert.deepEqual(await restoredFr.load(), fp);
  assert.equal(currentExercise(londonLesson, ep).id, 'confirm-b');
  assert.equal(currentExercise(cafeLesson, fp).id, 'commande');
  assert.notEqual([...data.keys()][0], [...data.keys()][1]);
});

test('English speech service receives en-GB and the existing evaluator accepts an edited transcript', () => {
  const seen = [];
  const controller = new RecognitionController({ available: () => true, create: (language, events) => {
    seen.push({ language, events });
    return { start() {}, stop() {}, abort() {} };
  } });
  assert.equal(seen.length, 0, 'permission is not requested until action');
  controller.start('en-GB');
  assert.equal(seen[0].language, 'en-GB');
  seen[0].events.result('Where is the Blue Door host', '');
  seen[0].events.end();
  const where = londonLesson.variants[0].exercises.find(e => e.id === 'where');
  assert.equal(evaluateAnswer(where, { kind: 'text', text: controller.snapshot().finalText }).correct, false);
  assert.equal(evaluateAnswer(where, { kind: 'text', text: 'Where is the Blue Door Hostel?' }).correct, true, 'student may edit before submit');
  assert.equal('pronunciation' in controller.snapshot(), false);
  controller.dispose();
});

test('web microphone is optional, written answers are offered, and English is wired to the existing controls', () => {
  const component = fs.readFileSync('src/features/learning/ExerciseView.tsx', 'utf8');
  const capture = fs.readFileSync('src/features/voice/SpeechInput.tsx', 'utf8');
  assert.match(component, /<SpeechInput/);
  assert.match(component, /<AnswerTextInput/);
  assert.match(component, /language=\{voiceLanguage\}/);
  assert.match(capture, /Platform\.OS === 'web' && controller\.available\(\)/);
  assert.match(capture, /controller\.start\(language\)/);
  assert.match(capture, /no guarda grabaciones/);
  assert.match(capture, /No calificamos tu pronunciación/);
});


test('LV-006A-02 teaches what versus where instead of generic unknown feedback', () => {
  const riverside = londonLesson.variants.find(v => v.id === 'riverside-rain');
  const where = riverside.exercises.find(e => e.id === 'where');
  assert.equal(evaluateAnswer(where, { kind: 'text', text: 'Where is the theatre?' }).correct, true);
  assert.equal(evaluateAnswer(where, { kind: 'text', text: 'Excuse me, where is the theatre?' }).correct, true);
  const wrong = evaluateAnswer(where, { kind: 'text', text: 'what is the Theatre ?' });
  assert.equal(wrong.correct, false);
  assert.match(wrong.explanation, /What is.*qué es.*Where is.*Dónde está/s);
  assert.equal(wrong.writtenIssue, 'vocabulary');
  assert.equal('pronunciation' in wrong, false);
  const station = londonLesson.variants.find(v => v.id === 'station-arrival').exercises.find(e => e.id === 'where');
  assert.equal(evaluateAnswer(station, { kind: 'text', text: 'Where is the hostel?' }).correct, true);
});

test("market and bus dialogues answer the student's actual question without redundant clarification", () => {
  const riverside = londonLesson.variants.find(v => v.id === 'riverside-rain');
  const market = riverside.exercises.find(e => e.id === 'confirm-b');
  assert.equal(market.prompt, 'Good evening! The theatre is just outside the market.');
  assert.ok(market.accepted.includes('Which way is the theatre?'));
  assert.match(market.reply, /Go past the green sign and turn left/);
  assert.ok(!market.reply.startsWith('Yes!'));
  const station = londonLesson.variants.find(v => v.id === 'station-arrival');
  const bus = station.exercises.find(e => e.id === 'confirm-b');
  assert.equal(bus.prompt, 'Hello! Are you going to the hostel?');
  assert.ok(bus.accepted.includes('Is this the bus to the hostel?'));
  assert.match(bus.reply, /bus number five/i);
});

test('v1 London saved events and incorrect feedback are preserved; fresh runs use v4', async () => {
  assert.equal(londonLesson.version, 5);
  assert.equal(require('../.test-build/content/london').londonLessonV4.version, 4);
  assert.equal(londonLessonV2.version, 2);
  assert.equal(londonLessonV1.version, 1);
  const variant = londonLessonV1.variants.find(v => v.id === 'riverside-rain');
  let oldProgress = beginMission(londonLessonV1, 0, () => variant.id);
  for (let i = 0; i < 3; i++) {
    oldProgress = continueMission(londonLessonV1, submitAnswer(londonLessonV1, oldProgress, answerFor(currentExercise(londonLessonV1, oldProgress))));
  }
  oldProgress = submitAnswer(londonLessonV1, oldProgress, { kind: 'text', text: 'What is the Theatre?' });
  assert.match(oldProgress.feedback.explanation, /No podemos identificar/);
  assert.equal(londonLessonForProgress(oldProgress), londonLessonV1);
  assert.deepEqual(restoreProgress(londonLessonV1, JSON.parse(JSON.stringify(oldProgress))), oldProgress);
  const data = new Map([['lingoverse.mission.en-a1-london-lost.v1', JSON.stringify(oldProgress)]]);
  const storage = { getItem: async key => data.get(key) ?? null, setItem: async (key,value) => { data.set(key, value); } };
  const repo = new MissionRepository(storage, londonLesson, [londonLessonV1, londonLessonV2]);
  assert.deepEqual(await repo.load(), oldProgress);
  oldProgress = submitAnswer(londonLessonV1, oldProgress, { kind: 'text', text: 'Where is the Lantern Theatre?' });
  await repo.save(oldProgress);
  assert.deepEqual(await new MissionRepository(storage, londonLesson, [londonLessonV1, londonLessonV2]).load(), oldProgress);
  const fresh = await repo.start(() => 0.2);
  assert.equal(fresh.contentVersion, 5);
  assert.equal(londonLessonForProgress(fresh), londonLesson);
});
