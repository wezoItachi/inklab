import { abilities } from './abilities.ts';
import { getAbilityCurveDefinition } from './ability-curves.ts';
import { getInkRecoveryAnalysis } from './ink-recovery.ts';
import type { Weapon } from './weapon-catalog.ts';
import { getSubInkSaverAnalysis } from './sub-ink-saver.ts';

export type EquippedAbilityTotal = {
  id: string;
  ap: number;
};

export type ContextMetric = {
  label: string;
  value: string;
  note: string;
  state: 'verified' | 'equipped' | 'pending' | 'empty';
};

export type ContextSection = {
  id: 'sub' | 'special' | 'mobility' | 'survival' | 'other';
  title: string;
  summary: string;
  metrics: readonly ContextMetric[];
};

const abilityById = new Map(abilities.map((ability) => [ability.id, ability]));

function apOf(totals: readonly EquippedAbilityTotal[], id: string) {
  return totals.find((total) => total.id === id)?.ap ?? 0;
}

function equippedMetrics(
  totals: readonly EquippedAbilityTotal[],
  ids: readonly string[],
  emptyNote: string,
): ContextMetric[] {
  const metrics = ids.flatMap((id) => {
    const ap = apOf(totals, id);
    const ability = abilityById.get(id);
    const curve = getAbilityCurveDefinition(id);
    return ap > 0 && ability
      ? [
          {
            label: ability.short,
            value: `${ap}AP`,
            note:
              curve.status === 'verified'
                ? `${ability.name}已装备；正式效果曲线可在上方单项分析中试算。`
                : curve.status === 'not-applicable'
                  ? `${ability.name}是固定主能力；按触发规则说明，不进入通用 AP 曲线。`
                  : `${ability.name}已装备；精确效果曲线仍按字段状态单独核验。`,
            state: 'equipped' as const,
          },
        ]
      : [];
  });
  return metrics.length > 0
    ? metrics
    : [
        {
          label: '当前配装',
          value: '未投入',
          note: emptyNote,
          state: 'empty',
        },
      ];
}

export function buildLoadoutContextSections(
  weapon: Weapon,
  totals: readonly EquippedAbilityTotal[],
): readonly ContextSection[] {
  const subInkAp = apOf(totals, 'iss');
  const subPowerAp = apOf(totals, 'subp');
  const inkRecoveryAp = apOf(totals, 'iru');
  const specialChargeAp = apOf(totals, 'scu');
  const specialSaveAp = apOf(totals, 'ss');
  const specialPowerAp = apOf(totals, 'spu');
  const baseInkCost = weapon.sub.baseInkCost;
  const baseUses =
    baseInkCost !== null && baseInkCost > 0
      ? Math.floor(100 / baseInkCost)
      : null;
  const baseInkRemainder =
    baseUses === null || baseInkCost === null
      ? null
      : 100 - baseUses * baseInkCost;
  const subInkAnalysis = getSubInkSaverAnalysis(weapon, subInkAp);
  const inkRecoveryAnalysis = getInkRecoveryAnalysis(weapon, inkRecoveryAp);

  const coveredIds = new Set([
    'iss',
    'subp',
    'iru',
    'scu',
    'ss',
    'spu',
    'ssu',
    'rsu',
    'qsj',
    'ia',
    'qr',
    'inkres',
    'subr',
    'comeback',
    'stealth',
    'drop',
  ]);
  const otherIds = totals
    .map(({ id }) => id)
    .filter((id) => !coveredIds.has(id));

  return [
    {
      id: 'sub',
      title: '次要武器实际影响',
      summary: `${weapon.sub.name} · 当前套装`,
      metrics: [
        {
          label: '基础耗墨',
          value: baseInkCost === null ? '待验证' : `${baseInkCost}%`,
          note:
            baseUses === null || baseInkRemainder === null
              ? '当前只有副武器身份，基础耗墨尚未进入核验数据。'
              : `不计能力与回墨时，满墨可完整使用 ${baseUses} 次，余 ${baseInkRemainder.toFixed(1)}% 墨。`,
          state: baseInkCost === null ? 'pending' : 'verified',
        },
        {
          label: '副武省墨',
          value:
            subInkAp > 0 && subInkAnalysis
              ? `${subInkAp}AP · ${subInkAnalysis.adjustedInkCost.toFixed(2)}%`
              : '未投入',
          note:
            subInkAp > 0 && subInkAnalysis
              ? `按${weapon.sub.name}的 Lv${subInkAnalysis.level} 曲线计算，满墨可完整使用 ${subInkAnalysis.adjustedUsesPerTank} 次。`
              : '当前配装没有提升墨汁效率（次要武器）；曲线已核对，可在上方单项分析中试算。',
          state: subInkAnalysis ? (subInkAp > 0 ? 'equipped' : 'verified') : 'pending',
        },
        {
          label: '副武增强',
          value: subPowerAp > 0 ? `${subPowerAp}AP` : '未投入',
          note:
            weapon.sub.subPowerEffect === null
              ? '该副武器的增强对象仍待核验。'
              : `已核对增强对象：${weapon.sub.subPowerEffect}；当前 AP 的精确增量仍待曲线验证。`,
          state:
            weapon.sub.subPowerEffect === null
              ? 'pending'
              : subPowerAp > 0
                ? 'equipped'
                : 'verified',
        },
        {
          label: '回墨协同',
          value:
            inkRecoveryAp > 0
              ? `${inkRecoveryAp}AP · 潜墨 ${inkRecoveryAnalysis.squid.adjustedSeconds.toFixed(2)}秒`
              : '未投入',
          note:
            inkRecoveryAp > 0
              ? `对战模式从空槽回满：潜墨 ${inkRecoveryAnalysis.squid.adjustedFrames} 帧，非潜墨 ${inkRecoveryAnalysis.humanoid.adjustedFrames} 帧；不包含${weapon.sub.name}使用后的墨锁。`
              : '当前配装没有提升墨汁回复力；对战回墨曲线已核对，可在上方单项分析中试算。',
          state: inkRecoveryAp > 0 ? 'equipped' : 'verified',
        },
      ],
    },
    {
      id: 'special',
      title: '特殊武器循环',
      summary: weapon.special,
      metrics: [
        {
          label: '大招增加',
          value: specialChargeAp > 0 ? `${specialChargeAp}AP` : '未投入',
          note: '必要点数和增加量曲线尚未接入，因此不输出攒满所需涂墨量。',
          state: specialChargeAp > 0 ? 'equipped' : 'empty',
        },
        {
          label: '大招减量',
          value: specialSaveAp > 0 ? `${specialSaveAp}AP` : '未投入',
          note: '只记录当前投入；阵亡后保留比例仍等待正式曲线。',
          state: specialSaveAp > 0 ? 'equipped' : 'empty',
        },
        {
          label: '大招增强',
          value: specialPowerAp > 0 ? `${specialPowerAp}AP` : '未投入',
          note: `${weapon.special} 的具体增强对象与增量尚未逐项核验。`,
          state: specialPowerAp > 0 ? 'equipped' : 'pending',
        },
      ],
    },
    {
      id: 'mobility',
      title: '移动与返场',
      summary: '游速 · 走速 · 快跳 · 行动',
      metrics: equippedMetrics(
        totals,
        ['ssu', 'rsu', 'qsj', 'ia'],
        '当前配装没有机动类能力投入。',
      ),
    },
    {
      id: 'survival',
      title: '生存与抗性',
      summary: '复活 · 粘脚 · 副防 · 返场限定',
      metrics: equippedMetrics(
        totals,
        ['qr', 'inkres', 'subr', 'comeback', 'stealth', 'drop'],
        '当前配装没有生存、抗性或返场限定能力投入。',
      ),
    },
    {
      id: 'other',
      title: '其他能力',
      summary:
        otherIds.length > 0 ? `${otherIds.length} 项已装备` : '没有剩余能力',
      metrics: equippedMetrics(
        totals,
        otherIds,
        '所有已装备能力都已经归入上方分析区。',
      ),
    },
  ];
}
