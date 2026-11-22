import assert from 'node:assert/strict';
import test from 'node:test';
import {
  actionIntensifyData,
  analyzeActionIntensify,
  getSquidSurgeChargeFrames,
} from './action-intensify.ts';
import { weapons } from './weapon-catalog.ts';

void test('action intensify database covers the battle catalog', () => {
  assert.equal(actionIntensifyData.records.length, weapons.length);
  assert.deepEqual(actionIntensifyData.counts, {
    weaponsWithJumpSpreadEffect: 65,
    weaponOverrides: 17,
  });
});

void test('squid surge preserves its source-backed endpoints', () => {
  assert.equal(getSquidSurgeChargeFrames(0), 45);
  assert.equal(getSquidSurgeChargeFrames(57), 5);
  assert.equal(
    analyzeActionIntensify('shooter-normalt', 0)
      .displayedSquidSurgeChargeFrames,
    45,
  );
  assert.equal(
    analyzeActionIntensify('shooter-normalt', 57)
      .displayedSquidSurgeChargeFrames,
    5,
  );
});

void test('jump spread reduces only the extra spread above the ground value', () => {
  const base = analyzeActionIntensify('shooter-normalt', 0).jumpSpread;
  const maximum = analyzeActionIntensify('shooter-normalt', 57).jumpSpread;
  assert.equal(base?.currentDegrees, base?.baseJumpDegrees);
  assert.equal(maximum?.currentDegrees, maximum?.groundDegrees);
  assert.equal(maximum?.reductionPercent, 100);
});

void test('weapon-specific spread midpoint stays explicit', () => {
  const record = actionIntensifyData.records.find(
    ({ spread }) => spread?.reductionSourceMode === 'weapon-override',
  );
  assert.ok(record);
  assert.equal(record.spread?.reductionSourceMode, 'weapon-override');
  assert.notEqual(record.spread?.reduction.mid, 0.75);
});

void test('weapons without distinct jump spread keep that result absent', () => {
  const record = actionIntensifyData.records.find(
    ({ spread }) => spread === null,
  );
  assert.ok(record);
  assert.equal(analyzeActionIntensify(record.weaponId, 10).jumpSpread, null);
});
