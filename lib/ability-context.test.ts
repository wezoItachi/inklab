import assert from 'node:assert/strict';
import test from 'node:test';
import { abilities } from './abilities.ts';
import {
  buildAbilityContext,
  getAbilityLabScopeNote,
  getFixedAbilityRule,
} from './ability-context.ts';
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
  assert.equal(context.verification, 'weapon-specific');
});

void test('sub power follows the current sub weapon without claiming one universal curve', () => {
  const ability = abilities.find(({ id }) => id === 'subp');
  assert.ok(ability);
  const context = buildAbilityContext(ability, weapon, 6);
  assert.equal(context.target, '机器人炸弹');
  assert.match(context.targetNote, /具名增强字段已核对/);
  assert.match(context.conclusion, /不同武器.*统一百分比/);
  assert.equal(context.verification, 'weapon-specific');
  assert.match(getAbilityLabScopeNote(context.verification), /专属指标/);
});

void test('exclusive abilities are described as conditional main abilities', () => {
  const ability = abilities.find(({ id }) => id === 'stealth');
  assert.ok(ability);
  const context = buildAbilityContext(ability, weapon, 10);
  assert.match(context.activation, /超级跳跃/);
  assert.equal(context.verification, 'rule-only');
  assert.match(context.targetNote, /最多 60 帧/);
  assert.match(getAbilityLabScopeNote(context.verification), /不进入 0–57AP/);
  assert.doesNotMatch(getAbilityLabScopeNote(context.verification), /待验证/);
});

void test('every fixed main ability has one shared rule description', () => {
  const fixedAbilities = abilities.filter(({ group }) =>
    group.endsWith('限定'),
  );
  const linkedIds = fixedAbilities
    .filter(({ id }) => getFixedAbilityRule(id)?.hasLinkedNumericModel)
    .map(({ id }) => id);

  assert.equal(fixedAbilities.length, 12);
  for (const ability of fixedAbilities) {
    const rule = getFixedAbilityRule(ability.id);
    assert.ok(rule, ability.name);
    assert.ok(rule.activation, ability.name);
    assert.ok(rule.target, ability.name);
    assert.ok(rule.labNote, ability.name);
  }
  assert.deepEqual(linkedIds, ['ninja', 'rp', 'stealth']);
});
