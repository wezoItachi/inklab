import assert from 'node:assert/strict';
import test from 'node:test';
import {weapons} from './weapons.ts';
import {getWeaponParameterSnapshot, parameterSources, summarizeParameterStatuses} from './weapon-parameter-status.ts';

void test('creates a versioned snapshot for every representative weapon', () => {
  for (const weapon of weapons) {
    const snapshot = getWeaponParameterSnapshot(weapon);
    assert.equal(snapshot.weaponId, weapon.id);
    assert.equal(snapshot.gameVersion, '11.3.0');
    assert.equal(snapshot.upstreamSnapshotVersion, '11.2.0');
    assert.deepEqual(summarizeParameterStatuses(snapshot.fields), {verified: 3, pending: 2, demo: 1});
  }
});

void test('requires sources for verified fields and notes for every field', () => {
  for (const weapon of weapons) {
    for (const field of getWeaponParameterSnapshot(weapon).fields) {
      assert.ok(field.note.length > 0);
      if (field.status === 'verified') {
        assert.ok(field.source);
        assert.ok(parameterSources[field.source as keyof typeof parameterSources]);
      }
    }
  }
});
