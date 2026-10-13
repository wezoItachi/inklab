export type Ability = {
  id: string;
  name: string;
  short: string;
  group: string;
  color: string;
};

export const abilities: readonly Ability[] = [
  ['ssu', '提升鱿鱼冲刺速度', '游速', '机动', '#8B5CF6'],
  ['rsu', '提升人类移动速度', '走速', '机动', '#14B8A6'],
  ['qsj', '缩短超级跳跃时间', '快跳', '机动', '#38BDF8'],
  ['ia', '行动强化', '行动', '机动', '#6366F1'],
  ['ism', '提升墨汁效率（主要武器）', '主省', '续航', '#F97316'],
  ['iss', '提升墨汁效率（次要武器）', '副省', '续航', '#F59E0B'],
  ['iru', '提升墨汁回复力', '回墨', '续航', '#84CC16'],
  ['subp', '提升次要武器性能', '副强', '副武', '#10B981'],
  ['scu', '提升特殊武器增加量', '大招增', '特殊', '#EC4899'],
  ['ss', '降低特殊武器减少量', '大招减', '特殊', '#F43F5E'],
  ['spu', '提升特殊武器性能', '大招强', '特殊', '#D946EF'],
  ['qr', '缩短复活时间', '复活', '生存', '#EF4444'],
  ['inkres', '减轻对手墨汁影响', '粘脚', '生存', '#22C55E'],
  ['subr', '减轻次要武器影响', '副防', '生存', '#06B6D4'],
  ['og', '最初冲刺', '开局', '头部限定', '#A3E635'],
  ['lde', '最后冲刺', '末冲', '头部限定', '#FACC15'],
  ['tenacity', '逆境强化', '逆境', '头部限定', '#FB923C'],
  ['comeback', '回归', '回归', '头部限定', '#2DD4BF'],
  ['ninja', '鱿鱼忍者', '隐游', '服装限定', '#7C3AED'],
  ['haunt', '复仇', '复仇', '服装限定', '#E11D48'],
  ['thermal', '热力墨汁', '热墨', '服装限定', '#F97316'],
  ['rp', '提升复活惩罚', '死惩', '服装限定', '#991B1B'],
  ['doubler', '追加装备能力增倍', '倍增', '服装限定', '#65A30D'],
  ['stealth', '隐身跳跃', '隐跳', '鞋子限定', '#0EA5E9'],
  ['object', '提升对物体攻击力', '对物', '鞋子限定', '#F59E0B'],
  ['drop', '受身术', '受身', '鞋子限定', '#EC4899'],
].map(([id, name, short, group, color]) => ({ id, name, short, group, color }));

export const abilityGroups = ['全部', '机动', '续航', '副武', '特殊', '生存', '头部限定', '服装限定', '鞋子限定'] as const;

export const abilityParts = [
  { id: 'head', label: '头部', exclusiveGroup: '头部限定', firstSlot: 0 },
  { id: 'clothes', label: '服装', exclusiveGroup: '服装限定', firstSlot: 4 },
  { id: 'shoes', label: '鞋子', exclusiveGroup: '鞋子限定', firstSlot: 8 },
] as const;

export const abilityFilterGroups = ['全部', '机动', '续航', '副武', '特殊', '生存', '限定'] as const;

export type AbilityPartId = typeof abilityParts[number]['id'];
export type AbilityFilterGroup = typeof abilityFilterGroups[number];

export const abilityAliases: Readonly<Record<string, string>> = {
  inkres: '安全鞋 粘脚 粘脚抗性',
  subr: '副防',
  subp: '副武增强 副强',
  ninja: '隐游',
  rp: '死惩',
  stealth: '隐跳',
  object: '对物',
  lde: '末冲',
  og: '开局强化',
};

export const abilityAssetCodes: Readonly<Record<string, string>> = {
  ssu: 'SSU', rsu: 'RSU', qsj: 'QSJ', ia: 'IA', ism: 'ISM', iss: 'ISS', iru: 'IRU', subp: 'BRU',
  scu: 'SCU', ss: 'SS', spu: 'SPU', qr: 'QR', inkres: 'RES', subr: 'SRU', og: 'OG', lde: 'LDE',
  tenacity: 'T', comeback: 'CB', ninja: 'NS', haunt: 'H', thermal: 'TI', rp: 'RP', doubler: 'AD',
  stealth: 'SJ', object: 'OS', drop: 'DR',
};

export function getAbility(abilityId: string) {
  return abilities.find((ability) => ability.id === abilityId);
}

export function getAbilityAssetUrl(abilityId: string) {
  const code = abilityAssetCodes[abilityId];
  return code ? `/assets/abilities/${code}.avif` : undefined;
}

export function getAbilityPartForSlot(slotIndex: number) {
  return abilityParts[Math.max(0, Math.min(2, Math.floor(slotIndex / 4)))];
}

export function canPlaceAbilityInSlot(abilityId: string, slotIndex: number) {
  const ability = getAbility(abilityId);
  if (!ability || !Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 11) return false;
  if (!ability.group.endsWith('限定')) return true;
  const part = getAbilityPartForSlot(slotIndex);
  return slotIndex % 4 === 0 && ability.group === part.exclusiveGroup;
}

export function toggleSelectedPart(currentSlot: number | null, firstSlot: number) {
  if (currentSlot === null) return firstSlot;
  return getAbilityPartForSlot(currentSlot).firstSlot === firstSlot ? null : firstSlot;
}

export function filterAbilitiesForSlot({
  slotIndex,
  filterGroup,
  query = '',
}: {
  slotIndex: number;
  filterGroup: AbilityFilterGroup;
  query?: string;
}) {
  const part = getAbilityPartForSlot(slotIndex);
  const isMainSlot = slotIndex % 4 === 0;
  const normalizedQuery = query.trim();

  return abilities.filter((ability) => {
    const isExclusive = ability.group.endsWith('限定');
    const isAvailable = !isExclusive || (isMainSlot && ability.group === part.exclusiveGroup);
    const matchesGroup = filterGroup === '全部'
      ? true
      : filterGroup === '限定'
        ? ability.group === part.exclusiveGroup
        : ability.group === filterGroup;
    const matchesQuery = !normalizedQuery
      || ability.name.includes(normalizedQuery)
      || ability.short.includes(normalizedQuery)
      || (abilityAliases[ability.id] ?? '').includes(normalizedQuery);
    return isAvailable && matchesGroup && matchesQuery;
  });
}

export function filterExclusiveAbilitiesForPart({
  partId,
  filterGroup,
  query = '',
}: {
  partId: AbilityPartId;
  filterGroup: AbilityFilterGroup;
  query?: string;
}) {
  if (filterGroup !== '全部' && filterGroup !== '限定') return [];
  const part = abilityParts.find(({ id }) => id === partId);
  if (!part) return [];
  const normalizedQuery = query.trim();
  return abilities.filter((ability) => ability.group === part.exclusiveGroup && (
    !normalizedQuery
    || ability.name.includes(normalizedQuery)
    || ability.short.includes(normalizedQuery)
    || (abilityAliases[ability.id] ?? '').includes(normalizedQuery)
  ));
}

