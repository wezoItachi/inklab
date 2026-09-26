import assert from 'node:assert/strict';
import test from 'node:test';
import { abilities } from './abilities.ts';
import {
  createDefaultEditorState,
  resolveInitialEditorState,
} from './editor-state.ts';
import { encodeLoadoutQuery } from './loadout-share.ts';
import { clonePresetSlots } from './loadouts.ts';
import { weapons } from './weapons.ts';

const weaponIds = new Set(weapons.map(({ id }) => id));
const abilityIds = new Set(abilities.map(({ id }) => id));

void test('URL state wins over a different locally saved build', () => {
  const urlLoadout = { weaponId: weapons[1].id, slots: clonePresetSlots(1) };
  const localLoadout = { weaponId: weapons[2].id, slots: clonePresetSlots(2) };
  const restored = resolveInitialEditorState({
    urlSearch: encodeLoadoutQuery(urlLoadout),
    savedSearch: encodeLoadoutQuery(localLoadout),
    defaultWeaponId: weapons[0].id,
    weaponIds,
    abilityIds,
  });

  assert.equal(restored.source, 'url');
  assert.equal(restored.state.weaponId, urlLoadout.weaponId);
  assert.deepEqual(restored.state.slots, urlLoadout.slots);
});

void test('local state restores when the URL has no valid build', () => {
  const localLoadout = { weaponId: weapons[3].id, slots: clonePresetSlots(2) };
  const restored = resolveInitialEditorState({
    urlSearch: '?w=unknown&g=invalid',
    savedSearch: encodeLoadoutQuery(localLoadout),
    defaultWeaponId: weapons[0].id,
    weaponIds,
    abilityIds,
  });

  assert.equal(restored.source, 'local');
  assert.equal(restored.state.weaponId, localLoadout.weaponId);
  assert.equal(restored.state.activePreset, -1);
  assert.equal(restored.state.focus, localLoadout.slots[0][0]);
  assert.equal(restored.state.selectedSlot, 0);
});

void test('invalid persisted state falls back to the first preset', () => {
  const restored = resolveInitialEditorState({
    urlSearch: '',
    savedSearch: 'w=missing&g=broken',
    defaultWeaponId: weapons[0].id,
    weaponIds,
    abilityIds,
  });

  assert.equal(restored.source, 'default');
  assert.deepEqual(restored.state, createDefaultEditorState(weapons[0].id));
});

void test('a changed weapon and custom slots survive a persistence round trip', () => {
  const slots = clonePresetSlots(0);
  slots[0] = ['iss', 10];
  const changed = { weaponId: weapons[5].id, slots };
  const restored = resolveInitialEditorState({
    urlSearch: '',
    savedSearch: encodeLoadoutQuery(changed),
    defaultWeaponId: weapons[0].id,
    weaponIds,
    abilityIds,
  });

  assert.equal(restored.state.weaponId, weapons[5].id);
  assert.deepEqual(restored.state.slots, slots);
  assert.equal(restored.state.activePreset, -1);
  assert.equal(restored.state.focus, 'iss');
});
