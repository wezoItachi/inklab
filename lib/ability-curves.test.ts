import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAbilityCurveDefinition,
  getAbilityCurveSample,
  hasMinimumEffectiveAbilityValue,
  hasVerifiedAbilityCurve,
  representableAbilityPoints,
} from './ability-curves.ts';

void test('main ink saver is exposed through the shared verified curve protocol', () => {
  const definition = getAbilityCurveDefinition('ism');
  assert.equal(definition.status, 'verified');
  assert.equal(definition.minimumEffectiveAp, 3);
  assert.equal(definition.thresholdScope, 'weapon-specific');

  assert.equal(getAbilityCurveSample('ism', 0)?.benefitPercent, 0);
  assert.ok(
    Math.abs((getAbilityCurveSample('ism', 3)?.benefitPercent ?? 0) - 4.34565) <
      1e-9,
  );
  assert.ok(
    Math.abs((getAbilityCurveSample('ism', 57)?.benefitPercent ?? 0) - 45) <
      1e-9,
  );
});

void test('unverified abilities never expose invented curve values', () => {
  const definition = getAbilityCurveDefinition('iru');
  assert.equal(definition.status, 'pending');
  assert.equal(definition.calculate, null);
  assert.equal(getAbilityCurveSample('iru', 10), null);
  assert.equal(hasVerifiedAbilityCurve('iru'), false);
  assert.equal(hasMinimumEffectiveAbilityValue('iru'), false);
});

void test('fixed gear-exclusive abilities are not misreported as pending AP curves', () => {
  for (const abilityId of ['og', 'ninja', 'stealth']) {
    const definition = getAbilityCurveDefinition(abilityId);
    assert.equal(definition.status, 'not-applicable');
    assert.equal(definition.thresholdScope, 'not-applicable');
    assert.equal(getAbilityCurveSample(abilityId, 10), null);
    assert.equal(hasMinimumEffectiveAbilityValue(abilityId), false);
  }
});

void test('shared AP points only include equipable main and sub combinations', () => {
  assert.equal(representableAbilityPoints.includes(1), false);
  assert.equal(representableAbilityPoints.includes(3), true);
  assert.equal(representableAbilityPoints.includes(10), true);
  assert.equal(representableAbilityPoints.at(-1), 57);
});
