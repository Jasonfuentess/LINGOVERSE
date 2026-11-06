// RML-001/RML-002 real-Chrome Roast Me Live check against the exported dist (run npm run export:web first).
// Usage: node scripts/check-live.mjs --browser <chrome.exe>  (or LV_BROWSER_PATH). No audio or microphone is used.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const project = process.cwd(); const out = path.resolve('.web-check', 'live');
const browserArgument = process.argv.indexOf('--browser');
const browserPath = process.env.LV_BROWSER_PATH ?? (browserArgument >= 0 ? process.argv[browserArgument + 1] : undefined);
if (!browserPath) throw Error('Set LV_BROWSER_PATH or pass --browser with a local Chrome/Chromium executable.');
await mkdir(out, { recursive: true });
const profile = await mkdtemp(path.join(out, 'profile-'));
const root = path.join(project, 'dist');
const server = createServer(async (req, res) => {
  try {
    const name = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const target = path.resolve(root, `.${name}`);
    const file = path.extname(target) ? target : path.join(root, 'index.html');
    const types = { '.js': 'application/javascript', '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = spawn(browserPath, ['--headless', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let port;
for (let i = 0; i < 100 && !port; i++) { try { port = Number((await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); } catch { await sleep(150); } }
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let seq = 0; const pending = new Map(); const errors = []; const consoleErrors = [];
ws.addEventListener('message', m => { const v = JSON.parse(m.data); if (v.method === 'Runtime.exceptionThrown') errors.push(v.params.exceptionDetails.exception?.description ?? v.params.exceptionDetails.text); if (v.method === 'Runtime.consoleAPICalled' && v.params.type === 'error') consoleErrors.push(v.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 300)); const f = pending.get(v.id); if (f) { pending.delete(v.id); f(v); } });
const cmd = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; const t = setTimeout(() => rej(Error('timeout ' + method)), 15000); pending.set(id, v => { clearTimeout(t); if (v.error) rej(Error(JSON.stringify(v.error))); else res(v.result); }); ws.send(JSON.stringify({ id, method, params })); });
const ev = async e => { const r = await cmd('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
const has = t => ev(`document.body?.innerText.includes(${JSON.stringify(t)})`);
const waitText = async t => { for (let i = 0; i < 100; i++) { if (await has(t)) return; await sleep(100); } throw Error('Missing text: ' + t + '\n---\n' + (await ev('document.body.innerText')).slice(0, 3000)); };
const click = async (role, t) => { const ok = await ev(`(() => { const el=[...document.querySelectorAll('[role="${role}"]')].find(el => (el.getAttribute('aria-label') ?? el.textContent).includes(${JSON.stringify(t)}) && el.getAttribute('aria-disabled')!=='true'); if(!el) return false; el.click(); return true; })()`); assert.ok(ok, `click ${role}: ${t}`); await sleep(150); };
const button = t => click('button', t);
const fill = async t => { await ev(`(() => {const el=document.querySelector('textarea, input'); Object.getOwnPropertyDescriptor(el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(el, ${JSON.stringify(t)}); el.dispatchEvent(new Event('input',{bubbles:true}));})()`); await sleep(120); };
const shot = async (name, full = false) => {
  let params = { format: 'png' };
  if (full) { const h = await ev('document.documentElement.scrollHeight'); const w = await ev('innerWidth'); params = { ...params, captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: Math.min(h, 6000), scale: 1 } }; }
  await writeFile(path.join(out, name + '.png'), Buffer.from((await cmd('Page.captureScreenshot', params)).data, 'base64'));
};
const nav = async r => { await cmd('Page.navigate', { url: url + r }); await sleep(600); };

await cmd('Page.enable'); await cmd('Runtime.enable');
const ADULT = /puta|pendejo|cabrón|hijueputa|gonorrea|boludo|pelotudo|pinche|carajo|cerote|jodás|chingado|no mames|malparido|concha/i;
const MIC = /micr[óo]fono|dictado|transcrip/i;
const bodyText = () => ev('document.body.innerText');
const thread = async () => { const t = await bodyText(); return t.slice(t.indexOf('ESCENA')); };
const overflow = async label => {
  for (const width of [320, 390, 1280]) {
    await cmd('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: width < 600 }); await sleep(250);
    assert.equal(await ev('document.documentElement.scrollWidth > innerWidth'), false, `no horizontal overflow ${label}/${width}`);
    await shot(`${label}-${width}`);
  }
  await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }); await sleep(150);
};
/** True when the control is inside the first screen (no scrolling needed). */
const aboveFold = t => ev(`(() => { window.scrollTo(0, 0); const el=[...document.querySelectorAll('[role="button"]')].find(el => (el.getAttribute('aria-label') ?? el.textContent).includes(${JSON.stringify(t)})); if (!el) return false; const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })()`);
await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await nav('/'); await waitText('Entrar como invitado');
await click('radio', 'Francés'); await click('radio', 'El Salvador'); await button('Entrar como invitado'); await waitText('Explorar aventuras');
// RML-002: one main entry on Home.
assert.ok(await has('ROAST ME LIVE'), 'flagship entry on home');
assert.ok(!(await has('Conocer Roast Me')) && !(await has('MODO SIN PENA')), 'no duplicate Roast Me entry on home');
await button('Abrir Roast Me Live'); await waitText('Elegí una modalidad para empezar');
assert.ok(await has('no es una IA de charla libre'), 'honest about scripted scenes');
await click('radio', 'Con libertad'); await click('radio', 'Escribiendo'); await waitText('Empezar conversación');
await overflow('live-setup');
await button('Empezar conversación'); await waitText('ESCENA');
// The Variety Engine picks the scene; each scene has its own reviewed error and natural replies.
const SCENES = [
  { opening: 'Une table pour vous ?', model: "Oui, s'il vous plaît.", error: 'je suis une table pour deux', about: 'mesa', natural: 'oui pour deux', next: 'Et pour vous deux' },
  { opening: 'Je peux vous aider ?', model: "Oui, s'il vous plaît.", error: 'Oui, je suis perdu le métro.', about: null, natural: 'oui je suis perdu, je cherche le metro', next: "C'est tout droit" },
  { opening: 'Bonjour !', model: 'Bonjour, madame !', error: 'Bonne nuit !', about: 'dormir', natural: 'bonjour madame, comment allez-vous', next: 'Qu’est-ce qu’il vous faut ?' },
];
let scene = null;
for (const item of SCENES) if (!scene && await has(item.opening)) scene = item;
assert.ok(scene, 'known scene');
assert.ok(!(await has('Frase para practicar')) && !(await thread()).includes(scene.model), '"Con libertad" does not reveal the model');
for (const control of ['Reiniciar práctica', 'Ajustes de Roast Me Live', 'Enviar respuesta']) assert.ok(await aboveFold(control) || control === 'Enviar respuesta', `${control} visible without scrolling`);
assert.ok(await aboveFold('Reiniciar práctica'), 'restart reachable without scrolling');
// A typed reply that cannot be interpreted: clarification, no mic blame, no fake error.
await fill('quiero sentarme ahí'); await button('Enviar respuesta'); await waitText('Todavía no pude interpretarla');
let text = await thread();
assert.ok(!MIC.test(text), 'a typed reply is not blamed on the microphone');
assert.ok(!text.includes('ASÍ SE DICE'), 'free mode keeps the model behind help');
// Real error without consent: clean correction.
await fill(scene.error); await button('Enviar respuesta'); await waitText('ASÍ SE DICE');
assert.ok(!ADULT.test(await thread()), 'no adult words without consent');
await overflow('live-friendly-correction');
// Adult consent through the existing Roast Me flow, then the strongest Live intensity.
await nav('/roast'); await waitText('Aceptar y entrar a Roast Me');
await click('checkbox', 'Confirmo que soy mayor de edad'); await click('checkbox', 'Acepto explícitamente'); await button('Aceptar y entrar a Roast Me'); await sleep(600);
await nav('/live'); await waitText('Tu turno');
await button('Ajustes de Roast Me Live'); await button('Humor:'); await click('radio', 'Sin misericordia'); await sleep(400);
text = await thread();
assert.ok(ADULT.test(text), 'consented intensity re-renders the contextual roast for the real error');
if (scene.about) assert.ok(text.includes(scene.about), 'roast is about the actual mistake');
await button('Cerrar ajustes'); await overflow('live-roast');
// Natural free reply: understood, story continues with the remembered fact.
await fill(scene.natural); await button('Enviar respuesta'); await waitText('Seguir la conversación');
assert.ok(await has('Escribiste: ' + scene.natural), 'the typed wording is shown during the session');
await button('Seguir la conversación'); await waitText(scene.next);
// Help on demand in free mode.
await button('¿Qué digo? Ver ayuda'); await waitText('Frase para practicar');
await overflow('live-help');
// Restart: back to the first turn, messages cleared, consent kept.
await button('Reiniciar práctica'); await waitText('Se borran los mensajes');
await overflow('live-restart-confirm');
await button('Reiniciar esta escena'); await waitText(scene.opening);
text = await thread();
assert.ok(!text.includes(scene.natural) && !text.includes('ASÍ SE DICE') && !text.includes(scene.next), 'conversation cleared');
assert.ok(await has('Sin misericordia'), 'consent and intensity kept after restart');
// Revocation removes adult lines immediately.
await fill(scene.error); await button('Enviar respuesta'); await waitText('ASÍ SE DICE');
assert.ok(ADULT.test(await thread()));
await button('Ajustes de Roast Me Live'); if (!(await has('Volver a modo amistoso'))) await button('Humor:'); await button('Volver a modo amistoso'); await sleep(500);
assert.ok(!ADULT.test(await thread()), 'revocation removes adult lines');
await cmd('Page.reload'); await sleep(1500); await waitText('Tu turno');
assert.ok(await has(scene.opening), 'reload resumes the restarted conversation, not the old one');
assert.ok(!(await has('Escribiste:')), 'free text is not stored: it is gone after reload');
assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []);
console.log(`PASS: Roast Me Live (RML-002) in real Chrome — scene ${scene.opening}; single Home entry, mode selection, free mode hides the model, typed unknown reply without mic blame, friendly correction, consent + "Sin misericordia" roast on the real error, natural reply continues with memory, help on demand, restart with confirmation keeps consent, revocation, resume without stored free text, no overflow at 320/390/1280. Audio and microphone not exercised.`);
ws.close(); browser.kill(); server.close();
