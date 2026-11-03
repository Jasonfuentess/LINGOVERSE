const {test}=require('node:test');
const assert=require('node:assert/strict');
const {cafeLesson}=require('../.test-build/content/cafe');
const {londonLesson,londonLessonV3}=require('../.test-build/content/london');
const {rendezvousLesson}=require('../.test-build/content/rendezvous');
const {beginMission,currentExercise,submitAnswer,continueMission,evaluateAnswer,restoreProgress}=require('../.test-build/domain/learning/engine');
test('LEARN02: rendez-vous confirmation has an accepted model before any failed attempt',()=>{
  const {learningRescue}=require('../.test-build/content/rescue');
  for(const v of rendezvousLesson.variants){
    const ex=v.exercises.find(e=>e.id==='confirm');
    const plan=learningRescue('fr','rendezvous',ex);
    assert.equal(plan.text,"Oui, j'ai rendez-vous ici.");
    assert.equal(evaluateAnswer(ex,plan.answer).correct,true);
    assert.ok(plan.meaning.includes('encuentro'));
    assert.ok(plan.segments.includes("j'ai rendez-vous"));
    assert.ok(plan.pronunciation.approximate.includes('zhé'));
  }
});
test('LEARN02: all three adventures and archived London have a safe, accepted rescue on every turn',()=>{
  const {learningRescue}=require('../.test-build/content/rescue');
  for(const [lesson,lang,adventure] of [[cafeLesson,'fr','cafe'],[londonLesson,'en','cafe'],[londonLessonV3,'en','cafe'],[rendezvousLesson,'fr','rendezvous']]){
    for(const variant of lesson.variants)for(const ex of variant.exercises){
      const plan=learningRescue(lang,adventure,ex);
      assert.ok(plan,ex.id);assert.equal(evaluateAnswer(ex,plan.answer).correct,true,ex.id);
      for(const model of plan.alternatives)assert.equal(evaluateAnswer(ex,model.answer).correct,true);
      if(ex.kind==='choice')assert.equal(plan.alternatives.length,ex.choices.filter(c=>c.correct).length,'no route discarded');
    }
  }
});
test('LEARN02: three modes preserve existing per-language preferences',()=>{
  const {pedagogicalMode,supportDefaults,decodeSupport}=require('../.test-build/domain/learning/support');
  const prefs=supportDefaults();
  assert.equal(pedagogicalMode(prefs.languages.fr),'starter');
  prefs.languages.en={...prefs.languages.en,stage:'a1',mode:'guided'};
  assert.equal(pedagogicalMode(decodeSupport(JSON.stringify(prefs)).languages.en),'a1');
  assert.equal(pedagogicalMode({...prefs.languages.en,mode:'independent'}),'autonomous');
  assert.equal(pedagogicalMode(prefs.languages.fr),'starter');
});
test('LEARN02: approximate pronunciation is curated, sourced and never accepted as original French',()=>{
  const {pronunciationFor,pronunciationGuides}=require('../.test-build/content/pronunciation');
  const guide=pronunciationFor("S'il vous plaît",'fr');
  assert.equal(guide.approximate,'sil vu plé');assert.ok(guide.sources.every(s=>s.startsWith('https://')));
  assert.ok(pronunciationGuides.length>=10);
  for(const g of pronunciationGuides){assert.ok(g.notes.length>0);assert.ok(g.translation);assert.ok(g.segments.includes(g.original)||g.segments.length>1);}
  const ex=rendezvousLesson.variants[0].exercises.find(e=>e.id==='confirm');
  const p=pronunciationFor(ex.accepted[0],'fr');
  assert.equal(evaluateAnswer(ex,{kind:'text',text:p.approximate}).correct,false);
  assert.equal(pronunciationFor('palabra inexistente','fr'),null,'no improvised transliteration');
  assert.equal(pronunciationFor('Bonjour','en'),null,'no cross-language guide');
});
test('LEARN02: assisted and independent objective evidence survives replay while old runs remain unspecified',async()=>{
  const {practiceEvidence}=require('../.test-build/domain/learning/evidence');
  let p=beginMission(cafeLesson);
  const first=currentExercise(cafeLesson,p), answer={kind:'choice',choiceId:first.choices.find(c=>c.correct).id};
  const legacy=continueMission(cafeLesson,submitAnswer(cafeLesson,p,answer));
  assert.equal(practiceEvidence(cafeLesson,legacy).unrecorded,1);
  p=continueMission(cafeLesson,submitAnswer(cafeLesson,p,answer,'assisted'));
  let ex=currentExercise(cafeLesson,p);
  p=continueMission(cafeLesson,submitAnswer(cafeLesson,p,{kind:'choice',choiceId:ex.choices.find(c=>c.correct).id},'independent'));
  assert.deepEqual(restoreProgress(cafeLesson,JSON.parse(JSON.stringify(p))),p);
  assert.equal(practiceEvidence(cafeLesson,p).assisted,1);
  assert.equal(practiceEvidence(cafeLesson,p).independent,1);
  assert.equal('mastered' in practiceEvidence(cafeLesson,p),false);
  const {MissionRepository}=require('../.test-build/storage/missionRepository');
  const data=new Map([['lingoverse.mission.fr-a1-paris-cafe.v1',JSON.stringify(beginMission(cafeLesson))]]);
  const storage={getItem:async k=>data.get(k)??null,setItem:async(k,v)=>data.set(k,v)};
  const repository=new MissionRepository(storage,cafeLesson);await repository.load();await repository.save(p);
  const loaded=await new MissionRepository(storage,cafeLesson).load();
  assert.deepEqual(loaded,p,'new evidence persists through the actual mission repository');
  assert.equal(practiceEvidence(cafeLesson,loaded).assisted,1);
  const corrupt=JSON.parse(JSON.stringify(p));corrupt.events[0].support='mastered';
  assert.throws(()=>restoreProgress(cafeLesson,corrupt));
});
test('LEARN02: uncertain written text creates no new confirmed error fact or roast context',()=>{
  const {historyForProgress}=require('../.test-build/domain/learning/variety');
  const {humorContext}=require('../.test-build/domain/humor/context');
  const {emptyHistory}=require('../.test-build/domain/variety/history');
  let p=beginMission(rendezvousLesson);
  p=continueMission(rendezvousLesson,submitAnswer(rendezvousLesson,p,{kind:'choice',choiceId:'greeting'}));
  const before=historyForProgress(rendezvousLesson,emptyHistory(),null,p,null);
  const next=submitAnswer(rendezvousLesson,p,{kind:'text',text:'texto que el navegador no entendió'});
  assert.equal(next.feedback.writtenIssue,'unknown');
  const history=historyForProgress(rendezvousLesson,before,p,next,null);
  assert.equal(history.errors.length,before.errors.length);
  assert.equal(humorContext(rendezvousLesson,next,history),null);
});

test('LEARN02: English adventure Roast reuses compatible regional reactions only after valid consent',async()=>{
  const {MissionRepository}=require('../.test-build/storage/missionRepository');
  const {humorDefaults,grantAdultConsent}=require('../.test-build/domain/humor/preferences');
  for(const locale of ['es-SV','es-MX','es-CO','es-AR']){
    for(const consent of [false,true]){
      const preferences={...(consent?grantAdultConsent(humorDefaults(),{adultConfirmed:true,explicitlyAgreed:true},1):humorDefaults()),adventureRoast:true};
      const data=new Map([['lingoverse.humor-preferences.v1',JSON.stringify(preferences)]]);
      const storage={getItem:async k=>data.get(k)??null,setItem:async(k,v)=>data.set(k,v)};
      const repo=new MissionRepository(storage,londonLesson);await repo.load();
      let p=await repo.start(()=>0.1,1);
      p=submitAnswer(londonLesson,p,{kind:'choice',choiceId:'goodbye-early'},'independent');
      await repo.save(p,2,{locale,preferences,random:()=>0.1});
      const reaction=repo.getReaction();
      if(consent){assert.equal(reaction.mode,'roast');assert.ok(reaction.learningLanguages.includes('en'));assert.ok(!/franc[eéè]|caf[eé]|ocho/i.test(reaction.text));}
      else assert.ok(!reaction||reaction.mode!=='roast');
    }
  }
});
