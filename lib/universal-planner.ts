import { abilities } from './abilities.ts';
import { getAbilityCurveDefinition } from './ability-curves.ts';
import {
  getSystemRecommendations,
  summarizeRecommendationAp,
} from './system-recommendations.ts';
import type { Weapon } from './weapon-catalog.ts';

export type PlannerGoal = 'shared-slots' | 'main-conflict' | 'verified-first';

export type UniversalGearCandidate = {
  partId: 'head' | 'clothes' | 'shoes';
  partLabel: '头部' | '服装' | '鞋子';
  sharedSubAbilityIds: string[];
  mainAbilityIds: string[];
  mainAbilityNames: string[];
  commonMainAbilityId: string | null;
  commonSlotCount: number;
  verifiedCommonSlotCount: number;
  compatibilityPercent: number;
};

export type UniversalGearPlan = {
  selectedCount: number;
  goal: PlannerGoal;
  candidate: UniversalGearCandidate | null;
  candidates: UniversalGearCandidate[];
  weaponRequirements: Array<{
    weaponId: string;
    weaponName: string;
    mainAbilityId: string;
    mainAbilityName: string;
    allocation: Array<{
      abilityId: string;
      abilityName: string;
      ap: number;
    }>;
  }>;
};

const partDefinitions = [
  { partId: 'head', partLabel: '头部', mainIndex: 0, subIndexes: [1, 2, 3] },
  {
    partId: 'clothes',
    partLabel: '服装',
    mainIndex: 4,
    subIndexes: [5, 6, 7],
  },
  {
    partId: 'shoes',
    partLabel: '鞋子',
    mainIndex: 8,
    subIndexes: [9, 10, 11],
  },
] as const;

const abilityName = (id: string) =>
  abilities.find((ability) => ability.id === id)?.short ?? id;

function sharedSubAbilities(
  slotGroups: readonly (readonly string[])[],
): string[] {
  if (slotGroups.length === 0) return [];
  const firstCounts = new Map<string, number>();
  for (const id of slotGroups[0]) {
    firstCounts.set(id, (firstCounts.get(id) ?? 0) + 1);
  }
  return [...firstCounts.entries()].flatMap(([id, firstCount]) => {
    const sharedCount = Math.min(
      firstCount,
      ...slotGroups
        .slice(1)
        .map((group) => group.filter((candidate) => candidate === id).length),
    );
    return Array.from({ length: sharedCount }, () => id);
  });
}

function scoreCandidate(candidate: UniversalGearCandidate, goal: PlannerGoal) {
  if (goal === 'main-conflict') {
    return (
      (4 - candidate.mainAbilityIds.length) * 100 +
      candidate.commonSlotCount * 10 +
      candidate.verifiedCommonSlotCount
    );
  }
  if (goal === 'verified-first') {
    return (
      candidate.verifiedCommonSlotCount * 100 +
      candidate.commonSlotCount * 10 -
      candidate.mainAbilityIds.length
    );
  }
  return candidate.commonSlotCount * 100 - candidate.mainAbilityIds.length * 10;
}

export function buildUniversalGearPlan(
  selectedWeapons: readonly Weapon[],
  goal: PlannerGoal,
  selectedPartId?: UniversalGearCandidate['partId'] | null,
): UniversalGearPlan {
  if (selectedWeapons.length < 2) {
    return {
      selectedCount: selectedWeapons.length,
      goal,
      candidate: null,
      candidates: [],
      weaponRequirements: [],
    };
  }

  const recommendations = selectedWeapons.map((weapon) => ({
    weapon,
    slots: getSystemRecommendations(weapon)[0].slots,
  }));
  const candidates = partDefinitions.map((part): UniversalGearCandidate => {
    const mainAbilityIds = [
      ...new Set(recommendations.map(({ slots }) => slots[part.mainIndex][0])),
    ];
    const sharedSubAbilityIds = sharedSubAbilities(
      recommendations.map(({ slots }) =>
        part.subIndexes.map((index) => slots[index][0]),
      ),
    );
    const commonMainAbilityId =
      mainAbilityIds.length === 1 ? mainAbilityIds[0] : null;
    const commonIds = [
      ...(commonMainAbilityId ? [commonMainAbilityId] : []),
      ...sharedSubAbilityIds,
    ];
    const commonSlotCount = commonIds.length;
    const verifiedCommonSlotCount = commonIds.filter(
      (id) => getAbilityCurveDefinition(id).status === 'verified',
    ).length;
    return {
      partId: part.partId,
      partLabel: part.partLabel,
      sharedSubAbilityIds,
      mainAbilityIds,
      mainAbilityNames: mainAbilityIds.map(abilityName),
      commonMainAbilityId,
      commonSlotCount,
      verifiedCommonSlotCount,
      compatibilityPercent: Math.round((commonSlotCount / 4) * 100),
    };
  });
  const recommendedCandidate = [...candidates].sort(
    (left, right) => scoreCandidate(right, goal) - scoreCandidate(left, goal),
  )[0];
  const candidate =
    candidates.find(({ partId }) => partId === selectedPartId) ??
    recommendedCandidate;
  const part = partDefinitions.find(
    ({ partId }) => partId === candidate.partId,
  )!;
  const weaponRequirements = recommendations.map(({ weapon, slots }) => ({
    weaponId: weapon.id,
    weaponName: weapon.name,
    mainAbilityId: slots[part.mainIndex][0],
    mainAbilityName: abilityName(slots[part.mainIndex][0]),
    allocation: summarizeRecommendationAp(slots).map(({ abilityId, ap }) => ({
      abilityId,
      abilityName: abilityName(abilityId),
      ap,
    })),
  }));

  return {
    selectedCount: selectedWeapons.length,
    goal,
    candidate,
    candidates,
    weaponRequirements,
  };
}
