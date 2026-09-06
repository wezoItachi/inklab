import assert from 'node:assert/strict';
import test from 'node:test';
import { angleDifferenceDegrees, consecutiveUsesFromFullTank, isRollJumpTiming, isRollReverse, meetsConsecutiveUseThreshold } from './analysis.ts';

void test('consecutive-use thresholds include the exact boundary', () => {
  assert.equal(consecutiveUsesFromFullTank(50), 2);
  assert.equal(meetsConsecutiveUseThreshold(50, 2), true);
  assert.equal(meetsConsecutiveUseThreshold(50.01, 2), false);
  assert.equal(consecutiveUsesFromFullTank(40), 2);
});

void test('motion angle handles opposite and perpendicular inputs', () => {
  assert.equal(Math.round(angleDifferenceDegrees({ x: 1, y: 0 }, { x: -1, y: 0 })), 180);
  assert.equal(Math.round(angleDifferenceDegrees({ x: 1, y: 0 }, { x: 0, y: 1 })), 90);
  assert.equal(angleDifferenceDegrees({ x: 0, y: 0 }, { x: 1, y: 0 }), 0);
});

void test('roll timing uses documented inclusive and exclusive boundaries', () => {
  assert.equal(isRollReverse(120, 899), true);
  assert.equal(isRollReverse(119.9, 899), false);
  assert.equal(isRollReverse(180, 900), false);
  assert.equal(isRollJumpTiming(350), true);
  assert.equal(isRollJumpTiming(351), false);
  assert.equal(isRollJumpTiming(0), false);
});

