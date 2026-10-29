import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
const windows = process.platform === 'win32';
const build = spawnSync(windows ? 'tsc.cmd' : 'tsc', ['-p', 'tsconfig.core.json'], { stdio: 'inherit', shell: windows });
if (build.status !== 0) process.exit(build.status ?? 1);
const files = readdirSync('tests').filter(file => file.endsWith('.test.cjs')).map(file => `tests/${file}`);
const test = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(test.status ?? 1);
