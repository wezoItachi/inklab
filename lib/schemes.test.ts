import assert from 'node:assert/strict';
import test from 'node:test';
import { abilities } from './abilities.ts';
import { totalAp } from './loadouts.ts';
import { cloneSchemeSlots, exampleSchemes, gameModes, schemeMatchesFilters, schemeMatchesMode, schemeMatchesQuery } from './schemes.ts';
import { weapons } from './weapons.ts';

void test('example schemes are complete editable 57 AP loadouts', () => {
  const abilityIds = new Set(abilities.map(({ id }) => id));
  const weaponIds = new Set(weapons.map(({ id }) => id));
  const modeIds = new Set(gameModes.map(({ id }) => id));

  assert.equal(new Set(exampleSchemes.map(({ id }) => id)).size, exampleSchemes.length);
  for (const scheme of exampleSchemes) {
    assert.equal(weaponIds.has(scheme.weaponId), true);
    assert.equal(scheme.modes.length > 0, true);
    assert.equal(new Set(scheme.modes).size, scheme.modes.length);
    assert.equal(scheme.modes.every(mode => modeIds.has(mode)), true);
    assert.equal(scheme.slots.length, 12);
    assert.equal(totalAp(scheme.slots), 57);
    assert.equal(scheme.slots.filter(([, ap]) => ap === 10).length, 3);
    assert.equal(scheme.slots.filter(([, ap]) => ap === 3).length, 9);
    assert.equal(scheme.slots.every(([abilityId]) => abilityIds.has(abilityId)), true);
  }
});

void test('faceted scheme filters combine groups with AND and choices inside a group with OR',()=>{
  const filters={tags:['副武压制'],modes:['zones'] as const,weaponIds:['shooter-quickmiddle-cstm01']};
  assert.equal(schemeMatchesFilters(exampleSchemes[0],filters),true);
  assert.equal(schemeMatchesFilters(exampleSchemes[1],filters),false);
  assert.equal(schemeMatchesFilters(exampleSchemes[0],{...filters,modes:['turf']}),false);
  assert.equal(schemeMatchesFilters(exampleSchemes[0],{...filters,tags:['不存在','副武压制']}),true);
});

void test('scheme clones do not mutate the library source', () => {
  const source = exampleSchemes[0];
  const clone = cloneSchemeSlots(source);
  clone[0] = ['qsj', 10];
  assert.notDeepEqual(clone, source.slots);
  assert.equal(source.slots[0][0], 'iss');
});

void test('scheme search covers weapon names, titles, tags, and notes', () => {
  const scheme = exampleSchemes[2];
  assert.equal(schemeMatchesQuery(scheme, '桶装旋转枪', '桶装'), true);
  assert.equal(schemeMatchesQuery(scheme, '桶装旋转枪', '大招循环'), true);
  assert.equal(schemeMatchesQuery(scheme, '桶装旋转枪', '真格塔楼'), true);
  assert.equal(schemeMatchesQuery(scheme, '桶装旋转枪', '40 发'), true);
  assert.equal(schemeMatchesQuery(scheme, '桶装旋转枪', '蓄力狙击枪'), false);
});

void test('community schemes can be filtered by all five battle modes', () => {
  assert.equal(gameModes.length, 5);
  assert.equal(schemeMatchesMode(exampleSchemes[0], 'all'), true);
  assert.equal(schemeMatchesMode(exampleSchemes[0], 'zones'), true);
  assert.equal(schemeMatchesMode(exampleSchemes[0], 'turf'), false);
  assert.equal(schemeMatchesMode(exampleSchemes[0], 'tower'), true);
});
