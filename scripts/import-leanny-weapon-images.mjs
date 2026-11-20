import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gameVersion = '12.0.0';
const catalogCommit = 'b669d55e0eef1f1a7f18cb7468c636ed7746c189';
const checkedAt = '2026-11-20';
const sourceBaseUrl = 'https://leanny.github.io/splat3';

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), 'utf8'));
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

const [mainDatabase, subDatabase, specialDatabase] = await Promise.all([
  readJson(`database/main-weapons.v${gameVersion}.json`),
  readJson(`database/sub-weapons.v${gameVersion}.json`),
  readJson(`database/special-weapons.v${gameVersion}.json`),
]);

const requests = [
  ...mainDatabase.weapons.map((weapon) => ({
    kind: 'main',
    id: weapon.id,
    upstreamId: weapon.upstreamRowId,
    sourcePath: `/images/weapon_flat/Path_Wst_${weapon.upstreamRowId}.png`,
  })),
  ...subDatabase.subWeapons.map((weapon) => ({
    kind: 'sub',
    id: weapon.id,
    upstreamId: weapon.upstreamId,
    sourcePath: `/images/subspe/Wsb_${weapon.upstreamId}00.png`,
  })),
  ...specialDatabase.specialWeapons.map((weapon) => ({
    kind: 'special',
    id: weapon.id,
    upstreamId: weapon.upstreamId,
    sourcePath: `/images/subspe/Wsp_${weapon.upstreamId}00.png`,
  })),
];

async function importAsset(request) {
  const sourceUrl = `${sourceBaseUrl}${request.sourcePath}`;
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`${response.status} ${sourceUrl}`);
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/png')) {
    throw new Error(`Unexpected content type ${contentType}: ${sourceUrl}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const relativePath = `assets/weapons/${request.kind}/${request.id}.png`;
  const destination = path.join(projectRoot, 'public', relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return {
    ...request,
    sourceUrl,
    relativePath: `/${relativePath}`,
    byteLength: bytes.byteLength,
    sha256: sha256(bytes),
  };
}

const imported = [];
const concurrency = 12;
for (let offset = 0; offset < requests.length; offset += concurrency) {
  imported.push(...(await Promise.all(requests.slice(offset, offset + concurrency).map(importAsset))));
  process.stdout.write(`\r已导入 ${imported.length}/${requests.length}`);
}
process.stdout.write('\n');

const manifest = {
  gameVersion,
  checkedAt,
  catalogCommit,
  sourceBaseUrl,
  attribution: 'Data provided by Lean',
  authorizationUrl:
    'https://github.com/Leanny/splat3/issues/7#issuecomment-6402785216',
  note: 'Nintendo retains the underlying rights to the game images. These files are not relicensed under INKLAB\'s AGPL-3.0-only license.',
  counts: {
    main: imported.filter(({ kind }) => kind === 'main').length,
    sub: imported.filter(({ kind }) => kind === 'sub').length,
    special: imported.filter(({ kind }) => kind === 'special').length,
    total: imported.length,
  },
  assets: imported,
};

await writeFile(
  path.join(projectRoot, `database/weapon-image-assets.v${gameVersion}.json`),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(
  `完成：${manifest.counts.main} 主武器、${manifest.counts.sub} 副武器、${manifest.counts.special} 特殊武器。`,
);
