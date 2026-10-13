import { clonePresetSlots, type EditableLoadoutSlot } from './loadouts.ts';
import { decodeLoadoutQuery, type ShareableLoadout } from './loadout-share.ts';

export type EditorState = ShareableLoadout & {
  activePreset: number;
  focus: string;
  selectedSlot: number;
};

export type RestoredEditorState = {
  source: 'url' | 'local' | 'default';
  state: EditorState;
};

function customEditorState(loadout: ShareableLoadout): EditorState {
  return {
    ...loadout,
    slots: loadout.slots.map(
      ([abilityId, ap]) => [abilityId, ap] as EditableLoadoutSlot,
    ),
    activePreset: -1,
    focus: loadout.slots.find(([abilityId]) => abilityId !== null)?.[0] ?? 'iss',
    selectedSlot: 0,
  };
}

export function createDefaultEditorState(defaultWeaponId: string): EditorState {
  const slots = clonePresetSlots(0);
  return {
    weaponId: defaultWeaponId,
    slots,
    activePreset: 0,
    focus: slots[0][0],
    selectedSlot: 0,
  };
}

export function resolveInitialEditorState({
  urlSearch,
  savedSearch,
  defaultWeaponId,
  weaponIds,
  abilityIds,
}: {
  urlSearch: string;
  savedSearch?: string | null;
  defaultWeaponId: string;
  weaponIds: ReadonlySet<string>;
  abilityIds: ReadonlySet<string>;
}): RestoredEditorState {
  const fromUrl = decodeLoadoutQuery(urlSearch, weaponIds, abilityIds);
  if (fromUrl) return { source: 'url', state: customEditorState(fromUrl) };

  const fromLocal = savedSearch
    ? decodeLoadoutQuery(savedSearch, weaponIds, abilityIds)
    : undefined;
  if (fromLocal)
    return { source: 'local', state: customEditorState(fromLocal) };

  return {
    source: 'default',
    state: createDefaultEditorState(defaultWeaponId),
  };
}
