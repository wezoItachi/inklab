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
    'Usage: node scripts/import-leanny-blaster-parameters.mjs --source-dir <1130 weapon parameter directory>',
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
const blasterWeapons = mainWeapons.weapons.filter(
  (weapon) => weapon.family === '爆破枪',
);
if (blasterWeapons.length !== 17) {
  throw new Error(`Expected 17 blaster weapons, received ${blasterWeapons.length}`);
}

const sourceFiles = new Map();
const parameterFileFor = (weapon) => {
  const [, className] = weapon.upstreamRowId.split('_');
  if (!className) throw new Error(`Invalid blaster row id: ${weapon.upstreamRowId}`);
  return `WeaponBlaster${className}.game__GameParameterTable.json`;
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

const blasterParameters = new Map(
  blasterWeapons.map((weapon) => {
    const fileName = parameterFileFor(weapon);
    const sourceText = readFileSync(resolve(sourceDir, fileName), 'utf8');
    sourceFiles.set(fileName, sourceText);
    const gameParameters = JSON.parse(sourceText).GameParameters;
    const directDamage = gameParameters?.DamageParam?.ValueMax;
    const distanceDamage = gameParameters?.BlastParam?.DistanceDamage;
    const weaponParam = gameParameters?.WeaponParam;
    if (
      typeof directDamage !== 'number' ||
      !Array.isArray(distanceDamage) ||
      distanceDamage.length < 2 ||
      typeof weaponParam?.RepeatFrame !== 'number' ||
      typeof weaponParam?.InkConsume !== 'number' ||
      typeof weaponParam?.Stand_DegSwerve !== 'number' ||
      typeof weaponParam?.Jump_DegSwerve !== 'number' ||
      typeof weaponParam?.MoveSpeed !== 'number'
    ) {
      throw new Error(`Missing required explicit blaster fields: ${fileName}`);
    }
    const nearBlast = distanceDamage[0];
    const farBlast = distanceDamage.at(-1);
    if (
      typeof nearBlast?.Damage !== 'number' ||
      typeof nearBlast?.Distance !== 'number' ||
      typeof farBlast?.Damage !== 'number' ||
      typeof farBlast?.Distance !== 'number'
    ) {
      throw new Error(`Invalid blast damage curve: ${fileName}`);
    }

    const parameters = [
      verifiedField({
        key: 'directHitDamage',
        label: '直击伤害',
        value: damageValue(directDamage),
        unit: 'damage',
        fileName,
        path: 'GameParameters.DamageParam.ValueMax',
        note: `上游 ValueMax=${directDamage}，按游戏伤害定点值除以 10 规范化`,
      }),
      verifiedField({
        key: 'nearBlastDamage',
        label: '近端爆风伤害',
        value: damageValue(nearBlast.Damage),
        unit: 'damage',
        fileName,
        path: 'GameParameters.BlastParam.DistanceDamage[0].Damage',
        note: '记录标准射击爆风伤害曲线的第一个显式控制点',
      }),
      verifiedField({
        key: 'farBlastDamage',
        label: '远端爆风伤害',
        value: damageValue(farBlast.Damage),
        unit: 'damage',
        fileName,
        path: `GameParameters.BlastParam.DistanceDamage[${distanceDamage.length - 1}].Damage`,
        note: '记录标准射击爆风伤害曲线的最后一个显式控制点',
      }),
      verifiedField({
        key: 'nearBlastDistance',
        label: '近端爆风距离点',
        value: nearBlast.Distance,
        unit: 'internal',
        fileName,
        path: 'GameParameters.BlastParam.DistanceDamage[0].Distance',
        note: '保留爆风伤害曲线第一个控制点的内部距离单位，不换算为界面射程',
      }),
      verifiedField({
        key: 'farBlastDistance',
        label: '远端爆风距离点',
        value: farBlast.Distance,
        unit: 'internal',
        fileName,
        path: `GameParameters.BlastParam.DistanceDamage[${distanceDamage.length - 1}].Distance`,
        note: '保留爆风伤害曲线最后一个控制点的内部距离单位，不等同于完整爆炸半径',
      }),
      typeof gameParameters?.BlasterBurstParam?.BurstFrame === 'number'
        ? verifiedField({
            key: 'burstFrame',
            label: '爆炸发生帧',
            value: gameParameters.BlasterBurstParam.BurstFrame,
            unit: 'frames',
            fileName,
            path: 'GameParameters.BlasterBurstParam.BurstFrame',
            note: '直接记录标准射击参数文件中显式存在的 BurstFrame',
          })
        : pendingField(
            'burstFrame',
            '爆炸发生帧',
            'frames',
            '参数文件未显式包含 BurstFrame；解析默认来源前保持待验证',
          ),
      verifiedField({
        key: 'fireIntervalFrames',
        label: '射击间隔',
        value: weaponParam.RepeatFrame,
        unit: 'frames',
        fileName,
        path: 'GameParameters.WeaponParam.RepeatFrame',
        note: '直接记录参数文件中显式存在的 RepeatFrame',
      }),
      verifiedField({
        key: 'inkConsumptionPerShot',
        label: '单发耗墨',
        value: normalizeDecimal(weaponParam.InkConsume * 100),
        unit: 'percent',
        fileName,
        path: 'GameParameters.WeaponParam.InkConsume',
        note: `上游 InkConsume=${weaponParam.InkConsume}，乘以 100 规范化为墨水槽百分比`,
      }),
      pendingField(
        'effectiveRange',
        '有效射程',
        'internal',
        '有效射程需在弹丸移动、爆炸发生帧与爆风曲线联合建模后定义',
      ),
      verifiedField({
        key: 'groundShotSpreadDegrees',
        label: '地面射击扩散',
        value: weaponParam.Stand_DegSwerve,
        unit: 'degrees',
        fileName,
        path: 'GameParameters.WeaponParam.Stand_DegSwerve',
        note: '直接记录 Stand_DegSwerve',
      }),
      verifiedField({
        key: 'jumpShotSpreadDegrees',
        label: '跳跃射击扩散',
        value: weaponParam.Jump_DegSwerve,
        unit: 'degrees',
        fileName,
        path: 'GameParameters.WeaponParam.Jump_DegSwerve',
        note: '直接记录 Jump_DegSwerve；行动强化曲线另行验证',
      }),
      verifiedField({
        key: 'movementSpeedWhileFiring',
        label: '射击时移动速度',
        value: weaponParam.MoveSpeed,
        unit: 'internal',
        fileName,
        path: 'GameParameters.WeaponParam.MoveSpeed',
        note: '直接记录未叠加人速能力效果的 MoveSpeed 基础内部值',
      }),
    ];

    const jumpDistanceDamage = gameParameters?.BlastJumpParam?.DistanceDamage;
    if (Array.isArray(jumpDistanceDamage) && jumpDistanceDamage.length >= 2) {
      const nearJump = jumpDistanceDamage[0];
      const farJump = jumpDistanceDamage.at(-1);
      parameters.push(
        verifiedField({
          key: 'jumpNearBlastDamage',
          label: '跳跃射击近端爆风伤害',
          value: damageValue(nearJump.Damage),
          unit: 'damage',
          fileName,
          path: 'GameParameters.BlastJumpParam.DistanceDamage[0].Damage',
          note: '仅在上游显式提供独立跳跃爆风参数时记录',
        }),
        verifiedField({
          key: 'jumpFarBlastDamage',
          label: '跳跃射击远端爆风伤害',
          value: damageValue(farJump.Damage),
          unit: 'damage',
          fileName,
          path: `GameParameters.BlastJumpParam.DistanceDamage[${jumpDistanceDamage.length - 1}].Damage`,
          note: '仅在上游显式提供独立跳跃爆风参数时记录',
        }),
        verifiedField({
          key: 'jumpNearBlastDistance',
          label: '跳跃射击近端爆风距离点',
          value: nearJump.Distance,
          unit: 'internal',
          fileName,
          path: 'GameParameters.BlastJumpParam.DistanceDamage[0].Distance',
          note: '保留独立跳跃爆风曲线的内部距离单位',
        }),
        verifiedField({
          key: 'jumpFarBlastDistance',
          label: '跳跃射击远端爆风距离点',
          value: farJump.Distance,
          unit: 'internal',
          fileName,
          path: `GameParameters.BlastJumpParam.DistanceDamage[${jumpDistanceDamage.length - 1}].Distance`,
          note: '保留独立跳跃爆风曲线的内部距离单位',
        }),
      );
    }
    return [weapon.id, { weaponId: weapon.id, parameters }];
  }),
);

const records = parameterDatabase.records.map((record) =>
  blasterParameters.get(record.weaponId) ?? record,
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
writeDatabase('blaster-parameter-import-report.v11.3.0.json', {
  gameVersion: GAME_VERSION,
  importedAt: CHECKED_AT,
  sourceId: SOURCE_ID,
  sourceCommit: '7280ff9cde8bb1c5dcef46c700c326471584d2e6',
  attribution: 'Data provided by Lean',
  scope: 'Blaster family explicit fields only',
  inputs: [...sourceFiles.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([fileName, sourceText]) => ({
      upstreamPath: `${UPSTREAM_ROOT}/${fileName}`,
      sha256: sha256(sourceText),
    })),
  outputCounts: {
    blasterWeapons: blasterWeapons.length,
    blasterParameterClasses: sourceFiles.size,
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
  `Imported explicit blaster parameters for ${blasterWeapons.length} weapons from ${sourceFiles.size} shared parameter classes.`,
);
