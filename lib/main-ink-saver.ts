import type { MainWeaponParameterField } from '../database/schema.ts';
import { getMainWeaponParameters } from './weapons.ts';

const MAX_ABILITY_POINTS = 57;
const MAX_INK_REDUCTION = 0.45;

const actionFields = [
  ['inkConsumptionPerShot', '一次射击'],
  ['inkConsumptionPerCharge', '一次满蓄力'],
  ['horizontalInkConsumptionPerSwing', '一次横挥'],
  ['verticalInkConsumptionPerSwing', '一次竖挥'],
  ['inkConsumptionPerSwing', '一次挥击'],
  ['minimumChargeInkConsumption', '一次最低蓄力'],
  ['middleChargeInkConsumption', '一次一段蓄力'],
  ['fullChargeInkConsumption', '一次满蓄力'],
  ['horizontalInkConsumption', '一次横斩'],
] as const;

export type MainInkSaverProfile = {
  key: string;
  label: string;
  baseInkCost: number;
  adjustedInkCost: number;
  baseActionsPerTank: number;
  adjustedActionsPerTank: number;
  extraActionsPerTank: number;
  firstExtraActionAp: number | null;
  nextExtraActionAp: number | null;
};

export type MainInkSaverAnalysis = {
  ap: number;
  inkUseMultiplier: number;
  reductionPercent: number;
  profiles: MainInkSaverProfile[];
};

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

export function getAbilityIntensity(ap: number): number {
  const boundedAp = Math.max(0, Math.min(MAX_ABILITY_POINTS, ap));
  return Math.min(100, 3.3 * boundedAp - 0.027 * boundedAp ** 2) / 100;
}

export function getMainInkSaverMultiplier(ap: number): number {
  return 1 - MAX_INK_REDUCTION * getAbilityIntensity(ap);
}

function actionsPerTank(inkCost: number): number {
  return Math.floor((100 + Number.EPSILON) / inkCost);
}

function getVerifiedInkCost(
  fields: readonly MainWeaponParameterField[],
  key: string,
): number | null {
  const field = fields.find((candidate) => candidate.key === key);
  return field?.status === 'verified' &&
    typeof field.value === 'number' &&
    field.value > 0
    ? field.value
    : null;
}

function findActionBreakpoint(
  baseInkCost: number,
  minimumAp: number,
  minimumActions: number,
): number | null {
  return (
    representableAbilityPoints.find(
      (candidateAp) =>
        candidateAp > minimumAp &&
        actionsPerTank(baseInkCost * getMainInkSaverMultiplier(candidateAp)) >
          minimumActions,
    ) ?? null
  );
}

export function calculateMainInkSaverProfile(
  key: string,
  label: string,
  baseInkCost: number,
  ap: number,
): MainInkSaverProfile {
  const boundedAp = Math.max(0, Math.min(MAX_ABILITY_POINTS, ap));
  const baseActionsPerTank = actionsPerTank(baseInkCost);
  const adjustedInkCost = baseInkCost * getMainInkSaverMultiplier(boundedAp);
  const adjustedActionsPerTank = actionsPerTank(adjustedInkCost);
  return {
    key,
    label,
    baseInkCost,
    adjustedInkCost,
    baseActionsPerTank,
    adjustedActionsPerTank,
    extraActionsPerTank: adjustedActionsPerTank - baseActionsPerTank,
    firstExtraActionAp: findActionBreakpoint(
      baseInkCost,
      -1,
      baseActionsPerTank,
    ),
    nextExtraActionAp: findActionBreakpoint(
      baseInkCost,
      boundedAp,
      adjustedActionsPerTank,
    ),
  };
}

export function getMainInkSaverAnalysis(
  weaponId: string,
  ap: number,
): MainInkSaverAnalysis {
  const boundedAp = Math.max(0, Math.min(MAX_ABILITY_POINTS, ap));
  const fields = getMainWeaponParameters(weaponId).parameters;
  const profiles = actionFields.flatMap(([key, label]) => {
    const baseInkCost = getVerifiedInkCost(fields, key);
    return baseInkCost === null
      ? []
      : [calculateMainInkSaverProfile(key, label, baseInkCost, boundedAp)];
  });
  const inkUseMultiplier = getMainInkSaverMultiplier(boundedAp);
  return {
    ap: boundedAp,
    inkUseMultiplier,
    reductionPercent: (1 - inkUseMultiplier) * 100,
    profiles,
  };
}
