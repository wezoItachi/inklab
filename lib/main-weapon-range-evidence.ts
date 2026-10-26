import type {
  MainWeaponParameterField,
  MainWeaponParameterRecord,
  WeaponFamily,
} from '../database/schema.ts';

export type MainWeaponRangeEvidenceMetric = {
  key: string;
  label: string;
  value: number;
  unit: string;
};

export type MainWeaponRangeEvidence = {
  status: 'source-backed-primitives' | 'definition-ready';
  modelLabel: string;
  metrics: MainWeaponRangeEvidenceMetric[];
  definition: string;
  measurementBoundary: string;
  nextEvidence: string;
  limitation: string;
};

export type MainWeaponRangePolicy = Pick<
  MainWeaponRangeEvidence,
  'modelLabel' | 'definition' | 'measurementBoundary' | 'nextEvidence'
>;

export const mainWeaponRangePolicies: Record<
  WeaponFamily,
  MainWeaponRangePolicy
> = {
  射击枪: {
    modelLabel: '直击与伤害衰减边界',
    definition:
      '分别记录平地同高目标的最远直击距离与伤害开始衰减距离，不合并成一个模糊数字。',
    measurementBoundary:
      '站立、水平射击、同高静止目标；连射扩散与跳射另行记录。',
    nextEvidence: '补全弹丸后续运动阶段，再用训练场逐格实测校验。',
  },
  爆破枪: {
    modelLabel: '直击终点与爆风边界',
    definition: '将弹道终点、直击范围、近端爆风和远端爆风作为四个独立边界。',
    measurementBoundary:
      '平地同高目标，先测爆炸中心位置，再测每档爆风的外边界。',
    nextEvidence: '补全弹道终点与爆炸触发语义，并与逐格实测对齐。',
  },
  滚筒: {
    modelLabel: '横挥、竖挥与碾压边界',
    definition:
      '横挥和竖挥各自记录最高伤害边界与可造成伤害的最远边界；碾压仅记录接触判定。',
    measurementBoundary:
      '固定挥击起点和目标高度，横挥、竖挥、碾压三套数据不混用。',
    nextEvidence: '解析墨滴组分布后，对最高伤害和最远命中两条边界分别取样。',
  },
  画笔: {
    modelLabel: '挥击墨滴与刷地接触边界',
    definition:
      '挥击记录最高伤害边界与最远命中边界；刷地只记录接触宽度和接触判定。',
    measurementBoundary:
      '平地固定挥击方向，多次重复以识别墨滴分布；不把刷地速度当成射程。',
    nextEvidence: '完成挥击墨滴分布的可重复取样，再独立验证刷地接触。',
  },
  蓄力枪: {
    modelLabel: '分段蓄力直击边界',
    definition: '以满蓄力的最远直击距离为主指标，未满蓄力按固定蓄力档位另列。',
    measurementBoundary:
      '平地同高目标，先测满蓄力；镜筒版与非镜筒版不互相复制。',
    nextEvidence: '校验满蓄力弹道内部单位与训练场距离，再逐步补未满蓄力档位。',
  },
  泼桶: {
    modelLabel: '伤害单元轨迹边界',
    definition:
      '以主要伤害单元可直接命中的最远距离为主指标，反弹、跨障碍轨迹和爆风单独列出。',
    measurementBoundary:
      '平地同高目标，保持固定视角；不把轨迹组数当成弹体数或射程。',
    nextEvidence: '建立各泼桶子类轨迹模型，用直击、反弹和爆风分组取样校验。',
  },
  加特林: {
    modelLabel: '蓄力状态直击边界',
    definition:
      '满蓄力状态下记录开始衰减和最远直击距离；存在可变射击状态时另列。',
    measurementBoundary:
      '平地同高目标，从同一蓄力状态发射；不把蓄力时间换算成射程。',
    nextEvidence: '补全弹丸运动与衰减阶段，并对可变射击状态分别取样。',
  },
  双枪: {
    modelLabel: '普通与翻滚后直击边界',
    definition: '普通射击和翻滚后定点射击分别记录衰减边界与最远直击距离。',
    measurementBoundary:
      '平地同高目标，固定翻滚方向；只有实测确认相同时才能合并两种状态。',
    nextEvidence: '对普通和翻滚后弹丸参数分别建模，再做同条件对照实测。',
  },
  伞: {
    modelLabel: '散弹覆盖与有效伤害边界',
    definition:
      '分别记录任一弹丸可命中的最远距离，以及整轮达到指定总伤害的距离。',
    measurementBoundary:
      '平地同高目标，固定射击姿态并多次重复；伞面发射距离不属于主武射程。',
    nextEvidence: '先验证弹丸分布与单轮封顶伤害，再为伤害阈值建立重复取样。',
  },
  弓: {
    modelLabel: '分段蓄力箭矢与爆炸边界',
    definition: '各蓄力档位分别记录直击距离、箭矢落点分布和爆炸外边界。',
    measurementBoundary:
      '平地固定视角与蓄力档位；不把多枚箭矢全中当成默认实战结果。',
    nextEvidence:
      '对每个蓄力档位的弹道和箭矢数建模，再分别采集直击与爆炸边界。',
  },
  刮水刀: {
    modelLabel: '墨刃飞行与近身刀身边界',
    definition: '横斩和蓄力斩各自分成墨刃最远命中距离与近身刀身接触距离。',
    measurementBoundary:
      '平地同高目标，四种命中形态独立记录；墨刃与刀身伤害不自动相加。',
    nextEvidence: '建立横斩与蓄力斩墨刃运动模型，并对近身刀身单独取样。',
  },
};

function verifiedNumber(
  parameters: readonly MainWeaponParameterField[],
  key: string,
) {
  const field = parameters.find((parameter) => parameter.key === key);
  return field?.status === 'verified' &&
    typeof field.value === 'number' &&
    Number.isFinite(field.value)
    ? field.value
    : null;
}

function metric(
  parameters: readonly MainWeaponParameterField[],
  key: string,
  label: string,
  unit: string,
): MainWeaponRangeEvidenceMetric | null {
  const value = verifiedNumber(parameters, key);
  return value === null ? null : { key, label, value, unit };
}

export function analyzeMainWeaponRangeEvidence(
  record: MainWeaponParameterRecord,
  family: WeaponFamily,
): MainWeaponRangeEvidence {
  const parameters = record.parameters;
  const policy = mainWeaponRangePolicies[family];
  let limitation = '射程口径已定义，但尚无可安全换算成游戏距离的来源字段。';
  let candidates: Array<MainWeaponRangeEvidenceMetric | null> = [];

  if (family === '射击枪') {
    limitation =
      '当前只证明衰减帧和弹丸初速；尚未积分后续运动、重力与碰撞，因此不输出距离。';
    candidates = [
      metric(parameters, 'damageFalloffStartFrames', '开始衰减', '帧'),
      metric(parameters, 'damageFalloffEndFrames', '最低伤害层', '帧'),
      metric(parameters, 'projectileSpawnSpeed', '弹丸初速', '内部单位'),
    ];
  } else if (family === '爆破枪') {
    limitation =
      '控制点用于解释爆风伤害曲线，不直接等同于武器总射程或完整爆炸半径。';
    candidates = [
      metric(parameters, 'nearBlastDistance', '近端控制点', '内部单位'),
      metric(parameters, 'farBlastDistance', '远端控制点', '内部单位'),
    ];
  } else if (family === '蓄力枪') {
    limitation =
      '只表示参数文件的满蓄力弹道距离，不替代未满蓄力射程或实际有效命中范围。';
    candidates = [
      metric(parameters, 'fullChargeTravelDistance', '满蓄力弹道', '内部单位'),
    ];
  } else if (family === '泼桶') {
    limitation =
      '仅爆炸泼桶类显式提供爆风范围；它不是所有泼桶通用射程，也不与直击轨迹自动相加。';
    candidates = [
      metric(parameters, 'blastDamageRadius', '爆风伤害范围', '内部单位'),
    ];
  }

  const metrics = candidates.filter(
    (item): item is MainWeaponRangeEvidenceMetric => item !== null,
  );
  return {
    ...policy,
    status:
      metrics.length > 0 ? 'source-backed-primitives' : 'definition-ready',
    metrics,
    limitation,
  };
}
