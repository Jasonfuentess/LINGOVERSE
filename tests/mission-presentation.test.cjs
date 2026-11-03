const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Render the real TSX with host primitives; no native layout/browser claims.
function host(tag) {
  return function HostPrimitive({ children, label, message, ...props }) { return React.createElement(tag, {
    'data-disabled': props.disabled || undefined,
  }, children ?? label ?? message); };
}
let reaction;
let settings;
let locale;
let mode = 'friendly';
let audioRequests = [];
let speechInputRequests = [];
function load(relative) {
  const filename = path.resolve(relative);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  const customRequire = id => {
    if (id.endsWith('SpeechInput')) return { SpeechInput: props => { speechInputRequests.push(props); return null; } };
    if (id.endsWith('VoiceControls')) return { SpeechButton: props => { audioRequests.push(props); return null; }, CoachSpeech: props => { audioRequests.push({ ...props, language: 'coach' }); return null; }, VoiceToolbar: () => null };
    if (id.endsWith('AdventureArt')) return { CharacterPortrait: host('figure'), TurnEntrance: host('section'), SceneArtwork: host('figure') };
    if (id === 'react-native') return { View: host('section'), Text: host('span'), Pressable: host('button'), TextInput: host('textarea'), StyleSheet: { create: x => x } };
    if (id.endsWith('components/ui')) return Object.fromEntries(['Button', 'Card', 'Choice', 'Copy', 'Heading', 'Notice'].map(name => [name, host(name === 'Button' ? 'button' : 'div')]));
    if (id.endsWith('MissionProvider')) return { useMission: (language = 'fr') => language === 'en' ? ({ reaction: null, mode: 'friendly' }) : ({ reaction, mode }) };
    if (id.endsWith('PreferencesProvider') && !id.includes('Humor')) return { usePreferences: () => ({ preferences: { coachLocale: locale } }) };
    if (id === './HumorPreferencesProvider') return { useHumorPreferences: () => ({ settings, loading: false }) };
    if (id.startsWith('.')) {
      const target = path.resolve(path.dirname(filename), id);
      return load(fs.existsSync(`${target}.tsx`) ? `${target}.tsx` : `${target}.ts`);
    }
    return require(id);
  };
  vm.runInNewContext(output, { require: customRequire, module, exports: module.exports }, { filename });
  return module.exports;
}
const { ExerciseView } = load('src/features/learning/ExerciseView.tsx');
const { CoachReaction } = load('src/features/humor/CoachReaction.tsx');
const exercise = { id: 'greet', kind: 'choice', title: 'Saludo', scene: 'Café', speaker: 'Lucie', prompt: 'Bonjour', promptTranslation: 'Hola', teaching: 'Ayuda', instruction: 'Elegí', choices: [{ id: 'a', label: 'Bonjour' }] };
const feedback = { correct: true, explanation: 'Explicación original', correction: 'Corrección original', reply: 'Réponse originale' };
const render = (overrides = {}) => renderToStaticMarkup(React.createElement(ExerciseView, {
  exercise, feedback, saving: false, error: null, onAnswer: async () => true, onContinue: async () => true,
  ...overrides,
}));

test('adventure protects recall before an attempt and explains the prompt after an attempt', () => {
  reaction = null;
  const initial = render({ conversational: true, feedback: null });
  assert.ok(!initial.includes('Hola'), 'prompt translation is not automatically revealed');
  assert.ok(!initial.includes('>Ayuda<'), 'complete teaching is opt-in');
  assert.ok(initial.includes('Necesito una pista'));
  const attempted = render({ conversational: true, feedback: { ...feedback, correct: false } });
  assert.ok(attempted.includes('Hola'));
  assert.ok(attempted.includes('Corrección original'));
  assert.ok(render({ conversational: false, feedback: null }).includes('Hola'), 'standalone Roast unchanged');
});

test('chapter review uses the visited branch and actual equivalent, never an unchosen answer', () => {
  const { ChapterReview } = load('src/features/learning/ChapterReview.tsx');
  const turns = ['commande', 'prix', 'depart'].map((node, index) => ({
    id: `lesson:2:0:${node}`, messages: [{ role: 'student', text: ['Un thé, s’il vous plaît.', 'Combien ça coûte ?', 'Bonne journée.'][index] }],
    feedback: { explanation: `Explication ${index}` },
  }));
  const html = renderToStaticMarkup(React.createElement(ChapterReview, { turns }));
  for (const text of ['Un thé', 'Combien ça coûte', 'Bonne journée', 'Pedir una bebida', 'Preguntar el precio', 'Despedirte']) assert.ok(html.includes(text));
  assert.ok(!html.includes('Un café,'));
  assert.equal(html.split('Explication 0').length - 1, 1);
  assert.ok(!renderToStaticMarkup(React.createElement(ChapterReview, { turns: [] })).includes('Bonne journée'));
});

test('one coach block contains educational feedback before reaction and continuation across all regions', () => {
  for (const [region, name] of [['es-SV', 'Luz'], ['es-MX', 'Toño'], ['es-CO', 'Vale'], ['es-AR', 'Romi']]) {
    locale = region; settings = { enabled: true, intensity: 'playful' };
    reaction = { locale, text: 'Reacción persistida', intensity: 'gentle', mode: 'friendly', explicit: false };
    const html = render();
    assert.ok(html.indexOf(name) < html.indexOf('Explicación original'));
    assert.equal(html.split('¡Bien resuelto!').length - 1, 1);
    assert.equal(html.split('Explicación original').length - 1, 1);
    assert.ok(html.indexOf('Réponse originale') < html.indexOf('Reacción persistida'));
    assert.ok(html.indexOf('Reacción persistida') < html.indexOf('Continuar conversación'));
    assert.equal(render(), html, 'rendering does not regenerate the reaction');
  }
});
test('unified coach shows incorrect, retry, recovery and celebration states without duplicating teaching', () => {
  locale = 'es-SV'; settings = { enabled: true, intensity: 'playful' };
  for (const [category, correct, title] of [['error', false, 'Vamos por partes'], ['retry', false, 'Probemos de nuevo'], ['recurring', false, 'Probemos de nuevo'], ['recovery', true, '¡Ahora sí, bien resuelto!']]) {
    reaction = { locale, category, text: 'Comentario contextual', intensity: 'gentle', mode: 'friendly', explicit: false };
    const html = render({ feedback: { ...feedback, correct } });
    assert.ok(html.includes(title));
    assert.equal(html.split('Explicación original').length - 1, 1);
    assert.equal(html.split('Comentario contextual').length - 1, 1);
    assert.equal(html.includes('Corrección original'), !correct);
    assert.ok(html.indexOf('Explicación original') < html.indexOf('Comentario contextual'));
  }
  reaction = { ...reaction, category: 'celebration' };
  assert.ok(renderToStaticMarkup(React.createElement(CoachReaction)).includes('¡Aventura completada!'));
});
test('disabled, unavailable or incompatible humor renders no reserved coach container', () => {
  locale = 'es-SV';
  const base = { locale, text: 'Comentario', intensity: 'playful', mode: 'friendly', explicit: false };
  for (const [prefs, value] of [
    [{ enabled: false }, base], [null, base],
    [{ enabled: true, intensity: 'gentle' }, base],
    [{ enabled: true }, { ...base, locale: 'es-MX' }],
    [{ enabled: true }, { ...base, explicit: true }],
    [{ enabled: true }, null],
  ]) {
    settings = prefs; reaction = value;
    assert.equal(renderToStaticMarkup(React.createElement(CoachReaction)), '');
    const html = render();
    assert.ok(html.includes('Explicación original'));
    assert.ok(!html.includes('Luz'));
  }
});
test('incorrect feedback preserves correction and retry, never offers continuation', () => {
  reaction = null;
  const html = render({ feedback: { ...feedback, correct: false } });
  for (const text of ['Explicación original', 'Corrección original', 'Réponse originale', 'Volver a comprobar']) assert.ok(html.includes(text));
  assert.ok(!html.includes('Continuar conversación'));
  assert.ok(!render({ feedback: null }).includes('¡Bien resuelto!'));
});
test('saving disables continuation and departure retains finish action', () => {
  assert.match(render({ saving: true }), /<button data-disabled="true">Guardando…/);
  assert.ok(render({ exercise: { ...exercise, id: 'depart' } }).includes('Terminar aventura'));
});
test('roast feedback is unified only with valid consent and disappears on revocation', () => {
  mode = 'roast'; locale = 'es-SV';
  settings = { version: 1, enabled: false, intensity: 'gentle', adult: { enabled: true, consent: { version: 1, adultConfirmed: true, explicitlyAgreed: true, grantedAt: 100 } } };
  reaction = { locale, category: 'correct', text: 'Comentario adulto de prueba', mode: 'roast', intensity: 'playful', explicit: true };
  const html = render();
  assert.ok(html.includes('Luz')); assert.ok(html.includes('Comentario adulto de prueba'));
  assert.equal(html.split('Explicación original').length - 1, 1);
  assert.equal(render(), html, 'resume does not regenerate saved reaction');
  reaction = { ...reaction, educational: true, text: 'Bonjour saluda de día, con personalidad editorial.' };
  const educational = render();
  assert.ok(educational.includes('Bonjour saluda de día'));
  assert.ok(!educational.includes('Explicación original'));
  assert.ok(educational.includes('Corrección original'));
  settings = { ...settings, adult: { enabled: false, consent: null } };
  const revoked = render(); assert.ok(!revoked.includes('Comentario adulto de prueba')); assert.ok(!revoked.includes('Luz'));
  assert.ok(revoked.includes('Explicación original'));
  mode = 'friendly';
});

test('conversational turn orders NPC, verified student, NPC reply, unified coach and continuation', () => {
  mode = 'friendly'; locale = 'es-SV'; settings = { enabled: true, intensity: 'playful' };
  reaction = { locale, text: 'Reacción contextual', mode: 'friendly', intensity: 'gentle', explicit: false };
  const html = render({ conversational: true, submittedAnswer: { kind: 'choice', choiceId: 'a' } });
  assert.ok(html.indexOf('Bonjour') < html.indexOf('Vos · respuesta verificada'));
  assert.ok(html.indexOf('Vos · respuesta verificada') < html.indexOf('Réponse originale'));
  assert.ok(html.indexOf('Réponse originale') < html.indexOf('Explicación original'));
  assert.ok(html.indexOf('Reacción contextual') < html.indexOf('Continuar conversación'));
  assert.equal(html.split('Réponse originale').length - 1, 1);
  assert.ok(!html.includes('Seleccionar esta respuesta'));
  const retry = render({ conversational: true, feedback: { ...feedback, correct: false, reply: '' } });
  assert.ok(retry.includes('Volver a comprobar'));
  assert.ok(retry.includes('Corrección original'));
  assert.ok(!retry.includes('Vos · respuesta verificada'));
});

test('adventure roast style requires separate preference and valid consent, with immediate fallback', () => {
  mode = 'friendly'; locale = 'es-SV';
  const base = { version: 1, enabled: true, intensity: 'playful', adult: { enabled: true, consent: { version: 1, adultConfirmed: true, explicitlyAgreed: true, grantedAt: 100 } } };
  reaction = { locale, text: 'Adulto consentido', mode: 'roast', intensity: 'playful', explicit: true };
  for (const prefs of [base, { ...base, adventureRoast: false }, { ...base, adventureRoast: true, enabled: false }, { ...base, adventureRoast: true, adult: { enabled: false, consent: null } }]) {
    settings = prefs;
    const html = render({ conversational: true });
    assert.ok(!html.includes('Adulto consentido'));
    assert.ok(html.includes('Explicación original'));
  }
  settings = { ...base, adventureRoast: true };
  assert.ok(render({ conversational: true }).includes('Adulto consentido'));
});

test('voice controls receive only visible editorial content and adult requests vanish on revocation', () => {
  mode = 'roast'; locale = 'es-SV';
  settings = { version: 1, enabled: true, intensity: 'playful', adult: { enabled: true, consent: { version: 1, adultConfirmed: true, explicitlyAgreed: true, grantedAt: 100 } } };
  reaction = { locale, text: 'Reacción adulta editorial', mode: 'roast', intensity: 'playful', explicit: true };
  audioRequests = [];
  render({ feedback: { ...feedback, correct: false }, submittedAnswer: { kind: 'text', text: 'private-student-draft' } });
  assert.ok(audioRequests.some(item => item.adult && item.text.includes('Reacción adulta editorial')));
  assert.ok(!audioRequests.some(item => item.text.includes('private-student-draft')));
  settings = { adult: { enabled: false, consent: null } };
  audioRequests = []; render({ conversational: true, feedback: null });
  assert.ok(audioRequests.some(item => item.language === 'fr-FR' && item.text === 'Bonjour'));
  assert.ok(!audioRequests.some(item => item.adult || item.text.includes('Reacción adulta editorial') || item.text.includes('Corrección original')));
  audioRequests = []; render({ feedback: { ...feedback, correct: false } });
  assert.ok(audioRequests.some(item => item.text === 'Explicación original'));
  assert.ok(!audioRequests.some(item => item.adult));
  mode = 'friendly';
});


test('London English turn wires en-GB voice and optional mic while preserving keyboard field', () => {
  const { londonLesson } = require('../.test-build/content/london');
  const variant = londonLesson.variants[0];
  const turn = variant.exercises.find(e => e.id === 'introduce');
  reaction = null; mode = 'friendly';
  audioRequests = []; speechInputRequests = [];
  const html = render({ exercise: turn, feedback: null, language: 'en', conversational: true });
  assert.ok(audioRequests.some(item => item.language === 'en-GB' && item.text === turn.prompt));
  assert.equal(speechInputRequests.at(-1).language, 'en-GB');
  assert.ok(html.includes('Respondé en inglés'));
  assert.ok(html.includes('textarea'));
  assert.ok(!html.includes(turn.promptTranslation), 'translation must not leak before clue');
  audioRequests = []; speechInputRequests = [];
  render({ exercise: turn, feedback: null, language: 'fr', conversational: true });
  assert.ok(audioRequests.some(item => item.language === 'fr-FR'));
  assert.equal(speechInputRequests.at(-1).language, 'fr-FR');
});


test('English feedback never borrows a French coach reaction or an adult Roast style', () => {
  const { londonLesson } = require('../.test-build/content/london');
  const exercise = londonLesson.variants[0].exercises.find(e => e.id === 'introduce');
  locale = 'es-SV'; mode = 'friendly';
  settings = { version: 1, enabled: true, adventureRoast: true, intensity: 'playful', adult: { enabled: true, consent: { version: 1, adultConfirmed: true, explicitlyAgreed: true, grantedAt: 100 } } };
  reaction = { locale, text: 'FR only reaction', mode: 'roast', intensity: 'playful', explicit: true };
  const html = render({ exercise, language: 'en', conversational: true, feedback: { ...feedback, correct: false } });
  assert.ok(html.includes('Explicación original'));
  assert.ok(!html.includes('FR only reaction'));
  assert.ok(!html.includes('Reacción adulta editorial'));
  mode = 'friendly';
});


test('LV-006A-02 routes English example to en-GB, French example to fr-FR, with locale-specific label', () => {
  const { londonLesson } = require('../.test-build/content/london');
  const englishExercise = londonLesson.variants.find(v => v.id === 'riverside-rain').exercises.find(e => e.id === 'where');
  reaction = null; mode = 'friendly'; audioRequests = [];
  const wrong = { correct: false, explanation: 'What asks what something is, where asks location.', correction: 'Where is the Lantern Theatre?', reply: '', next: null };
  const html = render({ exercise: englishExercise, language: 'en', conversational: true, feedback: wrong });
  assert.ok(audioRequests.some(item => item.language === 'en-GB' && item.text === 'Where is the Lantern Theatre?'));
  assert.ok(!audioRequests.some(item => item.language === 'fr-FR' && item.text.includes('Where is')));
  // Speech controls are mocked, so inspect props instead of assuming a browser played audio.
  const fr = render({ exercise, language: 'fr', conversational: true, feedback: { ...wrong, correction: 'Bonjour!' } });
  assert.ok(audioRequests.some(item => item.language === 'fr-FR' && item.text === 'Bonjour!'));
  assert.ok(html.includes('Where is the Lantern Theatre?'));
  assert.ok(fr.includes('Bonjour!'));
});

test('bilingual replies render as separate conversation and translation, without speaking Spanish as English', () => {
  const { ConversationMessage } = load('src/features/learning/Conversation.tsx');
  audioRequests = [];
  const html = renderToStaticMarkup(React.createElement(ConversationMessage, {
    role: 'npc', speaker: 'Leo', text: 'Turn left. → Girá a la izquierda.', language: 'en-GB',
  }));
  assert.ok(html.includes('>Turn left.<'));
  assert.ok(html.includes('>Girá a la izquierda.<'));
  assert.ok(!html.includes('Turn left. → Girá a la izquierda.'));
  assert.ok(audioRequests.some(item => item.language === 'en-GB' && item.text === 'Turn left.'));
  assert.ok(!audioRequests.some(item => item.text.includes('Girá')));
});

test('REV-01: English feedback speaks an English example separately from Spanish-only coaching', () => {
  const { londonLesson } = require('../.test-build/content/london');
  const story = londonLesson.variants.find(x => x.id === 'riverside-rain');
  const example = story.exercises.find(e => e.id === 'help');
  const { evaluateAnswer } = require('../.test-build/domain/learning/engine');
  const wrong = evaluateAnswer(example, { kind: 'text', text: 'Can you helps me?' });
  reaction = null; mode = 'friendly'; audioRequests = [];
  const html = render({ exercise: example, language: 'en', feedback: wrong, conversational: true });
  assert.ok(audioRequests.some(req => req.language === 'en-GB' && req.text === 'I need help.'));
  assert.ok(audioRequests.some(req => req.language === 'coach' && req.text === wrong.spokenExplanation));
  assert.ok(audioRequests.every(req => req.language !== 'fr-FR'));
  assert.ok(audioRequests.every(req => !req.language || req.language !== 'coach' || !req.text.includes('Can you helps')));
  assert.ok(html.includes('Escuchar') === false || html.includes('inglés') || html.includes('Respondé en inglés'));
});

test('REV-01: feedback without a confident classification uses uncertainty, not invented grammar diagnosis', () => {
  const { londonLesson } = require('../.test-build/content/london');
  const story = londonLesson.variants.find(x => x.id === 'riverside-rain');
  const example = story.exercises.find(e => e.id === 'help');
  const { evaluateAnswer } = require('../.test-build/domain/learning/engine');
  const unknown = evaluateAnswer(example, { kind: 'text', text: 'Could you possibly lend a hand?' });
  reaction = null; mode = 'friendly'; audioRequests=[];
  const html = render({ exercise:example, feedback:unknown, language:'en', conversational:true });
  assert.ok(html.includes('Aún no podemos verificarla'));
  assert.ok(html.includes('No puedo determinar'));
  assert.ok(audioRequests.some(req=>req.language==='coach' && req.text===unknown.spokenExplanation));
});

test('REV-01: French tutoring continues to request fr-FR examples and original feedback speech', () => {
  const { cafeLesson } = require('../.test-build/content/cafe');
  const variant = cafeLesson.variants[0];
  const example = variant.exercises.find(x=>x.kind==='text');
  reaction=null; mode='friendly'; audioRequests=[];
  const original={ correct:false,explanation:'Explicación antigua francesa',correction:example.correction,reply:'',next:null };
  render({ exercise:example, feedback:original, language:'fr',conversational:true });
  assert.ok(audioRequests.some(req=>req.language==='fr-FR' && req.text));
  assert.ok(audioRequests.some(req=>req.language==='coach' && req.text==='Explicación antigua francesa'));
  assert.ok(audioRequests.every(req=>req.language!=='en-GB'));
});
