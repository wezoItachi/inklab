import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2).filter((argument) => argument !== '--');
const sourceDirectoryIndex = args.indexOf('--source-dir');
const sourceDirectory = args[sourceDirectoryIndex + 1];

if (!sourceDirectory) {
  console.error(
    'Usage: node scripts/refresh-remaining-battle-verification.mjs --source-dir <1200 weapon parameter directory>',
  );
  process.exit(1);
}

const steps = [
  [
    'scripts/import-leanny-remaining-parameters.mjs',
    '--source-dir',
    sourceDirectory,
  ],
  ['scripts/audit-battle-parameter-gaps.mjs'],
  [
    'scripts/audit-battle-source-omissions.mjs',
    '--source-dir',
    sourceDirectory,
  ],
  ['scripts/resolve-battle-parameter-applicability.mjs'],
  ['scripts/audit-battle-parameter-gaps.mjs'],
  ['scripts/build-battle-verification-queue.mjs'],
];

for (const step of steps) {
  const result = spawnSync(process.execPath, step, {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(
  'Refreshed remaining-family parameters, source evidence, applicability, gaps, and verification queue in the required order.',
);
