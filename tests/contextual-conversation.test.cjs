// LV-007B Contextual Conversation Engine: interpretation outcomes, memory, continuity, consequences,
// persistence/compatibility and regressions across the three adventures (FR + EN).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cafeLesson, cafeLessonV2, cafeLessonForProgress } = require('../.test-build/content/cafe');
const { londonLesson, londonLessonV4, londonLessonForProgress } = require('../.test-build/content/london');
const { rendezvousLesson, rendezvousLessonV1, rendezvousLessonForProgress } = require('../.test-build/content/rendezvous');
const { beginMission, currentExercise, submitAnswer, continueMission, evaluateAnswer, restoreProgress } = require('../.test-build/domain/learning/engine');
const { validateLesson, transitions } = require('../.test-build/domain/learning/validation');
const { conversationMemory, contextualExercise } = require('../.test-build/domain/conversation/memory');
const { conversationPresentation, verifiedWrittenText } = require('../.test-build/domain/conversation/presentation');
const { practiceEvidence } = require('../.test-build/domain/learning/evidence');
const { humorContext } = require('../.test-build/domain/humor/context');
const { emptyHistory } = require('../.test-build/domain/variety/history');
const { assertDistinctConversations } = require('../.test-build/domain/learning/conversation');
const { lessonCandidates } = require('../.test-build/domain/learning/variety');
const { inspectTranscript } = require('../.test-build/domain/voice/transcriptReview');
const { learningRescue } = require('../.test-build/content/rescue');
const { MissionRepository } = require('../.test-build/storage/missionRepository');

const text = value => ({ kind: 'text', text: value });
const choice = id => ({ kind: 'choice', choiceId: id });
const start = (lesson, variantId) => beginMission(lesson, 0, () => variantId);
const step = (lesson, p, answer) => { const next = submitAnswer(lesson, p, answer); return next.feedback.correct ? continueMission(lesson, next) : next; };
const storage = () => { const data = new Map(); return { data, getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } }; };
const station = p => { p = step(londonLesson, p, choice('hello')); return step(londonLesson, p, text("I'm new here.")); };

test('LV-007B interpretation: valid intent states the destination, is remembered and the guide never asks for it again', () => {
  for (const [variant, reply, input] of [['station-arrival', /Blue Door Hostel/, "I'm looking for the hostel."], ['riverside-rain', /Lantern Theatre/, 'Could you help me find the theatre?']]) {
    let p = station(start(londonLesson, variant));
    assert.equal(p.nodeId, 'help');
    p = submitAnswer(londonLesson, p, text(input));
    assert.equal(p.feedback.outcome, 'valid'); assert.equal(p.feedback.intentId, 'state-destination');
    assert.match(p.feedback.reply, reply, 'the character reacts to the stated destination');
    assert.equal(p.feedback.next, 'choose-path');
    assert.equal(conversationMemory(londonLesson, p).facts.destination.status, 'confirmed');
    p = continueMission(londonLesson, p);
    assert.equal(p.nodeId, 'choose-path', 'no second "Where do you need to go?"');
    assert.deepEqual(p.completedObjectives, ['greet', 'introduce', 'ask-help', 'ask-where'], 'stating the destination demonstrates ask-where honestly');
  }
  // French: confirming the meeting place early skips the turn that would ask for it.
  let r = step(rendezvousLesson, start(rendezvousLesson, 'jardin-bleu'), choice('greeting'));
  r = submitAnswer(rendezvousLesson, r, text("J'ai rendez-vous à la fontaine."));
  assert.equal(r.feedback.outcome, 'valid'); assert.match(r.feedback.reply, /fontaine Médicis/);
  r = continueMission(rendezvousLesson, r);
  assert.equal(r.nodeId, 'ask');
  assert.equal(contextualExercise(rendezvousLesson, r).prompt, 'Dites-moi ce que vous voulez savoir.', 'the contact does not repeat "Je connais bien cet endroit"');
});

test('LV-007B interpretation: different meanings, keywords and unexpected input are not accepted and never advance', () => {
  let p = station(start(londonLesson, 'station-arrival'));
  for (const [input, outcome] of [["I'm looking for the theatre.", 'off-context'], ["I'm looking for the station.", 'off-context'], ['Goodbye!', 'off-context'], ["I don't need help.", 'incorrect'], ['hostel hostel looking', 'unrecognized'], ['I am looking for my lost cat near the hostel.', 'unrecognized']]) {
    const next = submitAnswer(londonLesson, p, text(input));
    assert.equal(next.feedback.outcome, outcome, input); assert.equal(next.feedback.correct, false); assert.equal(next.feedback.next, null);
    assert.equal(next.feedback.reply, ''); assert.throws(() => continueMission(londonLesson, next), /Primero/);
    assert.equal(conversationMemory(londonLesson, next).facts.destination, undefined, `${input} confirms nothing`);
    if (outcome === 'unrecognized') assert.equal(next.events.at(-1).answer.text, '', 'free text is not stored');
  }
  let r = step(rendezvousLesson, start(rendezvousLesson, 'jardin-bleu'), choice('greeting'));
  r = step(rendezvousLesson, r, text("Oui, j'ai rendez-vous ici."));
  r = step(rendezvousLesson, r, choice('meeting-point')); r = step(rendezvousLesson, r, text('Où est la fontaine ?'));
  r = step(rendezvousLesson, r, choice('near')); r = step(rendezvousLesson, r, choice('route-a'));
  const wrong = submitAnswer(rendezvousLesson, r, text('Je vais tout droite ?'));
  assert.equal(wrong.feedback.outcome, 'incorrect'); assert.equal(wrong.feedback.writtenIssue, 'vocabulary'); assert.match(wrong.feedback.explanation, /derecha/);
});

test('LV-007B ambiguity: a one-word reply gets a natural clarification, is remembered as ambiguous and acknowledged later', () => {
  let p = station(start(londonLesson, 'station-arrival'));
  p = submitAnswer(londonLesson, p, text('The hostel.'));
  assert.equal(p.feedback.outcome, 'ambiguous'); assert.equal(p.feedback.correct, false); assert.equal(p.feedback.writtenIssue, 'unknown');
  assert.match(p.feedback.reply, /^The hostel\? Sure/, 'clarification is an in-story line');
  assert.equal(conversationMemory(londonLesson, p).facts.destination.status, 'ambiguous');
  assert.equal(contextualExercise(londonLesson, p).prompt, 'What do you need?', 'the prompt does not change mid-turn');
  p = step(londonLesson, p, text('I need help.'));
  assert.equal(p.nodeId, 'where');
  assert.equal(contextualExercise(londonLesson, p).prompt, 'You said the hostel, right? Ask me where it is.', 'the guide acknowledges the earlier mention instead of asking from scratch');
  p = submitAnswer(londonLesson, p, text('Where is the hostel?'));
  assert.equal(conversationMemory(londonLesson, p).facts.destination.status, 'confirmed', 'a valid transition confirms the ambiguity');
  // Confirmed facts are never downgraded by a later ambiguous reply.
  const { rememberFeedback, emptyMemory } = require('../.test-build/domain/conversation/memory');
  const confirmed = rememberFeedback(emptyMemory(), 'where', { correct: true, facts: { destination: 'hostel' }, factStatus: 'confirmed' }, text('x'));
  const later = rememberFeedback(confirmed, 'other', { correct: false, facts: { destination: 'theatre' }, factStatus: 'ambiguous' }, text('y'));
  assert.deepEqual(later.facts.destination, { value: 'hostel', status: 'confirmed', nodeId: 'where' });
  let r = step(rendezvousLesson, start(rendezvousLesson, 'quai-des-cartes'), choice('greeting'));
  r = submitAnswer(rendezvousLesson, r, text('Le kiosque.'));
  assert.equal(r.feedback.outcome, 'ambiguous'); assert.match(r.feedback.reply, /Vous avez rendez-vous là-bas/);
  r = step(rendezvousLesson, r, text("Oui, j'ai rendez-vous."));
  assert.equal(contextualExercise(rendezvousLesson, r).prompt, 'Vous avez parlé du kiosque. Votre ami vous attend où, exactement ?', 'contact asks to confirm only because it was ambiguous');
  r = step(rendezvousLesson, r, choice('meeting-point'));
  assert.equal(conversationMemory(rendezvousLesson, r).facts['meeting-point'].status, 'confirmed');
});

test('LV-007B minor errors: the intent counts, the story continues and the better form is taught (not a confirmed error)', () => {
  let p = station(start(londonLesson, 'riverside-rain'));
  p = submitAnswer(londonLesson, p, text('I looking for the theatre.'));
  assert.equal(p.feedback.outcome, 'valid-minor'); assert.equal(p.feedback.correct, true); assert.equal(p.feedback.minorIssue, 'structure');
  assert.equal(p.feedback.correction, "I'm looking for the theatre."); assert.equal(p.feedback.next, 'choose-path', 'routes like the intent it expresses');
  assert.equal(p.feedback.writtenIssue, undefined);
  const exercise = currentExercise(londonLesson, p);
  assert.equal(verifiedWrittenText(exercise, p.events.at(-1).answer), "I'm looking for the theatre.", 'transcript shows the improved form');
  p = continueMission(londonLesson, p);
  assert.equal(practiceEvidence(londonLesson, p).confirmedErrors, 0);
  const ca = submitAnswer(cafeLesson, start(cafeLesson, 'matin-lucie'), choice('bonjour-simple'));
  assert.equal(ca.feedback.outcome, 'valid');
  let fr = step(rendezvousLesson, start(rendezvousLesson, 'jardin-bleu'), choice('greeting'));
  fr = submitAnswer(rendezvousLesson, fr, text('Oui, je ai rendez-vous ici.'));
  assert.equal(fr.feedback.outcome, 'valid-minor'); assert.match(fr.feedback.explanation, /j'ai/);
});

test('LV-007B errors: incorrect replies are confirmed errors; ambiguous and off-context replies never are and never feed Roast', () => {
  let p = station(start(londonLesson, 'station-arrival'));
  p = submitAnswer(londonLesson, p, text("I don't need help."));
  p = submitAnswer(londonLesson, p, text('The hostel.'));
  p = submitAnswer(londonLesson, p, text("I'm looking for the station."));
  assert.equal(humorContext(londonLesson, p, emptyHistory()), null, 'no adventure Roast for off-context');
  p = step(londonLesson, p, text('I need help.'));
  assert.equal(practiceEvidence(londonLesson, p).confirmedErrors, 1, 'only the contradictory sentence is a confirmed error');
  const ambiguous = submitAnswer(londonLesson, station(start(londonLesson, 'station-arrival')), text('Hostel.'));
  assert.equal(humorContext(londonLesson, ambiguous, emptyHistory()), null);
  const incorrect = submitAnswer(londonLesson, station(start(londonLesson, 'station-arrival')), text('Can you helps me?'));
  assert.equal(humorContext(londonLesson, incorrect, emptyHistory()).writtenIssue, 'structure', 'real errors keep their diagnosis for consented humour');
});

test('LV-007B continuity: the café server remembers drink, place and sugar in every variant and combination', () => {
  for (const variant of cafeLesson.variants) for (const drink of ['cafe', 'the']) for (const place of ['sur-place', 'emporter']) for (const sugar of ['oui-sucre', 'non-sucre']) {
    let p = start(cafeLesson, variant.id);
    p = step(cafeLesson, p, choice('bonjour-simple')); p = step(cafeLesson, p, choice(drink)); p = step(cafeLesson, p, choice(place)); p = step(cafeLesson, p, choice(sugar));
    assert.equal(p.nodeId, 'prix');
    const name = drink === 'cafe' ? 'café' : 'thé';
    assert.equal(contextualExercise(cafeLesson, p).prompt, place === 'emporter' ? `Votre ${name} à emporter est prêt.` : `Voilà, votre ${name} est prêt.`);
    p = step(cafeLesson, p, text("C'est combien ?"));
    const pay = currentExercise(cafeLesson, p).choices.find(c => c.correct).id;
    p = step(cafeLesson, p, choice(pay));
    assert.equal(contextualExercise(cafeLesson, p).prompt, `Voilà votre ${name}, ${sugar === 'oui-sucre' ? 'avec du' : 'sans'} sucre.`);
    const view = conversationPresentation(cafeLesson, p);
    assert.ok(view.history.at(-2).messages[0].text.includes(name), 'transcript keeps the contextual line that was shown');
  }
});

test('LV-007B consequences: decisions change characters and endings; a combined reply closes the scene coherently', () => {
  const route = (id, option) => { let p = station(start(londonLesson, id)); p = step(londonLesson, p, text("I'm looking for " + (id === 'station-arrival' ? 'the hostel.' : 'the theatre.'))); p = step(londonLesson, p, choice(option)); return p; };
  assert.equal(currentExercise(londonLesson, route('station-arrival', 'route-a')).speaker, 'Nora');
  assert.equal(currentExercise(londonLesson, route('station-arrival', 'route-b')).speaker, 'Ben');
  assert.equal(conversationMemory(londonLesson, route('riverside-rain', 'route-b-alt')).facts.route.value, 'market');
  let c = start(cafeLesson, 'carnet-alex');
  for (const a of [choice('bonjour-simple'), choice('the'), choice('emporter'), choice('non-sucre'), text("C'est combien ?")]) c = step(cafeLesson, c, a);
  c = step(cafeLesson, c, choice(currentExercise(cafeLesson, c).choices.find(x => x.correct).id));
  c = submitAnswer(cafeLesson, c, text('Merci, bonne journée.'));
  assert.equal(c.feedback.intentId, 'thanks-and-goodbye'); assert.match(c.feedback.reply, /à vous aussi/);
  c = continueMission(cafeLesson, c);
  assert.equal(c.status, 'completed'); assert.deepEqual(c.completedObjectives, cafeLesson.objectives, 'thanking and saying goodbye together completes both objectives');
});

test('LV-007B coherence: exhaustive walk of every route never re-asks a confirmed fact, completes all objectives and replays identically', () => {
  // One option per distinct consequence (next turn + facts); every intent; one minor form per turn.
  const distinct = options => [...new Map(options.map(c => [JSON.stringify([c.next, c.facts ?? null]), c])).values()];
  const representative = exercise => exercise.kind === 'choice' ? distinct(exercise.choices.filter(c => c.correct)).map(c => choice(c.id))
    : [text(exercise.accepted[0]), ...(exercise.intents ?? []).map(i => text(i.examples[0])), ...(exercise.minorForms ?? []).slice(0, 1).map(m => text(m.input))];
  let paths = 0;
  for (const lesson of [londonLesson, cafeLesson, rendezvousLesson]) for (const variant of lesson.variants) {
    const walk = p => {
      if (p.status === 'completed') {
        paths++;
        assert.deepEqual(p.completedObjectives, lesson.objectives);
        assert.deepEqual(restoreProgress(lesson, JSON.parse(JSON.stringify(p))), p);
        return;
      }
      const exercise = currentExercise(lesson, p);
      const memory = conversationMemory(lesson, p);
      if (exercise.asks) assert.notEqual(memory.facts[exercise.asks]?.status, 'confirmed', `${lesson.id}/${variant.id}/${exercise.id} asks a confirmed ${exercise.asks}`);
      for (const answer of representative(exercise)) {
        const next = submitAnswer(lesson, p, answer);
        assert.equal(next.feedback.correct, true, `${exercise.id}: ${JSON.stringify(answer)}`);
        walk(continueMission(lesson, next));
      }
    };
    walk(start(lesson, variant.id));
  }
  assert.ok(paths > 100, `explored ${paths} complete conversations`);
  // The validator itself rejects content that would ask again.
  const broken = JSON.parse(JSON.stringify(londonLesson));
  broken.variants[0].exercises.find(e => e.id === 'help').intents[0].next = 'where';
  broken.variants[0].exercises.find(e => e.id === 'help').intents[0].completes = undefined;
  assert.throws(() => validateLesson(broken), /vuelve a preguntar/);
  const ambiguousInput = JSON.parse(JSON.stringify(londonLesson));
  ambiguousInput.variants[0].exercises.find(e => e.id === 'help').offContext.push({ inputs: ['I need help.'], explanation: 'x' });
  assert.throws(() => validateLesson(ambiguousInput), /dos interpretaciones/);
  assert.ok(transitions(currentExercise(londonLesson, station(start(londonLesson, 'station-arrival')))).length >= 2);
});

test('LV-007B persistence: reload restores turn, decisions and memory; restart clears memory; nothing new is stored', async () => {
  const s = storage();
  const repo = new MissionRepository(s, rendezvousLesson, [rendezvousLessonV1]); await repo.load();
  let p = await repo.start(() => 0.1, 1);
  p = step(rendezvousLesson, p, choice('greeting'));
  p = submitAnswer(rendezvousLesson, p, text('La fontaine.')); await repo.save(p, 2);
  const loaded = await new MissionRepository(s, rendezvousLesson, [rendezvousLessonV1]).load();
  assert.deepEqual(loaded, p);
  assert.deepEqual(conversationMemory(rendezvousLesson, loaded), conversationMemory(rendezvousLesson, p));
  assert.equal(conversationMemory(rendezvousLesson, loaded).facts['meeting-point'].status, 'ambiguous');
  const stored = JSON.parse([...s.data.entries()].find(([k]) => k.includes('rendezvous'))[1]);
  assert.deepEqual(Object.keys(stored.progress).sort(), ['completedObjectives', 'contentVersion', 'events', 'feedback', 'lessonId', 'nodeId', 'run', 'status', 'variantId', 'version'], 'no new persisted structure');
  const restarted = await repo.start(() => 0.9, 3);
  assert.deepEqual(conversationMemory(rendezvousLesson, restarted).facts, {}, 'a new run starts without memory');
  assert.equal(restarted.contentVersion, 2);
});

test('LV-007B compatibility: saved runs of the previous versions resume on their own content with identical feedback', async () => {
  for (const [current, archived, archives, forProgress, variant, answers] of [
    [londonLesson, londonLessonV4, [londonLessonV4], londonLessonForProgress, 'station-arrival', [choice('hello'), text("I'm new here."), text("I'm looking for the hostel.")]],
    [cafeLesson, cafeLessonV2, [cafeLessonV2], cafeLessonForProgress, 'midi-samir', [choice('bonjour-simple'), choice('cafe')]],
    [rendezvousLesson, rendezvousLessonV1, [rendezvousLessonV1], rendezvousLessonForProgress, 'jardin-bleu', [choice('greeting'), text('La fontaine.')]],
  ]) {
    let old = start(archived, variant);
    for (const a of answers) old = step(archived, old, a);
    assert.equal(old.feedback?.outcome, undefined, 'archived content evaluates exactly as before');
    const s = storage(); await s.setItem(`lingoverse.mission.${current.id}.v1`, JSON.stringify(old));
    const repo = new MissionRepository(s, current, archives);
    assert.deepEqual(await repo.load(), old);
    assert.equal(forProgress(old), archived);
    assert.equal((await repo.start(() => 0.3, 9)).contentVersion, current.version);
  }
  // The same sentence that the archived version could not verify is understood in the new one.
  let v4 = step(londonLessonV4, step(londonLessonV4, start(londonLessonV4, 'station-arrival'), choice('hello')), text("I'm new here."));
  v4 = submitAnswer(londonLessonV4, v4, text("I'm looking for the hostel."));
  assert.equal(v4.feedback.correct, false);
});

test('LV-007B voice and help: STT transcripts reuse interpretation; rescue models stay valid in every mode; variety stays distinct', () => {
  const help = currentExercise(londonLesson, station(start(londonLesson, 'station-arrival')));
  assert.equal(inspectTranscript(help, "i'm looking for the hostel", 'en-GB', { confidence: 0.9 }).kind, 'valid', 'spoken intent without punctuation');
  assert.equal(inspectTranscript(help, 'the hostel', 'en-GB', { confidence: 0.95 }).kind, 'uncertain', 'ambiguous speech never becomes a pronunciation error');
  assert.equal(inspectTranscript(help, "i'm looking for the station", 'en-GB', { confidence: 0.95 }).kind, 'uncertain');
  for (const [lesson, lang, adventure] of [[londonLesson, 'en', 'cafe'], [cafeLesson, 'fr', 'cafe'], [rendezvousLesson, 'fr', 'rendezvous']]) {
    for (const variant of lesson.variants) for (const exercise of variant.exercises) {
      const plan = learningRescue(lang, adventure, exercise);
      assert.equal(evaluateAnswer(exercise, plan.answer).correct, true, `${exercise.id} rescue model`);
      for (const model of plan.alternatives) assert.equal(evaluateAnswer(exercise, model.answer).correct, true);
      if (exercise.kind === 'text') assert.ok(plan.pronunciation, `${lesson.id}/${exercise.id} keeps its Pronunciation Coach guide`);
    }
    assertDistinctConversations(lesson.variants);
    assert.ok(lessonCandidates(lesson).every(c => c.id.includes(`:v${lesson.version}:`)));
  }
  for (const support of ['assisted', 'independent']) {
    let p = station(start(londonLesson, 'station-arrival'));
    p = continueMission(londonLesson, submitAnswer(londonLesson, p, text("I'm looking for the hostel."), support));
    assert.equal(practiceEvidence(londonLesson, p)[support], 1, `${support} evidence preserved with intent routing`);
  }
});
