import assert from 'node:assert/strict';
import test from 'node:test';
import queueDocument from '../database/battle-parameter-verification-queue.v11.3.0.json' with { type: 'json' };
import { getWeaponVerificationRouteSummary } from './battle-verification-queue.ts';
import { weapons } from './weapons.ts';

void test('weapon verification routes account for every queued field occurrence', () => {
  const total = weapons.reduce(
    (sum, weapon) => sum + getWeaponVerificationRouteSummary(weapon.id).total,
    0,
  );
  assert.equal(total, queueDocument.summary.pendingFieldOccurrences);
});

void test('runtime defaults expose distinct closure routes', () => {
  const shooter = getWeaponVerificationRouteSummary('shooter-normalt');
  assert.equal(
    shooter.breakdown.some(
      ({ category }) =>
        category === 'runtime-default-or-frame-capture-required',
    ),
    true,
  );

  const standardSpinner =
    getWeaponVerificationRouteSummary('spinner-standardt');
  assert.equal(
    standardSpinner.breakdown.some(
      ({ category }) =>
        category === 'runtime-default-or-capability-observation-required',
    ),
    true,
  );
});
