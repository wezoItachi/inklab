import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '12.0.0';
const CHECKED_AT = '2026-11-22';
const SOURCE_COMMIT = 'b669d55e0eef1f1a7f18cb7468c636ed7746c189';
const UPSTREAM_ROOT = 'data/parameter/1200';
const DEFAULT_SPREAD_REDUCTION = { high: 1, mid: 0.75, low: 0 };
const SQUID_SURGE_CHARGE_FRAMES = { high: 5, mid: 18, low: 45 };

const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-action-intensify.mjs --source-dir <1200 parameter directory>',
  );
}

const projectRoot = resolve(import.meta.dirname, '..');
const databaseDir = resolve(projectRoot, 'database');
const sourceDir = resolve(process.argv[sourceFlagIndex + 1]);
const weaponSourceDir = resolve(sourceDir, 'weapon');
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
  if (!className || !prefix)
    throw new Error(`Invalid weapon ${weapon.upstreamRowId}`);
  return `Weapon${prefix}${className}.game__GameParameterTable.json`;
}

const sourceCache = new Map();
function readSource(fileName) {
  if (!sourceCache.has(fileName)) {
    sourceCache.set(
      fileName,
      JSON.parse(readFileSync(resolve(weaponSourceDir, fileName), 'utf8')),
    );
  }
  return sourceCache.get(fileName);
}

function verifiedNumber(record, key) {
  const field = record?.parameters.find(
    (parameter) => parameter.key === key && parameter.status === 'verified',
  );
  return typeof field?.value === 'number' ? field : null;
}

const records = mainWeapons.weapons.map((weapon) => {
  const fileName = parameterFileName(weapon);
  const source = readSource(fileName);
  const parameterRecord = parameterByWeaponId.get(weapon.id);
  const ground = verifiedNumber(parameterRecord, 'groundShotSpreadDegrees');
  const jump = verifiedNumber(parameterRecord, 'jumpShotSpreadDegrees');
  const override =
    source.GameParameters?.[
      'spl__PlayerGearSkillParam_ActionSpecUp_ReduceJumpSwerveRate'
    ];
  const mid =
    typeof override?.Mid === 'number'
      ? override.Mid
      : DEFAULT_SPREAD_REDUCTION.mid;
  const spread =
    ground && jump && ground.value !== jump.value
      ? {
          groundDegrees: ground.value,
          jumpDegrees: jump.value,
          reduction: {
            high: DEFAULT_SPREAD_REDUCTION.high,
            mid,
            low: DEFAULT_SPREAD_REDUCTION.low,
          },
          reductionSourceMode:
            typeof override?.Mid === 'number'
              ? 'weapon-override'
              : 'shared-default',
          groundPath: ground.upstreamPath,
          jumpPath: jump.upstreamPath,
          reductionPath:
            typeof override?.Mid === 'number'
              ? `${UPSTREAM_ROOT}/weapon/${fileName}#GameParameters.spl__PlayerGearSkillParam_ActionSpecUp_ReduceJumpSwerveRate.Mid`
              : `${UPSTREAM_ROOT}/misc/params.json#ReduceJumpSwerveRate`,
        }
      : null;

  return {
    weaponId: weapon.id,
    upstreamRowId: weapon.upstreamRowId,
    spread,
  };
});

const counts = {
  weaponsWithJumpSpreadEffect: records.filter(({ spread }) => spread).length,
  weaponOverrides: records.filter(
    ({ spread }) => spread?.reductionSourceMode === 'weapon-override',
  ).length,
};

writeFileSync(
  resolve(databaseDir, 'weapon-action-intensify.v12.0.0.json'),
  `${JSON.stringify(
    {
      gameVersion: GAME_VERSION,
      checkedAt: CHECKED_AT,
      datasetStatus: 'source-backed-action-intensify',
      sourceId: 'leanny-splat3',
      sourceCommit: SOURCE_COMMIT,
      sharedSpreadReduction: DEFAULT_SPREAD_REDUCTION,
      squidSurgeChargeFrames: SQUID_SURGE_CHARGE_FRAMES,
      squidSurgeSourcePath: `${UPSTREAM_ROOT}/misc/SplPlayer.game__GameParameterTable.json#GameParameters.spl__PlayerGearSkillParam_ActionSpecUp_Squid`,
      counts,
      records,
    },
    null,
    2,
  )}\n`,
);

console.log(`Imported action intensify: ${JSON.stringify(counts)}.`);
