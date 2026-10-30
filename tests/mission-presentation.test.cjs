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
function load(relative) {
  const filename = path.resolve(relative);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  const customRequire = id => {
    if (id === 'react-native') return { View: host('section'), Text: host('span'), TextInput: host('textarea'), StyleSheet: { create: x => x } };
    if (id.endsWith('components/ui')) return Object.fromEntries(['Button', 'Card', 'Choice', 'Copy', 'Heading', 'Notice'].map(name => [name, host(name === 'Button' ? 'button' : 'div')]));
    if (id.endsWith('MissionProvider')) return { useMission: () => ({ reaction, mode }) };
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
