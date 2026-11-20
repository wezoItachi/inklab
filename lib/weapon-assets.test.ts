import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { weaponCatalogDatabases } from './weapon-catalog.ts';
import {
  getMainWeaponAssetUrl,
  getSpecialWeaponAssetUrl,
  getSubWeaponAssetUrl,
} from './weapon-assets.ts';

type AssetRecord = {
  kind: 'main' | 'sub' | 'special';
  id: string;
  relativePath: string;
  byteLength: number;
  sha256: string;
};

type AssetManifest = {
  gameVersion: string;
  counts: { main: number; sub: number; special: number; total: number };
  assets: AssetRecord[];
};

const manifest = JSON.parse(
  await readFile(
    new URL('../database/weapon-image-assets.v12.0.0.json', import.meta.url),
    'utf8',
  ),
) as AssetManifest;

void test('weapon image manifest covers the complete battle catalog', () => {
  assert.equal(manifest.gameVersion, '12.0.0');
  assert.equal(manifest.counts.main, weaponCatalogDatabases.main.weapons.length);
  assert.equal(manifest.counts.sub, weaponCatalogDatabases.sub.subWeapons.length);
  assert.equal(
    manifest.counts.special,
    weaponCatalogDatabases.special.specialWeapons.length,
  );
  assert.equal(manifest.counts.total, manifest.assets.length);

  const keys = new Set(manifest.assets.map(({ kind, id }) => `${kind}:${id}`));
  for (const weapon of weaponCatalogDatabases.main.weapons) {
    assert.ok(keys.has(`main:${weapon.id}`), `missing main image: ${weapon.id}`);
  }
  for (const weapon of weaponCatalogDatabases.sub.subWeapons) {
    assert.ok(keys.has(`sub:${weapon.id}`), `missing sub image: ${weapon.id}`);
  }
  for (const weapon of weaponCatalogDatabases.special.specialWeapons) {
    assert.ok(
      keys.has(`special:${weapon.id}`),
      `missing special image: ${weapon.id}`,
    );
  }
});

void test('every weapon image matches its recorded path, size, and sha256', async () => {
  for (const asset of manifest.assets) {
    const bytes = await readFile(
      new URL(`../public${asset.relativePath}`, import.meta.url),
    );
    assert.equal(bytes.byteLength, asset.byteLength, asset.relativePath);
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      asset.sha256,
      asset.relativePath,
    );
  }
});

void test('weapon asset URL helpers keep each image class separate', () => {
  assert.equal(
    getMainWeaponAssetUrl('main-1'),
    '/assets/weapons/main/main-1.png',
  );
  assert.equal(
    getSubWeaponAssetUrl('autobomb'),
    '/assets/weapons/sub/autobomb.png',
  );
  assert.equal(
    getSpecialWeaponAssetUrl('decoy'),
    '/assets/weapons/special/decoy.png',
  );
});
