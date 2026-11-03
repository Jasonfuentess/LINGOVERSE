// Optional real-browser acceptance test. Node 22+, exported dist and a local
// Chromium executable supplied as LV_BROWSER_PATH. No browser is downloaded.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const browserArgument = process.argv.indexOf('--browser');
const browserPath = process.env.LV_BROWSER_PATH ?? (browserArgument >= 0 ? process.argv[browserArgument + 1] : undefined);
if (!browserPath) throw Error('Set LV_BROWSER_PATH to an existing Chromium/Chrome/Edge executable. Export web first.');
const artifacts = path.resolve('.web-check', process.argv.includes('--rescue') ? 'rescue-learning' : process.argv.includes('--beginner') ? 'beginner-learning' : process.argv.includes('--before') ? 'premium-before' : 'premium-after');
await mkdir(artifacts, { recursive: true });
const profile = await mkdtemp(path.join(artifacts, 'profile-'));
const root = path.resolve('dist');
const server = createServer(async (request, response) => {
  try {
    const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const target = path.resolve(root, `.${name}`);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
    const extension = path.extname(target);
    const file = extension ? target : path.join(root, 'index.html');
    const body = await readFile(file);
    const types = { '.js': 'application/javascript', '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch { response.writeHead(404).end(); }
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const address = server.address();
const url = `http://127.0.0.1:${address.port}`;
const browser = spawn(browserPath, ['--headless', '--disable-gpu', ...(process.argv.includes('--in-process-gpu') ? ['--in-process-gpu'] : []), '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let browserError = '';
browser.on('error', error => { browserError = error.message; });
browser.stderr.on('data', data => { browserError = `${browserError}${data}`.slice(-4000); });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
try {
  let port;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { port = Number((await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; } catch { /* Wait for our new profile's port file. */ }
    if (browser.exitCode !== null) throw Error(`Browser exited: ${browserError}`);
    await sleep(150);
  }
  if (!port) throw Error(`Browser did not start: ${browserError}`);
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let sequence = 0;
  const pending = new Map();
  const runtimeErrors = [];
  socket.addEventListener('message', message => {
    const value = JSON.parse(message.data);
    if (value.method === 'Runtime.exceptionThrown') runtimeErrors.push(value.params.exceptionDetails.text);
    const resolve = pending.get(value.id);
    if (resolve) { pending.delete(value.id); resolve(value); }
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout: ${method}`)); }, 12000);
    pending.set(id, value => { clearTimeout(timer); if (value.error) reject(Error(JSON.stringify(value.error))); else resolve(value.result); });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const wait = async (expression, label) => {
    for (let n = 0; n < 100; n++) {
      if (await evaluate(expression)) return;
      await sleep(100);
    }
    throw Error(`Timed out: ${label}`);
  };
  const hasText = text => wait(`document.body?.innerText.includes(${JSON.stringify(text)})`, text);
  const click = async (role, text) => {
    const ok = await evaluate(`(() => { const el = [...document.querySelectorAll('[role="${role}"]')].find(el => (el.getAttribute('aria-label') ?? el.textContent).includes(${JSON.stringify(text)}) && el.getAttribute('aria-disabled') !== 'true'); if (!el) return false; el.click(); return true; })()`);
    assert.ok(ok, `Enabled ${role}: ${text}`);
    await sleep(120);
  };
  const button = text => click('button', text);
  const fill = async text => {
    await evaluate(`(() => {const el = document.querySelector('textarea, input'); if(!el) throw Error('Missing answer input'); Object.getOwnPropertyDescriptor(el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(text)}); el.dispatchEvent(new Event('input', {bubbles:true}));})()`);
    await sleep(100);
  };
  const navigate = async route => { await command('Page.navigate', { url: url + route }); await sleep(400); };
  const capture = async (name, interaction = false) => {
    for(const width of [320,390,1280]) {
      await command('Emulation.setDeviceMetricsOverride', {width,height:900,deviceScaleFactor:1,mobile:width<600});
      await sleep(180);
      await wait(`[...document.images].every(i => i.complete)`, 'images loaded');
      assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'), false, `No page overflow ${name}/${width}`);
      const overflowing = await evaluate(`[...document.querySelectorAll('div,textarea,input')].filter(el => {const r=el.getBoundingClientRect(); const css=getComputedStyle(el);return r.width>0 && css.position!=='absolute' && (r.right>innerWidth+2 || r.left < -2);}).slice(0,5).map(el=>({text:el.textContent.slice(0,60),width:el.getBoundingClientRect().width}))`);
      assert.deepEqual(overflowing, [], `No visible overflow ${name}/${width}`);
      if(interaction) await evaluate(`document.querySelector('[role="radiogroup"],textarea')?.scrollIntoView({block:'center'})`);
      await writeFile(path.join(artifacts, `${name}-${width}.png`), Buffer.from((await command('Page.captureScreenshot',{format:'png'})).data,'base64'));
    }
  };
  const prepare = async language => {
    if(process.argv.includes('--rescue') && await evaluate(`document.body.innerText.includes('Preparar esta respuesta con ayuda')`)) {
      const eventsBefore=await evaluate(`Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('lingoverse.mission.')).map(k=>[k,JSON.parse(localStorage.getItem(k)).progress?.events?.length??0]))`);
      await button('Preparar esta respuesta con ayuda');
      assert.deepEqual(await evaluate(`Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('lingoverse.mission.')).map(k=>[k,JSON.parse(localStorage.getItem(k)).progress?.events?.length??0]))`),eventsBefore,'preparing a model never submits or penalizes');
    }
    const phases = [
      ['01 / ESCUCHÁ EL MODELO','Ver significado','02 / COMPRENDÉ'],
      ['02 / COMPRENDÉ','Practicar por partes','03 / POR PARTES'],
      ['03 / POR PARTES','Repetir la frase completa','04 / REPETÍ A TU RITMO'],
      ['04 / REPETÍ A TU RITMO','Estoy listo para responder','Responder al personaje'],
    ];
    for(const [current,action,next] of phases) {
      if(!await evaluate(`document.body.innerText.includes(${JSON.stringify(current)})`)) continue;
      if(process.argv.includes('--beginner')) await capture(`guide-${language}-${action.replaceAll(' ','-')}`);
      await button(action); await hasText(next);
      if(process.argv.includes('--beginner')) {
        await command('Page.reload'); await hasText(next);
        const entry=await evaluate(`JSON.parse(localStorage.getItem('lingoverse.learning-support.v1')).languages[${JSON.stringify(language)}]`);
        assert.equal(entry.mode,'guided','guide persists per language');
      }
    }
  };
  await command('Page.enable'); await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride', {width:390,height:900,deviceScaleFactor:1,mobile:true});
  await navigate('/'); await hasText('Entrar como invitado');
  await click('radio','Francés'); await click('radio','El Salvador'); await button('Entrar como invitado');
  await hasText('Explorar aventuras'); await capture('home');
  await button('Explorar aventuras'); await hasText('Lost in London'); await capture('explore');
  await button('Abrir aventura francesa'); await hasText('Comenzar aventura'); await button('Comenzar aventura');
  await hasText('Necesito una pista');
  // LV-008-FIX-01: on a 390×844 phone the active character line must be visible without scrolling.
  await command('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true}); await sleep(180);
  const speakerTop = await evaluate(`(() => { const el=[...document.querySelectorAll('div')].find(e=>e.textContent.trim().toUpperCase()==='EN LA CONVERSACIÓN'); return el ? el.getBoundingClientRect().top : null; })()`);
  assert.ok(speakerTop !== null && speakerTop < 844 - 160, `Active turn above the fold on 390×844 (top=${speakerTop})`);
  await capture('conversation'); await prepare('fr'); await capture('answer',true);
  if(!process.argv.includes('--before')) {
    const missions = [
      ['/mission', require('../.test-build/content/cafe').cafeLesson],
      ['/london', require('../.test-build/content/london').londonLesson],
      ['/rendezvous', require('../.test-build/content/rendezvous').rendezvousLesson],
    ];
    for(const [route,lesson] of missions) {
      await navigate(route); await hasText('Volver a Explorar');
      if(await evaluate(`document.body.innerText.includes('Comenzar aventura')`)) await button('Comenzar aventura');
      await prepare(lesson.language);
      const key = `lingoverse.mission.${lesson.id}.v1`;
      const read = () => evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(key)}))?.progress`);
      await wait(`JSON.parse(localStorage.getItem(${JSON.stringify(key)}))?.progress`, 'mission started');
      let turn=0;
      while((await read()).status==='active') {
        assert.ok(turn++ < 20,'finite adventure');
        const p=await read();
        const exercise=lesson.variants.find(v=>v.id===p.variantId).exercises.find(e=>e.id===p.nodeId);
        if(process.argv.includes('--rescue') && !p.feedback?.correct) {
          await hasText('Preparar esta respuesta con ayuda');
          if(route==='/rendezvous' && exercise.id==='confirm') {
            await hasText('ui, zhé rãdevú isí');
            await capture('rendezvous-confirm-before-answer');
            // LV-008-LEARN-03: the coach opens without a prior error, keeps the draft and never answers.
            await fill('Oui, j’ai'); const savedBefore=await read();
            await button('¿Cómo se pronuncia'); await hasText('POR PARTES'); await hasText('SONIDOS PARA PRESTAR ATENCIÓN');
            await evaluate(`[...document.querySelectorAll('div')].find(e=>e.textContent.trim()==='POR PARTES')?.scrollIntoView({block:'start'})`);
            await capture('rendezvous-coach-open');
            await button('Volver a la conversación');
            assert.equal(await evaluate(`document.querySelector('textarea').value`),'Oui, j’ai','coach keeps the typed draft');
            assert.deepEqual(await read(),savedBefore,'consulting pronunciation saves nothing');
          }
          if(route==='/mission' && exercise.id==='paiement') {
            // LV-009-LEARN-04: price turn teaches the liaison, lets every option be heard, and shows each help once.
            const savedBefore=await read();
            const price=exercise.choices.find(c=>c.correct).label;
            await hasText({'Trois euros.':'truá zöró','Deux euros.':'dö zöró','Un euro.':'ẽ nöró'}[price]);
            await button('Practicar y construir mi respuesta'); await button('Construir mi respuesta'); await button('Practicar hablando sin enviar');
            await button('Escuchar las opciones'); await hasText('no la elige ni indica si es la correcta');
            for(const option of exercise.choices) await hasText(option.label);
            await button(`Significado y pronunciación de ${exercise.choices[0].label}`);
            const players=await evaluate(`[...document.querySelectorAll('[role="button"]')].filter(b=>(b.getAttribute('aria-label')??b.textContent).trim()==='Escuchar el modelo').length`);
            assert.equal(players,1,'one model player with every help open');
            await evaluate(`[...document.querySelectorAll('body *')].filter(e=>e.textContent.trim()==='Escuchar o estudiar una opción no la elige ni indica si es la correcta.').at(-1)?.scrollIntoView({block:'start'})`);
            await capture('cafe-price-options');
            assert.deepEqual(await read(),savedBefore,'listening to and studying options saves nothing');
            await button('Cerrar las opciones'); await button('Cerrar práctica');
          }
          await prepare(lesson.language);
        }
        if(!p.feedback?.correct) {
          if(exercise.kind==='choice') await click('radio',exercise.choices.find(c=>c.correct).label);
          else await fill(exercise.accepted[0]);
          const guidedAction = await evaluate(`document.body.innerText.includes('Responder al personaje') || document.body.innerText.includes('Probar otra respuesta')`);
          await button(guidedAction ? p.feedback ? 'Probar otra respuesta' : 'Responder al personaje' : p.feedback ? 'Volver a comprobar' : 'Comprobar respuesta');
          await wait(`JSON.parse(localStorage.getItem(${JSON.stringify(key)}))?.progress.feedback?.correct === true`, 'verified answer saved');
        }
        if(turn===1) await capture(route.slice(1)+'-correct');
        const current=await read();
        await button(current.feedback.next===null ? 'Terminar aventura' : 'Continuar conversación');
        await wait(`JSON.parse(localStorage.getItem(${JSON.stringify(key)}))?.progress.nodeId !== ${JSON.stringify(p.nodeId)}`, 'next turn saved');
        if(turn===1) {
          const saved=await read(); await navigate(route); await hasText('HACE UN MOMENTO');
          assert.deepEqual(await read(),saved,'resume preserves exact progress');
        }
      }
      assert.equal((await read()).completedObjectives.length,lesson.objectives.length);
      await hasText('pasos completados'); await capture(route.slice(1)+'-completed');
      await button('Reiniciar aventura'); await button('Conservar mi avance');
      assert.equal((await read()).status,'completed','cancel restart preserves progress');
      console.log(`PASS complete/resume/cancel: ${lesson.id}`);
    }
    await navigate('/'); await hasText('Explorar aventuras');
    for(const [label,text] of [['Practicar','Práctica en contexto'],['Trabajo','Todavía no hay misiones'],['Perfil','Guardar preferencias'],['Explorar','Destinos para descubrir'],['Inicio','Explorar aventuras']]) {
      await click('tab',label); await hasText(text); await capture(label.toLowerCase());
    }
    await navigate('/roast'); await hasText('Aceptar y entrar a Roast Me');
    assert.ok(await evaluate(`!!document.querySelector('[aria-disabled="true"]')`),'adult entry disabled without checks');
    await capture('roast-consent');
    // No fake consent, speech or recognition. Actual audio/microphone checks remain manual.
    await button('Prefiero aprender sin Roast Me'); await hasText('Destinos para descubrir');
  }
  assert.deepEqual(runtimeErrors,[],'No uncaught runtime errors');
  await writeFile(path.join(artifacts,'result.json'), JSON.stringify({status:'PASS', widths:[320,390,1280], phase:process.argv.includes('--before')?'before':'after', limitations:['No physical audio or microphone validation','No Android/iOS/Safari']},null,2));
  console.log('PASS: screenshots, responsive overflow, navigation and requested browser checks.');
} catch(error) { console.error('Browser stderr:', browserError); throw error; }
finally { socket?.close(); browser.kill(); await new Promise(resolve=>server.close(resolve)); }
