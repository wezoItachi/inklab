import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '11.3.0';
const CHECKED_AT = '2026-10-08';
const SOURCE_ID = 'leanny-splat3';
const NINTENDO_WEAPON_SOURCE_ID = 'nintendo-splatoon-base-weapons';
const NINTENDO_WEAPON_SOURCE_URL =
  'https://www.nintendo.com/jp/character/splatoon/en/fashion/index.html#weapons';
const SOURCE_COMMIT = '7280ff9cde8bb1c5dcef46c700c326471584d2e6';
const UPSTREAM_ROOT = 'data/parameter/1130/weapon';

const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-remaining-parameters.mjs --source-dir <1130 weapon parameter directory>',
  );
}

const projectRoot = resolve(import.meta.dirname, '..');
const databaseDir = resolve(projectRoot, 'database');
const sourceDir = resolve(process.argv[sourceFlagIndex + 1]);
const readDatabase = (name) =>
  JSON.parse(readFileSync(resolve(databaseDir, name), 'utf8'));
const writeDatabase = (name, value) =>
  writeFileSync(
    resolve(databaseDir, name),
    `${JSON.stringify(value, null, 2)}\n`,
  );
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const normalize = (value) => Math.round(value * 1_000_000) / 1_000_000;
const damage = (value) =>
  typeof value === 'number' ? normalize(value / 10) : null;
const percent = (value) =>
  typeof value === 'number' ? normalize(value * 100) : null;
const sum = (...values) =>
  values.every((value) => typeof value === 'number')
    ? normalize(values.reduce((total, value) => total + value, 0))
    : null;
const numericValues = (values) =>
  values.filter((value) => typeof value === 'number');

const mainWeapons = readDatabase('main-weapons.v11.3.0.json');
const parameterDatabase = readDatabase('main-weapon-parameters.v11.3.0.json');
const catalogImportReport = readDatabase('import-report.v11.3.0.json');
const sourceFiles = new Map();

const familySpecs = {
  画笔: { prefix: 'Brush', count: 9 },
  泼桶: { prefix: 'Slosher', count: 15 },
  加特林: { prefix: 'Spinner', count: 15 },
  双枪: { prefix: 'Maneuver', count: 16 },
  伞: { prefix: 'Shelter', count: 11 },
  弓: { prefix: 'Stringer', count: 9 },
  刮水刀: { prefix: 'Saber', count: 9 },
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
const explicitOrPending = ({
  key,
  label,
  value,
  unit,
  fileName,
  path,
  note,
  pendingNote,
}) =>
  value === null || value === undefined
    ? pendingField(key, label, unit, pendingNote ?? `${path} 未显式提供可用值`)
    : verifiedField({ key, label, value, unit, fileName, path, note });

function parameterFileFor(weapon, prefix) {
  const [, className] = weapon.upstreamRowId.split('_');
  if (!className)
    throw new Error(`Invalid weapon row id: ${weapon.upstreamRowId}`);
  return `Weapon${prefix}${className}.game__GameParameterTable.json`;
}

function readParameters(weapon, prefix) {
  const fileName = parameterFileFor(weapon, prefix);
  if (!sourceFiles.has(fileName)) {
    sourceFiles.set(
      fileName,
      readFileSync(resolve(sourceDir, fileName), 'utf8'),
    );
  }
  return {
    fileName,
    game: JSON.parse(sourceFiles.get(fileName)).GameParameters,
  };
}

function brushFields(fileName, game) {
  const inside = game.SwingUnitGroupParam?.DamageParam?.Inside;
  const swing = game.WeaponSwingParam;
  const roll = game.WeaponRollParam;
  return [
    explicitOrPending({
      key: 'maximumSwingDamage',
      label: '挥击最大单次伤害',
      value: damage(inside?.DamageMaxValue),
      unit: 'damage',
      fileName,
      path: 'GameParameters.SwingUnitGroupParam.DamageParam.Inside.DamageMaxValue',
      note: '内部最大伤害定点值除以 10；不表示全部墨滴同时命中的总伤害',
    }),
    explicitOrPending({
      key: 'minimumSwingDamage',
      label: '挥击最低单次伤害',
      value: damage(inside?.DamageMinValue),
      unit: 'damage',
      fileName,
      path: 'GameParameters.SwingUnitGroupParam.DamageParam.Inside.DamageMinValue',
      note: '内部最低伤害定点值除以 10',
    }),
    explicitOrPending({
      key: 'inkConsumptionPerSwing',
      label: '每次挥击耗墨',
      value: percent(swing?.InkConsume),
      unit: 'percent',
      fileName,
      path: 'GameParameters.WeaponSwingParam.InkConsume',
      note: '显式耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'swingPhaseFrames',
      label: '挥击阶段帧',
      value: swing?.SwingFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponSwingParam.SwingFrame',
      note: '仅记录显式 SwingFrame；不解释为完整连续挥击间隔',
    }),
    explicitOrPending({
      key: 'swingRepeatFrames',
      label: '连续挥击间隔',
      value: roll?.SwingRepeatFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponRollParam.SwingRepeatFrame',
      note: '直接记录显式 SwingRepeatFrame；省略时不补同类默认值',
    }),
    explicitOrPending({
      key: 'swingInkRecoveryLockFrames',
      label: '挥击后回墨锁帧',
      value: swing?.InkRecoverStop,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponSwingParam.InkRecoverStop',
      note: '直接记录挥击后的显式回墨停止帧',
    }),
    explicitOrPending({
      key: 'movementSpeedWhileSwinging',
      label: '挥击时移动速度',
      value: swing?.SwingMoveSpeed,
      unit: 'internal',
      fileName,
      path: 'GameParameters.WeaponSwingParam.SwingMoveSpeed',
      note: '直接记录未叠加装备能力的内部移动速度',
    }),
    explicitOrPending({
      key: 'brushContactDamage',
      label: '移动接触伤害',
      value: damage(game.BodyParam?.Damage),
      unit: 'damage',
      fileName,
      path: 'GameParameters.BodyParam.Damage',
      note: '刷地移动时本体接触伤害定点值除以 10',
    }),
    explicitOrPending({
      key: 'rollingInkConsumptionPerFrame',
      label: '刷地移动每帧耗墨',
      value: percent(roll?.InkConsumeMaxPerFrame),
      unit: 'percent_per_frame',
      fileName,
      path: 'GameParameters.WeaponRollParam.InkConsumeMaxPerFrame',
      note: '显式每帧最大耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'rollingSpeed',
      label: '刷地移动速度',
      value: roll?.SpeedNormal,
      unit: 'internal',
      fileName,
      path: 'GameParameters.WeaponRollParam.SpeedNormal',
      note: '直接记录 WeaponRollParam 中显式刷地移动速度；省略时不从 BodyParam 补值',
    }),
    explicitOrPending({
      key: 'rollingInkRecoveryLockFrames',
      label: '刷地后回墨锁帧',
      value: roll?.InkRecoverStop,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponRollParam.InkRecoverStop',
      note: '直接记录停止刷地后的显式回墨停止帧',
    }),
    explicitOrPending({
      key: 'rollingPaintStartFrames',
      label: '进入刷地涂墨阶段帧',
      value: roll?.ToPaintFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponRollParam.ToPaintFrame',
      note: '直接记录 ToPaintFrame，不解释为全部起步动作结束点',
    }),
    pendingField(
      'effectiveRange',
      '有效射程',
      'internal',
      '需要统一墨滴最大伤害距离、衰减区间和界面射程定义',
    ),
  ];
}

function slosherFields(fileName, game) {
  const units = game.UnitGroupParam?.Unit ?? [];
  const maximums = numericValues(
    units.map((unit) => unit.DamageParam?.ValueMax),
  );
  const minimums = numericValues(
    units.map((unit) => unit.DamageParam?.ValueMin),
  );
  const weapon = game.WeaponParam;
  const unitDelayFrames = numericValues(
    units.map((unit) => unit.UnitDelayFrame),
  );
  const blast = game.BlastParam?.BlastParam?.DistanceDamage?.[0];
  return [
    explicitOrPending({
      key: 'maximumUnitDamage',
      label: '单个伤害单元最大伤害',
      value: maximums.length ? damage(Math.max(...maximums)) : null,
      unit: 'damage',
      fileName,
      path: 'GameParameters.UnitGroupParam.Unit[*].DamageParam.ValueMax',
      note: '取文件中伤害单元的最高显式 ValueMax 并除以 10；多段命中另行建模',
    }),
    explicitOrPending({
      key: 'minimumUnitDamage',
      label: '单个伤害单元最低伤害',
      value: minimums.length ? damage(Math.min(...minimums)) : null,
      unit: 'damage',
      fileName,
      path: 'GameParameters.UnitGroupParam.Unit[*].DamageParam.ValueMin',
      note: '取文件中伤害单元的最低显式 ValueMin 并除以 10',
    }),
    explicitOrPending({
      key: 'fireIntervalFrames',
      label: '挥桶间隔',
      value: weapon?.RepeatFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.RepeatFrame',
      note: '直接记录显式 RepeatFrame',
    }),
    explicitOrPending({
      key: 'inkConsumptionPerSwing',
      label: '每次挥桶耗墨',
      value: percent(weapon?.InkConsume),
      unit: 'percent',
      fileName,
      path: 'GameParameters.WeaponParam.InkConsume',
      note: '显式耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'movementSpeedWhileSwinging',
      label: '挥桶时移动速度',
      value: weapon?.MoveSpeed,
      unit: 'internal',
      fileName,
      path: 'GameParameters.WeaponParam.MoveSpeed',
      note: '直接记录未叠加装备能力的内部移动速度',
    }),
    explicitOrPending({
      key: 'swingLiftFrames',
      label: '抬桶动作帧',
      value: weapon?.SwingLiftFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.SwingLiftFrame',
      note: '直接记录显式 SwingLiftFrame',
    }),
    explicitOrPending({
      key: 'unitGroupCount',
      label: '伤害单元组数',
      value: units.length || null,
      unit: 'groups',
      fileName,
      path: 'GameParameters.UnitGroupParam.Unit.length',
      note: '记录显式 Unit 数组长度；不等同于一次挥桶可同时命中的弹体数',
    }),
    explicitOrPending({
      key: 'maximumUnitDelayFrames',
      label: '最晚伤害单元延迟',
      value: unitDelayFrames.length ? Math.max(...unitDelayFrames) : null,
      unit: 'frames',
      fileName,
      path: 'GameParameters.UnitGroupParam.Unit[*].UnitDelayFrame',
      note: '取显式 UnitDelayFrame 的最大值；仅表示配置中的最晚单元延迟',
    }),
    explicitOrPending({
      key: 'inkRecoveryLockFrames',
      label: '挥桶后回墨锁帧',
      value: weapon?.InkRecoverStop,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.InkRecoverStop',
      note: '直接记录挥桶后的显式回墨停止帧',
    }),
    explicitOrPending({
      key: 'postDelayFrames',
      label: '挥桶后摇帧',
      value: weapon?.PostDelayFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.PostDelayFrame',
      note: '直接记录显式 PostDelayFrame，不与 RepeatFrame 相加',
    }),
    explicitOrPending({
      key: 'movementLimitFrames',
      label: '挥桶移动限制帧',
      value: weapon?.MoveLmtFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.MoveLmtFrame',
      note: '直接记录显式 MoveLmtFrame',
    }),
    explicitOrPending({
      key: 'blastDamage',
      label: '爆风伤害',
      value: damage(blast?.Damage),
      unit: 'damage',
      fileName,
      path: 'GameParameters.BlastParam.BlastParam.DistanceDamage[0].Damage',
      note: '记录爆炸泼桶显式爆风伤害定点值除以 10；不自动与直击伤害相加',
    }),
    explicitOrPending({
      key: 'blastDamageRadius',
      label: '爆风伤害范围',
      value: blast?.Distance,
      unit: 'internal',
      fileName,
      path: 'GameParameters.BlastParam.BlastParam.DistanceDamage[0].Distance',
      note: '直接记录爆风伤害段的内部 Distance 值',
    }),
    pendingField(
      'effectiveRange',
      '有效射程',
      'internal',
      '不同泼桶的多段轨迹和衰减结构不同，需另行定义统一射程口径',
    ),
  ];
}

function spinnerFields(fileName, game) {
  const weapon = game.WeaponParam;
  const keepCharge = game.WeaponKeepChargeParam;
  const fullCharge = game.WeaponFullChargeParam;
  const variableDamage = game.VariableDamageParam;
  const variableShot = game.VariableShotParam;
  return [
    explicitOrPending({
      key: 'damagePerShot',
      label: '满蓄力最大单发伤害',
      value: damage(
        game.DamageParam?.ValueFullChargeMax ?? game.DamageParam?.ValueMax,
      ),
      unit: 'damage',
      fileName,
      path: 'GameParameters.DamageParam.ValueFullChargeMax|ValueMax',
      note: '优先采用满蓄力最大伤害；缺少该字段时采用显式 ValueMax，定点值除以 10',
    }),
    explicitOrPending({
      key: 'standardMaximumDamagePerShot',
      label: '通常状态最大单发伤害',
      value: damage(game.DamageParam?.ValueMax),
      unit: 'damage',
      fileName,
      path: 'GameParameters.DamageParam.ValueMax',
      note: '显式通常状态最大伤害定点值除以 10；与满蓄力最大伤害分开记录',
    }),
    explicitOrPending({
      key: 'minimumDamagePerShot',
      label: '最低单发伤害',
      value: damage(game.DamageParam?.ValueMin),
      unit: 'damage',
      fileName,
      path: 'GameParameters.DamageParam.ValueMin',
      note: '显式最低伤害定点值除以 10，不解释为某一固定蓄力档位',
    }),
    explicitOrPending({
      key: 'firstChargeStageFrames',
      label: '第一阶段蓄力时间',
      value: weapon?.ChargeFrame_First,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.ChargeFrame_First',
      note: '直接记录第一阶段显式蓄力帧',
    }),
    explicitOrPending({
      key: 'secondChargeStageFrames',
      label: '第二阶段蓄力时间',
      value: weapon?.ChargeFrame_Second,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.ChargeFrame_Second',
      note: '直接记录第二阶段显式蓄力帧',
    }),
    explicitOrPending({
      key: 'fullChargeFrames',
      label: '完整蓄力时间',
      value: sum(weapon?.ChargeFrame_First, weapon?.ChargeFrame_Second),
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.ChargeFrame_First+ChargeFrame_Second',
      note: '由文件中两个连续蓄力阶段相加',
    }),
    explicitOrPending({
      key: 'inkConsumptionPerCharge',
      label: '每次蓄力耗墨',
      value: percent(weapon?.InkConsume),
      unit: 'percent',
      fileName,
      path: 'GameParameters.WeaponParam.InkConsume',
      note: '显式耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'firstChargeFiringWindowFrames',
      label: '第一阶段射击窗口',
      value: weapon?.MaxShootingFrame_First,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.MaxShootingFrame_First',
      note: '记录第一阶段最大射击窗口，不推断端点是否包含首发',
    }),
    explicitOrPending({
      key: 'firingDurationFrames',
      label: '满蓄力射击持续时间',
      value: weapon?.MaxShootingFrame_Second,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.MaxShootingFrame_Second',
      note: '沿用分析模块字段名；记录第二阶段最大射击窗口，不推断端点是否包含首发',
    }),
    explicitOrPending({
      key: 'fireIntervalFrames',
      label: '射击间隔',
      value: weapon?.RepeatFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.RepeatFrame',
      note: '射击窗口内的显式重复发射间隔',
    }),
    explicitOrPending({
      key: 'movementSpeedWhileFiring',
      label: '射击时移动速度',
      value: weapon?.MoveSpeed,
      unit: 'internal',
      fileName,
      path: 'GameParameters.WeaponParam.MoveSpeed',
      note: '直接记录未叠加装备能力的内部移动速度',
    }),
    explicitOrPending({
      key: 'movementSpeedWhileCharging',
      label: '蓄力时移动速度',
      value: weapon?.MoveSpeed_Charge,
      unit: 'internal',
      fileName,
      path: 'GameParameters.WeaponParam.MoveSpeed_Charge',
      note: '直接记录未叠加装备能力的内部移动速度',
    }),
    explicitOrPending({
      key: 'inkRecoveryLockFrames',
      label: '射击后回墨锁帧',
      value: weapon?.InkRecoverStop,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.InkRecoverStop',
      note: '直接记录显式回墨停止帧',
    }),
    explicitOrPending({
      key: 'postDelayFrames',
      label: '射击后摇帧',
      value: weapon?.PostDelayFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.PostDelayFrame',
      note: '直接记录显式 PostDelayFrame，不与射击窗口相加',
    }),
    explicitOrPending({
      key: 'canRecharge',
      label: '射击中能否续蓄',
      value: weapon?.EnableRecharge,
      unit: 'boolean',
      fileName,
      path: 'GameParameters.WeaponParam.EnableRecharge',
      note: '仅记录显式布尔值；字段省略时不推定为 false',
    }),
    explicitOrPending({
      key: 'canStoreCharge',
      label: '能否储存蓄力',
      value: keepCharge?.EnableKeepChargeAnytime,
      unit: 'boolean',
      fileName,
      path: 'GameParameters.WeaponKeepChargeParam.EnableKeepChargeAnytime',
      note: '仅记录显式蓄力储存布尔值；对象省略时保持待验证',
    }),
    explicitOrPending({
      key: 'chargeHoldFrames',
      label: '蓄力储存时限',
      value: keepCharge?.KeepChargeFullFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponKeepChargeParam.KeepChargeFullFrame',
      note: '直接记录显式满蓄力储存帧',
    }),
    explicitOrPending({
      key: 'fullChargeOverrideFiringDurationFrames',
      label: '满蓄力覆盖射击窗口',
      value: fullCharge?.MaxShootingFrame_Second,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponFullChargeParam.MaxShootingFrame_Second',
      note: '仅记录满蓄力专用对象中的显式覆盖值',
    }),
    explicitOrPending({
      key: 'fullChargeOverrideFireIntervalFrames',
      label: '满蓄力覆盖射击间隔',
      value: fullCharge?.RepeatFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponFullChargeParam.RepeatFrame',
      note: '仅记录满蓄力专用对象中的显式覆盖值',
    }),
    explicitOrPending({
      key: 'variableDamagePerShot',
      label: '可变射击状态单发伤害',
      value: damage(
        variableDamage?.ValueFullChargeMax ?? variableDamage?.ValueMax,
      ),
      unit: 'damage',
      fileName,
      path: 'GameParameters.VariableDamageParam.ValueFullChargeMax|ValueMax',
      note: '记录可变射击状态的显式最大伤害，不与通常状态混合',
    }),
    explicitOrPending({
      key: 'variableFireIntervalFrames',
      label: '可变射击状态间隔',
      value: variableShot?.RepeatFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.VariableShotParam.RepeatFrame',
      note: '记录可变射击状态的显式重复发射间隔',
    }),
    explicitOrPending({
      key: 'variableMovementSpeedWhileFiring',
      label: '可变射击状态移动速度',
      value: variableShot?.MoveSpeed,
      unit: 'internal',
      fileName,
      path: 'GameParameters.VariableShotParam.MoveSpeed',
      note: '记录可变射击状态未叠加装备能力的内部移动速度',
    }),
    explicitOrPending({
      key: 'variableTransitionFrames',
      label: '可变射击状态过渡帧',
      value: variableShot?.VariableInterpolatedFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.VariableShotParam.VariableInterpolatedFrame',
      note: '直接记录可变射击状态的显式插值过渡帧',
    }),
    pendingField(
      'effectiveRange',
      '有效射程',
      'internal',
      '需要统一初速、弹丸寿命、伤害衰减与界面射程的换算口径',
    ),
  ];
}

function maneuverFields(fileName, game) {
  const weapon = game.WeaponParam;
  const step = game.SideStepParam;
  return [
    explicitOrPending({
      key: 'postDodgeDamagePerShot',
      label: '翻滚后单发伤害',
      value: damage(game.DamageLapOverParam?.ValueMax),
      unit: 'damage',
      fileName,
      path: 'GameParameters.DamageLapOverParam.ValueMax',
      note: '翻滚重叠状态的显式最大伤害定点值除以 10',
      pendingNote:
        '参数文件未显式提供 DamageLapOverParam；不自动把普通状态伤害复制为翻滚后伤害',
    }),
    explicitOrPending({
      key: 'postDodgeSpreadDegrees',
      label: '翻滚后射击扩散',
      value: weapon?.LapOver_DegSwerve,
      unit: 'degrees',
      fileName,
      path: 'GameParameters.WeaponParam.LapOver_DegSwerve',
      note: '直接记录翻滚重叠状态 LapOver_DegSwerve',
    }),
    explicitOrPending({
      key: 'damagePerShot',
      label: '单发基础伤害',
      value: damage(game.DamageParam?.ValueMax),
      unit: 'damage',
      fileName,
      path: 'GameParameters.DamageParam.ValueMax',
      note: '上游最大伤害定点值除以 10',
    }),
    explicitOrPending({
      key: 'fireIntervalFrames',
      label: '普通射击间隔',
      value: weapon?.RepeatFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.RepeatFrame',
      note: '直接记录普通状态 RepeatFrame',
    }),
    explicitOrPending({
      key: 'postDodgeFireIntervalFrames',
      label: '翻滚后射击间隔',
      value: weapon?.LapOver_RepeatFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.WeaponParam.LapOver_RepeatFrame',
      note: '直接记录翻滚重叠状态的显式发射间隔',
    }),
    explicitOrPending({
      key: 'inkConsumptionPerShot',
      label: '单发耗墨',
      value: percent(weapon?.InkConsume),
      unit: 'percent',
      fileName,
      path: 'GameParameters.WeaponParam.InkConsume',
      note: '显式耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'movementSpeedWhileFiring',
      label: '射击时移动速度',
      value: weapon?.MoveSpeed,
      unit: 'internal',
      fileName,
      path: 'GameParameters.WeaponParam.MoveSpeed',
      note: '直接记录未叠加装备能力的内部移动速度',
    }),
    explicitOrPending({
      key: 'groundShotSpreadDegrees',
      label: '地面射击扩散',
      value: weapon?.Stand_DegSwerve,
      unit: 'degrees',
      fileName,
      path: 'GameParameters.WeaponParam.Stand_DegSwerve',
      note: '直接记录 Stand_DegSwerve',
    }),
    explicitOrPending({
      key: 'jumpShotSpreadDegrees',
      label: '跳跃射击扩散',
      value: weapon?.Jump_DegSwerve,
      unit: 'degrees',
      fileName,
      path: 'GameParameters.WeaponParam.Jump_DegSwerve',
      note: '直接记录 Jump_DegSwerve',
    }),
    explicitOrPending({
      key: 'dodgeInkConsumption',
      label: '翻滚耗墨',
      value: percent(step?.InkConsume),
      unit: 'percent',
      fileName,
      path: 'GameParameters.SideStepParam.InkConsume',
      note: '显式翻滚耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'dodgeMoveFrames',
      label: '翻滚移动帧',
      value: step?.MoveFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.SideStepParam.MoveFrame',
      note: '直接记录 SideStepParam.MoveFrame',
    }),
    pendingField(
      'effectiveRange',
      '有效射程',
      'internal',
      '需要统一翻滚前后弹道、衰减与界面射程的换算口径',
    ),
  ];
}

function shelterFields(fileName, game) {
  const bullet = game.spl__BulletShelterShotgunParam;
  const canopyBullet = game.spl__BulletShelterCanopyParam;
  const groups = bullet?.GroupParams ?? [];
  const pelletMaximums = numericValues(
    groups.map((group) => group.DamageParam?.ValueMax),
  );
  const pelletCount = groups.every(
    (group) => typeof group.TotalNum === 'number',
  )
    ? groups.reduce((total, group) => total + group.TotalNum, 0)
    : null;
  const shotgun = game.spl__WeaponShelterShotgunParam;
  const canopy = game.spl__WeaponShelterCanopyParam;
  return [
    explicitOrPending({
      key: 'maximumPelletDamage',
      label: '单颗弹丸最大伤害',
      value: pelletMaximums.length ? damage(Math.max(...pelletMaximums)) : null,
      unit: 'damage',
      fileName,
      path: 'GameParameters.spl__BulletShelterShotgunParam.GroupParams[*].DamageParam.ValueMax',
      note: '取散弹组中最高显式单颗伤害并除以 10',
    }),
    explicitOrPending({
      key: 'effectiveTotalDamageCap',
      label: '有效总伤害上限',
      value: damage(bullet?.DamageEffectiveTotalMax),
      unit: 'damage',
      fileName,
      path: 'GameParameters.spl__BulletShelterShotgunParam.DamageEffectiveTotalMax',
      note: '显式有效总伤害上限定点值除以 10',
    }),
    explicitOrPending({
      key: 'pelletCount',
      label: '每次射击弹丸数',
      value: pelletCount,
      unit: 'count',
      fileName,
      path: 'GameParameters.spl__BulletShelterShotgunParam.GroupParams[*].TotalNum',
      note: '对所有显式散弹组的 TotalNum 求和',
    }),
    explicitOrPending({
      key: 'inkConsumptionPerShot',
      label: '每次射击耗墨',
      value: percent(shotgun?.InkConsume),
      unit: 'percent',
      fileName,
      path: 'GameParameters.spl__WeaponShelterShotgunParam.InkConsume',
      note: '显式耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'canopyLaunchInkConsumption',
      label: '伞面发射耗墨',
      value: percent(canopy?.InkConsumeUmbrella),
      unit: 'percent',
      fileName,
      path: 'GameParameters.spl__WeaponShelterCanopyParam.InkConsumeUmbrella',
      note: '显式伞面发射耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'canLaunchCanopy',
      label: '能否发射伞面',
      value: canopy?.IsCanopyShot,
      unit: 'boolean',
      fileName,
      path: 'GameParameters.spl__WeaponShelterCanopyParam.IsCanopyShot',
      note: '仅记录文件中显式布尔值；字段省略时不推定为 true',
    }),
    explicitOrPending({
      key: 'canopyChargeFrames',
      label: '长按至开伞准备帧',
      value: canopy?.CanopyChargeFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponShelterCanopyParam.CanopyChargeFrame',
      note: '直接记录 CanopyChargeFrame，不与其他阶段相加',
    }),
    explicitOrPending({
      key: 'canopyOpenFrames',
      label: '伞面展开帧',
      value: canopy?.CanopyOpenFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponShelterCanopyParam.CanopyOpenFrame',
      note: '直接记录 CanopyOpenFrame，不解释为完整防御生效时间',
    }),
    explicitOrPending({
      key: 'canopyLaunchFrames',
      label: '伞面发射阶段帧',
      value: canopy?.CanopyShotFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponShelterCanopyParam.CanopyShotFrame',
      note: '直接记录 CanopyShotFrame；不可发射或字段省略时不补默认值',
    }),
    explicitOrPending({
      key: 'canopyRecoveryFrames',
      label: '伞面再生帧',
      value: canopy?.CanopyNakedFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponShelterCanopyParam.CanopyNakedFrame',
      note: '直接记录伞面裸露／再生成熟所需的显式帧值',
    }),
    explicitOrPending({
      key: 'shotInkRecoveryLockFrames',
      label: '射击后回墨锁帧',
      value: shotgun?.InkRecoverStop,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponShelterShotgunParam.InkRecoverStop',
      note: '直接记录普通射击后的显式回墨停止帧',
    }),
    explicitOrPending({
      key: 'canopyShotInkRecoveryLockFrames',
      label: '伞面发射后回墨锁帧',
      value: shotgun?.InkRecoverStopCanopy,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponShelterShotgunParam.InkRecoverStopCanopy',
      note: '仅记录伞面发射动作对应的显式回墨停止帧',
    }),
    explicitOrPending({
      key: 'canopyDurability',
      label: '伞面耐久',
      value: damage(canopyBullet?.CanopyHP),
      unit: 'hp',
      fileName,
      path: 'GameParameters.spl__BulletShelterCanopyParam.CanopyHP',
      note: '显式伞面耐久定点值除以 10；字段省略时保持待验证',
    }),
    explicitOrPending({
      key: 'movementSpeedWhileFiring',
      label: '射击时移动速度',
      value: shotgun?.MoveSpeed,
      unit: 'internal',
      fileName,
      path: 'GameParameters.spl__WeaponShelterShotgunParam.MoveSpeed',
      note: '直接记录内部移动速度',
    }),
    pendingField(
      'completeFireCycleFrames',
      '完整射击周期',
      'frames',
      '文件中的 RepeatFrame 不能直接解释为全部伞类的完整开火周期，等待动作时序核验',
    ),
    pendingField(
      'effectiveRange',
      '有效射程',
      'internal',
      '需要结合各散弹组初速、扩散和伤害上限定义统一口径',
    ),
  ];
}

function stringerFields(fileName, game) {
  const bullet = game.spl__BulletStringerParam;
  const weapon = game.spl__WeaponStringerParam;
  const charge = weapon?.ChargeParam;
  const detonation = bullet?.DetonationParam;
  const blast = detonation?.BlastParam?.DistanceDamage?.[0];
  const projectileCount = fileName.includes('StringerNormal')
    ? verifiedField({
        key: 'projectileCount',
        label: '每次发射箭数',
        value: 3,
        unit: 'arrows',
        fileName,
        path: 'official-description',
        note: 'Nintendo 官方武器说明明确写明三向发射；仅用于计算三发猎鱼弓系单轮全中伤害',
      })
    : fileName.includes('StringerExplosion')
      ? verifiedField({
          key: 'projectileCount',
          label: '每次发射箭数',
          value: 5,
          unit: 'arrows',
          fileName,
          path: 'official-description',
          note: 'Nintendo 官方武器说明明确写明一次发射五发；仅用于计算邦普V系单轮全中伤害',
        })
      : pendingField(
          'projectileCount',
          '每次发射箭数',
          'arrows',
          '当前固定上游参数文件未显式提供箭数；在找到可审计来源前不推导整轮伤害',
        );
  if (projectileCount.status === 'verified') {
    projectileCount.sourceId = NINTENDO_WEAPON_SOURCE_ID;
    projectileCount.upstreamPath = NINTENDO_WEAPON_SOURCE_URL;
    projectileCount.checkedAt = '2026-10-10';
  }
  return [
    projectileCount,
    explicitOrPending({
      key: 'minimumChargeArrowDamage',
      label: '最低蓄力单箭伤害',
      value: damage(bullet?.DamageParam?.DirectHitDamageMin),
      unit: 'damage',
      fileName,
      path: 'GameParameters.spl__BulletStringerParam.DamageParam.DirectHitDamageMin',
      note: '最低蓄力单箭直击伤害定点值除以 10',
    }),
    explicitOrPending({
      key: 'middleChargeArrowDamage',
      label: '一段蓄力单箭伤害',
      value: damage(bullet?.DamageParam?.DirectHitDamageMid),
      unit: 'damage',
      fileName,
      path: 'GameParameters.spl__BulletStringerParam.DamageParam.DirectHitDamageMid',
      note: '一段蓄力单箭直击伤害定点值除以 10',
    }),
    explicitOrPending({
      key: 'fullChargeArrowDamage',
      label: '满蓄力单箭伤害',
      value: damage(bullet?.DamageParam?.DirectHitDamageMax),
      unit: 'damage',
      fileName,
      path: 'GameParameters.spl__BulletStringerParam.DamageParam.DirectHitDamageMax',
      note: '满蓄力单箭直击伤害定点值除以 10',
    }),
    explicitOrPending({
      key: 'minimumChargeFrames',
      label: '最低蓄力时间',
      value: charge?.ChargeFrameMinCharge,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponStringerParam.ChargeParam.ChargeFrameMinCharge',
      note: '直接记录最低蓄力帧',
    }),
    explicitOrPending({
      key: 'middleChargeFrames',
      label: '一段蓄力时间',
      value: charge?.ChargeFrameMidCharge,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponStringerParam.ChargeParam.ChargeFrameMidCharge',
      note: '直接记录一段蓄力帧',
    }),
    explicitOrPending({
      key: 'fullChargeFrames',
      label: '满蓄力时间',
      value: charge?.ChargeFrameFullCharge,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponStringerParam.ChargeParam.ChargeFrameFullCharge',
      note: '直接记录满蓄力帧',
    }),
    explicitOrPending({
      key: 'minimumChargeInkConsumption',
      label: '最低蓄力耗墨',
      value: percent(charge?.InkConsumeMinCharge),
      unit: 'percent',
      fileName,
      path: 'GameParameters.spl__WeaponStringerParam.ChargeParam.InkConsumeMinCharge',
      note: '显式耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'middleChargeInkConsumption',
      label: '一段蓄力耗墨',
      value: percent(charge?.InkConsumeMidCharge),
      unit: 'percent',
      fileName,
      path: 'GameParameters.spl__WeaponStringerParam.ChargeParam.InkConsumeMidCharge',
      note: '显式耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'fullChargeInkConsumption',
      label: '满蓄力耗墨',
      value: percent(charge?.InkConsumeFullCharge),
      unit: 'percent',
      fileName,
      path: 'GameParameters.spl__WeaponStringerParam.ChargeParam.InkConsumeFullCharge',
      note: '显式耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'postDelayFrames',
      label: '射击后摇',
      value: charge?.PostDelayFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponStringerParam.ChargeParam.PostDelayFrame',
      note: '直接记录显式射击后摇',
    }),
    explicitOrPending({
      key: 'detonationDamage',
      label: '爆炸伤害',
      value: damage(blast?.Damage),
      unit: 'damage',
      fileName,
      path: 'GameParameters.spl__BulletStringerParam.DetonationParam.BlastParam.DistanceDamage[0].Damage',
      note: '爆炸伤害定点值除以 10',
    }),
    explicitOrPending({
      key: 'detonationFrames',
      label: '爆炸等待帧',
      value: detonation?.DetonationFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__BulletStringerParam.DetonationParam.DetonationFrame',
      note: '直接记录箭矢爆炸等待帧',
    }),
    explicitOrPending({
      key: 'canStoreCharge',
      label: '可储存蓄力',
      value: weapon?.IsEnableChargeKeep,
      unit: null,
      fileName,
      path: 'GameParameters.spl__WeaponStringerParam.IsEnableChargeKeep',
      note: '直接记录布尔开关',
    }),
    pendingField(
      'effectiveRange',
      '有效射程',
      'internal',
      '需要区分最低、一段、满蓄力初速及散射角后再定义统一口径',
    ),
  ];
}

function saberFields(fileName, game) {
  const weapon = game.spl__WeaponSaberParam;
  const charge = weapon?.ChargeParam;
  const swing = weapon?.SwingParam;
  return [
    explicitOrPending({
      key: 'horizontalProjectileDamage',
      label: '横斩墨刃伤害',
      value: damage(game.BulletSaberHorizontalParam?.DamageParam?.HitDamage),
      unit: 'damage',
      fileName,
      path: 'GameParameters.BulletSaberHorizontalParam.DamageParam.HitDamage',
      note: '横斩墨刃定点伤害除以 10',
    }),
    explicitOrPending({
      key: 'chargedProjectileDamage',
      label: '蓄力斩墨刃伤害',
      value: damage(game.BulletSaberVerticalParam?.DamageParam?.HitDamage),
      unit: 'damage',
      fileName,
      path: 'GameParameters.BulletSaberVerticalParam.DamageParam.HitDamage',
      note: '蓄力斩墨刃定点伤害除以 10',
    }),
    explicitOrPending({
      key: 'horizontalSlashDamage',
      label: '横斩刀身伤害',
      value: damage(
        game.BulletSaberSlashHorizontalParam?.DamageParam?.DamageValue,
      ),
      unit: 'damage',
      fileName,
      path: 'GameParameters.BulletSaberSlashHorizontalParam.DamageParam.DamageValue',
      note: '横斩近身刀身定点伤害除以 10',
    }),
    explicitOrPending({
      key: 'chargedSlashDamage',
      label: '蓄力斩刀身伤害',
      value: damage(
        game.BulletSaberSlashVerticalParam?.DamageParam?.DamageValue,
      ),
      unit: 'damage',
      fileName,
      path: 'GameParameters.BulletSaberSlashVerticalParam.DamageParam.DamageValue',
      note: '蓄力斩近身刀身定点伤害除以 10',
    }),
    explicitOrPending({
      key: 'horizontalInkConsumption',
      label: '横斩耗墨',
      value: percent(swing?.InkConsume),
      unit: 'percent',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.SwingParam.InkConsume',
      note: '显式横斩耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'fullChargeInkConsumption',
      label: '满蓄力斩耗墨',
      value: percent(charge?.InkConsumeFullCharge),
      unit: 'percent',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.ChargeParam.InkConsumeFullCharge',
      note: '显式满蓄力耗墨比例乘以 100',
    }),
    explicitOrPending({
      key: 'fullChargeFrames',
      label: '满蓄力时间',
      value: charge?.ChargeFrameFullCharge,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.ChargeParam.ChargeFrameFullCharge',
      note: '直接记录满蓄力帧',
    }),
    explicitOrPending({
      key: 'horizontalSwingFrames',
      label: '横斩动作帧',
      value: swing?.WeakSwingFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.SwingParam.WeakSwingFrame',
      note: '直接记录 WeakSwingFrame',
    }),
    explicitOrPending({
      key: 'horizontalProjectileReleaseFrame',
      label: '横斩墨刃释放帧',
      value: swing?.WeakSwingShotBulletFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.SwingParam.WeakSwingShotBulletFrame',
      note: '直接记录横斩动作中墨刃生成的时间点',
    }),
    explicitOrPending({
      key: 'horizontalSlashReleaseFrame',
      label: '横斩刀身判定帧',
      value: swing?.WeakSwingShotSlashFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.SwingParam.WeakSwingShotSlashFrame',
      note: '直接记录横斩动作中近身刀身判定的时间点',
    }),
    explicitOrPending({
      key: 'chargedSwingFrames',
      label: '蓄力斩动作帧',
      value: swing?.ChargeSwingFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.SwingParam.ChargeSwingFrame',
      note: '直接记录 ChargeSwingFrame',
    }),
    explicitOrPending({
      key: 'chargedProjectileReleaseFrame',
      label: '蓄力斩墨刃释放帧',
      value: swing?.ChargeSwingShotBulletFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.SwingParam.ChargeSwingShotBulletFrame',
      note: '直接记录蓄力斩动作中墨刃生成的时间点；不含前置蓄力时间',
    }),
    explicitOrPending({
      key: 'chargedSlashReleaseFrame',
      label: '蓄力斩刀身判定帧',
      value: swing?.ChargeSwingShotSlashFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.SwingParam.ChargeSwingShotSlashFrame',
      note: '直接记录蓄力斩动作中近身刀身判定的时间点；不含前置蓄力时间',
    }),
    explicitOrPending({
      key: 'horizontalPostDelayFrames',
      label: '横斩后摇',
      value: swing?.WeakSwingPostDelayFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.SwingParam.WeakSwingPostDelayFrame',
      note: '直接记录横斩后摇',
    }),
    explicitOrPending({
      key: 'chargedPostDelayFrames',
      label: '蓄力斩后摇',
      value: swing?.ChargeSwingPostDelayFrame,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.SwingParam.ChargeSwingPostDelayFrame',
      note: '直接记录蓄力斩后摇',
    }),
    explicitOrPending({
      key: 'horizontalInkRecoveryLockFrames',
      label: '横斩回墨锁定',
      value: swing?.InkRecoverStop,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.SwingParam.InkRecoverStop',
      note: '直接记录横斩后禁止开始回墨的显式帧数',
    }),
    explicitOrPending({
      key: 'chargedInkRecoveryLockFrames',
      label: '蓄力斩回墨锁定',
      value: swing?.InkRecoverStop_ChargeSwing,
      unit: 'frames',
      fileName,
      path: 'GameParameters.spl__WeaponSaberParam.SwingParam.InkRecoverStop_ChargeSwing',
      note: '直接记录蓄力斩后禁止开始回墨的显式帧数',
    }),
    pendingField(
      'effectiveRange',
      '有效射程',
      'internal',
      '需要分别定义横斩与蓄力斩墨刃、刀身和爆炸范围',
    ),
  ];
}

const builders = {
  画笔: brushFields,
  泼桶: slosherFields,
  加特林: spinnerFields,
  双枪: maneuverFields,
  伞: shelterFields,
  弓: stringerFields,
  刮水刀: saberFields,
};

const imported = new Map();
const familyCounts = {};
for (const [family, spec] of Object.entries(familySpecs)) {
  const weapons = mainWeapons.weapons.filter(
    (weapon) => weapon.family === family,
  );
  if (weapons.length !== spec.count) {
    throw new Error(
      `Expected ${spec.count} ${family} weapons, received ${weapons.length}`,
    );
  }
  familyCounts[family] = { weapons: weapons.length, parameterClasses: 0 };
  const classes = new Set();
  for (const weapon of weapons) {
    const { fileName, game } = readParameters(weapon, spec.prefix);
    classes.add(fileName);
    const parameters = builders[family](fileName, game);
    if (!parameters.some((field) => field.status === 'verified')) {
      throw new Error(`No explicit fields imported for ${weapon.id}`);
    }
    imported.set(weapon.id, { weaponId: weapon.id, parameters });
  }
  familyCounts[family].parameterClasses = classes.size;
}

const records = parameterDatabase.records.map(
  (record) => imported.get(record.weaponId) ?? record,
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
writeDatabase('remaining-family-parameter-import-report.v11.3.0.json', {
  gameVersion: GAME_VERSION,
  importedAt: CHECKED_AT,
  sourceId: SOURCE_ID,
  sourceCommit: SOURCE_COMMIT,
  attribution: 'Data provided by Lean',
  scope:
    'Brush, Slosher, Spinner, Maneuver, Shelter, Stringer, and Saber explicit fields only',
  inputs: [...sourceFiles.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([fileName, sourceText]) => ({
      upstreamPath: `${UPSTREAM_ROOT}/${fileName}`,
      sha256: sha256(sourceText),
    })),
  outputCounts: {
    importedWeapons: imported.size,
    importedParameterClasses: sourceFiles.size,
    families: familyCounts,
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
  `Imported explicit parameters for ${imported.size} weapons from ${sourceFiles.size} shared parameter classes.`,
);
