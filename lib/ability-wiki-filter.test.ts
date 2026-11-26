import assert from 'node:assert/strict';
import test from 'node:test';
import { filterAbilitiesForWiki } from './ability-wiki-filter.ts';

void test('weapon-specific filter separates per-weapon models from pending curves', () => {
  assert.deepEqual(
    filterAbilitiesForWiki('', ['武器专属']).map(({ id }) => id),
    ['subp', 'spu'],
  );
  assert.deepEqual(
    filterAbilitiesForWiki('', ['副武器', '武器专属']).map(({ id }) => id),
    ['subp'],
  );
});

void test('critical-threshold filter remains limited to verified shared curves', () => {
  const ids = filterAbilitiesForWiki('', ['关键临界点']).map(({ id }) => id);
  assert.ok(ids.includes('ism'));
  assert.equal(ids.includes('subp'), false);
  assert.equal(ids.includes('spu'), false);
});

void test('wiki search keeps community aliases', () => {
  assert.equal(filterAbilitiesForWiki('隐游', [])[0]?.id, 'ninja');
  assert.equal(filterAbilitiesForWiki('副强', [])[0]?.id, 'subp');
});
