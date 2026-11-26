import type { Ability } from './abilities.ts';
import { getAbilityCurveDefinition } from './ability-curves.ts';
import type { Weapon } from './weapon-catalog.ts';
import { analyzeSpecialPower } from './special-power.ts';

export type AbilityContext = {
  experimentArea: string;
  activation: string;
  target: string;
  targetNote: string;
  conclusion: string;
  verification:
    | 'curve-verified'
    | 'curve-pending'
    | 'weapon-specific'
    | 'rule-only';
};

export type FixedAbilityRule = {
  activation: string;
  target: string;
  labNote: string;
  hasLinkedNumericModel: boolean;
};

const fixedAbilityRules: Readonly<Record<string, FixedAbilityRule>> = {
  og: {
    activation: '对战开局后的限定时段',
    target: '开局移动状态与相关动作',
    labNote:
      '当前只说明开局触发语境；持续时间、临时能力量与模式差异尚未接入实算。',
    hasLinkedNumericModel: false,
  },
  lde: {
    activation: '对战末段或规则目标推进满足条件时',
    target: '墨水效率与墨水回复相关效果',
    labNote: '当前不把末段触发后的临时能力量写入基础省墨或回墨曲线。',
    hasLinkedNumericModel: false,
  },
  tenacity: {
    activation: '己方存活人数少于对方时',
    target: '特殊武器计量表的自动增加',
    labNote: '当前只确认人数差触发语境，不推算实际对局中的持续积攒量。',
    hasLinkedNumericModel: false,
  },
  comeback: {
    activation: '被对手击倒并复活后的限定时段',
    target: '复活后获得的多项临时能力',
    labNote: '当前不把复活后的临时能力量写入常驻 AP 或基础曲线。',
    hasLinkedNumericModel: false,
  },
  ninja: {
    activation: '在己方墨水中以鱿鱼形态移动时',
    target: '潜墨轨迹可见性与鱿鱼冲刺速度',
    labNote:
      '实验室会读取当前游速 AP 与武器重量级，再独立应用已核对的 0.9 倍固定游速修正；轨迹可见性仍按规则说明。',
    hasLinkedNumericModel: true,
  },
  haunt: {
    activation: '被对手击倒并复活后',
    target: '击倒自己的对手',
    labNote:
      '当前只说明追踪对象与触发关系，不推断标记距离、持续时间或对手被击倒后的附加结果。',
    hasLinkedNumericModel: false,
  },
  thermal: {
    activation: '使用主武器命中对手后',
    target: '符合观察条件的被命中对手',
    labNote:
      '当前只说明主武器命中触发语境，不推断观察距离、持续时间或不同命中形态的差异。',
    hasLinkedNumericModel: false,
  },
  rp: {
    activation: '自己击倒对手或被对手击倒时',
    target: '自己与对手的复活时间和特殊武器计量表',
    labNote:
      '实验室会把自身快活与大招减投入代入已核对模型，并将自身代价和对手 0AP 参考边界分开。',
    hasLinkedNumericModel: true,
  },
  doubler: {
    activation: '装备在服装主能力槽时持续生效',
    target: '当前服装的三个追加能力槽',
    labNote:
      '当前只说明追加能力槽的固定规则，不把槽位增幅换算成可堆叠的通用 AP 曲线。',
    hasLinkedNumericModel: false,
  },
  stealth: {
    activation: '执行超级跳跃并显示落点时',
    target: '对手看到的超级跳跃落点标记与跳跃时间',
    labNote:
      '实验室会读取当前快跳 AP，并把标准完整跳跃与随距离变化、最多 60 帧的固定惩罚分开。',
    hasLinkedNumericModel: true,
  },
  object: {
    activation: '主武器攻击适用的非玩家目标物时',
    target: '规则定义的非玩家目标物',
    labNote:
      '目标物种类与伤害倍率尚未形成本站可复算表，因此不把它概括成统一伤害百分比。',
    hasLinkedNumericModel: false,
  },
  drop: {
    activation: '超级跳跃落地时进行方向输入',
    target: '落地后的受身动作与短暂状态',
    labNote:
      '当前只说明落地触发语境，不推算受身距离、操作窗口或后续临时能力量。',
    hasLinkedNumericModel: false,
  },
};

export function getFixedAbilityRule(abilityId: string) {
  return fixedAbilityRules[abilityId] ?? null;
}

export function getAbilityLabScopeNote(
  verification: AbilityContext['verification'],
) {
  return verification === 'curve-verified'
    ? '正式 AP 曲线已经接入；实验室会按当前武器、当前投入与对应边界展示可复算结果。'
    : verification === 'rule-only'
      ? '这是固定主能力，按对应部位与触发条件生效；它不进入 0–57AP 通用曲线，也不会生成伪造的投入临界点。'
      : verification === 'weapon-specific'
        ? '这项能力没有可代表全部武器的单一曲线；实验室会按当前副武器或特殊武器读取已经核对的专属指标。'
        : '当前先展示可核对的规则语义；效果曲线、临界点与推荐投入量继续保持待验证。';
}

const targetById: Readonly<Record<string, string>> = {
  ssu: '鱿鱼形态移动',
  rsu: '人形态移动',
  qsj: '超级跳跃准备阶段',
  ia: '跳射与鱿鱼滚行／登顶动作',
  ism: '当前主武器的动作耗墨',
  iss: '当前次要武器的单次耗墨与完整使用次数',
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
      : ability.id === 'subp'
        ? weapon.sub.name
        : (targetById[ability.id] ?? '当前玩家状态');
  const isExclusive = ability.group.endsWith('限定');
  const fixedRule = getFixedAbilityRule(ability.id);
  const curve = getAbilityCurveDefinition(ability.id);
  const specialPower =
    ability.id === 'spu' ? analyzeSpecialPower(weapon.specialId, ap) : null;

  return {
    experimentArea: ability.group,
    activation: fixedRule?.activation ?? activationFor(ability),
    target: fixedRule?.target ?? target,
    targetNote:
      ability.id === 'spu'
        ? specialPower?.status === 'verified'
          ? `${weapon.special} 的具名增强字段已核对，可在实验室单项分析中试算。`
          : `${weapon.special} 的参数索引语义仍需逐项核验。`
        : ability.id === 'subp'
          ? `${weapon.sub.name} 的具名增强字段已核对，可在实验室单项分析中试算。`
          : fixedRule
            ? fixedRule.labNote
            : `${ability.name}的规则作用对象已确定；精确数值与临界点仍由效果曲线验证。`,
    conclusion: fixedRule
      ? ap > 0
        ? fixedRule.hasLinkedNumericModel
          ? '当前配装已装备此固定主能力。实验室可以联动已有模型，但固定主能力本身仍不会被折算成可重复堆叠的 AP。'
          : '当前配装已装备此固定主能力。先按触发条件理解作用，不把主技能槽换算成未经核验的数值收益。'
        : fixedRule.hasLinkedNumericModel
          ? '当前配装未装备此固定主能力；实验室显示的是假设装备后的联动预览，不会修改左侧配装。'
          : '当前配装未装备此固定主能力；以下只展示规则与作用对象，不会修改左侧配装。'
      : ['subp', 'spu'].includes(ability.id)
        ? `当前为 ${ap}AP 投入。${target}的专属字段会在实验室按实际单位试算，但本站不把不同武器的效果包装成一条统一百分比。`
        : curve.status === 'verified'
          ? `当前为 ${ap}AP 投入。正式曲线已接入，实验室会结合当前武器与适用边界输出可复算结果。`
          : `当前为 ${ap}AP 投入。网站已能识别作用范围，但在曲线核验前不提供“推荐投入量”或伪精确收益。`,
    verification: isExclusive
      ? 'rule-only'
      : ['subp', 'spu'].includes(ability.id)
        ? 'weapon-specific'
        : curve.status === 'verified'
          ? 'curve-verified'
          : 'curve-pending',
  };
}
