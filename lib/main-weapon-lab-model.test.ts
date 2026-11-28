import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeMainWeaponLabModel } from './main-weapon-lab-model.ts';
import { getMainWeaponParameters, weapons } from './weapons.ts';

const expectedKinds = {
  射击枪: 'shooter',
  爆破枪: 'blaster',
  滚筒: 'roller',
  画笔: 'brush',
  蓄力枪: 'charger',
  泼桶: 'slosher',
  加特林: 'spinner',
  双枪: 'maneuver',
  伞: 'shelter',
  弓: 'stringer',
  刮水刀: 'saber',
} as const;

function assertFiniteNumbers(value: unknown, path: string): void {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is not finite`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertFiniteNumbers(item, `${path}[${index}]`),
    );
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      assertFiniteNumbers(item, `${path}.${key}`);
    }
  }
}

void test('all battle weapons enter their exhaustive laboratory family model', () => {
  for (const weapon of weapons) {
    const model = analyzeMainWeaponLabModel(
      getMainWeaponParameters(weapon.id),
      weapon.family,
    );
    assert.ok(model, weapon.id);
    assert.equal(model.kind, expectedKinds[weapon.family], weapon.id);
    assert.ok(model.analysis.verifiedInputCount > 0, weapon.id);
    assert.ok(
      model.analysis.verifiedInputCount <= model.modelInputCount,
      weapon.id,
    );
    assertFiniteNumbers(model.analysis, `${weapon.id}.${model.kind}`);
  }
});
