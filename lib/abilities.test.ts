import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { abilities, abilityAssetCodes, abilityGroups, getAbility, getAbilityAssetUrl } from './abilities.ts';

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

