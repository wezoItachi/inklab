import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeSubResistance } from './sub-resistance.ts';

void test('sub resistance keeps every supported effect at its base value with 0AP', () => {
  const result = analyzeSubResistance(0);
  assert.equal(result.heavyDamageMultiplier, 1);
  assert.equal(result.lightDamageMultiplier, 1);
  assert.equal(result.markingTimeMultiplier, 1);
  assert.equal(result.toxicMistSlowdownMultiplier, 1);
});

void test('sub resistance reaches the Leanny endpoints at 57AP', () => {
  const result = analyzeSubResistance(57);
  assert.equal(result.heavyDamageMultiplier, 0.5);
  assert.equal(result.lightDamageMultiplier, 0.6);
  assert.equal(result.lineMarkerDamageMultiplier, 0.5);
  assert.equal(result.sprinklerDamageMultiplier, 0.5);
  assert.equal(result.splashWallDamageMultiplier, 0.5);
  assert.ok(Math.abs(result.markingTimeMultiplier - 0.1) < 1e-12);
  assert.ok(Math.abs(result.mineMarkingTimeMultiplier - 0.1) < 1e-12);
  assert.equal(result.toxicMistSlowdownMultiplier, 0.5);
});

void test('sub resistance clamps unsupported AP values', () => {
  assert.equal(analyzeSubResistance(-1).ap, 0);
  assert.equal(analyzeSubResistance(99).ap, 57);
});
