import assert from 'node:assert/strict';
import test from 'node:test';
import { abilities } from './abilities.ts';
import { buildAbilityContext } from './ability-context.ts';
import { getWeapon } from './weapon-catalog.ts';

const weapon = getWeapon('shooter-quickmiddle-cstm01');

void test('every ability receives a non-empty honest context', () => {
  for (const ability of abilities) {
    const context = buildAbilityContext(ability, weapon, 3);
    assert.ok(context.experimentArea);
    assert.ok(context.activation);
    assert.ok(context.target);
    assert.match(context.conclusion, /当前为 3AP/);
  }
});

void test('special power follows the currently selected special weapon', () => {
  const ability = abilities.find(({ id }) => id === 'spu');
  assert.ok(ability);
  const context = buildAbilityContext(ability, weapon, 6);
  assert.equal(context.target, '诱饵烟花');
  assert.match(context.targetNote, /逐项核验/);
});

void test('exclusive abilities are described as conditional main abilities', () => {
  const ability = abilities.find(({ id }) => id === 'stealth');
  assert.ok(ability);
  const context = buildAbilityContext(ability, weapon, 10);
  assert.equal(context.activation, '主技能限定／条件触发');
  assert.equal(context.verification, 'rule-only');
});
