import assert from 'node:assert/strict';
import test from 'node:test';
import { getMainWeaponActionCycleEvidence } from './main-weapon-action-cycle-evidence.ts';
import { getMainWeaponParameters, weapons } from './weapons.ts';

void test('pending action-cycle fields have one controlled-capture definition', () => {
  const definitions = weapons.flatMap((weapon) =>
    getMainWeaponActionCycleEvidence(
      getMainWeaponParameters(weapon.id),
      weapon.family,
    ).map((evidence) => ({ weapon, evidence })),
  );
  assert.equal(definitions.length, 39);
  assert.equal(
    definitions.filter(({ weapon }) => weapon.family === '滚筒').length,
    28,
  );
  assert.equal(
    definitions.filter(({ weapon }) => weapon.family === '伞').length,
    11,
  );
  assert.equal(
    definitions.every(
      ({ evidence }) =>
        evidence.definition.length > 0 &&
        evidence.inputProtocol.length > 0 &&
        evidence.excluded.length > 0,
    ),
    true,
  );
});

void test('roller phase fields stay primitives rather than complete cycles', () => {
  const [horizontal, vertical] = getMainWeaponActionCycleEvidence(
    getMainWeaponParameters('main-1000'),
    '滚筒',
  );
  assert.equal(horizontal?.sourcePrimitive?.value, 10);
  assert.equal(vertical?.sourcePrimitive?.value, 12);
  assert.match(horizontal?.definition ?? '', /释放帧/);
});
