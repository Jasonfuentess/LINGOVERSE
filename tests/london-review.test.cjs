const { test } = require('node:test');
const assert = require('node:assert/strict');
const { londonLesson, londonLessonV1, londonLessonV2, londonLessonV3, londonLessonForProgress } = require('../.test-build/content/london');
const { cafeLesson, cafeLessonV1 } = require('../.test-build/content/cafe');
const { validateLesson } = require('../.test-build/domain/learning/validation');
const { beginMission, currentExercise, submitAnswer, continueMission, evaluateAnswer, restoreProgress } = require('../.test-build/domain/learning/engine');
const { conversationPresentation } = require('../.test-build/domain/conversation/presentation');
const { MissionRepository } = require('../.test-build/storage/missionRepository');
const { selectVoice } = require('../.test-build/domain/voice/playback');
const { normalizeWritten } = require('../.test-build/domain/learning/written');
const textAnswer = text => ({kind:'text', text});
const byId = (variant, id) => variant.exercises.find(e => e.id === id);
const all = londonLesson.variants;

test('REV-01: direct need and courteous requests are valid in both story variants, with meaningful feedback', () => {
  for (const story of all) {
    const help = byId(story, 'help');
    assert.equal(help.prompt, 'What do you need?');
    for (const input of ['i need help', 'I need help.', 'I need help, please.', 'Yes, I need help.', 'Could you help me, please?', 'I need directions.', 'Yes, please.']) {
      const response = evaluateAnswer(help, textAnswer(input));
      assert.equal(response.correct, true, `${story.id}: ${input}`);
      assert.equal(response.next, 'where');
      assert.ok(response.reply.length > 0);
    }
    assert.match(evaluateAnswer(help, textAnswer('I need help')).explanation, /v[aá]lid[ao]|correcto|correcta/i);
    assert.match(evaluateAnswer(help, textAnswer('I need help')).explanation, /please/);
  }
});

test('REV-01: yes, I am new here is accepted despite capitalization, apostrophe variants, spaces and commas', () => {
  for (const story of all) {
    const intro = byId(story, 'introduce');
    for (const input of ["Yes, I'm new here.", "yes , I'm new here", "YES, I'M NEW HERE!", "yes, i’m new here", "Yes, I am new here.", "I'm new here.", 'Yes, I am.']) {
      assert.equal(evaluateAnswer(intro, textAnswer(input)).correct, true, `${story.id}: ${input}`);
    }
    assert.equal(normalizeWritten('yes , I’m new here'), normalizeWritten("Yes, I'm new here"));
  }
});

test('REV-01: contradictory replies and true grammar mistakes do not advance', () => {
  for (const story of all) {
    for (const [id, wrong, issue] of [
      ['introduce','No, I am not new here.','vocabulary'],
      ['introduce','I new here.','structure'],
      ['help',"I don't need help.",'vocabulary'],
      ['help','Can you helps me?','structure'],
      ['where','What is the theatre?','vocabulary'],
    ]) {
      if (id === 'where' && story.id === 'station-arrival') continue;
      const result = evaluateAnswer(byId(story,id),textAnswer(wrong));
      assert.equal(result.correct,false,`${story.id}: ${wrong}`);
      assert.equal(result.next,null);
      assert.equal(result.writtenIssue,issue);
      assert.ok(result.spokenExplanation && !/\b(?:where|what|please|can you|help me)\b/i.test(result.spokenExplanation), 'spoken diagnostic is in Spanish');
    }
  }
});

test('REV-01: unknown but possibly valid formulation is not falsely diagnosed as bad grammar', () => {
  const question = byId(all[1], 'help');
  const result = evaluateAnswer(question, textAnswer('Would you mind giving me a hand?'));
  assert.equal(result.correct, false);
  assert.equal(result.writtenIssue, 'unknown');
  assert.match(result.explanation, /No puedo|No significa|No es necesariamente/);
  assert.ok(result.spokenExplanation);
  assert.equal(result.next, null);
  let progress = beginMission(londonLesson, 0, () => all[1].id);
  progress = continueMission(londonLesson, submitAnswer(londonLesson, progress, {kind:'choice', choiceId:'hello'}));
  progress = continueMission(londonLesson, submitAnswer(londonLesson, progress, textAnswer("Yes, I'm new here.")));
  progress = submitAnswer(londonLesson, progress, textAnswer('Would you mind giving me a hand?'));
  assert.equal(JSON.stringify(progress).includes('Would you mind'), false, 'unknown draft is not persisted');
  assert.deepEqual(restoreProgress(londonLesson, JSON.parse(JSON.stringify(progress))), progress);
});

test('REV-01: every authored text objective includes verified alternatives and defensible Spanish spoken feedback', () => {
  validateLesson(londonLesson);
  for (const story of all) for (const exercise of story.exercises) {
    if (exercise.kind === 'text') {
      assert.ok(exercise.accepted.length >= 2);
      const success = evaluateAnswer(exercise, textAnswer(exercise.accepted[0]));
      assert.equal(success.correct, true);
      assert.ok(success.spokenExplanation, `${story.id}/${exercise.id} needs Spanish-only coaching`);
      assert.ok(exercise.unknownExplanation);
      assert.ok(exercise.unknownSpokenExplanation);
      for (const entry of exercise.acceptedFeedback || []) {
        assert.ok(exercise.accepted.some(x => normalizeWritten(x) === normalizeWritten(entry.input)));
        assert.equal(evaluateAnswer(exercise, textAnswer(entry.input)).explanation, entry.explanation);
      }
    } else {
      for (const option of exercise.choices) {
        const response = evaluateAnswer(exercise, {kind:'choice',choiceId:option.id});
        assert.ok(response.spokenExplanation, 'choice coaching needs Spanish-only spoken copy');
      }
    }
  }
});

test('REV-01: natural conversational order and routes do not transport guides to the destination', () => {
  for (const story of all) {
    assert.equal(byId(story, 'where').prompt, 'Where do you need to go?');
    assert.match(byId(story, 'where').teaching, /I need to go to/);
    assert.match(byId(story, 'help').teaching, /I need help/);
    for (const route of ['a','b']) {
      assert.match(byId(story, `thanks-${route}`).scene, /Antes de irte/);
      assert.match(byId(story, `bye-${route}`).scene, /Te despedís/);
      assert.equal(byId(story, `thanks-${route}`).prompt, 'Now you know the way!');
      assert.notEqual(byId(story, `confirm-${route}`).reply, 'Yes!');
    }
    for (const choice of byId(story,'choose-path').choices.filter(x=>x.correct)) {
      assert.ok(choice.next.startsWith('confirm-'));
    }
  }
  const market = byId(all.find(x=>x.id==='riverside-rain'), 'confirm-b');
  assert.equal(market.accepted.includes('Is it near here?'), false, 'irrelevant yes/no option was removed');
});

test('REV-01: archived v2 rejection stays authored; v1/v2 replay while v3/v4 accept same input', async () => {
  for (const lesson of [londonLessonV1,londonLessonV2,londonLessonV3,londonLesson,cafeLesson,cafeLessonV1]) validateLesson(lesson);
  assert.deepEqual([londonLessonV1.version,londonLessonV2.version,londonLessonV3.version,londonLesson.version], [1,2,3,4]);
  let old = beginMission(londonLessonV2, 0, () => 'riverside-rain');
  old = continueMission(londonLessonV2,submitAnswer(londonLessonV2,old,{kind:'choice',choiceId:'hello'}));
  old = continueMission(londonLessonV2,submitAnswer(londonLessonV2,old,textAnswer("I'm new here.")));
  old = submitAnswer(londonLessonV2,old,textAnswer('I need help'));
  assert.equal(old.feedback.correct,false,'v2 rejection is historical and unchanged');
  assert.equal(londonLessonForProgress(old),londonLessonV2);
  assert.deepEqual(restoreProgress(londonLessonV2,JSON.parse(JSON.stringify(old))),old);
  const saved = new Map([['lingoverse.mission.en-a1-london-lost.v1',JSON.stringify(old)]]);
  const storage = {getItem: async k=>saved.get(k)??null,setItem:async(k,v)=>saved.set(k,v)};
  const repo = new MissionRepository(storage,londonLesson,[londonLessonV1,londonLessonV2]);
  assert.deepEqual(await repo.load(),old);
  old = submitAnswer(londonLessonV2,old,textAnswer('Can you help me, please?'));
  await repo.save(old);
  assert.deepEqual(await new MissionRepository(storage,londonLesson,[londonLessonV1,londonLessonV2]).load(),old);
  const fresh = await repo.start(()=>0.18);
  assert.equal(fresh.contentVersion,4);
  assert.equal(evaluateAnswer(byId(londonLessonV3.variants[1],'help'),textAnswer('I need help')).correct,true);
  assert.equal(evaluateAnswer(byId(all[1],'help'),textAnswer('I need help')).correct,true);
});

test('REV-01: Spanish, French and British voice selection never cross language families', () => {
  const available = [
    {identifier:'fr',language:'fr-FR',name:'French',local:true},
    {identifier:'en-us',language:'en-US',name:'English US',local:true},
    {identifier:'en-gb',language:'en-GB',name:'English UK',local:true},
    {identifier:'es',language:'es-MX',name:'Spanish Mexico',local:true},
  ];
  assert.equal(selectVoice(available,'en-GB').voice.identifier,'en-gb');
  assert.equal(selectVoice(available,'fr-FR').voice.identifier,'fr');
  assert.equal(selectVoice(available,'es-SV').voice.identifier,'es');
  assert.equal(selectVoice([{...available[0]}, {...available[3]}],'en-GB'),null,'do not use French as English');
  assert.equal(selectVoice([{...available[0]}],'es-SV'),null,'do not use French as Spanish');
  assert.equal(selectVoice([{identifier:'online-en',language:'en-GB',name:'Online',local:false}],'en-GB'),null);
  assert.equal(selectVoice([{identifier:'online-en',language:'en-GB',name:'Online',local:false}],'en-GB',true).voice.identifier,'online-en');
});

test('REV-01: progress, language isolation and no leaks in either branch', () => {
  for (const story of all) for (const route of ['a','b']) {
    let state=beginMission(londonLesson,0,()=>story.id);
    while(state.status==='active') {
      const ex=currentExercise(londonLesson,state);
      const answer=ex.kind==='text' ? textAnswer(ex.accepted[0]) : {kind:'choice',choiceId: ex.id==='choose-path' ? `route-${route}` : ex.choices.find(c=>c.correct).id};
      const before=conversationPresentation(londonLesson,state);
      assert.equal(before.history.length,state.completedObjectives.length);
      state=submitAnswer(londonLesson,state,answer);
      assert.equal(state.feedback.correct,true);
      state=continueMission(londonLesson,state);
      assert.deepEqual(restoreProgress(londonLesson,JSON.parse(JSON.stringify(state))),state);
      assert.equal(conversationPresentation(londonLesson,state).history.length,state.completedObjectives.length);
    }
    assert.deepEqual(state.completedObjectives,londonLesson.objectives);
  }
  assert.deepEqual(restoreProgress(cafeLesson,beginMission(cafeLesson)),beginMission(cafeLesson));
});
