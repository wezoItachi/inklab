import type { SalmonWeapon, SalmonWeaponTag } from './salmon-run.ts';

export type SalmonCompositionGrade =
  | 'strong'
  | 'balanced'
  | 'mixed'
  | 'demanding';

export type SalmonEventTone = 'easy' | 'steady' | 'caution' | 'hard';

export type SalmonCompositionAssessment = {
  grade: SalmonCompositionGrade;
  label: string;
  recommendation: string;
  summary: string;
};

export type SalmonEventAssessment = {
  id: string;
  name: string;
  alias?: string;
  label: string;
  tone: SalmonEventTone;
  influence: string;
  summary: string;
};

type Profile = {
  countTag: (tag: SalmonWeaponTag) => number;
  frontline: number;
  ranged: number;
  control: number;
};

function getProfile(items: readonly SalmonWeapon[]): Profile {
  return {
    countTag: (tag) => items.filter((item) => item.tags.includes(tag)).length,
    frontline: items.filter((item) => item.role === 'frontline').length,
    ranged: items.filter((item) => item.role === 'ranged').length,
    control: items.filter((item) => item.role === 'control').length,
  };
}

function getTone(score: number): Pick<SalmonEventAssessment, 'label' | 'tone'> {
  if (score >= 4) return { label: '较低压力', tone: 'easy' };
  if (score >= 2) return { label: '中等压力', tone: 'steady' };
  if (score >= 0) return { label: '需要留意', tone: 'caution' };
  return { label: '高压倾向', tone: 'hard' };
}

export function assessSalmonComposition(
  items: readonly SalmonWeapon[],
): SalmonCompositionAssessment {
  const profile = getProfile(items);
  const longRange = profile.countTag('长手');
  const crowd = profile.countTag('清杂');
  const single = profile.countTag('对单体');
  const paint = profile.countTag('涂地');
  const mobile = profile.countTag('高机动');
  const slow = profile.countTag('低机动');
  const score =
    (longRange > 0 ? 1 : -2) +
    (crowd >= 2 ? 2 : crowd === 1 ? 0 : -2) +
    (single > 0 ? 1 : -1) +
    (paint > 0 ? 1 : -1) +
    (mobile >= 2 ? 1 : 0) -
    (slow >= 2 ? 1 : 0);

  if (score >= 5)
    return {
      grade: 'strong',
      label: '优势编成',
      recommendation: '熟悉本期武器后，适合尝试冲分',
      summary: '清杂、单体处理、射程与涂地的标签覆盖较完整。',
    };
  if (score >= 4)
    return {
      grade: 'balanced',
      label: '编成均衡',
      recommendation: '适合正常挑战，也可作为冲分候选',
      summary: '主要职能没有明显断层，但仍需要按武器分工。',
    };
  if (score >= 2)
    return {
      grade: 'mixed',
      label: '存在短板',
      recommendation: '建议先熟悉分工，再决定是否冲分',
      summary: '部分关键任务会集中到少数武器，容错取决于配合。',
    };
  return {
    grade: 'demanding',
    label: '高压编成',
    recommendation: '更依赖熟练度与配合，谨慎冲分',
    summary: '标签层存在多项覆盖缺口，失误后的补位空间偏小。',
  };
}

export function assessSalmonEvents(
  items: readonly SalmonWeapon[],
): readonly SalmonEventAssessment[] {
  const profile = getProfile(items);
  const tag = profile.countTag;
  const rushScore =
    (tag('清杂') >= 2 ? 2 : tag('清杂') === 1 ? 0 : -2) +
    (profile.frontline > 0 ? 1 : -1) +
    (tag('涂地') > 0 ? 1 : -1) -
    (tag('低机动') >= 2 ? 1 : 0);
  const grillerScore =
    (tag('对单体') >= 2 ? 2 : tag('对单体') === 1 ? 1 : -2) +
    (tag('长手') > 0 ? 1 : -1) +
    (tag('高机动') > 0 ? 1 : 0);
  const goldieScore =
    (tag('清杂') > 0 ? 1 : -1) +
    (tag('高机动') > 0 ? 1 : 0) +
    (tag('涂地') > 0 ? 1 : -1);
  const mothershipScore =
    (tag('长手') > 0 ? 2 : -1) +
    (tag('涂地') > 0 ? 1 : -1) +
    (tag('清杂') > 0 ? 1 : -1);
  const cohockScore =
    (tag('高机动') > 0 ? 1 : 0) +
    (tag('涂地') > 0 ? 1 : -1) +
    (tag('清杂') > 0 ? 1 : 0);
  const fogScore =
    (tag('长手') > 0 ? 1 : -1) +
    (tag('清杂') > 0 ? 1 : -1) +
    (tag('对单体') > 0 ? 1 : -1) +
    (tag('高机动') > 0 ? 1 : 0);
  const mudmouthScore =
    (tag('高机动') > 0 ? 1 : 0) +
    (tag('涂地') > 0 ? 1 : -1) +
    (profile.control > 0 ? 1 : 0);
  const tornadoScore =
    2 + (tag('高机动') >= 2 ? 2 : tag('高机动') === 1 ? 1 : 0) +
    (tag('涂地') > 0 ? 1 : -1);

  return [
    {
      id: 'rush',
      name: '狂潮',
      alias: '光蝇',
      ...getTone(rushScore),
      influence: '武器影响高',
      summary: '看清杂、站位维持与近身持续处理；最终结论仍由独立 DPS 实验给出。',
    },
    {
      id: 'griller',
      name: '烤架鱼大量出现',
      ...getTone(grillerScore),
      influence: '武器影响高',
      summary: '看单体爆发、射程与小鲑鱼清理分工；未计入地图绕行路线。',
    },
    {
      id: 'goldie-seeking',
      name: '寻找金鲑鱼',
      ...getTone(goldieScore),
      influence: '地图影响高',
      summary: '当前只看开路、转点与清杂；井盖路线和地图规律尚未进入模型。',
    },
    {
      id: 'mothership',
      name: '运鱼船来袭',
      ...getTone(mothershipScore),
      influence: '武器影响中',
      summary: '长手与涂地覆盖越完整，回收箱处理和远处箱子清理越从容。',
    },
    {
      id: 'cohock-charge',
      name: '大胖鱼大量出现',
      ...getTone(cohockScore),
      influence: '炮台分工主导',
      summary: '编成主要影响炮台外运蛋、开路和救援；炮台输出不按主武器强度计算。',
    },
    {
      id: 'fog',
      name: '雾',
      ...getTone(fogScore),
      influence: '配合影响高',
      summary: '均衡覆盖有利于临时补位；视野、报点和金鲑鱼引导尚不能量化。',
    },
    {
      id: 'mudmouth',
      name: '泥鲑鱼喷发',
      ...getTone(mudmouthScore),
      influence: '副武与墨量主导',
      summary: '当前只评估转点与杂鱼处理；三角雷耗墨和回墨节奏接入后再提高置信度。',
    },
    {
      id: 'tornado',
      name: '巨大龙卷风',
      alias: '走私关',
      ...getTone(tornadoScore),
      influence: '编成影响较低',
      summary: '通常更偏搬运与接力，机动和涂地只影响运送余量；未计入地图路线。',
    },
  ];
}
