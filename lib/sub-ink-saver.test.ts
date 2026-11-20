import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getSubInkSaverMultiplier,
  representableAbilityPoints,
} from './ability-curves.ts';
import {
  getSubInkSaverAnalysis,
  getWeaponInkTankCapacity,
} from './sub-ink-saver.ts';
import { getWeapon, weapons } from './weapon-catalog.ts';

void test('all five sub saver levels preserve their source endpoints', () => {
  const expectedMax = [0.8, 0.7, 0.65, 0.6, 0.711111] as const;
  for (const [level, max] of expectedMax.entries()) {
    assert.equal(getSubInkSaverMultiplier(0, level as 0 | 1 | 2 | 3 | 4), 1);
    assert.equal(getSubInkSaverMultiplier(57, level as 0 | 1 | 2 | 3 | 4), max);
  }
});

void test('every catalog sub weapon has a verified base cost and saver level', () => {
  const subs = new Map(weapons.map(({ sub }) => [sub.id, sub]));
  assert.equal(subs.size, 14);
  for (const sub of subs.values()) {
    assert.ok(sub.baseInkCost !== null && sub.baseInkCost > 0);
    assert.ok(sub.inkSaverLevel !== null);
  }
  assert.equal(subs.get('burst-bomb')?.baseInkCost, 45);
  assert.equal(subs.get('burst-bomb')?.inkSaverLevel, 4);
});

void test('sub saver analysis uses the current sub weapon level and real action thresholds', () => {
  const weapon = getWeapon('shooter-quickmiddle-cstm01');
  const result = getSubInkSaverAnalysis(weapon, 57)!;
  assert.equal(result.level, 1);
  assert.equal(result.baseInkCost, 55);
  assert.equal(result.adjustedInkCost, 38.5);
  assert.equal(result.baseUsesPerTank, 1);
  assert.equal(result.adjustedUsesPerTank, 2);
  assert.ok(
    result.firstExtraUseAp !== null &&
      representableAbilityPoints.includes(result.firstExtraUseAp),
  );
});

void test('Splat Junior kits use their source-backed 110 percent ink tank', () => {
  const junior = getWeapon('main-10');
  assert.equal(getWeaponInkTankCapacity(junior), 110);
  const result = getSubInkSaverAnalysis(junior, 0)!;
  assert.equal(result.baseTankPercent, (70 / 110) * 100);
  assert.equal(result.baseUsesPerTank, 1);
});
