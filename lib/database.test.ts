import assert from 'node:assert/strict';
import test from 'node:test';
import manifest from '../database/manifest.json' with {type: 'json'};
import sourcesDocument from '../database/sources.json' with {type: 'json'};
import weaponDocument from '../database/weapons.v11.3.0.json' with {type: 'json'};
import {validateWeaponDatabase, type WeaponDatabase} from '../database/schema.ts';

void test('database manifest keeps game data and authorization boundaries explicit', () => {
  assert.equal(manifest.databaseId, 'inklab-core');
  assert.equal(manifest.gameVersion, weaponDocument.gameVersion);
  assert.equal(manifest.authorization.leannySplat3, 'pending');
  assert.equal(manifest.authorization.sendouAbilityAssets, 'pending');
});

void test('every weapon record points to a registered source', () => {
  validateWeaponDatabase(weaponDocument as WeaponDatabase);
  const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));
  for (const weapon of weaponDocument.weapons) assert.ok(sourceIds.has(weapon.sourceId), weapon.id);
});
