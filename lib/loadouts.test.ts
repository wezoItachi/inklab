import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateAbilityTotals, clearLoadout, clearLoadoutSlot, clonePresetSlots, getNextLoadoutSlotIndex, presets, replaceLoadoutSlot, setAbilityAp, totalAp } from './loadouts.ts';

void test('every preset is a complete 57 AP loadout', () => {
  presets.forEach((_, index) => {
    const slots = clonePresetSlots(index);
    assert.equal(slots.length, 12);
    assert.equal(totalAp(slots), 57);
    assert.equal(slots.filter(([, ap]) => ap === 10).length, 3);
    assert.equal(slots.filter(([, ap]) => ap === 3).length, 9);
  });
});

void test('ability totals are aggregated and sorted', () => {
  const totals = calculateAbilityTotals(clonePresetSlots(0));
  assert.equal(totals[0].id, 'ssu');
  assert.equal(totals[0].ap, 16);
});

void test('AP edits hit exact representable totals without changing 57 AP', () => {
  for (const target of [3, 6, 10, 12, 13, 30]) {
    const changed = setAbilityAp(clonePresetSlots(1), 'iss', target);
    assert.equal(totalAp(changed), 57);
    assert.equal(calculateAbilityTotals(changed).find(({ id }) => id === 'iss')?.ap, target);
  }
});

void test('invalid AP totals fail instead of silently rounding', () => {
  assert.throws(() => setAbilityAp(clonePresetSlots(0), 'iss', 1), RangeError);
  assert.throws(() => setAbilityAp(clonePresetSlots(0), 'iss', 58), RangeError);
});

void test('slot replacement preserves slot AP and the complete loadout', () => {
  const original = clonePresetSlots(0);
  const changed = replaceLoadoutSlot(original, 5, 'iss');
  assert.deepEqual(changed[5], ['iss', 3]);
  assert.equal(totalAp(changed), 57);
  assert.notDeepEqual(changed, original);
  assert.throws(() => replaceLoadoutSlot(original, 12, 'iss'), RangeError);
});

void test('clearing a slot removes its ability and AP from the editable loadout', () => {
  const original = clonePresetSlots(0);
  const changed = clearLoadoutSlot(original, 1);
  assert.deepEqual(changed[1], [null, 3]);
  assert.equal(totalAp(changed), 54);
  assert.equal(calculateAbilityTotals(changed).find(({ id }) => id === 'ssu')?.ap, 13);
  assert.throws(() => clearLoadoutSlot(original, -1), RangeError);
});

void test('an empty editor keeps its 12-slot structure and sequential cursor', () => {
  const empty = clearLoadout(clonePresetSlots(0));
  assert.equal(empty.length, 12);
  assert.equal(empty.every(([id]) => id === null), true);
  assert.equal(totalAp(empty), 0);
  assert.equal(getNextLoadoutSlotIndex(0), 1);
  assert.equal(getNextLoadoutSlotIndex(11), 11);
});
