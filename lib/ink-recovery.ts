import {
  clampAbilityPoints,
  getInkRecoveryFrames,
} from './ability-curves.ts';
import type { Weapon } from './weapon-catalog.ts';

export type InkRecoveryFormAnalysis = {
  baseFrames: number;
  adjustedFrames: number;
  baseSeconds: number;
  adjustedSeconds: number;
  savedFrames: number;
  reductionPercent: number;
};

export type InkRecoveryAnalysis = {
  ap: number;
  tankCapacity: number;
  humanoid: InkRecoveryFormAnalysis;
  squid: InkRecoveryFormAnalysis;
};

const largeTankWeaponIds = new Set([10, 11]);

function analyzeForm(
  ap: number,
  form: 'humanoid' | 'squid',
  capacityMultiplier: number,
): InkRecoveryFormAnalysis {
  const ceilFrames = (frames: number) => Math.ceil(frames - 1e-9);
  const baseFrames = ceilFrames(
    getInkRecoveryFrames(0, form) * capacityMultiplier,
  );
  const adjustedFrames = ceilFrames(
    getInkRecoveryFrames(ap, form) * capacityMultiplier,
  );
  return {
    baseFrames,
    adjustedFrames,
    baseSeconds: baseFrames / 60,
    adjustedSeconds: adjustedFrames / 60,
    savedFrames: baseFrames - adjustedFrames,
    reductionPercent: (1 - adjustedFrames / baseFrames) * 100,
  };
}

export function getInkRecoveryAnalysis(
  weapon: Weapon,
  ap: number,
): InkRecoveryAnalysis {
  const boundedAp = clampAbilityPoints(ap);
  const tankCapacity = largeTankWeaponIds.has(weapon.upstreamId) ? 110 : 100;
  const capacityMultiplier = tankCapacity / 100;
  return {
    ap: boundedAp,
    tankCapacity,
    humanoid: analyzeForm(boundedAp, 'humanoid', capacityMultiplier),
    squid: analyzeForm(boundedAp, 'squid', capacityMultiplier),
  };
}
