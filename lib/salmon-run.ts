import { weapons, type WeaponFamily } from './weapons.ts';

export type SalmonRole = 'frontline' | 'flex' | 'ranged' | 'control';
export type SalmonWeaponTag =
  | '短手'
  | '中程'
  | '长手'
  | '高机动'
  | '低机动'
  | '清杂'
  | '对单体'
  | '涂地'
  | '贯通'
  | '蓄力';

export const GRIZZCO_FAMILY = '熊先生印章武器' as const;
export type SalmonWeaponFamily = WeaponFamily | typeof GRIZZCO_FAMILY;

export type SalmonWeapon = {
  id: string;
  name: string;
  family: SalmonWeaponFamily;
  aliases: readonly string[];
  role: SalmonRole;
  tags: readonly SalmonWeaponTag[];
  salmonDps: number | null;
  parameterSource: string | null;
};

export type SalmonRotation = {
  stage: string;
  startTime: string;
  endTime: string;
  weapons: { id: string; name: string }[];
};

const curatedSalmonWeapons: readonly Omit<
  SalmonWeapon,
  'family' | 'parameterSource'
>[] = [
  {
    id: 'splattershot',
    name: '斯普拉射击枪',
    aliases: ['Splattershot'],
    role: 'flex',
    tags: ['中程', '高机动', '清杂', '涂地'],
    salmonDps: null,
  },
  {
    id: 'splash-o-matic',
    name: '窄域标记枪',
    aliases: ['Splash-o-matic'],
    role: 'frontline',
    tags: ['短手', '高机动', '对单体', '涂地'],
    salmonDps: null,
  },
  {
    id: '52-gal',
    name: '.52加仑',
    aliases: ['.52 Gal'],
    role: 'flex',
    tags: ['中程', '对单体', '涂地'],
    salmonDps: null,
  },
  {
    id: 'jet-squelcher',
    name: '喷射清洁枪',
    aliases: ['Jet Squelcher'],
    role: 'ranged',
    tags: ['长手', '低机动', '对单体'],
    salmonDps: null,
  },
  {
    id: 'luna-blaster',
    name: '新星爆破枪',
    aliases: ['Luna Blaster'],
    role: 'control',
    tags: ['短手', '清杂'],
    salmonDps: null,
  },
  {
    id: 'blaster',
    name: '爆破枪',
    aliases: ['Blaster'],
    role: 'control',
    tags: ['中程', '清杂'],
    salmonDps: null,
  },
  {
    id: 'splat-roller',
    name: '斯普拉滚筒',
    aliases: ['Splat Roller'],
    role: 'frontline',
    tags: ['短手', '清杂', '涂地'],
    salmonDps: null,
  },
  {
    id: 'carbon-roller',
    name: '碳纤维滚筒',
    aliases: ['Carbon Roller'],
    role: 'frontline',
    tags: ['短手', '高机动', '清杂', '涂地'],
    salmonDps: null,
  },
  {
    id: 'splat-charger',
    name: '斯普拉蓄力狙击枪',
    aliases: ['Splat Charger'],
    role: 'ranged',
    tags: ['长手', '对单体', '贯通', '蓄力'],
    salmonDps: null,
  },
  {
    id: 'squiffer',
    name: '鱿快洁α',
    aliases: ['Classic Squiffer', 'Squiffer'],
    role: 'flex',
    tags: ['中程', '高机动', '对单体', '贯通', '蓄力'],
    salmonDps: null,
  },
  {
    id: 'slosher',
    name: '飞溅泼桶',
    aliases: ['Slosher'],
    role: 'control',
    tags: ['中程', '清杂', '贯通'],
    salmonDps: null,
  },
  {
    id: 'explosher',
    name: '爆炸泼桶',
    aliases: ['Explosher'],
    role: 'control',
    tags: ['长手', '低机动', '清杂'],
    salmonDps: null,
  },
  {
    id: 'heavy-splatling',
    name: '桶装旋转枪',
    aliases: ['Heavy Splatling'],
    role: 'ranged',
    tags: ['长手', '对单体', '蓄力'],
    salmonDps: null,
  },
  {
    id: 'hydra-splatling',
    name: '消防栓旋转枪',
    aliases: ['Hydra Splatling'],
    role: 'ranged',
    tags: ['长手', '低机动', '对单体', '蓄力'],
    salmonDps: null,
  },
  {
    id: 'splat-dualies',
    name: '斯普拉机动枪',
    aliases: ['Splat Dualies'],
    role: 'frontline',
    tags: ['短手', '高机动', '对单体', '涂地'],
    salmonDps: null,
  },
  {
    id: 'dapple-dualies',
    name: '溅镀枪',
    aliases: ['Dapple Dualies'],
    role: 'frontline',
    tags: ['短手', '高机动', '对单体'],
    salmonDps: null,
  },
  {
    id: 'splat-brella',
    name: '斯普拉防空伞',
    aliases: ['Splat Brella'],
    role: 'flex',
    tags: ['中程', '清杂', '涂地'],
    salmonDps: null,
  },
  {
    id: 'tri-stringer',
    name: '三发猎鱼弓',
    aliases: ['Tri-Stringer'],
    role: 'ranged',
    tags: ['长手', '对单体', '蓄力'],
    salmonDps: null,
  },
  {
    id: 'splatana-wiper',
    name: '工作刮水刀',
    aliases: ['Splatana Wiper'],
    role: 'frontline',
    tags: ['短手', '高机动', '清杂'],
    salmonDps: null,
  },
] as const;

const liveAliases: Readonly<Record<string, readonly string[]>> = {
  'LACT-450': ['REEF-LUX 450'],
  回旋泼桶: ['Dread Wringer'],
  工作刮水刀: ['Splatana Wiper'],
  邦普V: ['Wellstring V'],
  巴勃罗: ['Inkbrush'],
  北斋: ['Octobrush'],
  文森: ['Painbrush'],
};

function inferSalmonProfile(
  family: WeaponFamily,
): Pick<SalmonWeapon, 'role' | 'tags'> {
  switch (family) {
    case '射击枪':
      return { role: 'flex', tags: ['中程', '高机动', '清杂', '涂地'] };
    case '爆破枪':
      return { role: 'control', tags: ['中程', '清杂'] };
    case '滚筒':
      return { role: 'frontline', tags: ['短手', '清杂', '涂地'] };
    case '画笔':
      return { role: 'frontline', tags: ['短手', '高机动', '清杂', '涂地'] };
    case '蓄力枪':
      return { role: 'ranged', tags: ['长手', '对单体', '贯通', '蓄力'] };
    case '泼桶':
      return { role: 'control', tags: ['中程', '清杂'] };
    case '加特林':
      return { role: 'ranged', tags: ['长手', '对单体', '蓄力'] };
    case '双枪':
      return { role: 'frontline', tags: ['短手', '高机动', '对单体', '涂地'] };
    case '伞':
      return { role: 'flex', tags: ['中程', '清杂', '涂地'] };
    case '弓':
      return { role: 'ranged', tags: ['长手', '对单体', '蓄力'] };
    case '刮水刀':
      return { role: 'frontline', tags: ['中程', '高机动', '对单体'] };
  }
}

const regularSalmonBases = weapons.filter(
  (weapon) =>
    weapon.upstreamRowId.endsWith('_00') &&
    !weapon.upstreamRowId.includes('Scope'),
);

/** Regular Salmon Run main-weapon chassis for Ver. 11.3.0. */
export const regularSalmonWeapons: readonly SalmonWeapon[] =
  regularSalmonBases.map((weapon) => {
    const curated = curatedSalmonWeapons.find(
      (item) => item.name === weapon.name,
    );
    if (curated)
      return {
        ...curated,
        family: weapon.family,
        parameterSource: null,
      };
    const inferred = inferSalmonProfile(weapon.family);
    return {
      id: `salmon-${weapon.upstreamRowId.toLowerCase().replaceAll('_', '-')}`,
      name: weapon.name,
      family: weapon.family,
      aliases: liveAliases[weapon.name] ?? [],
      role: inferred.role,
      tags: inferred.tags,
      salmonDps: null,
      parameterSource: null,
    };
  });

/**
 * The eight Grizzco weapons present in Leanny's Ver. 11.3.0 catalog. Their
 * `_Coop` parameter files exist upstream, but INKLAB has not normalized or
 * verified DPS yet, so exact performance values intentionally remain empty.
 */
export const grizzcoWeapons: readonly SalmonWeapon[] = [
  {
    id: 'grizzco-blaster',
    name: '熊先生印章爆破枪',
    family: GRIZZCO_FAMILY,
    aliases: ['Grizzco Blaster'],
    role: 'control',
    tags: ['短手', '高机动', '清杂', '涂地'],
    salmonDps: null,
    parameterSource: 'WeaponBlasterBear_Coop.game__GameParameterTable.json',
  },
  {
    id: 'grizzco-charger',
    name: '熊先生印章狙击枪',
    family: GRIZZCO_FAMILY,
    aliases: ['Grizzco Charger'],
    role: 'ranged',
    tags: ['长手', '对单体', '贯通'],
    salmonDps: null,
    parameterSource: 'WeaponChargerBear_Coop.game__GameParameterTable.json',
  },
  {
    id: 'grizzco-dualies',
    name: '熊先生印章机动枪',
    family: GRIZZCO_FAMILY,
    aliases: ['Grizzco Dualies'],
    role: 'frontline',
    tags: ['短手', '高机动', '对单体', '清杂'],
    salmonDps: null,
    parameterSource: 'WeaponManeuverBear_Coop.game__GameParameterTable.json',
  },
  {
    id: 'grizzco-roller',
    name: '熊先生印章滚筒',
    family: GRIZZCO_FAMILY,
    aliases: ['Grizzco Roller'],
    role: 'frontline',
    tags: ['短手', '高机动', '清杂', '涂地'],
    salmonDps: null,
    parameterSource: 'WeaponRollerBear_Coop.game__GameParameterTable.json',
  },
  {
    id: 'grizzco-splatana',
    name: '熊先生印章刮水刀',
    family: GRIZZCO_FAMILY,
    aliases: ['Grizzco Splatana'],
    role: 'frontline',
    tags: ['短手', '对单体', '贯通', '蓄力'],
    salmonDps: null,
    parameterSource: 'WeaponSaberBear_Coop.game__GameParameterTable.json',
  },
  {
    id: 'grizzco-brella',
    name: '熊先生印章防空伞',
    family: GRIZZCO_FAMILY,
    aliases: ['Grizzco Brella'],
    role: 'flex',
    tags: ['中程', '高机动', '清杂', '涂地'],
    salmonDps: null,
    parameterSource: 'WeaponShelterBear_Coop.game__GameParameterTable.json',
  },
  {
    id: 'grizzco-slosher',
    name: '熊先生印章泼桶',
    family: GRIZZCO_FAMILY,
    aliases: ['Grizzco Slosher'],
    role: 'control',
    tags: ['中程', '低机动', '清杂', '贯通'],
    salmonDps: null,
    parameterSource: 'WeaponSlosherBear_Coop.game__GameParameterTable.json',
  },
  {
    id: 'grizzco-stringer',
    name: '熊先生印章猎鱼弓',
    family: GRIZZCO_FAMILY,
    aliases: ['Grizzco Stringer'],
    role: 'ranged',
    tags: ['长手', '对单体', '清杂', '蓄力'],
    salmonDps: null,
    parameterSource: 'WeaponStringerBear_Coop.game__GameParameterTable.json',
  },
] as const;

export const salmonWeapons: readonly SalmonWeapon[] = [
  ...regularSalmonWeapons,
  ...grizzcoWeapons,
];

const roleLetters: Record<SalmonRole, string> = {
  frontline: 'A',
  flex: 'B',
  ranged: 'C',
  control: 'D',
};

export function getCompositionPattern(items: readonly SalmonWeapon[]) {
  const counts = new Map<SalmonRole, number>();
  for (const item of items)
    counts.set(item.role, (counts.get(item.role) ?? 0) + 1);
  return [...counts.values()]
    .sort((a, b) => b - a)
    .map((count, index) => String.fromCharCode(65 + index).repeat(count))
    .join('');
}

export function getCompositionAnalysis(items: readonly SalmonWeapon[]) {
  const countTag = (tag: SalmonWeaponTag) =>
    items.filter((item) => item.tags.includes(tag)).length;
  const warnings: string[] = [];
  const strengths: string[] = [];
  if (countTag('长手') === 0)
    warnings.push('缺少长手位：远处塔与锅盖压力可能集中在走位上。');
  else strengths.push(`${countTag('长手')} 把长手可处理远程目标。`);
  if (countTag('清杂') === 0)
    warnings.push('清杂标签缺失：杂鱼堆积时容错较低。');
  else strengths.push(`${countTag('清杂')} 把武器有清杂标签。`);
  if (countTag('对单体') === 0)
    warnings.push('缺少对单体位：高血量头目的集火余量待确认。');
  else strengths.push(`${countTag('对单体')} 把武器偏向头目集火。`);
  if (countTag('高机动') <= 1 && countTag('低机动') >= 2)
    warnings.push('机动性偏紧：送蛋、救人和被包围时需要更早转点。');
  if (warnings.length === 0)
    strengths.push('射程、清杂、对单体与机动标签未见明显空缺。');
  return {
    pattern: getCompositionPattern(items),
    warnings,
    strengths,
    roleCodes: items.map((item) => roleLetters[item.role]),
  };
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[\s·・_-]/g, '');
}

export function matchSalmonWeapon(name: string) {
  const normalized = normalizeName(name);
  return salmonWeapons.find((item) =>
    [item.name, ...item.aliases].some(
      (alias) => normalizeName(alias) === normalized,
    ),
  );
}

export function parseSalmonRotations(payload: unknown): SalmonRotation[] {
  const root = payload as { data?: unknown };
  const body = (
    root &&
    typeof root === 'object' &&
    root.data &&
    typeof root.data === 'object'
      ? root.data
      : payload
  ) as { coopGroupingSchedule?: { regularSchedules?: { nodes?: unknown[] } } };
  const nodes = body?.coopGroupingSchedule?.regularSchedules?.nodes;
  if (!Array.isArray(nodes)) return [];
  return nodes.flatMap((node) => {
    if (!node || typeof node !== 'object') return [];
    const value = node as {
      startTime?: unknown;
      endTime?: unknown;
      setting?: { coopStage?: { name?: unknown }; weapons?: unknown[] };
    };
    if (
      typeof value.startTime !== 'string' ||
      typeof value.endTime !== 'string' ||
      typeof value.setting?.coopStage?.name !== 'string' ||
      !Array.isArray(value.setting.weapons)
    )
      return [];
    const parsedWeapons = value.setting.weapons.flatMap((weapon) => {
      if (!weapon || typeof weapon !== 'object') return [];
      const candidate = weapon as {
        __splatoon3ink_id?: unknown;
        id?: unknown;
        name?: unknown;
      };
      if (typeof candidate.name !== 'string') return [];
      const rawId = candidate.__splatoon3ink_id ?? candidate.id;
      const id =
        typeof rawId === 'string' || typeof rawId === 'number'
          ? String(rawId)
          : candidate.name;
      return [{ id, name: candidate.name }];
    });
    return [
      {
        stage: value.setting.coopStage.name,
        startTime: value.startTime,
        endTime: value.endTime,
        weapons: parsedWeapons,
      },
    ];
  });
}

export function selectActiveRotation(
  rotations: readonly SalmonRotation[],
  now = new Date(),
) {
  const timestamp = now.getTime();
  return (
    rotations.find(
      (item) =>
        Date.parse(item.startTime) <= timestamp &&
        timestamp < Date.parse(item.endTime),
    ) ??
    rotations.find((item) => Date.parse(item.startTime) > timestamp) ??
    null
  );
}
