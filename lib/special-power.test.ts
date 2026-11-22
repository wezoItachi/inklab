import assert from 'node:assert/strict';
import test from 'node:test';
import specialWeaponDatabase from '../database/special-weapons.v12.0.0.json' with { type: 'json' };
import {
  analyzeSpecialPower,
  summarizeSpecialPowerData,
} from './special-power.ts';

void test('special power data covers the complete special catalog', () => {
  const summary = summarizeSpecialPowerData();
  assert.equal(summary.total, specialWeaponDatabase.specialWeapons.length);
  assert.equal(summary.verified, 16);
  assert.equal(summary.pending, 3);
  assert.equal(summary.metricCount, 21);
  for (const special of specialWeaponDatabase.specialWeapons) {
    assert.ok(analyzeSpecialPower(special.id, 3), special.id);
  }
});

void test('duration effects preserve source frames and convert to seconds', () => {
  assert.equal(analyzeSpecialPower('crab-tank', 0)?.metrics[0].value, 8);
  assert.equal(analyzeSpecialPower('crab-tank', 57)?.metrics[0].value, 11);
  assert.equal(analyzeSpecialPower('trizooka', 0)?.metrics[0].value, 5.5);
  assert.equal(analyzeSpecialPower('trizooka', 57)?.metrics[0].value, 8);
});

void test('big bubbler HP follows the public analyzer scale', () => {
  const base = analyzeSpecialPower('big-bubbler', 0);
  const maximum = analyzeSpecialPower('big-bubbler', 57);
  assert.equal(base?.metrics[0].value, 3072);
  assert.equal(maximum?.metrics[0].value, 3686);
  assert.equal(base?.metrics[1].value, 1536);
  assert.equal(maximum?.metrics[1].value, 1843);
});

void test('zipcaster ink costs use its 150 percent special ink tank', () => {
  const base = analyzeSpecialPower('zipcaster', 0);
  const maximum = analyzeSpecialPower('zipcaster', 57);
  assert.ok(Math.abs((base?.metrics[0].value ?? 0) - 8 / 3) < 1e-12);
  assert.equal(maximum?.metrics[0].value, 1);
  assert.equal(base?.metrics[1].value, 10);
  assert.equal(maximum?.metrics[1].value, 8);
});

void test('ambiguous indexed effects remain numerically unavailable', () => {
  for (const specialId of ['decoy', 'triple-splashdown', 'reef-slider']) {
    const result = analyzeSpecialPower(specialId, 57);
    assert.equal(result?.status, 'pending');
    assert.deepEqual(result?.metrics, []);
  }
});
