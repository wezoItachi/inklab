import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeMainWeaponRangeEvidence,
  mainWeaponRangePolicies,
} from './main-weapon-range-evidence.ts';
import { getMainWeaponParameters, getWeapon, weapons } from './weapons.ts';

void test('shooter range evidence preserves primitives instead of inventing distance', () => {
  const evidence = analyzeMainWeaponRangeEvidence(
    getMainWeaponParameters('shooter-quickmiddle-cstm01'),
    '射击枪',
  );
  assert.equal(evidence.status, 'source-backed-primitives');
  assert.deepEqual(
    evidence.metrics.map(({ key, value }) => [key, value]),
    [
      ['damageFalloffStartFrames', 8],
      ['damageFalloffEndFrames', 24],
      ['projectileSpawnSpeed', 2.2],
    ],
  );
  assert.match(evidence.limitation, /不输出距离/);
});

void test('family-specific evidence keeps unlike range concepts separate', () => {
  const blaster = analyzeMainWeaponRangeEvidence(
    getMainWeaponParameters('main-200'),
    '爆破枪',
  );
  const charger = analyzeMainWeaponRangeEvidence(
    getMainWeaponParameters('charger-normalt'),
    '蓄力枪',
  );
  const explosher = analyzeMainWeaponRangeEvidence(
    getMainWeaponParameters('main-3040'),
    '泼桶',
  );
  assert.deepEqual(
    blaster.metrics.map(({ value }) => value),
    [1.7, 3.9],
  );
  assert.equal(charger.metrics[0]?.key, 'fullChargeTravelDistance');
  assert.equal(explosher.metrics[0]?.key, 'blastDamageRadius');
});

void test('all weapons receive an honest range evidence state', () => {
  const results = weapons.map((weapon) =>
    analyzeMainWeaponRangeEvidence(
      getMainWeaponParameters(weapon.id),
      getWeapon(weapon.id).family,
    ),
  );
  assert.equal(results.length, 174);
  assert.equal(
    results.filter(({ status }) => status === 'source-backed-primitives')
      .length,
    78,
  );
  assert.equal(
    results.filter(({ status }) => status === 'definition-ready').length,
    96,
  );
  assert.equal(
    results.every(({ limitation }) => limitation.length > 0),
    true,
  );
  assert.equal(
    results.every(({ definition }) => definition.length > 0),
    true,
  );
  assert.equal(
    results.every(({ measurementBoundary }) => measurementBoundary.length > 0),
    true,
  );
  assert.equal(
    results.every(({ nextEvidence }) => nextEvidence.length > 0),
    true,
  );
});

void test('every weapon family owns a distinct range definition', () => {
  const policies = Object.values(mainWeaponRangePolicies);
  assert.equal(policies.length, 11);
  assert.equal(new Set(policies.map(({ modelLabel }) => modelLabel)).size, 11);
  assert.equal(new Set(policies.map(({ definition }) => definition)).size, 11);
});
