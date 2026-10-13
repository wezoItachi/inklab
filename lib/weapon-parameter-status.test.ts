import assert from 'node:assert/strict';
import test from 'node:test';
import { weapons } from './weapons.ts';
import {
  getWeaponParameterSnapshot,
  parameterSources,
  summarizeParameterStatuses,
} from './weapon-parameter-status.ts';

void test('creates an honest versioned snapshot for every catalog weapon', () => {
  for (const weapon of weapons) {
    const snapshot = getWeaponParameterSnapshot(weapon);
    assert.equal(snapshot.weaponId, weapon.id);
    assert.equal(snapshot.gameVersion, '11.3.0');
    assert.equal(snapshot.upstreamSnapshotVersion, '11.3.0');
    const summary = summarizeParameterStatuses(snapshot.fields);
    assert.equal(summary.verified + summary.pending + summary.demo, 6);
    assert.equal(snapshot.fields.find(({ label }) => label === '武器套装')?.status, 'verified');
    assert.equal(snapshot.fields.find(({ label }) => label === 'AP 效果曲线')?.status, 'pending');
    assert.equal(
      snapshot.fields.find(({ label }) => label === '系统建议')?.status,
      'demo',
    );
  }
});

void test('requires sources for verified fields and notes for every field', () => {
  for (const weapon of weapons) {
    for (const field of getWeaponParameterSnapshot(weapon).fields) {
      assert.ok(field.note.length > 0);
      if (field.status === 'verified') {
        assert.ok(field.source);
        assert.ok(
          parameterSources[field.source as keyof typeof parameterSources],
        );
      }
    }
  }
});
