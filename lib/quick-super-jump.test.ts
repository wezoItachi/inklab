import assert from 'node:assert/strict';
import test from 'node:test';
import { getSuperJumpFrames } from './ability-curves.ts';
import { getQuickSuperJumpAnalysis } from './quick-super-jump.ts';

void test('quick super jump preserves both source-backed endpoint curves', () => {
  assert.equal(getSuperJumpFrames(0, 'charge'), 80);
  assert.equal(getSuperJumpFrames(57, 'charge'), 20);
  assert.equal(getSuperJumpFrames(0, 'move'), 138);
  assert.equal(getSuperJumpFrames(57, 'move'), 96.6);
});

void test('quick super jump keeps charge and movement phases separate', () => {
  const analysis = getQuickSuperJumpAnalysis(3);
  assert.equal(analysis.baseTotalFrames, 218);
  assert.equal(analysis.totalFrames, analysis.chargeFrames + analysis.moveFrames);
  assert.ok(analysis.savedFrames > 0);
  assert.equal(analysis.hasStealthJump, false);
});

void test('stealth jump adds only its documented maximum penalty', () => {
  const withoutStealth = getQuickSuperJumpAnalysis(10, false);
  const withStealth = getQuickSuperJumpAnalysis(10, true);
  assert.equal(withStealth.stealthJumpMaxExtraFrames, 60);
  assert.equal(
    withStealth.displayedMaxTotalFrames,
    withoutStealth.totalFrames + 60,
  );
  assert.equal(withStealth.totalFrames, withoutStealth.totalFrames);
});
