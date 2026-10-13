import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DATA_VERSION,
  DATASET_STATUS,
  getMainWeaponParameters,
  getWeapon,
  summarizeMainWeaponParameters,
  weapons,
} from './weapons.ts';

void test('complete 11.3 weapon catalog covers all families', () => {
  assert.equal(DATA_VERSION, '11.3.0');
  assert.equal(DATASET_STATUS, 'full-weapon-catalog-partial-parameters');
  assert.equal(weapons.length, 174);
  assert.deepEqual(
    new Set(weapons.map((weapon) => weapon.family)),
    new Set([
      '射击枪',
      '爆破枪',
      '滚筒',
      '画笔',
      '蓄力枪',
      '泼桶',
      '加特林',
      '双枪',
      '伞',
      '弓',
      '刮水刀',
    ]),
  );
});

void test('every weapon drives a complete analysis context', () => {
  for (const weapon of weapons) {
    assert.ok(weapon.id);
    assert.ok(weapon.name);
    assert.ok(weapon.sub.name);
    assert.ok(weapon.special);
    if (weapon.sub.baseInkCost !== null) assert.ok(weapon.sub.baseInkCost > 0);
    if (weapon.sub.subPowerEffect !== null)
      assert.ok(weapon.sub.subPowerEffect);
    assert.equal(weapon.verification, 'kit-verified');
    assert.ok(weapon.sourceId);
    assert.match(weapon.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});

void test('unknown ids safely fall back to the first supported weapon', () => {
  assert.equal(getWeapon('missing').id, weapons[0].id);
  assert.throws(
    () => getMainWeaponParameters('missing'),
    /Missing parameter record/,
  );
});

void test('every catalog weapon exposes honest parameter audit progress', () => {
  for (const weapon of weapons) {
    const parameters = getMainWeaponParameters(weapon.id);
    const summary = summarizeMainWeaponParameters(weapon.id);
    assert.equal(parameters.weaponId, weapon.id);
    assert.equal(summary.total, parameters.parameters.length);
    if (weapon.id === 'shooter-quickmiddle-cstm01') {
      assert.deepEqual(summary, { total: 7, verified: 6, pending: 1, demo: 0 });
    } else if (weapon.id === 'shooter-normalt') {
      assert.deepEqual(summary, { total: 7, verified: 5, pending: 2, demo: 0 });
    } else if (weapon.id === 'shooter-precision') {
      assert.deepEqual(summary, { total: 7, verified: 6, pending: 1, demo: 0 });
    } else if (weapon.id === 'charger-normalt') {
      assert.deepEqual(summary, { total: 7, verified: 5, pending: 2, demo: 0 });
    } else if (weapon.id === 'roller-normalt') {
      assert.deepEqual(summary, {
        total: 13,
        verified: 11,
        pending: 2,
        demo: 0,
      });
    } else if (weapon.id === 'spinner-standardt') {
      assert.deepEqual(summary, {
        total: 24,
        verified: 14,
        pending: 10,
        demo: 0,
      });
    } else if (weapon.family === '射击枪') {
      const usesNormalParameterClass =
        weapon.upstreamRowId.startsWith('Shooter_Normal_');
      assert.deepEqual(summary, {
        total: 7,
        verified: usesNormalParameterClass ? 5 : 6,
        pending: usesNormalParameterClass ? 2 : 1,
        demo: 0,
      });
    } else if (weapon.family === '爆破枪') {
      const isSBlast = weapon.upstreamRowId.startsWith('Blaster_Precision_');
      const isMiddle = weapon.upstreamRowId.startsWith('Blaster_Middle_');
      assert.deepEqual(summary, {
        total: isSBlast ? 16 : 12,
        verified: isSBlast ? 15 : isMiddle ? 10 : 11,
        pending: isMiddle ? 2 : 1,
        demo: 0,
      });
    } else if (weapon.family === '滚筒') {
      assert.deepEqual(summary, {
        total: 13,
        verified: 11,
        pending: 2,
        demo: 0,
      });
    } else if (weapon.family === '蓄力枪') {
      const parameterClass = weapon.upstreamRowId.split('_')[1];
      const hasExplicitChargeFrames = new Set([
        'Quick',
        'Long',
        'LongScope',
        'Light',
        'Keeper',
        'Pencil',
      ]).has(parameterClass);
      const hasExplicitChargeHold = new Set([
        'Normal',
        'Quick',
        'Long',
        'Keeper',
      ]).has(parameterClass);
      const verified =
        3 + Number(hasExplicitChargeFrames) + Number(hasExplicitChargeHold) * 2;
      assert.deepEqual(summary, {
        total: 7,
        verified,
        pending: 7 - verified,
        demo: 0,
      });
    } else {
      assert.ok(summary.verified > 0, weapon.id);
      assert.equal(
        summary.total,
        summary.verified + summary.pending,
        weapon.id,
      );
      assert.equal(summary.demo, 0, weapon.id);
    }
  }
});
