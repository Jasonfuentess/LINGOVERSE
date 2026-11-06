// Shared react-native-web harness for the Roast Me Live screen (RML-001, RML-002). Not a test file.
// Renders the real LiveScreen source with dev checks on; providers, audio and the microphone are
// replaced by observable stand-ins. Hook state (useState/useRef) persists across renders like React.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server');
const { humorDefaults, grantAdultConsent } = require('../.test-build/domain/humor/preferences');

const memoryStorage = () => { const data = new Map(); return { data, getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } }; };
const consented = (live) => ({ ...grantAdultConsent(humorDefaults(), { adultConfirmed: true, explicitlyAgreed: true }, 1), ...(live ? { live } : {}) });

function screenHarness({ humor = consented({ intensity: 'sin-pena', doubleMeaning: false }), preferences = { learningLanguage: 'fr', coachLocale: 'es-SV' }, storage = memoryStorage() } = {}) {
  let cursor = 0, controls = [];
  const slots = [], effects = [], plays = [], speech = [], errors = [], routes = [];
  const RNW = require('react-native-web');
  const h = React.createElement;
  const hooks = { ...React,
    useEffect(fn) { effects.push(fn); },
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], v => { slots[i] = typeof v === 'function' ? v(slots[i]) : v; }]; },
    useRef(initial) { const i = cursor++; if (!(i in slots)) slots[i] = { current: initial }; return slots[i]; },
  };
  const humorState = { settings: humor, loading: false, saving: false };
  const voices = [{ identifier: 'raul', language: 'es-MX', name: 'Microsoft Raul', local: true }, { identifier: 'fr', language: 'fr-FR', name: 'French', local: true }, { identifier: 'en', language: 'en-GB', name: 'English', local: true }];
  const mod = (relative) => require(path.resolve('.test-build', relative));
  const cache = new Map();
  function load(file) {
    const filename = path.resolve(file);
    if (cache.has(filename)) return cache.get(filename);
    const module = { exports: {} }; cache.set(filename, module.exports);
    const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
    const localRequire = id => {
      if (id === 'react') return hooks;
      if (id === 'react-native') return { ...RNW, Pressable: p => { controls.push(p); return h(RNW.Pressable, p); } };
      if (id === 'expo-router') return { useRouter: () => ({ push(r) { routes.push(r); }, replace(r) { routes.push(r); } }) };
      if (id.endsWith('components/ui')) return { Page: p => h(RNW.View, null, p.children), Copy: p => h(RNW.Text, null, p.children), Notice: p => h(RNW.Text, null, p.message), Heading: p => h(RNW.Text, null, p.children), Button: p => { controls.push(p); return h(RNW.Text, null, p.label); } };
      if (id.endsWith('KeyboardScroll')) return { KeyboardAnswerGroup: p => h(RNW.View, null, p.children), AnswerTextInput: p => { controls.push(p); return h(RNW.TextInput, { value: p.value }); } };
      if (id.endsWith('AdventureArt')) return { CharacterPortrait: () => null };
      if (id.endsWith('/PreferencesProvider')) return { usePreferences: () => ({ preferences, loading: false, saving: false, save: async change => { Object.assign(preferences, change); return true; } }) };
      if (id.endsWith('HumorPreferencesProvider')) return { useHumorPreferences: () => ({ ...humorState, save: async next => { humorState.settings = next; } }) };
      if (id.endsWith('VoiceProvider')) return { useVoice: () => ({ state: { voices, muted: false, allowNetworkVoices: false, status: 'idle', activeId: null }, saving: false, toggleMute: async () => {} }) };
      if (id.endsWith('LearningSupportProvider')) return { useLearningSupport: () => ({ data: mod('domain/learning/support').supportDefaults() }) };
      if (id.endsWith('voice/service')) return { voiceController: { playSequence: async (key, segments) => plays.push({ key, segments }), stop: async () => {}, restrict() {}, snapshot: () => ({ activeId: null }), subscribe: () => () => {} } };
      if (id.endsWith('SpeechInput')) return { SpeechInput: p => { speech.push(p); return null; } };
      if (id.endsWith('VoiceControls')) return { SpeechButton: p => { controls.push({ ...p, accessibilityLabel: `Escuchar ${p.label}` }); return null; }, StudyAudio: () => null };
      if (id.endsWith('storage/deviceStorage')) return { deviceStorage: storage };
      if (id.startsWith('.')) {
        const target = path.resolve(path.dirname(filename), id);
        const rel = path.relative(path.resolve('src'), target);
        if (/^(domain|content|storage|theme)[\\/]/.test(rel) && fs.existsSync(path.resolve('.test-build', rel + '.js'))) return mod(rel);
        return load(fs.existsSync(target + '.tsx') ? target + '.tsx' : target + '.ts');
      }
      return require(id);
    };
    vm.runInNewContext(js, { require: localRequire, module, exports: module.exports, process, console }, { filename });
    cache.set(filename, module.exports);
    return module.exports;
  }
  let element;
  const render = el => {
    if (el) element = el; cursor = 0; controls = []; speech.length = 0;
    const original = console.error; console.error = (...a) => errors.push(a.map(String).join(' '));
    try { return renderToStaticMarkup(element); } finally { console.error = original; }
  };
  const settle = async () => { for (let i = 0; i < 4; i++) { const pending = effects.splice(0); pending.forEach(fn => fn()); await new Promise(r => setTimeout(r, 0)); render(); } };
  const label = c => c.label ?? c.accessibilityLabel ?? (typeof c.children?.props?.children === 'string' ? c.children.props.children : undefined);
  /** Presses the control whose label equals `l`, or starts with it when no exact match exists. */
  const find = l => controls.find(c => c.onPress && label(c) === l) ?? controls.find(c => c.onPress && typeof label(c) === 'string' && label(c).startsWith(l));
  const press = async l => { const c = find(l); assert.ok(c, `control ${l}`); c.onPress(); await settle(); };
  const field = () => controls.find(c => c.onChangeText);
  const type = async value => { const f = field(); assert.ok(f, 'answer field'); f.onChangeText(value); await settle(); };
  const saved = lessonId => { const raw = storage.data.get(`lingoverse.mission.${lessonId}.v1`); return raw ? JSON.parse(raw).progress : null; };
  return { load, render, settle, press, find, field, type, saved, plays, speech, errors, storage, humorState, preferences, routes, controls: () => controls };
}
module.exports = { screenHarness, memoryStorage, consented };
