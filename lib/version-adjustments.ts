export type VersionAdjustment = {
  gameVersion: '12.0.0';
  summary: string;
  modelNote: string;
};

const splashWallAdjustment: VersionAdjustment = {
  gameVersion: '12.0.0',
  summary: '设置后至展开所需的时间增加 5 帧。',
  modelNote: '当前副武器性能只计算防护墙耐久；展开延迟属于固定动作规则，不随 AP 变化。',
};

const specialPointAdjustments = new Map<
  string,
  VersionAdjustment & { previousPoints: number; currentPoints: number }
>([
  [
    'main-6012',
    {
      gameVersion: '12.0.0',
      previousPoints: 180,
      currentPoints: 170,
      summary: '特殊武器必要点数由 180p 下调至 170p。',
      modelNote: '实验室已按当前 170p 基础值计算特殊武器增加量。',
    },
  ],
  [
    'main-72',
    {
      gameVersion: '12.0.0',
      previousPoints: 180,
      currentPoints: 190,
      summary: '特殊武器必要点数由 180p 上调至 190p。',
      modelNote: '实验室已按当前 190p 基础值计算特殊武器增加量。',
    },
  ],
  [
    'main-210',
    {
      gameVersion: '12.0.0',
      previousPoints: 190,
      currentPoints: 200,
      summary: '特殊武器必要点数由 190p 上调至 200p。',
      modelNote: '实验室已按当前 200p 基础值计算特殊武器增加量。',
    },
  ],
  [
    'main-3012',
    {
      gameVersion: '12.0.0',
      previousPoints: 180,
      currentPoints: 190,
      summary: '特殊武器必要点数由 180p 上调至 190p。',
      modelNote: '实验室已按当前 190p 基础值计算特殊武器增加量。',
    },
  ],
]);

export function getSubVersionAdjustment(subId: string) {
  return subId === 'splash-wall' ? splashWallAdjustment : null;
}

export function getSpecialPointAdjustment(weaponId: string) {
  return specialPointAdjustments.get(weaponId) ?? null;
}

export function summarizeVersionAdjustments() {
  return {
    subWeaponRules: 1,
    specialPointKits: specialPointAdjustments.size,
  };
}
