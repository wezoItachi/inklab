import { analyzeMovementSpeed } from './movement-speed.ts';
import { getQuickSuperJumpAnalysis } from './quick-super-jump.ts';
import { analyzeQuickRespawn } from './quick-respawn.ts';
import { analyzeSpecialSaver } from './special-gauge.ts';

export const fixedAbilityAnalysisIds = ['ninja', 'stealth', 'rp'] as const;

export function hasFixedAbilityAnalysis(abilityId: string) {
  return fixedAbilityAnalysisIds.some((id) => id === abilityId);
}

export function analyzeNinjaSquidContext(
  weaponId: string,
  swimSpeedAp: number,
) {
  return analyzeMovementSpeed({
    weaponId,
    abilityId: 'ssu',
    ap: swimSpeedAp,
    hasNinjaSquid: true,
  });
}

export function analyzeStealthJumpContext(quickJumpAp: number) {
  return getQuickSuperJumpAnalysis(quickJumpAp, true);
}

export function analyzeRespawnPunisherContext(
  quickRespawnAp: number,
  specialSaverAp: number,
) {
  const ownRespawn = analyzeQuickRespawn(quickRespawnAp, {
    hasRespawnPunisher: true,
  });
  const ownSpecial = analyzeSpecialSaver(specialSaverAp, {
    hasRespawnPunisher: true,
  });
  const opponentRespawnAtZeroAp = analyzeQuickRespawn(0);
  const opponentSpecialAtZeroAp = analyzeSpecialSaver(0);
  return {
    ownRespawn,
    ownSpecial,
    opponentRespawnAtZeroAp: {
      frames: opponentRespawnAtZeroAp.againstRespawnPunisherFrames,
      seconds: opponentRespawnAtZeroAp.againstRespawnPunisherSeconds,
    },
    opponentSpecialAtZeroAp: {
      lossPercent: opponentSpecialAtZeroAp.splattedByRespawnPunisherLossPercent,
      retainedPercent:
        opponentSpecialAtZeroAp.splattedByRespawnPunisherRetainedPercent,
    },
  };
}
