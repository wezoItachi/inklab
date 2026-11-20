import type { SalmonRotation } from './salmon-run.ts';

export const SALMON_SCHEDULE_SOURCE_URL =
  'https://splatoon3.ink/data/schedules.json';
export const SALMON_SCHEDULE_CACHE_KEY = 'inklab:salmon-schedule:v1';

const salmonStageNames: Readonly<Record<string, string>> = {
  'Barnacle & Dime': '塔拉波特购物公园',
  'Bonerattle Arena': '鲑鱼心脏斗技场',
  'Eeltail Alley': '鳗鲶区',
  'Gone Fission Hydroplant': '麦年海洋发电所',
  'Grand Splatlands Bowl': '蛮颓大巨蛋',
  'Inkblot Art Academy': '海女美术大学',
  "Jammin' Salmon Junction": '生筋子系统交流道遗址',
  "Marooner's Bay": '漂浮落难船',
  'Multiple Sites': '各地同时发生',
  'Salmonid Smokeyard': '时不知鲑烟熏工房',
  'Sockeye Station': '新卷堡',
  'Spawning Grounds': '鲑坝',
  "Um'ami Ruins": '鱼露遗迹',
  'Undertow Spillway': '竹蛏疏洪道',
  'Wahoo World': '醋饭海洋世界',
};

export type SalmonScheduleEnvelope = {
  schemaVersion: 1;
  source: 'splatoon3.ink';
  sourceUrl: typeof SALMON_SCHEDULE_SOURCE_URL;
  fetchedAt: string;
  rotations: SalmonRotation[];
};

type ScheduleStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function localizeSalmonStageName(name: string) {
  return salmonStageNames[name] ?? name;
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
      !Number.isFinite(Date.parse(value.startTime)) ||
      typeof value.endTime !== 'string' ||
      !Number.isFinite(Date.parse(value.endTime)) ||
      Date.parse(value.startTime) >= Date.parse(value.endTime) ||
      typeof value.setting?.coopStage?.name !== 'string' ||
      !value.setting.coopStage.name.trim() ||
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
    if (parsedWeapons.length !== 4) return [];
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

function parseRotation(value: unknown): SalmonRotation | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as {
    stage?: unknown;
    startTime?: unknown;
    endTime?: unknown;
    weapons?: unknown;
  };
  if (
    typeof candidate.stage !== 'string' ||
    !candidate.stage.trim() ||
    typeof candidate.startTime !== 'string' ||
    !Number.isFinite(Date.parse(candidate.startTime)) ||
    typeof candidate.endTime !== 'string' ||
    !Number.isFinite(Date.parse(candidate.endTime)) ||
    Date.parse(candidate.startTime) >= Date.parse(candidate.endTime) ||
    !Array.isArray(candidate.weapons)
  )
    return null;
  const weapons = candidate.weapons.flatMap((weapon) => {
    if (!weapon || typeof weapon !== 'object') return [];
    const item = weapon as { id?: unknown; name?: unknown };
    if (
      typeof item.id !== 'string' ||
      !item.id.trim() ||
      typeof item.name !== 'string' ||
      !item.name.trim()
    )
      return [];
    return [{ id: item.id, name: item.name }];
  });
  if (weapons.length !== candidate.weapons.length) return null;
  return {
    stage: candidate.stage,
    startTime: candidate.startTime,
    endTime: candidate.endTime,
    weapons,
  };
}

export function createSalmonScheduleEnvelope(
  rotations: SalmonRotation[],
  fetchedAt = new Date().toISOString(),
): SalmonScheduleEnvelope {
  return {
    schemaVersion: 1,
    source: 'splatoon3.ink',
    sourceUrl: SALMON_SCHEDULE_SOURCE_URL,
    fetchedAt,
    rotations,
  };
}

export function parseSalmonScheduleEnvelope(
  payload: unknown,
): SalmonScheduleEnvelope | null {
  if (!payload || typeof payload !== 'object') return null;
  const candidate = payload as Partial<SalmonScheduleEnvelope>;
  if (
    candidate.schemaVersion !== 1 ||
    candidate.source !== 'splatoon3.ink' ||
    candidate.sourceUrl !== SALMON_SCHEDULE_SOURCE_URL ||
    typeof candidate.fetchedAt !== 'string' ||
    !Number.isFinite(Date.parse(candidate.fetchedAt)) ||
    !Array.isArray(candidate.rotations)
  )
    return null;
  const rotations = candidate.rotations.flatMap((item) => {
    const parsed = parseRotation(item);
    return parsed ? [parsed] : [];
  });
  if (!rotations.length || rotations.length !== candidate.rotations.length)
    return null;
  return { ...candidate, rotations } as SalmonScheduleEnvelope;
}

export function readSalmonScheduleCache(
  storage: ScheduleStorage,
): SalmonScheduleEnvelope | null {
  try {
    const value = storage.getItem(SALMON_SCHEDULE_CACHE_KEY);
    return value ? parseSalmonScheduleEnvelope(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}

export function writeSalmonScheduleCache(
  storage: ScheduleStorage,
  envelope: SalmonScheduleEnvelope,
) {
  try {
    storage.setItem(SALMON_SCHEDULE_CACHE_KEY, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}
