// RML-001 Roast Me Live: scenarios, turn flow, humor decisions, consent tiers, double meaning, variety,
// coach differentiation, voice sequencing/cancellation, persistence and a real react-native-web screen run.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { liveLessonFr, liveLessonEn, liveLessonFor } = require('../.test-build/content/live');
const { liveLibrary } = require('../.test-build/content/liveHumor');
const { liveSettings, selectLiveLine, validateLiveLibrary, ADULT_WORDS } = require('../.test-build/domain/humor/live');
const { liveConversation, liveSpeech } = require('../.test-build/domain/live/session');
const { beginMission, currentExercise, submitAnswer, continueMission } = require('../.test-build/domain/learning/engine');
const { humorDefaults, grantAdultConsent, disableAdult, decodeHumorPreferences } = require('../.test-build/domain/humor/preferences');
const { chooseCoachVoice, rankCoachVoices, genderHint } = require('../.test-build/domain/voice/coachVoices');
const { VoiceController } = require('../.test-build/domain/voice/playback');
const { MissionRepository } = require('../.test-build/storage/missionRepository');
const { LiveVoiceRepository } = require('../.test-build/storage/liveVoiceRepository');
const { seededRandom } = require('../.test-build/domain/variety/selection');
const { normalizeWritten } = require('../.test-build/domain/learning/written');

const LOCALES = ['es-SV', 'es-MX', 'es-CO', 'es-AR'];
const consented = (live) => ({ ...grantAdultConsent(humorDefaults(), { adultConfirmed: true, explicitlyAgreed: true }, 1), ...(live ? { live } : {}) });
const text = value => ({ kind: 'text', text: value });
const play = (lesson, variant, answers) => {
  let p = beginMission(lesson, 0, () => variant);
  for (const a of answers) { p = submitAnswer(lesson, p, text(a)); if (p.feedback.correct) p = continueMission(lesson, p); }
  return p;
};
const coachTurns = view => view.entries.filter(e => e.role === 'coach').map(e => e.turn);
const memoryStorage = () => { const data = new Map(); return { data, getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } }; };

test('RML scenarios: six validated role-plays (FR/EN), each completes all objectives with the expected language', () => {
  for (const lesson of [liveLessonFr, liveLessonEn]) {
    assert.equal(lesson.variants.length, 3); assert.equal(liveLessonFor(lesson.language), lesson);
    for (const variant of lesson.variants) {
      let p = beginMission(lesson, 0, () => variant.id);
      while (p.status === 'active') { const ex = currentExercise(lesson, p); assert.equal(ex.conversation, 'contextual-v1'); p = continueMission(lesson, submitAnswer(lesson, p, text(ex.accepted[0]))); }
      assert.deepEqual(p.completedObjectives, lesson.objectives);
      const view = liveConversation(lesson, p, 'es-SV', liveSettings(humorDefaults()), liveLibrary);
      assert.ok(view.completed); assert.equal(view.current, null);
      for (const entry of view.entries.filter(e => e.role === 'partner')) assert.ok(liveSpeech(entry, lesson.language === 'en' ? 'en-GB' : 'fr-FR', { language: 'es-MX' }).every(s => s.language === (lesson.language === 'en' ? 'en-GB' : 'fr-FR')));
    }
  }
});

test('RML turn flow: setup and partner first, then student, coach, partner reply; waits for an explicit continue', () => {
  let p = beginMission(liveLessonFr, 0, () => 'cafe-terrasse');
  const settings = liveSettings(humorDefaults());
  let view = liveConversation(liveLessonFr, p, 'es-MX', settings, liveLibrary);
  assert.deepEqual(view.entries.map(e => e.role), ['setup', 'partner']); assert.equal(view.awaitingContinue, false);
  p = submitAnswer(liveLessonFr, p, text("Oui, s'il vous plaît."));
  view = liveConversation(liveLessonFr, p, 'es-MX', settings, liveLibrary);
  assert.deepEqual(view.entries.map(e => e.role), ['setup', 'partner', 'student', 'coach', 'partner']);
  assert.equal(view.awaitingContinue, true, 'next partner line only after Continue');
  p = continueMission(liveLessonFr, p);
  view = liveConversation(liveLessonFr, p, 'es-MX', settings, liveLibrary);
  assert.equal(view.entries.at(-1).text, "Qu'est-ce que je vous sers ?");
  assert.ok(coachTurns(view).every(turn => turn.line.coach === 'es-MX'), 'only the chosen coach speaks');
});

test('RML intents and context: the order is remembered, changes the next question and can be called back', () => {
  const settings = liveSettings(consented({ intensity: 'sin-pena', doubleMeaning: false }));
  const p = play(liveLessonFr, 'cafe-terrasse', ["Oui, s'il vous plaît.", "Un thé, s'il vous plaît."]);
  const view = liveConversation(liveLessonFr, p, 'es-SV', settings, liveLibrary);
  assert.equal(view.current.prompt, 'Votre thé, avec du citron ?');
  // Over many seeds the tea fact produces callbacks that mention it, never unrelated facts.
  let callbacks = 0;
  for (let run = 0; run < 30; run++) {
    let q = beginMission(liveLessonFr, run, () => 'cafe-terrasse');
    q = continueMission(liveLessonFr, submitAnswer(liveLessonFr, q, text("Oui, s'il vous plaît.")));
    q = submitAnswer(liveLessonFr, q, text("Un thé, s'il vous plaît."));
    const turn = coachTurns(liveConversation(liveLessonFr, q, 'es-SV', settings, liveLibrary)).at(-1);
    if (turn.kind === 'callback') { callbacks++; assert.equal(turn.line.when.fact.value, 'the'); }
  }
  assert.ok(callbacks > 0, 'callbacks happen');
});

test('RML ambiguous and unknown replies: clarify without humor at the student, no fake error, no stored free text', () => {
  for (const settings of [liveSettings(humorDefaults()), liveSettings(consented({ intensity: 'sin-misericordia', doubleMeaning: true }))]) {
    let p = play(liveLessonFr, 'cafe-terrasse', ["Oui, s'il vous plaît."]);
    p = submitAnswer(liveLessonFr, p, text('Oui.'));
    let view = liveConversation(liveLessonFr, p, 'es-CO', settings, liveLibrary);
    assert.equal(coachTurns(view).at(-1).kind, 'clarify'); assert.match(view.entries.at(-1).text, /mais quoi/);
    p = submitAnswer(liveLessonFr, p, text('quiero un café con mucho amor y dos medialunas'));
    view = liveConversation(liveLessonFr, p, 'es-CO', settings, liveLibrary);
    const turn = coachTurns(view).at(-1);
    assert.equal(turn.kind, 'clarify'); assert.equal(turn.line.level <= 1, true); assert.ok(turn.teaching.model);
    assert.equal(p.events.at(-1).answer.text, '', 'free text is not stored');
    assert.equal(view.entries.filter(e => e.role === 'student').at(-1).verified, false);
  }
});

test('RML corrections: real errors and slips get explanation + model; correct answers often get no joke at all', () => {
  const settings = liveSettings(consented({ intensity: 'sin-pena', doubleMeaning: false }));
  let p = play(liveLessonEn, 'coffee-shop', ["I'm good, thanks.", 'A coffee, please.']);
  p = submitAnswer(liveLessonEn, p, text('For go, please.'));
  let turn = coachTurns(liveConversation(liveLessonEn, p, 'es-AR', settings, liveLibrary)).at(-1);
  assert.equal(turn.kind, 'roast'); assert.match(turn.teaching.explanation, /To go/); assert.equal(turn.teaching.model, 'For here, please.');
  p = submitAnswer(liveLessonEn, p, text('Take away, please.'));
  turn = coachTurns(liveConversation(liveLessonEn, p, 'es-AR', settings, liveLibrary)).at(-1);
  assert.equal(turn.teaching.model, 'Takeaway, please.', 'better form taught for a minor slip');
  const plain = play(liveLessonEn, 'hotel-checkin', ['Good evening!', 'Yes, I do.', 'Two nights, please.', 'Thank you!']);
  const kinds = coachTurns(liveConversation(liveLessonEn, plain, 'es-MX', settings, liveLibrary)).map(t => t.kind);
  assert.ok(kinds.filter(k => k === 'normal').length >= 2, `plain correct turns stay plain: ${kinds}`);
  const noHumor = liveSettings({ ...humorDefaults(), enabled: false });
  const clean = play(liveLessonFr, 'cafe-terrasse', ['Bonjour, je suis une table.', "Oui, s'il vous plaît.", 'Je voudrais un canard.']);
  assert.ok(coachTurns(liveConversation(liveLessonFr, clean, 'es-SV', noHumor, liveLibrary)).every(t => ['normal', 'teach', 'clarify', 'celebration'].includes(t.kind)), 'humor off means teaching only');
});

// RML-002 changed the rule on purpose (user QA): a correct answer may get a joke, but humor is rationed —
// never three humorous replies in a row, correct answers often stay plain, and never a roast without an error.
test('RML contextual humor: the same real error gets each coach\'s own line; humor on correct answers is rationed', () => {
  const settings = liveSettings(consented({ intensity: 'sin-pena', doubleMeaning: false }));
  const texts = new Set();
  for (const locale of LOCALES) {
    let p = play(liveLessonFr, 'cafe-terrasse', ["Oui, s'il vous plaît."]);
    p = submitAnswer(liveLessonFr, p, text('Je voudrais un canard.'));
    const turn = coachTurns(liveConversation(liveLessonFr, p, locale, settings, liveLibrary)).at(-1);
    assert.equal(turn.kind, 'roast'); assert.ok(turn.line.when.inputs.includes('Je voudrais un canard.'), `${locale}: joke is about the actual error`);
    texts.add(turn.line.text);
  }
  assert.equal(texts.size, 4);
  const humorous = ['light', 'roast', 'double', 'callback', 'situational'];
  let plain = 0, jokes = 0;
  for (let run = 0; run < 25; run++) for (const variant of liveLessonEn.variants) {
    let p = beginMission(liveLessonEn, run, () => variant.id);
    while (p.status === 'active') { const ex = currentExercise(liveLessonEn, p); p = continueMission(liveLessonEn, submitAnswer(liveLessonEn, p, text(ex.intents?.[0]?.examples[0] ?? ex.accepted[0]))); }
    const kinds = coachTurns(liveConversation(liveLessonEn, p, 'es-SV', liveSettings(consented({ intensity: 'sin-misericordia', doubleMeaning: true })), liveLibrary)).map(t => t.kind);
    for (let i = 2; i < kinds.length; i++) assert.ok(!(humorous.includes(kinds[i]) && humorous.includes(kinds[i - 1]) && humorous.includes(kinds[i - 2])), `never three jokes in a row: ${kinds}`);
    assert.ok(!kinds.includes('roast'), 'no roast without a real error');
    plain += kinds.filter(k => k === 'normal').length; jokes += kinds.filter(k => humorous.includes(k)).length;
  }
  assert.ok(plain > jokes, `correct answers mostly stay plain (${plain} plain vs ${jokes} jokes)`);
});

test('RML variety: within one session lines do not repeat while unused matching lines remain; seeds are reproducible', () => {
  const settings = liveSettings(consented({ intensity: 'sin-misericordia', doubleMeaning: false }));
  const moment = { lesson: 'live-fr', turn: 'cafe-order', outcome: 'incorrect', issue: 'vocabulary', input: 'Je voudrais un canard.', facts: {}, recovered: false, completed: false, previousKinds: [] };
  const used = new Set(); const seen = [];
  const pool = liveLibrary.filter(l => l.coach === 'es-SV' && ['roast'].includes(l.kind) && l.level <= 3 && (!l.when?.inputs || l.when.inputs.includes('Je voudrais un canard.')) && !l.when?.turn);
  for (let i = 0; i < pool.length; i++) { const line = selectLiveLine('roast', moment, 'es-SV', settings, used, seededRandom(i), liveLibrary); assert.ok(!used.has(line.id), `repeat after ${i}`); used.add(line.id); seen.push(line.id); }
  // RML-002 rewrote the catalogue (ids live-v2): the most contextual line at the highest allowed level comes first.
  assert.equal(seen[0], 'live-v2:sv:roast:pato3', 'most contextual line first');
  const a = liveConversation(liveLessonFr, play(liveLessonFr, 'metro-perdu', ["Oui, s'il vous plaît.", 'Je suis le métro.']), 'es-MX', settings, liveLibrary);
  const b = liveConversation(liveLessonFr, play(liveLessonFr, 'metro-perdu', ["Oui, s'il vous plaît.", 'Je suis le métro.']), 'es-MX', settings, liveLibrary);
  assert.deepEqual(a, b, 'reproducible');
});

test('RML library: valid, distinct per coach (not the same joke with a regional word swapped), clean level 0', () => {
  validateLiveLibrary(liveLibrary);
  const markers = /\b(maje|cerote|güey|guey|cabrón|parce|mijo|boludo|che|vos|usted|pues|neta|chale|puchica|órale|joya|eh)\b/gi;
  const skeleton = line => normalizeWritten(line.text.replace(markers, '')).replace(/\s+/g, ' ');
  for (const [i, a] of liveLibrary.entries()) for (const b of liveLibrary.slice(i + 1)) if (a.coach !== b.coach) assert.notEqual(skeleton(a), skeleton(b), `${a.id} vs ${b.id}`);
  for (const line of liveLibrary.filter(l => l.level === 0)) assert.ok(!ADULT_WORDS.some(w => line.text.toLocaleLowerCase('es').includes(w)), line.id);
  for (const locale of LOCALES) for (const kind of ['normal', 'light', 'roast', 'double', 'celebration', 'teach', 'clarify', 'callback']) assert.ok(liveLibrary.some(l => l.coach === locale && l.kind === kind), `${locale} has ${kind}`);
  assert.throws(() => validateLiveLibrary([...liveLibrary, { ...liveLibrary[0], id: 'live-v1:sv:normal:zz', text: 'Jajaja, qué bueno que lo dijiste así.' }]), /risa/);
  assert.throws(() => validateLiveLibrary([...liveLibrary, { ...liveLibrary[0], id: 'live-v1:sv:normal:zy', text: 'Qué cabrón tan bien hablado eres.', level: 0 }]), /nivel 0/);
});

test('RML consent and intensity: no adult line without consent; tiers cap the level; revocation resets Live settings', () => {
  const p = play(liveLessonFr, 'boulangerie', ['Bonsoir !']);
  for (const [settings, max] of [[liveSettings(humorDefaults()), 0], [liveSettings(consented({ intensity: 'picante', doubleMeaning: false })), 1], [liveSettings(consented({ intensity: 'sin-pena', doubleMeaning: false })), 2], [liveSettings(consented({ intensity: 'sin-misericordia', doubleMeaning: false })), 3]]) {
    assert.equal(settings.maxLevel, max);
    for (let run = 0; run < 10; run++) for (const locale of LOCALES) {
      const view = liveConversation(liveLessonFr, { ...p, run }, locale, settings, liveLibrary);
      for (const turn of coachTurns(view)) { assert.ok(turn.line.level <= max); assert.equal(turn.adult, turn.line.level > 0); }
    }
  }
  const prefs = consented({ intensity: 'sin-misericordia', doubleMeaning: true });
  assert.deepEqual(decodeHumorPreferences(JSON.stringify(prefs)).live, { intensity: 'sin-misericordia', doubleMeaning: true });
  const revoked = disableAdult(prefs);
  assert.deepEqual(revoked.live, { intensity: 'picante', doubleMeaning: false }); assert.deepEqual(liveSettings(revoked), { humor: true, maxLevel: 0, doubleMeaning: false });
  assert.throws(() => decodeHumorPreferences(JSON.stringify({ ...humorDefaults(), live: { intensity: 'picante', doubleMeaning: true } })), /consentimiento/);
  assert.deepEqual(decodeHumorPreferences(JSON.stringify(humorDefaults())), humorDefaults(), 'older saved preferences stay valid');
  assert.equal(liveSettings({ ...humorDefaults(), live: { intensity: 'sin-misericordia', doubleMeaning: false } }).maxLevel, 0, 'a tier without consent unlocks nothing');
});

test('RML double meaning: only with consent + explicit opt-in, and only where the scene offers it', () => {
  const on = liveSettings(consented({ intensity: 'sin-pena', doubleMeaning: true }));
  const off = liveSettings(consented({ intensity: 'sin-pena', doubleMeaning: false }));
  let doubles = 0;
  for (let run = 0; run < 40; run++) for (const locale of LOCALES) {
    let p = play(liveLessonFr, 'boulangerie', ['Bonjour !']);
    p = { ...submitAnswer(liveLessonFr, p, text("Une baguette, s'il vous plaît.")), run };
    const turnOn = coachTurns(liveConversation(liveLessonFr, p, locale, on, liveLibrary)).at(-1);
    if (turnOn.kind === 'double') { doubles++; assert.equal(turnOn.line.when.turn, 'pain-order'); }
    assert.notEqual(coachTurns(liveConversation(liveLessonFr, p, locale, off, liveLibrary)).at(-1).kind, 'double');
  }
  assert.ok(doubles > 0, 'opt-in produces contextual double meaning');
  for (let run = 0; run < 20; run++) {
    const p = { ...play(liveLessonEn, 'street-directions', ["Yes, please. I'm lost."]), run };
    assert.ok(coachTurns(liveConversation(liveLessonEn, p, 'es-MX', on, liveLibrary)).every(t => t.kind !== 'double'), 'no double meaning without a scene hook');
  }
});

test('RML speech: Spanish coach voice for comments, target voice for «» phrases and models, laughter never spoken', () => {
  const settings = liveSettings(consented({ intensity: 'sin-pena', doubleMeaning: false }));
  let p = play(liveLessonEn, 'coffee-shop', ["I'm good, thanks.", 'A coffee, please.']);
  p = submitAnswer(liveLessonEn, p, text('For go, please.'));
  const entry = liveConversation(liveLessonEn, p, 'es-MX', settings, liveLibrary).entries.filter(e => e.role === 'coach').at(-1);
  const segments = liveSpeech(entry, 'en-GB', { language: 'es-MX', voiceId: 'raul' });
  assert.ok(segments.some(s => s.text === 'For go' && s.language === 'en-GB'), 'quoted English goes to the English voice');
  assert.equal(segments.at(-1).text, 'For here, please.'); assert.equal(segments.at(-1).language, 'en-GB');
  for (const s of segments.filter(s => s.language === 'es-MX')) { assert.equal(s.voiceId, 'raul'); assert.equal(s.adult, true); assert.ok(!/[«»]/.test(s.text)); }
  for (const line of liveLibrary) assert.ok(!/ja(ja)+/i.test(line.text));
});

test('RML voices: Spanish voices ranked by region then probable male; choice persisted; honest notices', async () => {
  const voices = [
    { identifier: 'sabina', language: 'es-MX', name: 'Microsoft Sabina - Spanish (Mexico)', local: true },
    { identifier: 'raul', language: 'es-MX', name: 'Microsoft Raul - Spanish (Mexico)', local: true },
    { identifier: 'pablo', language: 'es-ES', name: 'Microsoft Pablo - Spanish (Spain)', local: true },
    { identifier: 'rodrigo', language: 'es-SV', name: 'Microsoft Rodrigo Online (Natural) - Spanish (El Salvador)', local: false },
    { identifier: 'fr', language: 'fr-FR', name: 'Microsoft Paul - French', local: true },
  ];
  assert.equal(genderHint(voices[1]), 'male'); assert.equal(genderHint(voices[0]), 'female'); assert.equal(genderHint({ name: 'Google español', language: 'es-ES' }), 'female');
  assert.deepEqual(rankCoachVoices(voices, 'es-SV', false).map(r => r.voice.identifier), ['raul', 'sabina', 'pablo'], 'no network voice without permission; never a French voice');
  assert.equal(chooseCoachVoice(voices, 'es-SV', true).voice.identifier, 'rodrigo', 'exact region when allowed');
  const local = chooseCoachVoice(voices, 'es-SV', false);
  assert.equal(local.voice.identifier, 'raul'); assert.match(local.notice, /No hay voz de El Salvador/); assert.match(local.notice, /no garantiza el acento/);
  assert.equal(chooseCoachVoice(voices, 'es-AR', false, 'sabina').voice.identifier, 'sabina', 'the user\'s choice wins');
  assert.match(chooseCoachVoice([voices[0]], 'es-MX', false).notice, /voz femenina/);
  assert.equal(chooseCoachVoice([voices[4]], 'es-MX', false).voice, null);
  const storage = memoryStorage(); const repo = new LiveVoiceRepository(storage);
  const saved = await repo.choose(await repo.load(), 'es-SV', 'raul');
  assert.deepEqual(await new LiveVoiceRepository(storage).load(), saved);
  await storage.setItem('lingoverse.live-voices.v1', '{broken'); assert.deepEqual((await repo.load()).voices, {});
});

test('RML audio: one sequence at a time; stop, revocation, navigation and failures cancel cleanly; stale callbacks ignored', async () => {
  const spoken = []; let stops = 0, failNext = false;
  const voices = [{ identifier: 'raul', language: 'es-MX', name: 'Raul' }, { identifier: 'fr', language: 'fr-FR', name: 'French' }];
  const driver = { voices: async () => voices, stop: async () => { stops++; }, speak: (t, voice, events) => { if (failNext) throw Error('boom'); spoken.push({ t, voice: voice.identifier, events }); } };
  const c = new VoiceController(driver, () => () => {});
  c.configure({ scope: 'live', muted: false, adultAllowed: true }); await c.refresh();
  await c.playSequence('live:1', [{ text: '¡No jodás!', language: 'es-MX', voiceId: 'raul', adult: true }, { text: 'Un café', language: 'fr-FR' }]);
  assert.deepEqual(spoken.map(s => [s.t, s.voice]), [['¡No jodás!', 'raul']], 'segments are sequential');
  spoken[0].events.onStart(); spoken[0].events.onDone();
  assert.deepEqual(spoken.map(s => s.voice), ['raul', 'fr']);
  await c.playSequence('live:2', [{ text: 'Otra', language: 'es-MX' }]);
  spoken[1].events.onDone(); assert.equal(spoken.length, 3, 'old sequence cannot continue after a new one starts');
  await c.playSequence('live:3', [{ text: 'Roast', language: 'es-MX', adult: true }, { text: 'Merci', language: 'fr-FR' }]);
  c.restrict(); await new Promise(r => setTimeout(r, 0));
  spoken.at(-1).events.onDone(); assert.equal(spoken.at(-1).t, 'Roast', 'revocation stops the sequence; no next segment');
  assert.equal(c.snapshot().activeId, null);
  await c.playSequence('live:4', [{ text: 'adulto', language: 'es-MX', adult: true }]); assert.equal(spoken.at(-1).t, 'Roast', 'adult audio blocked after revocation');
  c.configure({ scope: 'live', muted: false, adultAllowed: true });
  await c.playSequence('live:5', [{ text: 'Uno', language: 'es-MX' }, { text: 'Deux', language: 'fr-FR' }]);
  c.configure({ scope: 'other-route', muted: false, adultAllowed: true }); await new Promise(r => setTimeout(r, 0));
  spoken.at(-1).events.onDone(); assert.equal(spoken.at(-1).t, 'Uno', 'navigation (new scope) cancels');
  const before = spoken.length;
  await c.playSequence('live:6', [{ text: 'Hola', language: 'es-MX' }, { text: 'Hello', language: 'en-GB' }]);
  assert.equal(spoken.length, before, 'missing target voice: nothing spoken, no partial overlap'); assert.match(c.snapshot().error, /No hay una voz compatible/);
  failNext = true; await c.playSequence('live:7', [{ text: 'Hola', language: 'es-MX' }]); failNext = false;
  assert.equal(c.snapshot().status, 'error'); assert.ok(stops > 0);
  await c.playSequence('live:8', [{ text: 'Hola', language: 'es-MX', voiceId: 'fr' }]);
  assert.equal(spoken.at(-1).voice, 'raul', 'a preferred voice of another language is never used');
});

test('RML persistence: sessions resume identically from the mission repository, store no free text, and restarts pick a new scenario', async () => {
  const storage = memoryStorage();
  const repo = new MissionRepository(storage, liveLessonFr); await repo.load();
  let p = await repo.start(seededRandom(3), 1);
  const ex = currentExercise(liveLessonFr, p);
  p = submitAnswer(liveLessonFr, p, text('mi texto privado que no debe guardarse')); await repo.save(p, 2);
  p = continueMission(liveLessonFr, submitAnswer(liveLessonFr, p, text(ex.accepted[0]))); await repo.save(p, 3);
  const loaded = await new MissionRepository(storage, liveLessonFr).load();
  const settings = liveSettings(consented({ intensity: 'sin-pena', doubleMeaning: false }));
  assert.deepEqual(liveConversation(liveLessonFr, loaded, 'es-AR', settings, liveLibrary), liveConversation(liveLessonFr, p, 'es-AR', settings, liveLibrary));
  assert.ok(![...storage.data.values()].join('').includes('privado'));
  const variants = new Set([p.variantId]);
  for (let i = 0; i < 4; i++) variants.add((await repo.start(seededRandom(10 + i), 10 + i)).variantId);
  assert.ok(variants.size >= 2, 'variety engine rotates scenarios');
  assert.equal(storage.data.has('lingoverse.mission.live-fr.v1'), true);
  assert.ok([...storage.data.keys()].every(k => !k.includes('fr-a1-paris')), 'adventure progress untouched');
});

test('RML pronunciation coach: models in the help panel reuse reviewed guides where they exist', () => {
  const { pronunciationFor } = require('../.test-build/content/pronunciation');
  const models = [liveLessonFr, liveLessonEn].flatMap(l => l.variants.flatMap(v => v.exercises.map(e => [l.language, e.correction.split(' / ')[0].trim()])));
  const guided = models.filter(([lang, m]) => pronunciationFor(m, lang));
  assert.ok(guided.length >= 5, `${guided.length} live models have a reviewed guide`);
  for (const [lang, model] of guided) assert.equal(pronunciationFor(model, lang).language, lang);
});

// ——— Real screen with react-native-web (dev checks on); harness shared with RML-002 ———
const { screenHarness } = require('./live-screen-harness.cjs');

test('RML screen: start, dictate (editable, never auto-sent), type, send explicitly; audio in sequence; no invalid RNW text nodes', async () => {
  const h = screenHarness(); const { LiveScreen } = h.load('src/features/live/LiveScreen.tsx');
  h.render(React.createElement(LiveScreen)); await h.settle();
  let html = h.render();
  // RML-002: a learning mode must be chosen before starting.
  assert.ok(html.includes('Elegí una modalidad para empezar') && html.includes('no es una IA de charla libre'));
  await h.press('Modalidad Con ayuda');
  await h.press('Empezar conversación');
  html = h.render();
  assert.ok(html.includes('ESCENA')); assert.equal(h.plays.length, 1);
  assert.ok(h.plays[0].segments.some(s => s.language === 'fr-FR') && h.plays[0].segments.some(s => s.language === 'es-MX' && s.voiceId === 'raul'));
  const saved = () => JSON.parse([...h.storage.data.entries()].find(([k]) => k.includes('live-fr'))[1]).progress.events.length;
  const before = saved();
  h.speech[0].onUse('Bonjour, je suis une table');
  h.render();
  assert.equal(h.controls().find(c => c.onChangeText).value, 'Bonjour, je suis une table', 'transcript lands in the editable draft');
  assert.equal(saved(), before, 'dictation never submits by itself');
  h.controls().find(c => c.onChangeText).onChangeText('Bonjour, je suis une table.'); h.render();
  await h.press('Enviar respuesta');
  html = h.render();
  assert.equal(saved(), before + 1);
  const last = h.plays.at(-1).segments;
  assert.ok(last.some(s => s.adult) && last.at(-1).language === 'fr-FR', 'adult coach line then the French model');
  assert.ok(html.includes('ASÍ SE DICE'));
  assert.equal(h.controls().find(c => c.onChangeText).value, 'Bonjour, je suis une table.', 'draft kept after an error for editing');
  // RML-002 "Con ayuda": the help (meaning, model, pronunciation) is visible before answering, without a toggle.
  html = h.render();
  assert.ok(html.includes('ANTES DE RESPONDER') && html.includes('Frase para practicar'));
  await h.press('Prefiero escribir esta vez');
  assert.ok(h.render().includes('Usar esta frase en mi borrador'));
  assert.deepEqual(h.errors.filter(e => e.includes('Unexpected text node')), []);
});
