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

void test('reviewed role labels influence the main suggestion without claiming player evidence', () => {
  const familyGroups = Map.groupBy(weapons, ({ family }) => family);
  const sameFamilyPair = [...familyGroups.values()]
    .flatMap((familyWeapons) =>
      familyWeapons.flatMap((weapon, index) =>
        familyWeapons.slice(index + 1).map((other) => [weapon, other] as const),
      ),
    )
    .find(
      ([first, second]) =>
        first.role !== second.role &&
        first.role !== '打法定位待验证' &&
        second.role !== '打法定位待验证',
    );
  assert.ok(sameFamilyPair);

  const [first, second] = sameFamilyPair;
  const firstMain = getSystemRecommendations(first)[0];
  const secondMain = getSystemRecommendations(second)[0];
  assert.notDeepEqual(firstMain.slots, secondMain.slots);
  assert.ok(firstMain.evidence.some((item) => item.includes(first.role)));
  assert.ok(secondMain.evidence.some((item) => item.includes(second.role)));
  assert.match(firstMain.rationale, /不引用对局胜率或玩家采用率/);
});

void test('unverified role labels remain visible but do not alter the family fallback', () => {
  const weapon = weapons.find(({ role }) => role === '打法定位待验证')!;
  const suggestion = getSystemRecommendations(weapon)[0];

  assert.ok(suggestion.evidence.some((item) => item.includes('尚未用于自动分配')));
  assert.equal(suggestion.desc.includes('打法定位待验证'), false);
});

void test('source-backed sub-power data can drive every sub-focused suggestion', () => {
  const weapon = weapons.find(({ sub }) => sub.id === 'squid-beakon')!;
  const suggestion = getSystemRecommendations(weapon)[1];

  assert.equal(suggestion.slots.some(([id]) => id === 'subp'), true);
  assert.ok(suggestion.evidence.some((item) => item.includes('超级跳跃缩短')));
});
