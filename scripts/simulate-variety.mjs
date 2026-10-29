import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const build = spawnSync(process.platform === 'win32' ? 'tsc.cmd' : 'tsc', ['-p', 'tsconfig.core.json'], { stdio: 'inherit', shell: process.platform === 'win32' });
if (build.status !== 0) process.exit(build.status ?? 1);
const require = createRequire(import.meta.url);
const { cafeLesson, cafeLessonV1 } = require('../.test-build/content/cafe.js');
const { conversationFingerprint } = require('../.test-build/domain/learning/conversation.js');
const { seededRandom, selectContent } = require('../.test-build/domain/variety/selection.js');
const { emptyHistory, nextSession, noteAppearance } = require('../.test-build/domain/variety/history.js');
const { lessonCandidates, lessonContext } = require('../.test-build/domain/learning/variety.js');
const { currentExercise, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine.js');
const { MissionRepository } = require('../.test-build/storage/missionRepository.js');

const sessions = 1000;
const seed = 903;
async function simulate() {
  const data = new Map();
  const storage = { getItem: async key => data.get(key) ?? null, setItem: async (key, value) => { data.set(key, value); } };
  let repository = new MissionRepository(storage, cafeLesson);
  await repository.load();
  const random = seededRandom(seed);
  const counts = Object.fromEntries(cafeLesson.variants.map(item => [item.id, 0]));
  let previous = null;
  let consecutive = 0;
  let streak = 0;
  let maxStreak = 0;
  let firstFullCoverage = null;
  const profileCounts = {};
  const visibleQuestionProfiles = new Set();
  let previousProfile = null;
  let previousQuestions = null;
  let profileRepeats = 0;
  let questionRepeats = 0;
  for (let session = 1; session <= sessions; session++) {
    let progress = await repository.start(random, session * 1000);
    counts[progress.variantId]++;
    const profile = conversationFingerprint(cafeLesson.variants.find(item => item.id === progress.variantId));
    profileCounts[profile] = (profileCounts[profile] ?? 0) + 1;
    if (profile === previousProfile) profileRepeats++;
    previousProfile = profile;
    const questions = [];
    if (progress.variantId === previous) { consecutive++; streak++; } else streak = 1;
    maxStreak = Math.max(maxStreak, streak);
    previous = progress.variantId;
    if (firstFullCoverage === null && Object.values(counts).every(value => value > 0)) firstFullCoverage = session;
    while (progress.status !== 'completed') {
      const exercise = currentExercise(cafeLesson, progress);
      questions.push(exercise.prompt);
      if (session % 10 === 0 && exercise.id === 'prix') progress = submitAnswer(cafeLesson, progress, { kind: 'text', text: 'Merci.' });
      const correct = exercise.kind === 'choice' ? exercise.choices.filter(item => item.correct) : [];
      const answer = exercise.kind === 'text' ? { kind: 'text', text: exercise.accepted[session % exercise.accepted.length] } : { kind: 'choice', choiceId: correct[session % correct.length].id };
      progress = continueMission(cafeLesson, submitAnswer(cafeLesson, progress, answer));
    }
    assert.equal(progress.completedObjectives.length, 8);
    const questionSignature = JSON.stringify(questions);
    if (questionSignature === previousQuestions) questionRepeats++;
    previousQuestions = questionSignature;
    visibleQuestionProfiles.add(questionSignature);
    await repository.save(progress, session * 1000 + 1);
    if (session % 25 === 0) { repository = new MissionRepository(storage, cafeLesson); assert.deepEqual(await repository.load(), progress); }
  }
  const baselineRandom = seededRandom(seed);
  let baselinePrevious = null;
  let baselineRepeats = 0;
  for (let session = 0; session < sessions; session++) {
    const index = Math.floor(baselineRandom() * cafeLesson.variants.length);
    if (index === baselinePrevious) baselineRepeats++;
    baselinePrevious = index;
  }
  let smallHistory = emptyHistory();
  const single = [lessonCandidates(cafeLesson)[0]];
  for (let session = 1; session <= sessions; session++) {
    smallHistory = nextSession(smallHistory);
    const ctx = lessonContext(cafeLesson, session);
    const choice = selectContent(single, ctx, smallHistory, () => 0);
    assert.equal(choice.candidateId, single[0].id);
    smallHistory = noteAppearance(smallHistory, choice.candidateId, ctx, session);
  }
  const history = repository.getHistory();
  assert.equal(history.errors.length, 1);
  assert.equal(history.errors[0].count, 100);
  assert.equal(history.errors[0].exerciseId, 'prix');
  assert.equal(history.session, sessions);
  assert.ok(firstFullCoverage !== null);
  assert.ok(consecutive < baselineRepeats);
  assert.equal(Object.keys(profileCounts).length, 6);
  assert.equal(visibleQuestionProfiles.size, 6);
  function sharedProfileControl(aware) {
    let history = emptyHistory();
    const rng = seededRandom(seed);
    const candidates = lessonCandidates(cafeLessonV1);
    const policyCandidates = aware ? candidates : candidates.map(({ profileId, ...candidate }) => candidate);
    let previous = null;
    let repeats = 0;
    for (let session = 1; session <= sessions; session++) {
      history = nextSession(history);
      const context = lessonContext(cafeLessonV1, session);
      const decision = selectContent(policyCandidates, context, history, rng);
      const selected = candidates.find(item => item.id === decision.candidateId);
      if (selected.profileId === previous) repeats++;
      previous = selected.profileId;
      history = noteAppearance(history, selected.id, { ...context, profileId: selected.profileId }, session);
    }
    return repeats;
  }
  const sharedAware = sharedProfileControl(true);
  const sharedIdOnly = sharedProfileControl(false);
  assert.ok(sharedAware < sharedIdOnly);
  return { seed, sessions, contentVersion: cafeLesson.version, completedMissions: sessions, interactionsPerMission: 8, distribution: counts,
    profileByVariant: Object.fromEntries(cafeLesson.variants.map(variant => [variant.id, conversationFingerprint(variant)])),
    profileDistribution: profileCounts, uniqueVisibleFrenchQuestionSequences: visibleQuestionProfiles.size,
    consecutiveProfileRepeats: profileRepeats, consecutiveVisibleFrenchQuestionRepeats: questionRepeats,
    sharedProfileControl: { sessions, ids: 6, profiles: 2, profileAwareRepeats: sharedAware, idOnlyRepeats: sharedIdOnly },
    consecutiveRepeats: consecutive, consecutiveRepeatRate: consecutive / (sessions - 1), longestRunOfSameVariant: maxStreak,
    uniformBaselineRepeats: baselineRepeats, firstSessionWithAllVariantsUsed: firstFullCoverage,
    singleCandidateSessions: sessions, singleCandidateRepeats: sessions - 1,
    emptyLibraryDecision: selectContent([], lessonContext(cafeLesson, 1), emptyHistory(), () => 0).reason,
    retained: { entries: history.entries.length, recent: history.recent.length, errorFacts: history.errors.length, detectedPriceErrors: history.errors[0].count },
    storedCharacters: [...data.values()][0].length,
  };
}
const report = await simulate();
assert.deepEqual(await simulate(), report, 'Simulation must reproduce exactly with the same seed');
writeFileSync('docs/LV-003B_SIMULATION.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
