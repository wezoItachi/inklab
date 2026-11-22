import specialGaugeDatabaseJson from '../database/weapon-special-gauge.v12.0.0.json' with { type: 'json' };
import {
  clampAbilityPoints,
  interpolateAbilityValue,
} from './ability-curves.ts';

type SpecialGaugeRecord = {
  weaponId: string;
  upstreamRowId: string;
  specialPoints: number;
  upstreamPath: string;
};

type SpecialGaugeDatabase = {
  gameVersion: string;
  checkedAt: string;
  datasetStatus: string;
  sourceId: string;
  sourceCommit: string;
  specialChargeMultiplier: { high: number; mid: number; low: number };
  specialLossRate: { high: number; mid: number; low: number };
  respawnPunisherExtraLoss: { ownAbility: number; opponentAbility: number };
  pointDistribution: Record<string, number>;
  records: SpecialGaugeRecord[];
};

const specialGaugeDatabase = specialGaugeDatabaseJson as SpecialGaugeDatabase;
const specialGaugeByWeaponId = new Map(
  specialGaugeDatabase.records.map((record) => [record.weaponId, record]),
);

export function getSpecialChargeMultiplier(ap: number) {
  const values = specialGaugeDatabase.specialChargeMultiplier;
  return interpolateAbilityValue([values.high, values.mid, values.low], ap);
}

export function getSpecialLossPercent(ap: number) {
  const values = specialGaugeDatabase.specialLossRate;
  const restartRate = interpolateAbilityValue(
    [values.high, values.mid, values.low],
    ap,
  );
  return (1 - restartRate) * 100;
}

export function analyzeSpecialCharge(weaponId: string, ap: number) {
  const boundedAp = clampAbilityPoints(ap);
  const record = specialGaugeByWeaponId.get(weaponId);
  if (!record) throw new Error(`Missing special gauge record: ${weaponId}`);
  const multiplier = getSpecialChargeMultiplier(boundedAp);
  const requiredPoints = Math.ceil(record.specialPoints / multiplier);
  return {
    ap: boundedAp,
    basePoints: record.specialPoints,
    multiplier,
    requiredPoints,
    savedPoints: record.specialPoints - requiredPoints,
    reductionPercent: (1 - requiredPoints / record.specialPoints) * 100,
  };
}

export function analyzeSpecialSaver(
  ap: number,
  { hasRespawnPunisher = false }: { hasRespawnPunisher?: boolean } = {},
) {
  const boundedAp = clampAbilityPoints(ap);
  const standardLossPercent = getSpecialLossPercent(boundedAp);
  const ownPenalty = hasRespawnPunisher
    ? specialGaugeDatabase.respawnPunisherExtraLoss.ownAbility * 100
    : 0;
  const opponentPenalty =
    specialGaugeDatabase.respawnPunisherExtraLoss.opponentAbility * 100;
  const currentLossPercent = Math.min(100, standardLossPercent + ownPenalty);
  const splattedByRespawnPunisherLossPercent = Math.min(
    100,
    standardLossPercent + opponentPenalty + ownPenalty,
  );
  return {
    ap: boundedAp,
    standardLossPercent,
    standardRetainedPercent: 100 - standardLossPercent,
    currentLossPercent,
    currentRetainedPercent: 100 - currentLossPercent,
    splattedByRespawnPunisherLossPercent,
    splattedByRespawnPunisherRetainedPercent:
      100 - splattedByRespawnPunisherLossPercent,
    hasRespawnPunisher,
  };
}

export const specialGaugeData = specialGaugeDatabase;
