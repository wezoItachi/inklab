import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAbilityModelCoverage,
  getAbilityModelCoverageNote,
} from './ability-model-coverage.ts';

void test('ability model coverage is derived from current registries', () => {
  assert.deepEqual(getAbilityModelCoverage(), {
    abilityCount: 26,
    universalCurveCount: 12,
    weaponSpecificAbilityCount: 2,
    pendingAbilityCount: 0,
    fixedMainAbilityCount: 12,
    subWeaponCount: 14,
    subMetricCount: 17,
    specialWeaponCount: 19,
    verifiedSpecialWeaponCount: 19,
    pendingSpecialWeaponCount: 0,
    specialMetricCount: 32,
  });
});

void test('public coverage note uses derived counts', () => {
  assert.match(
    getAbilityModelCoverageNote(),
    /12 条通用 AP 曲线、14 种副武器的 17 个专属指标、19 种特殊武器的 32 个具名指标/,
  );
});
