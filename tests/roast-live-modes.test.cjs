// RML-002 Roast Me Live: learning modes, natural replies, restart, single Home entry and the comedy
// overhaul. Behavioural tests (domain + the real screen through react-native-web). Humor QUALITY is not
// approved here: it needs human review of real conversations.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const React = require('react');
const { liveLessonFr, liveLessonEn } = require('../.test-build/content/live');
const { liveLibrary } = require('../.test-build/content/liveHumor');
const { liveSettings, validateLiveLibrary, decideKind, ADULT_WORDS, HUMOROUS } = require('../.test-build/domain/humor/live');
const { liveConversation, liveSpeech, liveSummary, restartLiveScene } = require('../.test-build/domain/live/session');
const { beginMission, currentExercise, submitAnswer, continueMission, evaluateAnswer, restoreProgress } = require('../.test-build/domain/learning/engine');
const { interpretAnswer } = require('../.test-build/domain/learning/interpretation');
const { conversationMemory, contextualExercise } = require('../.test-build/domain/conversation/memory');
const { practiceEvidence } = require('../.test-build/domain/learning/evidence');
const { humorDefaults, decodeHumorPreferences } = require('../.test-build/domain/humor/preferences');
const { seededRandom } = require('../.test-build/domain/variety/selection');
const { MissionRepository } = require('../.test-build/storage/missionRepository');
const { LivePreferencesRepository } = require('../.test-build/storage/livePreferencesRepository');
const { screenHarness, memoryStorage, consented } = require('./live-screen-harness.cjs');

const LOCALES = ['es-SV', 'es-MX', 'es-CO', 'es-AR'];
const text = value => ({ kind: 'text', text: value });
const exercise = (lesson, id) => lesson.variants.flatMap(v => v.exercises).find(e => e.id === id);
const read = (lesson, id, value) => interpretAnswer(exercise(lesson, id), text(value)).evaluation;
const play = (lesson, variant, answers, channel) => {
  let p = beginMission(lesson, 0, () => variant);
  for (const a of answers) { p = submitAnswer(lesson, p, text(a), undefined, channel); if (p.feedback.correct) p = continueMission(lesson, p); }
  return p;
};
const coachTurns = view => view.entries.filter(e => e.role === 'coach').map(e => e.turn);
const adultWord = line => ADULT_WORDS.some(word => line.toLocaleLowerCase('es').includes(word));
const strong = settingsPrefs => liveSettings(consented(settingsPrefs));
const seedScene = async (storage, lesson, variant) => { const repo = new MissionRepository(storage, lesson); await repo.load(); await repo.save(beginMission(lesson, 0, () => variant), 1); };
const openScreen = async (options = {}) => {
  const storage = options.storage ?? memoryStorage();
  await seedScene(storage, options.lesson ?? liveLessonFr, options.variant ?? 'cafe-terrasse');
  const h = screenHarness({ ...options, storage });
  const { LiveScreen } = h.load('src/features/live/LiveScreen.tsx');
  h.render(React.createElement(LiveScreen)); await h.settle();
  return h;
};

// 1
test('RML-002 Con ayuda: before any evaluation the student sees what was said, its meaning, the phrase to practise and pronunciation', async () => {
  const h = await openScreen();
  let html = h.render();
  assert.ok(html.includes('Elegí una modalidad para empezar'), 'the mode must be chosen first');
  assert.ok(html.includes('Con ayuda') && html.includes('Con libertad') && html.includes('Hablando (recomendado)') && html.includes('Escribiendo'));
  await h.press('Modalidad Con ayuda');
  await h.press('Empezar conversación');
  html = h.render();
  assert.equal(h.saved('live-fr').events.length, 0, 'nothing evaluated yet');
  for (const part of ['ANTES DE RESPONDER', 'Une table pour vous ?', '¡Hola! ¿Una mesa para usted?', 'Frase para practicar', "Oui, s'il vous plaît.", 'Tu objetivo: Aceptá la mesa con cortesía.']) assert.ok(html.includes(part.replace(/'/g, '&#x27;')), part);
  assert.ok(h.controls().some(c => c.accessibilityLabel === 'Escuchar la frase para practicar' && c.text === "Oui, s'il vous plaît." && c.language === 'fr-FR'), 'button to listen to the model in French');
  assert.equal(h.speech.length, 1, 'the microphone is the main way to answer');
  assert.deepEqual(h.errors.filter(e => e.includes('Unexpected text node')), []);
});

// 2
test('RML-002 Con libertad: the model is not revealed by default, not even after an uninterpretable reply; help stays one tap away', async () => {
  const h = await openScreen();
  await h.press('Modalidad Con libertad'); await h.press('Responder Escribiendo'); await h.press('Empezar conversación');
  let html = h.render();
  assert.ok(!html.includes('Frase para practicar') && !html.includes('ANTES DE RESPONDER'));
  assert.ok(!html.includes('Oui, s&#x27;il vous plaît.'), 'model hidden');
  await h.type('quiero sentarme por favor'); await h.press('Enviar respuesta');
  html = h.render();
  assert.ok(!html.includes('ASÍ SE DICE') && html.includes('La frase modelo está en'), 'unknown reply: explanation without the model');
  assert.equal(h.plays.at(-1).segments.some(s => s.text === "Oui, s'il vous plaît."), false, 'the model is not spoken either');
  await h.press('¿Qué digo? Ver ayuda');
  assert.ok(h.render().includes('Frase para practicar'));
  const progress = h.saved('live-fr');
  assert.equal(progress.events.at(-1).support, 'independent');
  // Domain: real errors still show the correction; unknown/ambiguous/off-context hide it in free mode.
  const p = submitAnswer(liveLessonFr, beginMission(liveLessonFr, 0, () => 'cafe-terrasse'), text('Bonjour, je suis une table.'));
  assert.ok(coachTurns(liveConversation(liveLessonFr, p, 'es-SV', liveSettings(humorDefaults()), liveLibrary, { revealModel: false })).at(-1).teaching.model);
});

// 3
test('RML-002 natural affirmatives: different valid ways of saying yes continue the scene', () => {
  for (const reply of ['Oui', 'Oui, merci', "Oui, s'il vous plaît", 'oui volontiers', 'Ouais, merci beaucoup', "Une table pour deux, s'il vous plaît", 'bien sûr, merci']) {
    const evaluation = read(liveLessonFr, 'cafe-open', reply);
    assert.equal(evaluation.correct, true, reply); assert.equal(evaluation.next, 'cafe-order', reply);
  }
  assert.equal(read(liveLessonFr, 'cafe-open', 'Oui').outcome, 'understood', 'bare "oui" is understood but is not the practised polite form');
  assert.equal(read(liveLessonFr, 'cafe-open', 'Oui').correction, "Oui, s'il vous plaît.");
  assert.equal(read(liveLessonFr, 'cafe-open', 'oui volontiers merci').outcome, 'valid');
  for (const reply of ['Yes', 'yeah sure', 'Yes please', 'Yes, I am lost']) assert.equal(read(liveLessonEn, 'street-open', reply).correct, true, reply);
  for (const reply of ['oui avec plaisir', 'Oui, un peu']) assert.equal(read(liveLessonFr, 'cafe-detail', reply).facts.extra, 'oui', reply);
});

// 4
test('RML-002 coherent negatives are accepted and change the story instead of being rejected', () => {
  const no = read(liveLessonFr, 'cafe-open', 'Non, merci');
  assert.equal(no.correct, true); assert.equal(no.outcome, 'understood'); assert.deepEqual(no.facts, { seat: 'comptoir' }); assert.match(no.reply, /comptoir/);
  let p = submitAnswer(liveLessonFr, beginMission(liveLessonFr, 0, () => 'cafe-terrasse'), text('non merci'));
  p = continueMission(liveLessonFr, p);
  assert.equal(contextualExercise(liveLessonFr, p).prompt, "Au comptoir, très bien. Qu'est-ce que je vous sers ?");
  for (const reply of ["No, I don't", 'No reservation', 'nope'] ) assert.deepEqual(read(liveLessonEn, 'hotel-booking', reply).facts, { booking: 'no' }, reply);
  for (const reply of ['non', 'sans sucre, merci', 'Non merci ça va', 'pas de lait']) assert.deepEqual(read(liveLessonFr, 'cafe-detail', reply).facts, { extra: 'non' }, reply);
  assert.equal(read(liveLessonFr, 'metro-open', 'non merci').reply.includes('perdu'), true, 'Amélie insists kindly when help is refused');
  assert.equal(read(liveLessonEn, 'coffee-open', 'Not great, to be honest').facts.mood, 'tired', 'an honest "not great" is a valid answer');
});

// 5
test('RML-002 quantities and entities are kept for later turns and survive a reload', async () => {
  assert.deepEqual(read(liveLessonFr, 'cafe-open', "Une table pour deux, s'il vous plaît").facts, { guests: 'deux' });
  assert.deepEqual(read(liveLessonFr, 'cafe-open', 'pour 3 personnes svp').facts, { guests: 'trois' });
  assert.deepEqual(read(liveLessonEn, 'hotel-nights', 'for 3 nights').facts, { nights: 'three' });
  assert.deepEqual(read(liveLessonEn, 'hotel-nights', 'a week please').facts, { nights: 'seven' });
  assert.deepEqual(read(liveLessonFr, 'cafe-order', 'un chocolat chaud merci').facts, { drink: 'chocolat' });
  const storage = memoryStorage(); const repo = new MissionRepository(storage, liveLessonFr); await repo.load();
  let p = beginMission(liveLessonFr, 0, () => 'cafe-terrasse');
  p = continueMission(liveLessonFr, submitAnswer(liveLessonFr, p, text('une table pour deux svp'))); await repo.save(p, 1);
  const loaded = await new MissionRepository(storage, liveLessonFr).load();
  assert.equal(conversationMemory(liveLessonFr, loaded).facts.guests.value, 'deux');
  assert.equal(contextualExercise(liveLessonFr, loaded).prompt, "Et pour vous deux, qu'est-ce que je vous sers ?");
  assert.ok(![...storage.data.values()].join('').includes('une table pour deux svp'), 'the free wording is not stored');
  // Stating the destination early is remembered: Amélie does not ask again.
  let q = submitAnswer(liveLessonFr, beginMission(liveLessonFr, 0, () => 'metro-perdu'), text('oui, je cherche la gare'));
  q = continueMission(liveLessonFr, q);
  assert.equal(q.nodeId, 'metro-detail'); assert.match(contextualExercise(liveLessonFr, q).prompt, /La gare \?/);
});

// 6
test('RML-002 negation is never confused with affirmation, and contradictory replies are not guessed', () => {
  for (const reply of ['Non, merci', 'non', 'pas besoin']) assert.notEqual(read(liveLessonFr, 'cafe-open', reply).facts?.seat, undefined, reply);
  assert.equal(read(liveLessonFr, 'cafe-open', 'oui').facts, undefined);
  assert.deepEqual(read(liveLessonEn, 'hotel-booking', 'I have no reservation').facts, { booking: 'no' });
  assert.deepEqual(read(liveLessonEn, 'hotel-booking', 'yes I do').facts, { booking: 'yes' });
  for (const [lesson, id, reply] of [[liveLessonFr, 'cafe-open', 'oui non'], [liveLessonFr, 'cafe-detail', 'oui, sans sucre'], [liveLessonFr, 'cafe-order', 'pas de café'], [liveLessonFr, 'cafe-order', 'un café et un thé'], [liveLessonEn, 'hotel-booking', 'yes no']]) {
    const evaluation = read(lesson, id, reply);
    assert.equal(evaluation.correct, false, reply); assert.equal(evaluation.outcome, 'unrecognized', reply); assert.equal(evaluation.writtenIssue, 'unknown', reply);
  }
});

// 7
test('RML-002 real language errors are recognised, also inside a longer reply ("je suis une table pour deux")', () => {
  const cases = [[liveLessonFr, 'cafe-open', 'bonjour je suis une table pour deux', 'Bonjour, je suis une table.'], [liveLessonFr, 'cafe-order', "Je voudrais un canard s'il vous plaît", 'Je voudrais un canard.'], [liveLessonFr, 'cafe-detail', "non s'il vous plaît", "Non, s'il vous plaît."], [liveLessonEn, 'hotel-booking', 'yes, I have a reserve', 'Yes, I have a reserve.'], [liveLessonEn, 'coffee-place', 'for go please', 'For go, please.'], [liveLessonEn, 'coffee-open', 'I have fine thanks', 'I have fine.']];
  for (const [lesson, id, reply, rule] of cases) {
    const result = interpretAnswer(exercise(lesson, id), text(reply));
    assert.equal(result.evaluation.outcome, 'incorrect', reply); assert.equal(result.retained.text, rule, reply);
    assert.deepEqual(result.evaluation, read(lesson, id, rule), 'diagnosed exactly like the reviewed error (replayable)');
  }
  const settings = strong({ intensity: 'sin-pena', doubleMeaning: false });
  const p = submitAnswer(liveLessonFr, beginMission(liveLessonFr, 0, () => 'cafe-terrasse'), text('bonjour je suis une table pour deux'));
  const turn = coachTurns(liveConversation(liveLessonFr, p, 'es-SV', settings, liveLibrary)).at(-1);
  assert.equal(turn.kind, 'roast'); assert.ok(turn.line.when.inputs.includes('Bonjour, je suis une table.'), 'the roast is about the real error');
});

// 8
test('RML-002 unknown replies never become invented errors or roasts', () => {
  const unknown = ['Oui mais je veux partir maintenant', 'quiero un café', 'je suis végétarien', 'asdf qwer'];
  for (const reply of unknown) {
    const evaluation = read(liveLessonFr, 'cafe-open', reply);
    assert.equal(evaluation.outcome, 'unrecognized', reply); assert.equal(evaluation.writtenIssue, 'unknown');
  }
  for (const locale of LOCALES) for (let run = 0; run < 10; run++) {
    let p = { ...beginMission(liveLessonFr, run, () => 'cafe-terrasse') };
    for (const reply of unknown) p = submitAnswer(liveLessonFr, p, text(reply));
    const turns = coachTurns(liveConversation(liveLessonFr, p, locale, strong({ intensity: 'sin-misericordia', doubleMeaning: true }), liveLibrary));
    assert.ok(turns.every(t => t.kind === 'clarify'), `${locale}: only clarification`);
    assert.equal(practiceEvidence(liveLessonFr, p).confirmedErrors, 0, 'no confirmed error recorded');
  }
});

// 9
test('RML-002 a typed reply that cannot be interpreted is never blamed on the microphone', () => {
  const mic = /micr[óo]fono|dictado|transcrip/i;
  let spokenMentions = 0;
  for (const locale of LOCALES) for (let run = 0; run < 15; run++) for (const settings of [liveSettings(humorDefaults()), strong({ intensity: 'sin-misericordia', doubleMeaning: true })]) {
    const written = { ...submitAnswer(liveLessonEn, beginMission(liveLessonEn, 0, () => 'coffee-shop'), text('blabla something'), undefined, 'written'), run };
    for (const turn of coachTurns(liveConversation(liveLessonEn, written, locale, settings, liveLibrary))) assert.ok(!mic.test(turn.line.text), `${locale}: ${turn.line.text}`);
    const spoken = { ...submitAnswer(liveLessonEn, beginMission(liveLessonEn, 0, () => 'coffee-shop'), text('blabla something'), undefined, 'spoken'), run };
    if (coachTurns(liveConversation(liveLessonEn, spoken, locale, settings, liveLibrary)).some(t => mic.test(t.line.text))) spokenMentions++;
  }
  assert.ok(spokenMentions > 0, 'after dictation the coach may suggest reviewing the transcript');
  const bad = { ...liveLibrary[0], id: 'live-v2:sv:clarify:zz', kind: 'clarify', level: 0, text: 'Ese micrófono no te entendió nada, probá otra vez.', when: undefined };
  assert.throws(() => validateLiveLibrary([...liveLibrary, bad]), /micrófono/);
});

// 10
test('RML-002 ambiguous replies get a clarification in the story, then the scene continues', () => {
  let p = beginMission(liveLessonEn, 0, () => 'hotel-checkin');
  p = continueMission(liveLessonEn, submitAnswer(liveLessonEn, p, text('Good evening!')));
  p = continueMission(liveLessonEn, submitAnswer(liveLessonEn, p, text('Yes, I do.')));
  p = submitAnswer(liveLessonEn, p, text('three'));
  assert.equal(p.feedback.outcome, 'ambiguous'); assert.equal(p.feedback.correct, false);
  const view = liveConversation(liveLessonEn, p, 'es-MX', liveSettings(humorDefaults()), liveLibrary);
  assert.equal(coachTurns(view).at(-1).kind, 'clarify'); assert.match(view.entries.at(-1).text, /nights or people/);
  p = submitAnswer(liveLessonEn, p, text('three nights please'));
  assert.equal(p.feedback.correct, true); assert.equal(p.feedback.facts.nights, 'three');
  assert.equal(read(liveLessonFr, 'metro-ask', 'metro').outcome, 'ambiguous');
  assert.equal(read(liveLessonFr, 'metro-ask', "je cherche le métro s'il vous plaît").outcome, 'valid', 'a full reply is not re-asked');
  assert.equal(read(liveLessonFr, 'metro-ask', 'où est la gare').outcome, 'valid');
});

// 11
test('RML-002 a free valid reply continues coherently, stores only its reviewed interpretation, and replays identically', async () => {
  let p = beginMission(liveLessonEn, 0, () => 'street-directions');
  p = continueMission(liveLessonEn, submitAnswer(liveLessonEn, p, text('yes please')));
  p = submitAnswer(liveLessonEn, p, text('I need to go to the museum please'));
  assert.equal(p.feedback.correct, true); assert.equal(p.feedback.outcome, 'valid'); assert.equal(p.events.at(-1).answer.text, 'I want to go to the museum.');
  p = continueMission(liveLessonEn, p);
  assert.equal(contextualExercise(liveLessonEn, p).prompt, 'Go straight and turn right at the park. OK?');
  assert.deepEqual(restoreProgress(liveLessonEn, JSON.parse(JSON.stringify(p))), p, 'event log replays to the same state');
  const view = liveConversation(liveLessonEn, p, 'es-AR', liveSettings(humorDefaults()), liveLibrary);
  const student = view.entries.filter(e => e.role === 'student').at(-1);
  assert.equal(student.shown, 'interpreted'); assert.equal(student.text, 'I want to go to the museum.');
  // Every understanding rule of every turn replays to itself (validated at load, asserted here for regressions).
  for (const lesson of [liveLessonFr, liveLessonEn]) for (const ex of lesson.variants.flatMap(v => v.exercises)) for (const rule of ex.understanding ?? []) assert.equal(interpretAnswer(ex, text(rule.canonical)).evaluation.understood, rule.id, `${ex.id}/${rule.id}`);
});

// 12 + 13
test('RML-002 spoken vs written: dictation fills an editable draft and counts as spoken; typing never counts as oral practice', async () => {
  const h = await openScreen();
  await h.press('Modalidad Con libertad'); await h.press('Responder Hablando'); await h.press('Empezar conversación');
  assert.equal(h.field(), undefined, 'speaking first: no text box until there is a transcript');
  h.speech[0].onUse('Oui merci beaucoup'); await h.settle();
  assert.equal(h.field().value, 'Oui merci beaucoup', 'transcript lands in an editable draft');
  assert.equal(h.saved('live-fr').events.length, 0, 'dictation never submits by itself');
  await h.type('Oui, merci beaucoup.');
  await h.press('Enviar respuesta');
  let events = h.saved('live-fr').events;
  assert.equal(events.at(-1).channel, 'spoken', 'an edited transcript is still a spoken reply');
  await h.press('Seguir la conversación');
  await h.press('Prefiero escribir esta vez');
  await h.type('Un café, merci.'); await h.press('Enviar respuesta');
  events = h.saved('live-fr').events;
  assert.equal(events.at(-1).channel, 'written');
  const html = h.render();
  assert.ok(html.includes('VOS · HABLADO') && html.includes('VOS · ESCRITO'));
  const summary = liveSummary(liveLessonFr, h.saved('live-fr'));
  assert.equal(summary.spoken, 1); assert.equal(summary.written, 1);
  const typedOnly = play(liveLessonEn, 'coffee-shop', ["I'm good, thanks.", 'A coffee, please.', 'For here, please.', 'Thank you!'], 'written');
  assert.equal(liveSummary(liveLessonEn, typedOnly).spoken, 0, 'written answers record no oral practice');
  assert.throws(() => submitAnswer(liveLessonEn, beginMission(liveLessonEn, 0, () => 'coffee-shop'), text('Hi'), undefined, 'telepathy'), /Canal/);
});

// 14 + 15
test('RML-002 restart: back to the first turn with an empty conversation; coach, preferences, consent and other progress are kept', async () => {
  const storage = memoryStorage();
  await storage.setItem('lingoverse.mission.fr-a1-paris.v1', 'ADVENTURE');
  await storage.setItem('lingoverse.live-voices.v1', JSON.stringify({ version: 1, voices: { 'es-SV': 'raul' } }));
  const h = await openScreen({ storage, humor: consented({ intensity: 'sin-misericordia', doubleMeaning: true }) });
  await h.press('Modalidad Con ayuda'); await h.press('Responder Escribiendo'); await h.press('Empezar conversación');
  await h.type('Je suis une table'); await h.press('Enviar respuesta');
  await h.type("Oui, s'il vous plaît."); await h.press('Enviar respuesta'); await h.press('Seguir la conversación');
  const before = h.saved('live-fr');
  assert.equal(before.events.length, 3);
  await h.press('Reiniciar práctica');
  assert.ok(h.render().includes('Se borran los mensajes'), 'confirmation when progress would be discarded');
  await h.press('Reiniciar esta escena');
  const after = h.saved('live-fr');
  assert.equal(after.events.length, 0); assert.equal(after.variantId, before.variantId); assert.equal(after.run, before.run + 1); assert.equal(after.nodeId, 'cafe-open');
  let html = h.render();
  assert.ok(!html.includes('je suis une table') && html.includes('Une table pour vous ?'), 'messages of the practice are cleared');
  assert.equal(h.humorState.settings.live.intensity, 'sin-misericordia'); assert.equal(require('../.test-build/domain/humor/access').canRoast(h.humorState.settings), true, 'consent kept');
  assert.deepEqual(await new LivePreferencesRepository(storage).load(), { version: 1, mode: 'guided', answer: 'written' });
  assert.equal(await storage.getItem('lingoverse.mission.fr-a1-paris.v1'), 'ADVENTURE');
  assert.equal(JSON.parse(await storage.getItem('lingoverse.live-voices.v1')).voices['es-SV'], 'raul');
  assert.equal(h.preferences.coachLocale, 'es-SV');
  // Back to the mode selection: the old conversation is not resumed; starting again uses the fresh scene.
  await h.type('Oui, merci.'); await h.press('Enviar respuesta');
  await h.press('Reiniciar práctica'); await h.press('Reiniciar y elegir modalidad');
  html = h.render();
  assert.ok(html.includes('Empezar conversación') && !html.includes('ESCENA'));
  await h.press('Modalidad Con libertad'); await h.press('Empezar conversación');
  assert.equal(h.saved('live-fr').events.length, 0); assert.ok(h.render().includes('Con libertad · Escribiendo'));
  const fresh = restartLiveScene(liveLessonFr, before);
  assert.deepEqual([fresh.events, fresh.nodeId, fresh.variantId], [[], 'cafe-open', before.variantId]);
});

// 16
test('RML-002 Home has one main entry, Roast Me Live; classic Roast Me stays reachable without deleting data', () => {
  const home = fs.readFileSync('app/index.tsx', 'utf8');
  assert.equal((home.match(/<LiveInvitation \/>/g) ?? []).length, 1);
  assert.ok(!home.includes('RoastInvitation') && !home.includes("'/roast'"), 'no second Roast Me card on Home');
  const editorial = fs.readFileSync('src/components/Editorial.tsx', 'utf8');
  assert.match(editorial, /router\.push\('\/live'\)/);
  assert.ok(fs.existsSync('app/roast.tsx') && fs.readFileSync('app/explore.tsx', 'utf8').includes('RoastInvitation'), 'classic Roast Me route and its Explore entry remain');
  assert.match(fs.readFileSync('src/features/live/LiveScreen.tsx', 'utf8'), /router\.push\('\/roast'\)/, 'consent flow reachable from Live');
});

// 17
test('RML-002 without consent no adult line appears for any reviewed error, coach or seed', () => {
  const clean = liveSettings(humorDefaults());
  for (const lesson of [liveLessonFr, liveLessonEn]) for (const variant of lesson.variants) for (const ex of variant.exercises) for (const rule of ex.writtenRules ?? []) {
    let p = beginMission(lesson, 0, () => variant.id);
    while (p.nodeId !== ex.id) { const cur = currentExercise(lesson, p); p = continueMission(lesson, submitAnswer(lesson, p, text(cur.accepted[0]))); }
    p = submitAnswer(lesson, p, text(rule.input));
    for (const locale of LOCALES) for (let run = 0; run < 3; run++) for (const turn of coachTurns(liveConversation(lesson, { ...p, run }, locale, clean, liveLibrary))) {
      assert.equal(turn.line.level, 0, turn.line.id); assert.ok(!adultWord(turn.line.text), turn.line.id); assert.equal(turn.adult, false);
    }
  }
});

// 18
test('RML-002 "Sin misericordia" produces clearly stronger language than "Picante" on the same real error', () => {
  const p = submitAnswer(liveLessonFr, play(liveLessonFr, 'cafe-terrasse', ["Oui, s'il vous plaît."]), text('Je voudrais un canard.'));
  for (const locale of LOCALES) {
    const lines = ['picante', 'sin-pena', 'sin-misericordia'].map(intensity => coachTurns(liveConversation(liveLessonFr, p, locale, strong({ intensity, doubleMeaning: false }), liveLibrary)).at(-1).line);
    assert.deepEqual(lines.map(line => line.level), [1, 2, 3], locale);
    assert.ok(lines.every(line => line.when.inputs.includes('Je voudrais un canard.')), `${locale}: every tier is about the duck`);
    const hits = line => ADULT_WORDS.filter(word => line.text.toLocaleLowerCase('es').includes(word)).length;
    assert.ok(hits(lines[2]) >= 2, `${locale}: strong words at the top tier: ${lines[2].text}`);
    assert.ok(hits(lines[2]) > hits(lines[0]), `${locale}: stronger than picante`);
  }
  // Every coach has top-tier reactions for the main reviewed errors.
  for (const locale of LOCALES) for (const input of ['Je voudrais un canard.', 'Bonjour, je suis une table.', 'For go, please.', 'I have fine.', 'De rien !']) assert.ok(liveLibrary.some(l => l.coach === locale && l.level === 3 && l.when?.inputs?.includes(input)), `${locale} ${input}`);
});

// 19
test('RML-002 double meaning needs consent + explicit activation, and only appears where the scene gives a hook', () => {
  const on = strong({ intensity: 'sin-pena', doubleMeaning: true }); const off = strong({ intensity: 'sin-misericordia', doubleMeaning: false });
  let doubles = 0;
  for (let run = 0; run < 40; run++) for (const locale of LOCALES) {
    const p = { ...submitAnswer(liveLessonFr, play(liveLessonFr, 'boulangerie', ['Bonjour !']), text("Une baguette, s'il vous plaît.")), run };
    const turn = coachTurns(liveConversation(liveLessonFr, p, locale, on, liveLibrary)).at(-1);
    if (turn.kind === 'double') { doubles++; assert.equal(turn.line.when.turn, 'pain-order'); }
    assert.notEqual(coachTurns(liveConversation(liveLessonFr, p, locale, off, liveLibrary)).at(-1).kind, 'double');
    assert.notEqual(coachTurns(liveConversation(liveLessonFr, p, locale, liveSettings(humorDefaults()), liveLibrary)).at(-1).kind, 'double');
  }
  assert.ok(doubles > 0);
  assert.throws(() => decodeHumorPreferences(JSON.stringify({ ...humorDefaults(), live: { intensity: 'sin-pena', doubleMeaning: true } })), /consentimiento/);
  for (const line of liveLibrary.filter(l => l.kind === 'double')) { assert.ok(line.level >= 2); assert.ok(line.when.turn); }
  const albures = liveLibrary.filter(l => l.coach === 'es-MX' && l.kind === 'double');
  assert.ok(albures.length >= 4 && albures.every(l => l.when.turn), 'Toño has contextual albures tied to scenes');
});

// 20 + 21
test('RML-002 correct answers can stay plain, and situational jokes appear without any invented error', () => {
  const settings = strong({ intensity: 'sin-pena', doubleMeaning: false });
  const kinds = new Map();
  for (let run = 0; run < 60; run++) for (const locale of LOCALES) {
    const p = { ...submitAnswer(liveLessonFr, play(liveLessonFr, 'cafe-terrasse', ["Oui, s'il vous plaît."]), text("Un café, s'il vous plaît.")), run };
    const turn = coachTurns(liveConversation(liveLessonFr, p, locale, settings, liveLibrary)).at(-1);
    kinds.set(turn.kind, (kinds.get(turn.kind) ?? 0) + 1);
    assert.equal(turn.teaching, undefined, 'no correction for a correct answer');
    assert.notEqual(turn.kind, 'roast');
    if (turn.kind === 'situational') assert.equal(turn.line.when.turn, 'cafe-order');
  }
  assert.ok(kinds.get('normal') > 0, 'plain continuation happens');
  assert.ok(kinds.get('situational') > 0, 'situational jokes happen on correct answers');
  const moment = { lesson: 'live-fr', turn: 'cafe-order', outcome: 'valid', facts: { drink: 'cafe' }, recovered: false, completed: false, previousKinds: ['situational', 'callback'] };
  for (let i = 0; i < 20; i++) assert.equal(decideKind(moment, settings, 'es-SV', seededRandom(i), liveLibrary), 'normal', 'never a third joke in a row');
  assert.equal(decideKind({ ...moment, previousKinds: [] }, liveSettings({ ...humorDefaults(), enabled: false }), 'es-SV', seededRandom(1), liveLibrary), 'normal', 'humor off: plain');
});

// 22
test('RML-002 the four coaches react differently to the same moment and have their own references', () => {
  validateLiveLibrary(liveLibrary);
  const settings = strong({ intensity: 'sin-misericordia', doubleMeaning: true });
  for (const reply of ['Je voudrais un canard.', 'Bonjour, je suis une table.']) {
    const p = submitAnswer(liveLessonFr, beginMission(liveLessonFr, 0, () => 'cafe-terrasse'), text("Oui, s'il vous plaît."));
    const q = reply === 'Bonjour, je suis une table.' ? submitAnswer(liveLessonFr, beginMission(liveLessonFr, 0, () => 'cafe-terrasse'), text(reply)) : submitAnswer(liveLessonFr, continueMission(liveLessonFr, p), text(reply));
    const texts = new Set(LOCALES.map(locale => coachTurns(liveConversation(liveLessonFr, q, locale, settings, liveLibrary)).at(-1).line.text));
    assert.equal(texts.size, 4, reply);
  }
  const own = { 'es-SV': /maje|cerote|vergón|puchica|chivo|cipote|pupusa/i, 'es-MX': /güey|cabrón|chale|órale|no mames|pinche/i, 'es-CO': /\b(parce|mijo|berraquera|gonorrea|chimba|boleta|tinto)\b/i, 'es-AR': /boludo|pelotudo|che\b|bondi|chamuyo|la puta madre|concha de la lora/i };
  for (const locale of LOCALES) {
    const lines = liveLibrary.filter(l => l.coach === locale);
    for (const kind of ['normal', 'light', 'roast', 'double', 'celebration', 'teach', 'clarify', 'callback', 'situational']) assert.ok(lines.some(l => l.kind === kind), `${locale} has ${kind}`);
    assert.ok(lines.filter(l => own[locale].test(l.text)).length >= 20, `${locale} uses its own variety`);
    for (const [other, pattern] of Object.entries(own)) if (other !== locale && other !== 'es-AR' && locale !== 'es-AR') assert.ok(lines.filter(l => pattern.test(l.text)).length <= 2, `${locale} does not borrow ${other} markers`);
  }
  assert.ok(liveLibrary.filter(l => l.coach === 'es-SV').filter(l => /^maje/i.test(l.text)).length <= 2, 'Luz does not open every joke with "maje"');
  assert.ok(!liveLibrary.some(l => /m[áa]s (perdid|despistad)[oa] que/i.test(l.text)), 'no stock "más perdido que…" comparisons');
});

// 23
test('RML-002 adventures and learning modules are untouched: natural understanding is opt-in for Live only', () => {
  const contentFiles = ['cafe', 'london', 'rendezvous', 'beginner', 'roast'];
  for (const name of contentFiles) {
    const mod = require(`../.test-build/content/${name}`);
    for (const lesson of Object.values(mod).filter(v => v && typeof v === 'object' && Array.isArray(v.variants))) {
      for (const ex of lesson.variants.flatMap(v => v.exercises)) { assert.equal(ex.understanding, undefined, `${lesson.id}/${ex.id}`); assert.equal(ex.errorPatterns, undefined); }
    }
  }
  const { cafeLesson } = require('../.test-build/content/cafe');
  if (cafeLesson) { const ex = cafeLesson.variants[0].exercises.find(e => e.kind === 'text'); if (ex) assert.equal(evaluateAnswer(ex, text('oui')).correct, ex.accepted.some(a => a.toLowerCase().replace(/[.!?]/g, '') === 'oui')); }
  assert.equal(liveLessonFr.version, 2); assert.equal(liveLessonEn.version, 2);
});

// 24 (layout in Chrome at 320/390 px is checked by scripts/check-live.mjs; here: controls are reachable without opening panels)
test('RML-002 compact session: restart, settings, send and help are present without opening any panel; old saves are handled honestly', async () => {
  const h = await openScreen();
  await h.press('Modalidad Con libertad'); await h.press('Empezar conversación');
  for (const control of ['Reiniciar práctica', 'Ajustes de Roast Me Live', 'Enviar respuesta', '¿Qué digo? Ver ayuda', 'Prefiero escribir esta vez']) assert.ok(h.find(control), control);
  const html = h.render();
  assert.ok(!html.includes('Picardía y doble sentido') && !html.includes('Probar la voz'), 'settings collapsed during the conversation');
  // A save from RML-001 (content version 1) cannot be replayed: the screen says so and a new scene starts.
  const storage = memoryStorage();
  await seedScene(storage, liveLessonFr, 'cafe-terrasse');
  const raw = JSON.parse(storage.data.get('lingoverse.mission.live-fr.v1')); raw.progress.contentVersion = 1; storage.data.set('lingoverse.mission.live-fr.v1', JSON.stringify(raw));
  const old = screenHarness({ storage }); const { LiveScreen } = old.load('src/features/live/LiveScreen.tsx');
  old.render(React.createElement(LiveScreen)); await old.settle();
  assert.ok(old.render().includes('versión anterior de Roast Me Live'));
  await old.press('Modalidad Con ayuda'); await old.press('Empezar conversación');
  assert.equal(old.saved('live-fr').contentVersion, 2);
  assert.deepEqual([...h.errors, ...old.errors].filter(e => e.includes('Unexpected text node')), []);
});

test('RML-002 speech: models of understood replies use the target voice; laughter is never spoken', () => {
  const settings = strong({ intensity: 'sin-pena', doubleMeaning: false });
  const p = submitAnswer(liveLessonFr, beginMission(liveLessonFr, 0, () => 'cafe-terrasse'), text('oui'));
  const entry = liveConversation(liveLessonFr, p, 'es-CO', settings, liveLibrary).entries.filter(e => e.role === 'coach').at(-1);
  const segments = liveSpeech(entry, 'fr-FR', { language: 'es-MX', voiceId: 'raul' });
  assert.equal(segments.at(-1).text, "Oui, s'il vous plaît."); assert.equal(segments.at(-1).language, 'fr-FR');
  for (const line of liveLibrary) assert.ok(!/ja(ja)+/i.test(line.text) && HUMOROUS.length === 5);
});
