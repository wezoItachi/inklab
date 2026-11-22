import actionIntensifyDatabaseJson from '../database/weapon-action-intensify.v12.0.0.json' with { type: 'json' };
import {
  clampAbilityPoints,
  interpolateAbilityValue,
} from './ability-curves.ts';

type SpreadEffect = {
  groundDegrees: number;
  jumpDegrees: number;
  reduction: { high: number; mid: number; low: number };
  reductionSourceMode: 'shared-default' | 'weapon-override';
  groundPath: string;
  jumpPath: string;
  reductionPath: string;
};

type ActionIntensifyRecord = {
  weaponId: string;
  upstreamRowId: string;
  spread: SpreadEffect | null;
};

type ActionIntensifyDatabase = {
  gameVersion: string;
  checkedAt: string;
  datasetStatus: string;
  sourceId: string;
  sourceCommit: string;
  sharedSpreadReduction: { high: number; mid: number; low: number };
  squidSurgeChargeFrames: { high: number; mid: number; low: number };
  squidSurgeSourcePath: string;
  counts: {
    weaponsWithJumpSpreadEffect: number;
    weaponOverrides: number;
  };
  records: ActionIntensifyRecord[];
};

const actionIntensifyDatabase =
  actionIntensifyDatabaseJson as ActionIntensifyDatabase;
const actionIntensifyByWeaponId = new Map(
  actionIntensifyDatabase.records.map((record) => [record.weaponId, record]),
);

export function getSquidSurgeChargeFrames(ap: number) {
  const values = actionIntensifyDatabase.squidSurgeChargeFrames;
  return interpolateAbilityValue([values.high, values.mid, values.low], ap);
}

export function analyzeActionIntensify(weaponId: string, ap: number) {
  const boundedAp = clampAbilityPoints(ap);
  const record = actionIntensifyByWeaponId.get(weaponId) ?? null;
  const squidSurgeChargeFrames = getSquidSurgeChargeFrames(boundedAp);
  const displayedSquidSurgeChargeFrames = Math.ceil(squidSurgeChargeFrames);
  const spread = record?.spread ?? null;
  const jumpSpread = spread
    ? (() => {
        const reduction = interpolateAbilityValue(
          [spread.reduction.high, spread.reduction.mid, spread.reduction.low],
          boundedAp,
        );
        const extraSpread = spread.jumpDegrees - spread.groundDegrees;
        const currentDegrees =
          spread.groundDegrees + extraSpread * (1 - reduction);
        return {
          groundDegrees: spread.groundDegrees,
          baseJumpDegrees: spread.jumpDegrees,
          currentDegrees,
          reduction,
          reductionPercent: reduction * 100,
          sourceMode: spread.reductionSourceMode,
        };
      })()
    : null;

  return {
    ap: boundedAp,
    squidSurgeChargeFrames,
    displayedSquidSurgeChargeFrames,
    squidSurgeChargeSeconds: displayedSquidSurgeChargeFrames / 60,
    savedSquidSurgeChargeFrames:
      actionIntensifyDatabase.squidSurgeChargeFrames.low -
      displayedSquidSurgeChargeFrames,
    jumpSpread,
  };
}

export const actionIntensifyData = actionIntensifyDatabase;
