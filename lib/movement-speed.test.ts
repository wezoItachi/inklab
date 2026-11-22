import assert from 'node:assert/strict';
import test from 'node:test';
import {
  actionMovementData,
  analyzeActionMovement,
  analyzeMovementSpeed,
  getMovementSpeed,
  getWeaponMovementClass,
  movementClassData,
  RAINMAKER_SPEED_MULTIPLIER,
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
  assert.equal(analysis.rainmakerSpeed, null);
});

void test('Rainmaker applies its fixed modifier after AP and Ninja Squid', () => {
  const analysis = analyzeMovementSpeed({
    weaponId: 'shooter-normalt',
    abilityId: 'ssu',
    ap: 10,
    hasNinjaSquid: true,
  });
  assert.equal(RAINMAKER_SPEED_MULTIPLIER, 0.8);
  assert.equal(analysis.rainmakerSpeed, analysis.speed * 0.8);
  assert.equal(
    analysis.rainmakerSpeed,
    analysis.speedBeforeFixedAbilities * 0.9 * 0.8,
  );
});

void test('action movement database keeps verified state coverage explicit', () => {
  assert.equal(actionMovementData.records.length, weapons.length);
  assert.deepEqual(actionMovementData.counts, {
    weaponsWithStates: 136,
    firing: 99,
    charging: 15,
    fullCharge: 37,
    secondary: 2,
    weaponOverrides: 15,
  });
});

void test('standard firing movement uses the shared run-speed multiplier', () => {
  const base = analyzeActionMovement('shooter-normalt', 0);
  const maximum = analyzeActionMovement('shooter-normalt', 57);
  assert.equal(base.states[0]?.id, 'firing');
  assert.equal(base.states[0]?.baseDisplaySpeed, 0.72);
  assert.equal(base.states[0]?.speed, 0.72);
  assert.equal(maximum.states[0]?.speed, 0.9);
  assert.equal(maximum.multiplierSourceMode, 'shared-default');
});

void test('splatling movement preserves its weapon-specific multiplier', () => {
  const maximum = analyzeActionMovement('spinner-standardt', 57);
  assert.equal(maximum.multiplierSourceMode, 'weapon-override');
  assert.equal(maximum.multiplier, 1.35);
  assert.equal(maximum.states.find(({ id }) => id === 'firing')?.speed, 0.945);
  assert.equal(
    maximum.states.find(({ id }) => id === 'charging')?.speed,
    0.837,
  );
});

void test('full-charge and secondary states remain separately labelled', () => {
  const charger = analyzeActionMovement('charger-normalt', 0);
  assert.equal(charger.states[0]?.id, 'full-charge');
  assert.equal(charger.states[0]?.speed, 0.2);

  const splatling = analyzeActionMovement('main-4030', 0);
  assert.equal(
    splatling.states.find(({ id }) => id === 'secondary')?.speed,
    0.5,
  );
});
