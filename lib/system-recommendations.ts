import type { LoadoutSlot } from './loadouts.ts';
import { analyzeSpecialPower } from './special-power.ts';
import { analyzeSubPower } from './sub-power.ts';
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

type RoleProfile = {
  label: string;
  primary: string;
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

const roleProfiles: Readonly<Record<string, RoleProfile>> = {
  '前线 / 伏击': { label: '接敌与阵亡后的再进入', primary: 'qr', support: 'inkres' },
  '前线 / 泛用': { label: '移动交战与基础容错', primary: 'ssu', support: 'inkres' },
  '前线 / 高机动': { label: '动作稳定与近距离机动', primary: 'ia', support: 'ssu' },
  '中后卫 / 压制': { label: '持续压制与横向转位', primary: 'rsu', support: 'qsj' },
  '后卫 / 长射程': { label: '主武续航与安全转点', primary: 'ism', support: 'qsj' },
  '支援 / 前中卫': { label: '协同移动与持续作战', primary: 'ssu', support: 'iru' },
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
  const roleProfile = roleProfiles[weapon.role] ?? null;
  const rolePrimary = roleProfile?.primary ?? profile.primary;
  const roleSupport = roleProfile?.support ?? profile.support;
  const roleEvidence = roleProfile
    ? `目录定位：${weapon.role}（${roleProfile.label}）`
    : `目录定位：${weapon.role}；尚未用于自动分配`;
  const subEvidence = weapon.sub.baseInkCost === null
    ? `${weapon.sub.name} 的身份已核对；耗墨曲线仍待验证`
    : `${weapon.sub.name} 基础耗墨 ${weapon.sub.baseInkCost}% 已录入`;
  const subPowerAnalysis = analyzeSubPower(weapon.sub.id, 3);
  const subPowerAbility = subPowerAnalysis ? 'subp' : profile.support;
  const subPowerNote = subPowerAnalysis
    ? `副武增强已核对：${subPowerAnalysis.metrics.map(({ label }) => label).join('、')}`
    : '副武增强参数记录缺失，因此没有自动投入副强';
  const specialPower = analyzeSpecialPower(weapon.specialId, 3);
  const specialPowerNote =
    specialPower?.status === 'verified'
      ? `大招强已核对：${specialPower.metrics.map(({ label }) => label).join('、')}；是否投入仍取决于战术场景`
      : `${weapon.special} 的性能索引语义待核验，因此不自动投入大招强`;

  return [
    {
      id: 'main',
      name: '主武基础型',
      desc: roleProfile ? `${profile.label} · ${roleProfile.label}` : profile.label,
      rationale: `按${weapon.family}的共通操作需求与当前目录定位分配能力，作为调整起点；不引用对局胜率或玩家采用率。`,
      evidence: [`武器族：${weapon.family}（${profile.label}）`, roleEvidence, '保留快跳、粘脚与副防各 3AP'],
      focusAbilityId: rolePrimary,
      slots: makeSlots(
        [rolePrimary, profile.secondary, roleSupport],
        [rolePrimary, rolePrimary, profile.secondary, profile.secondary, roleSupport, 'iru', 'qsj', 'inkres', 'subr'],
      ),
    },
    {
      id: 'sub',
      name: `${weapon.sub.name}协同型`,
      desc: '围绕已核对的武器套装组织能力',
      rationale: `提高副武器使用后的续航空间；精确节省量和连续使用阈值按当前副武器的已核对曲线计算。`,
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
      evidence: [
        `特殊武器：${weapon.special}`,
        '大招增与大招减作为循环起点',
        specialPowerNote,
      ],
      focusAbilityId: 'scu',
      slots: makeSlots(
        ['scu', 'ss', profile.primary],
        ['scu', 'scu', 'scu', 'ss', 'ss', profile.primary, 'qsj', 'inkres', 'subr'],
      ),
    },
  ];
}
