import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const chunkDirectory = join('dist', 'client', '_next', 'static', 'chunks');
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
const rawLimit = 1_050_000;
const gzipLimit = 82_000;

console.log(
  `首页脚本 ${pageChunk}：${(rawBytes / 1000).toFixed(1)} kB，gzip ${(gzipBytes / 1000).toFixed(1)} kB。`,
);

if (rawBytes > rawLimit || gzipBytes > gzipLimit) {
  throw new Error(
    `首页脚本超过预算：原始上限 ${(rawLimit / 1000).toFixed(0)} kB，gzip 上限 ${(gzipLimit / 1000).toFixed(0)} kB。请优先拆分非首屏分区。`,
  );
}

const salmonChunk = readdirSync(chunkDirectory).find((name) =>
  /^salmon-run-lab-[^.]+\.js$/.test(name),
);

if (!salmonChunk) {
  throw new Error('鲑鱼跑实验室未生成独立脚本，按需加载可能已经回退。');
}

console.log(`按需模块检查通过：${salmonChunk}。`);

const abilityWikiChunk = readdirSync(chunkDirectory).find((name) =>
  /^ability-wiki-[^.]+\.js$/.test(name),
);

if (!abilityWikiChunk) {
  throw new Error('能力百科未生成独立脚本，按需加载可能已经回退。');
}

console.log(`按需模块检查通过：${abilityWikiChunk}。`);
