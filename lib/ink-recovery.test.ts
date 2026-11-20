import assert from 'node:assert/strict';
import test from 'node:test';
import { getInkRecoveryFrames } from './ability-curves.ts';
import { getInkRecoveryAnalysis } from './ink-recovery.ts';
import { getWeapon } from './weapon-catalog.ts';

void test('ink recovery preserves both source-backed endpoint curves', () => {
  assert.equal(getInkRecoveryFrames(0, 'humanoid'), 600);
  assert.equal(getInkRecoveryFrames(57, 'humanoid'), 220);
  assert.equal(getInkRecoveryFrames(0, 'squid'), 180);
  assert.equal(getInkRecoveryFrames(57, 'squid'), 117);
});

void test('standard battle ink recovery reports both player forms', () => {
  const analysis = getInkRecoveryAnalysis(
    getWeapon('shooter-quickmiddle-cstm01'),
    10,
  );
  assert.equal(analysis.tankCapacity, 100);
  assert.ok(analysis.humanoid.adjustedFrames < 600);
  assert.ok(analysis.squid.adjustedFrames < 180);
  assert.equal(analysis.humanoid.adjustedSeconds, analysis.humanoid.adjustedFrames / 60);
  assert.equal(analysis.squid.adjustedSeconds, analysis.squid.adjustedFrames / 60);
});

void test('Splat Junior recovery time includes its 110 percent tank', () => {
  const analysis = getInkRecoveryAnalysis(getWeapon('main-10'), 0);
  assert.equal(analysis.tankCapacity, 110);
  assert.equal(analysis.humanoid.adjustedFrames, 660);
  assert.equal(analysis.squid.adjustedFrames, 198);
});
