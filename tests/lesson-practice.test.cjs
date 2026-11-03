// LV-009-LEARN-04 Lesson Practice & Pronunciation Coverage: choice-turn coverage, neutral option listening,
// modes, no reveal, no submission, draft preservation, de-duplicated help and compatibility.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server');
const { pronunciationFor, guidesWithin } = require('../.test-build/content/pronunciation');
const { learningRescue } = require('../.test-build/content/rescue');
const { cafeLesson, cafeLessonV1, cafeLessonV2 } = require('../.test-build/content/cafe');
const { londonLesson, londonLessonV1, londonLessonV2, londonLessonV3, londonLessonV4 } = require('../.test-build/content/london');
const { rendezvousLesson, rendezvousLessonV1 } = require('../.test-build/content/rendezvous');
const { evaluateAnswer } = require('../.test-build/domain/learning/engine');
const { selectVoice } = require('../.test-build/domain/voice/playback');

const current = [[cafeLesson, 'fr', 'cafe'], [londonLesson, 'en', 'cafe'], [rendezvousLesson, 'fr', 'rendezvous']];
const choiceTurns = lesson => lesson.variants.flatMap(v => v.exercises.filter(e => e.kind === 'choice').map(e => ({ variant: v.id, exercise: e })));
const approximations = g => [g.approximate, ...g.units.map(u => u.approximate).filter(Boolean)];

function harness(voices = [{ identifier: 'fr', language: 'fr-FR', name: 'French' }, { identifier: 'en', language: 'en-GB', name: 'English' }]) {
  let cursor = 0, controls = [];
  const slots = [], requests = [], speech = [];
  const hooks = { ...React, useEffect() {}, useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], v => { slots[i] = typeof v === 'function' ? v(slots[i]) : v; }]; } };
  const host = tag => function Native(props) { controls.push(props); return React.createElement(tag, { 'data-label': props.accessibilityLabel ?? props.label }, props.children ?? props.label ?? props.message ?? props.value); };
  const cache = new Map();
  function load(relative) {
    const filename = path.resolve(relative);
    if (cache.has(filename)) return cache.get(filename);
    const module = { exports: {} }; cache.set(filename, module.exports);
    const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
    const localRequire = id => {
      if (id === 'react') return hooks;
      if (id === 'react-native') return { Platform: { OS: 'web' }, View: host('section'), Text: host('span'), Pressable: host('button'), StyleSheet: { create: x => x } };
      if (id.endsWith('components/ui')) return Object.fromEntries(['Button', 'Card', 'Choice', 'Copy', 'Heading', 'Notice'].map(n => [n, host(n === 'Button' ? 'button' : 'div')]));
      if (id.endsWith('KeyboardScroll')) return { AnswerTextInput: host('textarea'), KeyboardAnswerGroup: host('section') };
      if (id.endsWith('SpeechInput')) return { SpeechInput: p => { speech.push(p); return null; } };
      if (id.endsWith('CoachReaction')) return { CoachReaction: () => null };
      if (id.endsWith('AdventureArt')) return { CharacterPortrait: host('figure'), SceneArtwork: host('figure') };
      if (id.endsWith('/playback')) return { selectVoice };
      if (id.endsWith('VoiceProvider')) return { useVoice: () => ({ state: { voices, muted: false, allowNetworkVoices: false, activeId: null }, coachLocale: 'es-SV', saving: false, toggleMute: async () => {} }) };
      if (id === './service') return { voiceController: { snapshot: () => ({ activeId: null }), stop: async () => {}, play: async r => requests.push(r) } };
      if (id.startsWith('.')) { const target = path.resolve(path.dirname(filename), id); return load(fs.existsSync(target + '.tsx') ? target + '.tsx' : target + '.ts'); }
      return require(id);
    };
    vm.runInNewContext(js, { require: localRequire, module, exports: module.exports }, { filename });
    cache.set(filename, module.exports);
    return module.exports;
  }
  let element;
  const render = el => { if (el) element = el; cursor = 0; controls = []; speech.length = 0; return renderToStaticMarkup(element); };
  const label = c => c.accessibilityLabel ?? c.label ?? (typeof c.children?.props?.children === 'string' ? c.children.props.children : undefined);
  const find = text => controls.find(c => c.onPress && label(c) === text);
  const press = text => { const c = find(text); assert.ok(c, `control: ${text}`); c.onPress(); return render(); };
  const count = text => controls.filter(c => c.onPress && label(c) === text).length;
  return { load, render, press, find, count, label, controls: () => controls, requests, speech };
}

test('LV-009 coverage: every multiple-choice turn has a reviewed guide for its model and for every distinct valid decision', () => {
  const report = {};
  for (const [lesson, lang, adventure] of current) {
    let turns = 0, guidedModels = 0, decisions = 0, guidedDecisions = 0;
    for (const { variant, exercise } of choiceTurns(lesson)) {
      turns++;
      const plan = learningRescue(lang, adventure, exercise);
      assert.ok(plan.pronunciation, `${lesson.id}/${variant}/${exercise.id}: model «${plan.text}» has a guide`);
      guidedModels++;
      const groups = new Map();
      for (const option of exercise.choices.filter(c => c.correct)) { const key = JSON.stringify([option.next, option.facts ?? null]); groups.set(key, [...(groups.get(key) ?? []), option]); }
      for (const options of groups.values()) {
        decisions++;
        assert.ok(options.some(o => pronunciationFor(o.label, lang)), `${lesson.id}/${variant}/${exercise.id}: decision ${options.map(o => o.label).join(' | ')} has guided phrasing`);
        guidedDecisions++;
      }
    }
    report[lesson.id] = { turns, guidedModels, decisions, guidedDecisions };
  }
  assert.deepEqual(Object.values(report).map(r => r.turns === r.guidedModels && r.decisions === r.guidedDecisions), [true, true, true]);
  // The prices that motivated this stage: obligatory liaison taught in every variant.
  for (const [label, approx] of [['Trois euros.', 'truá zöró'], ['Deux euros.', 'dö zöró'], ['Un euro.', 'ẽ nöró']]) {
    const guide = pronunciationFor(label, 'fr');
    assert.equal(guide.approximate, approx); assert.ok(guide.tips.some(t => t.id === 'fr-liaison'));
  }
});

test('LV-009 options: each option is heard in the adventure language, guided options open meaning and slow audio, others say so', () => {
  const h = harness(); const { ChoiceListening } = h.load('src/features/learning/ChoiceListening.tsx');
  const paiement = cafeLesson.variants.find(v => v.id === 'matin-lucie').exercises.find(e => e.id === 'paiement');
  let helped = 0;
  let html = h.render(React.createElement(ChoiceListening, { choices: paiement.choices, language: 'fr-FR', mode: 'a1', onHelp: () => helped++ }));
  assert.ok(!html.includes('Trois euros.'), 'collapsed by default');
  html = h.press('Escuchar las opciones');
  for (const option of paiement.choices) { h.press(`Escuchar «${option.label}»`); assert.equal(h.requests.at(-1).text, option.label); assert.equal(h.requests.at(-1).language, 'fr-FR'); }
  assert.equal(helped, 0, 'listening is not help');
  html = h.press('Significado y pronunciación de Deux euros.');
  assert.equal(helped, 1); assert.ok(html.includes('Dos euros.'));
  // Positional test hooks may carry a sibling's played state, so the label can read Escuchar or Repetir.
  h.controls().find(c => c.onPress && / «Deux euros.» más despacio$/.test(h.label(c) ?? '')).onPress(); assert.equal(h.requests.at(-1).rate, 0.65);
  assert.equal(h.controls().filter(c => c.onPress && /^(Escuchar|Repetir) «Deux euros.»$/.test(h.label(c) ?? '')).length, 1, 'expanded option keeps exactly one normal-speed button');
  assert.ok(h.requests.every(r => !approximations(pronunciationFor('Deux euros.', 'fr')).includes(r.text)), 'never the Spanish approximation');
  const london = londonLesson.variants[0].exercises.find(e => e.id === 'choose-path');
  const other = harness(); const { ChoiceListening: Listening } = other.load('src/features/learning/ChoiceListening.tsx');
  other.render(React.createElement(Listening, { choices: london.choices, language: 'en-GB', mode: 'starter', onHelp() {} }));
  html = other.press('Escuchar las opciones');
  assert.ok(html.includes('Sin guía revisada'), 'an option without editorial data says so (I do not need directions.)');
  other.press('Escuchar «I do not need directions.»'); assert.equal(other.requests.at(-1).language, 'en-GB');
});

test('LV-009 no reveal: the options panel is neutral in every mode; A1 and Autónomo do not show the model before asking', () => {
  for (const mode of ['starter', 'a1', 'autonomous']) {
    const h = harness(); const { ExerciseView } = h.load('src/features/learning/ExerciseView.tsx');
    const ex = cafeLesson.variants.find(v => v.id === 'matin-lucie').exercises.find(e => e.id === 'paiement');
    let html = h.render(React.createElement(ExerciseView, { exercise: ex, feedback: null, saving: false, error: null, conversational: true, language: 'fr', adventure: 'cafe', onAnswer: async () => true, onContinue: async () => true, rescue: { plan: learningRescue('fr', 'cafe', ex), mode } }));
    if (mode !== 'starter') assert.ok(!html.includes('truá zöró') && !html.includes('ESCUCHÁ · COMPRENDÉ'), `${mode}: model not revealed before asking`);
    html = h.press('Escuchar las opciones');
    const panel = html.slice(html.indexOf('Escuchar o estudiar una opción'));
    assert.ok(!/✓|correcta:|respuesta correcta/i.test(panel.replace('no la elige ni indica si es la correcta', '')), `${mode}: no correctness marker`);
    const order = ex.choices.map(c => panel.indexOf(c.label.replace(/'/g, '&#x27;')));
    assert.deepEqual([...order].sort((a, b) => a - b), order, 'options keep their on-screen order');
  }
});

test('LV-009 no submission: listening, studying and practising never select, change or submit an answer', () => {
  const h = harness(); const { ExerciseView } = h.load('src/features/learning/ExerciseView.tsx');
  const ex = rendezvousLesson.variants[0].exercises.find(e => e.id === 'route');
  const answers = [];
  h.render(React.createElement(ExerciseView, { exercise: ex, feedback: null, saving: false, error: null, conversational: true, language: 'fr', adventure: 'rendezvous', onAnswer: async a => { answers.push(a); return true; }, onContinue: async () => true, rescue: { plan: learningRescue('fr', 'rendezvous', ex), mode: 'starter' } }));
  h.controls().find(c => c.accessibilityRole === 'radio' && String(c.children?.[0]?.props?.children ?? '').includes('Près des fleurs')).onPress(); h.render();
  const checked = () => h.controls().filter(c => c.accessibilityRole === 'radio' && c.accessibilityState?.checked).length;
  assert.equal(checked(), 1);
  const skip = new Set(['Preparar esta respuesta con ayuda', 'Usar respuesta construida', 'Responder al personaje']);
  const pressed = new Set();
  // Toggles and practice controls only; audio playback is covered by the options test (its label changes to «Repetir» after each press).
  for (let round = 0; round < 80; round++) {
    const next = h.controls().find(c => c.onPress && !c.disabled && c.accessibilityRole !== 'radio' && !skip.has(h.label(c)) && !pressed.has(h.label(c)) && !/^(Cerrar|Ocultar|Volver a la|Repetir |Escuchar (?!las opciones))/.test(h.label(c) ?? ''));
    if (!next) break;
    pressed.add(h.label(next)); next.onPress(); for (const s of h.speech) s.onUse?.('texto de práctica'); h.render();
  }
  assert.ok(pressed.has('Escuchar las opciones') && pressed.has('Practicar hablando sin enviar') && [...pressed].some(l => l?.startsWith('Significado y pronunciación')));
  assert.equal(answers.length, 0, 'nothing submitted');
  assert.equal(checked(), 1, 'the chosen option is still the only selection');
});

test('LV-009 drafts: opening practice, building and options keeps the typed draft; mode changes keep it too', () => {
  const h = harness(); const { ExerciseView } = h.load('src/features/learning/ExerciseView.tsx');
  const ex = londonLesson.variants[0].exercises.find(e => e.id === 'help');
  const view = mode => React.createElement(ExerciseView, { exercise: ex, feedback: null, saving: false, error: null, conversational: true, language: 'en', adventure: 'cafe', onAnswer: async () => true, onContinue: async () => true, rescue: { plan: learningRescue('en', 'cafe', ex), mode } });
  h.render(view('starter'));
  h.controls().find(c => c.onChangeText).onChangeText('I need');
  h.render();
  for (const l of ['Practicar y construir mi respuesta', 'Construir mi respuesta', 'Practicar hablando sin enviar', 'Cerrar práctica oral', 'Cerrar construcción', 'Cerrar práctica']) h.press(l);
  assert.equal(h.controls().find(c => c.onChangeText).value, 'I need');
  h.render(view('autonomous'));
  assert.equal(h.controls().find(c => c.onChangeText).value, 'I need');
});

test('LV-009 no duplicates: with every help open, model audio, voice notices and vocabulary appear once', () => {
  for (const [lesson, lang, adventure, variant, id] of [[cafeLesson, 'fr', 'cafe', 'matin-lucie', 'paiement'], [londonLesson, 'en', 'cafe', 'station-arrival', 'direction-b'], [rendezvousLesson, 'fr', 'rendezvous', 'jardin-bleu', 'identify'], [londonLesson, 'en', 'cafe', 'station-arrival', 'introduce']]) {
    const h = harness([]); // no voices: every StudyAudio would print the "no compatible voice" notice
    const { ExerciseView } = h.load('src/features/learning/ExerciseView.tsx');
    const ex = lesson.variants.find(v => v.id === variant).exercises.find(e => e.id === id);
    h.render(React.createElement(ExerciseView, { exercise: ex, feedback: null, saving: false, error: null, conversational: true, language: lang, adventure, onAnswer: async () => true, onContinue: async () => true, rescue: { plan: learningRescue(lang, adventure, ex), mode: 'starter' } }));
    for (const l of ['Practicar y construir mi respuesta', 'Construir mi respuesta', 'Practicar hablando sin enviar', 'Necesito una pista', 'Ver traducción y expresiones', ...(ex.kind === 'choice' ? ['Escuchar las opciones'] : [])]) h.press(l);
    const coachToggle = h.controls().find(c => c.onPress && (h.label(c) ?? '').startsWith('¿Cómo se pronuncia'));
    if (coachToggle) { coachToggle.onPress(); h.render(); }
    const html = h.render();
    assert.equal(h.count('Escuchar el modelo'), 1, `${id}: one model player`);
    assert.equal(html.split('No hay voz compatible').length - 1, 1, `${id}: one voice notice`);
    const teaching = ex.teaching.split('\n').at(-1).slice(0, 40).replace(/'/g, '&#x27;');
    assert.equal(html.split(teaching).length - 1, 1, `${id}: vocabulary shown once`);
    const plan = learningRescue(lang, adventure, ex);
    // The options panel legitimately offers each option once; the coach breakdown must not add another player.
    if (plan.pronunciation?.units.length === 1) assert.equal(h.count(`Escuchar «${plan.pronunciation.original}»`), ex.kind === 'choice' && ex.choices.some(c => c.label === plan.pronunciation.original) ? 1 : 0, `${id}: single-unit guide does not repeat the full-phrase player`);
  }
});

test('LV-009 compatibility: archived versions keep valid help, guides do not change evaluation, nothing is persisted', () => {
  for (const [lesson, lang, adventure] of [[cafeLessonV1, 'fr', 'cafe'], [cafeLessonV2, 'fr', 'cafe'], [londonLessonV1, 'en', 'cafe'], [londonLessonV2, 'en', 'cafe'], [londonLessonV3, 'en', 'cafe'], [londonLessonV4, 'en', 'cafe'], [rendezvousLessonV1, 'fr', 'rendezvous'], ...current]) {
    for (const v of lesson.variants) for (const ex of v.exercises) {
      const plan = learningRescue(lang, adventure, ex);
      assert.equal(evaluateAnswer(ex, plan.answer).correct, true, `${lesson.id} v${lesson.version} ${ex.id}`);
      if (ex.kind === 'choice') for (const c of ex.choices) for (const g of [pronunciationFor(c.label, lang), ...guidesWithin(c.label, lang)].filter(Boolean)) assert.equal(g.language, lang);
    }
  }
  const sources = ['ChoiceListening.tsx', 'PronunciationCoach.tsx', 'LearningRescue.tsx'].map(f => fs.readFileSync(path.join('src/features/learning', f), 'utf8')).join('\n');
  assert.ok(!/Storage|Repository|localStorage|setItem/.test(sources), 'help UI keeps only transient view state');
});
