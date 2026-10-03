import assert from 'node:assert/strict';
import test from 'node:test';
import type { MainWeaponParameterRecord } from '../database/schema.ts';
import {
  analyzeChargerEfficiency,
  analyzeMainWeaponEfficiency,
} from './main-weapon-analysis.ts';
import { getMainWeaponParameters } from './weapons.ts';

void test('derives N-ZAP89 efficiency only from verified 11.3.0 fields', () => {
  const result = analyzeMainWeaponEfficiency(
    getMainWeaponParameters('shooter-quickmiddle-cstm01'),
  );
  assert.ok(result);
  assert.deepEqual(result, {
    verifiedInputCount: 3,
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

void test('derives partial Splattershot results without guessing its omitted fire interval', () => {
  const result = analyzeMainWeaponEfficiency(
    getMainWeaponParameters('shooter-normalt'),
  );
  assert.ok(result);
  assert.deepEqual(result, {
    verifiedInputCount: 2,
    damagePerShot: 36,
    fireIntervalFrames: null,
    inkConsumptionPerShot: 0.92,
    shotsPerFullTank: 108,
    fullTankFiringWindowFrames: null,
    fullTankFiringWindowSeconds: null,
    shotsToSplat: 3,
    inkConsumptionPerSplat: 2.76,
    splatTimeFrames: null,
    splatTimeSeconds: null,
  });
});

void test('derives complete Splash-o-matic results from the corrected weapon identity', () => {
  const result = analyzeMainWeaponEfficiency(
    getMainWeaponParameters('shooter-precision'),
  );
  assert.ok(result);
  assert.deepEqual(result, {
    verifiedInputCount: 3,
    damagePerShot: 28,
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

void test('derives verified Splat Charger results without guessing charge time', () => {
  const result = analyzeChargerEfficiency(
    getMainWeaponParameters('charger-normalt'),
  );
  assert.ok(result);
  assert.deepEqual(result, {
    verifiedInputCount: 5,
    fullChargeDamage: 160,
    fullChargeFrames: null,
    inkConsumptionPerCharge: 18,
    fullChargesPerTank: 5,
    shotsToSplat: 1,
    inkConsumptionPerSplat: 18,
    chargeHold: true,
    chargeHoldFrames: 75,
    chargeHoldSeconds: 1.25,
    fullChargeTravelDistance: 24.037,
  });
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
  assert.equal(analyzeChargerEfficiency(record), null);
  assert.throws(() => analyzeMainWeaponEfficiency(record, 0), RangeError);
  assert.throws(() => analyzeChargerEfficiency(record, 0), RangeError);
});
