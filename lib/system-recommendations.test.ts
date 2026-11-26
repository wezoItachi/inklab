import assert from 'node:assert/strict';
import test from 'node:test';
import { abilities } from './abilities.ts';
import { totalAp } from './loadouts.ts';
import {
  compareRecommendationToSlots,
  findClosestRecommendationIndex,
  findMatchingRecommendationIndex,
  getSystemRecommendations,
  replaceGearPartFromRecommendation,
  summarizeRecommendationAp,
} from './system-recommendations.ts';
import { weapons } from './weapons.ts';

void test('every weapon receives three deterministic 57 AP system suggestions', () => {
  const abilityIds = new Set(abilities.map(({ id }) => id));

  for (const weapon of weapons) {
    const first = getSystemRecommendations(weapon);
    const second = getSystemRecommendations(weapon);
    assert.deepEqual(first, second);
    assert.deepEqual(
      first.map(({ id }) => id),
      ['main', 'sub', 'special'],
    );

    for (const suggestion of first) {
      assert.equal(suggestion.slots.length, 12);
      assert.equal(totalAp(suggestion.slots), 57);
      assert.equal(suggestion.slots.filter(([, ap]) => ap === 10).length, 3);
      assert.equal(suggestion.slots.filter(([, ap]) => ap === 3).length, 9);
      assert.ok(suggestion.slots.every(([id]) => abilityIds.has(id)));
      assert.ok(suggestion.rationale.length > 20);
      assert.equal(suggestion.evidence.length, 3);
      const allocation = summarizeRecommendationAp(suggestion.slots);
      assert.equal(
        allocation.reduce((sum, { ap }) => sum + ap, 0),
        57,
      );
      assert.equal(
        new Set(allocation.map(({ abilityId }) => abilityId)).size,
        allocation.length,
      );
    }
  }
});

void test('recommendation allocation is ordered by AP for direct presentation', () => {
  const allocation = summarizeRecommendationAp(
    getSystemRecommendations(weapons[0])[0].slots,
  );
  assert.ok(allocation.length >= 3);
  assert.equal(allocation[0].ap >= allocation.at(-1)!.ap, true);
});

void test('active recommendation is derived from the exact editable slots', () => {
  const recommendations = getSystemRecommendations(weapons[0]);
  assert.equal(
    findMatchingRecommendationIndex(recommendations[1].slots, recommendations),
    1,
  );
  const changed: Array<[string | null, number]> = recommendations[1].slots.map(
    (slot) => [...slot],
  );
  changed[0] = [null, changed[0][1]];
  assert.equal(findMatchingRecommendationIndex(changed, recommendations), -1);
});

void test('recommendation comparison separates ability AP from physical slot layout', () => {
  const recommendation = getSystemRecommendations(weapons[0])[0];
  assert.deepEqual(compareRecommendationToSlots(recommendation.slots, recommendation), {
    matchingSlots: 12,
    changedSlots: 0,
    changedSlotIndices: [],
    changedParts: [],
    sharedAbilityAp: 57,
    changedAbilityAp: 0,
    missingAbilityAp: [],
    extraAbilityAp: [],
  });

  const rearranged: Array<[string | null, number]> = recommendation.slots.map(
    (slot) => [...slot],
  );
  const firstIndex = rearranged.findIndex(([, ap]) => ap === 3);
  const secondIndex = rearranged.findIndex(
    ([abilityId, ap], index) =>
      index > firstIndex &&
      ap === 3 &&
      abilityId !== rearranged[firstIndex][0],
  );
  assert.ok(firstIndex >= 0 && secondIndex >= 0);
  [rearranged[firstIndex], rearranged[secondIndex]] = [
    rearranged[secondIndex],
    rearranged[firstIndex],
  ];
  const comparison = compareRecommendationToSlots(rearranged, recommendation);
  assert.equal(comparison.sharedAbilityAp, 57);
  assert.equal(comparison.matchingSlots, 10);
  assert.equal(comparison.changedSlots, 2);
  assert.deepEqual(comparison.changedSlotIndices, [firstIndex, secondIndex]);
  assert.deepEqual(comparison.changedParts, ['head']);
  assert.deepEqual(comparison.missingAbilityAp, []);
  assert.deepEqual(comparison.extraAbilityAp, []);
});

void test('recommendation comparison reports neutral AP additions and removals', () => {
  const recommendation = getSystemRecommendations(weapons[0])[0];
  const changed: Array<[string | null, number]> = recommendation.slots.map(
    (slot) => [...slot],
  );
  const replacedId = changed[0][0]!;
  changed[0] = ['og', changed[0][1]];
  const comparison = compareRecommendationToSlots(changed, recommendation);
  assert.ok(
    comparison.missingAbilityAp.some(
      ({ id, ap }) => id === replacedId && ap >= 10,
    ),
  );
  assert.deepEqual(comparison.extraAbilityAp, [{ id: 'og', ap: 10 }]);
  assert.deepEqual(comparison.changedSlotIndices, [0]);
  assert.deepEqual(comparison.changedParts, ['head']);
});

void test('recommendation comparison identifies every changed gear part', () => {
  const recommendation = getSystemRecommendations(weapons[0])[0];
  const changed: Array<[string | null, number]> = recommendation.slots.map(
    (slot) => [...slot],
  );
  changed[1] = [null, 3];
  changed[4] = [null, 10];
  changed[11] = [null, 3];

  assert.deepEqual(
    compareRecommendationToSlots(changed, recommendation).changedParts,
    ['head', 'clothes', 'shoes'],
  );
});

void test('one gear part can be adopted without overwriting the other parts', () => {
  const recommendation = getSystemRecommendations(weapons[0])[0];
  const custom: Array<[string | null, 3 | 10]> = recommendation.slots.map(
    ([abilityId, ap]) => [abilityId, ap],
  );
  custom[0] = [null, 10];
  custom[4] = [null, 10];
  custom[8] = [null, 10];

  const result = replaceGearPartFromRecommendation(
    custom,
    recommendation,
    'clothes',
  );
  assert.deepEqual(result.slice(0, 4), custom.slice(0, 4));
  assert.deepEqual(result.slice(4, 8), recommendation.slots.slice(4, 8));
  assert.deepEqual(result.slice(8, 12), custom.slice(8, 12));
  assert.notEqual(result, custom);
});

void test('closest recommendation prefers shared AP and then exact slot positions', () => {
  const recommendations = getSystemRecommendations(weapons[0]);
  assert.equal(
    findClosestRecommendationIndex(recommendations[2].slots, recommendations),
    2,
  );
  assert.equal(findClosestRecommendationIndex([], []), -1);

  const exact = recommendations[0];
  const rearrangedSlots: Array<[string, 3 | 10]> = exact.slots.map(
    ([abilityId, ap]) => [abilityId, ap],
  );
  const differentSubSlots = rearrangedSlots
    .map(([abilityId, ap], index) => ({ abilityId, ap, index }))
    .filter(({ ap }) => ap === 3)
    .find(
      ({ abilityId, index }) =>
        rearrangedSlots[index + 1]?.[1] === 3 &&
        rearrangedSlots[index + 1]?.[0] !== abilityId,
    );
  assert.ok(differentSubSlots);
  const swapIndex = differentSubSlots.index + 1;
  [rearrangedSlots[differentSubSlots.index], rearrangedSlots[swapIndex]] = [
    rearrangedSlots[swapIndex],
    rearrangedSlots[differentSubSlots.index],
  ];
  const rearranged = { ...exact, id: 'sub' as const, slots: rearrangedSlots };
  assert.equal(
    findClosestRecommendationIndex(exact.slots, [rearranged, exact]),
    1,
  );
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

  assert.ok(
    suggestion.evidence.some((item) => item.includes('尚未用于自动分配')),
  );
  assert.equal(suggestion.desc.includes('打法定位待验证'), false);
});

void test('source-backed sub-power data can drive every sub-focused suggestion', () => {
  const weapon = weapons.find(({ sub }) => sub.id === 'squid-beakon')!;
  const suggestion = getSystemRecommendations(weapon)[1];

  assert.equal(
    suggestion.slots.some(([id]) => id === 'subp'),
    true,
  );
  assert.ok(suggestion.evidence.some((item) => item.includes('超级跳跃缩短')));
});
