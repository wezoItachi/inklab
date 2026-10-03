import type {
  MainWeaponParameterField,
  MainWeaponParameterRecord,
} from '../database/schema.ts';

const DEFAULT_TARGET_HEALTH = 100;
const GAME_FRAMES_PER_SECOND = 60;

export type MainWeaponEfficiency = {
  verifiedInputCount: number;
  damagePerShot: number | null;
  fireIntervalFrames: number | null;
  inkConsumptionPerShot: number | null;
  shotsPerFullTank: number | null;
  fullTankFiringWindowFrames: number | null;
  fullTankFiringWindowSeconds: number | null;
  shotsToSplat: number | null;
  inkConsumptionPerSplat: number | null;
  splatTimeFrames: number | null;
  splatTimeSeconds: number | null;
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
  const verifiedInputCount = [
    damagePerShot,
    fireIntervalFrames,
    inkConsumptionPerShot,
  ].filter((value) => value !== null).length;
  if (verifiedInputCount === 0) return null;

  const shotsPerFullTank =
    inkConsumptionPerShot === null
      ? null
      : Math.floor((100 + Number.EPSILON) / inkConsumptionPerShot);
  const shotsToSplat =
    damagePerShot === null ? null : Math.ceil(targetHealth / damagePerShot);
  const fullTankFiringWindowFrames =
    shotsPerFullTank === null || fireIntervalFrames === null
      ? null
      : Math.max(0, (shotsPerFullTank - 1) * fireIntervalFrames);
  const splatTimeFrames =
    shotsToSplat === null || fireIntervalFrames === null
      ? null
      : Math.max(0, (shotsToSplat - 1) * fireIntervalFrames);

  return {
    verifiedInputCount,
    damagePerShot,
    fireIntervalFrames,
    inkConsumptionPerShot,
    shotsPerFullTank,
    fullTankFiringWindowFrames,
    fullTankFiringWindowSeconds:
      fullTankFiringWindowFrames === null
        ? null
        : fullTankFiringWindowFrames / GAME_FRAMES_PER_SECOND,
    shotsToSplat,
    inkConsumptionPerSplat:
      shotsToSplat === null || inkConsumptionPerShot === null
        ? null
        : Math.round(shotsToSplat * inkConsumptionPerShot * 1000) / 1000,
    splatTimeFrames,
    splatTimeSeconds:
      splatTimeFrames === null
        ? null
        : splatTimeFrames / GAME_FRAMES_PER_SECOND,
  };
}
