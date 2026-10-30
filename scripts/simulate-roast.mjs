import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const build = spawnSync(process.platform === 'win32' ? 'tsc.cmd' : 'tsc', ['-p', 'tsconfig.core.json'], { stdio: 'inherit', shell: process.platform === 'win32' });
if (build.status !== 0) process.exit(build.status ?? 1);
const require = createRequire(import.meta.url);
const { roastLesson: lesson } = require('../.test-build/content/roast.js');
const { MissionRepository } = require('../.test-build/storage/missionRepository.js');
const { currentExercise, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine.js');
const { humorContext } = require('../.test-build/domain/humor/context.js');
const { humorDefaults, grantAdultConsent } = require('../.test-build/domain/humor/preferences.js');
const { seededRandom } = require('../.test-build/domain/variety/selection.js');
const seed = 40402;
async function simulate() {
  const random = seededRandom(seed);
  const report = { seed, sessions: 1000, reactions: 0, regional: {}, categories: {}, diagnoses: {}, distribution: {}, consecutiveRepeats: 0, sameContextRepeats: 0, sameContextComparisons: 0, relevanceErrors: 0, reloads: 0, completed: 0 };
  for (const locale of ['es-SV', 'es-MX', 'es-CO', 'es-AR']) {
    const prefs = grantAdultConsent(humorDefaults(), { adultConfirmed: true, explicitlyAgreed: true }, 1);
    const values = new Map([['lingoverse.humor-preferences.v1', JSON.stringify(prefs)]]);
    const storage = { getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
    const make = () => new MissionRepository(storage, lesson, [], 'roast');
    let repo = make(); await repo.load();
    let previous;
    const byCategory = {};
    const save = async p => {
      await repo.save(p, 1000 + p.run * 100 + p.events.length, { locale, preferences: prefs, random });
      const context = humorContext(lesson, p, repo.getHistory());
      const reaction = repo.getReaction();
      if (!context) { assert.equal(reaction, null); return; }
      assert.ok(reaction); assert.equal(reaction.locale, locale); assert.equal(reaction.category, context.category); assert.equal(reaction.mode, 'roast');
      if (context.writtenIssue) {
        report.diagnoses[context.writtenIssue] = (report.diagnoses[context.writtenIssue] ?? 0) + 1;
        if (context.writtenIssue !== 'unknown') assert.equal(reaction.writtenIssue, context.writtenIssue);
        else assert.equal(reaction.writtenIssue, undefined);
      }
      if (['recurring', 'recovery'].includes(reaction.category)) assert.ok(repo.getHistory().errors.some(f => f.id === context.errorRef && f.scopeId === lesson.id && f.count >= (reaction.category === 'recurring' ? 3 : context.wrongAttempts)));
      report.reactions++; report.regional[locale] = (report.regional[locale] ?? 0) + 1;
      report.categories[reaction.category] = (report.categories[reaction.category] ?? 0) + 1;
      report.distribution[reaction.id] = (report.distribution[reaction.id] ?? 0) + 1;
      if (previous === reaction.id) report.consecutiveRepeats++;
      if (byCategory[reaction.category]) { report.sameContextComparisons++; if (byCategory[reaction.category] === reaction.id) report.sameContextRepeats++; }
      byCategory[reaction.category] = reaction.id; previous = reaction.id;
    };
    for (let session = 0; session < 250; session++) {
      let p = await repo.start(random, 1000 + session * 100);
      let index = 0;
      while (p.status !== 'completed') {
        const exercise = currentExercise(lesson, p);
        const wrong = session % 4 === 0 && index === (Math.floor(session / 4) % 8) ? 1 + (Math.floor(session / 4) % 3) : 0;
        for (let attempt = 0; attempt < wrong; attempt++) {
          const mistake = exercise.kind === 'text' && session % 3 !== 0 ? exercise.writtenRules?.[session % exercise.writtenRules.length]?.input : undefined;
          p = submitAnswer(lesson, p, exercise.kind === 'text' ? { kind: 'text', text: mistake ?? 'private unknown input' } : { kind: 'choice', choiceId: 'incorrect' }); await save(p);
          assert.ok(!JSON.stringify(p).includes('private unknown input'));
        }
        const answer = exercise.kind === 'text' ? { kind: 'text', text: exercise.accepted[0] } : { kind: 'choice', choiceId: exercise.choices.find(c => c.correct).id };
        p = submitAnswer(lesson, p, answer); await save(p);
        if (session % 25 === 0 && index === 0) {
          const snapshot = repo.getReaction(); const restored = make(); assert.deepEqual(await restored.load(), p); assert.deepEqual(restored.getReaction(), snapshot); repo = restored; report.reloads++;
        }
        p = continueMission(lesson, p); await save(p); index++;
      }
      assert.equal(p.completedObjectives.length, 8); report.completed++;
    }
  }
  return report;
}
const result = await simulate(); assert.deepEqual(await simulate(), result);
writeFileSync('docs/LV-004B01_SIMULATION.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ ...result, distribution: `${Object.keys(result.distribution).length} IDs; see docs/LV-004B01_SIMULATION.json` }, null, 2));
