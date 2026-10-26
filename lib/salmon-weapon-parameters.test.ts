import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getGrizzcoParameters,
  getRegularSalmonParameters,
  salmonWeaponParameterRecords,
} from './salmon-weapon-parameters.ts';

void test('all 71 Salmon Run weapon records expose source-backed partial parameters', () => {
  assert.equal(salmonWeaponParameterRecords.length, 71);
  assert.equal(
    salmonWeaponParameterRecords.filter(({ kind }) => kind === 'regular')
      .length,
    63,
  );
  assert.equal(
    salmonWeaponParameterRecords.filter(({ kind }) => kind === 'grizzco')
      .length,
    8,
  );
  for (const record of salmonWeaponParameterRecords) {
    assert.ok(record.parameters.length > 0, record.id);
    assert.equal(
      new Set(record.parameters.map(({ key }) => key)).size,
      record.parameters.length,
      record.id,
    );
  }
});

void test('regular records distinguish Coop overrides from inherited battle values', () => {
  const splash = getRegularSalmonParameters('shooter-precision');
  assert.ok(splash);
  assert.equal(
    splash.coopFile,
    'WeaponShooterPrecision_Coop.game__GameParameterTable.json',
  );
  assert.equal(
    splash.parameters.find(({ key }) => key === 'damagePerShot')?.sourceMode,
    'coop-override',
  );
  const nzap = getRegularSalmonParameters('main-60');
  assert.ok(nzap);
  assert.equal(nzap.coopFile, null);
  assert.equal(
    nzap.parameters.every(({ sourceMode }) => sourceMode === 'base-inherited'),
    true,
  );
});

void test('all eight Grizzco records can be resolved by their public ids', () => {
  for (const id of [
    'grizzco-blaster',
    'grizzco-charger',
    'grizzco-dualies',
    'grizzco-roller',
    'grizzco-splatana',
    'grizzco-brella',
    'grizzco-slosher',
    'grizzco-stringer',
  ]) {
    const record = getGrizzcoParameters(id);
    assert.ok(record, id);
    assert.equal(record.kind, 'grizzco', id);
    assert.ok(
      record.parameters.some(
        ({ sourceMode }) => sourceMode === 'bear-explicit',
      ),
      id,
    );
  }
});
