import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeMovementSpeed,
  getMovementSpeed,
  getWeaponMovementClass,
  movementClassData,
} from './movement-speed.ts';
import { weapons } from './weapon-catalog.ts';

void test('movement class database covers the complete battle catalog', () => {
  assert.equal(movementClassData.records.length, weapons.length);
  assert.deepEqual(movementClassData.counts, {
    Fast: 39,
    Mid: 118,
    Slow: 17,
  });
  for (const weapon of weapons) assert.ok(getWeaponMovementClass(weapon.id));
});

void test('swim speed preserves all three weight-class endpoints', () => {
  assert.equal(getMovementSpeed('ssu', 0, 'Fast'), 2.016);
  assert.equal(getMovementSpeed('ssu', 0, 'Mid'), 1.92);
  assert.equal(getMovementSpeed('ssu', 0, 'Slow'), 1.728);
  assert.equal(getMovementSpeed('ssu', 57, 'Fast'), 2.4);
  assert.equal(getMovementSpeed('ssu', 57, 'Mid'), 2.4);
  assert.equal(getMovementSpeed('ssu', 57, 'Slow'), 2.4);
});

void test('run speed preserves all three weight-class endpoints', () => {
  assert.equal(getMovementSpeed('rsu', 0, 'Fast'), 1.04);
  assert.equal(getMovementSpeed('rsu', 0, 'Mid'), 0.96);
  assert.equal(getMovementSpeed('rsu', 0, 'Slow'), 0.88);
  assert.equal(getMovementSpeed('rsu', 57, 'Fast'), 1.44);
  assert.equal(getMovementSpeed('rsu', 57, 'Mid'), 1.44);
  assert.equal(getMovementSpeed('rsu', 57, 'Slow'), 1.44);
});

void test('ninja squid is a separate fixed swim-speed multiplier', () => {
  const normal = analyzeMovementSpeed({
    weaponId: 'shooter-normalt',
    abilityId: 'ssu',
    ap: 10,
  });
  const ninja = analyzeMovementSpeed({
    weaponId: 'shooter-normalt',
    abilityId: 'ssu',
    ap: 10,
    hasNinjaSquid: true,
  });
  assert.equal(ninja.speed, normal.speed * 0.9);
  assert.equal(ninja.speedBeforeFixedAbilities, normal.speed);
  assert.equal(ninja.ninjaSquidApplied, true);
});

void test('run speed does not apply the ninja squid modifier', () => {
  const analysis = analyzeMovementSpeed({
    weaponId: 'shooter-normalt',
    abilityId: 'rsu',
    ap: 10,
    hasNinjaSquid: true,
  });
  assert.equal(analysis.ninjaSquidApplied, false);
  assert.equal(analysis.speed, analysis.speedBeforeFixedAbilities);
});
