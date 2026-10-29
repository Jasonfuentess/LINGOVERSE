const { test } = require('node:test');
const assert = require('node:assert/strict');
const { defaults, changePreferences, decodePreferences } = require('../.test-build/domain/preferences.js');
const { PreferencesRepository } = require('../.test-build/storage/preferencesRepository.js');
const { createBrowserStorage } = require('../.test-build/storage/browserStorage.js');

function memory() {
  const data = new Map();
  return { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
}
test('defaults are guest, Spanish interface, no audio or adult consent', () => {
  assert.deepEqual(defaults(), { version: 1, mode: 'guest', learningLanguage: 'en', interfaceLanguage: 'es', coachLocale: 'es-SV', voiceProvider: 'none', explicitHumorEnabled: false, onboardingCompleted: false });
});
test('every language and coach can be changed without mutating prior state', () => {
  const previous = defaults();
  for (const learningLanguage of ['en', 'fr']) for (const coachLocale of ['es-SV', 'es-MX', 'es-CO', 'es-AR']) {
    const next = changePreferences(previous, { learningLanguage, coachLocale, onboardingCompleted: true });
    assert.equal(next.learningLanguage, learningLanguage);
    assert.equal(next.coachLocale, coachLocale);
    assert.equal(next.onboardingCompleted, true);
    assert.equal(next.explicitHumorEnabled, false);
  }
  assert.equal(previous.onboardingCompleted, false);
});
test('repository restores choices from a fresh instance', async () => {
  const storage = memory();
  const prefs = changePreferences(defaults(), { learningLanguage: 'fr', coachLocale: 'es-AR', onboardingCompleted: true });
  await new PreferencesRepository(storage).save(prefs);
  assert.deepEqual(await new PreferencesRepository(storage).load(), { preferences: prefs, recovered: false });
});
test('first launch has defaults without claiming recovery', async () => {
  assert.deepEqual(await new PreferencesRepository(memory()).load(), { preferences: defaults(), recovered: false });
});
test('malformed, unsupported and unsafe data are rejected', () => {
  for (const raw of ['{', 'null', '[]', JSON.stringify({ ...defaults(), version: 2 }), JSON.stringify({ ...defaults(), coachLocale: 'xx' }), JSON.stringify({ ...defaults(), learningLanguage: ['en'] }), JSON.stringify({ ...defaults(), coachLocale: ['es-SV'] }), JSON.stringify({ ...defaults(), explicitHumorEnabled: true }), JSON.stringify({ ...defaults(), voiceProvider: 'fake' })]) {
    assert.throws(() => decodePreferences(raw));
  }
  assert.throws(() => changePreferences(defaults(), { learningLanguage: 'xx' }));
});
test('corrupt data recovers safely with a visible recovery flag', async () => {
  const storage = memory();
  await storage.setItem('lingoverse.preferences.v1', '{broken');
  assert.deepEqual(await new PreferencesRepository(storage).load(), { preferences: defaults(), recovered: true });
});
test('storage read and write failures propagate, never simulate persistence', async () => {
  const repo = new PreferencesRepository({ getItem: async () => { throw Error('blocked'); }, setItem: async () => { throw Error('quota'); } });
  await assert.rejects(repo.load(), /blocked/);
  await assert.rejects(repo.save(defaults()), /quota/);
});
test('browser adapter is lazy, SSR safe at construction and reports unavailability', async () => {
  const adapter = createBrowserStorage(() => { throw Error('unavailable'); });
  await assert.rejects(adapter.getItem('x'), /unavailable/);
});
test('browser storage persists across adapter instances', async () => {
  const data = new Map();
  const browser = { getItem: k => data.get(k) ?? null, setItem: (k,v) => { data.set(k,v); } };
  const prefs = changePreferences(defaults(), { learningLanguage: 'fr', coachLocale: 'es-CO' });
  await new PreferencesRepository(createBrowserStorage(() => browser)).save(prefs);
  assert.deepEqual((await new PreferencesRepository(createBrowserStorage(() => browser)).load()).preferences, prefs);
});
