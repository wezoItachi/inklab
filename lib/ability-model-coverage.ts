import { abilities } from './abilities.ts';
import { getAbilityCurveDefinition } from './ability-curves.ts';
import { summarizeSpecialPowerData } from './special-power.ts';
import { getSubPowerCoverage } from './sub-power.ts';

export function getAbilityModelCoverage() {
  const curveCounts = abilities.reduce(
    (counts, ability) => {
      counts[getAbilityCurveDefinition(ability.id).status] += 1;
      return counts;
    },
    {
      verified: 0,
      'weapon-specific': 0,
      pending: 0,
      'not-applicable': 0,
    },
  );
  const subPower = getSubPowerCoverage();
  const specialPower = summarizeSpecialPowerData();

  return {
    abilityCount: abilities.length,
    universalCurveCount: curveCounts.verified,
    weaponSpecificAbilityCount: curveCounts['weapon-specific'],
    pendingAbilityCount: curveCounts.pending,
    fixedMainAbilityCount: curveCounts['not-applicable'],
    subWeaponCount: subPower.recordCount,
    subMetricCount: subPower.metricCount,
    specialWeaponCount: specialPower.total,
    verifiedSpecialWeaponCount: specialPower.verified,
    pendingSpecialWeaponCount: specialPower.pending,
    specialMetricCount: specialPower.metricCount,
  } as const;
}

export function getAbilityModelCoverageNote() {
  const coverage = getAbilityModelCoverage();
  return `${coverage.universalCurveCount} 条通用 AP 曲线、${coverage.subWeaponCount} 种副武器的 ${coverage.subMetricCount} 个专属指标、${coverage.verifiedSpecialWeaponCount} 种特殊武器的 ${coverage.specialMetricCount} 个具名指标、套装特殊点数及来源完整的动作走速已核对`;
}
