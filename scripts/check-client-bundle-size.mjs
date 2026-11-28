import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const chunkDirectory = join('dist', 'client', '_next', 'static', 'chunks');
const manifestPath = join('dist', 'client', '.vite', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const pageChunks = readdirSync(chunkDirectory).filter((name) =>
  /^page-[^.]+\.js$/.test(name),
);

if (pageChunks.length !== 1) {
  throw new Error(
    `预期找到 1 个首页脚本，实际找到 ${pageChunks.length} 个：${pageChunks.join(', ') || '无'}`,
  );
}

const pageChunk = pageChunks[0];
const source = readFileSync(join(chunkDirectory, pageChunk));
const rawBytes = source.byteLength;
const gzipBytes = gzipSync(source).byteLength;
const rawLimit = 980_000;
const gzipLimit = 70_000;

console.log(
  `首页脚本 ${pageChunk}：${(rawBytes / 1000).toFixed(1)} kB，gzip ${(gzipBytes / 1000).toFixed(1)} kB。`,
);

if (rawBytes > rawLimit || gzipBytes > gzipLimit) {
  throw new Error(
    `首页脚本超过预算：原始上限 ${(rawLimit / 1000).toFixed(0)} kB，gzip 上限 ${(gzipLimit / 1000).toFixed(0)} kB。请优先拆分非首屏分区。`,
  );
}

const lazySections = [
  ['salmon-run-lab', '鲑鱼跑实验室'],
  ['ability-wiki', '能力百科'],
  ['scheme-library', '玩家方案库'],
  ['motion-lab', '鱿鱼滚行练习器'],
  ['universal-planner', '通用装备规划'],
  ['main-weapon-verification', '主武参数核验状态'],
  ['main-weapon-efficiency-panel', '主武参数分析'],
  ['main-ink-saver-panel', '主武省墨分析'],
  ['sub-ink-saver-panel', '副武省墨分析'],
  ['sub-power-panel', '副武器性能分析'],
  ['ink-recovery-panel', '对战回墨分析'],
  ['quick-super-jump-panel', '超级跳跃时间分析'],
  ['movement-speed-panel', '游速与走速分析'],
  ['action-intensify-panel', '行动强化分析'],
  ['enemy-ink-resistance-panel', '对手墨汁影响分析'],
  ['special-gauge-panel', '特殊武器槽分析'],
  ['special-power-panel', '特殊武器性能分析'],
  ['quick-respawn-panel', '条件复活时间分析'],
  ['sub-resistance-panel', '次要武器影响分析'],
  ['fixed-ability-panel', '固定主能力配装联动'],
  ['loadout-context-analysis', '当前配装上下文分析'],
];

for (const [prefix, label] of lazySections) {
  const chunk = readdirSync(chunkDirectory).find((name) =>
    new RegExp(`^${prefix}-[^.]+\\.js$`).test(name),
  );

  if (!chunk) {
    throw new Error(`${label}未生成独立脚本，按需加载可能已经回退。`);
  }

  console.log(`按需模块检查通过：${chunk}。`);
}

function manifestEntryByName(name) {
  return Object.entries(manifest).find(([, entry]) => entry.name === name);
}

function collectImportedNames(entryKey, visited = new Set()) {
  if (visited.has(entryKey)) return visited;
  visited.add(entryKey);
  const entry = manifest[entryKey];
  for (const importedKey of entry?.imports ?? []) {
    collectImportedNames(importedKey, visited);
  }
  return visited;
}

const parameterChunkEntry = manifestEntryByName('weapons');
if (!parameterChunkEntry) {
  throw new Error('未找到主武参数数据库脚本，无法执行参数包预算检查。');
}
const [, parameterChunk] = parameterChunkEntry;
const parameterSource = readFileSync(
  join('dist', 'client', parameterChunk.file),
);
const parameterRawBytes = parameterSource.byteLength;
const parameterGzipBytes = gzipSync(parameterSource).byteLength;
console.log(
  `主武参数数据库：${(parameterRawBytes / 1000).toFixed(1)} kB，gzip ${(parameterGzipBytes / 1000).toFixed(1)} kB。`,
);
if (parameterRawBytes > 900_000 || parameterGzipBytes > 35_000) {
  throw new Error('主武参数数据库超过独立包预算，请检查是否误并入其他数据。');
}

for (const [featureName, label] of [
  ['salmon-run-lab', '鲑鱼跑实验室'],
  ['scheme-library', '玩家方案库'],
]) {
  const featureEntry = manifestEntryByName(featureName);
  if (!featureEntry) throw new Error(`${label}缺少构建清单记录。`);
  const importedNames = [...collectImportedNames(featureEntry[0])].map(
    (key) => manifest[key]?.name,
  );
  if (importedNames.includes('weapons')) {
    throw new Error(`${label}误加载完整主武参数数据库。`);
  }
  console.log(`${label}未加载完整主武参数数据库。`);
}
