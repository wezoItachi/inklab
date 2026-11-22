import {
  clampAbilityPoints,
  interpolateAbilityValue,
} from './ability-curves.ts';

const enemyInkValues = {
  runSpeed: [0.0768, 0.0557, 0.024],
  damageLimit: [0.2, 0.3, 0.4],
  damagePerFrame: [0.0015, 0.00225, 0.003],
  graceFrames: [39, 26, 0],
} as const;

export function getEnemyInkRunSpeed(ap: number) {
  return (
    Math.round(
      interpolateAbilityValue(enemyInkValues.runSpeed, ap) * 10 * 1_000_000,
    ) / 1_000_000
  );
}

export function analyzeEnemyInkResistance(ap: number) {
  const boundedAp = clampAbilityPoints(ap);
  const runSpeed = getEnemyInkRunSpeed(boundedAp);
  const damageLimit =
    Math.round(
      interpolateAbilityValue(enemyInkValues.damageLimit, boundedAp) *
        100 *
        1_000_000,
    ) / 1_000_000;
  const damagePerFrame =
    Math.round(
      interpolateAbilityValue(enemyInkValues.damagePerFrame, boundedAp) *
        100 *
        1_000_000,
    ) / 1_000_000;
  const graceFrames = Math.ceil(
    interpolateAbilityValue(enemyInkValues.graceFrames, boundedAp),
  );

  return {
    ap: boundedAp,
    runSpeed,
    runSpeedPerSecond: runSpeed * 60,
    runSpeedGainPercent: (runSpeed / 0.24 - 1) * 100,
    damageLimit,
    damagePerFrame,
    damagePerSecond: damagePerFrame * 60,
    graceFrames,
    graceSeconds: graceFrames / 60,
  };
}
