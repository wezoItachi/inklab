import assert from 'node:assert/strict';
import test from 'node:test';
import {abilities} from './abilities.ts';
import {clonePresetSlots} from './loadouts.ts';
import {decodeLoadoutQuery, encodeLoadoutQuery} from './loadout-share.ts';
import {weapons} from './weapons.ts';

const weaponIds = new Set(weapons.map(({id}) => id));
const abilityIds = new Set(abilities.map(({id}) => id));

void test('share query round-trips a complete loadout', () => {
  const state = {weaponId: weapons[2].id, slots: clonePresetSlots(1)};
  assert.deepEqual(decodeLoadoutQuery(encodeLoadoutQuery(state), weaponIds, abilityIds), state);
});

void test('share query rejects unknown ids and malformed AP totals', () => {
  const valid = encodeLoadoutQuery({weaponId: weapons[0].id, slots: clonePresetSlots(0)});
  assert.equal(decodeLoadoutQuery(valid.replace(weapons[0].id, 'unknown'), weaponIds, abilityIds), undefined);
  assert.equal(decodeLoadoutQuery(valid.replace('.10', '.3'), weaponIds, abilityIds), undefined);
  assert.equal(decodeLoadoutQuery(valid.replace('ssu', 'unknown'), weaponIds, abilityIds), undefined);
});
