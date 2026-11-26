import { abilities, abilityAliases } from './abilities.ts';
import {
  getAbilityCurveDefinition,
  hasMinimumEffectiveAbilityValue,
  hasVerifiedAbilityCurve,
} from './ability-curves.ts';

export function filterAbilitiesForWiki(
  query: string,
  filters: readonly string[],
) {
  return abilities.filter(
    (ability) =>
      (!query ||
        ability.name.includes(query) ||
        ability.short.includes(query) ||
        (abilityAliases[ability.id] || '').includes(query)) &&
      (!filters.includes('副武器') ||
        ['iss', 'subp', 'subr'].includes(ability.id)) &&
      (!filters.includes('墨水续航') || ability.group === '续航') &&
      (!filters.includes('机动') || ability.group === '机动') &&
      (!filters.includes('头部限定') || ability.group === '头部限定') &&
      (!filters.includes('服装限定') || ability.group === '服装限定') &&
      (!filters.includes('鞋子限定') || ability.group === '鞋子限定') &&
      (!filters.includes('少量投入有效') ||
        hasMinimumEffectiveAbilityValue(ability.id)) &&
      (!filters.includes('关键临界点') ||
        hasVerifiedAbilityCurve(ability.id)) &&
      (!filters.includes('武器专属') ||
        getAbilityCurveDefinition(ability.id).status === 'weapon-specific'),
  );
}
