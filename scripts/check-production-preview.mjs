import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = 4199;
const origin = `http://127.0.0.1:${port}`;
const expectedHeaders = {
  'content-security-policy':
    "base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
  'permissions-policy':
    'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'x-permitted-cross-domain-policies': 'none',
};

let output = '';
const preview = spawn(
  process.execPath,
  [resolve(root, 'scripts/start-production.mjs'), '--port', String(port)],
  { cwd: root, env: { ...process.env, CI: 'true' }, windowsHide: true },
);

for (const stream of [preview.stdout, preview.stderr]) {
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    output = `${output}${chunk}`.slice(-16_000);
  });
}

async function waitForResponse(path) {
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (preview.exitCode !== null) {
      throw new Error(`生产预览提前退出（${preview.exitCode}）。\n${output}`);
    }
    try {
      return await fetch(`${origin}${path}`, {
        signal: AbortSignal.timeout(1000),
      });
    } catch (error) {
      lastError = error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
    }
  }
  throw new Error(`生产预览未在期限内就绪：${String(lastError)}\n${output}`);
}

try {
  const page = await waitForResponse('/');
  if (!page.ok) throw new Error(`首页返回 ${page.status}。`);
  for (const [name, expected] of Object.entries(expectedHeaders)) {
    const actual = page.headers.get(name);
    if (actual !== expected) {
      throw new Error(`${name} 响应头不匹配：${actual ?? '缺失'}`);
    }
  }

  const health = await waitForResponse('/api/health');
  const healthBody = await health.json();
  if (
    !health.ok ||
    healthBody.status !== 'ok' ||
    healthBody.service !== 'inklab'
  ) {
    throw new Error(
      `健康检查响应无效：${health.status} ${JSON.stringify(healthBody)}`,
    );
  }

  console.log('生产预览检查通过：首页、安全响应头与健康接口均正常。');
} finally {
  if (preview.exitCode === null) preview.kill('SIGTERM');
  await Promise.race([
    new Promise((resolveExit) => preview.once('exit', resolveExit)),
    new Promise((resolveTimeout) => setTimeout(resolveTimeout, 3000)),
  ]);
  if (preview.exitCode === null) preview.kill('SIGKILL');
}
