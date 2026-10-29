import { lookup } from 'node:dns/promises';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';

// No credentials, global settings or security controls are read or changed.
const hostname = 'registry.npmjs.org';
let failed = false;
try {
  const cache = path.resolve('.npm-cache');
  await mkdir(cache, { recursive: true });
  const directory = await mkdtemp(path.join(cache, 'lv001b-probe-'));
  const file = path.join(directory, 'write-check.txt');
  await writeFile(file, 'LV-001B write probe');
  console.log(JSON.stringify({ check: 'filesystem', file, readBack: await readFile(file, 'utf8') }));
} catch (error) {
  failed = true;
  console.error(JSON.stringify({ check: 'filesystem', code: error.code, syscall: error.syscall, path: error.path, message: error.message }));
}
try {
  const addresses = await lookup(hostname, { all: true });
  console.log(JSON.stringify({ check: 'dns', hostname, addresses }));
} catch (error) {
  failed = true;
  console.error(JSON.stringify({ check: 'dns', code: error.code, message: error.message }));
}
await new Promise(resolve => {
  const request = https.get(`https://${hostname}/expo`, { timeout: 10000 }, response => {
    console.log(JSON.stringify({ check: 'https', status: response.statusCode }));
    if (response.statusCode !== 200) failed = true;
    response.resume();
    response.on('end', resolve);
    response.on('error', error => { failed = true; console.error(error.message); resolve(); });
  });
  request.on('timeout', () => request.destroy(new Error('HTTPS timeout after 10000ms')));
  request.on('error', error => {
    failed = true;
    const errors = error.errors ?? [error];
    console.error(JSON.stringify({ check: 'https', code: error.code, errors: errors.map(item => ({ code: item.code, syscall: item.syscall, address: item.address, port: item.port, message: item.message })) }));
    resolve();
  });
});
process.exitCode = failed ? 1 : 0;
