import assert from 'node:assert/strict';
import test from 'node:test';
import manifest from '../database/manifest.json' with { type: 'json' };
import mainWeaponParameterDocument from '../database/main-weapon-parameters.v11.3.0.json' with { type: 'json' };
import mainWeaponDocument from '../database/main-weapons.v11.3.0.json' with { type: 'json' };
import importReport from '../database/import-report.v11.3.0.json' with { type: 'json' };
import parameterImportReport from '../database/parameter-import-report.v11.3.0.json' with { type: 'json' };
import blasterParameterImportReport from '../database/blaster-parameter-import-report.v11.3.0.json' with { type: 'json' };
import rollerParameterImportReport from '../database/roller-parameter-import-report.v11.3.0.json' with { type: 'json' };
import chargerParameterImportReport from '../database/charger-parameter-import-report.v11.3.0.json' with { type: 'json' };
import remainingFamilyParameterImportReport from '../database/remaining-family-parameter-import-report.v11.3.0.json' with { type: 'json' };
import salmonParameterSourceReport from '../database/salmon-parameter-source-report.v11.3.0.json' with { type: 'json' };
import salmonWeaponParameterDocument from '../database/salmon-weapon-parameters.v11.3.0.json' with { type: 'json' };
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
  assert.equal(manifest.records.importReport, 'import-report.v11.3.0.json');
  assert.equal(
    manifest.records.parameterImportReport,
    'parameter-import-report.v11.3.0.json',
  );
  assert.equal(
    manifest.records.blasterParameterImportReport,
    'blaster-parameter-import-report.v11.3.0.json',
  );
  assert.equal(
    manifest.records.rollerParameterImportReport,
    'roller-parameter-import-report.v11.3.0.json',
  );
  assert.equal(
    manifest.records.chargerParameterImportReport,
    'charger-parameter-import-report.v11.3.0.json',
  );
  assert.equal(
    manifest.records.remainingFamilyParameterImportReport,
    'remaining-family-parameter-import-report.v11.3.0.json',
  );
  assert.equal(
    manifest.records.salmonParameterSourceReport,
    'salmon-parameter-source-report.v11.3.0.json',
  );
  assert.equal(
    manifest.records.salmonWeaponParameters,
    'salmon-weapon-parameters.v11.3.0.json',
  );
  assert.equal(manifest.scope, 'full-weapon-catalog-partial-parameters');
  assert.equal(
    manifest.authorization.leannySplat3,
    'permission-with-attribution',
  );
  assert.equal(
    manifest.authorization.sendouAbilityAssets,
    'permission-without-attribution',
  );
});

void test('11.3 import report matches the normalized catalog', () => {
  assert.equal(mainWeaponDocument.weapons.length, 174);
  assert.equal(subWeaponDocument.subWeapons.length, 14);
  assert.equal(specialWeaponDocument.specialWeapons.length, 19);
  assert.equal(weaponKitDocument.kits.length, 174);
  assert.deepEqual(importReport.outputCounts, {
    mainWeapons: 174,
    subWeapons: 14,
    specialWeapons: 19,
    weaponKits: 174,
    preservedVerifiedParameterRecords: 174,
    pendingParameterRecords: 0,
  });
  for (const input of importReport.inputs)
    assert.match(input.sha256, /^[a-f0-9]{64}$/);
  assert.equal(importReport.sourceCommit.length, 40);
  assert.equal(parameterImportReport.sourceCommit.length, 40);
  assert.equal(parameterImportReport.inputs.length, 14);
  assert.deepEqual(parameterImportReport.outputCounts, {
    shooterWeapons: 40,
    shooterParameterClasses: 14,
    recordsWithVerifiedFields: 43,
    pendingOnlyRecords: 131,
  });
  for (const input of parameterImportReport.inputs)
    assert.match(input.sha256, /^[a-f0-9]{64}$/);
  assert.equal(blasterParameterImportReport.inputs.length, 7);
  assert.deepEqual(blasterParameterImportReport.outputCounts, {
    blasterWeapons: 17,
    blasterParameterClasses: 7,
    recordsWithVerifiedFields: 60,
    pendingOnlyRecords: 114,
  });
  for (const input of blasterParameterImportReport.inputs)
    assert.match(input.sha256, /^[a-f0-9]{64}$/);
  assert.equal(rollerParameterImportReport.inputs.length, 5);
  assert.deepEqual(rollerParameterImportReport.outputCounts, {
    rollerWeapons: 14,
    rollerParameterClasses: 5,
    recordsWithVerifiedFields: 73,
    pendingOnlyRecords: 101,
  });
  for (const input of rollerParameterImportReport.inputs)
    assert.match(input.sha256, /^[a-f0-9]{64}$/);
  assert.equal(chargerParameterImportReport.inputs.length, 8);
  assert.deepEqual(chargerParameterImportReport.outputCounts, {
    chargerWeapons: 19,
    chargerParameterClasses: 8,
    recordsWithVerifiedFields: 91,
    pendingOnlyRecords: 83,
  });
  for (const input of chargerParameterImportReport.inputs)
    assert.match(input.sha256, /^[a-f0-9]{64}$/);
  assert.equal(remainingFamilyParameterImportReport.sourceCommit.length, 40);
  assert.equal(remainingFamilyParameterImportReport.inputs.length, 31);
  assert.deepEqual(remainingFamilyParameterImportReport.outputCounts, {
    importedWeapons: 84,
    importedParameterClasses: 31,
    families: {
      画笔: { weapons: 9, parameterClasses: 3 },
      泼桶: { weapons: 15, parameterClasses: 6 },
      加特林: { weapons: 15, parameterClasses: 6 },
      双枪: { weapons: 16, parameterClasses: 6 },
      伞: { weapons: 11, parameterClasses: 4 },
      弓: { weapons: 9, parameterClasses: 3 },
      刮水刀: { weapons: 9, parameterClasses: 3 },
    },
    recordsWithVerifiedFields: 174,
    pendingOnlyRecords: 0,
  });
  for (const input of remainingFamilyParameterImportReport.inputs)
    assert.match(input.sha256, /^[a-f0-9]{64}$/);
  assert.equal(salmonParameterSourceReport.sourceCommit.length, 40);
  assert.equal(salmonParameterSourceReport.outputCounts.regularWeapons, 63);
  assert.equal(salmonParameterSourceReport.outputCounts.grizzcoWeapons, 8);
  assert.equal(salmonParameterSourceReport.outputCounts.totalWeapons, 71);
  assert.equal(salmonWeaponParameterDocument.records.length, 71);
  assert.equal(
    salmonWeaponParameterDocument.records.filter(
      ({ kind }) => kind === 'regular',
    ).length,
    63,
  );
  assert.equal(
    salmonWeaponParameterDocument.records.filter(
      ({ kind }) => kind === 'grizzco',
    ).length,
    8,
  );
  assert.deepEqual(salmonParameterSourceReport.missingCoopOverrideFiles, [
    { weaponId: 'main-60', name: 'N-ZAP85' },
  ]);
  assert.ok(salmonParameterSourceReport.inputs.length > 100);
  for (const input of salmonParameterSourceReport.inputs)
    assert.match(input.sha256, /^[a-f0-9]{64}$/);
  for (const record of salmonWeaponParameterDocument.records) {
    assert.ok(record.parameters.length > 0, record.id);
    assert.equal(
      new Set(record.parameters.map(({ key }) => key)).size,
      record.parameters.length,
      record.id,
    );
    for (const parameter of record.parameters) {
      assert.equal(
        parameter.status,
        'verified',
        `${record.id}.${parameter.key}`,
      );
      assert.notEqual(parameter.value, null, `${record.id}.${parameter.key}`);
      assert.match(
        parameter.upstreamPath,
        /^data\/parameter\/1130\/weapon\/.+#GameParameters\./,
        `${record.id}.${parameter.key}`,
      );
    }
  }
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

void test('battle weapon names are unique normalized Simplified Chinese source strings', () => {
  const names = mainWeaponDocument.weapons.map(({ name }) => name);
  assert.equal(new Set(names).size, 174);
  for (const weapon of mainWeaponDocument.weapons) {
    assert.equal(weapon.name, weapon.name.normalize('NFC').trim(), weapon.id);
    assert.doesNotMatch(
      weapon.name,
      /^(?:武器|主武器|示例武器|模板武器|未命名|待定)(?:\s*[0-9]+)?$/i,
      weapon.id,
    );
    assert.ok(Number.isInteger(weapon.upstreamId), weapon.id);
    assert.ok(weapon.upstreamRowId, weapon.id);
  }
});

void test('main weapon parameters expose values only after field-level verification', () => {
  const parameterRecords = (
    mainWeaponParameterDocument as MainWeaponParameterDatabase
  ).records;
  const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));
  assert.equal(parameterRecords.length, mainWeaponDocument.weapons.length);
  assert.equal(
    parameterRecords.filter(({ parameters }) =>
      parameters.some(({ status }) => status === 'verified'),
    ).length,
    174,
  );
  assert.equal(
    parameterRecords.filter(({ parameters }) =>
      parameters.every(
        ({ status, value }) => status === 'pending' && value === null,
      ),
    ).length,
    0,
  );

  const weaponById = new Map(
    mainWeaponDocument.weapons.map((weapon) => [weapon.id, weapon]),
  );
  const shooterRecords = parameterRecords.filter(
    ({ weaponId }) => weaponById.get(weaponId)?.family === '射击枪',
  );
  assert.equal(shooterRecords.length, 40);
  for (const record of shooterRecords) {
    assert.deepEqual(
      record.parameters.map(({ key }) => key),
      [
        'damagePerShot',
        'fireIntervalFrames',
        'inkConsumptionPerShot',
        'effectiveRange',
        'groundShotSpreadDegrees',
        'jumpShotSpreadDegrees',
        'movementSpeedWhileFiring',
      ],
      record.weaponId,
    );
    assert.equal(
      record.parameters.find(({ key }) => key === 'effectiveRange')?.status,
      'pending',
      record.weaponId,
    );
  }

  const blasterRecords = parameterRecords.filter(
    ({ weaponId }) => weaponById.get(weaponId)?.family === '爆破枪',
  );
  assert.equal(blasterRecords.length, 17);
  for (const record of blasterRecords) {
    for (const key of [
      'directHitDamage',
      'nearBlastDamage',
      'farBlastDamage',
      'nearBlastDistance',
      'farBlastDistance',
      'fireIntervalFrames',
      'inkConsumptionPerShot',
    ]) {
      assert.equal(
        record.parameters.find((parameter) => parameter.key === key)?.status,
        'verified',
        `${record.weaponId}.${key}`,
      );
    }
  }
  const sBlast = parameterRecords.find(
    ({ weaponId }) => weaponId === 'main-260',
  );
  assert.ok(sBlast);
  assert.equal(
    sBlast.parameters.find(({ key }) => key === 'jumpFarBlastDistance')?.value,
    3.635,
  );

  const rollerRecords = parameterRecords.filter(
    ({ weaponId }) => weaponById.get(weaponId)?.family === '滚筒',
  );
  assert.equal(rollerRecords.length, 14);
  for (const record of rollerRecords) {
    assert.equal(record.parameters.length, 13, record.weaponId);
    assert.equal(
      record.parameters.find(({ key }) => key === 'horizontalSwingFrames')
        ?.status,
      'pending',
      record.weaponId,
    );
    assert.equal(
      record.parameters.find(({ key }) => key === 'verticalSwingFrames')
        ?.status,
      'pending',
      record.weaponId,
    );
  }
  const chargerRecords = parameterRecords.filter(
    ({ weaponId }) => weaponById.get(weaponId)?.family === '蓄力枪',
  );
  assert.equal(chargerRecords.length, 19);
  for (const record of chargerRecords) {
    assert.equal(record.parameters.length, 7, record.weaponId);
    assert.equal(
      record.parameters.find(({ key }) => key === 'effectiveRange')?.status,
      'pending',
      record.weaponId,
    );
    for (const key of [
      'fullChargeDamage',
      'inkConsumptionPerCharge',
      'fullChargeTravelDistance',
    ]) {
      assert.equal(
        record.parameters.find((parameter) => parameter.key === key)?.status,
        'verified',
        `${record.weaponId}.${key}`,
      );
    }
  }
  const remainingFamilyFields = new Map([
    ['画笔', 13],
    ['泼桶', 14],
    ['加特林', 24],
    ['双枪', 12],
    ['伞', 16],
    ['弓', 15],
    ['刮水刀', 18],
  ]);
  for (const [family, fieldCount] of remainingFamilyFields) {
    const familyRecords = parameterRecords.filter(
      ({ weaponId }) => weaponById.get(weaponId)?.family === family,
    );
    assert.ok(familyRecords.length > 0, family);
    for (const record of familyRecords) {
      assert.equal(record.parameters.length, fieldCount, record.weaponId);
      assert.ok(
        record.parameters.some(({ status }) => status === 'verified'),
        record.weaponId,
      );
      assert.equal(
        record.parameters.find(({ key }) => key === 'effectiveRange')?.status,
        'pending',
        record.weaponId,
      );
    }
  }
  for (const record of parameterRecords) {
    assert.ok(record.parameters.length >= 5, record.weaponId);
    for (const parameter of record.parameters) {
      assert.ok(parameter.note, `${record.weaponId}.${parameter.key}`);
      if (parameter.status === 'pending') {
        assert.equal(
          parameter.value,
          null,
          `${record.weaponId}.${parameter.key}`,
        );
      }
      if (parameter.status === 'verified') {
        assert.notEqual(
          parameter.value,
          null,
          `${record.weaponId}.${parameter.key}`,
        );
        assert.ok(parameter.sourceId, `${record.weaponId}.${parameter.key}`);
        assert.ok(
          sourceIds.has(parameter.sourceId),
          `${record.weaponId}.${parameter.key}`,
        );
        assert.ok(
          parameter.upstreamPath,
          `${record.weaponId}.${parameter.key}`,
        );
        assert.match(
          parameter.checkedAt ?? '',
          /^\d{4}-\d{2}-\d{2}$/,
          `${record.weaponId}.${parameter.key}`,
        );
      }
    }
  }

  const nzap89 = parameterRecords.find(
    ({ weaponId }) => weaponId === 'shooter-quickmiddle-cstm01',
  );
  assert.ok(nzap89);
  assert.equal(
    nzap89.parameters.filter(({ status }) => status === 'verified').length,
    6,
  );
  assert.equal(
    nzap89.parameters.filter(({ status }) => status === 'pending').length,
    1,
  );

  const heavySplatling = parameterRecords.find(
    ({ weaponId }) => weaponId === 'spinner-standardt',
  );
  assert.ok(heavySplatling);
  assert.equal(
    heavySplatling.parameters.filter(({ status }) => status === 'verified')
      .length,
    14,
  );
  assert.equal(
    heavySplatling.parameters.filter(({ status }) => status === 'pending')
      .length,
    10,
  );
});
