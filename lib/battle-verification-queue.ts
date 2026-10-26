import queueDocument from '../database/battle-parameter-verification-queue.v11.3.0.json' with { type: 'json' };

export type VerificationRouteSummary = {
  total: number;
  breakdown: ReadonlyArray<{
    category: string;
    label: string;
    count: number;
  }>;
  shortLabel: string;
};

const categoryLabels: Record<string, string> = {
  'action-cycle-model-required': '动作周期',
  'capability-or-inheritance-semantics-required': '能力/继承',
  'explicit-source-or-controlled-capture-required': '显式来源/录像',
  'external-semantic-source-required': '外部语义',
  'range-model-or-controlled-measurement-required': '射程模型/测量',
  'runtime-default-or-capability-observation-required': '默认值/机制观察',
  'runtime-default-or-calibrated-measurement-required': '默认值/标定测量',
  'runtime-default-or-frame-capture-required': '默认值/逐帧',
};

const routeCountsByWeapon = new Map<string, Map<string, number>>();
for (const category of queueDocument.categories) {
  for (const group of category.groups) {
    for (const weaponId of group.weaponIds) {
      const weaponCounts =
        routeCountsByWeapon.get(weaponId) ?? new Map<string, number>();
      weaponCounts.set(
        category.category,
        (weaponCounts.get(category.category) ?? 0) + 1,
      );
      routeCountsByWeapon.set(weaponId, weaponCounts);
    }
  }
}

export function getWeaponVerificationRouteSummary(
  weaponId: string,
): VerificationRouteSummary {
  const counts = routeCountsByWeapon.get(weaponId) ?? new Map<string, number>();
  const breakdown = [...counts.entries()]
    .map(([category, count]) => ({
      category,
      label: categoryLabels[category] ?? category,
      count,
    }))
    .sort(
      (left, right) =>
        right.count - left.count || left.label.localeCompare(right.label),
    );
  const total = breakdown.reduce((sum, item) => sum + item.count, 0);
  return {
    total,
    breakdown,
    shortLabel:
      breakdown.length === 0
        ? '无待验证路线'
        : breakdown
            .slice(0, 2)
            .map(({ label, count }) => `${label}×${count}`)
            .join(' · '),
  };
}
