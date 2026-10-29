// Optional real-browser acceptance test. Node 22+, exported dist and a local
// Chromium executable supplied as LV_BROWSER_PATH. No browser is downloaded.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const browserPath = process.env.LV_BROWSER_PATH;
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
      if (await evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`)) return;
      await sleep(100);
    }
    throw Error(`Missing text: ${text}\n${await evaluate('document.body.innerText')}`);
  };
  const click = async (role, text) => {
    const clicked = await evaluate(`(() => { const item = [...document.querySelectorAll('[role="${role}"]')].find(item => item.textContent.includes(${JSON.stringify(text)})); if (!item || item.getAttribute('aria-disabled') === 'true') return false; item.click(); return true; })()`);
    assert.equal(clicked, true, `Clickable ${role}: ${text}`);
    await sleep(100);
  };
  const button = text => click('button', text);
  const radio = text => click('radio', text);
  const fill = async text => {
    await evaluate(`(() => { const item = document.querySelector('textarea, input'); if (!item) throw Error('Missing input'); const proto = item.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(item, ${JSON.stringify(text)}); item.dispatchEvent(new Event('input', {bubbles:true})); })()`);
    await sleep(100);
  };
  const correct = async () => {
    const retry = await evaluate(`!![...document.querySelectorAll('[role="button"]')].find(item => item.textContent.includes('Volver a comprobar'))`);
    await button(retry ? 'Volver a comprobar' : 'Comprobar respuesta');
    await waitFor('¡Bien resuelto!');
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
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await command('Page.navigate', { url });
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
  await radio('Merci !'); await button('Comprobar respuesta'); await waitFor('Vamos por partes');
  await reload(); await waitFor('Vamos por partes');
  await radio('Bonjour !'); await correct();
  await waitFor('Tu primera decisión');
  await radio('Je voudrais un thé'); await correct();
  await waitFor('Tu té ya está pedido');
  await radio('À emporter'); await correct();
  await waitFor('Preparan un vaso');
  await radio('Non, merci'); await correct();
  await waitFor('Preguntá el precio');
  await fill("C'est combien ?"); await correct();
  await waitFor('Entendé la respuesta');
  await radio('Trois euros'); await correct();
  await waitFor('Un pequeño agradecimiento');
  await fill('Merci beaucoup.'); await correct();
  await waitFor('Hasta la próxima');
  await fill('Bonne journée.'); await button('Comprobar respuesta'); await waitFor('¡Bien resuelto!');
  await reload(); await waitFor('¡Bien resuelto!');
  await button('Terminar aventura'); await waitFor('8/8 pasos completados');
  await waitFor('Intentos incorrectos: 1');
  await reload(); await waitFor('8/8 pasos completados');
  await button('Reiniciar aventura'); await button('Conservar mi avance'); await waitFor('8/8 pasos completados');
  await button('Reiniciar aventura'); await button('Confirmar reinicio'); await waitFor('Mediodía con Samir');
  await waitFor('0/8 pasos completados');
  await reload(); await waitFor('Mediodía con Samir');
  const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  await writeFile(path.join(artifacts, 'mission-mobile.png'), Buffer.from(screenshot.data, 'base64'));
  await button('Volver a Explorar'); await button('Volver al inicio'); await waitFor('Tu idioma elegido sigue siendo inglés');
  assert.deepEqual(runtimeErrors, [], 'No uncaught browser runtime errors');
  console.log('PASS: onboarding/profile, English preference preserved, tea/takeaway/sugar branch, wrong feedback reload, eight steps, completion reload, cancel/restart, alternate variant, mobile screenshot.');
} catch (error) {
  console.error('Browser stderr:', browserError);
  throw error;
} finally {
  socket?.close();
  browser.kill();
  await new Promise(resolve => server.close(resolve));
}
