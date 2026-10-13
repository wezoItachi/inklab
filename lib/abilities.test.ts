import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { abilities, abilityAssetCodes, abilityGroups, canPlaceAbilityInSlot, filterAbilitiesForSlot, filterExclusiveAbilitiesForPart, getAbility, getAbilityAssetUrl, getAbilityPartForSlot, toggleSelectedPart } from './abilities.ts';

void test('ability catalog contains 26 unique ids with known groups', () => {
  assert.equal(abilities.length, 26);
  assert.equal(new Set(abilities.map(({ id }) => id)).size, abilities.length);
  abilities.forEach(({ group }) => assert.ok(abilityGroups.includes(group as typeof abilityGroups[number])));
});

void test('every ability has a local icon asset', () => {
  abilities.forEach(({ id }) => {
    const code = abilityAssetCodes[id];
    assert.ok(code, `missing asset code for ${id}`);
    assert.equal(existsSync(new URL(`../public/assets/abilities/${code}.avif`, import.meta.url)), true, `missing icon for ${id}`);
  });
});

void test('ability lookup and asset URLs fail safely', () => {
  assert.equal(getAbility('iss')?.short, '副省');
  assert.equal(getAbility('missing'), undefined);
  assert.equal(getAbilityAssetUrl('iss'), '/assets/abilities/ISS.avif');
  assert.equal(getAbilityAssetUrl('missing'), undefined);
});

void test('gear parts expose only their own exclusive main abilities', () => {
  assert.equal(getAbilityPartForSlot(0).id, 'head');
  assert.equal(getAbilityPartForSlot(5).id, 'clothes');
  assert.equal(getAbilityPartForSlot(11).id, 'shoes');

  const headExclusive = filterAbilitiesForSlot({ slotIndex: 0, filterGroup: '限定' });
  assert.ok(headExclusive.length > 0);
  assert.ok(headExclusive.every(({ group }) => group === '头部限定'));

  const clothesExclusive = filterAbilitiesForSlot({ slotIndex: 4, filterGroup: '限定' });
  assert.ok(clothesExclusive.every(({ group }) => group === '服装限定'));

  const shoesExclusive = filterAbilitiesForSlot({ slotIndex: 8, filterGroup: '限定' });
  assert.ok(shoesExclusive.every(({ group }) => group === '鞋子限定'));
});

void test('exclusive abilities never appear for an additional ability slot', () => {
  const visible = filterAbilitiesForSlot({ slotIndex: 1, filterGroup: '全部' });
  assert.equal(visible.some(({ group }) => group.endsWith('限定')), false);
  assert.deepEqual(filterAbilitiesForSlot({ slotIndex: 1, filterGroup: '限定' }), []);
});

void test('each gear part exposes its exclusive abilities in a separate shelf', () => {
  const head = filterExclusiveAbilitiesForPart({ partId: 'head', filterGroup: '全部' });
  assert.ok(head.length > 0);
  assert.ok(head.every(({ group }) => group === '头部限定'));
  assert.deepEqual(filterExclusiveAbilitiesForPart({ partId: 'head', filterGroup: '机动' }), []);
  assert.deepEqual(
    filterExclusiveAbilitiesForPart({ partId: 'shoes', filterGroup: '限定' }).map(({ id }) => id),
    ['stealth', 'object', 'drop'],
  );
});

void test('drag placement enforces exclusive ability gear rules', () => {
  assert.equal(canPlaceAbilityInSlot('ssu', 7), true);
  assert.equal(canPlaceAbilityInSlot('og', 0), true);
  assert.equal(canPlaceAbilityInSlot('og', 1), false);
  assert.equal(canPlaceAbilityInSlot('og', 4), false);
  assert.equal(canPlaceAbilityInSlot('ninja', 4), true);
  assert.equal(canPlaceAbilityInSlot('stealth', 8), true);
  assert.equal(canPlaceAbilityInSlot('unknown', 0), false);
});

void test('clicking the active gear part again clears the whole part selection', () => {
  assert.equal(toggleSelectedPart(2, 0), null);
  assert.equal(toggleSelectedPart(4, 0), 0);
  assert.equal(toggleSelectedPart(null, 8), 8);
});

