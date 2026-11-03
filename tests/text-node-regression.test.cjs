// Regression: "Unexpected text node: . A text node cannot be a child of a <View>." (LearningRescue.tsx:43).
// Root cause: `{someString && <X/>}` renders '' as a raw text node inside a View when the string is empty.
// React Native Web reports it in development (the `npm run web` mode); native React Native crashes on it.
// These tests render with the REAL react-native-web View (not a mock), so the check actually runs.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server');
const RNW = require('react-native-web');
const { learningRescue } = require('../.test-build/content/rescue');
const { cafeLesson } = require('../.test-build/content/cafe');
const { londonLesson } = require('../.test-build/content/london');
const { rendezvousLesson } = require('../.test-build/content/rendezvous');
const { roastLesson } = require('../.test-build/content/roast');
const { beginMission, currentExercise, submitAnswer } = require('../.test-build/domain/learning/engine');

function harness() {
  let cursor = 0, controls = [];
  const slots = [], speech = [];
  const hooks = { ...React, useEffect() {}, useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], v => { slots[i] = typeof v === 'function' ? v(slots[i]) : v; }]; } };
  const h = React.createElement;
  const ui = {
    Button: p => { controls.push(p); return h(RNW.Text, null, p.label); },
    Copy: p => h(RNW.Text, null, p.children), Heading: p => h(RNW.Text, null, p.children),
    Notice: p => h(RNW.Text, null, p.message), Card: p => h(RNW.View, null, p.children),
  };
  const cache = new Map();
  function load(relative) {
    const filename = path.resolve(relative);
    if (cache.has(filename)) return cache.get(filename);
    const module = { exports: {} }; cache.set(filename, module.exports);
    const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
    const localRequire = id => {
      if (id === 'react') return hooks;
      // Real react-native-web components; Pressable is wrapped only to record its props so tests can press it.
      if (id === 'react-native') return { ...RNW, Pressable: p => { controls.push(p); return h(RNW.Pressable, p); } };
      if (id.endsWith('components/ui')) return ui;
      if (id.endsWith('VoiceControls')) return { SpeechButton: () => null, StudyAudio: () => null, CoachSpeech: () => null };
      if (id.endsWith('SpeechInput')) return { SpeechInput: p => { speech.push(p); return null; } };
      if (id.startsWith('.')) { const target = path.resolve(path.dirname(filename), id); return load(fs.existsSync(target + '.tsx') ? target + '.tsx' : target + '.ts'); }
      return require(id);
    };
    vm.runInNewContext(js, { require: localRequire, module, exports: module.exports, process }, { filename });
    cache.set(filename, module.exports);
    return module.exports;
  }
  let element;
  const errors = [];
  const render = el => {
    if (el) element = el;
    cursor = 0; controls = []; speech.length = 0;
    const original = console.error;
    console.error = (...args) => { errors.push(args.map(String).join(' ')); };
    try { return renderToStaticMarkup(element); } finally { console.error = original; }
  };
  const label = c => c.label ?? c.accessibilityLabel ?? (typeof c.children?.props?.children === 'string' ? c.children.props.children : undefined);
  return { load, render, errors, speech, controls: () => controls, label };
}
const textNodeErrors = errors => errors.filter(e => e.includes('Unexpected text node'));

test('regression: opening "Practicar hablando sin enviar" never renders an empty text node inside a View', () => {
  const h = harness(); const { LearningRescue } = h.load('src/features/learning/LearningRescue.tsx');
  const ex = rendezvousLesson.variants[0].exercises.find(e => e.id === 'confirm');
  h.render(React.createElement(LearningRescue, { plan: learningRescue('fr', 'rendezvous', ex), mode: 'starter', language: 'fr-FR', disabled: false, onUse() {}, onHelp() {} }));
  assert.equal(process.env.NODE_ENV === 'production', false, 'react-native-web development checks must be active');
  h.controls().find(c => c.label === 'Practicar y construir mi respuesta').onPress(); h.render();
  h.controls().find(c => c.label === 'Practicar hablando sin enviar').onPress(); h.render();
  assert.deepEqual(textNodeErrors(h.errors), [], 'exact reproduction of LearningRescue.tsx:43');
  h.speech[0].onUse('Oui');
  const html = h.render();
  assert.ok(html.includes('Práctica en pantalla: <!-- -->Oui') || html.includes('Práctica en pantalla: Oui'), 'practice text still shown once there is one');
  assert.deepEqual(textNodeErrors(h.errors), []);
});

test('regression: every help control, in every mode, turn and adventure, renders without stray text nodes or submissions', () => {
  let renders = 0;
  for (const [lesson, lang, adventure] of [[cafeLesson, 'fr', 'cafe'], [londonLesson, 'en', 'cafe'], [rendezvousLesson, 'fr', 'rendezvous']]) {
    for (const variant of lesson.variants) for (const exercise of variant.exercises) for (const mode of ['starter', 'a1', 'autonomous']) {
      const h = harness(); const { LearningRescue } = h.load('src/features/learning/LearningRescue.tsx');
      const used = [];
      h.render(React.createElement(LearningRescue, { plan: learningRescue(lang, adventure, exercise), mode, language: lang === 'en' ? 'en-GB' : 'fr-FR', disabled: false, onUse: a => used.push(a), onHelp() {} }));
      // Open everything first (one control per render), then close everything: covers opening and closing.
      const submitting = ['Preparar esta respuesta con ayuda', 'Usar respuesta construida'];
      const closing = label => /^(Cerrar|Ocultar|Volver a construir)/.test(label);
      const pressed = new Set();
      for (const phase of ['open', 'close']) for (let round = 0; round < 40; round++) {
        const next = h.controls().find(c => c.onPress && !c.disabled && h.label(c) && !submitting.includes(h.label(c)) && !pressed.has(h.label(c)) && closing(h.label(c)) === (phase === 'close'));
        if (!next) break;
        pressed.add(h.label(next)); next.onPress();
        for (const s of h.speech) s.onUse?.('');
        h.render(); renders++;
      }
      assert.ok(pressed.has('Practicar hablando sin enviar'), `${exercise.id}/${mode}: practice section opened`);
      assert.deepEqual(textNodeErrors(h.errors), [], `${lesson.id}/${variant.id}/${exercise.id}/${mode}`);
      assert.equal(used.length, 0);
    }
  }
  assert.ok(renders > 300, `rendered ${renders} help states`);
});

test('regression: Roast feedback after an unrecognised written answer (stored as "") renders no stray text node', () => {
  const h = harness(); const { EducationalFeedback } = h.load('src/features/learning/EducationalFeedback.tsx');
  let p = beginMission(roastLesson, 0, () => roastLesson.variants[0].id);
  p = submitAnswer(roastLesson, p, { kind: 'text', text: 'texto libre que no se reconoce' });
  const stored = p.events.at(-1).answer.text;
  assert.equal(stored, '', 'privacy: free text is stored empty, which is the value that reached the View');
  h.render(React.createElement(EducationalFeedback, { feedback: p.feedback, submittedText: stored, speaker: currentExercise(roastLesson, p).speaker, language: 'fr' }));
  assert.deepEqual(textNodeErrors(h.errors), []);
  const html = h.render(React.createElement(EducationalFeedback, { feedback: p.feedback, submittedText: 'bonjor', speaker: 'Camille', language: 'fr' }));
  assert.ok(html.includes('Tu respuesta'), 'a real submitted text is still shown');
});


test('regression (LV-009): the options panel, every option meaning and compact coaches render without stray text nodes', () => {
  let renders = 0;
  for (const [lesson, lang] of [[cafeLesson, 'fr'], [londonLesson, 'en'], [rendezvousLesson, 'fr']]) {
    for (const variant of lesson.variants) for (const exercise of variant.exercises.filter(e => e.kind === 'choice')) for (const mode of ['starter', 'a1']) {
      const h = harness(); const { ChoiceListening } = h.load('src/features/learning/ChoiceListening.tsx');
      h.render(React.createElement(ChoiceListening, { choices: exercise.choices, language: lang === 'en' ? 'en-GB' : 'fr-FR', mode, onHelp() {} }));
      const press = match => { const c = h.controls().find(c => c.onPress && match(h.label(c) ?? '')); if (!c) return false; c.onPress(); h.render(); renders++; return true; };
      assert.ok(press(l => l === 'Escuchar las opciones'), 'panel opens');
      for (const option of exercise.choices) {
        if (press(l => l === `Significado y pronunciación de ${option.label}`)) { press(l => l.startsWith('¿Cómo se pronuncia')); press(l => l === 'Volver a la conversación'); press(l => l.startsWith('Ocultar significado')); }
      }
      assert.deepEqual(textNodeErrors(h.errors), [], `${lesson.id}/${variant.id}/${exercise.id}/${mode}`);
    }
  }
  assert.ok(renders > 200, `rendered ${renders} option states`);
});
