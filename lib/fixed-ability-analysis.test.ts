import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeNinjaSquidContext,
  analyzeRespawnPunisherContext,
  analyzeStealthJumpContext,
  fixedAbilityAnalysisIds,
  hasFixedAbilityAnalysis,
} from './fixed-ability-analysis.ts';

void test('only fixed abilities backed by existing numeric models receive linked cards', () => {
  assert.deepEqual(fixedAbilityAnalysisIds, ['ninja', 'stealth', 'rp']);
  assert.equal(hasFixedAbilityAnalysis('ninja'), true);
  assert.equal(hasFixedAbilityAnalysis('object'), false);
});

void test('Ninja Squid keeps its fixed modifier separate from swim-speed AP', () => {
  const result = analyzeNinjaSquidContext('shooter-quickmiddle-cstm01', 10);
  assert.equal(result.ninjaSquidApplied, true);
  assert.equal(
    result.speed.toFixed(6),
    (result.speedBeforeFixedAbilities * 0.9).toFixed(6),
  );
});

void test('Stealth Jump exposes a distance-dependent maximum separately', () => {
  const result = analyzeStealthJumpContext(6);
  assert.equal(result.hasStealthJump, true);
  assert.equal(result.stealthJumpMaxExtraFrames, 60);
  assert.equal(result.displayedMaxTotalFrames, result.totalFrames + 60);
});

void test('Respawn Punisher reports self and opponent boundaries separately', () => {
  const result = analyzeRespawnPunisherContext(6, 6);
  assert.equal(result.ownRespawn.hasRespawnPunisher, true);
  assert.ok(result.ownRespawn.standardFrames > 0);
  assert.ok(
    result.ownSpecial.currentLossPercent >
      result.ownSpecial.standardLossPercent,
  );
  assert.ok(result.opponentRespawnAtZeroAp.seconds > 7.5);
  assert.ok(result.opponentSpecialAtZeroAp.lossPercent > 50);
});
