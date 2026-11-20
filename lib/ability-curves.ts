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

export type AbilityCurveStatus = 'verified' | 'pending';

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
  thresholdScope: 'weapon-specific' | 'pending';
  calculate: ((ap: number) => AbilityCurveSample) | null;
};

export function clampAbilityPoints(ap: number) {
  return Math.max(0, Math.min(MAX_ABILITY_POINTS, ap));
}

export function getAbilityIntensity(ap: number): number {
  const boundedAp = clampAbilityPoints(ap);
  return Math.min(100, 3.3 * boundedAp - 0.027 * boundedAp ** 2) / 100;
}

export function getMainInkSaverMultiplier(ap: number): number {
  return 1 - 0.45 * getAbilityIntensity(ap);
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

const verifiedCurves = new Map<string, AbilityCurveDefinition>([
  [mainInkSaverCurve.abilityId, mainInkSaverCurve],
]);

export function getAbilityCurveDefinition(
  abilityId: string,
): AbilityCurveDefinition {
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
