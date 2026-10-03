import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DATA_VERSION,
  DATASET_STATUS,
  getMainWeaponParameters,
  getWeapon,
  summarizeMainWeaponParameters,
  weapons,
} from './weapons.ts';

void test('representative 11.3 weapon set covers the planned families', () => {
  assert.equal(DATA_VERSION, '11.3.0');
  assert.equal(DATASET_STATUS, 'representative-test-set');
  assert.equal(weapons.length, 6);
  assert.deepEqual(
    new Set(weapons.map((weapon) => weapon.family)),
    new Set(['射击枪', '蓄力枪', '滚筒', '加特林']),
  );
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
  assert.equal(getMainWeaponParameters('missing').weaponId, weapons[0].id);
});

void test('every representative weapon exposes its parameter audit progress', () => {
  for (const weapon of weapons) {
    const parameters = getMainWeaponParameters(weapon.id);
    const summary = summarizeMainWeaponParameters(weapon.id);
    assert.equal(parameters.weaponId, weapon.id);
    assert.equal(summary.total, parameters.parameters.length);
    if (weapon.id === 'shooter-quickmiddle-cstm01') {
      assert.deepEqual(summary, { total: 7, verified: 6, pending: 1, demo: 0 });
    } else if (weapon.id === 'shooter-normalt') {
      assert.deepEqual(summary, { total: 7, verified: 5, pending: 2, demo: 0 });
    } else {
      assert.deepEqual(summary, {
        total: parameters.parameters.length,
        verified: 0,
        pending: parameters.parameters.length,
        demo: 0,
      });
    }
  }
});
