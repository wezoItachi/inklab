import assert from 'node:assert/strict';
import test from 'node:test';
import specialWeaponDatabase from '../database/special-weapons.v12.0.0.json' with { type: 'json' };
import {
  getSpecialPowerCoverage,
  summarizeSpecialPowerCoverage,
} from './special-power-coverage.ts';

void test('special power coverage accounts for every special weapon', () => {
  const summary = summarizeSpecialPowerCoverage();
  assert.equal(summary.total, specialWeaponDatabase.specialWeapons.length);
  assert.equal(summary.sourceBacked, 19);
  assert.equal(summary.interpretationPending, 0);
  assert.equal(summary.fieldCount, 32);
  for (const special of specialWeaponDatabase.specialWeapons) {
    assert.ok(getSpecialPowerCoverage(special.id), special.id);
  }
});

void test('12.0 named special-up fields close the former interpretation gaps', () => {
  for (const specialId of ['decoy', 'triple-splashdown', 'reef-slider']) {
    const record = getSpecialPowerCoverage(specialId);
    assert.equal(record?.status, 'source-backed');
    assert.ok((record?.fields.length ?? 0) > 0);
  }
});
