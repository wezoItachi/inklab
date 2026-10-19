import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateMainInkSaverProfile,
  getAbilityIntensity,
  getMainInkSaverAnalysis,
  getMainInkSaverMultiplier,
  representableAbilityPoints,
} from './main-ink-saver.ts';

void test('main ink saver follows the documented Splatoon 3 diminishing-return curve', () => {
  assert.equal(getAbilityIntensity(0), 0);
  assert.equal(getMainInkSaverMultiplier(0), 1);
  assert.ok(Math.abs(getMainInkSaverMultiplier(3) - 0.9565435) < 1e-9);
  assert.equal(getMainInkSaverMultiplier(57), 0.55);
  assert.equal(getMainInkSaverMultiplier(99), 0.55);
});

void test('breakpoints only use AP totals representable by three mains and nine subs', () => {
  assert.equal(representableAbilityPoints.includes(1), false);
  assert.equal(representableAbilityPoints.includes(3), true);
  assert.equal(representableAbilityPoints.includes(10), true);
  assert.equal(representableAbilityPoints.includes(57), true);
});

void test('profile separates mathematical ink savings from whole extra actions', () => {
  const beforeBreakpoint = calculateMainInkSaverProfile(
    'test',
    '测试动作',
    7,
    3,
  );
  assert.ok(beforeBreakpoint.adjustedInkCost < beforeBreakpoint.baseInkCost);
  assert.equal(beforeBreakpoint.baseActionsPerTank, 14);
  assert.equal(beforeBreakpoint.adjustedActionsPerTank, 14);
  assert.equal(beforeBreakpoint.extraActionsPerTank, 0);
  assert.equal(beforeBreakpoint.firstExtraActionAp, 6);

  const atBreakpoint = calculateMainInkSaverProfile('test', '测试动作', 7, 6);
  assert.equal(atBreakpoint.adjustedActionsPerTank, 15);
});

void test('N-ZAP89 uses its verified base shot cost in the main saver analysis', () => {
  const result = getMainInkSaverAnalysis('shooter-quickmiddle-cstm01', 3);
  const shot = result.profiles.find(
    ({ key }) => key === 'inkConsumptionPerShot',
  );
  assert.ok(shot);
  assert.equal(shot.baseInkCost, 0.8);
  assert.equal(shot.baseActionsPerTank, 125);
  assert.equal(shot.adjustedActionsPerTank, 130);
  assert.equal(shot.extraActionsPerTank, 5);
});

void test('unverified and per-frame rolling costs are not presented as full actions', () => {
  const result = getMainInkSaverAnalysis('roller-normalt', 10);
  assert.deepEqual(
    result.profiles.map(({ key }) => key),
    ['horizontalInkConsumptionPerSwing', 'verticalInkConsumptionPerSwing'],
  );
});
