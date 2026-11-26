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
  for (const requirement of plan.weaponRequirements) {
    assert.equal(
      requirement.allocation.reduce((total, item) => total + item.ap, 0),
      57,
    );
    assert.equal(
      new Set(requirement.allocation.map(({ abilityId }) => abilityId)).size,
      requirement.allocation.length,
    );
  }
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

void test('planner can inspect a non-recommended gear part without changing its data', () => {
  const automatic = buildUniversalGearPlan(shooterSet, 'shared-slots');
  const selectedPartId = automatic.candidates.find(
    ({ partId }) => partId !== automatic.candidate?.partId,
  )!.partId;
  const inspected = buildUniversalGearPlan(
    shooterSet,
    'shared-slots',
    selectedPartId,
  );
  assert.equal(inspected.candidate?.partId, selectedPartId);
  assert.deepEqual(inspected.candidates, automatic.candidates);
  assert.equal(inspected.weaponRequirements.length, shooterSet.length);
});
