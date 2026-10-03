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

export type ChargerEfficiency = {
  verifiedInputCount: number;
  fullChargeDamage: number | null;
  fullChargeFrames: number | null;
  inkConsumptionPerCharge: number | null;
  fullChargesPerTank: number | null;
  shotsToSplat: number | null;
  inkConsumptionPerSplat: number | null;
  chargeHold: boolean | null;
  chargeHoldFrames: number | null;
  chargeHoldSeconds: number | null;
  fullChargeTravelDistance: number | null;
};

export type RollerEfficiency = {
  verifiedInputCount: number;
  horizontalSwingDamageMax: number | null;
  horizontalSwingFrames: number | null;
  inkConsumptionPerSwing: number | null;
  verticalSwingDamageMax: number | null;
  rollDamageMax: number | null;
  swingsPerTank: number | null;
  horizontalSwingsToSplat: number | null;
  verticalSwingsToSplat: number | null;
  rollHitsToSplat: number | null;
  rollInkConsumptionMinPerFrame: number | null;
  rollInkConsumptionMaxPerFrame: number | null;
  rollDurationMinSeconds: number | null;
  rollDurationMaxSeconds: number | null;
  rollSpeedNormal: number | null;
  rollSpeedDash: number | null;
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

function getVerifiedBoolean(
  parameters: readonly MainWeaponParameterField[],
  key: string,
): boolean | null {
  const parameter = parameters.find((item) => item.key === key);
  return parameter?.status === 'verified' &&
    typeof parameter.value === 'boolean'
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

export function analyzeChargerEfficiency(
  record: MainWeaponParameterRecord,
  targetHealth = DEFAULT_TARGET_HEALTH,
): ChargerEfficiency | null {
  if (!Number.isFinite(targetHealth) || targetHealth <= 0)
    throw new RangeError('Target health must be positive');

  const fullChargeDamage = getVerifiedNumber(
    record.parameters,
    'fullChargeDamage',
  );
  const fullChargeFrames = getVerifiedNumber(
    record.parameters,
    'fullChargeFrames',
  );
  const inkConsumptionPerCharge = getVerifiedNumber(
    record.parameters,
    'inkConsumptionPerCharge',
  );
  const chargeHold = getVerifiedBoolean(record.parameters, 'chargeHold');
  const chargeHoldFrames = getVerifiedNumber(
    record.parameters,
    'chargeHoldFrames',
  );
  const fullChargeTravelDistance = getVerifiedNumber(
    record.parameters,
    'fullChargeTravelDistance',
  );
  const verifiedInputCount = [
    fullChargeDamage,
    fullChargeFrames,
    inkConsumptionPerCharge,
    chargeHold,
    chargeHoldFrames,
    fullChargeTravelDistance,
  ].filter((value) => value !== null).length;
  if (verifiedInputCount === 0) return null;

  const fullChargesPerTank =
    inkConsumptionPerCharge === null
      ? null
      : Math.floor((100 + Number.EPSILON) / inkConsumptionPerCharge);
  const shotsToSplat =
    fullChargeDamage === null
      ? null
      : Math.ceil(targetHealth / fullChargeDamage);

  return {
    verifiedInputCount,
    fullChargeDamage,
    fullChargeFrames,
    inkConsumptionPerCharge,
    fullChargesPerTank,
    shotsToSplat,
    inkConsumptionPerSplat:
      shotsToSplat === null || inkConsumptionPerCharge === null
        ? null
        : Math.round(shotsToSplat * inkConsumptionPerCharge * 1000) / 1000,
    chargeHold,
    chargeHoldFrames,
    chargeHoldSeconds:
      chargeHoldFrames === null
        ? null
        : chargeHoldFrames / GAME_FRAMES_PER_SECOND,
    fullChargeTravelDistance,
  };
}

export function analyzeRollerEfficiency(
  record: MainWeaponParameterRecord,
  targetHealth = DEFAULT_TARGET_HEALTH,
): RollerEfficiency | null {
  if (!Number.isFinite(targetHealth) || targetHealth <= 0)
    throw new RangeError('Target health must be positive');

  const horizontalSwingDamageMax = getVerifiedNumber(
    record.parameters,
    'horizontalSwingDamageMax',
  );
  const horizontalSwingFrames = getVerifiedNumber(
    record.parameters,
    'horizontalSwingFrames',
  );
  const inkConsumptionPerSwing = getVerifiedNumber(
    record.parameters,
    'inkConsumptionPerSwing',
  );
  const verticalSwingDamageMax = getVerifiedNumber(
    record.parameters,
    'verticalSwingDamageMax',
  );
  const rollDamageMax = getVerifiedNumber(record.parameters, 'rollDamageMax');
  const rollInkConsumptionMinPerFrame = getVerifiedNumber(
    record.parameters,
    'rollInkConsumptionMinPerFrame',
  );
  const rollInkConsumptionMaxPerFrame = getVerifiedNumber(
    record.parameters,
    'rollInkConsumptionMaxPerFrame',
  );
  const rollSpeedNormal = getVerifiedNumber(
    record.parameters,
    'rollSpeedNormal',
  );
  const rollSpeedDash = getVerifiedNumber(record.parameters, 'rollSpeedDash');
  const verifiedInputCount = [
    horizontalSwingDamageMax,
    horizontalSwingFrames,
    inkConsumptionPerSwing,
    verticalSwingDamageMax,
    rollDamageMax,
    rollInkConsumptionMinPerFrame,
    rollInkConsumptionMaxPerFrame,
    rollSpeedNormal,
    rollSpeedDash,
  ].filter((value) => value !== null).length;
  if (verifiedInputCount === 0) return null;

  const hitsToSplat = (damage: number | null) =>
    damage === null ? null : Math.ceil(targetHealth / damage);
  const durationSeconds = (consumptionPerFrame: number | null) =>
    consumptionPerFrame === null
      ? null
      : 100 / consumptionPerFrame / GAME_FRAMES_PER_SECOND;

  return {
    verifiedInputCount,
    horizontalSwingDamageMax,
    horizontalSwingFrames,
    inkConsumptionPerSwing,
    verticalSwingDamageMax,
    rollDamageMax,
    swingsPerTank:
      inkConsumptionPerSwing === null
        ? null
        : Math.floor((100 + Number.EPSILON) / inkConsumptionPerSwing),
    horizontalSwingsToSplat: hitsToSplat(horizontalSwingDamageMax),
    verticalSwingsToSplat: hitsToSplat(verticalSwingDamageMax),
    rollHitsToSplat: hitsToSplat(rollDamageMax),
    rollInkConsumptionMinPerFrame,
    rollInkConsumptionMaxPerFrame,
    rollDurationMinSeconds: durationSeconds(rollInkConsumptionMaxPerFrame),
    rollDurationMaxSeconds: durationSeconds(rollInkConsumptionMinPerFrame),
    rollSpeedNormal,
    rollSpeedDash,
  };
}
