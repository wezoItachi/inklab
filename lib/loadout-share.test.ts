import assert from 'node:assert/strict';
import test from 'node:test';
import { abilities } from './abilities.ts';
import { clearLoadoutSlot, clonePresetSlots } from './loadouts.ts';
import {
  buildLoadoutShareUrl,
  decodeLoadoutQuery,
  encodeLoadoutQuery,
  hasLoadoutShareQuery,
} from './loadout-share.ts';
import { weapons } from './weapons.ts';

const weaponIds = new Set(weapons.map(({ id }) => id));
const abilityIds = new Set(abilities.map(({ id }) => id));

void test('share query round-trips a complete loadout', () => {
  const state = { weaponId: weapons[2].id, slots: clonePresetSlots(1) };
  assert.deepEqual(
    decodeLoadoutQuery(encodeLoadoutQuery(state), weaponIds, abilityIds),
    state,
  );
});

void test('share query preserves an intentionally empty editable slot', () => {
  const state = {
    weaponId: weapons[2].id,
    slots: clearLoadoutSlot(clonePresetSlots(1), 5),
  };
  assert.deepEqual(
    decodeLoadoutQuery(encodeLoadoutQuery(state), weaponIds, abilityIds),
    state,
  );
});

void test('share query preserves the selected ability analysis', () => {
  const state = {
    weaponId: weapons[2].id,
    slots: clonePresetSlots(1),
    focusAbilityId: 'ism',
  };
  assert.deepEqual(
    decodeLoadoutQuery(encodeLoadoutQuery(state), weaponIds, abilityIds),
    state,
  );
});

void test('share URL explicitly lands in the laboratory', () => {
  const state = {
    weaponId: weapons[2].id,
    slots: clonePresetSlots(1),
    focusAbilityId: 'ism',
  };
  const url = buildLoadoutShareUrl('https://inklab.example', '/tool', state);
  assert.equal(url.startsWith('https://inklab.example/tool?'), true);
  assert.equal(url.endsWith('#lab'), true);
  assert.deepEqual(
    decodeLoadoutQuery(new URL(url).search, weaponIds, abilityIds),
    state,
  );
});

void test('an active shared address can preserve its current section hash', () => {
  const state = {
    weaponId: weapons[2].id,
    slots: clonePresetSlots(1),
  };
  const url = buildLoadoutShareUrl(
    'https://inklab.example',
    '/',
    state,
    '#wiki',
  );
  assert.equal(url.endsWith('#wiki'), true);
  assert.equal(hasLoadoutShareQuery(new URL(url).search), true);
  assert.equal(hasLoadoutShareQuery('?view=wiki'), false);
  assert.equal(hasLoadoutShareQuery('?w=shooter-precision'), false);
  assert.equal(hasLoadoutShareQuery('?g=ssu.10'), false);
});

void test('share query rejects unknown required ids and malformed AP totals', () => {
  const valid = encodeLoadoutQuery({
    weaponId: weapons[0].id,
    slots: clonePresetSlots(0),
  });
  assert.equal(
    decodeLoadoutQuery(
      valid.replace(weapons[0].id, 'unknown'),
      weaponIds,
      abilityIds,
    ),
    undefined,
  );
  assert.equal(
    decodeLoadoutQuery(valid.replace('.10', '.3'), weaponIds, abilityIds),
    undefined,
  );
  assert.equal(
    decodeLoadoutQuery(valid.replace('ssu', 'unknown'), weaponIds, abilityIds),
    undefined,
  );
});

void test('share query ignores a stale optional analysis id', () => {
  const state = {
    weaponId: weapons[0].id,
    slots: clonePresetSlots(0),
  };
  const valid = encodeLoadoutQuery(state);
  assert.deepEqual(
    decodeLoadoutQuery(`${valid}&a=removed-ability`, weaponIds, abilityIds),
    state,
  );
});

void test('legacy Splash-o-matic ids migrate without breaking saved builds', () => {
  const current = { weaponId: 'shooter-precision', slots: clonePresetSlots(0) };
  const legacyQuery = encodeLoadoutQuery(current).replace(
    'shooter-precision',
    'shooter-short-cstm11',
  );
  assert.deepEqual(
    decodeLoadoutQuery(legacyQuery, weaponIds, abilityIds),
    current,
  );
});
