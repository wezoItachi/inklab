import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '12.0.0';
const CHECKED_AT = '2026-11-22';
const SOURCE_COMMIT = 'b669d55e0eef1f1a7f18cb7468c636ed7746c189';
const UPSTREAM_ROOT = 'data/parameter/1200/weapon';
const DEFAULT_MULTIPLIER = { high: 1.25, mid: 1.125, low: 1 };

const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-action-movement.mjs --source-dir <1200 weapon parameter directory>',
  );
}

const projectRoot = resolve(import.meta.dirname, '..');
const databaseDir = resolve(projectRoot, 'database');
const sourceDir = resolve(process.argv[sourceFlagIndex + 1]);
const readDatabase = (name) =>
  JSON.parse(readFileSync(resolve(databaseDir, name), 'utf8'));
const mainWeapons = readDatabase('main-weapons.v12.0.0.json');
const parameterDatabase = readDatabase('main-weapon-parameters.v12.0.0.json');
const parameterByWeaponId = new Map(
  parameterDatabase.records.map((record) => [record.weaponId, record]),
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

function parameterFileName(weapon) {
  const [, className] = weapon.upstreamRowId.split('_');
  const prefix = familyPrefixes[weapon.family];
  if (!className || !prefix) throw new Error(`Invalid weapon ${weapon.upstreamRowId}`);
  return `Weapon${prefix}${className}.game__GameParameterTable.json`;
}

const sourceCache = new Map();
function readSource(fileName) {
  if (!sourceCache.has(fileName)) {
    sourceCache.set(
      fileName,
      JSON.parse(readFileSync(resolve(sourceDir, fileName), 'utf8')),
    );
  }
  return sourceCache.get(fileName);
}

function findNumericKey(value, key, path = []) {
  const matches = [];
  if (!value || typeof value !== 'object') return matches;
  for (const [entryKey, entryValue] of Object.entries(value)) {
    const entryPath = [...path, entryKey];
    if (entryKey === key && typeof entryValue === 'number') {
      matches.push({ value: entryValue, path: entryPath.join('.') });
    } else if (entryValue && typeof entryValue === 'object') {
      matches.push(...findNumericKey(entryValue, key, entryPath));
    }
  }
  return matches;
}

function multiplierFor(source) {
  const settings = source.GameParameters?.MainWeaponSetting ?? {};
  const valueOrDefault = (name, fallback) => {
    const value = settings[name];
    return typeof value === 'number' && value >= 0 ? value : fallback;
  };
  return {
    high: valueOrDefault(
      'Overwrite_MoveVelRt_Shot_High',
      DEFAULT_MULTIPLIER.high,
    ),
    mid: valueOrDefault(
      'Overwrite_MoveVelRt_Shot_Mid',
      DEFAULT_MULTIPLIER.mid,
    ),
    low: valueOrDefault(
      'Overwrite_MoveVelRt_Shot_Low',
      DEFAULT_MULTIPLIER.low,
    ),
    sourceMode:
      ['High', 'Mid', 'Low'].some((suffix) => {
        const value = settings[`Overwrite_MoveVelRt_Shot_${suffix}`];
        return typeof value === 'number' && value >= 0;
      }) ? 'weapon-override' : 'shared-default',
  };
}

const parameterStateSpecs = [
  ['firing', '射击／动作中', 'movementSpeedWhileFiring'],
  ['charging', '蓄力中', 'movementSpeedWhileCharging'],
  ['secondary', '第二射击状态', 'variableMovementSpeedWhileFiring'],
];

const records = mainWeapons.weapons.map((weapon) => {
  const fileName = parameterFileName(weapon);
  const source = readSource(fileName);
  const parameterRecord = parameterByWeaponId.get(weapon.id);
  const multiplier = multiplierFor(source);
  const states = [];

  for (const [id, label, parameterKey] of parameterStateSpecs) {
    const parameter = parameterRecord?.parameters.find(
      (item) => item.key === parameterKey && item.status === 'verified',
    );
    if (typeof parameter?.value !== 'number') continue;
    states.push({
      id,
      label,
      baseSpeed: parameter.value,
      baseSpeedPath: parameter.upstreamPath,
    });
  }

  const fullChargeMatches = findNumericKey(
    source.GameParameters,
    'MoveSpeedFullCharge',
    ['GameParameters'],
  );
  if (fullChargeMatches.length > 1) {
    throw new Error(`${fileName} has multiple MoveSpeedFullCharge values`);
  }
  if (fullChargeMatches.length === 1) {
    states.push({
      id: 'full-charge',
      label: '满蓄力状态',
      baseSpeed: fullChargeMatches[0].value,
      baseSpeedPath: `${UPSTREAM_ROOT}/${fileName}#${fullChargeMatches[0].path}`,
    });
  }

  return {
    weaponId: weapon.id,
    upstreamRowId: weapon.upstreamRowId,
    multiplier: {
      high: multiplier.high,
      mid: multiplier.mid,
      low: multiplier.low,
    },
    multiplierSourceMode: multiplier.sourceMode,
    multiplierPath:
      multiplier.sourceMode === 'weapon-override'
        ? `${UPSTREAM_ROOT}/${fileName}#GameParameters.MainWeaponSetting`
        : 'data/parameter/1200/misc/params.json#MoveVelRt_Shot',
    states,
  };
});

const counts = {
  weaponsWithStates: records.filter((record) => record.states.length > 0).length,
  firing: records.filter((record) => record.states.some(({ id }) => id === 'firing')).length,
  charging: records.filter((record) => record.states.some(({ id }) => id === 'charging')).length,
  fullCharge: records.filter((record) => record.states.some(({ id }) => id === 'full-charge')).length,
  secondary: records.filter((record) => record.states.some(({ id }) => id === 'secondary')).length,
  weaponOverrides: records.filter(
    (record) => record.multiplierSourceMode === 'weapon-override',
  ).length,
};

writeFileSync(
  resolve(databaseDir, 'weapon-action-movement.v12.0.0.json'),
  `${JSON.stringify(
    {
      gameVersion: GAME_VERSION,
      checkedAt: CHECKED_AT,
      datasetStatus: 'source-backed-action-movement',
      sourceId: 'leanny-splat3',
      sourceCommit: SOURCE_COMMIT,
      sharedMultiplier: DEFAULT_MULTIPLIER,
      counts,
      records,
    },
    null,
    2,
  )}\n`,
);

console.log(`Imported action movement: ${JSON.stringify(counts)}.`);
