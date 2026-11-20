import type { Weapon } from '@/lib/weapon-catalog';
import type { EquippedAbilityTotal } from '@/lib/loadout-context-analysis';
import { buildLoadoutContextSections } from '@/lib/loadout-context-analysis';

export function LoadoutContextAnalysis({
  weapon,
  totals,
}: {
  weapon: Weapon;
  totals: readonly EquippedAbilityTotal[];
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
            {section.metrics.map((metric) => (
              <article className={metric.state} key={metric.label}>
                <small>{metric.label}</small>
                <strong>{metric.value}</strong>
                <p>{metric.note}</p>
              </article>
            ))}
          </div>
        </details>
      ))}
    </>
  );
}
