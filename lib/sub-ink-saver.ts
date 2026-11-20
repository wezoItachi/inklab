import {
  clampAbilityPoints,
  getSubInkSaverMultiplier,
  representableAbilityPoints,
} from './ability-curves.ts';
import type { Weapon } from './weapon-catalog.ts';

export type SubInkSaverAnalysis = {
  ap: number;
  level: 0 | 1 | 2 | 3 | 4;
  tankCapacity: number;
  multiplier: number;
  reductionPercent: number;
  baseInkCost: number;
  adjustedInkCost: number;
  baseTankPercent: number;
  adjustedTankPercent: number;
  baseUsesPerTank: number;
  adjustedUsesPerTank: number;
  extraUsesPerTank: number;
  firstExtraUseAp: number | null;
  nextExtraUseAp: number | null;
};

const largeTankWeaponIds = new Set([10, 11]);

export function getWeaponInkTankCapacity(weapon: Weapon): number {
  return largeTankWeaponIds.has(weapon.upstreamId) ? 110 : 100;
}

function usesPerTank(capacity: number, inkCost: number): number {
  return Math.floor((capacity + Number.EPSILON) / inkCost);
}

function findUseBreakpoint(
  baseInkCost: number,
  level: 0 | 1 | 2 | 3 | 4,
  capacity: number,
  minimumAp: number,
  minimumUses: number,
) {
  return (
    representableAbilityPoints.find(
      (candidateAp) =>
        candidateAp > minimumAp &&
        usesPerTank(
          capacity,
          baseInkCost * getSubInkSaverMultiplier(candidateAp, level),
        ) > minimumUses,
    ) ?? null
  );
}

export function getSubInkSaverAnalysis(
  weapon: Weapon,
  ap: number,
): SubInkSaverAnalysis | null {
  const { baseInkCost, inkSaverLevel } = weapon.sub;
  if (baseInkCost === null || inkSaverLevel === null) return null;

  const boundedAp = clampAbilityPoints(ap);
  const tankCapacity = getWeaponInkTankCapacity(weapon);
  const multiplier = getSubInkSaverMultiplier(boundedAp, inkSaverLevel);
  const adjustedInkCost = baseInkCost * multiplier;
  const baseUsesPerTank = usesPerTank(tankCapacity, baseInkCost);
  const adjustedUsesPerTank = usesPerTank(tankCapacity, adjustedInkCost);

  return {
    ap: boundedAp,
    level: inkSaverLevel,
    tankCapacity,
    multiplier,
    reductionPercent: (1 - multiplier) * 100,
    baseInkCost,
    adjustedInkCost,
    baseTankPercent: (baseInkCost / tankCapacity) * 100,
    adjustedTankPercent: (adjustedInkCost / tankCapacity) * 100,
    baseUsesPerTank,
    adjustedUsesPerTank,
    extraUsesPerTank: adjustedUsesPerTank - baseUsesPerTank,
    firstExtraUseAp: findUseBreakpoint(
      baseInkCost,
      inkSaverLevel,
      tankCapacity,
      -1,
      baseUsesPerTank,
    ),
    nextExtraUseAp: findUseBreakpoint(
      baseInkCost,
      inkSaverLevel,
      tankCapacity,
      boundedAp,
      adjustedUsesPerTank,
    ),
  };
}
