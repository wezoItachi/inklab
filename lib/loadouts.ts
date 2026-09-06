export type LoadoutSlot = [abilityId: string, ap: 3 | 10];

export const presets = [
  {
    name: '前线缠斗',
    desc: '强调机动与快速返场',
    ids: ['ssu', 'qsj', 'inkres'],
    slots: [['ssu', 10], ['ssu', 3], ['qsj', 3], ['inkres', 3], ['ism', 10], ['ism', 3], ['iru', 3], ['ssu', 3], ['qsj', 10], ['qsj', 3], ['subr', 3], ['ss', 3]],
  },
  {
    name: '副武器压制',
    desc: '围绕当前副武器改善续航',
    ids: ['iss', 'iru', 'subr'],
    slots: [['iss', 10], ['iss', 3], ['iss', 3], ['iss', 3], ['iru', 10], ['iss', 3], ['iru', 3], ['subr', 3], ['qsj', 10], ['qsj', 3], ['inkres', 3], ['ss', 3]],
  },
  {
    name: '大招循环',
    desc: '稳定积攒并保护大招槽',
    ids: ['scu', 'ss', 'spu'],
    slots: [['scu', 10], ['scu', 3], ['ss', 3], ['qsj', 3], ['spu', 10], ['spu', 3], ['scu', 3], ['inkres', 3], ['qsj', 10], ['ss', 3], ['subr', 3], ['ssu', 3]],
  },
] as const;

export function clonePresetSlots(index: number): LoadoutSlot[] {
  const preset = presets[index] ?? presets[0];
  return preset.slots.map(([id, ap]) => [id, ap]);
}

/** Replace one gear slot while preserving whether it is a 10 AP main or 3 AP sub slot. */
export function replaceLoadoutSlot(
  slots: readonly LoadoutSlot[],
  slotIndex: number,
  abilityId: string,
): LoadoutSlot[] {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= slots.length) {
    throw new RangeError(`Slot index ${slotIndex} is outside the loadout`);
  }
  return slots.map(([id, ap], index) => index === slotIndex ? [abilityId, ap] : [id, ap]);
}

export function calculateAbilityTotals(slots: readonly LoadoutSlot[]) {
  const totals = new Map<string, number>();
  for (const [id, ap] of slots) totals.set(id, (totals.get(id) ?? 0) + ap);
  return [...totals].map(([id, ap]) => ({ id, ap })).sort((a, b) => b.ap - a.ap);
}

function getApParts(targetAp: number) {
  for (let mains = 3; mains >= 0; mains -= 1) {
    const remaining = targetAp - mains * 10;
    if (remaining >= 0 && remaining % 3 === 0 && remaining / 3 <= 9) {
      return { mains, subs: remaining / 3 };
    }
  }
  throw new RangeError(`AP value ${targetAp} cannot be represented by available gear slots`);
}

/** Set an ability to an exact, representable AP total while keeping the loadout at 57 AP. */
export function setAbilityAp(
  slots: readonly LoadoutSlot[],
  abilityId: string,
  targetAp: number,
  fallbackAbilityId = 'qsj',
): LoadoutSlot[] {
  if (abilityId === fallbackAbilityId) throw new Error('Ability and fallback must differ');
  const { mains, subs } = getApParts(targetAp);
  const next = slots.map(([id, ap]) => [id === abilityId ? fallbackAbilityId : id, ap] as LoadoutSlot);
  const mainIndexes = next.flatMap(([, ap], index) => ap === 10 ? [index] : []);
  const subIndexes = next.flatMap(([, ap], index) => ap === 3 ? [index] : []);
  if (mains > mainIndexes.length || subs > subIndexes.length) throw new RangeError('Not enough slots');
  mainIndexes.slice(0, mains).forEach((index) => { next[index] = [abilityId, 10]; });
  subIndexes.slice(0, subs).forEach((index) => { next[index] = [abilityId, 3]; });
  return next;
}

export function totalAp(slots: readonly LoadoutSlot[]) {
  return slots.reduce((sum, [, ap]) => sum + ap, 0);
}
