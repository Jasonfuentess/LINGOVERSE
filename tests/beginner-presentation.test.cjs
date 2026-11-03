const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { cafeLesson } = require('../.test-build/content/cafe');
const { beginnerPhrase } = require('../.test-build/content/beginner');
let controls = [], speech = [], audio = [], effects = [];
function host(tag) { return function Native(props) { controls.push(props); return React.createElement(tag, { 'data-role': props.accessibilityRole, 'data-disabled': props.disabled || undefined }, props.children ?? props.label ?? props.message); }; }
function load(relative) {
  const filename = path.resolve(relative), module = { exports: {} };
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
  const localRequire = id => {
    if(id==='react')return{...React,useEffect:effect=>effects.push(effect)};
    if (id === 'react-native') return { View: host('section'), Text: host('span'), Pressable: host('button'), StyleSheet: { create: x => x } };
    if (id.endsWith('components/ui')) return Object.fromEntries(['Button','Card','Choice','Copy','Heading','Notice'].map(n => [n,host(n === 'Button' ? 'button' : 'div')]));
    if (id.endsWith('KeyboardScroll')) return { AnswerTextInput: host('textarea'), KeyboardAnswerGroup: host('section') };
    if (id.endsWith('VoiceControls')) return { SpeechButton: p => { audio.push(p); return null; }, StudyAudio: p => { audio.push(p); return null; } };
    if (id.endsWith('SpeechInput')) return { SpeechInput: p => { speech.push(p); return null; } };
    if (id.endsWith('CoachReaction')) return { CoachReaction: () => null };
    if (id.endsWith('AdventureArt')) return { CharacterPortrait: host('figure'), SceneArtwork: host('figure') };
    if (id.startsWith('.')) { const target = path.resolve(path.dirname(filename), id); return load(fs.existsSync(target+'.tsx') ? target+'.tsx' : target+'.ts'); }
    return require(id);
  };
  vm.runInNewContext(output, { require: localRequire, module, exports: module.exports }, { filename });
  return module.exports;
}
const { ExerciseView } = load('src/features/learning/ExerciseView.tsx');
const { BeginnerPreparation } = load('src/features/learning/BeginnerPreparation.tsx');
const exercise = cafeLesson.variants[0].exercises[0];
const phrase = beginnerPhrase('fr','cafe',exercise);
function render(step, extras = {}) {
  controls = []; speech = []; audio = [];
  return renderToStaticMarkup(React.createElement(ExerciseView, { exercise, feedback: null, saving: false, error: null, conversational: true, language: 'fr', onAnswer: async () => true, onContinue: async () => true, preparation: { phrase, step, saving: false, onStep() {} }, ...extras }));
}

test('LEARN UI: guided beginner hears a model before answer controls; independent mode remains unchanged', () => {
  const first = render('listen');
  assert.ok(first.includes('ESCUCHÁ EL MODELO'));
  assert.ok(!first.includes('Comprobar respuesta'));
  assert.equal(speech.length, 0, 'no pressure to speak before preparation');
  assert.ok(audio.some(a => a.text === 'Bonjour !' && a.language === 'fr-FR'));
  const ready = render('respond');
  assert.ok(ready.includes('Responder al personaje'));
  assert.equal(speech.length, 1);
  const independent = render('listen', { preparation: undefined });
  assert.ok(independent.includes('Comprobar respuesta'));
});

test('LEARN UI: each preparation phase advances only by explicit choice and transfer remains optional', () => {
  const changed = [];
  for (const [step, next] of [['listen','meaning'],['meaning','parts'],['parts','rehearse'],['rehearse','respond']]) {
    controls=[];
    renderToStaticMarkup(React.createElement(BeginnerPreparation, { phrase, step, language:'fr-FR', saving:false, answered:false, onStep:s=>changed.push(s) }));
    assert.equal(changed.length, ['listen','meaning','parts','rehearse'].indexOf(step), 'render alone does not advance');
    controls.find(c=>c.label && c.onPress).onPress();
    assert.equal(changed.at(-1),next);
  }
  const transfer=render('respond',{feedback:{correct:true,explanation:'Bien',correction:'Bonjour !',reply:'',next:'commande'}});
  assert.ok(transfer.includes('Entrás de día a otra tienda'));
  assert.ok(transfer.includes('Continuar conversación'), 'transfer does not block story');
  const completed=render('done',{feedback:{correct:true,explanation:'Bien',correction:'Bonjour !',reply:'',next:'commande'}});
  assert.ok(completed.includes('El mismo saludo sirve'), 'successful transfer explanation remains readable');
});

test('LEARN UI: reviewing uncertain or wrong transcript cannot itself submit an educational answer', () => {
  const submitted=[];
  render('respond',{onAnswer:async a=>{submitted.push(a);return true;}});
  assert.equal(speech.length,1);
  assert.equal(speech[0].inspect('Merci !',{confidence:0.9,language:'fr-FR'}).kind,'incorrect');
  assert.equal(speech[0].inspect('Bonjour',{confidence:0.1,language:'fr-FR'}).kind,'uncertain');
  assert.equal(speech[0].onUse('Bonjour !'),true);
  assert.equal(submitted.length,0,'even confirmed transcript only prepares a draft');
});

test('LEARN02 UI: rendez-vous teaches meaning, original model and approximate pronunciation before a first answer',()=>{
  const {rendezvousLesson}=require('../.test-build/content/rendezvous');
  const {learningRescue}=require('../.test-build/content/rescue');
  const ex=rendezvousLesson.variants[0].exercises.find(e=>e.id==='confirm');
  const html=render('respond',{exercise:ex,preparation:undefined,rescue:{plan:learningRescue('fr','rendezvous',ex),mode:'starter'}});
  assert.ok(html.includes('¿Tenés una cita/encuentro aquí?'));
  assert.ok(html.includes('ui, zhé rãdevú isí'));
  assert.ok(html.includes('Preparar esta respuesta con ayuda'));
  assert.ok(html.includes('Pronunciación aproximada'));
  assert.ok(audio.some(a=>a.text==="Oui, j'ai rendez-vous ici."&&a.language==='fr-FR'));
  assert.ok(audio.every(a=>!a.text?.includes('zhé')),'approximate Spanish is never spoken by TTS');
});
test('LEARN02 UI: A1 and autonomous preserve first attempt without revealing model',()=>{
  const {learningRescue}=require('../.test-build/content/rescue');
  const plan=learningRescue('fr','cafe',exercise);
  for(const mode of ['a1','autonomous']){
    const html=render('respond',{preparation:undefined,rescue:{plan,mode}});
    assert.ok(!html.includes('bõzhúr'));
    assert.ok(html.includes('Aprender cómo responder'));
    assert.ok(html.includes('Responder al personaje'));
  }
});
test('LEARN02 UI: guided recovery prepares a canonical response without submitting automatically',()=>{
  const {LearningRescue}=load('src/features/learning/LearningRescue.tsx');
  const {rendezvousLesson}=require('../.test-build/content/rendezvous');
  const {learningRescue}=require('../.test-build/content/rescue');
  const ex=rendezvousLesson.variants[0].exercises.find(e=>e.id==='confirm'),used=[];
  controls=[];audio=[];
  renderToStaticMarkup(React.createElement(LearningRescue,{plan:learningRescue('fr','rendezvous',ex),mode:'starter',language:'fr-FR',disabled:false,onUse:a=>used.push(a),onHelp(){}}));
  assert.equal(used.length,0);
  controls.find(c=>c.label==='Preparar esta respuesta con ayuda').onPress();
  assert.equal(used.length,1);
  assert.equal(used[0].kind,'text');assert.equal(used[0].text,"Oui, j'ai rendez-vous ici.");
  const asking=rendezvousLesson.variants[0].exercises.find(e=>e.id==='ask');
  const preferred=learningRescue('fr','rendezvous',asking);controls=[];
  renderToStaticMarkup(React.createElement(LearningRescue,{plan:preferred,mode:'starter',language:'fr-FR',disabled:false,onUse:a=>used.push(a),onHelp(){}}));
  controls.find(c=>c.label==='Preparar esta respuesta con ayuda').onPress();
  assert.equal(used.at(-1).text,preferred.text,'display and prepare the actual preferred model');
});
test('LEARN02 UI: switching from autonomous to A1 records help exposure even after returning to autonomy',()=>{
  const {LearningRescue}=load('src/features/learning/LearningRescue.tsx');
  const {learningRescue}=require('../.test-build/content/rescue');
  let helped=false;
  const plan=learningRescue('fr','cafe',exercise);
  for(const mode of ['autonomous','a1','autonomous']){
    effects=[];
    renderToStaticMarkup(React.createElement(LearningRescue,{plan,mode,language:'fr-FR',disabled:false,onUse(){},onHelp:()=>{helped=true;}}));
    effects.forEach(effect=>effect());
    if(mode==='a1')assert.equal(helped,true,'A1 guidance cannot later be claimed independent');
  }
  assert.equal(helped,true);
});
