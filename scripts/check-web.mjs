// Optional real-browser acceptance test. Node 22+, exported dist and a local
// Chromium executable supplied as LV_BROWSER_PATH. No browser is downloaded.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const browserArgument = process.argv.indexOf('--browser');
const browserPath = process.env.LV_BROWSER_PATH ?? (browserArgument >= 0 ? process.argv[browserArgument + 1] : undefined);
if (!browserPath) throw Error('Set LV_BROWSER_PATH to an existing Chromium/Chrome/Edge executable. Export web first.');
const artifacts = path.resolve('.web-check');
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
    const types = { '.js': 'application/javascript', '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.json': 'application/json' };
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch { response.writeHead(404).end(); }
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const address = server.address();
const url = `http://127.0.0.1:${address.port}`;
const browser = spawn(browserPath, ['--headless', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
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
  const waitFor = async text => {
    for (let attempt = 0; attempt < 80; attempt++) {
      if (await evaluate(`Boolean(document.body?.innerText?.includes(${JSON.stringify(text)}))`)) return;
      await sleep(100);
    }
    throw Error(`Missing text: ${text}\n${await evaluate("document.body?.innerText ?? '(sin body)'")}`);
  };
  const click = async (role, text) => {
    const clicked = await evaluate(`(() => { const item = [...document.querySelectorAll('[role="${role}"]')].find(item => item.textContent.toLocaleLowerCase().includes(${JSON.stringify(text.toLocaleLowerCase())})); if (!item || item.getAttribute('aria-disabled') === 'true') return false; item.click(); return true; })()`);
    assert.equal(clicked, true, `Clickable ${role}: ${text}`);
    await sleep(100);
  };
  const button = text => click('button', text);
  // Trusted pointer events for real browser speech activation (no mocked synthesizer).
  const userButton = async text => {
    const point = await evaluate(`(() => { const b=[...document.querySelectorAll('[role="button"]')].find(b => (b.getAttribute('aria-label') || b.textContent).includes(${JSON.stringify(text)})); if(!b || b.getAttribute('aria-disabled')==='true') return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
    assert.ok(point, `Enabled voice button: ${text}`);
    await command('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
    await command('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
    await sleep(150);
  };
  const radio = text => click('radio', text);
  const fill = async text => {
    await evaluate(`(() => { const item = document.querySelector('textarea, input'); if (!item) throw Error('Missing input'); const proto = item.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(item, ${JSON.stringify(text)}); item.dispatchEvent(new Event('input', {bubbles:true})); })()`);
    await sleep(100);
  };
  const correct = async () => {
    const retry = await evaluate(`!![...document.querySelectorAll('[role="button"]')].find(item => item.textContent.includes('Volver a comprobar'))`);
    await button(retry ? 'Volver a comprobar' : 'Comprobar respuesta');
    await waitFor('Continuar conversación');
    await button('Continuar conversación');
  };
  const reload = async () => {
    const previous = await evaluate('performance.timeOrigin');
    await command('Page.reload');
    for (let attempt = 0; attempt < 80; attempt++) {
      try { if (await evaluate(`performance.timeOrigin !== ${previous} && document.readyState === 'complete'`)) return; }
      catch { /* The execution context can disappear during real navigation. */ }
      await sleep(100);
    }
    throw Error('Page did not reload');
  };
  console.log('Browser:', await command('Browser.getVersion'));
  await command('Page.enable');
  await command('Runtime.enable');
  if (process.argv.includes('--voice')) await command('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__voiceQA = [];
    if (window.speechSynthesis) {
      const nativeSpeak = speechSynthesis.speak.bind(speechSynthesis);
      speechSynthesis.speak = utterance => {
        const record = {text:utterance.text,language:utterance.lang,voice:utterance.voice?.name,events:[]};
        window.__voiceQA.push(record);
        for(const event of ['start','end','error']) utterance.addEventListener(event, e => record.events.push({type:event,error:e.error,time:Date.now()}));
        return nativeSpeak(utterance);
      };
    }` });
  await command('Page.bringToFront');
  await command('Emulation.setFocusEmulationEnabled', { enabled: true });
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await command('Page.navigate', { url });
  if (process.argv.includes('--voice')) {
    await waitFor('Tu viaje empieza'); await radio('Francés'); await radio('El Salvador'); await button('Entrar como invitado');
    await waitFor('Explorar aventuras'); await button('Explorar aventuras'); await button('Abrir aventura francesa');
    await waitFor('Comenzar aventura'); await button('Comenzar aventura'); await waitFor('Entrás al café');
    await sleep(2200);
    const available = await evaluate(`speechSynthesis.getVoices().map(v=>({name:v.name,language:v.lang,local:v.localService}))`);
    console.log('Actual Chrome voices:', JSON.stringify(available));
    assert.equal(await evaluate('window.__voiceQA.length'), 0, 'No automatic playback');
    await userButton('Activar audio'); await waitFor('Silenciar audio');
    await userButton('Voces del dispositivo');
    const localFrench = available.some(v => v.local && v.language.startsWith('fr'));
    const localSpanish = available.some(v => v.local && v.language.startsWith('es'));
    if (!localFrench || !localSpanish) {
      if (!localFrench) await waitFor('Voz francesa no disponible');
      await userButton('Permitir voces del navegador con Internet');
      await waitFor('Usar solo voces locales');
      assert.equal(await evaluate('window.__voiceQA.length'), 0, 'Opt-in still does not autoplay');
    }
    const french = available.some(v => v.language.startsWith('fr'));
    const spanish = available.some(v => v.language.startsWith('es'));
    const nativeEvent = async (index, type) => {
      for(let attempt=0; attempt<100; attempt++) {
        const record = await evaluate(`window.__voiceQA[${index}]`);
        if(record?.events.some(e=>e.type===type)) return record;
        if(record?.events.some(e=>e.type==='error')) throw Error(`Native speech error: ${JSON.stringify(record)}`);
        await sleep(100);
      }
      throw Error(`No native ${type}: ${JSON.stringify(await evaluate('window.__voiceQA'))}`);
    };
    if (french) {
      await userButton('Escuchar a '); await nativeEvent(0,'start'); await nativeEvent(0,'end');
      await userButton('Repetir a '); await nativeEvent(1,'start'); await userButton('Detener audio');
      assert.equal(await evaluate('speechSynthesis.speaking || speechSynthesis.pending'), false);
      await userButton('Repetir a '); await nativeEvent(2,'start'); await userButton('Silenciar audio');
      assert.equal(await evaluate('speechSynthesis.speaking || speechSynthesis.pending'), false);
      await userButton('Activar audio');
    } else {
      await waitFor('Voz francesa no disponible');
      assert.equal(await evaluate(`document.querySelector('[aria-label^="Escuchar a "]').getAttribute('aria-disabled')`), 'true');
    }
    await radio('Merci !'); await button('Comprobar respuesta'); await waitFor('Vamos por partes');
    if (spanish) {
      const index = await evaluate('window.__voiceQA.length');
      await userButton('Escuchar al entrenador'); await nativeEvent(index,'start');
      await userButton('Volver a Explorar');
      await sleep(150);
      assert.equal(await evaluate('speechSynthesis.speaking || speechSynthesis.pending'), false, 'Navigation cancels real synthesis');
    }
    const evidence = { browser: await command('Browser.getVersion'), available, localFrench, localSpanish, french, spanish, records: await evaluate('window.__voiceQA'), runtimeErrors };
    await writeFile(path.join(artifacts,'voice-real-chrome.json'), JSON.stringify(evidence,null,2));
    await writeFile(path.join(artifacts,'voice-controls.png'), Buffer.from((await command('Page.captureScreenshot',{format:'png'})).data,'base64'));
    assert.deepEqual(runtimeErrors, []);
    if (!french || !spanish) { console.log('LIMITATION: Required French/Spanish voices absent; real playback acceptance remains unverified for missing languages. Text fallback checked.'); process.exitCode = 2; }
    else console.log('PASS: real Chrome FR start/end/repeat, stop, mute, ES coach start and navigation cancellation; trusted pointer input, no synthesizer mock. See evidence for local/network voices.');
  } else if (process.env.LV_ROAST_QA === '1' || process.argv.includes('--roast')) {
    await waitFor('Tu viaje empieza'); await radio('Francés'); await radio('El Salvador'); await button('Entrar como invitado');
    await waitFor('Explorar aventuras'); await button('Explorar aventuras'); await button('Conocer Roast Me');
    await waitFor('Francés con filo');
    await click('checkbox', 'Confirmo que soy mayor de edad');
    await click('checkbox', 'Acepto explícitamente'); await button('Aceptar y entrar');
    await waitFor('Comenzar aventura'); await button('Comenzar aventura'); await waitFor('Entrás al café');
    await evaluate(`document.querySelector('textarea').focus()`);
    await fill('Bon Jovi');
    // Reduced mobile viewport exercises layout/scroll; it is NOT a real OS keyboard.
    for (const width of [320, 390]) {
      await command('Emulation.setDeviceMetricsOverride', { width, height: 420, deviceScaleFactor: 1, mobile: true });
      await sleep(300);
      const bounds = await evaluate(`(() => { const input=document.querySelector('textarea'); const button=[...document.querySelectorAll('[role="button"]')].find(b=>b.textContent==='Comprobar respuesta'); const i=input.getBoundingClientRect(); const b=button.getBoundingClientRect(); return {inputTop:i.top,inputBottom:i.bottom,buttonTop:b.top,buttonBottom:b.bottom,height:window.visualViewport.height,focused:document.activeElement===input,overflow:document.documentElement.scrollWidth>window.innerWidth}; })()`);
      assert.equal(bounds.focused,true); assert.equal(bounds.overflow,false);
      if (!(bounds.inputTop>=0 && bounds.buttonBottom<=bounds.height)) console.log('Scroll diagnostics',await evaluate(`Array.from(document.querySelectorAll('div')).filter(e=>getComputedStyle(e).overflowY==='auto'||getComputedStyle(e).overflowY==='scroll').map(e=>({height:e.clientHeight,scrollHeight:e.scrollHeight,scrollTop:e.scrollTop,top:e.getBoundingClientRect().top}))`));
      assert.ok(bounds.inputTop>=0 && bounds.buttonBottom<=bounds.height,JSON.stringify(bounds));
    }
    const keyboardShot=await command('Page.captureScreenshot',{format:'png'});
    await writeFile(path.join(artifacts,'roast-reduced-viewport.png'),Buffer.from(keyboardShot.data,'base64'));
    await button('Comprobar respuesta'); await waitFor('Vamos por partes');
    const readRoast = () => evaluate(`JSON.parse(localStorage.getItem('lingoverse.mission.roast-cafe-fr-a1.v1'))`);
    const greeting=await readRoast(); assert.equal(greeting.reaction.referenceId,'reference-v1:bon-jovi');
    await reload(); await waitFor('Vamos por partes'); assert.deepEqual((await readRoast()).reaction,greeting.reaction);
    await fill('Bonjour'); await correct();
    await radio('thé, s’il vous plaît.'); await correct();
    await radio('emporter'); await correct();
    const without = await evaluate(`document.body.innerText.includes('Sans sucre, merci.')`);
    await radio(without ? 'Sans sucre, merci.' : 'Non, merci'); await correct();
    await fill("C'est combien ?"); await correct();
    const amounts = {'matin-lucie':'Trois euros','midi-samir':'Deux euros','pluie-camille':'Deux euros','carnet-alex':'Un euro','balade-noemie':'Trois euros','lecture-hugo':'Trois euros'};
    await radio(amounts[(await readRoast()).progress.variantId]); await correct();
    await fill('Messi Goku'); await button('Comprobar respuesta'); await waitFor('Vamos por partes');
    const thanks=await readRoast(); assert.equal(thanks.reaction.referenceId,'reference-v1:messi-goku'); assert.equal(thanks.progress.feedback.correct,false); assert.equal(thanks.progress.events.at(-1).answer.text,'');
    await reload(); await waitFor('Vamos por partes'); assert.deepEqual((await readRoast()).reaction,thanks.reaction);
    await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await evaluate(`(() => { const line=[...document.querySelectorAll('div')].find(e=>e.textContent===${JSON.stringify(thanks.reaction.text)}); if (!line) throw Error('Missing reference feedback'); line.scrollIntoView({block:'center'}); })()`);
    await sleep(150);
    const shot=await command('Page.captureScreenshot',{format:'png'}); await writeFile(path.join(artifacts,'roast-easter-egg.png'),Buffer.from(shot.data,'base64'));
    await command('Page.navigate', { url: `${url}/mission` });
    await waitFor('Comenzar aventura'); await button('Comenzar aventura'); await waitFor('Entrás al café');
    await button('Usar estilo Roast Me'); await waitFor('Estilo Roast Me activo');
    await radio('Merci !'); await button('Comprobar respuesta'); await waitFor('Vamos por partes');
    const readCafe = () => evaluate(`JSON.parse(localStorage.getItem('lingoverse.mission.fr-a1-paris-cafe.v1'))`);
    const styled = await readCafe(); assert.equal(styled.reaction.mode, 'roast');
    await reload(); await waitFor('Vamos por partes'); assert.deepEqual((await readCafe()).reaction, styled.reaction);
    await button('Revocar consentimiento adulto'); await waitFor('Vamos por partes');
    assert.equal(await evaluate(`document.body.innerText.includes(${JSON.stringify(styled.reaction.text)})`), false);
    assert.deepEqual((await readCafe()).progress, styled.progress);
    await command('Page.navigate', { url: `${url}/roast` }); await waitFor('Francés con filo');
    assert.equal(await evaluate(`document.body.innerText.includes(${JSON.stringify(thanks.reaction.text)})`),false);
    assert.deepEqual(runtimeErrors,[]);
    console.log('PASS: Roast consent, 320/390 px reduced viewport, input focus, visible input/action, no horizontal overflow, Bon Jovi and Messi Goku incorrect; independent and adventure-style snapshots reload; revocation hides adult content and keeps cafe progress. Reduced viewport is not an OS keyboard.');
  } else {
  await waitFor('Tu viaje empieza');
  await radio('Francés');
  for (const region of ['El Salvador', 'México', 'Colombia', 'Argentina']) await radio(region);
  await button('Entrar como invitado');
  await waitFor('Ver y cambiar mi perfil');
  await button('Ver y cambiar mi perfil');
  await waitFor('Hacelo tuyo.');
  await radio('Inglés');
  await button('Guardar preferencias');
  await waitFor('Preferencias guardadas');
  await button('Volver al inicio');
  await waitFor('Tu idioma elegido sigue siendo inglés');
  await button('Explorar aventuras');
  await waitFor('Entrá en la historia.');
  await button('Abrir aventura francesa');
  await waitFor('Comenzar aventura');
  await button('Comenzar aventura');
  await waitFor('Entrás al café');
  for (const width of [320, 390, 1280]) {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: width < 600 });
    await sleep(150);
    assert.equal(await evaluate('document.documentElement.scrollWidth > window.innerWidth'), false);
    const shot = await command('Page.captureScreenshot', { format: 'png' });
    await writeFile(path.join(artifacts, `conversation-${width}.png`), Buffer.from(shot.data, 'base64'));
  }
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  assert.equal(await evaluate(`document.body.innerText.includes('Comprender «')`), false, 'teaching is not revealed before trying');
  await button('Necesito una pista');
  assert.equal(await evaluate(`document.body.innerText.includes('Comprender «')`), false, 'first hint does not reveal complete expressions');
  await button('Ver traducción y expresiones');
  await waitFor('Comprender «');
  await button('Ocultar expresiones');
  await button('Cerrar ayuda');
  await radio('Merci !'); await button('Comprobar respuesta'); await waitFor('Vamos por partes');
  await writeFile(path.join(artifacts, 'conversation-retry.png'), Buffer.from((await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })).data, 'base64'));
  await reload(); await waitFor('Vamos por partes');
  await radio('Bonjour !'); await correct();
  await waitFor('Tu primera decisión');
  await button('Revisar conversación anterior');
  assert.equal(await evaluate(`document.body.innerText.split('Vos · respuesta verificada').length - 1`), 1);
  await reload(); await waitFor('Tu primera decisión');
  await button('Revisar conversación anterior');
  assert.equal(await evaluate(`document.body.innerText.split('Vos · respuesta verificada').length - 1`), 1);
  await button('Cerrar conversación anterior');
  await radio('thé, s’il vous plaît.'); await correct();
  await waitFor('Tu té ya está pedido');
  await radio('À emporter'); await correct();
  await waitFor('Preparan un vaso');
  const withWithout = await evaluate(`!![...document.querySelectorAll('[role="radio"]')].find(item => item.textContent.includes('Sans sucre, merci.'))`);
  await radio(withWithout ? 'Sans sucre, merci.' : 'Non, merci'); await correct();
  await waitFor('Preguntá el precio');
  await evaluate(`document.querySelector('textarea').focus()`);
  await command('Emulation.setDeviceMetricsOverride', { width: 320, height: 420, deviceScaleFactor: 1, mobile: true });
  await sleep(300);
  const bounds = await evaluate(`(() => { const i=document.querySelector('textarea'); const b=[...document.querySelectorAll('[role="button"]')].find(b=>b.textContent==='Comprobar respuesta'); return {top:i.getBoundingClientRect().top,bottom:b.getBoundingClientRect().bottom,height:window.visualViewport.height,focus:document.activeElement===i}; })()`);
  assert.ok(bounds.top >= 0 && bounds.bottom <= bounds.height && bounds.focus, JSON.stringify(bounds));
  const keyboardShot = await command('Page.captureScreenshot', { format: 'png' });
  await writeFile(path.join(artifacts, 'conversation-keyboard-viewport.png'), Buffer.from(keyboardShot.data, 'base64'));
  await fill("C'est combien ?"); await correct();
  await waitFor('Entendé la respuesta');
  const savedProgress = await evaluate(`JSON.parse(localStorage.getItem('lingoverse.mission.fr-a1-paris-cafe.v1')).progress`);
  const amounts = { 'matin-lucie': 'Trois euros', 'midi-samir': 'Deux euros', 'pluie-camille': 'Deux euros', 'carnet-alex': 'Un euro', 'balade-noemie': 'Trois euros', 'lecture-hugo': 'Trois euros' };
  await radio(savedProgress.contentVersion === 1 ? 'Trois euros' : amounts[savedProgress.variantId]); await correct();
  await waitFor('Un pequeño agradecimiento');
  await fill('Merci beaucoup.'); await correct();
  await waitFor('Hasta la próxima');
  await fill('Bonne journée.'); await button('Comprobar respuesta'); await waitFor('¡Bien resuelto!');
  await reload(); await waitFor('¡Bien resuelto!');
  await button('Terminar aventura'); await waitFor('8/8 pasos completados');
  await waitFor('Intentos incorrectos: 1');
  await waitFor('Te llevás más que un café.');
  await waitFor('Pedir una bebida');
  await waitFor('Bonne journée.');
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await evaluate(`document.querySelector('[role="progressbar"]').scrollIntoView()`);
  await writeFile(path.join(artifacts, 'conversation-completed.png'), Buffer.from((await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })).data, 'base64'));
  await reload(); await waitFor('8/8 pasos completados');
  await button('Reiniciar aventura'); await button('Conservar mi avance'); await waitFor('8/8 pasos completados');
  await button('Reiniciar aventura'); await button('Confirmar reinicio');
  await waitFor('0/8 momentos completados');
  const selectedVariant = await evaluate(`JSON.parse(localStorage.getItem('lingoverse.mission.fr-a1-paris-cafe.v1')).progress.variantId`);
  await reload(); await waitFor('0/8 momentos completados');
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('lingoverse.mission.fr-a1-paris-cafe.v1')).progress.variantId`), selectedVariant);
  const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  await writeFile(path.join(artifacts, 'mission-mobile.png'), Buffer.from(screenshot.data, 'base64'));
  await button('Volver a Explorar'); await button('Volver al inicio'); await waitFor('Tu idioma elegido sigue siendo inglés');
  assert.deepEqual(runtimeErrors, [], 'No uncaught browser runtime errors');
  console.log('PASS: onboarding/profile, English preference preserved, tea/takeaway/sugar branch, wrong feedback reload, eight steps, completion reload, cancel/restart, persisted selected variant, mobile screenshot.');
  }
} catch (error) {
  console.error('Browser stderr:', browserError);
  throw error;
} finally {
  socket?.close();
  browser.kill();
  await new Promise(resolve => server.close(resolve));
}
