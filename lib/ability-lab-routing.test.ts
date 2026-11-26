import assert from 'node:assert/strict';
import test from 'node:test';
import { abilities } from './abilities.ts';
import { getAbilityCurveDefinition } from './ability-curves.ts';
import {
  getAbilityLabPanelKind,
  summarizeAbilityLabRoutes,
} from './ability-lab-routing.ts';

void test('every ability has one explicit laboratory panel route', () => {
  const routes = abilities.map(
    ({ id }) => [id, getAbilityLabPanelKind(id)] as const,
  );
  assert.equal(routes.length, 26);
  assert.deepEqual(
    routes.filter(([, route]) => route === 'unknown'),
    [],
  );
});

void test('laboratory routes preserve model boundaries', () => {
  for (const ability of abilities) {
    const route = getAbilityLabPanelKind(ability.id);
    const curve = getAbilityCurveDefinition(ability.id);

    if (curve.status === 'weapon-specific') {
      assert.ok(
        route === 'sub-power' || route === 'special-power',
        `${ability.id} must use a weapon-specific panel`,
      );
    } else if (curve.status === 'not-applicable') {
      assert.ok(
        route === 'fixed-linked' || route === 'fixed-rule',
        `${ability.id} must use a fixed-ability panel`,
      );
    } else if (curve.status === 'verified') {
      assert.notEqual(route, 'fixed-rule', ability.id);
      assert.notEqual(route, 'unknown', ability.id);
    }
  }
});

void test('only fixed abilities with numeric models use linked panels', () => {
  assert.deepEqual(
    abilities
      .filter(({ id }) => getAbilityLabPanelKind(id) === 'fixed-linked')
      .map(({ id }) => id),
    ['ninja', 'rp', 'stealth'],
  );
});

void test('unknown ids stay visibly unsupported', () => {
  assert.equal(getAbilityLabPanelKind('future-ability'), 'unknown');
});

void test('current loadout route summary keeps model classes separate', () => {
  assert.deepEqual(
    summarizeAbilityLabRoutes(['ism', 'subp', 'spu', 'ninja', 'og']),
    {
      total: 5,
      universal: 1,
      weaponSpecific: 2,
      fixed: 2,
      unsupported: 0,
    },
  );
  assert.deepEqual(summarizeAbilityLabRoutes(['future-ability']), {
    total: 1,
    universal: 0,
    weaponSpecific: 0,
    fixed: 0,
    unsupported: 1,
  });
});
