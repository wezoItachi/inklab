import type {
  MainWeaponParameterField,
  MainWeaponParameterRecord,
} from '../database/schema.ts';

const DEFAULT_TARGET_HEALTH = 100;
const GAME_FRAMES_PER_SECOND = 60;

export type MainWeaponEfficiency = {
  damagePerShot: number;
  fireIntervalFrames: number;
  inkConsumptionPerShot: number;
  shotsPerFullTank: number;
  fullTankFiringWindowFrames: number;
  fullTankFiringWindowSeconds: number;
  shotsToSplat: number;
  inkConsumptionPerSplat: number;
  splatTimeFrames: number;
  splatTimeSeconds: number;
};

function getVerifiedNumber(
  parameters: readonly MainWeaponParameterField[],
  key: string,
): number | null {
  const parameter = parameters.find((item) => item.key === key);
  return parameter?.status === 'verified' &&
    typeof parameter.value === 'number' &&
    Number.isFinite(parameter.value) &&
    parameter.value > 0
    ? parameter.value
    : null;
}

export function analyzeMainWeaponEfficiency(
  record: MainWeaponParameterRecord,
  targetHealth = DEFAULT_TARGET_HEALTH,
): MainWeaponEfficiency | null {
  if (!Number.isFinite(targetHealth) || targetHealth <= 0)
    throw new RangeError('Target health must be positive');

  const damagePerShot = getVerifiedNumber(record.parameters, 'damagePerShot');
  const fireIntervalFrames = getVerifiedNumber(
    record.parameters,
    'fireIntervalFrames',
  );
  const inkConsumptionPerShot = getVerifiedNumber(
    record.parameters,
    'inkConsumptionPerShot',
  );
  if (
    damagePerShot === null ||
    fireIntervalFrames === null ||
    inkConsumptionPerShot === null
  )
    return null;

  const shotsPerFullTank = Math.floor(
    (100 + Number.EPSILON) / inkConsumptionPerShot,
  );
  const shotsToSplat = Math.ceil(targetHealth / damagePerShot);
  const fullTankFiringWindowFrames = Math.max(
    0,
    (shotsPerFullTank - 1) * fireIntervalFrames,
  );
  const splatTimeFrames = Math.max(0, (shotsToSplat - 1) * fireIntervalFrames);

  return {
    damagePerShot,
    fireIntervalFrames,
    inkConsumptionPerShot,
    shotsPerFullTank,
    fullTankFiringWindowFrames,
    fullTankFiringWindowSeconds:
      fullTankFiringWindowFrames / GAME_FRAMES_PER_SECOND,
    shotsToSplat,
    inkConsumptionPerSplat: shotsToSplat * inkConsumptionPerShot,
    splatTimeFrames,
    splatTimeSeconds: splatTimeFrames / GAME_FRAMES_PER_SECOND,
  };
}
