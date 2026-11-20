import assert from 'node:assert/strict';
import test from 'node:test';
import { buildUniversalGearPlan } from './universal-planner.ts';
import { getWeapon } from './weapon-catalog.ts';

const shooterSet = [
  getWeapon('shooter-quickmiddle-cstm01'),
  getWeapon('shooter-normalt'),
  getWeapon('main-11'),
];

void test('planner derives a shared gear structure from real system suggestions', () => {
  const plan = buildUniversalGearPlan(shooterSet, 'shared-slots');
  assert.equal(plan.selectedCount, 3);
  assert.ok(plan.candidate);
  assert.equal(plan.candidate.commonSlotCount, 4);
  assert.equal(plan.candidate.compatibilityPercent, 100);
  assert.equal(plan.weaponRequirements.length, 3);
});

void test('planner exposes main-ability variants instead of inventing one gear item', () => {
  const plan = buildUniversalGearPlan(
    [getWeapon('shooter-normalt'), getWeapon('roller-normalt')],
    'shared-slots',
  );
  assert.ok(plan.candidate);
  assert.ok(plan.candidate.mainAbilityIds.length >= 1);
  assert.equal(
    plan.candidate.commonMainAbilityId === null,
    plan.candidate.mainAbilityIds.length > 1,
  );
});

void test('planner requires at least two weapons for a comparison', () => {
  const plan = buildUniversalGearPlan(
    [getWeapon('shooter-normalt')],
    'shared-slots',
  );
  assert.equal(plan.candidate, null);
  assert.deepEqual(plan.candidates, []);
});
