import assert from 'node:assert/strict';
import test from 'node:test';
import { getMainWeaponCapabilityEvidence } from './main-weapon-capability-evidence.ts';
import { getMainWeaponParameters, weapons } from './weapons.ts';

void test('all 15 omitted capability defaults receive an observation protocol', () => {
  const definitions = weapons.flatMap((weapon) =>
    getMainWeaponCapabilityEvidence(
      getMainWeaponParameters(weapon.id),
      weapon.family,
    ).map((evidence) => ({ weapon, evidence })),
  );
  assert.equal(definitions.length, 15);
  assert.equal(
    definitions.filter(({ evidence }) => evidence.key === 'canRecharge').length,
    9,
  );
  assert.equal(
    definitions.filter(({ evidence }) => evidence.key === 'canLaunchCanopy')
      .length,
    6,
  );
  assert.equal(
    definitions.every(
      ({ evidence }) =>
        evidence.observationProtocol.length > 0 &&
        evidence.positiveResult.length > 0 &&
        evidence.negativeResult.length > 0,
    ),
    true,
  );
});

void test('explicit source booleans do not re-enter the observation queue', () => {
  assert.equal(
    getMainWeaponCapabilityEvidence(
      getMainWeaponParameters('main-4040'),
      '加特林',
    ).length,
    0,
  );
  assert.equal(
    getMainWeaponCapabilityEvidence(getMainWeaponParameters('main-6020'), '伞')
      .length,
    0,
  );
});
