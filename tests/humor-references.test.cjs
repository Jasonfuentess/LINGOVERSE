const { test } = require('node:test');
const assert = require('node:assert/strict');
const { humorReferences, referenceReactions } = require('../.test-build/content/humorReferences.js');
const { detectReference, restoreReference } = require('../.test-build/domain/humor/references.js');
const { roastLibrary } = require('../.test-build/content/roastHumor.js');
const { selectReaction, restoreReaction } = require('../.test-build/domain/humor/engine.js');
const { humorDefaults, grantAdultConsent, disableAdult } = require('../.test-build/domain/humor/preferences.js');
const { emptyHistory } = require('../.test-build/domain/variety/history.js');
const { seededRandom } = require('../.test-build/domain/variety/selection.js');
const { roastLesson } = require('../.test-build/content/roast.js');
const { MissionRepository } = require('../.test-build/storage/missionRepository.js');
const { currentExercise, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine.js');
const contextFor = r => ({ learningLanguage: r.language, scopeId: r.scopeId, objectiveId: r.objectiveId, exerciseId: r.exerciseId, answerKind: 'text', category: 'error', result: 'incorrect', attempts: 1, wrongAttempts: 1, completed: 0, total: 8, interfaceLanguage: 'es', level: 'A1', eventKey: 'test:1' });
const prefs = () => grantAdultConsent(humorDefaults(), { adultConfirmed: true, explicitlyAgreed: true }, 1);

test('shared exact patterns work in French and English without partial or cross-context matches', () => {
  for (const r of humorReferences) {
    const context = contextFor(r); const input = r.patterns[0].exact;
    const evidence = detectReference(`  ${input.toUpperCase()} ! `, context);
    assert.equal(evidence.referenceId, r.id);
    for (const wrong of [`hola ${input}`, `${input} teléfono 555`, `${input}x`, input.replace(' ', '-')]) assert.equal(detectReference(wrong, context), null);
    for (const override of [{learningLanguage: r.language === 'fr' ? 'en' : 'fr'}, {scopeId:'elsewhere'}, {exerciseId:'other'}, {objectiveId:'other'}, {result:'correct'}, {answerKind:'choice'}, {category:'progress'}]) assert.equal(detectReference(input, {...context,...override}), null);
    assert.deepEqual(restoreReference(evidence, context), evidence);
    assert.equal(restoreReference(evidence, {...context,eventKey:'another'}), null);
  }
});
test('each shared reference has original regional alternatives selected by Variety Engine under consent', () => {
  for (const r of humorReferences) for (const locale of ['es-SV','es-MX','es-CO','es-AR']) {
    const context = {...contextFor(r),referenceId:r.id}; const ids = new Set();
    for (let seed=0; seed<30; seed++) {
      const chosen = selectReaction(context,locale,prefs(),emptyHistory(),seededRandom(seed),roastLibrary,'roast');
      assert.equal(chosen.referenceId,r.id); assert.equal(chosen.locale,locale); assert.equal(chosen.educational,true); ids.add(chosen.id);
      assert.deepEqual(restoreReaction(chosen,context,emptyHistory(),roastLibrary),chosen);
      assert.equal(restoreReaction(chosen,{...context,referenceId:undefined},emptyHistory(),roastLibrary),null);
    }
    assert.ok(ids.size > 1);
    assert.equal(selectReaction(context,locale,humorDefaults(),emptyHistory(),seededRandom(1),roastLibrary,'roast'),null);
    assert.equal(selectReaction(context,locale,disableAdult(prefs()),emptyHistory(),seededRandom(1),roastLibrary,'roast'),null);
  }
  assert.equal(new Set(referenceReactions.map(r=>r.id)).size,referenceReactions.length);
});
test('Missed patterns use normal fallback; known educational mistakes and correct answers cannot trigger memes', () => {
  const r=humorReferences[0]; const context=contextFor(r);
  const selected=selectReaction(context,'es-SV',prefs(),emptyHistory(),seededRandom(2),roastLibrary,'roast');
  assert.equal(selected.referenceId,undefined);
  assert.equal(detectReference('Merci beaucoup',context),null);
  assert.equal(detectReference('merci bocoup',context),null);
});
test('Messi Goku remains incorrect, persists only catalog evidence, resumes same reaction and clears on next answer', async () => {
  const values=new Map([['lingoverse.humor-preferences.v1',JSON.stringify(prefs())]]);
  const storage={getItem:async k=>values.get(k)??null,setItem:async(k,v)=>values.set(k,v)};
  const make=()=>new MissionRepository(storage,roastLesson,[],'roast');
  let repo=make(); await repo.load(); let p=await repo.start(seededRandom(1),100);
  while(p.nodeId!=='merci') {
    const e=currentExercise(roastLesson,p); p=submitAnswer(roastLesson,p,e.kind==='text'?{kind:'text',text:e.accepted[0]}:{kind:'choice',choiceId:e.choices.find(c=>c.correct).id}); await repo.save(p,101+p.events.length);
    p=continueMission(roastLesson,p); await repo.save(p,101+p.events.length);
  }
  p=submitAnswer(roastLesson,p,{kind:'text',text:'Messi Goku'});
  assert.equal(p.feedback.correct,false); assert.equal(p.events.at(-1).answer.text,'');
  await repo.save(p,150,{locale:'es-SV',preferences:prefs(),writtenInput:'Messi Goku'});
  const saved=repo.getReaction(); assert.equal(saved.referenceId,'reference-v1:messi-goku');
  const envelope=JSON.parse(values.get(`lingoverse.mission.${roastLesson.id}.v1`));
  assert.deepEqual(Object.keys(envelope.reference).sort(),['eventKey','patternId','referenceId','version']);
  repo=make(); assert.deepEqual(await repo.load(),p); assert.deepEqual(repo.getReaction(),saved);
  const unknown=submitAnswer(roastLesson,p,{kind:'text',text:'private phone 555'});
  await repo.save(unknown,151,{locale:'es-SV',preferences:prefs(),writtenInput:'private phone 555'});
  assert.equal(repo.getReaction().referenceId,undefined);
  assert.ok(!values.get(`lingoverse.mission.${roastLesson.id}.v1`).includes('private phone'));
  values.set('lingoverse.humor-preferences.v1',JSON.stringify(disableAdult(prefs())));
  await repo.load(); assert.equal(repo.getReaction(),null);
});
test('retired editorial lines restore but are never selected for new feedback', () => {
  const old=roastLibrary.find(r=>r.retired && r.category==='error');
  const context={...contextFor(humorReferences[0]),referenceId:undefined};
  const saved={...old,eventKey:context.eventKey};
  assert.deepEqual(restoreReaction(saved,context,emptyHistory(),roastLibrary),saved);
  for(let seed=0;seed<50;seed++) assert.ok(!selectReaction(context,old.locale,prefs(),emptyHistory(),seededRandom(seed),roastLibrary,'roast').retired);
});
