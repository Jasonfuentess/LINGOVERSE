const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { RecognitionController } = require('../.test-build/domain/voice/recognition');
const { inspectTranscript } = require('../.test-build/domain/voice/transcriptReview');
const { cafeLesson } = require('../.test-build/content/cafe');

// Host harness drives real component callbacks and real recognition controller.
// Hooks retain local state across explicit test renders; no browser/layout/audio claim.
function setup() {
  const slots=[], sessions=[], used=[];
  let cursor=0, controls=[];
  const hooks={...React, useEffect(){}, useSyncExternalStore(_subscribe,snapshot){return snapshot();}, useState(initial){
    const index=cursor++;
    if(!(index in slots)) slots[index]=typeof initial==='function'?initial():initial;
    return [slots[index],value=>{slots[index]=typeof value==='function'?value(slots[index]):value;}];
  }};
  const driver={available:()=>true,create(language,events){const session={language,events,start(){},stop(){},abort(){}};sessions.push(session);return session;}};
  const host=tag=>function Native(props){controls.push(props);return React.createElement(tag,{},props.children);};
  const filename=path.resolve('src/features/voice/SpeechInput.tsx'), module={exports:{}};
  const source=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText;
  const localRequire=id=>{
    if(id==='react')return hooks;
    if(id==='react-native')return{Platform:{OS:'web'},View:host('section'),Text:host('span'),Pressable:host('button'),StyleSheet:{create:x=>x}};
    if(id.endsWith('KeyboardScroll'))return{AnswerTextInput:host('textarea')};
    if(id.endsWith('/recognition'))return{RecognitionController};
    if(id.endsWith('recognitionDriver'))return{recognitionDriver:driver};
    if(id==='./service')return{voiceController:{stop:async()=>{}}};
    if(id.endsWith('theme/tokens'))return{tokens:{color:{teal:'#16655D',muted:'#4E6474',white:'#FFF',ink:'#142B3D',line:'#D4DFE5',error:'#932C2C',tint:'#E4F2EC'}}};
    return require(id);
  };
  vm.runInNewContext(source,{require:localRequire,module,exports:module.exports},{filename});
  const Component=module.exports.SpeechInput;
  const render=()=>{
    cursor=0;controls=[];
    return renderToStaticMarkup(React.createElement(Component,{language:'fr-FR',disabled:false,onUse:text=>{used.push(text);return true;},inspect:(text,evidence)=>inspectTranscript(cafeLesson.variants[0].exercises[0],text,'fr-FR',evidence)}));
  };
  const press=label=>{const button=controls.find(p=>p.onPress&&(p.accessibilityLabel===label||p.children?.props?.children===label));assert.ok(button,label);assert.ok(!button.disabled,label+' enabled');button.onPress();};
  return {render,press,sessions,used,input:()=>controls.find(p=>p.accessibilityLabel==='Transcripción editable'),dispose:()=>slots[0].dispose()};
}
test('LEARN microphone UI: uncertain/wrong recognition is editable and cannot submit until text is explicitly confirmed',()=>{
  const h=setup();h.render();assert.equal(h.sessions.length,0);
  h.press('Empezar a hablar en francés');
  h.sessions[0].events.result('Merci !','',{confidence:0.2,language:'fr-FR'});h.sessions[0].events.end();
  assert.match(h.render(),/No podemos confirmar/);assert.equal(h.used.length,0);
  h.press('Empezar a hablar en francés');
  h.sessions[1].events.result('Merci !','',{confidence:0.9,language:'fr-FR'});h.sessions[1].events.end();
  assert.match(h.render(),/El texto transcrito no responde/);assert.equal(h.used.length,0);
  h.input().onChangeText('Bonjour !');h.render();assert.equal(h.input().value,'Bonjour !');
  assert.equal(h.used.length,0,'editing does not confirm');
  h.press('Confirmar y usar texto revisado');assert.deepEqual(h.used,['Bonjour !']);
  h.render();assert.equal(h.input(),undefined,'confirmed draft is cleared');h.dispose();
});
test('LEARN microphone UI: no speech and denied permission offer fallback without a confirmation or educational response',()=>{
  const h=setup();h.render();h.press('Empezar a hablar en francés');h.sessions[0].events.end();
  assert.match(h.render(),/No se detectó una frase/);assert.equal(h.input(),undefined);
  h.press('Empezar a hablar en francés');h.sessions[1].events.error('not-allowed');
  assert.match(h.render(),/Permiso de micrófono denegado/);assert.equal(h.input(),undefined);
  assert.equal(h.used.length,0);h.dispose();
});
