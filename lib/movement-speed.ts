import movementClassDatabaseJson from '../database/weapon-movement-classes.v12.0.0.json' with { type: 'json' };
import actionMovementDatabaseJson from '../database/weapon-action-movement.v12.0.0.json' with { type: 'json' };
import {
  clampAbilityPoints,
  interpolateAbilityValue,
} from './ability-curves.ts';

export type WeaponSpeedClass = 'Fast' | 'Mid' | 'Slow';
export type MovementAbilityId = 'ssu' | 'rsu';

type MovementClassRecord = {
  weaponId: string;
  upstreamRowId: string;
  speedClass: WeaponSpeedClass;
  sourceMode: 'explicit' | 'standard-default';
  upstreamPath: string;
  note: string;
};

type MovementClassDatabase = {
  gameVersion: string;
  checkedAt: string;
  datasetStatus: string;
  sourceId: string;
  sourceCommit: string;
  defaultRule: string;
  counts: Record<WeaponSpeedClass, number>;
  records: MovementClassRecord[];
};

type ActionMovementState = {
  id: 'firing' | 'charging' | 'full-charge' | 'secondary';
  label: string;
  baseSpeed: number;
  baseSpeedPath: string;
};

type ActionMovementRecord = {
  weaponId: string;
  upstreamRowId: string;
  multiplier: { high: number; mid: number; low: number };
  multiplierSourceMode: 'shared-default' | 'weapon-override';
  multiplierPath: string;
  states: ActionMovementState[];
};

type ActionMovementDatabase = {
  gameVersion: string;
  checkedAt: string;
  datasetStatus: string;
  sourceId: string;
  sourceCommit: string;
  sharedMultiplier: { high: number; mid: number; low: number };
  counts: {
    weaponsWithStates: number;
    firing: number;
    charging: number;
    fullCharge: number;
    secondary: number;
    weaponOverrides: number;
  };
  records: ActionMovementRecord[];
};

const movementClassDatabase =
  movementClassDatabaseJson as MovementClassDatabase;
const actionMovementDatabase =
  actionMovementDatabaseJson as ActionMovementDatabase;
const movementClassByWeaponId = new Map(
  movementClassDatabase.records.map((record) => [record.weaponId, record]),
);
const actionMovementByWeaponId = new Map(
  actionMovementDatabase.records.map((record) => [record.weaponId, record]),
);

const swimValues = {
  Fast: [0.24, 0.2208, 0.2016],
  Mid: [0.24, 0.216, 0.192],
  Slow: [0.24, 0.216, 0.1728],
} as const;

const runValues = {
  Fast: [0.144, 0.124, 0.104],
  Mid: [0.144, 0.12, 0.096],
  Slow: [0.144, 0.116, 0.088],
} as const;

export const NINJA_SQUID_SPEED_MULTIPLIER = 0.9;
export const RAINMAKER_SPEED_MULTIPLIER = 0.8;

export const weaponSpeedClassLabels: Record<WeaponSpeedClass, string> = {
  Fast: '轻量级',
  Mid: '中量级',
  Slow: '重量级',
};

export function getWeaponMovementClass(weaponId: string) {
  return movementClassByWeaponId.get(weaponId) ?? null;
}

export function getMovementSpeed(
  abilityId: MovementAbilityId,
  ap: number,
  speedClass: WeaponSpeedClass = 'Mid',
) {
  const values =
    abilityId === 'ssu' ? swimValues[speedClass] : runValues[speedClass];
  return (
    Math.round(interpolateAbilityValue(values, ap) * 10 * 1_000_000) / 1_000_000
  );
}

export function analyzeMovementSpeed({
  weaponId,
  abilityId,
  ap,
  hasNinjaSquid = false,
}: {
  weaponId: string;
  abilityId: MovementAbilityId;
  ap: number;
  hasNinjaSquid?: boolean;
}) {
  const record = getWeaponMovementClass(weaponId);
  const speedClass = record?.speedClass ?? 'Mid';
  const boundedAp = clampAbilityPoints(ap);
  const baseSpeed = getMovementSpeed(abilityId, 0, speedClass);
  const speedBeforeFixedAbilities = getMovementSpeed(
    abilityId,
    boundedAp,
    speedClass,
  );
  const ninjaSquidApplied = abilityId === 'ssu' && hasNinjaSquid;
  const speed = ninjaSquidApplied
    ? speedBeforeFixedAbilities * NINJA_SQUID_SPEED_MULTIPLIER
    : speedBeforeFixedAbilities;
  const rainmakerSpeed =
    abilityId === 'ssu' ? speed * RAINMAKER_SPEED_MULTIPLIER : null;

  return {
    ap: boundedAp,
    abilityId,
    speedClass,
    speedClassLabel: weaponSpeedClassLabels[speedClass],
    sourceMode: record?.sourceMode ?? 'standard-default',
    baseSpeed,
    speedBeforeFixedAbilities,
    speed,
    baseSpeedPerSecond: baseSpeed * 60,
    speedPerSecond: speed * 60,
    rainmakerSpeed,
    rainmakerSpeedPerSecond:
      rainmakerSpeed === null ? null : rainmakerSpeed * 60,
    gainPercent: (speed / baseSpeed - 1) * 100,
    ninjaSquidApplied,
  };
}

export function analyzeActionMovement(weaponId: string, ap: number) {
  const record = actionMovementByWeaponId.get(weaponId);
  const boundedAp = clampAbilityPoints(ap);
  if (!record) {
    return {
      ap: boundedAp,
      multiplierSourceMode: 'shared-default' as const,
      multiplier: 1,
      states: [],
    };
  }
  const multiplier = interpolateAbilityValue(
    [record.multiplier.high, record.multiplier.mid, record.multiplier.low],
    boundedAp,
  );
  return {
    ap: boundedAp,
    multiplierSourceMode: record.multiplierSourceMode,
    multiplier,
    states: record.states.map((state) => ({
      ...state,
      baseDisplaySpeed:
        Math.round(state.baseSpeed * 10 * 1_000_000) / 1_000_000,
      speed:
        Math.round(state.baseSpeed * multiplier * 10 * 1_000_000) / 1_000_000,
      gainPercent: (multiplier - 1) * 100,
    })),
  };
}

export const movementClassData = movementClassDatabase;
export const actionMovementData = actionMovementDatabase;
