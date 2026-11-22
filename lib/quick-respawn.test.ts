import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeQuickRespawn } from './quick-respawn.ts';

void test('quick respawn preserves the standard endpoint times', () => {
  const base = analyzeQuickRespawn(0);
  const maximum = analyzeQuickRespawn(57);
  assert.equal(base.standardFrames, 450);
  assert.equal(base.standardSeconds, 7.5);
  assert.equal(maximum.standardFrames, 210);
  assert.equal(maximum.standardSeconds, 3.5);
  assert.equal(maximum.savedFrames, 240);
});

void test('respawn punisher adds fixed frames and suppresses opposing quick respawn AP', () => {
  const standard = analyzeQuickRespawn(20);
  assert.equal(standard.reducedApAgainstRespawnPunisher, 3);
  assert.ok(standard.againstRespawnPunisherFrames > standard.standardFrames);
  const ownPunisher = analyzeQuickRespawn(20, { hasRespawnPunisher: true });
  assert.ok(
    Math.abs(ownPunisher.standardFrames - standard.standardFrames - 68) < 1e-9,
  );
  assert.ok(
    Math.abs(
      ownPunisher.againstRespawnPunisherFrames -
        standard.againstRespawnPunisherFrames -
        68,
    ) < 1e-9,
  );
});
