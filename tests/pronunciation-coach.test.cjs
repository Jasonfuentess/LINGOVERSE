// LV-008-LEARN-03 Pronunciation Coach: editorial catalog contract, coverage, audio requests,
// progressive disclosure per mode, no auto-submit, draft preservation and persistence isolation.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server');
const { pronunciationGuides, pronunciationFor, soundTips, containsPhrase, guidesWithin } = require('../.test-build/content/pronunciation');
const { learningRescue } = require('../.test-build/content/rescue');
const { cafeLesson } = require('../.test-build/content/cafe');
const { londonLesson, londonLessonV3 } = require('../.test-build/content/london');
const { rendezvousLesson } = require('../.test-build/content/rendezvous');
const { evaluateAnswer, normalizeAnswer, beginMission, currentExercise, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine');
const { matchSpokenChoice } = require('../.test-build/domain/voice/choiceMatching');
const { selectVoice, VoiceController } = require('../.test-build/domain/voice/playback');

const lessons = [[cafeLesson, 'fr', 'cafe'], [londonLesson, 'en', 'cafe'], [rendezvousLesson, 'fr', 'rendezvous']];
const correctTexts = ex => ex.kind === 'choice' ? ex.choices.filter(c => c.correct).map(c => c.label) : ex.accepted;
const exercisesOf = lesson => lesson.variants.flatMap(v => v.exercises);
const approximations = g => [g.approximate, ...g.units.map(u => u.approximate).filter(Boolean)];

// Stateful harness: real useState slots kept across renders so pressing a control and re-rendering is observable.
function harness({ voices = [{ identifier: 'fr', language: 'fr-FR', name: 'French' }, { identifier: 'en', language: 'en-GB', name: 'English' }], realVoice = true } = {}) {
  let cursor = 0, controls = [];
  const slots = [], requests = [], speech = [], audio = [];
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
      if (id.endsWith('VoiceControls') && !realVoice) return { SpeechButton: p => { audio.push(p); return null; }, StudyAudio: p => { audio.push(p); return null; } };
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
  const render = el => { if (el) element = el; cursor = 0; controls = []; speech.length = 0; audio.length = 0; return renderToStaticMarkup(element); };
  const label = c => c.accessibilityLabel ?? c.label ?? (typeof c.children?.props?.children === 'string' ? c.children.props.children : undefined);
  const find = text => controls.find(c => c.onPress && label(c) === text);
  const press = text => { const c = find(text); assert.ok(c, `control: ${text}`); c.onPress(); return render(); };
  return { load, render, press, find, label, controls: () => controls, requests, speech, audio };
}

test('LEARN03 catalog: typed entries are internally consistent, sourced and carry review metadata', () => {
  const ids = new Set();
  const tipIds = new Set(soundTips.map(t => t.id));
  for (const g of pronunciationGuides) {
    assert.ok(/^(fr|en)\.[a-z0-9-]+$/.test(g.id), g.id); assert.ok(!ids.has(g.id), `unique ${g.id}`); ids.add(g.id);
    assert.equal(g.language, g.id.slice(0, 2)); assert.equal(g.locale, g.language === 'fr' ? 'fr-FR' : 'en-GB');
    assert.ok(g.translation && g.purpose && g.ipa && g.approximate, g.id);
    assert.equal(normalizeAnswer(g.units.map(u => u.text).join(' ')), normalizeAnswer(g.original), `units rebuild original: ${g.id}`);
    for (const u of g.units) assert.ok(u.meaning, `unit meaning ${g.id}/${u.text}`);
    assert.ok(g.tips.length > 0, `at least one sound tip: ${g.id}`);
    for (const tip of g.tips) { assert.ok(tipIds.has(tip.id)); assert.equal(tip.language, g.language, `tip language ${g.id}/${tip.id}`); }
    assert.deepEqual(g.segments, g.units.map(u => u.text)); assert.deepEqual(g.notes, [...g.focus, ...g.tips.map(t => t.explanation)]);
    assert.ok(['ai-editorial', 'teacher-reviewed'].includes(g.review.status) && /^\d{4}-\d{2}-\d{2}$/.test(g.review.reviewed) && g.review.note);
    assert.ok(g.sources.length > 0 && g.sources.every(s => s.startsWith('https://')));
    for (const a of approximations(g)) assert.notEqual(normalizeAnswer(a), normalizeAnswer(g.original), `approximation differs from original: ${g.id}`);
  }
  const originals = pronunciationGuides.map(g => `${g.language}:${normalizeAnswer(g.original)}`);
  assert.equal(new Set(originals).size, originals.length, 'one guide per expression and language');
  assert.equal(pronunciationGuides.length, 69, '11 reviewed LEARN-02 + 24 LEARN-03 + 34 LV-009-LEARN-04 choice-turn guides');
});

test('LEARN03 catalog: every guide is attached only to exercises where it is part of a correct answer, in its own language', () => {
  const byId = { [cafeLesson.id]: cafeLesson, [londonLesson.id]: londonLesson, [rendezvousLesson.id]: rendezvousLesson };
  for (const g of pronunciationGuides) {
    assert.ok(g.usedIn.length > 0, g.id);
    for (const ref of g.usedIn) {
      const [lessonId, exerciseId] = ref.split('/'); const lesson = byId[lessonId];
      assert.ok(lesson, `known lesson ${ref}`); assert.equal(lesson.language, g.language, `same language ${ref}`);
      const matches = exercisesOf(lesson).filter(e => e.id === exerciseId);
      assert.ok(matches.length > 0, `exercise exists ${ref}`);
      assert.ok(matches.some(e => correctTexts(e).some(t => containsPhrase(t, g.original))), `${g.original} is (part of) a correct answer at ${ref}`);
    }
  }
});

test('LEARN03 coverage: every turn a beginner must produce in writing, and every opening greeting, has a reviewed guide', () => {
  for (const [lesson, lang, adventure] of lessons) for (const v of lesson.variants) v.exercises.forEach((ex, index) => {
    const plan = learningRescue(lang, adventure, ex);
    if (ex.kind === 'text' || index === 0) {
      assert.ok(plan.pronunciation, `${lesson.id}/${v.id}/${ex.id}: ${plan.text}`);
      assert.equal(plan.pronunciation.language, lang);
      assert.equal(evaluateAnswer(ex, plan.answer).correct, true);
      assert.equal(plan.purpose, ex.instruction);
    }
  });
  // Archived London content still gets a valid plan; guides never change which answer is preferred.
  for (const v of londonLessonV3.variants) for (const ex of v.exercises) assert.equal(evaluateAnswer(ex, learningRescue('en', 'cafe', ex).answer).correct, true);
});

test('LEARN03 evaluation: Spanish approximations are never accepted as answers, spoken choices or guide lookups', () => {
  for (const [lesson] of lessons) for (const ex of exercisesOf(lesson)) for (const g of pronunciationGuides.filter(g => g.language === lesson.language)) for (const a of approximations(g)) {
    if (ex.kind === 'text') assert.equal(evaluateAnswer(ex, { kind: 'text', text: a }).correct, false, `${ex.id} rejects «${a}»`);
    else assert.equal(matchSpokenChoice(ex, a), null, `${ex.id} never maps «${a}» to a choice`);
    assert.equal(pronunciationFor(a, lesson.language), null);
  }
});

test('LEARN03 lookup: apostrophe variants match, phrases match whole words only, no cross-language guide', () => {
  assert.equal(pronunciationFor('Où est la fontaine, s\'il vous plaît ?', 'fr').id, 'fr.ou-est-la-fontaine-svp');
  assert.equal(pronunciationFor('c’est combien', 'fr').id, 'fr.cest-combien');
  assert.equal(pronunciationFor('Thank you!', 'fr'), null);
  assert.equal(containsPhrase('Non, merci.', 'Merci.'), true);
  assert.equal(containsPhrase('Mercredi', 'Merci'), false, 'no partial-word association');
  const within = guidesWithin('Oui, sur place, s’il vous plaît.', 'fr').map(g => g.id);
  assert.ok(within.includes('fr.sil-vous-plait')); assert.ok(!within.includes('fr.oui-sil-vous-plait'), 'non-contiguous words are not a chunk');
  assert.ok(!guidesWithin('Merci.', 'fr').some(g => g.id === 'fr.merci'), 'exact expression is not repeated as a related guide');
  const midi = cafeLesson.variants.find(v => v.id === 'midi-samir').exercises.find(e => e.id === 'lieu-cafe');
  const plan = learningRescue('fr', 'cafe', midi);
  // LV-009-LEARN-04 added a full guide for this model; chunks of the alternatives are still associated and ordered.
  assert.equal(plan.pronunciation.id, 'fr.oui-sur-place');
  const ids = plan.usefulGuides.map(g => g.id);
  assert.ok(ids.includes('fr.sur-place') && ids.includes('fr.a-emporter'), 'chunks of every valid alternative');
  assert.ok(plan.usefulGuides.every((g, i, all) => i === 0 || all[i - 1].original.length >= g.original.length), 'longest reviewed chunk first');
});

test('LEARN03 coach UI: starter sees the guide upfront; breakdown plays original units (normal and slow) in the guide locale only', () => {
  const h = harness();
  const { PronunciationCoach, SLOW_RATE } = h.load('src/features/learning/PronunciationCoach.tsx');
  const g = pronunciationFor("Oui, j'ai rendez-vous ici.", 'fr'); let helped = 0;
  let html = h.render(React.createElement(PronunciationCoach, { guide: g, text: g.original, language: 'fr-FR', mode: 'starter', onHelp: () => helped++ }));
  assert.ok(html.includes('ui, zhé rãdevú isí')); assert.ok(!html.includes('POR PARTES'), 'details stay collapsed');
  h.press('Escuchar el modelo'); assert.equal(h.requests.at(-1).text, g.original); assert.equal(h.requests.at(-1).language, 'fr-FR');
  html = h.press("¿Cómo se pronuncia Oui, j'ai rendez-vous ici.?"); assert.equal(helped, 1, 'opening counts as help, nothing else');
  const escaped = text => text.replace(/'/g, '&#x27;');
  for (const unit of g.units) assert.ok(html.includes(escaped(unit.text)) && html.includes(unit.meaning), unit.text);
  for (const tip of g.tips) assert.ok(html.includes(tip.label));
  h.press("Escuchar «j'ai rendez-vous»"); assert.equal(h.requests.at(-1).text, "j'ai rendez-vous"); assert.equal(h.requests.at(-1).rate, undefined);
  h.press("Escuchar «j'ai rendez-vous» más despacio"); assert.equal(h.requests.at(-1).rate, SLOW_RATE);
  assert.ok(SLOW_RATE >= 0.5 && SLOW_RATE <= 1.2, 'within VoiceController accepted range');
  assert.ok(h.requests.every(r => r.language === 'fr-FR' && !approximations(g).includes(r.text)), 'never Spanish, never the approximation');
  html = h.press('Volver a la conversación'); assert.ok(!html.includes('POR PARTES')); assert.equal(helped, 1);
});

test('LEARN03 coach UI: A1 and autonomous reveal the approximation only on request; English uses English voices or none', () => {
  for (const mode of ['a1', 'autonomous']) {
    const h = harness(); const { PronunciationCoach } = h.load('src/features/learning/PronunciationCoach.tsx');
    const g = pronunciationFor('Where is the Lantern Theatre?', 'en');
    let html = h.render(React.createElement(PronunciationCoach, { guide: g, text: g.original, language: 'en-GB', mode, onHelp() {} }));
    assert.ok(!html.includes(g.approximate), `${mode}: hidden before request`);
    html = h.press('¿Cómo se pronuncia Where is the Lantern Theatre??');
    assert.ok(html.includes(g.approximate) && html.includes('th sin voz') && html.includes(g.caveat));
    h.press('Escuchar «the Lantern Theatre?»'); assert.equal(h.requests.at(-1).language, 'en-GB');
  }
  const frenchOnly = harness({ voices: [{ identifier: 'fr', language: 'fr-FR', name: 'French' }, { identifier: 'es', language: 'es-MX', name: 'Spanish' }] });
  const { PronunciationCoach } = frenchOnly.load('src/features/learning/PronunciationCoach.tsx');
  const g = pronunciationFor('Thank you!', 'en');
  frenchOnly.render(React.createElement(PronunciationCoach, { guide: g, text: g.original, language: 'en-GB', mode: 'starter', defaultOpen: true, onHelp() {} }));
  for (const c of frenchOnly.controls().filter(c => /^Escuchar/.test(frenchOnly.label(c) ?? ''))) assert.equal(c.disabled, true, 'no Spanish or French substitute for English');
  const none = harness(); const { PronunciationCoach: Coach } = none.load('src/features/learning/PronunciationCoach.tsx');
  const html = none.render(React.createElement(Coach, { guide: null, text: 'Le panneau bleu, puis à gauche.', language: 'fr-FR', mode: 'starter', onHelp() {} }));
  assert.ok(html.includes('todavía no tiene una guía aproximada revisada')); assert.ok(!html.includes('¿Cómo se pronuncia'));
});

test('LEARN03 voice: slow unit playback reaches the driver at the requested rate; a new request stops the previous one', async () => {
  const spoken = []; let stops = 0;
  const driver = { voices: async () => [{ identifier: 'fr', language: 'fr-FR', name: 'French' }, { identifier: 'es', language: 'es-ES', name: 'Spanish' }], stop: async () => { stops++; }, speak: (text, voice, events, rate) => spoken.push({ text, voice, events, rate }) };
  const c = new VoiceController(driver, () => () => {});
  c.configure({ scope: 'coach', muted: false, adultAllowed: false }); await c.refresh();
  const before = stops;
  await c.play({ id: 'unit-1', text: "j'ai rendez-vous", language: 'fr-FR', rate: 0.65 });
  assert.equal(spoken[0].rate, 0.65); assert.equal(spoken[0].voice.language, 'fr-FR');
  spoken[0].events.onStart();
  await c.play({ id: 'unit-2', text: 'ici.', language: 'fr-FR' });
  assert.ok(stops >= before + 2, 'previous speech halted before the next one'); assert.equal(c.snapshot().activeId, 'unit-2');
  spoken[0].events.onDone(); assert.equal(c.snapshot().activeId, 'unit-2', 'stale callback ignored');
  await c.stop(); assert.equal(c.snapshot().activeId, null);
  c.mute(true); await c.play({ id: 'muted', text: 'ici.', language: 'fr-FR' }); assert.equal(spoken.length, 2, 'muted never speaks');
});

test('LEARN03 rescue: exploring every help, audio and practice control never submits; only explicit preparation fills a draft', () => {
  for (const mode of ['starter', 'a1', 'autonomous']) {
    const h = harness({ realVoice: false }); const { LearningRescue } = h.load('src/features/learning/LearningRescue.tsx');
    const ex = rendezvousLesson.variants[0].exercises.find(e => e.id === 'confirm'); const used = [];
    h.render(React.createElement(LearningRescue, { plan: learningRescue('fr', 'rendezvous', ex), mode, language: 'fr-FR', disabled: false, onUse: a => used.push(a), onHelp() {} }));
    const unsafe = new Set(['Preparar esta respuesta con ayuda', 'Usar respuesta construida']);
    const pressed = new Set();
    for (let round = 0; round < 8; round++) {
      const next = h.controls().filter(c => c.onPress && !c.disabled && !unsafe.has(h.label(c)) && !pressed.has(h.label(c)));
      if (!next.length) break;
      for (const c of next) { pressed.add(h.label(c)); c.onPress(); }
      for (const s of h.speech) s.onUse?.('texto que el navegador entendió mal');
      h.render();
    }
    assert.ok(pressed.has('Aprender cómo responder') || mode === 'starter');
    assert.ok([...pressed].some(l => l?.startsWith('¿Cómo se pronuncia')), `${mode}: coach reachable without a previous error`);
    assert.equal(used.length, 0, `${mode}: nothing submitted or drafted implicitly`);
    assert.ok(h.audio.every(a => a.language === 'fr-FR'));
  }
});

test('LEARN03 exercise: opening and closing the coach, or switching mode, keeps the typed draft and never answers', () => {
  const h = harness({ realVoice: false }); const { ExerciseView } = h.load('src/features/learning/ExerciseView.tsx');
  const ex = rendezvousLesson.variants[0].exercises.find(e => e.id === 'confirm'); const answers = [];
  const plan = learningRescue('fr', 'rendezvous', ex);
  const view = mode => React.createElement(ExerciseView, { exercise: ex, feedback: null, saving: false, error: null, conversational: true, language: 'fr', adventure: 'rendezvous', onAnswer: async a => { answers.push(a); return true; }, onContinue: async () => true, rescue: { plan, mode } });
  h.render(view('starter'));
  h.controls().find(c => c.onChangeText).onChangeText('Oui, j’ai rendez');
  let html = h.render();
  html = h.press("¿Cómo se pronuncia Oui, j'ai rendez-vous ici.?"); assert.ok(html.includes('POR PARTES'));
  html = h.press('Volver a la conversación');
  assert.equal(h.controls().find(c => c.onChangeText).value, 'Oui, j’ai rendez');
  html = h.render(view('a1'));
  assert.equal(h.controls().find(c => c.onChangeText).value, 'Oui, j’ai rendez', 'mode change re-keys help only');
  assert.equal(answers.length, 0);
});

test('LEARN03 persistence: coach data is never written into mission progress; saved runs stay compatible', async () => {
  const { MissionRepository } = require('../.test-build/storage/missionRepository');
  const data = new Map(); const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => data.set(k, v) };
  const repo = new MissionRepository(storage, rendezvousLesson); await repo.load();
  let p = await repo.start(() => 0.1, 1);
  while (p.status === 'active') {
    const ex = currentExercise(rendezvousLesson, p); const plan = learningRescue('fr', 'rendezvous', ex);
    p = continueMission(rendezvousLesson, submitAnswer(rendezvousLesson, p, plan.answer, 'assisted'));
    await repo.save(p, 2);
  }
  const stored = [...data.values()].join('\n');
  const values = []; const walk = v => { if (typeof v === 'string') values.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  for (const raw of data.values()) walk(JSON.parse(raw));
  for (const g of pronunciationGuides) for (const a of approximations(g)) assert.ok(!values.includes(a), `not persisted: ${a}`);
  assert.ok(!/"(approximate|pronunciation|ipa|tips|units)"/.test(stored));
  assert.deepEqual(await new MissionRepository(storage, rendezvousLesson).load(), p, 'reload is identical');
  const fresh = beginMission(cafeLesson);
  assert.ok(learningRescue('fr', 'cafe', currentExercise(cafeLesson, fresh)).pronunciation, 'a run saved before LEARN-03 gets guides on reload, with no migration');
});
