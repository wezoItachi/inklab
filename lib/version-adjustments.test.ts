import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeSpecialCharge } from './special-gauge.ts';
import {
  getSpecialPointAdjustment,
  getSubVersionAdjustment,
  summarizeVersionAdjustments,
} from './version-adjustments.ts';

void test('Ver. 12.0.0 fixed-rule and special-point notes remain explicitly scoped', () => {
  assert.deepEqual(summarizeVersionAdjustments(), {
    subWeaponRules: 1,
    specialPointKits: 4,
  });
  assert.match(getSubVersionAdjustment('splash-wall')?.modelNote ?? '', /不随 AP 变化/);
  assert.equal(getSubVersionAdjustment('splat-bomb'), null);
});

void test('all official special-point changes match the current laboratory base value', () => {
  for (const weaponId of ['main-6012', 'main-72', 'main-210', 'main-3012']) {
    const note = getSpecialPointAdjustment(weaponId);
    assert.ok(note);
    assert.notEqual(note.previousPoints, note.currentPoints);
    assert.equal(analyzeSpecialCharge(weaponId, 0).basePoints, note.currentPoints);
  }
});
