const {test} = require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {rendezvousLesson}=require('../.test-build/content/rendezvous');
const requests=[];const inputs=[];const contexts=[];
function host(tag){return function Native({children,label,message,...props}) {return React.createElement(tag,{'data-disabled':props.disabled||undefined},children??label??message)}};
function load(relative) {
  const filename=path.resolve(relative);
  const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText;
  const module={exports:{}};
  const customRequire=id=>{
    if(id.endsWith('SpeechInput')) return {SpeechInput:props=>{inputs.push(props);return null;}};
    if(id.endsWith('VoiceControls')) return {SpeechButton:props=>{requests.push(props);return null;},CoachSpeech:props=>{requests.push({...props,language:'coach'});return null;}};
    if(id.endsWith('AdventureArt')) return {CharacterPortrait:host('figure')};
    if(id==='react-native') return {View:host('section'),Text:host('span'),Pressable:host('button'),TextInput:host('textarea'),StyleSheet:{create:x=>x}};
    if(id.endsWith('components/ui')) return Object.fromEntries(['Button','Card','Choice','Copy','Heading','Notice'].map(name=>[name,host(name==='Button'?'button':'div')]));
    if(id.endsWith('MissionProvider'))return{useMission:(language,adventure)=>{contexts.push([language,adventure]);return{reaction:null,mode:'friendly'}}};
    if(id.endsWith('PreferencesProvider')&&!id.includes('Humor'))return{usePreferences:()=>({preferences:{coachLocale:'es-MX'}})};
    if(id.endsWith('HumorPreferencesProvider'))return{useHumorPreferences:()=>({settings:{enabled:false},loading:false})};
    if(id.startsWith('.')){const target=path.resolve(path.dirname(filename),id);return load(fs.existsSync(`${target}.tsx`)?`${target}.tsx`:`${target}.ts`)}
    return require(id);
  };
  vm.runInNewContext(output,{require:customRequire,module,exports:module.exports},{filename});
  return module.exports;
}
const {ExerciseView}=load('src/features/learning/ExerciseView.tsx');
const {ChapterReview}=load('src/features/learning/ChapterReview.tsx');
const sample=rendezvousLesson.variants[0].exercises.find(e=>e.kind==='text');
function render(props={}){requests.length=0;inputs.length=0;contexts.length=0;return renderToStaticMarkup(React.createElement(ExerciseView,{exercise:sample,feedback:null,saving:false,error:null,onAnswer:async()=>true,onContinue:async()=>true,conversational:true,language:'fr',adventure:'rendezvous',...props}));}
test('LV-006B UI: real exercise view requests French for NPC and microphone, has written fallback and contextual coach',()=>{
  const html=render();
  assert.ok(html.includes('Necesito una pista'));
  assert.ok(!html.includes(sample.promptTranslation),'listening text is not spoiled before attempting');
  assert.ok(requests.some(req=>req.language==='fr-FR' && req.text===sample.prompt));
  assert.equal(inputs.at(-1).language,'fr-FR');
  assert.ok(html.includes('textarea'));
  assert.ok(contexts.some(([language,adventure])=>language==='fr'&&adventure==='rendezvous'));
});
test('LV-006B UI: verified French model is spoken as French and coach stays in Spanish locale',()=>{
  const result={correct:true,explanation:'Respuesta válida.',spokenExplanation:'La respuesta es válida.',correction:sample.correction,reply:sample.reply,next:sample.next};
  const html=render({feedback:result,submittedAnswer:{kind:'text',text:sample.accepted[0]}});
  assert.ok(html.includes('respuesta verificada'));
  assert.ok(requests.some(req=>req.language==='fr-FR' && req.text===sample.accepted[0]));
  assert.ok(requests.every(req=>req.language!=='en-GB'));
  assert.ok(contexts.some(([,adventure])=>adventure==='rendezvous'));
});
test('LV-006B UI: chapter review describes encounter objectives, never café order or price',()=>{
  const turns=['greet','confirm','identify','ask','distance','route','clarify-a','follow-a','meet-a','plan-a'].map(id=>({id:`fr-a1-paris-rendezvous:1:0:${id}`,messages:[{role:'student',text:'Bonjour !'}],feedback:{explanation:`${id} explicado`}}));
  const html=renderToStaticMarkup(React.createElement(ChapterReview,{language:'fr',adventure:'rendezvous',turns}));
  for(const label of ['ENCUENTRO COMPLETADO','Confirmar el encuentro','Interpretar indicaciones','Proponer una actividad']) assert.ok(html.includes(label),label);
  assert.ok(!html.includes('Te llevás más que un café'));
  assert.ok(!html.includes('Pedir una bebida'));
});
