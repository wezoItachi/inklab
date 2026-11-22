import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeEnemyInkResistance,
  getEnemyInkRunSpeed,
} from './enemy-ink-resistance.ts';

void test('enemy ink resistance preserves all source-backed endpoints', () => {
  const base = analyzeEnemyInkResistance(0);
  const maximum = analyzeEnemyInkResistance(57);
  assert.equal(base.runSpeed, 0.24);
  assert.equal(maximum.runSpeed, 0.768);
  assert.equal(base.damageLimit, 40);
  assert.equal(maximum.damageLimit, 20);
  assert.equal(base.damagePerSecond, 18);
  assert.equal(maximum.damagePerSecond, 9);
  assert.equal(base.graceFrames, 0);
  assert.equal(maximum.graceFrames, 39);
});

void test('enemy ink resistance uses the shared diminishing-return interpolation', () => {
  assert.ok(getEnemyInkRunSpeed(3) > getEnemyInkRunSpeed(0));
  assert.ok(getEnemyInkRunSpeed(57) > getEnemyInkRunSpeed(30));
  assert.ok(
    getEnemyInkRunSpeed(3) - getEnemyInkRunSpeed(0) >
      getEnemyInkRunSpeed(57) - getEnemyInkRunSpeed(54),
  );
});
