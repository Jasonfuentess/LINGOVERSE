const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cafeLesson, cafeLessonV1 } = require('../.test-build/content/cafe');
const { beginMission, currentExercise, submitAnswer, continueMission, restoreProgress } = require('../.test-build/domain/learning/engine');
const { conversationPresentation, verifiedWrittenText } = require('../.test-build/domain/conversation/presentation');

test('written transcript retains the accepted equivalent actually used, normalized to editorial content', () => {
  const exercise = cafeLesson.variants[0].exercises.find(e => e.kind === 'text' && e.accepted.length > 1);
  const answer = exercise.accepted[1];
  assert.equal(verifiedWrittenText(exercise, { kind: 'text', text: answer.toUpperCase() + '!' }), answer);
});

test('conversation projection follows all six variants and eight branch combinations, without future turns', () => {
  for (const lesson of [cafeLessonV1, cafeLesson]) for (const variant of lesson.variants) for (let route = 0; route < 8; route++) {
    let progress = beginMission(lesson, 0, () => variant.id);
    assert.deepEqual(conversationPresentation(lesson, progress).history, []);
    let decisions = 0;
    while (progress.status === 'active') {
      const exercise = currentExercise(lesson, progress);
      const correct = exercise.kind === 'choice' ? exercise.choices.filter(c => c.correct) : [];
      const option = correct.length > 1 ? correct[(route >> decisions++) & 1] : correct[0];
      const answer = exercise.kind === 'choice' ? { kind: 'choice', choiceId: option.id } : { kind: 'text', text: exercise.accepted[0] };
      progress = submitAnswer(lesson, progress, answer);
      const before = conversationPresentation(lesson, progress);
      assert.equal(before.history.length, progress.completedObjectives.length);
      progress = continueMission(lesson, progress);
      const view = conversationPresentation(lesson, progress);
      assert.equal(view.history.length, progress.completedObjectives.length);
      assert.deepEqual(view, conversationPresentation(lesson, restoreProgress(lesson, JSON.parse(JSON.stringify(progress)))));
      const turn = view.history.at(-1);
      assert.equal(turn.messages[0].text, exercise.prompt);
      assert.equal(turn.messages[1].text, option?.label ?? exercise.accepted[0]);
      assert.equal(new Set(view.history.flatMap(t => t.messages.map(m => m.id))).size, view.history.flatMap(t => t.messages).length);
    }
    const view = conversationPresentation(lesson, progress);
    assert.equal(view.history.length, 8);
    assert.equal(view.facts.filter(f => f.type === 'mission-completed').length, 1);
    assert.equal(view.facts.filter(f => f.type === 'objective-practiced').length, 8);
    assert.equal(view.voice.playback, 'unavailable');
  }
});

test('history preserves recovery counts without echoing arbitrary written mistakes or adult snapshots', () => {
  let p = beginMission(cafeLesson);
  while (currentExercise(cafeLesson, p).kind !== 'text') {
    const e = currentExercise(cafeLesson, p);
    p = continueMission(cafeLesson, submitAnswer(cafeLesson, p, { kind: 'choice', choiceId: e.choices.find(c => c.correct).id }));
  }
  const e = currentExercise(cafeLesson, p);
  p = submitAnswer(cafeLesson, p, { kind: 'text', text: 'private@example.com' });
  assert.ok(!JSON.stringify(conversationPresentation(cafeLesson, p)).includes('private@'));
  p = continueMission(cafeLesson, submitAnswer(cafeLesson, p, { kind: 'text', text: e.accepted[0] }));
  const view = conversationPresentation(cafeLesson, p);
  assert.equal(view.history.at(-1).attempts, 2);
  assert.ok(!JSON.stringify(view).includes('private@'));
});

test('adventure roast is opt-in, persists snapshot, revokes without blocking normal learning', async () => {
  const { MissionRepository } = require('../.test-build/storage/missionRepository');
  const { humorDefaults, grantAdultConsent, disableAdult, decodeHumorPreferences } = require('../.test-build/domain/humor/preferences');
  const key = 'lingoverse.humor-preferences.v1';
  for (const locale of ['es-SV', 'es-MX', 'es-CO', 'es-AR']) {
    let settings = grantAdultConsent(humorDefaults(), { adultConfirmed: true, explicitlyAgreed: true }, 100);
    const values = new Map([[key, JSON.stringify(settings)]]);
    const storage = { getItem: async key => values.get(key) ?? null, setItem: async (key, value) => values.set(key, value) };
    const repo = new MissionRepository(storage, cafeLesson);
    await repo.load(); let p = await repo.start();
    p = submitAnswer(cafeLesson, p, { kind: 'choice', choiceId: 'invalid' });
    await repo.save(p, 101, { locale, preferences: settings });
    assert.equal(repo.getReaction().mode, 'friendly', 'adult consent alone cannot activate style');
    settings = decodeHumorPreferences(JSON.stringify({ ...settings, adventureRoast: true }));
    values.set(key, JSON.stringify(settings));
    p = submitAnswer(cafeLesson, p, { kind: 'choice', choiceId: 'invalid' });
    await repo.save(p, 102, { locale, preferences: settings });
    assert.equal(repo.getReaction().mode, 'roast');
    assert.equal(repo.getReaction().locale, locale);
    const restored = new MissionRepository(storage, cafeLesson);
    assert.deepEqual(await restored.load(), p);
    assert.deepEqual(restored.getReaction(), repo.getReaction());
    values.set(key, JSON.stringify(disableAdult(settings)));
    assert.deepEqual(await restored.load(), p);
    assert.equal(restored.getReaction(), null);
    p = submitAnswer(cafeLesson, p, { kind: 'choice', choiceId: currentExercise(cafeLesson, p).choices.find(c => c.correct).id });
    await repo.save(p, 103, { locale, preferences: settings });
    assert.equal(repo.getReaction().mode, 'friendly', 'stale consent cannot produce roast');
    assert.equal(disableAdult(settings).adventureRoast, false);
  }
});
