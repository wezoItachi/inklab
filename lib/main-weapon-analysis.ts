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

export type BlasterEfficiency = {
  verifiedInputCount: number;
  directHitDamage: number | null;
  nearBlastDamage: number | null;
  farBlastDamage: number | null;
  nearBlastDistance: number | null;
  farBlastDistance: number | null;
  burstFrame: number | null;
  fireIntervalFrames: number | null;
  inkConsumptionPerShot: number | null;
  shotsPerFullTank: number | null;
  directHitsToSplat: number | null;
  nearBlastHitsToSplat: number | null;
  farBlastHitsToSplat: number | null;
  directSplatTimeFrames: number | null;
  directSplatTimeSeconds: number | null;
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
  horizontalSwingPhaseFrames: number | null;
  horizontalSwingFrames: number | null;
  horizontalInkConsumptionPerSwing: number | null;
  verticalSwingDamageMax: number | null;
  verticalSwingPhaseFrames: number | null;
  verticalSwingFrames: number | null;
  verticalInkConsumptionPerSwing: number | null;
  rollDamageMax: number | null;
  horizontalSwingsPerTank: number | null;
  verticalSwingsPerTank: number | null;
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

export type SpinnerEfficiency = {
  verifiedInputCount: number;
  damagePerShot: number | null;
  standardMaximumDamagePerShot: number | null;
  minimumDamagePerShot: number | null;
  firstChargeStageFrames: number | null;
  secondChargeStageFrames: number | null;
  fullChargeFrames: number | null;
  fullChargeSeconds: number | null;
  firstChargeFiringWindowFrames: number | null;
  firstChargeShotsEstimate: number | null;
  configuredFiringDurationFrames: number | null;
  configuredFireIntervalFrames: number | null;
  fullChargeOverrideApplied: boolean;
  firingDurationFrames: number | null;
  firingDurationSeconds: number | null;
  fireIntervalFrames: number | null;
  fullChargeWindowDps: number | null;
  inkConsumptionPerCharge: number | null;
  fullChargesPerTank: number | null;
  shotsPerFullCharge: number | null;
  shotsToSplat: number | null;
  splatTimeFrames: number | null;
  splatTimeSeconds: number | null;
  movementSpeedWhileFiring: number | null;
  movementSpeedWhileCharging: number | null;
  inkRecoveryLockFrames: number | null;
  postDelayFrames: number | null;
  canRecharge: boolean | null;
  canStoreCharge: boolean | null;
  chargeHoldFrames: number | null;
  chargeHoldSeconds: number | null;
  variableDamagePerShot: number | null;
  variableFireIntervalFrames: number | null;
  variableMovementSpeedWhileFiring: number | null;
  variableTransitionFrames: number | null;
  variableWindowDps: number | null;
  variableShotsToSplat: number | null;
};

export type StringerStageId = 'minimum' | 'middle' | 'full';

export type StringerStageEfficiency = {
  id: StringerStageId;
  label: string;
  arrowDamage: number | null;
  projectileCount: number | null;
  volleyDamage: number | null;
  chargeFrames: number | null;
  actionFrames: number | null;
  inkConsumption: number | null;
  volleysPerTank: number | null;
  volleysToSplat: number | null;
  directDps: number | null;
};

export type StringerEfficiency = {
  verifiedInputCount: number;
  projectileCount: number | null;
  postDelayFrames: number | null;
  stages: StringerStageEfficiency[];
  bestDirectDpsStage: StringerStageId | null;
  fastestSplatStage: StringerStageId | null;
  detonationDamage: number | null;
  detonationFrames: number | null;
  canStoreCharge: boolean | null;
};

export type ManeuverFiringProfile = {
  damagePerShot: number | null;
  fireIntervalFrames: number | null;
  spreadDegrees: number | null;
  shotsToSplat: number | null;
  splatTimeFrames: number | null;
  splatTimeSeconds: number | null;
  directDps: number | null;
};

export type ManeuverEfficiency = {
  verifiedInputCount: number;
  normal: ManeuverFiringProfile;
  postDodge: ManeuverFiringProfile;
  jumpShotSpreadDegrees: number | null;
  inkConsumptionPerShot: number | null;
  shotsPerFullTank: number | null;
  shotsAfterOneDodge: number | null;
  dodgeInkConsumption: number | null;
  dodgeEquivalentShots: number | null;
  dodgeMoveFrames: number | null;
  dodgeMoveSeconds: number | null;
  movementSpeedWhileFiring: number | null;
};

export type SaberHitProfile = {
  projectileDamage: number | null;
  projectileHitsToSplat: number | null;
  slashDamage: number | null;
  slashHitsToSplat: number | null;
};

export type SaberActionProfile = SaberHitProfile & {
  inkConsumption: number | null;
  actionsPerFullTank: number | null;
  swingFrames: number | null;
  postDelayFrames: number | null;
  projectileReleaseFrame: number | null;
  slashReleaseFrame: number | null;
  inkRecoveryLockFrames: number | null;
};

export type SaberEfficiency = {
  verifiedInputCount: number;
  horizontal: SaberActionProfile;
  charged: SaberActionProfile & {
    fullChargeFrames: number | null;
    inputToProjectileReleaseFrames: number | null;
    inputToSlashReleaseFrames: number | null;
  };
};

export type ShelterEfficiency = {
  verifiedInputCount: number;
  maximumPelletDamage: number | null;
  effectiveTotalDamageCap: number | null;
  pelletCount: number | null;
  shotsToSplatAtCap: number | null;
  inkConsumptionPerShot: number | null;
  shotsPerFullTank: number | null;
  movementSpeedWhileFiring: number | null;
  canLaunchCanopy: boolean | null;
  canopyLaunchInkConsumption: number | null;
  canopyLaunchesPerFullTank: number | null;
  canopyChargeFrames: number | null;
  canopyOpenFrames: number | null;
  canopyLaunchFrames: number | null;
  canopyRecoveryFrames: number | null;
  canopyRecoverySeconds: number | null;
  shotInkRecoveryLockFrames: number | null;
  canopyShotInkRecoveryLockFrames: number | null;
  canopyDurability: number | null;
};

export type BrushEfficiency = {
  verifiedInputCount: number;
  maximumSwingDamage: number | null;
  minimumSwingDamage: number | null;
  maximumDamageHitsToSplat: number | null;
  minimumDamageHitsToSplat: number | null;
  inkConsumptionPerSwing: number | null;
  swingsPerFullTank: number | null;
  swingPhaseFrames: number | null;
  swingRepeatFrames: number | null;
  maximumDamageRepeatWindowDps: number | null;
  maximumDamageSplatWindowFrames: number | null;
  maximumDamageSplatWindowSeconds: number | null;
  swingInkRecoveryLockFrames: number | null;
  movementSpeedWhileSwinging: number | null;
  brushContactDamage: number | null;
  contactHitsToSplat: number | null;
  rollingInkConsumptionPerFrame: number | null;
  fullTankRollingFrames: number | null;
  fullTankRollingSeconds: number | null;
  rollingSpeed: number | null;
  rollingInkRecoveryLockFrames: number | null;
  rollingPaintStartFrames: number | null;
};

export type SlosherEfficiency = {
  verifiedInputCount: number;
  maximumUnitDamage: number | null;
  minimumUnitDamage: number | null;
  maximumUnitHitsToSplat: number | null;
  minimumUnitHitsToSplat: number | null;
  fireIntervalFrames: number | null;
  maximumUnitWindowDps: number | null;
  maximumUnitSplatWindowFrames: number | null;
  maximumUnitSplatWindowSeconds: number | null;
  inkConsumptionPerSwing: number | null;
  swingsPerFullTank: number | null;
  movementSpeedWhileSwinging: number | null;
  swingLiftFrames: number | null;
  unitGroupCount: number | null;
  maximumUnitDelayFrames: number | null;
  inkRecoveryLockFrames: number | null;
  postDelayFrames: number | null;
  movementLimitFrames: number | null;
  blastDamage: number | null;
  blastHitsToSplat: number | null;
  blastDamageRadius: number | null;
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

function getVerifiedNonNegativeNumber(
  parameters: readonly MainWeaponParameterField[],
  key: string,
): number | null {
  const parameter = parameters.find((item) => item.key === key);
  return parameter?.status === 'verified' &&
    typeof parameter.value === 'number' &&
    Number.isFinite(parameter.value) &&
    parameter.value >= 0
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

export function analyzeBlasterEfficiency(
  record: MainWeaponParameterRecord,
  targetHealth = DEFAULT_TARGET_HEALTH,
): BlasterEfficiency | null {
  if (!Number.isFinite(targetHealth) || targetHealth <= 0)
    throw new RangeError('Target health must be positive');

  const directHitDamage = getVerifiedNumber(
    record.parameters,
    'directHitDamage',
  );
  const nearBlastDamage = getVerifiedNumber(
    record.parameters,
    'nearBlastDamage',
  );
  const farBlastDamage = getVerifiedNumber(record.parameters, 'farBlastDamage');
  const nearBlastDistance = getVerifiedNumber(
    record.parameters,
    'nearBlastDistance',
  );
  const farBlastDistance = getVerifiedNumber(
    record.parameters,
    'farBlastDistance',
  );
  const burstFrame = getVerifiedNumber(record.parameters, 'burstFrame');
  const fireIntervalFrames = getVerifiedNumber(
    record.parameters,
    'fireIntervalFrames',
  );
  const inkConsumptionPerShot = getVerifiedNumber(
    record.parameters,
    'inkConsumptionPerShot',
  );
  const verifiedInputCount = [
    directHitDamage,
    nearBlastDamage,
    farBlastDamage,
    nearBlastDistance,
    farBlastDistance,
    burstFrame,
    fireIntervalFrames,
    inkConsumptionPerShot,
  ].filter((value) => value !== null).length;
  if (verifiedInputCount === 0) return null;

  const hitsToSplat = (damage: number | null) =>
    damage === null ? null : Math.ceil(targetHealth / damage);
  const directHitsToSplat = hitsToSplat(directHitDamage);
  const directSplatTimeFrames =
    directHitsToSplat === null || fireIntervalFrames === null
      ? null
      : Math.max(0, (directHitsToSplat - 1) * fireIntervalFrames);

  return {
    verifiedInputCount,
    directHitDamage,
    nearBlastDamage,
    farBlastDamage,
    nearBlastDistance,
    farBlastDistance,
    burstFrame,
    fireIntervalFrames,
    inkConsumptionPerShot,
    shotsPerFullTank:
      inkConsumptionPerShot === null
        ? null
        : Math.floor((100 + Number.EPSILON) / inkConsumptionPerShot),
    directHitsToSplat,
    nearBlastHitsToSplat: hitsToSplat(nearBlastDamage),
    farBlastHitsToSplat: hitsToSplat(farBlastDamage),
    directSplatTimeFrames,
    directSplatTimeSeconds:
      directSplatTimeFrames === null
        ? null
        : directSplatTimeFrames / GAME_FRAMES_PER_SECOND,
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
  const horizontalSwingPhaseFrames = getVerifiedNumber(
    record.parameters,
    'horizontalSwingPhaseFrames',
  );
  const horizontalInkConsumptionPerSwing = getVerifiedNumber(
    record.parameters,
    'horizontalInkConsumptionPerSwing',
  );
  const verticalSwingDamageMax = getVerifiedNumber(
    record.parameters,
    'verticalSwingDamageMax',
  );
  const verticalSwingPhaseFrames = getVerifiedNumber(
    record.parameters,
    'verticalSwingPhaseFrames',
  );
  const verticalSwingFrames = getVerifiedNumber(
    record.parameters,
    'verticalSwingFrames',
  );
  const verticalInkConsumptionPerSwing = getVerifiedNumber(
    record.parameters,
    'verticalInkConsumptionPerSwing',
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
    horizontalSwingPhaseFrames,
    horizontalSwingFrames,
    horizontalInkConsumptionPerSwing,
    verticalSwingDamageMax,
    verticalSwingPhaseFrames,
    verticalSwingFrames,
    verticalInkConsumptionPerSwing,
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
    horizontalSwingPhaseFrames,
    horizontalSwingFrames,
    horizontalInkConsumptionPerSwing,
    verticalSwingDamageMax,
    verticalSwingPhaseFrames,
    verticalSwingFrames,
    verticalInkConsumptionPerSwing,
    rollDamageMax,
    horizontalSwingsPerTank:
      horizontalInkConsumptionPerSwing === null
        ? null
        : Math.floor((100 + Number.EPSILON) / horizontalInkConsumptionPerSwing),
    verticalSwingsPerTank:
      verticalInkConsumptionPerSwing === null
        ? null
        : Math.floor((100 + Number.EPSILON) / verticalInkConsumptionPerSwing),
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

export function analyzeSpinnerEfficiency(
  record: MainWeaponParameterRecord,
  targetHealth = DEFAULT_TARGET_HEALTH,
): SpinnerEfficiency | null {
  if (!Number.isFinite(targetHealth) || targetHealth <= 0)
    throw new RangeError('Target health must be positive');

  const damagePerShot = getVerifiedNumber(record.parameters, 'damagePerShot');
  const standardMaximumDamagePerShot = getVerifiedNumber(
    record.parameters,
    'standardMaximumDamagePerShot',
  );
  const minimumDamagePerShot = getVerifiedNumber(
    record.parameters,
    'minimumDamagePerShot',
  );
  const firstChargeStageFrames = getVerifiedNumber(
    record.parameters,
    'firstChargeStageFrames',
  );
  const secondChargeStageFrames = getVerifiedNumber(
    record.parameters,
    'secondChargeStageFrames',
  );
  const fullChargeFrames = getVerifiedNumber(
    record.parameters,
    'fullChargeFrames',
  );
  const firstChargeFiringWindowFrames = getVerifiedNumber(
    record.parameters,
    'firstChargeFiringWindowFrames',
  );
  const configuredFiringDurationFrames = getVerifiedNumber(
    record.parameters,
    'firingDurationFrames',
  );
  const configuredFireIntervalFrames = getVerifiedNumber(
    record.parameters,
    'fireIntervalFrames',
  );
  const inkConsumptionPerCharge = getVerifiedNumber(
    record.parameters,
    'inkConsumptionPerCharge',
  );
  const movementSpeedWhileFiring = getVerifiedNumber(
    record.parameters,
    'movementSpeedWhileFiring',
  );
  const movementSpeedWhileCharging = getVerifiedNumber(
    record.parameters,
    'movementSpeedWhileCharging',
  );
  const inkRecoveryLockFrames = getVerifiedNumber(
    record.parameters,
    'inkRecoveryLockFrames',
  );
  const postDelayFrames = getVerifiedNumber(
    record.parameters,
    'postDelayFrames',
  );
  const canRecharge = getVerifiedBoolean(record.parameters, 'canRecharge');
  const canStoreCharge = getVerifiedBoolean(
    record.parameters,
    'canStoreCharge',
  );
  const chargeHoldFrames = getVerifiedNumber(
    record.parameters,
    'chargeHoldFrames',
  );
  const fullChargeOverrideFiringDurationFrames = getVerifiedNumber(
    record.parameters,
    'fullChargeOverrideFiringDurationFrames',
  );
  const fullChargeOverrideFireIntervalFrames = getVerifiedNumber(
    record.parameters,
    'fullChargeOverrideFireIntervalFrames',
  );
  const variableDamagePerShot = getVerifiedNumber(
    record.parameters,
    'variableDamagePerShot',
  );
  const variableFireIntervalFrames = getVerifiedNumber(
    record.parameters,
    'variableFireIntervalFrames',
  );
  const variableMovementSpeedWhileFiring = getVerifiedNumber(
    record.parameters,
    'variableMovementSpeedWhileFiring',
  );
  const variableTransitionFrames = getVerifiedNumber(
    record.parameters,
    'variableTransitionFrames',
  );
  const verifiedInputCount = [
    damagePerShot,
    standardMaximumDamagePerShot,
    minimumDamagePerShot,
    firstChargeStageFrames,
    secondChargeStageFrames,
    fullChargeFrames,
    firstChargeFiringWindowFrames,
    configuredFiringDurationFrames,
    configuredFireIntervalFrames,
    inkConsumptionPerCharge,
    movementSpeedWhileFiring,
    movementSpeedWhileCharging,
    inkRecoveryLockFrames,
    postDelayFrames,
    canRecharge,
    canStoreCharge,
    chargeHoldFrames,
    fullChargeOverrideFiringDurationFrames,
    fullChargeOverrideFireIntervalFrames,
    variableDamagePerShot,
    variableFireIntervalFrames,
    variableMovementSpeedWhileFiring,
    variableTransitionFrames,
  ].filter((value) => value !== null).length;
  if (verifiedInputCount === 0) return null;

  const firingDurationFrames =
    fullChargeOverrideFiringDurationFrames ?? configuredFiringDurationFrames;
  const fireIntervalFrames =
    fullChargeOverrideFireIntervalFrames ?? configuredFireIntervalFrames;
  const divisibleShotEstimate = (
    duration: number | null,
    interval: number | null,
  ) =>
    duration === null ||
    interval === null ||
    interval <= 0 ||
    duration % interval !== 0
      ? null
      : duration / interval;
  const shotsPerFullCharge = divisibleShotEstimate(
    firingDurationFrames,
    fireIntervalFrames,
  );
  const shotsToSplat =
    damagePerShot === null ? null : Math.ceil(targetHealth / damagePerShot);
  const splatTimeFrames =
    shotsToSplat === null || fireIntervalFrames === null
      ? null
      : Math.max(0, (shotsToSplat - 1) * fireIntervalFrames);

  return {
    verifiedInputCount,
    damagePerShot,
    standardMaximumDamagePerShot,
    minimumDamagePerShot,
    firstChargeStageFrames,
    secondChargeStageFrames,
    fullChargeFrames,
    fullChargeSeconds:
      fullChargeFrames === null
        ? null
        : fullChargeFrames / GAME_FRAMES_PER_SECOND,
    firstChargeFiringWindowFrames,
    firstChargeShotsEstimate: divisibleShotEstimate(
      firstChargeFiringWindowFrames,
      configuredFireIntervalFrames,
    ),
    configuredFiringDurationFrames,
    configuredFireIntervalFrames,
    fullChargeOverrideApplied:
      fullChargeOverrideFiringDurationFrames !== null ||
      fullChargeOverrideFireIntervalFrames !== null,
    firingDurationFrames,
    firingDurationSeconds:
      firingDurationFrames === null
        ? null
        : firingDurationFrames / GAME_FRAMES_PER_SECOND,
    fireIntervalFrames,
    fullChargeWindowDps:
      damagePerShot === null || fireIntervalFrames === null
        ? null
        : (damagePerShot * GAME_FRAMES_PER_SECOND) / fireIntervalFrames,
    inkConsumptionPerCharge,
    fullChargesPerTank:
      inkConsumptionPerCharge === null
        ? null
        : Math.floor((100 + Number.EPSILON) / inkConsumptionPerCharge),
    shotsPerFullCharge,
    shotsToSplat,
    splatTimeFrames,
    splatTimeSeconds:
      splatTimeFrames === null
        ? null
        : splatTimeFrames / GAME_FRAMES_PER_SECOND,
    movementSpeedWhileFiring,
    movementSpeedWhileCharging,
    inkRecoveryLockFrames,
    postDelayFrames,
    canRecharge,
    canStoreCharge,
    chargeHoldFrames,
    chargeHoldSeconds:
      chargeHoldFrames === null
        ? null
        : chargeHoldFrames / GAME_FRAMES_PER_SECOND,
    variableDamagePerShot,
    variableFireIntervalFrames,
    variableMovementSpeedWhileFiring,
    variableTransitionFrames,
    variableWindowDps:
      variableDamagePerShot === null || variableFireIntervalFrames === null
        ? null
        : (variableDamagePerShot * GAME_FRAMES_PER_SECOND) /
          variableFireIntervalFrames,
    variableShotsToSplat:
      variableDamagePerShot === null
        ? null
        : Math.ceil(targetHealth / variableDamagePerShot),
  };
}

export function analyzeStringerEfficiency(
  record: MainWeaponParameterRecord,
  targetHealth = DEFAULT_TARGET_HEALTH,
): StringerEfficiency | null {
  if (!Number.isFinite(targetHealth) || targetHealth <= 0)
    throw new RangeError('Target health must be positive');

  const projectileCount = getVerifiedNumber(
    record.parameters,
    'projectileCount',
  );
  const postDelayFrames = getVerifiedNumber(
    record.parameters,
    'postDelayFrames',
  );
  const stageDefinitions: Array<{
    id: StringerStageId;
    label: string;
    damageKey: string;
    framesKey: string;
    inkKey: string;
  }> = [
    {
      id: 'minimum',
      label: '最低蓄力',
      damageKey: 'minimumChargeArrowDamage',
      framesKey: 'minimumChargeFrames',
      inkKey: 'minimumChargeInkConsumption',
    },
    {
      id: 'middle',
      label: '一段蓄力',
      damageKey: 'middleChargeArrowDamage',
      framesKey: 'middleChargeFrames',
      inkKey: 'middleChargeInkConsumption',
    },
    {
      id: 'full',
      label: '满蓄力',
      damageKey: 'fullChargeArrowDamage',
      framesKey: 'fullChargeFrames',
      inkKey: 'fullChargeInkConsumption',
    },
  ];
  const verifiedStageValues = stageDefinitions.flatMap((stage) => [
    getVerifiedNumber(record.parameters, stage.damageKey),
    getVerifiedNumber(record.parameters, stage.framesKey),
    getVerifiedNumber(record.parameters, stage.inkKey),
  ]);
  const verifiedInputCount = [
    projectileCount,
    postDelayFrames,
    ...verifiedStageValues,
  ].filter((value) => value !== null).length;
  if (verifiedInputCount === 0) return null;

  const stages = stageDefinitions.map((stage, index) => {
    const arrowDamage = verifiedStageValues[index * 3];
    const chargeFrames = verifiedStageValues[index * 3 + 1];
    const inkConsumption = verifiedStageValues[index * 3 + 2];
    const volleyDamage =
      arrowDamage === null || projectileCount === null
        ? null
        : arrowDamage * projectileCount;
    const actionFrames =
      chargeFrames === null || postDelayFrames === null
        ? null
        : chargeFrames + postDelayFrames;
    const volleysToSplat =
      volleyDamage === null ? null : Math.ceil(targetHealth / volleyDamage);

    return {
      id: stage.id,
      label: stage.label,
      arrowDamage,
      projectileCount,
      volleyDamage,
      chargeFrames,
      actionFrames,
      inkConsumption,
      volleysPerTank:
        inkConsumption === null
          ? null
          : Math.floor((100 + Number.EPSILON) / inkConsumption),
      volleysToSplat,
      directDps:
        volleyDamage === null || actionFrames === null
          ? null
          : (volleyDamage * GAME_FRAMES_PER_SECOND) / actionFrames,
    } satisfies StringerStageEfficiency;
  });
  const stagesWithDps = stages.filter(
    (stage): stage is StringerStageEfficiency & { directDps: number } =>
      stage.directDps !== null,
  );
  const stagesWithSplatTime = stages
    .filter(
      (
        stage,
      ): stage is StringerStageEfficiency & {
        chargeFrames: number;
        actionFrames: number;
        volleysToSplat: number;
      } =>
        stage.chargeFrames !== null &&
        stage.actionFrames !== null &&
        stage.volleysToSplat !== null,
    )
    .map((stage) => ({
      stage,
      splatFrames:
        stage.chargeFrames +
        stage.actionFrames * Math.max(0, stage.volleysToSplat - 1),
    }));

  return {
    verifiedInputCount,
    projectileCount,
    postDelayFrames,
    stages,
    bestDirectDpsStage:
      stagesWithDps.length === 0
        ? null
        : stagesWithDps.reduce((best, stage) =>
            stage.directDps > best.directDps ? stage : best,
          ).id,
    fastestSplatStage:
      stagesWithSplatTime.length === 0
        ? null
        : stagesWithSplatTime.reduce((best, entry) =>
            entry.splatFrames < best.splatFrames ? entry : best,
          ).stage.id,
    detonationDamage: getVerifiedNumber(record.parameters, 'detonationDamage'),
    detonationFrames: getVerifiedNumber(record.parameters, 'detonationFrames'),
    canStoreCharge: getVerifiedBoolean(record.parameters, 'canStoreCharge'),
  };
}

export function analyzeManeuverEfficiency(
  record: MainWeaponParameterRecord,
  targetHealth = DEFAULT_TARGET_HEALTH,
): ManeuverEfficiency | null {
  if (!Number.isFinite(targetHealth) || targetHealth <= 0)
    throw new RangeError('Target health must be positive');

  const damagePerShot = getVerifiedNumber(record.parameters, 'damagePerShot');
  const postDodgeDamagePerShot = getVerifiedNumber(
    record.parameters,
    'postDodgeDamagePerShot',
  );
  const fireIntervalFrames = getVerifiedNumber(
    record.parameters,
    'fireIntervalFrames',
  );
  const postDodgeFireIntervalFrames = getVerifiedNumber(
    record.parameters,
    'postDodgeFireIntervalFrames',
  );
  const groundShotSpreadDegrees = getVerifiedNonNegativeNumber(
    record.parameters,
    'groundShotSpreadDegrees',
  );
  const postDodgeSpreadDegrees = getVerifiedNonNegativeNumber(
    record.parameters,
    'postDodgeSpreadDegrees',
  );
  const jumpShotSpreadDegrees = getVerifiedNonNegativeNumber(
    record.parameters,
    'jumpShotSpreadDegrees',
  );
  const inkConsumptionPerShot = getVerifiedNumber(
    record.parameters,
    'inkConsumptionPerShot',
  );
  const dodgeInkConsumption = getVerifiedNumber(
    record.parameters,
    'dodgeInkConsumption',
  );
  const dodgeMoveFrames = getVerifiedNumber(
    record.parameters,
    'dodgeMoveFrames',
  );
  const movementSpeedWhileFiring = getVerifiedNumber(
    record.parameters,
    'movementSpeedWhileFiring',
  );
  const verifiedInputCount = [
    damagePerShot,
    postDodgeDamagePerShot,
    fireIntervalFrames,
    postDodgeFireIntervalFrames,
    groundShotSpreadDegrees,
    postDodgeSpreadDegrees,
    jumpShotSpreadDegrees,
    inkConsumptionPerShot,
    dodgeInkConsumption,
    dodgeMoveFrames,
    movementSpeedWhileFiring,
  ].filter((value) => value !== null).length;
  if (verifiedInputCount === 0) return null;

  const profile = (
    damage: number | null,
    interval: number | null,
    spread: number | null,
  ): ManeuverFiringProfile => {
    const shotsToSplat =
      damage === null ? null : Math.ceil(targetHealth / damage);
    const splatTimeFrames =
      shotsToSplat === null || interval === null
        ? null
        : Math.max(0, (shotsToSplat - 1) * interval);
    return {
      damagePerShot: damage,
      fireIntervalFrames: interval,
      spreadDegrees: spread,
      shotsToSplat,
      splatTimeFrames,
      splatTimeSeconds:
        splatTimeFrames === null
          ? null
          : splatTimeFrames / GAME_FRAMES_PER_SECOND,
      directDps:
        damage === null || interval === null
          ? null
          : (damage * GAME_FRAMES_PER_SECOND) / interval,
    };
  };

  return {
    verifiedInputCount,
    normal: profile(damagePerShot, fireIntervalFrames, groundShotSpreadDegrees),
    postDodge: profile(
      postDodgeDamagePerShot,
      postDodgeFireIntervalFrames,
      postDodgeSpreadDegrees,
    ),
    jumpShotSpreadDegrees,
    inkConsumptionPerShot,
    shotsPerFullTank:
      inkConsumptionPerShot === null
        ? null
        : Math.floor((100 + Number.EPSILON) / inkConsumptionPerShot),
    shotsAfterOneDodge:
      inkConsumptionPerShot === null || dodgeInkConsumption === null
        ? null
        : Math.floor(
            (100 - dodgeInkConsumption + Number.EPSILON) /
              inkConsumptionPerShot,
          ),
    dodgeInkConsumption,
    dodgeEquivalentShots:
      inkConsumptionPerShot === null || dodgeInkConsumption === null
        ? null
        : dodgeInkConsumption / inkConsumptionPerShot,
    dodgeMoveFrames,
    dodgeMoveSeconds:
      dodgeMoveFrames === null
        ? null
        : dodgeMoveFrames / GAME_FRAMES_PER_SECOND,
    movementSpeedWhileFiring,
  };
}

export function analyzeSaberEfficiency(
  record: MainWeaponParameterRecord,
  targetHealth = DEFAULT_TARGET_HEALTH,
): SaberEfficiency | null {
  if (!Number.isFinite(targetHealth) || targetHealth <= 0)
    throw new RangeError('Target health must be positive');

  const horizontalProjectileDamage = getVerifiedNumber(
    record.parameters,
    'horizontalProjectileDamage',
  );
  const horizontalSlashDamage = getVerifiedNumber(
    record.parameters,
    'horizontalSlashDamage',
  );
  const chargedProjectileDamage = getVerifiedNumber(
    record.parameters,
    'chargedProjectileDamage',
  );
  const chargedSlashDamage = getVerifiedNumber(
    record.parameters,
    'chargedSlashDamage',
  );
  const horizontalInkConsumption = getVerifiedNumber(
    record.parameters,
    'horizontalInkConsumption',
  );
  const fullChargeInkConsumption = getVerifiedNumber(
    record.parameters,
    'fullChargeInkConsumption',
  );
  const fullChargeFrames = getVerifiedNumber(
    record.parameters,
    'fullChargeFrames',
  );
  const horizontalSwingFrames = getVerifiedNumber(
    record.parameters,
    'horizontalSwingFrames',
  );
  const chargedSwingFrames = getVerifiedNumber(
    record.parameters,
    'chargedSwingFrames',
  );
  const horizontalPostDelayFrames = getVerifiedNumber(
    record.parameters,
    'horizontalPostDelayFrames',
  );
  const chargedPostDelayFrames = getVerifiedNumber(
    record.parameters,
    'chargedPostDelayFrames',
  );
  const horizontalProjectileReleaseFrame = getVerifiedNumber(
    record.parameters,
    'horizontalProjectileReleaseFrame',
  );
  const horizontalSlashReleaseFrame = getVerifiedNumber(
    record.parameters,
    'horizontalSlashReleaseFrame',
  );
  const chargedProjectileReleaseFrame = getVerifiedNumber(
    record.parameters,
    'chargedProjectileReleaseFrame',
  );
  const chargedSlashReleaseFrame = getVerifiedNumber(
    record.parameters,
    'chargedSlashReleaseFrame',
  );
  const horizontalInkRecoveryLockFrames = getVerifiedNumber(
    record.parameters,
    'horizontalInkRecoveryLockFrames',
  );
  const chargedInkRecoveryLockFrames = getVerifiedNumber(
    record.parameters,
    'chargedInkRecoveryLockFrames',
  );
  const verifiedInputs = [
    horizontalProjectileDamage,
    horizontalSlashDamage,
    chargedProjectileDamage,
    chargedSlashDamage,
    horizontalInkConsumption,
    fullChargeInkConsumption,
    fullChargeFrames,
    horizontalSwingFrames,
    chargedSwingFrames,
    horizontalPostDelayFrames,
    chargedPostDelayFrames,
    horizontalProjectileReleaseFrame,
    horizontalSlashReleaseFrame,
    chargedProjectileReleaseFrame,
    chargedSlashReleaseFrame,
    horizontalInkRecoveryLockFrames,
    chargedInkRecoveryLockFrames,
  ];
  const verifiedInputCount = verifiedInputs.filter(
    (value) => value !== null,
  ).length;
  if (verifiedInputCount === 0) return null;

  const hitsToSplat = (damage: number | null) =>
    damage === null ? null : Math.ceil(targetHealth / damage);
  const actionsPerTank = (inkConsumption: number | null) =>
    inkConsumption === null
      ? null
      : Math.floor((100 + Number.EPSILON) / inkConsumption);

  return {
    verifiedInputCount,
    horizontal: {
      projectileDamage: horizontalProjectileDamage,
      projectileHitsToSplat: hitsToSplat(horizontalProjectileDamage),
      slashDamage: horizontalSlashDamage,
      slashHitsToSplat: hitsToSplat(horizontalSlashDamage),
      inkConsumption: horizontalInkConsumption,
      actionsPerFullTank: actionsPerTank(horizontalInkConsumption),
      swingFrames: horizontalSwingFrames,
      postDelayFrames: horizontalPostDelayFrames,
      projectileReleaseFrame: horizontalProjectileReleaseFrame,
      slashReleaseFrame: horizontalSlashReleaseFrame,
      inkRecoveryLockFrames: horizontalInkRecoveryLockFrames,
    },
    charged: {
      projectileDamage: chargedProjectileDamage,
      projectileHitsToSplat: hitsToSplat(chargedProjectileDamage),
      slashDamage: chargedSlashDamage,
      slashHitsToSplat: hitsToSplat(chargedSlashDamage),
      inkConsumption: fullChargeInkConsumption,
      actionsPerFullTank: actionsPerTank(fullChargeInkConsumption),
      swingFrames: chargedSwingFrames,
      postDelayFrames: chargedPostDelayFrames,
      projectileReleaseFrame: chargedProjectileReleaseFrame,
      slashReleaseFrame: chargedSlashReleaseFrame,
      inkRecoveryLockFrames: chargedInkRecoveryLockFrames,
      fullChargeFrames,
      inputToProjectileReleaseFrames:
        fullChargeFrames === null || chargedProjectileReleaseFrame === null
          ? null
          : fullChargeFrames + chargedProjectileReleaseFrame,
      inputToSlashReleaseFrames:
        fullChargeFrames === null || chargedSlashReleaseFrame === null
          ? null
          : fullChargeFrames + chargedSlashReleaseFrame,
    },
  };
}

export function analyzeShelterEfficiency(
  record: MainWeaponParameterRecord,
  targetHealth = DEFAULT_TARGET_HEALTH,
): ShelterEfficiency | null {
  if (!Number.isFinite(targetHealth) || targetHealth <= 0)
    throw new RangeError('Target health must be positive');

  const maximumPelletDamage = getVerifiedNumber(
    record.parameters,
    'maximumPelletDamage',
  );
  const effectiveTotalDamageCap = getVerifiedNumber(
    record.parameters,
    'effectiveTotalDamageCap',
  );
  const pelletCount = getVerifiedNumber(record.parameters, 'pelletCount');
  const inkConsumptionPerShot = getVerifiedNumber(
    record.parameters,
    'inkConsumptionPerShot',
  );
  const canopyLaunchInkConsumption = getVerifiedNonNegativeNumber(
    record.parameters,
    'canopyLaunchInkConsumption',
  );
  const canLaunchCanopy = getVerifiedBoolean(
    record.parameters,
    'canLaunchCanopy',
  );
  const canopyChargeFrames = getVerifiedNumber(
    record.parameters,
    'canopyChargeFrames',
  );
  const canopyOpenFrames = getVerifiedNumber(
    record.parameters,
    'canopyOpenFrames',
  );
  const canopyLaunchFrames = getVerifiedNumber(
    record.parameters,
    'canopyLaunchFrames',
  );
  const canopyRecoveryFrames = getVerifiedNumber(
    record.parameters,
    'canopyRecoveryFrames',
  );
  const shotInkRecoveryLockFrames = getVerifiedNumber(
    record.parameters,
    'shotInkRecoveryLockFrames',
  );
  const canopyShotInkRecoveryLockFrames = getVerifiedNumber(
    record.parameters,
    'canopyShotInkRecoveryLockFrames',
  );
  const canopyDurability = getVerifiedNumber(
    record.parameters,
    'canopyDurability',
  );
  const movementSpeedWhileFiring = getVerifiedNumber(
    record.parameters,
    'movementSpeedWhileFiring',
  );
  const verifiedInputCount = [
    maximumPelletDamage,
    effectiveTotalDamageCap,
    pelletCount,
    inkConsumptionPerShot,
    canopyLaunchInkConsumption,
    canLaunchCanopy,
    canopyChargeFrames,
    canopyOpenFrames,
    canopyLaunchFrames,
    canopyRecoveryFrames,
    shotInkRecoveryLockFrames,
    canopyShotInkRecoveryLockFrames,
    canopyDurability,
    movementSpeedWhileFiring,
  ].filter((value) => value !== null).length;
  if (verifiedInputCount === 0) return null;

  return {
    verifiedInputCount,
    maximumPelletDamage,
    effectiveTotalDamageCap,
    pelletCount,
    shotsToSplatAtCap:
      effectiveTotalDamageCap === null
        ? null
        : Math.ceil(targetHealth / effectiveTotalDamageCap),
    inkConsumptionPerShot,
    shotsPerFullTank:
      inkConsumptionPerShot === null
        ? null
        : Math.floor((100 + Number.EPSILON) / inkConsumptionPerShot),
    movementSpeedWhileFiring,
    canLaunchCanopy,
    canopyLaunchInkConsumption,
    canopyLaunchesPerFullTank:
      canLaunchCanopy === true &&
      canopyLaunchInkConsumption !== null &&
      canopyLaunchInkConsumption > 0
        ? Math.floor((100 + Number.EPSILON) / canopyLaunchInkConsumption)
        : null,
    canopyChargeFrames,
    canopyOpenFrames,
    canopyLaunchFrames,
    canopyRecoveryFrames,
    canopyRecoverySeconds:
      canopyRecoveryFrames === null
        ? null
        : canopyRecoveryFrames / GAME_FRAMES_PER_SECOND,
    shotInkRecoveryLockFrames,
    canopyShotInkRecoveryLockFrames,
    canopyDurability,
  };
}

export function analyzeBrushEfficiency(
  record: MainWeaponParameterRecord,
  targetHealth = DEFAULT_TARGET_HEALTH,
): BrushEfficiency | null {
  if (!Number.isFinite(targetHealth) || targetHealth <= 0)
    throw new RangeError('Target health must be positive');

  const maximumSwingDamage = getVerifiedNumber(
    record.parameters,
    'maximumSwingDamage',
  );
  const minimumSwingDamage = getVerifiedNumber(
    record.parameters,
    'minimumSwingDamage',
  );
  const inkConsumptionPerSwing = getVerifiedNumber(
    record.parameters,
    'inkConsumptionPerSwing',
  );
  const swingPhaseFrames = getVerifiedNumber(
    record.parameters,
    'swingPhaseFrames',
  );
  const swingRepeatFrames = getVerifiedNumber(
    record.parameters,
    'swingRepeatFrames',
  );
  const swingInkRecoveryLockFrames = getVerifiedNumber(
    record.parameters,
    'swingInkRecoveryLockFrames',
  );
  const movementSpeedWhileSwinging = getVerifiedNumber(
    record.parameters,
    'movementSpeedWhileSwinging',
  );
  const brushContactDamage = getVerifiedNumber(
    record.parameters,
    'brushContactDamage',
  );
  const rollingInkConsumptionPerFrame = getVerifiedNumber(
    record.parameters,
    'rollingInkConsumptionPerFrame',
  );
  const rollingSpeed = getVerifiedNumber(record.parameters, 'rollingSpeed');
  const rollingInkRecoveryLockFrames = getVerifiedNumber(
    record.parameters,
    'rollingInkRecoveryLockFrames',
  );
  const rollingPaintStartFrames = getVerifiedNumber(
    record.parameters,
    'rollingPaintStartFrames',
  );
  const verifiedInputCount = [
    maximumSwingDamage,
    minimumSwingDamage,
    inkConsumptionPerSwing,
    swingPhaseFrames,
    swingRepeatFrames,
    swingInkRecoveryLockFrames,
    movementSpeedWhileSwinging,
    brushContactDamage,
    rollingInkConsumptionPerFrame,
    rollingSpeed,
    rollingInkRecoveryLockFrames,
    rollingPaintStartFrames,
  ].filter((value) => value !== null).length;
  if (verifiedInputCount === 0) return null;

  const maximumDamageHitsToSplat =
    maximumSwingDamage === null
      ? null
      : Math.ceil(targetHealth / maximumSwingDamage);
  const fullTankRollingFrames =
    rollingInkConsumptionPerFrame === null
      ? null
      : Math.floor((100 + Number.EPSILON) / rollingInkConsumptionPerFrame);
  const maximumDamageSplatWindowFrames =
    maximumDamageHitsToSplat === null || swingRepeatFrames === null
      ? null
      : Math.max(0, (maximumDamageHitsToSplat - 1) * swingRepeatFrames);

  return {
    verifiedInputCount,
    maximumSwingDamage,
    minimumSwingDamage,
    maximumDamageHitsToSplat,
    minimumDamageHitsToSplat:
      minimumSwingDamage === null
        ? null
        : Math.ceil(targetHealth / minimumSwingDamage),
    inkConsumptionPerSwing,
    swingsPerFullTank:
      inkConsumptionPerSwing === null
        ? null
        : Math.floor((100 + Number.EPSILON) / inkConsumptionPerSwing),
    swingPhaseFrames,
    swingRepeatFrames,
    maximumDamageRepeatWindowDps:
      maximumSwingDamage === null || swingRepeatFrames === null
        ? null
        : (maximumSwingDamage * GAME_FRAMES_PER_SECOND) / swingRepeatFrames,
    maximumDamageSplatWindowFrames,
    maximumDamageSplatWindowSeconds:
      maximumDamageSplatWindowFrames === null
        ? null
        : maximumDamageSplatWindowFrames / GAME_FRAMES_PER_SECOND,
    swingInkRecoveryLockFrames,
    movementSpeedWhileSwinging,
    brushContactDamage,
    contactHitsToSplat:
      brushContactDamage === null
        ? null
        : Math.ceil(targetHealth / brushContactDamage),
    rollingInkConsumptionPerFrame,
    fullTankRollingFrames,
    fullTankRollingSeconds:
      fullTankRollingFrames === null
        ? null
        : fullTankRollingFrames / GAME_FRAMES_PER_SECOND,
    rollingSpeed,
    rollingInkRecoveryLockFrames,
    rollingPaintStartFrames,
  };
}

export function analyzeSlosherEfficiency(
  record: MainWeaponParameterRecord,
  targetHealth = DEFAULT_TARGET_HEALTH,
): SlosherEfficiency | null {
  if (!Number.isFinite(targetHealth) || targetHealth <= 0)
    throw new RangeError('Target health must be positive');

  const maximumUnitDamage = getVerifiedNumber(
    record.parameters,
    'maximumUnitDamage',
  );
  const minimumUnitDamage = getVerifiedNumber(
    record.parameters,
    'minimumUnitDamage',
  );
  const fireIntervalFrames = getVerifiedNumber(
    record.parameters,
    'fireIntervalFrames',
  );
  const inkConsumptionPerSwing = getVerifiedNumber(
    record.parameters,
    'inkConsumptionPerSwing',
  );
  const movementSpeedWhileSwinging = getVerifiedNumber(
    record.parameters,
    'movementSpeedWhileSwinging',
  );
  const swingLiftFrames = getVerifiedNumber(
    record.parameters,
    'swingLiftFrames',
  );
  const unitGroupCount = getVerifiedNumber(record.parameters, 'unitGroupCount');
  const maximumUnitDelayFrames = getVerifiedNonNegativeNumber(
    record.parameters,
    'maximumUnitDelayFrames',
  );
  const inkRecoveryLockFrames = getVerifiedNumber(
    record.parameters,
    'inkRecoveryLockFrames',
  );
  const postDelayFrames = getVerifiedNumber(
    record.parameters,
    'postDelayFrames',
  );
  const movementLimitFrames = getVerifiedNumber(
    record.parameters,
    'movementLimitFrames',
  );
  const blastDamage = getVerifiedNumber(record.parameters, 'blastDamage');
  const blastDamageRadius = getVerifiedNumber(
    record.parameters,
    'blastDamageRadius',
  );
  const verifiedInputCount = [
    maximumUnitDamage,
    minimumUnitDamage,
    fireIntervalFrames,
    inkConsumptionPerSwing,
    movementSpeedWhileSwinging,
    swingLiftFrames,
    unitGroupCount,
    maximumUnitDelayFrames,
    inkRecoveryLockFrames,
    postDelayFrames,
    movementLimitFrames,
    blastDamage,
    blastDamageRadius,
  ].filter((value) => value !== null).length;
  if (verifiedInputCount === 0) return null;

  const maximumUnitHitsToSplat =
    maximumUnitDamage === null
      ? null
      : Math.ceil(targetHealth / maximumUnitDamage);
  const maximumUnitSplatWindowFrames =
    maximumUnitHitsToSplat === null || fireIntervalFrames === null
      ? null
      : Math.max(0, (maximumUnitHitsToSplat - 1) * fireIntervalFrames);

  return {
    verifiedInputCount,
    maximumUnitDamage,
    minimumUnitDamage,
    maximumUnitHitsToSplat,
    minimumUnitHitsToSplat:
      minimumUnitDamage === null
        ? null
        : Math.ceil(targetHealth / minimumUnitDamage),
    fireIntervalFrames,
    maximumUnitWindowDps:
      maximumUnitDamage === null || fireIntervalFrames === null
        ? null
        : (maximumUnitDamage * GAME_FRAMES_PER_SECOND) / fireIntervalFrames,
    maximumUnitSplatWindowFrames,
    maximumUnitSplatWindowSeconds:
      maximumUnitSplatWindowFrames === null
        ? null
        : maximumUnitSplatWindowFrames / GAME_FRAMES_PER_SECOND,
    inkConsumptionPerSwing,
    swingsPerFullTank:
      inkConsumptionPerSwing === null
        ? null
        : Math.floor((100 + Number.EPSILON) / inkConsumptionPerSwing),
    movementSpeedWhileSwinging,
    swingLiftFrames,
    unitGroupCount,
    maximumUnitDelayFrames,
    inkRecoveryLockFrames,
    postDelayFrames,
    movementLimitFrames,
    blastDamage,
    blastHitsToSplat:
      blastDamage === null ? null : Math.ceil(targetHealth / blastDamage),
    blastDamageRadius,
  };
}
