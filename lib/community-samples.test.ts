import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyCommunitySampleLevel,
  getCommunitySampleSummary,
} from './community-samples.ts';

void test('community sample labels change only at documented unique-player thresholds', () => {
  assert.equal(classifyCommunitySampleLevel(0), 'insufficient');
  assert.equal(classifyCommunitySampleLevel(19), 'insufficient');
  assert.equal(classifyCommunitySampleLevel(20), 'preview');
  assert.equal(classifyCommunitySampleLevel(49), 'preview');
  assert.equal(classifyCommunitySampleLevel(50), 'common');
  assert.equal(classifyCommunitySampleLevel(99), 'common');
  assert.equal(classifyCommunitySampleLevel(100), 'stable');
});

void test('weapons without reviewed submissions return an honest empty summary', () => {
  assert.deepEqual(getCommunitySampleSummary('weapon-without-samples'), {
    weaponId: 'weapon-without-samples',
    uniquePlayerCount: 0,
    sampleCount: 0,
    level: 'insufficient',
    templates: [],
  });
});
