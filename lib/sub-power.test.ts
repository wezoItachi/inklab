import assert from 'node:assert/strict';
import test from 'node:test';
import subWeaponDatabase from '../database/sub-weapons.v12.0.0.json' with { type: 'json' };
import { analyzeSubPower, getSubPowerCoverage } from './sub-power.ts';

void test('sub power database covers every catalog sub weapon', () => {
  const coverage = getSubPowerCoverage();
  assert.equal(coverage.recordCount, subWeaponDatabase.subWeapons.length);
  assert.equal(coverage.metricCount, 17);
  for (const sub of subWeaponDatabase.subWeapons) {
    assert.ok(analyzeSubPower(sub.id, 3), sub.id);
  }
});

void test('standard bomb throw velocity preserves its source endpoints', () => {
  assert.equal(analyzeSubPower('splat-bomb', 0)?.metrics[0].value, 1.12);
  assert.equal(analyzeSubPower('splat-bomb', 57)?.metrics[0].value, 1.68);
});

void test('sprinkler phase lengths convert source frames to seconds', () => {
  const base = analyzeSubPower('sprinkler', 0);
  const maximum = analyzeSubPower('sprinkler', 57);
  assert.equal(base?.metrics[0].value, 8);
  assert.equal(maximum?.metrics[0].value, 13);
  assert.equal(base?.metrics[1].value, 15);
  assert.equal(maximum?.metrics[1].value, 17);
});

void test('splash wall hit points use the analyzer HP scale', () => {
  assert.equal(analyzeSubPower('splash-wall', 0)?.metrics[0].value, 800);
  assert.equal(analyzeSubPower('splash-wall', 57)?.metrics[0].value, 1500);
});

void test('beakon exposes the equivalent quick-super-jump AP boost', () => {
  assert.equal(analyzeSubPower('squid-beakon', 0)?.metrics[0].value, 0);
  assert.equal(analyzeSubPower('squid-beakon', 57)?.metrics[0].value, 57);
});
