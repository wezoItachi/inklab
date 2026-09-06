import assert from 'node:assert/strict';
import test from 'node:test';
import {DATA_VERSION, DATASET_STATUS, getWeapon, weapons} from './weapons.ts';

void test('representative 11.3 weapon set covers the planned families', () => {
  assert.equal(DATA_VERSION, '11.3.0');
  assert.equal(DATASET_STATUS, 'representative-test-set');
  assert.equal(weapons.length, 6);
  assert.deepEqual(new Set(weapons.map((weapon) => weapon.family)), new Set(['射击枪', '蓄力枪', '滚筒', '加特林']));
});

void test('every weapon drives a complete analysis context', () => {
  for (const weapon of weapons) {
    assert.ok(weapon.id);
    assert.ok(weapon.name);
    assert.ok(weapon.sub.name);
    assert.ok(weapon.special);
    assert.ok(weapon.sub.baseInkCost > 0);
    assert.ok(weapon.sub.subPowerEffect);
    assert.ok(weapon.sub.subPowerDoesNotChange.length >= 3);
    assert.equal(weapon.verification, 'kit-verified');
    assert.ok(weapon.sourceId);
    assert.match(weapon.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});

void test('unknown ids safely fall back to the first supported weapon', () => {
  assert.equal(getWeapon('missing').id, weapons[0].id);
});
