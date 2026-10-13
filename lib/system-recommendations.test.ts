import assert from 'node:assert/strict';
import test from 'node:test';
import { abilities } from './abilities.ts';
import { totalAp } from './loadouts.ts';
import { getSystemRecommendations } from './system-recommendations.ts';
import { weapons } from './weapons.ts';

void test('every weapon receives three deterministic 57 AP system suggestions', () => {
  const abilityIds = new Set(abilities.map(({ id }) => id));

  for (const weapon of weapons) {
    const first = getSystemRecommendations(weapon);
    const second = getSystemRecommendations(weapon);
    assert.deepEqual(first, second);
    assert.deepEqual(first.map(({ id }) => id), ['main', 'sub', 'special']);

    for (const suggestion of first) {
      assert.equal(suggestion.slots.length, 12);
      assert.equal(totalAp(suggestion.slots), 57);
      assert.equal(suggestion.slots.filter(([, ap]) => ap === 10).length, 3);
      assert.equal(suggestion.slots.filter(([, ap]) => ap === 3).length, 9);
      assert.ok(suggestion.slots.every(([id]) => abilityIds.has(id)));
      assert.ok(suggestion.rationale.length > 20);
      assert.equal(suggestion.evidence.length, 3);
    }
  }
});

void test('family model changes the main suggestion instead of returning one global preset', () => {
  const shooter = weapons.find(({ family }) => family === '射击枪')!;
  const spinner = weapons.find(({ family }) => family === '加特林')!;
  const shooterMain = getSystemRecommendations(shooter)[0];
  const spinnerMain = getSystemRecommendations(spinner)[0];

  assert.notDeepEqual(shooterMain.slots, spinnerMain.slots);
  assert.equal(shooterMain.focusAbilityId, 'ssu');
  assert.equal(spinnerMain.focusAbilityId, 'rsu');
});

void test('unknown sub-power effects are not filled with an invented sub-power claim', () => {
  const weapon = weapons.find(({ sub }) => sub.subPowerEffect === null)!;
  const suggestion = getSystemRecommendations(weapon)[1];

  assert.equal(suggestion.slots.some(([id]) => id === 'subp'), false);
  assert.ok(suggestion.evidence.some((item) => item.includes('没有自动投入副强')));
});
