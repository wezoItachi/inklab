import assert from 'node:assert/strict';
import test from 'node:test';
import type { MainWeaponParameterRecord } from '../database/schema.ts';
import { analyzeMainWeaponEfficiency } from './main-weapon-analysis.ts';
import { getMainWeaponParameters } from './weapons.ts';

void test('derives N-ZAP89 efficiency only from verified 11.3.0 fields', () => {
  const result = analyzeMainWeaponEfficiency(
    getMainWeaponParameters('shooter-quickmiddle-cstm01'),
  );
  assert.ok(result);
  assert.deepEqual(result, {
    damagePerShot: 30,
    fireIntervalFrames: 5,
    inkConsumptionPerShot: 0.8,
    shotsPerFullTank: 125,
    fullTankFiringWindowFrames: 620,
    fullTankFiringWindowSeconds: 620 / 60,
    shotsToSplat: 4,
    inkConsumptionPerSplat: 3.2,
    splatTimeFrames: 15,
    splatTimeSeconds: 0.25,
  });
});

void test('does not calculate when a required field is still pending', () => {
  assert.equal(
    analyzeMainWeaponEfficiency(getMainWeaponParameters('shooter-normalt')),
    null,
  );
});

void test('rejects invalid target health and ignores unverified values', () => {
  const record: MainWeaponParameterRecord = {
    weaponId: 'test',
    parameters: [
      {
        key: 'damagePerShot',
        label: 'damage',
        value: 100,
        unit: 'damage',
        status: 'demo',
        note: 'not verified',
      },
    ],
  };
  assert.equal(analyzeMainWeaponEfficiency(record), null);
  assert.throws(() => analyzeMainWeaponEfficiency(record, 0), RangeError);
});
