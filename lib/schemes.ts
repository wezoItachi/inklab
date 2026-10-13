import type { LoadoutSlot } from './loadouts.ts';

export const gameModes = [
  { id: 'turf', label: '涂地模式' },
  { id: 'zones', label: '真格区域' },
  { id: 'tower', label: '真格塔楼' },
  { id: 'rainmaker', label: '真格鱼虎' },
  { id: 'clams', label: '真格蛤蜊' },
] as const;

export type GameModeId = typeof gameModes[number]['id'];

export type SchemeFilters = {
  tags: readonly string[];
  modes: readonly GameModeId[];
  weaponIds: readonly string[];
};

export type ExampleScheme = {
  id: string;
  weaponId: string;
  title: string;
  modes: readonly GameModeId[];
  tags: readonly string[];
  note: string;
  slots: readonly LoadoutSlot[];
};

export const exampleSchemes: readonly ExampleScheme[] = [
  {
    id: 'sample-0042',
    weaponId: 'shooter-quickmiddle-cstm01',
    title: '副武压制与通用机动',
    modes: ['zones', 'tower'],
    tags: ['副武压制', '前中卫', '适合微调'],
    note: '围绕机器人炸弹的使用频率预留副省，同时保留少量通用机动能力。该方案是功能示例，不代表正式攻略结论。',
    slots: [
      ['iss', 10], ['iss', 3], ['subp', 3], ['subp', 3],
      ['ssu', 10], ['iru', 3], ['subr', 3], ['subr', 3],
      ['stealth', 10], ['qsj', 3], ['qsj', 3], ['inkres', 3],
    ],
  },
  {
    id: 'sample-0043',
    weaponId: 'shooter-normalt',
    title: '前线返场与稳定机动',
    modes: ['turf', 'zones', 'rainmaker'],
    tags: ['前线', '快速返场', '通用结构'],
    note: '把游速、快跳和基础抗性放进一套可继续调整的前线结构。具体投入仍应结合个人打法验证。',
    slots: [
      ['ssu', 10], ['ssu', 3], ['qsj', 3], ['inkres', 3],
      ['ism', 10], ['ism', 3], ['iru', 3], ['ssu', 3],
      ['qsj', 10], ['qsj', 3], ['subr', 3], ['ss', 3],
    ],
  },
  {
    id: 'sample-0044',
    weaponId: 'spinner-standardt',
    title: '中后卫大招循环草案',
    modes: ['tower', 'rainmaker', 'clams'],
    tags: ['中后卫', '大招循环', '条件推导'],
    note: '用于体验桶装旋转枪参数面板和大招循环方向。40 发仍是射击窗口可整除时的条件性推导。',
    slots: [
      ['scu', 10], ['scu', 3], ['ss', 3], ['qsj', 3],
      ['spu', 10], ['spu', 3], ['scu', 3], ['inkres', 3],
      ['qsj', 10], ['ss', 3], ['subr', 3], ['ssu', 3],
    ],
  },
];

export function cloneSchemeSlots(scheme: ExampleScheme): LoadoutSlot[] {
  return scheme.slots.map(([abilityId, ap]) => [abilityId, ap]);
}

export function schemeMatchesQuery(
  scheme: ExampleScheme,
  weaponName: string,
  query: string,
): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;
  const modeLabels = scheme.modes.map(mode => gameModes.find(({ id }) => id === mode)?.label ?? '');
  return [scheme.title, weaponName, ...modeLabels, scheme.note, ...scheme.tags]
    .join(' ')
    .toLocaleLowerCase()
    .includes(normalized);
}

export function schemeMatchesMode(scheme: ExampleScheme, mode: GameModeId | 'all') {
  return mode === 'all' || scheme.modes.includes(mode);
}

function matchesAny<T>(selected:readonly T[],values:readonly T[]){return selected.length===0||selected.some(item=>values.includes(item))}

export function schemeMatchesFilters(scheme:ExampleScheme,filters:SchemeFilters){
  return matchesAny(filters.tags,scheme.tags)
    &&matchesAny(filters.modes,scheme.modes)
    &&matchesAny(filters.weaponIds,[scheme.weaponId]);
}
