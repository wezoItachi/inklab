import {
  clampAbilityPoints,
  interpolateAbilityValue,
} from './ability-curves.ts';

const RESPAWN_CHASE_FRAMES = 150;
const SPLATOON_3_RESPAWN_REDUCTION_FRAMES = 60;
const OWN_RESPAWN_PUNISHER_EXTRA_FRAMES = 68;
const OPPONENT_RESPAWN_PUNISHER_EXTRA_FRAMES = 45;

function respawnFrames(ap: number) {
  const frames =
    RESPAWN_CHASE_FRAMES +
    interpolateAbilityValue([90, 180, 270], ap) +
    interpolateAbilityValue([30, 60, 90], ap) -
    SPLATOON_3_RESPAWN_REDUCTION_FRAMES;
  return Math.round(frames * 1_000_000) / 1_000_000;
}

export function analyzeQuickRespawn(
  ap: number,
  { hasRespawnPunisher = false }: { hasRespawnPunisher?: boolean } = {},
) {
  const boundedAp = clampAbilityPoints(ap);
  const ownPenaltyFrames = hasRespawnPunisher
    ? OWN_RESPAWN_PUNISHER_EXTRA_FRAMES
    : 0;
  const standardFrames = respawnFrames(boundedAp) + ownPenaltyFrames;
  const reducedApAgainstRespawnPunisher = Math.ceil(boundedAp * 0.15);
  const againstRespawnPunisherFrames =
    respawnFrames(reducedApAgainstRespawnPunisher) +
    ownPenaltyFrames +
    OPPONENT_RESPAWN_PUNISHER_EXTRA_FRAMES;
  const baseFrames = respawnFrames(0) + ownPenaltyFrames;

  return {
    ap: boundedAp,
    standardFrames,
    standardSeconds: standardFrames / 60,
    savedFrames: baseFrames - standardFrames,
    savedSeconds: (baseFrames - standardFrames) / 60,
    hasRespawnPunisher,
    reducedApAgainstRespawnPunisher,
    againstRespawnPunisherFrames,
    againstRespawnPunisherSeconds: againstRespawnPunisherFrames / 60,
  };
}
