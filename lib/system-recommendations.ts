import type { LoadoutSlot } from './loadouts.ts';
import type { Weapon, WeaponFamily } from './weapons.ts';

export type SystemRecommendation = {
  id: 'main' | 'sub' | 'special';
  name: string;
  desc: string;
  rationale: string;
  evidence: readonly string[];
  focusAbilityId: string;
  slots: readonly LoadoutSlot[];
};

type FamilyProfile = {
  label: string;
  primary: string;
  secondary: string;
  support: string;
};

const familyProfiles: Record<WeaponFamily, FamilyProfile> = {
  '射击枪': { label: '移动射击与持续交战', primary: 'ssu', secondary: 'ism', support: 'ia' },
  '爆破枪': { label: '跳射稳定与主武续航', primary: 'ia', secondary: 'ism', support: 'ssu' },
  '滚筒': { label: '接近目标与挥击续航', primary: 'ssu', secondary: 'ism', support: 'iru' },
  '画笔': { label: '高频移动与主武续航', primary: 'ssu', secondary: 'ism', support: 'iru' },
  '蓄力枪': { label: '蓄力射击续航与转点', primary: 'ism', secondary: 'ssu', support: 'qsj' },
  '泼桶': { label: '连续泼墨与位置调整', primary: 'ism', secondary: 'ssu', support: 'iru' },
  '加特林': { label: '蓄力射击与走位', primary: 'rsu', secondary: 'ism', support: 'ssu' },
  '双枪': { label: '翻滚交战与机动容错', primary: 'ia', secondary: 'ssu', support: 'inkres' },
  '伞': { label: '主武耗墨与交战续航', primary: 'ism', secondary: 'iru', support: 'ssu' },
  '弓': { label: '蓄力射击与阵地转移', primary: 'ism', secondary: 'ssu', support: 'ia' },
  '刮水刀': { label: '蓄力斩击与接近目标', primary: 'ssu', secondary: 'ism', support: 'ia' },
};

function makeSlots(
  mains: readonly [string, string, string],
  subs: readonly [string, string, string, string, string, string, string, string, string],
): LoadoutSlot[] {
  return [
    [mains[0], 10], [subs[0], 3], [subs[1], 3], [subs[2], 3],
    [mains[1], 10], [subs[3], 3], [subs[4], 3], [subs[5], 3],
    [mains[2], 10], [subs[6], 3], [subs[7], 3], [subs[8], 3],
  ];
}

/**
 * Produce transparent starting points from verified weapon identity and family.
 * These are deterministic heuristics, not player statistics or claims of an optimal build.
 */
export function getSystemRecommendations(weapon: Weapon): readonly SystemRecommendation[] {
  const profile = familyProfiles[weapon.family];
  const subEvidence = weapon.sub.baseInkCost === null
    ? `${weapon.sub.name} 的身份已核对；耗墨曲线仍待验证`
    : `${weapon.sub.name} 基础耗墨 ${weapon.sub.baseInkCost}% 已录入`;
  const subPowerAbility = weapon.sub.subPowerEffect === null ? profile.support : 'subp';
  const subPowerNote = weapon.sub.subPowerEffect === null
    ? '副武增强作用尚未核对，因此没有自动投入副强'
    : `副武增强已知影响${weapon.sub.subPowerEffect}`;

  return [
    {
      id: 'main',
      name: '主武基础型',
      desc: profile.label,
      rationale: `按${weapon.family}的共通操作需求分配能力，作为调整起点；不引用打法定位或玩家胜率。`,
      evidence: [`武器族：${weapon.family}`, `侧重：${profile.label}`, '保留快跳、粘脚与副防各 3AP'],
      focusAbilityId: profile.primary,
      slots: makeSlots(
        [profile.primary, profile.secondary, profile.support],
        [profile.primary, profile.primary, profile.secondary, profile.secondary, profile.support, 'iru', 'qsj', 'inkres', 'subr'],
      ),
    },
    {
      id: 'sub',
      name: `${weapon.sub.name}协同型`,
      desc: '围绕已核对的武器套装组织能力',
      rationale: `提高副武器使用后的续航空间；精确节省量和连续使用阈值要等 AP 曲线核验。`,
      evidence: [subEvidence, subPowerNote, '保留基础机动与生存小能力'],
      focusAbilityId: 'iss',
      slots: makeSlots(
        ['iss', subPowerAbility, 'iru'],
        ['iss', 'iss', 'iss', subPowerAbility, subPowerAbility, 'iru', 'qsj', 'inkres', 'subr'],
      ),
    },
    {
      id: 'special',
      name: `${weapon.special}循环型`,
      desc: '积攒、保留与重新进入循环',
      rationale: `只根据已核对的特殊武器身份提供循环方向，不推断大招强度、最佳释放频率或模式表现。`,
      evidence: [`特殊武器：${weapon.special}`, '大招增与大招减作为循环起点', '未自动投入大招强，避免套用未知效果'],
      focusAbilityId: 'scu',
      slots: makeSlots(
        ['scu', 'ss', profile.primary],
        ['scu', 'scu', 'scu', 'ss', 'ss', profile.primary, 'qsj', 'inkres', 'subr'],
      ),
    },
  ];
}
