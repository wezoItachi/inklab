export const MAX_ABILITY_POINTS = 57;

export const representableAbilityPoints = Object.freeze(
  [
    ...new Set(
      Array.from({ length: 4 }, (_, mains) =>
        Array.from({ length: 10 }, (_, subs) => mains * 10 + subs * 3),
      ).flat(),
    ),
  ]
    .filter((ap) => ap <= MAX_ABILITY_POINTS)
    .sort((left, right) => left - right),
);

export type AbilityCurveStatus = 'verified' | 'pending' | 'not-applicable';

export type AbilityCurveSample = {
  ap: number;
  multiplier: number;
  benefitPercent: number;
};

export type AbilityCurveDefinition = {
  abilityId: string;
  status: AbilityCurveStatus;
  title: string;
  outputLabel: string;
  formulaLabel: string;
  sourceNote: string;
  minimumEffectiveAp: number | null;
  minimumEffectiveRule: string;
  thresholdScope:
    | 'universal'
    | 'weapon-specific'
    | 'pending'
    | 'not-applicable';
  calculate: ((ap: number) => AbilityCurveSample) | null;
};

export function clampAbilityPoints(ap: number) {
  return Math.max(0, Math.min(MAX_ABILITY_POINTS, ap));
}

export function getAbilityIntensity(ap: number): number {
  const boundedAp = clampAbilityPoints(ap);
  return Math.min(100, 3.3 * boundedAp - 0.027 * boundedAp ** 2) / 100;
}

type AbilityValueTriple = readonly [high: number, mid: number, low: number];

export function interpolateAbilityValue(
  [high, mid, low]: AbilityValueTriple,
  ap: number,
): number {
  const intensity = getAbilityIntensity(ap);
  if (high === low) return low;
  const slope = mid === low ? 0 : (mid - low) / (high - low);
  const curvedIntensity =
    slope.toFixed(3) === '0.500' || intensity === 0 || intensity === 1
      ? intensity
      : Math.E ** (-(Math.log(intensity) * Math.log(slope)) / Math.log(2));
  return low + (high - low) * curvedIntensity;
}

export function getMainInkSaverMultiplier(ap: number): number {
  return interpolateAbilityValue([0.55, 0.775, 1], ap);
}

const subInkSaverValues = [
  [0.8, 0.9, 1],
  [0.7, 0.85, 1],
  [0.65, 0.825, 1],
  [0.6, 0.8, 1],
  [0.711111, 0.855555, 1],
] as const;

export function getSubInkSaverMultiplier(
  ap: number,
  level: 0 | 1 | 2 | 3 | 4 = 2,
): number {
  return interpolateAbilityValue(subInkSaverValues[level], ap);
}

export function getInkRecoveryFrames(
  ap: number,
  form: 'humanoid' | 'squid',
): number {
  return interpolateAbilityValue(
    form === 'humanoid' ? [220, 410, 600] : [117, 148.5, 180],
    ap,
  );
}

export function getSuperJumpFrames(
  ap: number,
  phase: 'charge' | 'move',
): number {
  return interpolateAbilityValue(
    phase === 'charge' ? [20, 35, 80] : [96.6, 132.3, 138],
    ap,
  );
}

export function getSwimSpeed(ap: number): number {
  return interpolateAbilityValue([0.24, 0.216, 0.192], ap) * 10;
}

export function getRunSpeed(ap: number): number {
  return interpolateAbilityValue([0.144, 0.12, 0.096], ap) * 10;
}

const mainInkSaverCurve: AbilityCurveDefinition = {
  abilityId: 'ism',
  status: 'verified',
  title: '主武器耗墨倍率',
  outputLabel: '耗墨降低',
  formulaLabel: '1 − 0.45 × AP 效果强度',
  sourceNote:
    '效果曲线已与 Splatoon 3 社区数据表交叉核对；武器基础耗墨来自已固定的 Leanny 12.0 数据快照。',
  minimumEffectiveAp: 3,
  minimumEffectiveRule:
    '以游戏内可装备的 AP 组合为范围，取第一个能令计算结果发生变化的投入值。',
  thresholdScope: 'weapon-specific',
  calculate(ap) {
    const boundedAp = clampAbilityPoints(ap);
    const multiplier = getMainInkSaverMultiplier(boundedAp);
    return {
      ap: boundedAp,
      multiplier,
      benefitPercent: (1 - multiplier) * 100,
    };
  },
};

const subInkSaverCurve: AbilityCurveDefinition = {
  abilityId: 'iss',
  status: 'verified',
  title: '副武器耗墨倍率（标准档）',
  outputLabel: '耗墨降低',
  formulaLabel: '按副武器 Lv0–Lv4 档位插值',
  sourceNote:
    '能力三点值与副武器档位已和 Leanny 12.0 固定快照及 Sendou.ink 构建分析器实现交叉核对；百科显示 Lv2 标准档，实验室按当前副武器实际档位计算。',
  minimumEffectiveAp: 3,
  minimumEffectiveRule:
    '所有五个副武器档位在首个可装备投入 3AP 时都会改变耗墨倍率；实际完整使用次数临界点仍取决于副武器和墨水槽容量。',
  thresholdScope: 'weapon-specific',
  calculate(ap) {
    const boundedAp = clampAbilityPoints(ap);
    const multiplier = getSubInkSaverMultiplier(boundedAp);
    return {
      ap: boundedAp,
      multiplier,
      benefitPercent: (1 - multiplier) * 100,
    };
  },
};

const inkRecoveryCurve: AbilityCurveDefinition = {
  abilityId: 'iru',
  status: 'verified',
  title: '潜墨状态回满时间',
  outputLabel: '回满时间缩短',
  formulaLabel: '潜墨 180→117 帧 · 非潜墨 600→220 帧',
  sourceNote:
    '百科曲线以潜墨状态为主轴；实验室同时展示潜墨与非潜墨两种回满时间。两组三点值来自 Leanny 12.0 固定快照，并与 Sendou.ink 公开分析器实现交叉核对。仅适用于普通对战，鲑鱼跑适用性继续待验证。',
  minimumEffectiveAp: 3,
  minimumEffectiveRule:
    '首个可装备投入 3AP 会同时缩短潜墨与非潜墨回满时间；不代表所有配装都必须投入。',
  thresholdScope: 'universal',
  calculate(ap) {
    const boundedAp = clampAbilityPoints(ap);
    const frames = getInkRecoveryFrames(boundedAp, 'squid');
    return {
      ap: boundedAp,
      multiplier: frames / 180,
      benefitPercent: (1 - frames / 180) * 100,
    };
  },
};

const quickSuperJumpCurve: AbilityCurveDefinition = {
  abilityId: 'qsj',
  status: 'verified',
  title: '超级跳跃起跳准备时间',
  outputLabel: '准备时间缩短',
  formulaLabel: '准备 80→20 帧 · 飞行 138→96.6 帧',
  sourceNote:
    '百科曲线以起跳准备时间为主轴；实验室同时展示准备、飞行与合计时间。两组三点值来自 Leanny 12.0 固定快照，并与 Sendou.ink 公开分析器实现交叉核对。隐身跳跃会另加随距离变化、最多 60 帧的惩罚，不计入本曲线。',
  minimumEffectiveAp: 3,
  minimumEffectiveRule:
    '首个可装备投入 3AP 会改变起跳准备与飞行公式；飞行阶段按完整帧显示时要到 9AP 才会由 138 帧降为 137 帧。这只是公式生效边界，不是强制配装建议。',
  thresholdScope: 'universal',
  calculate(ap) {
    const boundedAp = clampAbilityPoints(ap);
    const frames = getSuperJumpFrames(boundedAp, 'charge');
    return {
      ap: boundedAp,
      multiplier: frames / 80,
      benefitPercent: (1 - frames / 80) * 100,
    };
  },
};

const swimSpeedCurve: AbilityCurveDefinition = {
  abilityId: 'ssu',
  status: 'verified',
  title: '鱿鱼冲刺速度（中量级基准）',
  outputLabel: '潜墨移动速度提升',
  formulaLabel: '中量级 1.92→2.40 单位/帧',
  sourceNote:
    '百科以中量级且未装备鱿鱼忍者为基准；实验室按当前武器的轻量／中量／重量级计算。三套能力值来自 Leanny 12.0 固定快照，并与 Sendou.ink 公开分析器实现交叉核对。鱿鱼忍者的 0.9 倍修正会在实验室单独显示。',
  minimumEffectiveAp: 3,
  minimumEffectiveRule:
    '首个可装备投入 3AP 会提高三种重量级的原始游速；这是公式生效边界，不等于所有配装都必须投入。',
  thresholdScope: 'weapon-specific',
  calculate(ap) {
    const boundedAp = clampAbilityPoints(ap);
    const speed = getSwimSpeed(boundedAp);
    return {
      ap: boundedAp,
      multiplier: speed / 1.92,
      benefitPercent: (speed / 1.92 - 1) * 100,
    };
  },
};

const runSpeedCurve: AbilityCurveDefinition = {
  abilityId: 'rsu',
  status: 'verified',
  title: '人形态基础移动速度（中量级基准）',
  outputLabel: '非射击走速提升',
  formulaLabel: '中量级 0.96→1.44 单位/帧',
  sourceNote:
    '百科以中量级的普通人形态移动为基准；实验室按当前武器重量级计算。本曲线不等同于射击、蓄力或满蓄力时的武器专用走速，这些状态后续独立核验。',
  minimumEffectiveAp: 3,
  minimumEffectiveRule:
    '首个可装备投入 3AP 会提高三种重量级的普通人形态移动速度；射击中走速临界点需结合具体武器另行判断。',
  thresholdScope: 'weapon-specific',
  calculate(ap) {
    const boundedAp = clampAbilityPoints(ap);
    const speed = getRunSpeed(boundedAp);
    return {
      ap: boundedAp,
      multiplier: speed / 0.96,
      benefitPercent: (speed / 0.96 - 1) * 100,
    };
  },
};

const verifiedCurves = new Map<string, AbilityCurveDefinition>([
  [mainInkSaverCurve.abilityId, mainInkSaverCurve],
  [subInkSaverCurve.abilityId, subInkSaverCurve],
  [inkRecoveryCurve.abilityId, inkRecoveryCurve],
  [quickSuperJumpCurve.abilityId, quickSuperJumpCurve],
  [swimSpeedCurve.abilityId, swimSpeedCurve],
  [runSpeedCurve.abilityId, runSpeedCurve],
]);

const fixedMainAbilityIds = new Set([
  'og',
  'lde',
  'tenacity',
  'comeback',
  'ninja',
  'haunt',
  'thermal',
  'rp',
  'doubler',
  'stealth',
  'object',
  'drop',
]);

export function getAbilityCurveDefinition(
  abilityId: string,
): AbilityCurveDefinition {
  if (fixedMainAbilityIds.has(abilityId)) {
    return {
      abilityId,
      status: 'not-applicable',
      title: '固定主能力',
      outputLabel: '不使用 AP 曲线',
      formulaLabel: '装备后按固定规则生效',
      sourceNote:
        '这项能力只能出现在对应部位的主能力槽，本身不是可按 0–57AP 重复堆叠的通用能力。',
      minimumEffectiveAp: null,
      minimumEffectiveRule: '固定主能力不参与本站通用 AP 最小有效值筛选。',
      thresholdScope: 'not-applicable',
      calculate: null,
    };
  }
  return (
    verifiedCurves.get(abilityId) ?? {
      abilityId,
      status: 'pending',
      title: 'AP 效果曲线',
      outputLabel: '待核验',
      formulaLabel: '尚未建立可公开复算的公式',
      sourceNote: '当前仅用于配装与分类，不输出未经核对的效果数值。',
      minimumEffectiveAp: null,
      minimumEffectiveRule: '等待公式、边界值与游戏内表现逐项核验。',
      thresholdScope: 'pending',
      calculate: null,
    }
  );
}

export function getAbilityCurveSample(abilityId: string, ap: number) {
  return getAbilityCurveDefinition(abilityId).calculate?.(ap) ?? null;
}

export function hasVerifiedAbilityCurve(abilityId: string) {
  return getAbilityCurveDefinition(abilityId).status === 'verified';
}

export function hasMinimumEffectiveAbilityValue(abilityId: string) {
  return getAbilityCurveDefinition(abilityId).minimumEffectiveAp !== null;
}
