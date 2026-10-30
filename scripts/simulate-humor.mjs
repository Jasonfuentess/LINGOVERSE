import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const build = spawnSync(process.platform === 'win32' ? 'tsc.cmd' : 'tsc', ['-p', 'tsconfig.core.json'], { stdio: 'inherit', shell: process.platform === 'win32' });
if (build.status !== 0) process.exit(build.status ?? 1);
const require = createRequire(import.meta.url);
const { cafeLesson, cafeLessonV1 } = require('../.test-build/content/cafe.js');
const { reactionLibrary, coaches } = require('../.test-build/content/humor.js');
const { currentExercise, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine.js');
const { seededRandom } = require('../.test-build/domain/variety/selection.js');
const { humorDefaults } = require('../.test-build/domain/humor/preferences.js');
const { humorContext } = require('../.test-build/domain/humor/context.js');
const { MissionRepository } = require('../.test-build/storage/missionRepository.js');
const seed = 404;
const sessions = 1000;
async function simulate() {
  const values = new Map();
  const storage = { getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
  const makeRepo = () => new MissionRepository(storage, cafeLesson, [cafeLessonV1]);
  let repo = makeRepo(); await repo.load();
  const random = seededRandom(seed);
  const distribution = {};
  const byRegion = {};
  const byCategory = {};
  let previous = null;
  let consecutiveRepeats = 0;
  let count = 0;
  const save = async (progress, request, at) => {
    const originalFeedback = JSON.stringify(progress.feedback);
    await repo.save(progress, at, request);
    assert.equal(JSON.stringify(progress.feedback), originalFeedback);
    const context = humorContext(cafeLesson, progress, repo.getHistory());
    const reaction = repo.getReaction();
    if (!context) { assert.equal(reaction, null); return; }
    assert.equal(reaction.category, context.category);
    assert.equal(reaction.locale, request.locale);
    assert.equal(reaction.explicit, false);
    if (reaction.id === previous) consecutiveRepeats++;
    previous = reaction.id;
    distribution[reaction.id] = (distribution[reaction.id] ?? 0) + 1;
    byRegion[reaction.locale] = (byRegion[reaction.locale] ?? 0) + 1;
    byCategory[reaction.category] = (byCategory[reaction.category] ?? 0) + 1;
    count++;
  };
  for (let session = 1; session <= sessions; session++) {
    const request = { locale: coaches[(session - 1) % coaches.length].locale, preferences: humorDefaults(), random };
    let progress = await repo.start(random, session * 1000);
    while (progress.status !== 'completed') {
      const exercise = currentExercise(cafeLesson, progress);
      if (session % 5 === 0 && exercise.id === 'bonjour') {
        for (let retry = 0; retry < 3; retry++) {
          progress = submitAnswer(cafeLesson, progress, { kind: 'choice', choiceId: 'merci-saludo' });
          await save(progress, request, session * 1000 + progress.events.length);
        }
      }
      const answer = exercise.kind === 'text' ? { kind: 'text', text: exercise.accepted[0] } : { kind: 'choice', choiceId: exercise.choices.find(choice => choice.correct).id };
      progress = submitAnswer(cafeLesson, progress, answer);
      await save(progress, request, session * 1000 + progress.events.length);
      progress = continueMission(cafeLesson, progress);
      await save(progress, request, session * 1000 + progress.events.length);
    }
    assert.equal(progress.completedObjectives.length, 8);
    if (session % 25 === 0) {
      const snapshot = repo.getReaction(); const history = repo.getHistory();
      repo = makeRepo(); assert.deepEqual(await repo.load(), progress);
      assert.deepEqual(repo.getReaction(), snapshot); assert.deepEqual(repo.getHistory(), history);
    }
  }
  const history = repo.getHistory();
  assert.equal(history.errors[0].count, 600);
  return { seed, sessions, completedMissions: sessions, librarySize: reactionLibrary.length,
    reactionsShown: count, usedReactionIds: Object.keys(distribution).length, byRegion, byCategory, distribution,
    consecutiveRepeats, consecutiveRepeatRate: consecutiveRepeats / (count - 1), relevanceMismatches: 0,
    recordedErrors: history.errors[0].count,
    retained: { entries: history.entries.length, recent: history.recent.length, errors: history.errors.length },
    storedCharacters: [...values.values()][0].length };
}
const report = await simulate();
assert.deepEqual(await simulate(), report);
writeFileSync('docs/LV-004A_SIMULATION.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, distribution: '(see docs/LV-004A_SIMULATION.json)' }, null, 2));
