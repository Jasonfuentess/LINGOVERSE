const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { rendezvousLesson, rendezvousLessonForProgress } = require('../.test-build/content/rendezvous');
const { cafeLesson, cafeLessonV1 } = require('../.test-build/content/cafe');
const { londonLesson, londonLessonV1, londonLessonV2 } = require('../.test-build/content/london');
const { validateLesson } = require('../.test-build/domain/learning/validation');
const { beginMission, currentExercise, submitAnswer, continueMission, restoreProgress, evaluateAnswer } = require('../.test-build/domain/learning/engine');
const { conversationPresentation, latestConversationBeat } = require('../.test-build/domain/conversation/presentation');
const { MissionRepository } = require('../.test-build/storage/missionRepository');
const { selectVoice } = require('../.test-build/domain/voice/playback');
const text = value => ({ kind: 'text', text: value });
const correct = (e, route='a') => e.kind === 'text' ? text(e.accepted[0]) : {kind:'choice', choiceId:e.id==='route' ? `route-${route}` : e.choices.find(c=>c.correct).id};
const byId = (v, id) => { const e = v.exercises.find(e=>e.id===id); assert.ok(e,`${v.id}: ${id} missing`); return e; };

test('LV-006B: validated A1 adventure has independent ID/version, two variants and ten objectives', () => {
  assert.equal(validateLesson(rendezvousLesson), rendezvousLesson);
  assert.equal(rendezvousLesson.id,'fr-a1-paris-rendezvous');
  // LV-007B: new runs use contextual v2; v1 stays archived and resumable.
  assert.equal(rendezvousLesson.version,2);
  assert.equal(require('../.test-build/content/rendezvous').rendezvousLessonV1.version,1);
  assert.equal(rendezvousLessonForProgress(null), rendezvousLesson);
  assert.equal(rendezvousLessonForProgress(beginMission(rendezvousLesson)), rendezvousLesson);
  assert.throws(() => rendezvousLessonForProgress(beginMission(cafeLesson)), /Versión/);
  assert.equal(rendezvousLesson.language,'fr');
  assert.equal(rendezvousLesson.objectives.length,10);
  assert.deepEqual(rendezvousLesson.variants.map(x=>x.id), ['jardin-bleu','quai-des-cartes']);
  for (const other of [cafeLesson,cafeLessonV1,londonLesson,londonLessonV1,londonLessonV2]) {
    validateLesson(other);
    assert.notEqual(other.id,rendezvousLesson.id);
  }
});

test('LV-006B: every selected narrative and route reaches all objectives with distinct people and decisions', () => {
  const endings = [];
  for(const story of rendezvousLesson.variants) for(const route of ['a','b']) {
    let state=beginMission(rendezvousLesson,0,()=>story.id);
    let steps=0;
    let guide='';
    while(state.status==='active') {
      const exercise=currentExercise(rendezvousLesson,state);
      if(exercise.id===`clarify-${route}`) guide=exercise.speaker;
      const before=conversationPresentation(rendezvousLesson,state);
      assert.equal(before.history.length,steps);
      assert.equal(before.facts.length >= steps, true);
      if(steps === 0) assert.equal(latestConversationBeat(before.history),null);
      state=submitAnswer(rendezvousLesson,state,correct(exercise,route));
      assert.equal(state.feedback.correct,true,`${story.id}/${route}/${exercise.id}`);
      state=continueMission(rendezvousLesson,state);
      steps++;
      assert.equal(conversationPresentation(rendezvousLesson,state).history.length,steps);
      assert.deepEqual(restoreProgress(rendezvousLesson,JSON.parse(JSON.stringify(state))),state);
      assert.ok(steps<=10);
    }
    assert.equal(steps,10);
    assert.deepEqual(state.completedObjectives,rendezvousLesson.objectives);
    assert.equal(conversationPresentation(rendezvousLesson,state).facts.at(-1).type,'mission-completed');
    endings.push({story:story.id, route, guide});
  }
  assert.equal(new Set(endings.map(v=>v.guide)).size,4,'each route meets a distinct guide');
});

test('LV-006B: branch-only dialogue stays inaccessible until that branch is chosen and completed', () => {
  for(const story of rendezvousLesson.variants) {
    let progress=beginMission(rendezvousLesson,1,()=>story.id);
    while(progress.nodeId!=='route') {
      const e=currentExercise(rendezvousLesson,progress);
      progress=continueMission(rendezvousLesson,submitAnswer(rendezvousLesson,progress,correct(e)));
    }
    for(const route of ['a','b']) {
      const branch=continueMission(rendezvousLesson,submitAnswer(rendezvousLesson,progress,{kind:'choice',choiceId:`route-${route}`}));
      assert.equal(branch.nodeId,`clarify-${route}`);
      const other=route==='a'?'b':'a';
      assert.equal(JSON.stringify(conversationPresentation(rendezvousLesson,branch)).includes(byId(story,`clarify-${other}`).prompt),false);
      assert.equal(JSON.stringify(conversationPresentation(rendezvousLesson,branch)).includes(byId(story,`follow-${other}`).prompt),false);
      assert.notEqual(byId(story,`clarify-${route}`).speaker,byId(story,`clarify-${other}`).speaker);
      assert.notEqual(byId(story,`follow-${route}`).prompt,byId(story,`follow-${other}`).prompt);
    }
  }
});

test('LV-006B: appointment answers accept semantically reviewed alternatives and trivial punctuation', () => {
  for (const story of rendezvousLesson.variants) {
    const e=byId(story,'confirm');
    for(const answer of ["Oui, j'ai rendez-vous ici.", "OUI , j’ai rendez-vous ici!", "J'ai rendez-vous ici.", "Oui, j'ai rendez-vous.", "Oui, je cherche une amie.","Oui, je cherche un ami."]) {
      const result=evaluateAnswer(e,text(answer));
      assert.equal(result.correct, answer.includes('cherche') ? answer.includes(story.id==='jardin-bleu'?'une amie':'un ami') : true, `${story.id}: ${answer}`);
    }
    assert.equal(evaluateAnswer(e,text("Non, je n'ai pas rendez-vous.")).correct,false);
    assert.equal(evaluateAnswer(e,text('Je rendez-vous ici.')).writtenIssue,'structure');
  }
});

test('LV-006B: every guided written turn has multiple verified alternatives; unknown is not diagnosed as bad grammar', () => {
  for(const v of rendezvousLesson.variants) for(const e of v.exercises) if(e.kind==='text') {
    assert.ok(e.accepted.length>=2);
    for(const sample of e.accepted) assert.equal(evaluateAnswer(e,text(sample)).correct,true,`${v.id}: ${e.id} ${sample}`);
    const other=evaluateAnswer(e,text('Le monde est beau et mystérieux.'));
    assert.equal(other.correct,false);
    assert.equal(other.writtenIssue,'unknown');
    assert.match(other.explanation,/No significa|No puedo/);
    assert.ok(other.spokenExplanation);
    assert.equal(other.next,null);
  }
});

test('LV-006B: important wrong directions and unrelated destinations remain incorrect', () => {
  for(const v of rendezvousLesson.variants){
    assert.equal(evaluateAnswer(byId(v,'identify'),{kind:'choice',choiceId:'wrong-place'}).correct,false);
    assert.equal(evaluateAnswer(byId(v,'distance'),{kind:'choice',choiceId:'far'}).correct,false);
    assert.equal(evaluateAnswer(byId(v,'ask'),text('Où est la gare ?')).correct,false);
    for(const route of ['a','b']) {
      const e=byId(v,`follow-${route}`);
      assert.equal(evaluateAnswer(e,{kind:'choice',choiceId:`wrong-${route}`}).correct,false);
      assert.equal(evaluateAnswer(byId(v,`plan-${route}`),{kind:'choice',choiceId:`goodbye-${route}`}).correct,false);
    }
  }
});

test('LV-006B: contextual correction is grammatical only for known rule, not arbitrary text', () => {
  const e=byId(rendezvousLesson.variants[0],'confirm');
  const wrong=evaluateAnswer(e,text('Je rendez-vous ici.'));
  assert.equal(wrong.correct,false);
  assert.equal(wrong.writtenIssue,'structure');
  assert.match(wrong.explanation,/avoir|j.ai rendez-vous/i);
  const unseen=evaluateAnswer(e,text('Un autre rendez-vous ce soir ?'));
  assert.equal(unseen.writtenIssue,'unknown');
  assert.notEqual(unseen.explanation,wrong.explanation);
});

test('LV-006B: storage keys for café, London and meeting are distinct and do not overwrite each other', async () => {
  const saved=new Map(); const storage={getItem:async key=>saved.get(key)??null,setItem:async(key,value)=>{saved.set(key,value)}};
  const cafeRepo=new MissionRepository(storage,cafeLesson,[cafeLessonV1]);
  const londonRepo=new MissionRepository(storage,londonLesson,[londonLessonV1,londonLessonV2]);
  const rendezvousRepo=new MissionRepository(storage,rendezvousLesson);
  for(const r of [cafeRepo,londonRepo,rendezvousRepo]) await r.load();
  const cafe=await cafeRepo.start(()=>0.01,1);
  const english=await londonRepo.start(()=>0.01,2);
  const meeting=await rendezvousRepo.start(()=>0.01,3);
  assert.equal(saved.size,3);
  assert.deepEqual([...saved.keys()].sort(), [
    'lingoverse.mission.en-a1-london-lost.v1',
    'lingoverse.mission.fr-a1-paris-cafe.v1',
    'lingoverse.mission.fr-a1-paris-rendezvous.v1'
  ]);
  assert.deepEqual(await new MissionRepository(storage,rendezvousLesson).load(),meeting);
  assert.deepEqual(await new MissionRepository(storage,cafeLesson,[cafeLessonV1]).load(),cafe);
  assert.deepEqual(await new MissionRepository(storage,londonLesson,[londonLessonV1,londonLessonV2]).load(),english);
});

test('LV-006B: retry, reloading and branch progress restore without saved wrong private drafts', async () => {
  const saved=new Map(); const storage={getItem:async k=>saved.get(k)??null,setItem:async(k,v)=>saved.set(k,v)};
  const repo=new MissionRepository(storage,rendezvousLesson);
  await repo.load();
  let state=await repo.start(()=>0.01);
  const initial=currentExercise(rendezvousLesson,state);
  state=submitAnswer(rendezvousLesson,state,{kind:'choice',choiceId:'silence'});
  assert.equal(state.feedback.correct,false);
  await repo.save(state);
  state=submitAnswer(rendezvousLesson,state,correct(initial));
  await repo.save(state);
  state=continueMission(rendezvousLesson,state);
  await repo.save(state);
  const e=currentExercise(rendezvousLesson,state);
  state=submitAnswer(rendezvousLesson,state,text('private-unknown-email@example.com'));
  assert.equal(state.feedback.correct,false);
  assert.equal(JSON.stringify(state).includes('private-unknown-email'),false);
  await repo.save(state);
  assert.deepEqual(await new MissionRepository(storage,rendezvousLesson).load(),state);
  state=submitAnswer(rendezvousLesson,state,correct(e));
  await repo.save(state);
  assert.equal(state.feedback.correct,true);
  assert.equal(conversationPresentation(rendezvousLesson,state).history.length,1);
  assert.deepEqual(restoreProgress(rendezvousLesson,JSON.parse(JSON.stringify(state))),state);
});

test('LV-006B: locale routing and fallback keep correct language families', () => {
  const available=[
    {identifier:'paris',language:'fr-FR',name:'Français',local:true},
    {identifier:'london',language:'en-GB',name:'English UK',local:true},
    {identifier:'latam',language:'es-MX',name:'Español',local:true},
  ];
  assert.equal(selectVoice(available,'fr-FR').voice.identifier,'paris');
  assert.equal(selectVoice(available,'en-GB').voice.identifier,'london');
  assert.equal(selectVoice(available,'es-SV').voice.identifier,'latam');
  assert.equal(selectVoice([available[1],available[2]],'fr-FR'),null,'English must never read a French NPC');
  const screen=fs.readFileSync('src/features/learning/MissionScreen.tsx','utf8');
  const view=fs.readFileSync('src/features/learning/ExerciseView.tsx','utf8');
  assert.match(screen,/<VoiceToolbar language=\{english \? 'en-GB' : 'fr-FR'\}/);
  assert.match(view,/<SpeechInput key=\{`\$\{language\}:\$\{exercise\.id\}`\} language=\{voiceLanguage\}/);
  assert.match(view,/<AnswerTextInput/,'writing stays available for speech fallback');
  assert.match(view,/language=\{voiceLanguage\}/,'examples and character lines request the adventure locale');
});

test('LV-006B: French existing content not altered; new chapters have their own entrypoint and visual theme', () => {
  const routes=fs.readFileSync('app/_layout.tsx','utf8');
  const screen=fs.readFileSync('src/features/learning/MissionScreen.tsx','utf8');
  const art=fs.readFileSync('src/components/AdventureArt.tsx','utf8');
  const entry=fs.readFileSync('app/rendezvous.tsx','utf8');
  const explore=fs.readFileSync('app/explore.tsx','utf8');
  assert.match(routes,/MissionProvider adventure="rendezvous"/);
  assert.match(entry,/adventure="rendezvous"/);
  assert.match(screen,/rendezvousLessonForProgress/);
  assert.match(explore,/RendezvousMissionCard/);
  assert.match(art,/RendezvousArtwork/);
  assert.match(art,/riverside/);
  assert.equal(cafeLesson.id,'fr-a1-paris-cafe');
  assert.equal(londonLesson.version,5);
});
