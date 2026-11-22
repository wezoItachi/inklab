import type { Ability } from './abilities.ts';
import type { Weapon } from './weapon-catalog.ts';
import { analyzeSpecialPower } from './special-power.ts';

export type AbilityContext = {
  experimentArea: string;
  activation: string;
  target: string;
  targetNote: string;
  conclusion: string;
  verification: 'curve-pending' | 'rule-only';
};

const targetById: Readonly<Record<string, string>> = {
  ssu: '鱿鱼形态移动',
  rsu: '人形态移动',
  qsj: '超级跳跃准备阶段',
  ia: '跳射与鱿鱼滚行／登顶动作',
  iru: '潜墨与非射击回墨阶段',
  scu: '特殊武器计量表增加量',
  ss: '被击倒后的特殊武器计量表',
  qr: '连续未击倒对手时的复活阶段',
  inkres: '踏入对手墨水后的移动与伤害',
  subr: '受到次要武器攻击时的影响',
  og: '对战开局后的限定时段',
  lde: '对战末段或对手推进目标时的限定时段',
  tenacity: '队伍人数暂时落后时的特殊武器计量表',
  comeback: '被击倒并复活后的限定时段',
  ninja: '在墨水中移动时的轨迹可见性',
  haunt: '击倒自己的对手',
  thermal: '被主武器命中的远处对手',
  rp: '自己与对手的复活／特殊武器惩罚',
  doubler: '当前服装的三个追加能力槽',
  stealth: '超级跳跃落点标记',
  object: '非玩家目标物',
  drop: '超级跳跃落地后的受身动作',
};

function activationFor(ability: Ability) {
  if (ability.group.endsWith('限定')) return '主技能限定／条件触发';
  if (['qr', 'ss'].includes(ability.id)) return '满足条件时生效';
  return '装备后持续生效';
}

export function buildAbilityContext(
  ability: Ability,
  weapon: Weapon,
  ap: number,
): AbilityContext {
  const target =
    ability.id === 'spu'
      ? weapon.special
      : (targetById[ability.id] ?? '当前玩家状态');
  const isExclusive = ability.group.endsWith('限定');
  const specialPower =
    ability.id === 'spu' ? analyzeSpecialPower(weapon.specialId, ap) : null;

  return {
    experimentArea: ability.group,
    activation: activationFor(ability),
    target,
    targetNote:
      ability.id === 'spu'
        ? specialPower?.status === 'verified'
          ? `${weapon.special} 的具名增强字段已核对，可在实验室单项分析中试算。`
          : `${weapon.special} 的参数索引语义仍需逐项核验。`
        : isExclusive
          ? `${ability.name}的规则作用对象已确定；它是固定主能力，不进入通用 AP 曲线。`
          : `${ability.name}的规则作用对象已确定；精确数值与临界点仍由效果曲线验证。`,
    conclusion: isExclusive
      ? `当前为 ${ap}AP 主技能投入。先按触发条件理解作用，不把固定主技能格换算成未经核验的数值收益。`
      : ability.id === 'spu' && specialPower?.status === 'verified'
        ? `当前为 ${ap}AP 投入。${weapon.special}的专属字段可以试算，但本站不把字段变化直接包装成统一推荐量。`
        : `当前为 ${ap}AP 投入。网站已能识别作用范围，但在曲线核验前不提供“推荐投入量”或伪精确收益。`,
    verification: isExclusive ? 'rule-only' : 'curve-pending',
  };
}
