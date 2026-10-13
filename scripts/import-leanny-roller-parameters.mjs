import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '11.3.0';
const CHECKED_AT = '2026-10-08';
const SOURCE_ID = 'leanny-splat3';
const UPSTREAM_ROOT = 'data/parameter/1130/weapon';

const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-roller-parameters.mjs --source-dir <1130 weapon parameter directory>',
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
const rollerWeapons = mainWeapons.weapons.filter(
  (weapon) => weapon.family === '滚筒',
);
if (rollerWeapons.length !== 14) {
  throw new Error(`Expected 14 roller weapons, received ${rollerWeapons.length}`);
}

const sourceFiles = new Map();
const parameterFileFor = (weapon) => {
  const [, className] = weapon.upstreamRowId.split('_');
  if (!className) throw new Error(`Invalid roller row id: ${weapon.upstreamRowId}`);
  return `WeaponRoller${className}.game__GameParameterTable.json`;
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

const rollerParameters = new Map(
  rollerWeapons.map((weapon) => {
    const fileName = parameterFileFor(weapon);
    const sourceText = readFileSync(resolve(sourceDir, fileName), 'utf8');
    sourceFiles.set(fileName, sourceText);
    const gameParameters = JSON.parse(sourceText).GameParameters;
    const wideDamage =
      gameParameters?.WideSwingUnitGroupParam?.DamageParam?.Inside
        ?.DamageMaxValue;
    const verticalDamage =
      gameParameters?.VerticalSwingUnitGroupParam?.DamageParam?.Inside
        ?.DamageMaxValue;
    const wide = gameParameters?.WeaponWideSwingParam;
    const vertical = gameParameters?.WeaponVerticalSwingParam;
    const roll = gameParameters?.WeaponRollParam;
    const rollDamage = gameParameters?.BodyParam?.Damage;
    if (
      typeof wideDamage !== 'number' ||
      typeof verticalDamage !== 'number' ||
      typeof rollDamage !== 'number' ||
      typeof wide?.InkConsume !== 'number' ||
      typeof wide?.SwingFrame !== 'number' ||
      typeof vertical?.InkConsume !== 'number' ||
      typeof vertical?.SwingFrame !== 'number' ||
      typeof roll?.InkConsumeMinPerFrame !== 'number' ||
      typeof roll?.InkConsumeMaxPerFrame !== 'number' ||
      typeof roll?.SpeedNormal !== 'number' ||
      typeof roll?.SpeedDash !== 'number'
    ) {
      throw new Error(`Missing required explicit roller fields: ${fileName}`);
    }

    return [
      weapon.id,
      {
        weaponId: weapon.id,
        parameters: [
          verifiedField({
            key: 'horizontalSwingDamageMax',
            label: '横挥近端最大伤害',
            value: damageValue(wideDamage),
            unit: 'damage',
            fileName,
            path: 'GameParameters.WideSwingUnitGroupParam.DamageParam.Inside.DamageMaxValue',
            note: '定点伤害值除以 10；不代表所有距离和命中位置',
          }),
          verifiedField({
            key: 'horizontalSwingPhaseFrames',
            label: '横挥内部阶段',
            value: wide.SwingFrame,
            unit: 'frames',
            fileName,
            path: 'GameParameters.WeaponWideSwingParam.SwingFrame',
            note: '只记录 SwingFrame 内部阶段，不当作完整连续横挥间隔',
          }),
          pendingField(
            'horizontalSwingFrames',
            '完整连续横挥间隔',
            'frames',
            '需要解析起手、后摇和输入循环后再定义',
          ),
          verifiedField({
            key: 'horizontalInkConsumptionPerSwing',
            label: '横挥耗墨',
            value: inkPercent(wide.InkConsume),
            unit: 'percent',
            fileName,
            path: 'GameParameters.WeaponWideSwingParam.InkConsume',
            note: '比例乘以 100 规范化为墨水槽百分比',
          }),
          verifiedField({
            key: 'verticalSwingDamageMax',
            label: '竖挥近端最大伤害',
            value: damageValue(verticalDamage),
            unit: 'damage',
            fileName,
            path: 'GameParameters.VerticalSwingUnitGroupParam.DamageParam.Inside.DamageMaxValue',
            note: '定点伤害值除以 10；不代表所有距离和命中位置',
          }),
          verifiedField({
            key: 'verticalSwingPhaseFrames',
            label: '竖挥内部阶段',
            value: vertical.SwingFrame,
            unit: 'frames',
            fileName,
            path: 'GameParameters.WeaponVerticalSwingParam.SwingFrame',
            note: '只记录 SwingFrame 内部阶段，不当作完整连续竖挥间隔',
          }),
          pendingField(
            'verticalSwingFrames',
            '完整连续竖挥间隔',
            'frames',
            '需要解析起手、后摇和输入循环后再定义',
          ),
          verifiedField({
            key: 'verticalInkConsumptionPerSwing',
            label: '竖挥耗墨',
            value: inkPercent(vertical.InkConsume),
            unit: 'percent',
            fileName,
            path: 'GameParameters.WeaponVerticalSwingParam.InkConsume',
            note: '独立记录竖挥耗墨；不假设与横挥相同',
          }),
          verifiedField({
            key: 'rollDamageMax',
            label: '碾压最大伤害',
            value: damageValue(rollDamage),
            unit: 'damage',
            fileName,
            path: 'GameParameters.BodyParam.Damage',
            note: '定点伤害值除以 10',
          }),
          verifiedField({
            key: 'rollInkConsumptionMinPerFrame',
            label: '滚动每帧最低耗墨',
            value: inkPercent(roll.InkConsumeMinPerFrame),
            unit: 'percent/frame',
            fileName,
            path: 'GameParameters.WeaponRollParam.InkConsumeMinPerFrame',
            note: '比例乘以 100；实际值随滚动状态变化',
          }),
          verifiedField({
            key: 'rollInkConsumptionMaxPerFrame',
            label: '滚动每帧最高耗墨',
            value: inkPercent(roll.InkConsumeMaxPerFrame),
            unit: 'percent/frame',
            fileName,
            path: 'GameParameters.WeaponRollParam.InkConsumeMaxPerFrame',
            note: '比例乘以 100；实际值随滚动状态变化',
          }),
          verifiedField({
            key: 'rollSpeedNormal',
            label: '普通滚动速度',
            value: roll.SpeedNormal,
            unit: 'internal/frame',
            fileName,
            path: 'GameParameters.WeaponRollParam.SpeedNormal',
            note: '保留内部每帧速度单位',
          }),
          verifiedField({
            key: 'rollSpeedDash',
            label: '加速滚动速度',
            value: roll.SpeedDash,
            unit: 'internal/frame',
            fileName,
            path: 'GameParameters.WeaponRollParam.SpeedDash',
            note: '保留内部每帧速度单位',
          }),
        ],
      },
    ];
  }),
);

const records = parameterDatabase.records.map((record) =>
  rollerParameters.get(record.weaponId) ?? record,
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
writeDatabase('roller-parameter-import-report.v11.3.0.json', {
  gameVersion: GAME_VERSION,
  importedAt: CHECKED_AT,
  sourceId: SOURCE_ID,
  sourceCommit: '7280ff9cde8bb1c5dcef46c700c326471584d2e6',
  attribution: 'Data provided by Lean',
  scope: 'Roller family explicit fields only',
  inputs: [...sourceFiles.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([fileName, sourceText]) => ({
      upstreamPath: `${UPSTREAM_ROOT}/${fileName}`,
      sha256: sha256(sourceText),
    })),
  outputCounts: {
    rollerWeapons: rollerWeapons.length,
    rollerParameterClasses: sourceFiles.size,
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
  `Imported explicit roller parameters for ${rollerWeapons.length} weapons from ${sourceFiles.size} shared parameter classes.`,
);
