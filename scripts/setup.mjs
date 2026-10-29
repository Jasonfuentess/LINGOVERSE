import { spawnSync } from 'node:child_process';

// SDK 57 dependencies are declared in package.json from the official template.
// Install once, then validate without rewriting the manifest or upgrading SDK.
const commands = [
  ['install', '--fetch-retries=0', '--fetch-timeout=20000'],
  ['run', 'check:expo'],
];
for (const args of commands) {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    stdio: 'inherit', shell: process.platform === 'win32',
  });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}
