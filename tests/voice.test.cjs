const { test } = require('node:test');
const assert = require('node:assert/strict');
const { selectVoice, VoiceController } = require('../.test-build/domain/voice/playback.js');
const voices = [
  { identifier: 'fr', language: 'fr-FR', name: 'French', local: true },
  { identifier: 'en', language: 'en-US', name: 'English', local: true },
  { identifier: 'mx', language: 'es-MX', name: 'Spanish Mexico', local: true },
  { identifier: 'es', language: 'es-ES', name: 'Spanish Spain', local: true },
];
function setup(overrides = {}) {
  const spoken = [], timers = [];
  let stops = 0;
  const driver = { voices: async () => voices, stop: async () => { stops++; }, speak: (text, voice, events) => spoken.push({ text, voice, events }), ...overrides };
  const controller = new VoiceController(driver, (callback, ms) => { const timer = { callback, ms, active: true }; timers.push(timer); return () => { timer.active = false; }; });
  controller.configure({ scope: '/mission:fr:sv', muted: false, adultAllowed: false });
  return { controller, spoken, timers, stops: () => stops };
}
const request = { id: 'npc', text: 'Bonjour !', language: 'fr-FR' };

test('voice selection matches exact region, falls back only within language, never invents a voice', () => {
  assert.equal(selectVoice(voices, 'es-MX').voice.identifier, 'mx');
  assert.equal(selectVoice(voices, 'es-SV').regionalFallback, true);
  assert.equal(selectVoice(voices, 'fr').voice.identifier, 'fr');
  assert.equal(selectVoice(voices, 'en-GB').voice.identifier, 'en');
  assert.equal(selectVoice(voices, 'de-DE'), null);
  assert.equal(selectVoice([], 'fr'), null);
  assert.equal(selectVoice([{ ...voices[0], language: 'fr_FR' }], 'fr-FR').regionalFallback, false);
});
test('play, repeat and stop use one voice; late callbacks cannot change replacement state', async () => {
  const { controller: c, spoken, stops } = setup(); await c.refresh();
  assert.equal(spoken.length, 0);
  await c.play(request); spoken[0].events.onStart(); assert.equal(c.snapshot().status, 'speaking');
  await c.play({ ...request, id: 'repeat' });
  spoken[0].events.onDone(); spoken[0].events.onError();
  assert.equal(c.snapshot().activeId, 'repeat');
  spoken[1].events.onStart(); await c.stop(); spoken[1].events.onStart();
  assert.equal(c.snapshot().status, 'idle'); assert.equal(c.snapshot().activeId, null);
  assert.ok(stops() >= 3);
});
test('stop while cancellation is pending prevents delayed speech; latest play wins', async () => {
  let release; const gate = new Promise(resolve => { release = resolve; });
  const { controller: c, spoken } = setup({ stop: () => gate }); await c.refresh();
  const a = c.play(request); const b = c.play({ ...request, id: 'b' }); const stop = c.stop();
  release(); await Promise.all([a, b, stop]); assert.equal(spoken.length, 0);
  await c.play(request); assert.equal(spoken.length, 1);
  await c.stop();
});
test('navigation, preference change, mute and revocation invalidate active and queued audio', async () => {
  for (const context of [
    { scope: '/explore', muted: false, adultAllowed: true },
    { scope: '/mission:en:mx', muted: false, adultAllowed: true },
    { scope: '/mission:fr:sv', muted: true, adultAllowed: true },
    { scope: '/mission:fr:sv', muted: false, adultAllowed: false },
  ]) {
    const { controller: c, spoken } = setup(); await c.refresh();
    c.configure({ scope: '/mission:fr:sv', muted: false, adultAllowed: true });
    await c.play({ ...request, adult: true });
    c.configure(context); spoken[0].events.onStart(); spoken[0].events.onDone();
    assert.equal(c.snapshot().activeId, null);
    if (!context.adultAllowed || context.muted) { await c.play({ ...request, adult: true }); assert.equal(spoken.length, 1); }
  }
});
test('no voices, voice loading failure, synthesis failure and stop failure preserve text-only mode', async () => {
  const empty = setup({ voices: async () => [] }); await empty.controller.refresh(); await empty.controller.play(request); assert.equal(empty.spoken.length, 0);
  const failed = setup({ voices: async () => { throw Error('unavailable'); } }); await failed.controller.refresh(); assert.equal(failed.controller.snapshot().status, 'error');
  const broken = setup({ speak: () => { throw Error('failed'); } }); await broken.controller.refresh(); await broken.controller.play(request); assert.equal(broken.controller.snapshot().status, 'error');
  const stopFailed = setup({ stop: async () => { throw Error('cannot stop'); } }); await stopFailed.controller.refresh(); await stopFailed.controller.play(request); assert.equal(stopFailed.spoken.length, 0); assert.equal(stopFailed.controller.snapshot().status, 'error');
});
test('missing start callback times out and delayed callbacks cannot revive canceled speech', async () => {
  const { controller: c, spoken, timers } = setup(); await c.refresh(); await c.play(request);
  timers.find(timer => timer.active).callback();
  await Promise.resolve(); spoken[0].events.onStart();
  assert.equal(c.snapshot().status, 'error'); assert.equal(c.snapshot().activeId, null);
});
test('mute and adult denial are checked again after asynchronous stop', async () => {
  let release; const gate = new Promise(resolve => { release = resolve; });
  const { controller: c, spoken } = setup({ stop: () => gate }); await c.refresh();
  c.configure({ scope: 'roast', muted: false, adultAllowed: true });
  const pending = c.play({ ...request, adult: true });
  c.configure({ scope: 'roast', muted: false, adultAllowed: false });
  release(); await pending; assert.equal(spoken.length, 0);
});

test('browser driver reports locality honestly and never silently changes a missing voice', async () => {
  const { createBrowserSpeech } = require('../.test-build/domain/voice/browser.js');
  let list = [{ voiceURI: 'fr', lang: 'fr-FR', name: 'Local FR', localService: true }, { voiceURI: 'remote', lang: 'es-ES', name: 'Online', localService: false }];
  const utterances = [];
  const engine = { getVoices: () => list, speak: u => utterances.push(u), cancel: () => {}, addEventListener: () => {}, removeEventListener: () => {} };
  const driver = createBrowserSpeech(() => engine, text => ({ text }));
  assert.deepEqual((await driver.voices()).map(v => v.identifier), ['fr', 'remote']);
  assert.equal((await driver.voices())[1].local, false);
  const events = { onStart() {}, onDone() {}, onError() {}, onStopped() {} };
  driver.speak('Bonjour', voices[0], events);
  assert.equal(utterances[0].lang, 'fr-FR'); assert.equal(utterances[0].voice.voiceURI, 'fr');
  list = [];
  assert.throws(() => driver.speak('Bonjour', voices[0], events), /disponible/);
});

test('network voices require opt-in; local Spanish is preferred even over an online regional match', () => {
  const online = { identifier: 'online', name: 'Online', language: 'es-SV', local: false };
  assert.equal(selectVoice([online], 'es-SV'), null);
  assert.equal(selectVoice([online], 'es-SV', true).voice.identifier, 'online');
  assert.equal(selectVoice([online, voices[3]], 'es-SV', true).voice.identifier, 'es');
});
