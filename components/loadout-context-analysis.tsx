import type { Weapon } from '@/lib/weapon-catalog';
import type { EquippedAbilityTotal } from '@/lib/loadout-context-analysis';
import { buildLoadoutContextSections } from '@/lib/loadout-context-analysis';

const stateLabels = {
  verified: '已核对',
  'weapon-specific': '武器专属',
  equipped: '当前配装',
  pending: '待核验',
  empty: '未投入',
} as const;

export function LoadoutContextAnalysis({
  weapon,
  totals,
  selectedAbilityId,
  onSelectAbility,
}: {
  weapon: Weapon;
  totals: readonly EquippedAbilityTotal[];
  selectedAbilityId: string;
  onSelectAbility: (abilityId: string) => void;
}) {
  const sections = buildLoadoutContextSections(weapon, totals);
  return (
    <>
      {sections.map((section, index) => (
        <details open={index === 0} key={section.id}>
          <summary>
            <span>{section.title}</span>
            <b>{section.summary}</b>
          </summary>
          <div className="context-analysis-grid">
            {section.metrics.map((metric) => {
              const isSelected = metric.abilityId === selectedAbilityId;
              return (
                <article
                  className={`${metric.state}${isSelected ? ' selected' : ''}`}
                  key={metric.label}
                >
                  <div className="context-metric-heading">
                    <small>{metric.label}</small>
                    <em>{stateLabels[metric.state]}</em>
                  </div>
                  <strong>{metric.value}</strong>
                  <p>{metric.note}</p>
                  {metric.abilityId && (
                    <button
                      type="button"
                      className="context-analysis-link"
                      aria-pressed={isSelected}
                      onClick={() => onSelectAbility(metric.abilityId!)}
                    >
                      {isSelected ? '当前正在分析' : '查看单项分析'}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </details>
      ))}
    </>
  );
}
