import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAbilityCurveDefinition,
  getAbilityCurveSample,
  getSuperJumpFrames,
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

void test('sub ink saver exposes its standard curve and weapon-specific threshold scope', () => {
  const definition = getAbilityCurveDefinition('iss');
  assert.equal(definition.status, 'verified');
  assert.equal(definition.minimumEffectiveAp, 3);
  assert.equal(definition.thresholdScope, 'weapon-specific');
  assert.equal(getAbilityCurveSample('iss', 0)?.benefitPercent, 0);
  assert.ok(
    Math.abs((getAbilityCurveSample('iss', 57)?.benefitPercent ?? 0) - 35) <
      1e-9,
  );
});

void test('ink recovery exposes the verified battle squid-form curve', () => {
  const definition = getAbilityCurveDefinition('iru');
  assert.equal(definition.status, 'verified');
  assert.equal(definition.minimumEffectiveAp, 3);
  assert.equal(definition.thresholdScope, 'universal');
  assert.equal(getAbilityCurveSample('iru', 0)?.benefitPercent, 0);
  assert.ok(
    Math.abs((getAbilityCurveSample('iru', 57)?.benefitPercent ?? 0) - 35) <
      1e-9,
  );
});

void test('quick super jump exposes the verified charge-time curve', () => {
  const definition = getAbilityCurveDefinition('qsj');
  assert.equal(definition.status, 'verified');
  assert.equal(definition.minimumEffectiveAp, 3);
  assert.equal(definition.thresholdScope, 'universal');
  assert.equal(getAbilityCurveSample('qsj', 0)?.benefitPercent, 0);
  assert.equal(getAbilityCurveSample('qsj', 57)?.benefitPercent, 75);
});

void test('quick super jump keeps raw and displayed move-frame boundaries distinct', () => {
  assert.ok(getSuperJumpFrames(3, 'move') < 138);
  assert.equal(Math.ceil(getSuperJumpFrames(3, 'move') - 1e-9), 138);
  assert.equal(Math.ceil(getSuperJumpFrames(9, 'move') - 1e-9), 137);
});

void test('swim and run speed expose verified weight-aware curve definitions', () => {
  for (const abilityId of ['ssu', 'rsu']) {
    const definition = getAbilityCurveDefinition(abilityId);
    assert.equal(definition.status, 'verified');
    assert.equal(definition.minimumEffectiveAp, 3);
    assert.equal(definition.thresholdScope, 'weapon-specific');
    assert.ok((getAbilityCurveSample(abilityId, 3)?.benefitPercent ?? 0) > 0);
  }
});

void test('action intensify exposes the verified squid-surge curve', () => {
  const definition = getAbilityCurveDefinition('ia');
  assert.equal(definition.status, 'verified');
  assert.equal(definition.minimumEffectiveAp, 3);
  assert.equal(definition.thresholdScope, 'weapon-specific');
  assert.equal(getAbilityCurveSample('ia', 0)?.benefitPercent, 0);
  assert.ok((getAbilityCurveSample('ia', 57)?.benefitPercent ?? 0) > 88);
});

void test('enemy ink resistance exposes the verified movement curve', () => {
  const definition = getAbilityCurveDefinition('inkres');
  assert.equal(definition.status, 'verified');
  assert.equal(definition.minimumEffectiveAp, 3);
  assert.equal(definition.thresholdScope, 'universal');
  assert.equal(getAbilityCurveSample('inkres', 0)?.benefitPercent, 0);
  assert.ok(
    Math.abs((getAbilityCurveSample('inkres', 57)?.benefitPercent ?? 0) - 220) <
      1e-9,
  );
});

void test('special gauge abilities expose distinct verified curves', () => {
  const charge = getAbilityCurveDefinition('scu');
  const saver = getAbilityCurveDefinition('ss');
  assert.equal(charge.status, 'verified');
  assert.equal(charge.thresholdScope, 'weapon-specific');
  assert.equal(getAbilityCurveSample('scu', 0)?.benefitPercent, 0);
  assert.equal(getAbilityCurveSample('scu', 57)?.benefitPercent, 23);
  assert.equal(saver.status, 'verified');
  assert.equal(saver.thresholdScope, 'universal');
  assert.equal(getAbilityCurveSample('ss', 0)?.benefitPercent, 0);
  assert.equal(getAbilityCurveSample('ss', 57)?.benefitPercent, 100);
});

void test('quick respawn exposes only its conditional standard curve', () => {
  const definition = getAbilityCurveDefinition('qr');
  assert.equal(definition.status, 'verified');
  assert.equal(definition.thresholdScope, 'universal');
  assert.equal(getAbilityCurveSample('qr', 0)?.benefitPercent, 0);
  assert.ok(
    Math.abs(
      (getAbilityCurveSample('qr', 57)?.benefitPercent ?? 0) - 53.3333333333,
    ) < 1e-9,
  );
});

void test('unverified abilities never expose invented curve values', () => {
  const definition = getAbilityCurveDefinition('subp');
  assert.equal(definition.status, 'pending');
  assert.equal(definition.calculate, null);
  assert.equal(getAbilityCurveSample('subp', 10), null);
  assert.equal(hasVerifiedAbilityCurve('subp'), false);
  assert.equal(hasMinimumEffectiveAbilityValue('subp'), false);
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
