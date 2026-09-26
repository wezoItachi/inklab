import assert from 'node:assert/strict';
import test from 'node:test';
import manifest from '../database/manifest.json' with { type: 'json' };
import mainWeaponParameterDocument from '../database/main-weapon-parameters.v11.3.0.json' with { type: 'json' };
import mainWeaponDocument from '../database/main-weapons.v11.3.0.json' with { type: 'json' };
import specialWeaponDocument from '../database/special-weapons.v11.3.0.json' with { type: 'json' };
import sourcesDocument from '../database/sources.json' with { type: 'json' };
import subWeaponDocument from '../database/sub-weapons.v11.3.0.json' with { type: 'json' };
import weaponKitDocument from '../database/weapon-kits.v11.3.0.json' with { type: 'json' };
import {
  validateGameDatabase,
  type MainWeaponDatabase,
  type MainWeaponParameterDatabase,
  type SpecialWeaponDatabase,
  type SubWeaponDatabase,
  type WeaponKitDatabase,
} from '../database/schema.ts';

void test('database manifest keeps game data and authorization boundaries explicit', () => {
  assert.equal(manifest.databaseId, 'inklab-core');
  assert.equal(manifest.gameVersion, mainWeaponDocument.gameVersion);
  assert.equal(manifest.records.mainWeapons, 'main-weapons.v11.3.0.json');
  assert.equal(
    manifest.records.mainWeaponParameters,
    'main-weapon-parameters.v11.3.0.json',
  );
  assert.equal(manifest.records.subWeapons, 'sub-weapons.v11.3.0.json');
  assert.equal(manifest.records.specialWeapons, 'special-weapons.v11.3.0.json');
  assert.equal(manifest.records.weaponKits, 'weapon-kits.v11.3.0.json');
  assert.equal(manifest.authorization.leannySplat3, 'pending');
  assert.equal(manifest.authorization.sendouAbilityAssets, 'pending');
});

void test('normalized game tables have valid cross references and registered sources', () => {
  validateGameDatabase(
    mainWeaponDocument as MainWeaponDatabase,
    subWeaponDocument as SubWeaponDatabase,
    specialWeaponDocument as SpecialWeaponDatabase,
    weaponKitDocument as WeaponKitDatabase,
    mainWeaponParameterDocument as MainWeaponParameterDatabase,
  );
  const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));
  const records = [
    ...mainWeaponDocument.weapons,
    ...subWeaponDocument.subWeapons,
    ...specialWeaponDocument.specialWeapons,
    ...weaponKitDocument.kits,
  ];
  for (const record of records)
    assert.ok(sourceIds.has(record.sourceId), record.sourceId);
});

void test('main weapon parameter schema starts empty until each field is verified', () => {
  assert.equal(
    mainWeaponParameterDocument.records.length,
    mainWeaponDocument.weapons.length,
  );
  for (const record of mainWeaponParameterDocument.records) {
    assert.ok(record.parameters.length >= 5, record.weaponId);
    for (const parameter of record.parameters) {
      assert.equal(
        parameter.status,
        'pending',
        `${record.weaponId}.${parameter.key}`,
      );
      assert.equal(
        parameter.value,
        null,
        `${record.weaponId}.${parameter.key}`,
      );
      assert.ok(parameter.note, `${record.weaponId}.${parameter.key}`);
    }
  }
});
