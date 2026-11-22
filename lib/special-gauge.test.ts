import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeSpecialCharge,
  analyzeSpecialSaver,
  getSpecialChargeMultiplier,
  getSpecialLossPercent,
  specialGaugeData,
} from './special-gauge.ts';
import { weapons } from './weapon-catalog.ts';

void test('special gauge database covers every battle kit', () => {
  assert.equal(specialGaugeData.records.length, weapons.length);
  assert.deepEqual(specialGaugeData.pointDistribution, {
    160: 1,
    170: 9,
    180: 25,
    190: 61,
    200: 47,
    210: 27,
    220: 4,
  });
});

void test('special charge up preserves its source endpoints', () => {
  assert.equal(getSpecialChargeMultiplier(0), 1);
  assert.equal(getSpecialChargeMultiplier(57), 1.3);
  const analysis = analyzeSpecialCharge('shooter-normalt', 57);
  assert.equal(analysis.basePoints, 200);
  assert.equal(analysis.requiredPoints, 154);
  assert.equal(analysis.savedPoints, 46);
});

void test('special saver preserves standard and respawn-punisher boundaries', () => {
  assert.equal(getSpecialLossPercent(0), 50);
  assert.equal(getSpecialLossPercent(57), 0);
  const standard = analyzeSpecialSaver(0);
  assert.equal(standard.standardRetainedPercent, 50);
  assert.equal(standard.splattedByRespawnPunisherLossPercent, 65);
  const ownPunisher = analyzeSpecialSaver(0, { hasRespawnPunisher: true });
  assert.equal(ownPunisher.currentLossPercent, 72.5);
  assert.equal(ownPunisher.splattedByRespawnPunisherLossPercent, 87.5);
});
