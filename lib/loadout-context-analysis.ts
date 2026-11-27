import { abilities } from './abilities.ts';
import { analyzeActionIntensify } from './action-intensify.ts';
import { getFixedAbilityRule } from './ability-context.ts';
import { getAbilityCurveDefinition } from './ability-curves.ts';
import { analyzeEnemyInkResistance } from './enemy-ink-resistance.ts';
import { getInkRecoveryAnalysis } from './ink-recovery.ts';
import { getMainInkSaverAnalysis } from './main-ink-saver.ts';
import { analyzeMovementSpeed } from './movement-speed.ts';
import { analyzeQuickRespawn } from './quick-respawn.ts';
import { getQuickSuperJumpAnalysis } from './quick-super-jump.ts';
import { analyzeSpecialCharge, analyzeSpecialSaver } from './special-gauge.ts';
import { analyzeSpecialPower } from './special-power.ts';
import { analyzeSubPower } from './sub-power.ts';
import { analyzeSubResistance } from './sub-resistance.ts';
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
  state: 'verified' | 'weapon-specific' | 'equipped' | 'pending' | 'empty';
  abilityId?: string;
};

export type ContextSection = {
  id: 'main' | 'sub' | 'special' | 'mobility' | 'survival' | 'other';
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
                : curve.status === 'weapon-specific'
                  ? `${ability.name}已装备；收益按当前武器套装的专属字段计算，不套用统一百分比。`
                  : curve.status === 'not-applicable'
                    ? (getFixedAbilityRule(id)?.labNote ??
                      `${ability.name}是固定主能力；按触发规则说明，不进入通用 AP 曲线。`)
                    : `${ability.name}已装备；精确效果曲线仍按字段状态单独核验。`,
            state: 'equipped' as const,
            abilityId: id,
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
  const swimSpeedAp = apOf(totals, 'ssu');
  const runSpeedAp = apOf(totals, 'rsu');
  const quickJumpAp = apOf(totals, 'qsj');
  const actionAp = apOf(totals, 'ia');
  const quickRespawnAp = apOf(totals, 'qr');
  const enemyInkAp = apOf(totals, 'inkres');
  const subResistanceAp = apOf(totals, 'subr');
  const mainInkAp = apOf(totals, 'ism');
  const hasNinjaSquid = apOf(totals, 'ninja') > 0;
  const hasStealthJump = apOf(totals, 'stealth') > 0;
  const hasRespawnPunisher = apOf(totals, 'rp') > 0;
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
  const subPowerAnalysis = analyzeSubPower(weapon.sub.id, subPowerAp);
  const mainInkAnalysis = getMainInkSaverAnalysis(weapon.id, mainInkAp);
  const mainInkPrimary = mainInkAnalysis.profiles[0] ?? null;
  const inkRecoveryAnalysis = getInkRecoveryAnalysis(weapon, inkRecoveryAp);
  const specialChargeAnalysis = analyzeSpecialCharge(
    weapon.id,
    specialChargeAp,
  );
  const specialSaveAnalysis = analyzeSpecialSaver(specialSaveAp, {
    hasRespawnPunisher,
  });
  const specialPowerAnalysis = analyzeSpecialPower(
    weapon.specialId,
    specialPowerAp,
  );
  const subPowerPrimary = subPowerAnalysis?.metrics[0] ?? null;
  const specialPowerPrimary = specialPowerAnalysis?.metrics[0] ?? null;

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
    'ninja',
    'rp',
    'ism',
  ]);
  const otherIds = totals
    .map(({ id }) => id)
    .filter((id) => !coveredIds.has(id));
  const otherCount = otherIds.length;

  const mainMetrics: ContextMetric[] = [
    {
      label: '主武省墨',
      value:
        mainInkPrimary === null
          ? '基础耗墨待核验'
          : mainInkAp > 0
            ? `${mainInkAp}AP · 耗墨 −${mainInkAnalysis.reductionPercent.toFixed(1)}%`
            : '未投入',
      note:
        mainInkPrimary === null
          ? '通用主武省墨曲线已核对，但当前武器尚无可用于完整动作次数换算的基础耗墨字段。'
          : mainInkAp > 0
            ? `${mainInkPrimary.label}由 ${mainInkPrimary.baseInkCost.toFixed(2)}% 降至 ${mainInkPrimary.adjustedInkCost.toFixed(2)}%，满墨 ${mainInkPrimary.adjustedActionsPerTank} 次。`
            : `${mainInkPrimary.label}基础耗墨 ${mainInkPrimary.baseInkCost.toFixed(2)}%，满墨 ${mainInkPrimary.baseActionsPerTank} 次；当前配装没有主武省墨投入。`,
      state:
        mainInkPrimary === null
          ? 'pending'
          : mainInkAp > 0
            ? 'equipped'
            : 'verified',
      abilityId: 'ism',
    },
    {
      label: '可复算动作',
      value:
        mainInkAnalysis.profiles.length > 0
          ? `${mainInkAnalysis.profiles.length} 种`
          : '尚未建立',
      note:
        mainInkAnalysis.profiles.length > 0
          ? `当前可按主武省墨换算：${mainInkAnalysis.profiles.map(({ label }) => label).join('、')}。基础主武伤害与动作窗口仍由上方主武分析独立展示。`
          : '当前武器已有其他已核对参数，但尚无适合套入主武省墨曲线的单次耗墨动作。',
      state: mainInkAnalysis.profiles.length > 0 ? 'verified' : 'pending',
    },
  ];

  const mobilityMetrics: ContextMetric[] = [];
  if (swimSpeedAp > 0 || hasNinjaSquid) {
    const analysis = analyzeMovementSpeed({
      weaponId: weapon.id,
      abilityId: 'ssu',
      ap: swimSpeedAp,
      hasNinjaSquid,
    });
    mobilityMetrics.push({
      label: hasNinjaSquid ? '游速＋隐游' : '游速',
      value: `${swimSpeedAp}AP · ${analysis.speed.toFixed(3)}/帧`,
      note: hasNinjaSquid
        ? `${analysis.speedClassLabel}游速先按 AP 算到 ${analysis.speedBeforeFixedAbilities.toFixed(3)}，再应用鱿鱼忍者 0.9 倍固定修正。`
        : `${analysis.speedClassLabel}当前速度为每秒 ${analysis.speedPerSecond.toFixed(1)} 单位。`,
      state: 'equipped',
      abilityId: 'ssu',
    });
  }
  if (runSpeedAp > 0) {
    const analysis = analyzeMovementSpeed({
      weaponId: weapon.id,
      abilityId: 'rsu',
      ap: runSpeedAp,
    });
    mobilityMetrics.push({
      label: '走速',
      value: `${runSpeedAp}AP · ${analysis.speed.toFixed(3)}/帧`,
      note: `${analysis.speedClassLabel}普通人形态速度；射击、蓄力等动作状态在单项分析中独立显示。`,
      state: 'equipped',
      abilityId: 'rsu',
    });
  }
  if (quickJumpAp > 0 || hasStealthJump) {
    const analysis = getQuickSuperJumpAnalysis(quickJumpAp, hasStealthJump);
    mobilityMetrics.push({
      label: hasStealthJump ? '快跳＋隐跳' : '快跳',
      value: `${quickJumpAp}AP · ${analysis.totalFrames}帧`,
      note: hasStealthJump
        ? `标准完整跳跃 ${analysis.totalFrames} 帧；隐身跳跃随距离最多增加到 ${analysis.displayedMaxTotalFrames} 帧。`
        : `完整跳跃缩短 ${analysis.savedFrames} 帧，当前约 ${analysis.totalSeconds.toFixed(2)} 秒。`,
      state: 'equipped',
      abilityId: 'qsj',
    });
  }
  if (actionAp > 0) {
    const analysis = analyzeActionIntensify(weapon.id, actionAp);
    mobilityMetrics.push({
      label: '行动',
      value: `${actionAp}AP · 登顶 ${analysis.displayedSquidSurgeChargeFrames}帧`,
      note: analysis.jumpSpread
        ? `当前武器跳射扩散为 ${analysis.jumpSpread.currentDegrees.toFixed(2)}°；鱿鱼滚行窗口没有独立来源数值。`
        : '当前武器没有可复算的跳射额外扩散字段；这里只显示鱿鱼登顶蓄力。',
      state: 'equipped',
      abilityId: 'ia',
    });
  }
  if (mobilityMetrics.length === 0) {
    mobilityMetrics.push({
      label: '当前配装',
      value: '未投入',
      note: '当前配装没有机动类能力投入。',
      state: 'empty',
    });
  }

  const survivalMetrics: ContextMetric[] = [];
  if (quickRespawnAp > 0 || hasRespawnPunisher) {
    const analysis = analyzeQuickRespawn(quickRespawnAp, {
      hasRespawnPunisher,
    });
    survivalMetrics.push({
      label: hasRespawnPunisher ? '快活＋死惩' : '快活',
      value: `${quickRespawnAp}AP · ${analysis.standardSeconds.toFixed(2)}秒`,
      note: hasRespawnPunisher
        ? '已计入自己装备提升复活惩罚后的固定复活代价；快活仍只在满足连续未击倒条件时触发。'
        : `满足触发条件时缩短 ${analysis.savedFrames.toFixed(0)} 帧。`,
      state: 'equipped',
      abilityId: 'qr',
    });
  }
  if (enemyInkAp > 0) {
    const analysis = analyzeEnemyInkResistance(enemyInkAp);
    survivalMetrics.push({
      label: '粘脚',
      value: `${enemyInkAp}AP · 缓冲 ${analysis.graceFrames}帧`,
      note: `敌墨伤害上限 ${analysis.damageLimit.toFixed(1)}，每帧 ${analysis.damagePerFrame.toFixed(3)}；走速等其余边界在单项分析查看。`,
      state: 'equipped',
      abilityId: 'inkres',
    });
  }
  if (subResistanceAp > 0) {
    const analysis = analyzeSubResistance(subResistanceAp);
    survivalMetrics.push({
      label: '副防',
      value: `${subResistanceAp}AP · 重伤害 ×${analysis.heavyDamageMultiplier.toFixed(3)}`,
      note: `标记时间 ×${analysis.markingTimeMultiplier.toFixed(3)}；不同副武器伤害与状态效果分别计算。`,
      state: 'equipped',
      abilityId: 'subr',
    });
  }
  const fixedReturnMetrics = equippedMetrics(
    totals,
    ['comeback', 'drop'],
    '',
  ).filter(({ state }) => state !== 'empty');
  survivalMetrics.push(...fixedReturnMetrics);
  if (survivalMetrics.length === 0) {
    survivalMetrics.push({
      label: '当前配装',
      value: '未投入',
      note: '当前配装没有生存、抗性或返场限定能力投入。',
      state: 'empty',
    });
  }

  const otherMetrics: ContextMetric[] = [];
  otherMetrics.push(
    ...equippedMetrics(totals, otherIds, '').filter(
      ({ state }) => state !== 'empty',
    ),
  );
  if (otherMetrics.length === 0) {
    otherMetrics.push({
      label: '当前配装',
      value: '已归类',
      note: '所有已装备能力都已经归入上方分析区。',
      state: 'empty',
    });
  }

  return [
    {
      id: 'main',
      title: '主要武器与当前配装',
      summary: `${weapon.name} · 主省 ${mainInkAp}AP`,
      metrics: mainMetrics,
    },
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
          state: subInkAnalysis
            ? subInkAp > 0
              ? 'equipped'
              : 'verified'
            : 'pending',
          abilityId: 'iss',
        },
        {
          label: '副武增强',
          value:
            subPowerAp > 0 && subPowerPrimary
              ? `${subPowerAp}AP · ${subPowerPrimary.value.toFixed(2)}`
              : '未投入',
          note:
            subPowerPrimary === null
              ? '该副武器的性能参数记录缺失。'
              : `${subPowerPrimary.label}：基础 ${subPowerPrimary.baseValue.toFixed(2)}，当前 ${subPowerPrimary.value.toFixed(2)}；完整单位与其他字段可在上方单项分析查看。`,
          state:
            subPowerPrimary === null
              ? 'pending'
              : subPowerAp > 0
                ? 'equipped'
                : 'weapon-specific',
          abilityId: 'subp',
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
          abilityId: 'iru',
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
          value:
            specialChargeAp > 0
              ? `${specialChargeAp}AP · ${specialChargeAnalysis.requiredPoints}p`
              : '未投入',
          note: `当前套装基础需要 ${specialChargeAnalysis.basePoints}p；当前 AP 下需要 ${specialChargeAnalysis.requiredPoints}p。`,
          state: specialChargeAp > 0 ? 'equipped' : 'verified',
          abilityId: 'scu',
        },
        {
          label: '大招减量',
          value:
            specialSaveAp > 0 || hasRespawnPunisher
              ? `${specialSaveAp}AP · 保留 ${specialSaveAnalysis.currentRetainedPercent.toFixed(1)}%`
              : '未投入',
          note: hasRespawnPunisher
            ? `当前已计入自身提升复活惩罚代价，实际损失 ${specialSaveAnalysis.currentLossPercent.toFixed(1)}%；对手侧边界另行显示。`
            : `标准被击倒时损失 ${specialSaveAnalysis.standardLossPercent.toFixed(1)}%；复活惩罚边界在上方单项分析独立显示。`,
          state:
            specialSaveAp > 0 || hasRespawnPunisher ? 'equipped' : 'verified',
          abilityId: 'ss',
        },
        {
          label: '大招增强',
          value:
            specialPowerAp > 0 && specialPowerPrimary
              ? `${specialPowerAp}AP · ${specialPowerPrimary.value.toFixed(2)}`
              : '未投入',
          note:
            specialPowerAnalysis?.status === 'verified' && specialPowerPrimary
              ? `${specialPowerPrimary.label}：基础 ${specialPowerPrimary.baseValue.toFixed(2)}，当前 ${specialPowerPrimary.value.toFixed(2)}；完整单位与其他字段可在上方单项分析查看。`
              : `${weapon.special} 的参数索引语义仍待核验，不输出猜测值。`,
          state:
            specialPowerAnalysis?.status !== 'verified' || !specialPowerPrimary
              ? 'pending'
              : specialPowerAp > 0
                ? 'equipped'
                : 'weapon-specific',
          abilityId: 'spu',
        },
      ],
    },
    {
      id: 'mobility',
      title: '移动与返场',
      summary: '游速 · 走速 · 快跳 · 行动 · 固定修正',
      metrics: mobilityMetrics,
    },
    {
      id: 'survival',
      title: '生存与抗性',
      summary: '复活 · 粘脚 · 副防 · 返场限定',
      metrics: survivalMetrics,
    },
    {
      id: 'other',
      title: '其他能力',
      summary: otherCount > 0 ? `${otherCount} 项已装备` : '没有剩余能力',
      metrics: otherMetrics,
    },
  ];
}
