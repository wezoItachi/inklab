import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '12.0.0';
const CHECKED_AT = '2026-11-20';
const SOURCE_ID = 'leanny-splat3';
const SOURCE_COMMIT = 'b669d55e0eef1f1a7f18cb7468c636ed7746c189';
const LANGUAGE_KEY = 'CommonMsg/Weapon/WeaponName_Main';

const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-salmon-weapon-names.mjs --source-dir <language-directory>',
  );
}

const projectRoot = resolve(import.meta.dirname, '..');
const sourceDir = resolve(process.argv[sourceFlagIndex + 1]);
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const catalog = readJson(
  resolve(projectRoot, 'database', 'main-weapons.v12.0.0.json'),
);
const chinese = readJson(resolve(sourceDir, 'CNzh.json'))[LANGUAGE_KEY];
const english = readJson(resolve(sourceDir, 'USen.json'))[LANGUAGE_KEY];

const records = catalog.weapons
  .filter(
    (weapon) =>
      weapon.upstreamRowId.endsWith('_00') &&
      !weapon.upstreamRowId.includes('Scope'),
  )
  .map((weapon) => {
    const chineseName = chinese?.[weapon.upstreamRowId]
      ?.normalize('NFC')
      .trim();
    const englishName = english?.[weapon.upstreamRowId]
      ?.normalize('NFC')
      .trim();
    if (!chineseName || !englishName)
      throw new Error(`Missing language row: ${weapon.upstreamRowId}`);
    if (chineseName !== weapon.name)
      throw new Error(
        `Catalog language mismatch: ${weapon.upstreamRowId} (${weapon.name} / ${chineseName})`,
      );
    return {
      upstreamRowId: weapon.upstreamRowId,
      englishName,
    };
  });

if (records.length !== 63)
  throw new Error(
    `Expected 63 regular Salmon Run chassis, got ${records.length}`,
  );
if (
  new Set(records.map((record) => record.englishName)).size !== records.length
)
  throw new Error('English chassis names must be unique');

const output = {
  gameVersion: GAME_VERSION,
  checkedAt: CHECKED_AT,
  sourceId: SOURCE_ID,
  sourceCommit: SOURCE_COMMIT,
  languageKey: LANGUAGE_KEY,
  records,
};
const outputPath = resolve(
  projectRoot,
  'database',
  'salmon-weapon-names.v12.0.0.json',
);
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Wrote ${records.length} Salmon Run weapon name pairs.`);
