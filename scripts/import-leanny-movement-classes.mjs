import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '12.0.0';
const CHECKED_AT = '2026-11-22';
const SOURCE_COMMIT = 'b669d55e0eef1f1a7f18cb7468c636ed7746c189';
const UPSTREAM_ROOT = 'data/parameter/1200/weapon';

const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-movement-classes.mjs --source-dir <1200 weapon parameter directory>',
  );
}

const projectRoot = resolve(import.meta.dirname, '..');
const databaseDir = resolve(projectRoot, 'database');
const sourceDir = resolve(process.argv[sourceFlagIndex + 1]);
const mainWeapons = JSON.parse(
  readFileSync(resolve(databaseDir, 'main-weapons.v12.0.0.json'), 'utf8'),
);

const familyPrefixes = {
  射击枪: 'Shooter',
  爆破枪: 'Blaster',
  滚筒: 'Roller',
  画笔: 'Brush',
  蓄力枪: 'Charger',
  泼桶: 'Slosher',
  加特林: 'Spinner',
  双枪: 'Maneuver',
  伞: 'Shelter',
  弓: 'Stringer',
  刮水刀: 'Saber',
};

const sourceCache = new Map();
function parameterFileName(weapon) {
  const [, className] = weapon.upstreamRowId.split('_');
  const prefix = familyPrefixes[weapon.family];
  if (!className || !prefix) {
    throw new Error(`Cannot resolve parameter file for ${weapon.upstreamRowId}`);
  }
  return `Weapon${prefix}${className}.game__GameParameterTable.json`;
}

function readSource(fileName) {
  if (!sourceCache.has(fileName)) {
    sourceCache.set(
      fileName,
      JSON.parse(readFileSync(resolve(sourceDir, fileName), 'utf8')),
    );
  }
  return sourceCache.get(fileName);
}

const records = mainWeapons.weapons.map((weapon) => {
  const fileName = parameterFileName(weapon);
  const explicit = readSource(fileName).GameParameters?.MainWeaponSetting
    ?.WeaponSpeedType;
  const speedClass = explicit === 'Fast' || explicit === 'Slow' ? explicit : 'Mid';
  return {
    weaponId: weapon.id,
    upstreamRowId: weapon.upstreamRowId,
    speedClass,
    sourceMode: explicit ? 'explicit' : 'standard-default',
    upstreamPath: explicit
      ? `${UPSTREAM_ROOT}/${fileName}#GameParameters.MainWeaponSetting.WeaponSpeedType`
      : `${UPSTREAM_ROOT}/${fileName}#GameParameters.MainWeaponSetting`,
    note: explicit
      ? `上游显式记录 WeaponSpeedType=${explicit}`
      : '上游未覆盖 WeaponSpeedType，按游戏标准中量级处理',
  };
});

const counts = records.reduce(
  (result, record) => {
    result[record.speedClass] += 1;
    return result;
  },
  { Fast: 0, Mid: 0, Slow: 0 },
);

writeFileSync(
  resolve(databaseDir, 'weapon-movement-classes.v12.0.0.json'),
  `${JSON.stringify(
    {
      gameVersion: GAME_VERSION,
      checkedAt: CHECKED_AT,
      datasetStatus: 'complete-weapon-movement-classes',
      sourceId: 'leanny-splat3',
      sourceCommit: SOURCE_COMMIT,
      defaultRule: 'WeaponSpeedType absent => Mid',
      counts,
      records,
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Imported ${records.length} movement classes: Fast ${counts.Fast}, Mid ${counts.Mid}, Slow ${counts.Slow}.`,
);
