// LV-007B real-Chrome conversation check against the exported dist (run npm run export:web first).
// Usage: node scripts/check-conversation.mjs --browser <chrome.exe>  (or LV_BROWSER_PATH). No audio or microphone is used.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const project = process.cwd(); const out = path.resolve('.web-check', 'conversation');
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
const log = (...a) => console.log(...a);
const nav = async r => { await cmd('Page.navigate', { url: url + r }); await sleep(600); };

await cmd('Page.enable'); await cmd('Runtime.enable');
await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
const draft = () => ev(`document.querySelector('textarea')?.value ?? null`);
const answerText = async t => { await fill(t); await button((await has('Probar otra respuesta')) ? 'Probar otra respuesta' : 'Responder al personaje'); await sleep(400); };
const focusShot = async (name, anchor) => { await ev(`[...document.querySelectorAll('body *')].filter(e=>e.textContent.trim().startsWith(${JSON.stringify(anchor)})).at(-1)?.scrollIntoView({block:'center'})`); await sleep(250); await shot(name); };
await nav('/'); await waitText('Entrar como invitado');
await click('radio', 'Inglés'); await click('radio', 'Argentina'); await button('Entrar como invitado'); await waitText('Explorar aventuras');
// London: pick the station story deterministically by restarting until Maya appears.
await nav('/london'); await waitText('Volver a Explorar'); await button('Comenzar aventura'); await sleep(500);
for (let i = 0; i < 6 && !(await has('Maya')) && !(await has('Do you need help?')); i++) { await button('Reiniciar aventura'); await button('Confirmar reinicio'); await sleep(500); }
log('Story:', (await has('Do you need help?')) ? 'station-arrival' : 'riverside-rain');
await click('radio', 'Hello! Yes, please.'); await button('Responder al personaje'); await waitText('Continuar conversación'); await button('Continuar conversación'); await sleep(400);
await answerText("I'm new here."); await waitText('Continuar conversación'); await button('Continuar conversación'); await sleep(400);
log('At help turn:', await has('What do you need?'));
const station = await has('Maya');
await answerText(station ? 'The hostel.' : 'The theatre.');
assert.ok(await has('Necesita una aclaración')); assert.ok(await has(station ? 'The hostel? Sure, I can help with that.' : 'The theatre? Sure, I can help with that.'), 'in-story clarification'); assert.equal(await draft(), station ? 'The hostel.' : 'The theatre.', 'draft kept');
await focusShot('01-london-ambiguous', 'Necesita una aclaración');
await answerText(station ? "I'm looking for the hostel." : "I'm looking for the theatre.");
assert.ok(await has(station ? 'Yes, I know it' : 'It is not far'), 'character reacts to the destination');
await button('Continuar conversación'); await sleep(500);
assert.ok(await has(station ? 'You can walk or take a bus' : 'You can go by the river')); assert.equal(await has('Where do you need to go?'), false, 'destination is not asked again');
await focusShot('02-london-after-destination', station ? 'You can walk' : 'You can go by');
await cmd('Page.reload'); await sleep(1500); await waitText('Volver a Explorar');
assert.ok(await has(station ? 'You can walk or take a bus' : 'You can go by the river'), 'resume keeps turn'); assert.equal(await has('Where do you need to go?'), false);
// Café: thé à emporter → contextual prompt
await nav('/profile'); await waitText('Guardar preferencias'); await click('radio', 'Francés'); await button('Guardar preferencias'); await sleep(400);
await nav('/mission'); await waitText('Volver a Explorar'); if (await has('Comenzar aventura')) await button('Comenzar aventura'); await sleep(500);
const pick = async label => { await click('radio', label); await button('Responder al personaje'); await waitText('Continuar conversación'); await button('Continuar conversación'); await sleep(400); };
await pick('Bonjour'); 
const tea = await ev(`[...document.querySelectorAll('[role="radio"]')].map(r=>r.textContent).find(t=>t.includes('thé'))`); await pick(tea.replace(/[○●]/g,'').trim());
const away = await ev(`[...document.querySelectorAll('[role="radio"]')].map(r=>r.textContent).find(t=>t.includes('emporter'))`); await pick(away.replace(/[○●]/g,'').trim());
const sugar = await ev(`[...document.querySelectorAll('[role="radio"]')].map(r=>r.textContent).find(t=>/Non|Sans/.test(t))`); await pick(sugar.replace(/[○●]/g,'').trim());
assert.ok(await has('Votre thé à emporter est prêt.'), 'server remembers drink and place');
await focusShot('03-cafe-context', 'Votre thé à emporter');
// Rendez-vous: minor error in French
await nav('/rendezvous'); await waitText('Volver a Explorar'); if (await has('Comenzar aventura')) await button('Comenzar aventura'); await sleep(500);
const greet = await ev(`[...document.querySelectorAll('[role="radio"]')].map(r=>r.textContent).find(t=>/Bonjour !|Bonsoir !/.test(t) && !t.includes('excusez'))`); await pick(greet.replace(/[○●]/g,'').trim());
await answerText('Oui, je ai rendez-vous ici.');
assert.ok(await has('¡Se entendió!') && await has('UNA FORMA MÁS PRECISA') && await has('Continuar conversación'), 'minor error continues with a better form');
await focusShot('04-rdv-minor', '¡Se entendió!');
assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []);
console.log('PASS: LV-007B ambiguity, remembered destination, resume, café memory and French minor error in real Chrome. Audio and microphone not exercised.');
ws.close(); browser.kill(); server.close();
