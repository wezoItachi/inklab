import summaryDocument from '../database/battle-parameter-verification-summary.v12.0.0.json' with { type: 'json' };

export type VerificationRouteSummary = {
  total: number;
  breakdown: ReadonlyArray<{
    category: string;
    label: string;
    note: string;
    count: number;
  }>;
  shortLabel: string;
};

const categoryLabels: Record<string, string> = {
  'action-cycle-controlled-capture-required': '动作周期/逐帧',
  'capability-or-inheritance-semantics-required': '能力/继承',
  'explicit-source-or-controlled-capture-required': '显式来源/录像',
  'external-semantic-source-required': '外部语义',
  'range-model-or-controlled-measurement-required': '射程模型/测量',
  'runtime-default-or-capability-observation-required': '默认值/机制观察',
  'runtime-default-or-calibrated-measurement-required': '默认值/标定测量',
  'runtime-default-or-frame-capture-required': '默认值/逐帧',
};

const categoryNotes: Record<string, string> = {
  'action-cycle-controlled-capture-required':
    '需要按统一起止帧定义录制连续动作，不能把内部阶段直接当成完整周期。',
  'capability-or-inheritance-semantics-required':
    '需要确认省略字段究竟表示继承默认值，还是该武器不具备对应机制。',
  'explicit-source-or-controlled-capture-required':
    '需要找到明确字段来源，或用受控逐帧录像确认数值。',
  'external-semantic-source-required':
    '参数结构没有表达该语义，需要官方说明或另一项可审计来源。',
  'range-model-or-controlled-measurement-required':
    '需要先统一命中边界，再完成训练场标定或完整弹道模型。',
  'runtime-default-or-capability-observation-required':
    '需要用正反例实机观察确认省略开关的运行时行为。',
  'runtime-default-or-calibrated-measurement-required':
    '需要在固定条件下测量运行时默认数值并重复校准。',
  'runtime-default-or-frame-capture-required':
    '需要逐帧采集运行时默认动作值，不能从相邻武器直接继承。',
};

const routeCountsByWeapon = new Map(
  Object.entries(summaryDocument.countsByWeapon).map(
    ([weaponId, indexedCounts]) => [
      weaponId,
      new Map(
        indexedCounts.map(([categoryIndex, count]) => [
          summaryDocument.categoryKeys[categoryIndex],
          count,
        ]),
      ),
    ],
  ),
);

export function getWeaponVerificationRouteSummary(
  weaponId: string,
): VerificationRouteSummary {
  const counts = routeCountsByWeapon.get(weaponId) ?? new Map<string, number>();
  const breakdown = [...counts.entries()]
    .map(([category, count]) => ({
      category,
      label: categoryLabels[category] ?? category,
      note: categoryNotes[category] ?? '需要补充可复核证据。',
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
