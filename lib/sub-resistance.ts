import {
  clampAbilityPoints,
  interpolateAbilityValue,
} from './ability-curves.ts';

const subResistanceValues = {
  heavyDamage: [0.5, 0.75, 1],
  lightDamage: [0.6, 0.75, 1],
  lineMarkerDamage: [0.5, 0.75, 1],
  sprinklerDamage: [0.5, 0.75, 1],
  splashWallDamage: [0.5, 0.75, 1],
  markingTime: [0.1, 0.43, 1],
  mineMarkingTime: [0.1, 0.55, 1],
  toxicMistSlowdown: [0.5, 0.75, 1],
} as const;

export function analyzeSubResistance(ap: number) {
  const boundedAp = clampAbilityPoints(ap);
  return {
    ap: boundedAp,
    heavyDamageMultiplier: interpolateAbilityValue(
      subResistanceValues.heavyDamage,
      boundedAp,
    ),
    lightDamageMultiplier: interpolateAbilityValue(
      subResistanceValues.lightDamage,
      boundedAp,
    ),
    lineMarkerDamageMultiplier: interpolateAbilityValue(
      subResistanceValues.lineMarkerDamage,
      boundedAp,
    ),
    sprinklerDamageMultiplier: interpolateAbilityValue(
      subResistanceValues.sprinklerDamage,
      boundedAp,
    ),
    splashWallDamageMultiplier: interpolateAbilityValue(
      subResistanceValues.splashWallDamage,
      boundedAp,
    ),
    markingTimeMultiplier: interpolateAbilityValue(
      subResistanceValues.markingTime,
      boundedAp,
    ),
    mineMarkingTimeMultiplier: interpolateAbilityValue(
      subResistanceValues.mineMarkingTime,
      boundedAp,
    ),
    toxicMistSlowdownMultiplier: interpolateAbilityValue(
      subResistanceValues.toxicMistSlowdown,
      boundedAp,
    ),
  };
}
