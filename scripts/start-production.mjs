import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const wrangler = resolve(root, 'node_modules/wrangler/bin/wrangler.js');
const forwardedArgs = process.argv.slice(2);
if (forwardedArgs[0] === '--') forwardedArgs.shift();

const child = spawn(
  process.execPath,
  [wrangler, 'dev', '--config', 'dist/server/wrangler.json', ...forwardedArgs],
  {
    cwd: root,
    env: {
      ...process.env,
      MINIFLARE_REGISTRY_PATH: resolve(root, '.wrangler/registry'),
      WRANGLER_LOG_PATH: resolve(root, '.wrangler/logs'),
      WRANGLER_WRITE_LOGS: 'false',
      XDG_CONFIG_HOME: resolve(root, '.wrangler/config'),
    },
    stdio: 'inherit',
    windowsHide: true,
  },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('error', (error) => {
  console.error(`无法启动本地生产预览：${error.message}`);
  process.exitCode = 1;
});

child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
