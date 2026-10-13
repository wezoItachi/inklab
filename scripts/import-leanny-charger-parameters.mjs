import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '11.3.0';
const CHECKED_AT = '2026-10-08';
const SOURCE_ID = 'leanny-splat3';
const SOURCE_COMMIT = '7280ff9cde8bb1c5dcef46c700c326471584d2e6';
const UPSTREAM_ROOT = 'data/parameter/1130/weapon';

const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-charger-parameters.mjs --source-dir <1130 weapon parameter directory>',
  );
}

const projectRoot = resolve(import.meta.dirname, '..');
const databaseDir = resolve(projectRoot, 'database');
const sourceDir = resolve(process.argv[sourceFlagIndex + 1]);
const readDatabase = (name) =>
  JSON.parse(readFileSync(resolve(databaseDir, name), 'utf8'));
const writeDatabase = (name, value) =>
  writeFileSync(resolve(databaseDir, name), `${JSON.stringify(value, null, 2)}\n`);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const normalizeDecimal = (value) => Math.round(value * 1_000_000) / 1_000_000;

const mainWeapons = readDatabase('main-weapons.v11.3.0.json');
const parameterDatabase = readDatabase('main-weapon-parameters.v11.3.0.json');
const catalogImportReport = readDatabase('import-report.v11.3.0.json');
const chargerWeapons = mainWeapons.weapons.filter(
  (weapon) => weapon.family === '蓄力枪',
);
if (chargerWeapons.length !== 19) {
  throw new Error(`Expected 19 charger weapons, received ${chargerWeapons.length}`);
}

const sourceFiles = new Map();
const parameterFileFor = (weapon) => {
  const [, className] = weapon.upstreamRowId.split('_');
  if (!className) throw new Error(`Invalid charger row id: ${weapon.upstreamRowId}`);
  return `WeaponCharger${className}.game__GameParameterTable.json`;
};
const verifiedField = ({ key, label, value, unit, fileName, path, note }) => ({
  key,
  label,
  value,
  unit,
  status: 'verified',
  note,
  sourceId: SOURCE_ID,
  upstreamPath: `${UPSTREAM_ROOT}/${fileName}#${path}`,
  checkedAt: CHECKED_AT,
});
const pendingField = (key, label, unit, note) => ({
  key,
  label,
  value: null,
  unit,
  status: 'pending',
  note,
});
const damageValue = (value) => normalizeDecimal(value / 10);
const inkPercent = (value) => normalizeDecimal(value * 100);

const chargerParameters = new Map(
  chargerWeapons.map((weapon) => {
    const fileName = parameterFileFor(weapon);
    const sourceText = readFileSync(resolve(sourceDir, fileName), 'utf8');
    sourceFiles.set(fileName, sourceText);
    const gameParameters = JSON.parse(sourceText).GameParameters;
    const damage = gameParameters?.DamageParam?.ValueFullCharge;
    const weaponParam = gameParameters?.WeaponParam;
    const distance = gameParameters?.MoveParam?.DistanceFullCharge;
    const keepCharge = gameParameters?.WeaponKeepChargeParam;
    if (
      typeof damage !== 'number' ||
      typeof weaponParam?.InkConsumeFullCharge !== 'number' ||
      typeof distance !== 'number'
    ) {
      throw new Error(`Missing required explicit charger fields: ${fileName}`);
    }

    const fullChargeFrames =
      typeof weaponParam.ChargeFrameFullCharge === 'number'
        ? verifiedField({
            key: 'fullChargeFrames',
            label: '满蓄力时间',
            value: weaponParam.ChargeFrameFullCharge,
            unit: 'frames',
            fileName,
            path: 'GameParameters.WeaponParam.ChargeFrameFullCharge',
            note: '仅在当前武器参数文件显式提供时记录；缺省值不从同类武器推断',
          })
        : pendingField(
            'fullChargeFrames',
            '满蓄力时间',
            'frames',
            '当前参数文件未显式包含 ChargeFrameFullCharge；解析默认值来源前保持待验证',
          );
    const chargeHold = keepCharge
      ? verifiedField({
          key: 'chargeHold',
          label: '是否支持储存蓄力',
          value: true,
          unit: null,
          fileName,
          path: 'GameParameters.WeaponKeepChargeParam.$type',
          note: '当前参数文件显式包含 WeaponKeepChargeParam，因此确认支持储存蓄力',
        })
      : pendingField(
          'chargeHold',
          '是否支持储存蓄力',
          null,
          '当前参数文件未显式包含 WeaponKeepChargeParam；不据此直接推断为不支持',
        );
    const chargeHoldFrames =
      typeof keepCharge?.KeepChargeFullFrame === 'number'
        ? verifiedField({
            key: 'chargeHoldFrames',
            label: '满蓄力储存窗口',
            value: keepCharge.KeepChargeFullFrame,
            unit: 'frames',
            fileName,
            path: 'GameParameters.WeaponKeepChargeParam.KeepChargeFullFrame',
            note: '直接记录参数文件中显式存在的 KeepChargeFullFrame',
          })
        : pendingField(
            'chargeHoldFrames',
            '满蓄力储存窗口',
            'frames',
            '未发现显式储存窗口；在储存能力确认前保持待验证',
          );

    return [
      weapon.id,
      {
        weaponId: weapon.id,
        parameters: [
          verifiedField({
            key: 'fullChargeDamage',
            label: '满蓄力伤害',
            value: damageValue(damage),
            unit: 'damage',
            fileName,
            path: 'GameParameters.DamageParam.ValueFullCharge',
            note: '定点伤害值除以 10；仅表示满蓄力基础伤害',
          }),
          fullChargeFrames,
          verifiedField({
            key: 'inkConsumptionPerCharge',
            label: '每次满蓄力耗墨',
            value: inkPercent(weaponParam.InkConsumeFullCharge),
            unit: 'percent',
            fileName,
            path: 'GameParameters.WeaponParam.InkConsumeFullCharge',
            note: '比例乘以 100 规范化为墨水槽百分比',
          }),
          pendingField(
            'effectiveRange',
            '满蓄力有效射程',
            'internal',
            '需要先统一弹道距离、伤害判定距离和界面射程的定义与换算',
          ),
          chargeHold,
          chargeHoldFrames,
          verifiedField({
            key: 'fullChargeTravelDistance',
            label: '满蓄力弹道距离',
            value: distance,
            unit: 'internal',
            fileName,
            path: 'GameParameters.MoveParam.DistanceFullCharge',
            note: '直接记录 DistanceFullCharge；不等同于界面有效射程',
          }),
        ],
      },
    ];
  }),
);

const records = parameterDatabase.records.map((record) =>
  chargerParameters.get(record.weaponId) ?? record,
);
const recordsWithVerifiedFields = records.filter((record) =>
  record.parameters.some((parameter) => parameter.status === 'verified'),
).length;
const pendingOnlyRecords = records.filter((record) =>
  record.parameters.every((parameter) => parameter.status === 'pending'),
).length;

writeDatabase('main-weapon-parameters.v11.3.0.json', {
  ...parameterDatabase,
  records,
});
writeDatabase('charger-parameter-import-report.v11.3.0.json', {
  gameVersion: GAME_VERSION,
  importedAt: CHECKED_AT,
  sourceId: SOURCE_ID,
  sourceCommit: SOURCE_COMMIT,
  attribution: 'Data provided by Lean',
  scope: 'Charger family explicit fields only',
  inputs: [...sourceFiles.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([fileName, sourceText]) => ({
      upstreamPath: `${UPSTREAM_ROOT}/${fileName}`,
      sha256: sha256(sourceText),
    })),
  outputCounts: {
    chargerWeapons: chargerWeapons.length,
    chargerParameterClasses: sourceFiles.size,
    recordsWithVerifiedFields,
    pendingOnlyRecords,
  },
});
writeDatabase('import-report.v11.3.0.json', {
  ...catalogImportReport,
  outputCounts: {
    ...catalogImportReport.outputCounts,
    preservedVerifiedParameterRecords: recordsWithVerifiedFields,
    pendingParameterRecords: pendingOnlyRecords,
  },
});

console.log(
  `Imported explicit charger parameters for ${chargerWeapons.length} weapons from ${sourceFiles.size} shared parameter classes.`,
);
