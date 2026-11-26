import { hasFixedAbilityAnalysis } from './fixed-ability-analysis.ts';

export type AbilityLabPanelKind =
  | 'main-ink-saver'
  | 'sub-ink-saver'
  | 'ink-recovery'
  | 'quick-super-jump'
  | 'movement-speed'
  | 'action-intensify'
  | 'enemy-ink-resistance'
  | 'special-gauge'
  | 'quick-respawn'
  | 'sub-power'
  | 'sub-resistance'
  | 'special-power'
  | 'fixed-linked'
  | 'fixed-rule'
  | 'unknown';

const panelByAbilityId: Readonly<Record<string, AbilityLabPanelKind>> = {
  ism: 'main-ink-saver',
  iss: 'sub-ink-saver',
  iru: 'ink-recovery',
  qsj: 'quick-super-jump',
  ssu: 'movement-speed',
  rsu: 'movement-speed',
  ia: 'action-intensify',
  inkres: 'enemy-ink-resistance',
  scu: 'special-gauge',
  ss: 'special-gauge',
  qr: 'quick-respawn',
  subp: 'sub-power',
  subr: 'sub-resistance',
  spu: 'special-power',
};

const fixedRuleIds = new Set([
  'og',
  'lde',
  'tenacity',
  'comeback',
  'ninja',
  'haunt',
  'thermal',
  'rp',
  'doubler',
  'stealth',
  'object',
  'drop',
]);

export function getAbilityLabPanelKind(abilityId: string): AbilityLabPanelKind {
  const directPanel = panelByAbilityId[abilityId];
  if (directPanel) return directPanel;
  if (hasFixedAbilityAnalysis(abilityId)) return 'fixed-linked';
  return fixedRuleIds.has(abilityId) ? 'fixed-rule' : 'unknown';
}

export function summarizeAbilityLabRoutes(abilityIds: readonly string[]) {
  return abilityIds.reduce(
    (summary, abilityId) => {
      const kind = getAbilityLabPanelKind(abilityId);
      summary.total += 1;
      if (kind === 'sub-power' || kind === 'special-power') {
        summary.weaponSpecific += 1;
      } else if (kind === 'fixed-linked' || kind === 'fixed-rule') {
        summary.fixed += 1;
      } else if (kind === 'unknown') {
        summary.unsupported += 1;
      } else {
        summary.universal += 1;
      }
      return summary;
    },
    {
      total: 0,
      universal: 0,
      weaponSpecific: 0,
      fixed: 0,
      unsupported: 0,
    },
  );
}
