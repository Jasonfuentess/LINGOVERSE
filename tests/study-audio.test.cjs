const{test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const{selectVoice}=require('../.test-build/domain/voice/playback');
function setup(voices){
  let cursor=0,controls=[];const slots=[],requests=[];
  const hooks={...React,useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],v=>{slots[i]=v;}];}};
  const host=tag=>function Native(props){controls.push(props);return React.createElement(tag,{},props.children);};
  const module={exports:{}},filename=path.resolve('src/features/voice/VoiceControls.tsx');
  const js=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText;
  const localRequire=id=>{
    if(id==='react')return hooks;
    if(id==='react-native')return{Platform:{OS:'web'},View:host('div'),Text:host('span'),Pressable:host('button'),StyleSheet:{create:x=>x}};
    if(id.endsWith('/playback'))return{selectVoice};
    if(id.endsWith('VoiceProvider'))return{useVoice:()=>({state:{voices,muted:false,allowNetworkVoices:false},saving:false,toggleMute:async()=>{}})};
    if(id==='./service')return{voiceController:{snapshot:()=>({activeId:null}),stop:async()=>{},play:async request=>requests.push(request)}};
    if(id.endsWith('theme/tokens'))return{tokens:{color:{teal:'#16655D',muted:'#4E6474',tint:'#E4F2EC',error:'#932C2C'}}};
    return require(id);
  };
  vm.runInNewContext(js,{require:localRequire,module,exports:module.exports},{filename});
  const render=()=>{cursor=0;controls=[];return renderToStaticMarkup(React.createElement(module.exports.StudyAudio,{text:"Oui, j'ai rendez-vous ici.",language:'fr-FR',segments:['Oui,',"j'ai rendez-vous",'ici.']}));};
  const button=label=>controls.find(c=>c.onPress&&(c.accessibilityLabel===label||c.children?.props?.children===label));
  return{render,button,requests};
}
test('LEARN02 audio: slow request has explicit segment fallback using original French, never Spanish approximations',()=>{
  const h=setup([{identifier:'fr',language:'fr-FR',name:'French'}]);h.render();
  h.button('Audio lento y grupos').onPress();h.render();
  h.button('Escuchar más despacio (según voz)').onPress();assert.equal(h.requests[0].rate,0.65);
  h.button('Si suena igual: escuchar por grupos').onPress();h.render();
  h.button('Escuchar el grupo 2').onPress();assert.equal(h.requests.at(-1).text,"j'ai rendez-vous");
  assert.equal(h.requests.at(-1).language,'fr-FR');assert.ok(h.requests.every(r=>!r.text.includes('zhé')));
  const unavailable=setup([{identifier:'en',language:'en-GB',name:'English'}]);assert.match(unavailable.render(),/No hay voz compatible/);
  assert.equal(unavailable.button('Escuchar el modelo').disabled,true,'never substitute English for French');
});
