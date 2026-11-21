import {
  clampAbilityPoints,
  getSuperJumpFrames,
} from './ability-curves.ts';

export type QuickSuperJumpAnalysis = {
  ap: number;
  chargeFrames: number;
  moveFrames: number;
  totalFrames: number;
  totalSeconds: number;
  baseTotalFrames: number;
  savedFrames: number;
  hasStealthJump: boolean;
  stealthJumpMaxExtraFrames: number;
  displayedMaxTotalFrames: number;
  displayedMaxTotalSeconds: number;
};

const STEALTH_JUMP_MAX_EXTRA_FRAMES = 60;

function ceilFrames(frames: number) {
  return Math.ceil(frames - 1e-9);
}

export function getQuickSuperJumpAnalysis(
  ap: number,
  hasStealthJump = false,
): QuickSuperJumpAnalysis {
  const boundedAp = clampAbilityPoints(ap);
  const chargeFrames = ceilFrames(getSuperJumpFrames(boundedAp, 'charge'));
  const moveFrames = ceilFrames(getSuperJumpFrames(boundedAp, 'move'));
  const baseTotalFrames =
    ceilFrames(getSuperJumpFrames(0, 'charge')) +
    ceilFrames(getSuperJumpFrames(0, 'move'));
  const totalFrames = chargeFrames + moveFrames;
  const stealthJumpMaxExtraFrames = hasStealthJump
    ? STEALTH_JUMP_MAX_EXTRA_FRAMES
    : 0;
  const displayedMaxTotalFrames = totalFrames + stealthJumpMaxExtraFrames;
  return {
    ap: boundedAp,
    chargeFrames,
    moveFrames,
    totalFrames,
    totalSeconds: totalFrames / 60,
    baseTotalFrames,
    savedFrames: baseTotalFrames - totalFrames,
    hasStealthJump,
    stealthJumpMaxExtraFrames,
    displayedMaxTotalFrames,
    displayedMaxTotalSeconds: displayedMaxTotalFrames / 60,
  };
}
