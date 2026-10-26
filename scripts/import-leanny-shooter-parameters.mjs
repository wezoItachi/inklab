import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '11.3.0';
const CHECKED_AT = '2026-10-26';
const SOURCE_ID = 'leanny-splat3';
const UPSTREAM_ROOT = 'data/parameter/1130/weapon';

const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-shooter-parameters.mjs --source-dir <1130 weapon parameter directory>',
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
const weaponsById = new Map(
  mainWeapons.weapons.map((weapon) => [weapon.id, weapon]),
);
const shooterWeapons = mainWeapons.weapons.filter(
  (weapon) => weapon.family === '射击枪',
);

if (shooterWeapons.length !== 40) {
  throw new Error(`Expected 40 shooter weapons, received ${shooterWeapons.length}`);
}

const sourceFiles = new Map();
const parameterFileFor = (weapon) => {
  const [, className] = weapon.upstreamRowId.split('_');
  if (!className) throw new Error(`Invalid shooter row id: ${weapon.upstreamRowId}`);
  return `WeaponShooter${className}.game__GameParameterTable.json`;
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

const shooterParameters = new Map(
  shooterWeapons.map((weapon) => {
    const fileName = parameterFileFor(weapon);
    const sourcePath = resolve(sourceDir, fileName);
    const sourceText = readFileSync(sourcePath, 'utf8');
    sourceFiles.set(fileName, sourceText);
    const gameParameters = JSON.parse(sourceText).GameParameters;
    const damageParam = gameParameters?.DamageParam;
    const damage = damageParam?.ValueMax;
    const moveParam = gameParameters?.MoveParam;
    const weaponParam = gameParameters?.WeaponParam;
    if (
      typeof damage !== 'number' ||
      typeof damageParam?.ReduceStartFrame !== 'number' ||
      typeof damageParam?.ReduceEndFrame !== 'number' ||
      typeof moveParam?.SpawnSpeed !== 'number' ||
      typeof weaponParam?.InkConsume !== 'number' ||
      typeof weaponParam?.Stand_DegSwerve !== 'number' ||
      typeof weaponParam?.Jump_DegSwerve !== 'number' ||
      typeof weaponParam?.MoveSpeed !== 'number'
    ) {
      throw new Error(`Missing required explicit shooter fields: ${fileName}`);
    }

    const parameters = [
      verifiedField({
        key: 'damagePerShot',
        label: '单发基础伤害',
        value: damage / 10,
        unit: 'damage',
        fileName,
        path: 'GameParameters.DamageParam.ValueMax',
        note: `上游 ValueMax=${damage}，按游戏伤害定点值除以 10 规范化`,
      }),
      typeof weaponParam.RepeatFrame === 'number'
        ? verifiedField({
            key: 'fireIntervalFrames',
            label: '射击间隔',
            value: weaponParam.RepeatFrame,
            unit: 'frames',
            fileName,
            path: 'GameParameters.WeaponParam.RepeatFrame',
            note: '直接记录参数文件中显式存在的 RepeatFrame',
          })
        : pendingField(
            'fireIntervalFrames',
            '射击间隔',
            'frames',
            '11.3.0 武器文件未显式包含 RepeatFrame；解析默认值来源之前不按社区常识写入',
          ),
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
        '需要先统一最大伤害距离、衰减起点、弹丸寿命与界面射程之间的定义和换算',
      ),
      verifiedField({
        key: 'damageFalloffStartFrames',
        label: '伤害开始衰减帧',
        value: damageParam.ReduceStartFrame,
        unit: 'frames',
        fileName,
        path: 'GameParameters.DamageParam.ReduceStartFrame',
        note: '弹丸生成后开始进入伤害衰减的显式帧数；不是距离值',
      }),
      verifiedField({
        key: 'damageFalloffEndFrames',
        label: '伤害衰减结束帧',
        value: damageParam.ReduceEndFrame,
        unit: 'frames',
        fileName,
        path: 'GameParameters.DamageParam.ReduceEndFrame',
        note: '弹丸生成后到达最低伤害层的显式帧数；不是弹丸寿命',
      }),
      verifiedField({
        key: 'projectileSpawnSpeed',
        label: '弹丸初速',
        value: moveParam.SpawnSpeed,
        unit: 'internal',
        fileName,
        path: 'GameParameters.MoveParam.SpawnSpeed',
        note: '直接记录 SpawnSpeed 内部值；尚未与后续运动阶段积分成距离',
      }),
      verifiedField({
        key: 'groundShotSpreadDegrees',
        label: '地面射击扩散',
        value: weaponParam.Stand_DegSwerve,
        unit: 'degrees',
        fileName,
        path: 'GameParameters.WeaponParam.Stand_DegSwerve',
        note: '直接记录 Stand_DegSwerve；连续射击偏移累积另行建模',
      }),
      verifiedField({
        key: 'jumpShotSpreadDegrees',
        label: '跳跃射击扩散',
        value: weaponParam.Jump_DegSwerve,
        unit: 'degrees',
        fileName,
        path: 'GameParameters.WeaponParam.Jump_DegSwerve',
        note: '直接记录 Jump_DegSwerve；行动强化与跳跃偏移变化过程另行建模',
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
    return [weapon.id, { weaponId: weapon.id, parameters }];
  }),
);

const records = parameterDatabase.records.map((record) =>
  shooterParameters.get(record.weaponId) ?? record,
);
for (const weapon of shooterWeapons) {
  if (!shooterParameters.has(weapon.id) || !weaponsById.has(weapon.id))
    throw new Error(`Missing shooter parameter record: ${weapon.id}`);
}

const importedShooterRecords = records.filter((record) =>
  shooterParameters.has(record.weaponId),
);
const recordsWithVerifiedFields = importedShooterRecords.filter((record) =>
  record.parameters.some((parameter) => parameter.status === 'verified'),
).length;
const pendingOnlyRecords = importedShooterRecords.filter((record) =>
  record.parameters.every((parameter) => parameter.status === 'pending'),
).length;

writeDatabase('main-weapon-parameters.v11.3.0.json', {
  ...parameterDatabase,
  records,
});
writeDatabase('parameter-import-report.v11.3.0.json', {
  gameVersion: GAME_VERSION,
  importedAt: CHECKED_AT,
  sourceId: SOURCE_ID,
  sourceCommit: '7280ff9cde8bb1c5dcef46c700c326471584d2e6',
  attribution: 'Data provided by Lean',
  scope: 'Shooter family explicit damage, cadence, ink, spread, movement, and range-evidence fields only',
  inputs: [...sourceFiles.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([fileName, sourceText]) => ({
      upstreamPath: `${UPSTREAM_ROOT}/${fileName}`,
      sha256: sha256(sourceText),
    })),
  outputCounts: {
    shooterWeapons: shooterWeapons.length,
    shooterParameterClasses: sourceFiles.size,
    recordsWithVerifiedFields,
    pendingOnlyRecords,
  },
});
writeDatabase('import-report.v11.3.0.json', {
  ...catalogImportReport,
  outputCounts: {
    ...catalogImportReport.outputCounts,
    preservedVerifiedParameterRecords: records.filter((record) =>
      record.parameters.some((parameter) => parameter.status === 'verified'),
    ).length,
    pendingParameterRecords: records.filter((record) =>
      record.parameters.every((parameter) => parameter.status === 'pending'),
    ).length,
  },
});

console.log(
  `Imported explicit shooter parameters for ${shooterWeapons.length} weapons from ${sourceFiles.size} shared parameter classes.`,
);
